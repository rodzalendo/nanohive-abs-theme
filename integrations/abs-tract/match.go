package main

// NanoHive matcher, a port of the theme's JavaScript one (enhancements.js,
// nhCmTitleVariants / nhCmBest) so the background scan decides exactly like
// a book page does.

import (
	"regexp"
	"strings"

	"github.com/ahobsonsayers/abs-tract/goodreads"
)

var (
	reTagWords   = regexp.MustCompile(`(?i)\s*[\(\[][^\)\]]*(unabridged|abridged|audiobook|audio|edition|narrated)[^\)\]]*[\)\]]`)
	reBrackets   = regexp.MustCompile(`\s*\[[^\]]*\]\s*`)
	reTrailParen = regexp.MustCompile(`\s*\([^\)]*\)\s*$`)
	reLeadParen  = regexp.MustCompile(`^\s*\([^\)]*\)\s*`)
	reCommaBook  = regexp.MustCompile(`(?i),\s*(?:book|bk|vol\.?|volume|part|tom)\s*\d+.*$`)
	reTailBook   = regexp.MustCompile(`(?i)\s+(?:book|bk|vol\.?|volume|part|tom)\.?\s*\d+\s*$`)
	reTailHash   = regexp.MustCompile(`\s*#\d+\s*$`)
	reSep        = regexp.MustCompile(`\s*[:–—]\s+|\s+-\s+|(\d)-\s+`)
	reWeakLabel  = regexp.MustCompile(`(?i)^(?:book|bk|vol\.?|volume|part|tom)\s*\d+$`)
	reDigit      = regexp.MustCompile(`\d`)
	reSpaces     = regexp.MustCompile(`\s+`)
	reTrailAny   = regexp.MustCompile(`\s*[\(\[][^\(\)\[\]]*[\)\]]\s*$`)
)

// diacritics that show up in book metadata; enough for scoring purposes
var deaccent = strings.NewReplacer(
	"ą", "a", "ć", "c", "ę", "e", "ł", "l", "ń", "n", "ó", "o", "ś", "s", "ź", "z", "ż", "z",
	"á", "a", "à", "a", "â", "a", "ä", "a", "ã", "a", "å", "a", "é", "e", "è", "e", "ê", "e", "ë", "e",
	"í", "i", "ì", "i", "î", "i", "ï", "i", "ú", "u", "ù", "u", "û", "u", "ü", "u", "ý", "y", "ÿ", "y",
	"ñ", "n", "ç", "c", "š", "s", "č", "c", "ř", "r", "ž", "z", "ď", "d", "ť", "t", "ň", "n", "ě", "e", "ů", "u",
	"ø", "o", "æ", "ae", "œ", "oe", "ß", "ss", "ğ", "g", "ı", "i", "ş", "s", "ő", "o", "ű", "u",
)

func normText(s string) string {
	s = deaccent.Replace(strings.ToLower(s))
	s = strings.ReplaceAll(s, "&", " and ")
	return strings.Trim(nonAlnum.ReplaceAllString(s, " "), " ")
}

func tokenScore(a, b string) int {
	a, b = normText(a), normText(b)
	if a == "" || b == "" {
		return 0
	}
	if a == b {
		return 100
	}
	if strings.HasPrefix(a, b) || strings.HasPrefix(b, a) {
		return 90
	}
	aw, bw := strings.Fields(a), strings.Fields(b)
	set := map[string]bool{}
	for _, w := range bw {
		set[w] = true
	}
	common := 0
	for _, w := range aw {
		if set[w] {
			common++
		}
	}
	return int(float64(200*common)/float64(len(aw)+len(bw)) + 0.5)
}

func cleanPart(v string) string {
	v = reBrackets.ReplaceAllString(v, " ")
	v = reTrailParen.ReplaceAllString(v, "")
	v = reLeadParen.ReplaceAllString(v, "")
	v = reCommaBook.ReplaceAllString(v, "")
	v = reTailBook.ReplaceAllString(v, "")
	v = reTailHash.ReplaceAllString(v, "")
	return strings.TrimSpace(reSpaces.ReplaceAllString(v, " "))
}

