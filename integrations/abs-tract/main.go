package main

// NanoHive build of abs-tract: the stock router plus /goodreads/ratings, a
// lean lookup for community scores. ONE Goodreads call per request, calls
// serialised and spaced ~1.1s apart (the shared read-only key is rate
// limited), three attempts. The stock /goodreads/search stays for
// Audiobookshelf's metadata matching.

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/ahobsonsayers/abs-tract/goodreads"
	"github.com/ahobsonsayers/abs-tract/server"
)

const serverAddress = "0.0.0.0:5555"

var (
	gate     sync.Mutex
	lastCall time.Time
	nonAlnum = regexp.MustCompile(`[^a-z0-9]+`)
	isbnLike = regexp.MustCompile(`^[0-9Xx][0-9Xx-]{8,16}$`)
)

type ratingHit struct {
	GoodreadsId            string  `json:"goodreadsId"`
	GoodreadsUrl           string  `json:"goodreadsUrl"`
	Title                  string  `json:"title"`
	Author                 string  `json:"author"`
	Cover                  string  `json:"cover,omitempty"`
	PublishedYear          string  `json:"publishedYear,omitempty"`
	GoodreadsAverageRating float64 `json:"goodreadsAverageRating"`
	GoodreadsRatingsCount  int     `json:"goodreadsRatingsCount"`
}

func norm(s string) string {
	return strings.Trim(nonAlnum.ReplaceAllString(strings.ToLower(s), " "), " ")
}

// 0 = same author, 1 = shares the surname, 2 = someone else
func authorRank(want, got string) int {
	w, g := norm(want), norm(got)
	if w == "" || g == "" || w == g {
		return 0
	}
	parts := strings.Fields(w)
	surname := parts[len(parts)-1]
	if len(surname) > 2 && strings.Contains(g, surname) {
		return 1
	}
	return 2
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func ratingsHandler(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("query"))
	author := strings.TrimSpace(r.URL.Query().Get("author"))
	if query == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "query is required"})
		return
	}
	field := "title"
	if isbnLike.MatchString(query) {
		field = "all"
		query = strings.ReplaceAll(query, "-", "")
	}

	var works []goodreads.WorkHit
	var err error
	for attempt := 0; attempt < 3; attempt++ {
		// The gate only spaces the calls out; nobody waits behind a retry sleep.
		gate.Lock()
		if wait := 1100*time.Millisecond - time.Since(lastCall); wait > 0 {
			time.Sleep(wait)
		}
		ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
		works, err = goodreads.DefaultClient.SearchWorks(ctx, query, field)
		cancel()
		lastCall = time.Now()
		gate.Unlock()
		if err == nil {
			break
		}
		log.Printf("ratings: attempt %d failed for %q: %v", attempt+1, query, err)
		time.Sleep(time.Duration(1+attempt) * 1500 * time.Millisecond)
	}
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "goodreads did not answer"})
		return
	}

	hits := make([]ratingHit, 0, len(works))
	for _, wk := range works {
		if wk.BookId == "" {
			continue
		}
		hits = append(hits, ratingHit{
			GoodreadsId:            wk.BookId,
			GoodreadsUrl:           "https://www.goodreads.com/book/show/" + wk.BookId,
			Title:                  strings.TrimSpace(wk.Title),
			Author:                 strings.TrimSpace(wk.Author),
			Cover:                  wk.ImageUrl,
			PublishedYear:          strings.TrimSpace(wk.PublishedYear),
			GoodreadsAverageRating: wk.Average(),
			GoodreadsRatingsCount:  wk.Count(),
		})
	}
	if author != "" {
		sort.SliceStable(hits, func(i, j int) bool {
			return authorRank(author, hits[i].Author) < authorRank(author, hits[j].Author)
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"matches": hits})
}

func main() {
	router, err := server.NewRouter()
	if err != nil {
		log.Fatalf("Failed to create router: %s", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/goodreads/ratings", ratingsHandler)
	mux.Handle("/", router)

	log.Printf("Server listening on %s (with /goodreads/ratings)\n", serverAddress)
	err = http.ListenAndServe(serverAddress, mux)
	if err != nil {
		log.Fatalf("Server exited with error: %s", err)
	}
}
