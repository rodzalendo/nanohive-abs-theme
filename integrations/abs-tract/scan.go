package main

// NanoHive background scan. The theme uploads the books to check once; the
// helper works through them on its own (one Goodreads call at a time, same
// gate as /ratings), keeps the results, and the theme pulls them in batches
// whenever someone has the site open. One scan at a time. Survives closed
// tabs, sleeping phones and expired logins because nothing here needs them.

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ahobsonsayers/abs-tract/goodreads"
)

type scanBook struct {
	Id     string `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
	Isbn   string `json:"isbn"`
}

type scanEntry struct {
	R      float64 `json:"r,omitempty"`
	N      int     `json:"n,omitempty"`
	Src    string  `json:"src,omitempty"`
	Key    string  `json:"key,omitempty"`
	Url    string  `json:"url,omitempty"`
	Title  string  `json:"title,omitempty"`
	By     string  `json:"by,omitempty"`
	Miss   int     `json:"miss,omitempty"`
	At     int64   `json:"at"`
	Seq    int     `json:"-"`
	BookId string  `json:"-"`
}

type scanJob struct {
	mu        sync.Mutex
	Running   bool   `json:"running"`
	Stopped   bool   `json:"stopped"`
	Total     int    `json:"total"`
	Done      int    `json:"done"`
	Matched   int    `json:"matched"`
	Missed    int    `json:"missed"`
	Errors    int    `json:"errors"`
	Current   string `json:"current"`
	StartedAt int64  `json:"startedAt"`
	EndedAt   int64  `json:"endedAt"`
	Seq       int    `json:"seq"` // results issued so far; pull with ?since=<n>
	books     []scanBook
	results   []scanEntry
	missed    []scanBook // this run's misses, for the card's "not found" list
	stop      chan struct{}
}

var job = &scanJob{}

const scanStateFile = "/tmp/nanohive-scan.json"

func (j *scanJob) status() map[string]any {
	j.mu.Lock()
	defer j.mu.Unlock()
	return map[string]any{
		"running": j.Running, "stopped": j.Stopped, "total": j.Total, "done": j.Done,
		"matched": j.Matched, "missed": j.Missed, "errors": j.Errors, "current": j.Current,
		"startedAt": j.StartedAt, "endedAt": j.EndedAt, "seq": j.Seq,
	}
}

// persist keeps unpulled results across a helper restart (best effort).
func (j *scanJob) persist() {
	j.mu.Lock()
	snap := struct {
		Seq     int         `json:"seq"`
		Results []scanEntry `json:"results"`
		Ids     []string    `json:"ids"`
	}{Seq: j.Seq}
	for _, r := range j.results {
		snap.Results = append(snap.Results, r)
		snap.Ids = append(snap.Ids, r.BookId)
	}
	j.mu.Unlock()
	if b, err := json.Marshal(snap); err == nil {
		_ = os.WriteFile(scanStateFile, b, 0o644)
	}
}

func (j *scanJob) restore() {
	b, err := os.ReadFile(scanStateFile)
	if err != nil {
		return
	}
	var snap struct {
		Seq     int         `json:"seq"`
		Results []scanEntry `json:"results"`
		Ids     []string    `json:"ids"`
	}
	if json.Unmarshal(b, &snap) != nil || len(snap.Results) != len(snap.Ids) {
		return
	}
	j.mu.Lock()
	j.Seq = snap.Seq
	for i := range snap.Results {
		snap.Results[i].BookId = snap.Ids[i]
		snap.Results[i].Seq = snap.Seq - len(snap.Results) + i + 1
	}
	j.results = snap.Results
	j.mu.Unlock()
}

func lookupBook(ctx context.Context, b scanBook) (*scanEntry, error) {
	isbn := strings.Map(func(r rune) rune {
		if (r >= '0' && r <= '9') || r == 'X' || r == 'x' {
			return r
		}
		return -1
	}, b.Isbn)
	var queries []struct{ q, field string }
	if isbn != "" {
		queries = append(queries, struct{ q, field string }{isbn, "all"})
	}
	for _, v := range titleVariants(b.Title, true) {
		queries = append(queries, struct{ q, field string }{v, "title"})
	}
	for _, q := range queries {
		works, err := searchWithGate(ctx, q.q, q.field)
		if err != nil {
			return nil, err
		}
		if hit := bestMatch(b.Title, b.Author, works); hit != nil {
			return &scanEntry{R: float64(int(hit.Average()*100+0.5)) / 100, N: hit.Count(), Src: "gr", Key: hit.BookId,
				Url: "https://www.goodreads.com/book/show/" + hit.BookId, Title: strings.TrimSpace(hit.Title),
				By: strings.TrimSpace(hit.Author), At: time.Now().UnixMilli()}, nil
		}
	}
	return &scanEntry{Miss: 1, At: time.Now().UnixMilli()}, nil
}

func (j *scanJob) run(books []scanBook, stop chan struct{}) {
	consecutiveErrors := 0
	// Stop cancels the lookup in flight as well (a book retrying against a slow
	// Goodreads could otherwise hold the run for half a minute).
	runCtx, cancelRun := context.WithCancel(context.Background())
	defer cancelRun()
	go func() {
		select {
		case <-stop:
			cancelRun()
		case <-runCtx.Done():
		}
	}()
	for i, b := range books {
		select {
		case <-stop:
			j.mu.Lock()
			j.Running, j.Stopped, j.EndedAt, j.Current = false, true, time.Now().UnixMilli(), ""
			j.mu.Unlock()
			j.persist()
			return
		default:
		}
		j.mu.Lock()
		j.Current = b.Title
		j.mu.Unlock()
		ctx, cancel := context.WithTimeout(runCtx, 60*time.Second)
		entry, err := lookupBook(ctx, b)
		cancel()
		if runCtx.Err() != nil { // stopped mid-lookup: the loop head records the stop
			continue
		}
		j.mu.Lock()
		if err != nil {
			j.Errors++
			consecutiveErrors++
		} else {
			consecutiveErrors = 0
			entry.BookId = b.Id
			// Seq is time-based so a recreated helper (new image, lost state file)
			// never hands out numbers the store's cursor has already passed.
			if now := int(time.Now().UnixMilli()); now > j.Seq {
				j.Seq = now
			} else {
				j.Seq++
			}
			entry.Seq = j.Seq
			j.results = append(j.results, *entry)
			if len(j.results) > 60000 { // a few libraries' worth; older ones were pulled long ago
				j.results = append([]scanEntry(nil), j.results[len(j.results)-50000:]...)
			}
			if entry.Miss == 1 {
				j.Missed++
				j.missed = append(j.missed, b)
			} else {
				j.Matched++
			}
		}
		j.Done = i + 1
		j.mu.Unlock()
		if i%10 == 9 {
			j.persist()
		}
		if consecutiveErrors >= 10 { // Goodreads is gone; do not burn hours on it
			j.mu.Lock()
			j.Running, j.Stopped, j.EndedAt, j.Current = false, true, time.Now().UnixMilli(), ""
			j.mu.Unlock()
			j.persist()
			return
		}
	}
	j.mu.Lock()
	j.Running, j.EndedAt, j.Current = false, time.Now().UnixMilli(), ""
	j.mu.Unlock()
	j.persist()
}

func scanHandler(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet && r.URL.Path == "/goodreads/scan":
		writeJSON(w, 200, job.status())
	case r.Method == http.MethodPost && r.URL.Path == "/goodreads/scan/stop":
		job.mu.Lock()
		if job.Running && job.stop != nil {
			job.Stopped = true // "stopping": the run ends at the next loop head
			select {
			case <-job.stop:
			default:
				close(job.stop)
			}
		}
		job.mu.Unlock()
		writeJSON(w, 200, job.status())
	case r.Method == http.MethodGet && r.URL.Path == "/goodreads/scan/missed":
		job.mu.Lock()
		items := append([]scanBook{}, job.missed...)
		job.mu.Unlock()
		writeJSON(w, 200, map[string]any{"items": items})
	case r.Method == http.MethodGet && r.URL.Path == "/goodreads/scan/results":
		since, _ := strconv.Atoi(r.URL.Query().Get("since"))
		job.mu.Lock()
		items := map[string]scanEntry{}
		next := since
		n := 0
		for _, e := range job.results {
			if e.Seq <= since {
				continue
			}
			items[e.BookId] = e
			next = e.Seq
			n++
			if n >= 200 {
				break
			}
		}
		job.mu.Unlock()
		writeJSON(w, 200, map[string]any{"since": since, "next": next, "items": items})
	case r.Method == http.MethodPost && r.URL.Path == "/goodreads/scan":
		var body struct {
			Books []scanBook `json:"books"`
		}
		r.Body = http.MaxBytesReader(w, r.Body, 16<<20)
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || len(body.Books) == 0 {
			writeJSON(w, 400, map[string]string{"error": "books required"})
			return
		}
		job.mu.Lock()
		if job.Running {
			job.mu.Unlock()
			writeJSON(w, 409, map[string]string{"error": "scan already running"})
			return
		}
		job.Running, job.Stopped, job.Total, job.Done, job.Matched, job.Missed, job.Errors = true, false, len(body.Books), 0, 0, 0, 0
		job.missed = nil
		job.StartedAt, job.EndedAt, job.Current = time.Now().UnixMilli(), 0, ""
		job.books = body.Books
		job.stop = make(chan struct{})
		stop := job.stop
		job.mu.Unlock()
		go job.run(body.Books, stop)
		writeJSON(w, 200, job.status())
	default:
		writeJSON(w, 404, map[string]string{"error": "not found"})
	}
}

var _ = goodreads.DefaultAPIKey // keep the import honest if lookupBook changes
