package goodreads

// NanoHive addition. One call to Goodreads' search page returns, per work,
// the rating numbers and the "best book" edition. That is everything a
// community score needs, so the ratings endpoint (main.go) uses this instead
// of SearchBooks, which fetches ten result pages plus every book's details
// (~200 calls) and fails whole when any one of them does.

import (
	"context"
	"strconv"
	"strings"
)

type WorkHit struct {
	BookId        string `xml:"best_book>id"`
	Title         string `xml:"best_book>title"`
	Author        string `xml:"best_book>author>name"`
	ImageUrl      string `xml:"best_book>image_url"`
	PublishedYear string `xml:"original_publication_year"`
	RatingsCount  string `xml:"ratings_count"`
	AverageRating string `xml:"average_rating"`
}

func (h WorkHit) Count() int {
	n, err := strconv.Atoi(strings.TrimSpace(h.RatingsCount))
	if err != nil {
		return 0
	}
	return n
}

func (h WorkHit) Average() float64 {
	f, err := strconv.ParseFloat(strings.TrimSpace(h.AverageRating), 64)
	if err != nil {
		return 0
	}
	return f
}

// SearchWorks runs one Goodreads search (first page, 20 works). field is
// "title", "author" or "all"; "all" is what an ISBN query needs.
func (c *Client) SearchWorks(ctx context.Context, query string, field string) ([]WorkHit, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, nil
	}
	if field == "" {
		field = "title"
	}
	params := map[string]string{"q": query, "search[field]": field, "page": "1"}
	var out struct {
		Works []WorkHit `xml:"search>results>work"`
	}
	if err := c.get(ctx, "search/index.xml", params, &out); err != nil {
		return nil, err
	}
	return out.Works, nil
}