func weakPart(v string) bool {
	w := strings.Fields(v)
	return (len(w) <= 2 && reDigit.MatchString(v)) || reWeakLabel.MatchString(v)
}

// splitParts splits on ": ", " - ", "107- " and dashes with spaces.
func splitParts(base string) []string {
	// the "(\d)-\s+" separator keeps its digit: re-insert it
	marked := reSep.ReplaceAllStringFunc(base, func(m string) string {
		if len(m) > 0 && m[0] >= '0' && m[0] <= '9' {
			return string(m[0]) + "\x00"
		}
		return "\x00"
	})
	var out []string
	for _, p := range strings.Split(marked, "\x00") {
		p = cleanPart(p)
		if len(p) >= 3 {
			out = append(out, p)
		}
	}
	return out
}

// titleVariants mirrors nhCmTitleVariants(t, forQuery).
func titleVariants(t string, forQuery bool) []string {
	base := strings.TrimSpace(reTagWords.ReplaceAllString(t, ""))
	var out []string
	add := func(v string) {
		v = strings.TrimSpace(v)
		if len(v) < 3 {
			return
		}
		for _, x := range out {
			if x == v {
				return
			}
		}
		out = append(out, v)
	}
	add(base)
	var strong, weak []string
	for _, p := range splitParts(base) {
		if weakPart(p) {
			weak = append(weak, p)
		} else {
			strong = append(strong, p)
		}
	}
	for _, p := range strong {
		add(p)
	}
	if forQuery {
		first := cleanPart(base)
		if len(strong) > 0 {
			first = strong[0]
		}
		if w := strings.Fields(first); len(w) >= 4 {
			add(strings.Join(w[:2], " "))
		}
		for _, p := range weak {
			add(p)
		}
	}
	return out
}

func bareTitle(t string) string {
	s := strings.TrimSpace(t)
	for {
		n := strings.TrimSpace(reTrailAny.ReplaceAllString(s, ""))
		if n == s {
			return s
		}
		s = n
	}
}

type scored struct {
	hit  goodreads.WorkHit
	conf int
}

// bestMatch mirrors nhCmBest: title forms of ours against forms of theirs,
// author weight 0.3, near-equal candidates settle on the most rated one.
func bestMatch(title, author string, hits []goodreads.WorkHit) *goodreads.WorkHit {
	mine := titleVariants(title, false)
	bestC := 0
	var list []scored
	for _, h := range hits {
		if h.Count() <= 0 {
			continue
		}
		ct := bareTitle(h.Title)
		theirs := titleVariants(ct, false)
		t := 0
		for _, v := range mine {
			for _, x := range theirs {
				if s := tokenScore(v, x); s > t {
					t = s
				}
			}
		}
		a := tokenScore(author, h.Author)
		if a < 60 {
			parts := strings.Fields(normText(author))
			if len(parts) > 0 {
				sur := parts[len(parts)-1]
				if len(sur) > 2 && strings.Contains(normText(h.Author), sur) {
					a = 70
				}
			}
		}
		conf := int(float64(t)*0.7 + float64(a)*0.3 + 0.5)
		if author != "" && a == 0 && h.Count() < 1000 && conf < 85 {
			conf = 0
		}
		if conf > bestC {
			bestC = conf
		}
		list = append(list, scored{h, conf})
	}
	if bestC < 70 {
		return nil
	}
	floor := bestC - 8
	if floor < 70 {
		floor = 70
	}
	var best *scored
	for i := range list {
		s := &list[i]
		if s.conf < floor {
			continue
		}
		if best == nil || s.hit.Count() > best.hit.Count() || (s.hit.Count() == best.hit.Count() && s.conf > best.conf) {
			best = s
		}
	}
	if best == nil {
		return nil
	}
	return &best.hit
}
