<img src="docs/nanohive-logo.png" width="88" align="right" alt="NanoHive">

# NanoHive Audiobookshelf Theme

A reverse proxy that themes **Audiobookshelf Web** for every user. No Tampermonkey, no
per-browser setup: put it in front of your ABS server and it injects the theme into the pages
it serves. Nothing touches your ABS container, remove the proxy and you're back to stock.
Web only (the mobile apps keep working through it, just unthemed).

|  |  |
|:--:|:--:|
| ![Home](docs/main.png) | ![Book details](docs/book.png) |
| ![Series](docs/series.png) | ![Collections](docs/collections.png) |
| ![Narrators](docs/narrators.png) | ![Server ranking](docs/ranking.jpg) |

![Settings panel](docs/settings2.png)

## What you get

**Look**
- Warm cinematic dark look, 12 base themes, any accent colour, pick your font
- Real mobile layout: drawer nav, touch-friendly appbar, nothing overflows
- Home you can rearrange: hero carousel of your in-progress books, expanded Recent Series,
  a "Rate what you finished" row

**Ratings and reviews**
- Goodreads-style stars and reviews on every book, shared server-wide, stars on every card
- Rate whole series too
- Import your history from Goodreads, StoryGraph or Hardcover (dry run first, you confirm
  every match, and you can mark the matched books as finished in one click)
- Goodreads ratings: every book page shows what Goodreads readers think (score and number of
  votes), and you can sort and filter the library by it. Needs one small helper container,
  three lines in your compose file (see Good to know). Wrong match? Fix it right on the book
  page.
- Hardcover sync: paste your API key and every rating you save lands on your Hardcover
  account too, or push the whole library at once
- See who else is reading or finished a book, with their progress (great for book clubs)
- Full, half or quarter star steps; podcasts excluded; per-library switches

**Finding things**
- Search all libraries at once
- One Filter & sort panel instead of ABS's two dropdowns: multi-level sort, stackable filters
  (genre, author, narrator, tag, year, progress, format, rating...), active choices as chips
- "Whose ratings": sort and filter by one person's stars instead of the average
- Per-user start page; the old menus are one toggle away if you miss them

**Rebuilt pages**
- Book page: HD cover, cinematic background, editable finished date, lookup links to Goodreads
  and your language's biggest book site (25 logos bundled)
- Collections as instant icon grids, narrators and authors as proper cards
- Series covers show how far through you are

**Stats**
- Server ranking with medals, personal listening insights, Year in Review
- Admin server statistics: most played, best rated, top genres, per library
- Finished-book tools, including the books stuck at 99% (one tap marks them done)
- Mark as finished: books you clearly finished but never closed out show up as a home
  shelf and a badge on your avatar; one click (with confirmation) settles them

**Reading and playback**
- Extended ereader in your theme colours with curated fonts (incl. OpenDyslexic)
- Autoplay the next book in a series (off by default)

**For admins**
- Save your look as the server-wide default in one click
- Social switches: what the server shares between users is your call, globally and per user
- Recent sessions card: the last 10 listening sessions server-wide, live ones on top
- The redesigned pages (narrators, collections, users...) switch on or off for everyone
- Upload a custom logo (works fully offline), series covers and descriptions, user photos
- Problem reports from users land in a queue you can read and clear
- Tidy authors left with no books

**Per user, not per device**
- Everyone gets the settings panel and their choices follow their account, so a shared tablet
  stops handing one person's setup to the next. 40 languages.
- The panel itself is tidy: five tabs (Style / Main Page / Books / Features / Administration),
  a search box across all of them, and explanations tucked behind small ? buttons.

## Run it

```bash
docker run -d \
  -p 8080:80 \
  -v nh_theme_data:/data/nh \
  -e ABS_UPSTREAM=http://your-abs-host:80 \
  ghcr.io/rodzalendo/nanohive-abs-theme:latest
```

Point your browser (or reverse proxy / tunnel) at 8080 instead of ABS. There's a
`docker-compose.example.yml` too.

- Mount `/data/nh` or you lose ratings, uploads and settings on every recreate
- Users know the old port? Move ABS elsewhere and give the theme that port
- Your own TLS proxy in front works, OIDC included
- Dashboard icon URL for Unraid/Portainer:
  `https://raw.githubusercontent.com/rodzalendo/nanohive-abs-theme/main/docs/nanohive-logo.png`

### TrueNAS SCALE

Add it as a second app next to ABS (Apps → Discover → Custom App → Install via YAML):

```yaml
services:
  abs-theme:
    image: ghcr.io/rodzalendo/nanohive-abs-theme:latest
    restart: unless-stopped
    ports:
      - "30081:80"          # any free port
    environment:
      ABS_UPSTREAM: "http://<truenas-ip>:30013"   # your ABS app's web port
    volumes:
      - /mnt/tank/apps/nanohive:/data/nh
```

`ABS_UPSTREAM` needs the host IP + ABS's published port. Not `localhost` and not the container
name (catalog apps sit on networks a custom app can't see).

## Configuration

Only `ABS_UPSTREAM` is required. `NH_*` vars are just first-visit defaults; users override them
in the settings panel, and admins can save better defaults from the UI (Settings → Theme →
Server Defaults), which also beat the env vars.

| Variable | Default | Notes |
|---|---|---|
| `ABS_UPSTREAM` | *(required)* | Where ABS actually listens |
| `NH_APP_NAME` | *(empty)* | Replaces "audiobookshelf" in the appbar |
| `NH_SHOW_LOGO_TEXT` | `true` | App name beside the logo |
| `NH_LOGO_URL` | *(empty)* | External URL, or `/_nh/logo.<ext>` for a self-hosted one |
| `NH_COLORIZE_LOGO` | `false` | Tint the logo with the accent |
| `NH_ACCENT_COLOR` | `#e0c27a` | Any hex colour |
| `NH_BASE_THEME` | `warm` | `warm` `slate` `black` `navy` `mocha` `pine` `plum` `crimson` `ocean` `sand` `steel` `wine` |
| `NH_MAIN_FONT` | `Merriweather` | Any font from the settings panel |
| `NH_FONT_SCALE` | `1.0` | Global text scale |
| `NH_CAROUSEL_TIMING` | `15` | Seconds per hero slide, `0` = no auto-advance |
| `NH_SHOW_HERO_CAROUSEL` | `true` | Home hero carousel |
| `NH_SHOW_RECENT_SERIES` | `true` | Expanded Recent Series shelf |
| `NH_RECENT_SERIES_COUNT` | `12` | Series in that shelf |
| `NH_CUSTOM_SERIES_CARDS` | `true` | Stacked series covers, `false` = stock cards |
| `NH_SHOW_RATINGS` | `true` | Book ratings |
| `NH_SOCIAL` | *(empty)* | `false` disables every social feature; the admin Social card decides otherwise |
| `NH_FOUC_BG` | `#181512` | Background before the theme loads, match your base theme |
| `NH_GOODREADS_UPSTREAM` | *(empty)* | Address of the abs-tract helper for Goodreads community ratings, e.g. `http://abs-tract:5555/goodreads` (see Good to know) |
| `NH_PROXY_BUFFER_SIZE` | `16k` | nginx upstream header buffer. Raise it if OIDC logins die with a 502 for users with many groups |

Canvas colours for `NH_FOUC_BG`: `warm` `#181512` · `slate` `#111625` · `black` `#080808` ·
`navy` `#0a111a` · `mocha` `#231c18` · `pine` `#121a15` · `plum` `#1a1320` · `crimson`
`#1d1212` · `ocean` `#0b1618` · `sand` `#1c1814` · `steel` `#13171c` · `wine` `#1a1014`

The container refuses to start on a malformed value instead of serving a half-broken page.

## Good to know

**Custom logo offline**: admins can upload one from the settings panel (Branding & Style),
or drop `logo.png` into `/data/nh` and set the logo to `/_nh/logo.png`. Served from the
volume, no internet needed.

**Goodreads ratings** (community ratings): the "what readers elsewhere think" line, the
Goodreads rating sort and its filter need one extra small container next to the theme that
fetches the Goodreads numbers. Until it runs, the feature stays off and the settings card shows
these same steps. Step by step:

1. Add this to the same `docker-compose.yml` as the theme, under `services:`

   ```yaml
     abs-tract:
       image: ghcr.io/rodzalendo/abs-tract-ratings:latest
       restart: unless-stopped
       expose:
         - "5555"
   ```

2. `docker compose up -d`, then open Settings → Theme → Administration → Goodreads ratings.
   The card looks for the helper by itself (it also checks the metadata providers you set up
   in Audiobookshelf) and says "Goodreads: connected" once found. Running it some other way?
   Paste its address into the card, or set `NH_GOODREADS_UPSTREAM` on the theme container.

3. Book pages fill in by themselves as people browse. The small "?" next to a score shows
   which Goodreads book it came from; admins can change the match right there. The switch
   on the card turns the whole thing off for everyone.

No account, no API key, nothing else to set up. The helper is
[abs-tract](https://github.com/ahobsonsayers/abs-tract) (MIT) with a small patch that adds the
rating numbers to its answers, built from `integrations/abs-tract` in this repo. If you already
run abs-tract as an Audiobookshelf metadata provider, swap its image for this one: it does the
same job plus ratings. Not running on Docker Compose? Any way of running that image and
reaching it from the theme container works; `NH_GOODREADS_UPSTREAM` just needs its address
without a trailing slash.

**Importing ratings**: export from StoryGraph (Manage Your Data → Export), Goodreads
(My Books → Import and export) or Hardcover (Account → Exports, or straight over the API with
your key), pick the file under Settings → Theme → Books. Matching goes by ISBN/ASIN, then
title + author, then a close-match pass, and nothing is written until you confirm the dry-run
list. Quarter stars survive.

**Family sharing**: the ranking, shared top titles and the who's-reading row work off small
summaries each browser publishes. Listening TIME is on by default (it powers the ranking);
anything that reveals which books people actually read ships OFF until an admin switches it on
in the Social card. Every user keeps two personal sharing toggles on top, and `NH_SOCIAL=false`
kills all of it at the container level.

**Security**: every API call is validated against ABS with the caller's own login token, so
nobody can rate or write as someone else. Admin-only writes are proven by replaying the token
against an admin-only ABS endpoint. ABS itself is never written to.

**What's public**: things the page needs before login (logo, series covers and descriptions,
profile photos, server defaults) are served without auth. Ratings, reviews, stats, reports and
settings require login. Keep that in mind for profile photos.

**What's in `/data/nh`**:

| File / folder | What it holds |
|---|---|
| `server-config.json` | UI-saved server defaults |
| `ratings.json` | ratings + reviews |
| `stats.json` / `progress.json` | shared listening + reading-progress summaries |
| `collection-art.json` | collection icon overrides |
| `reports.json` | user problem reports |
| `prefs.json` | each user's settings (follows them between browsers) |
| `series-covers/`, `series-desc/` | series art + description overrides |
| `user-avatars/` | profile photos |
| `logo.*` | uploaded logo |

**Reset yourself**: clear the site's data, or in the console:

```js
Object.keys(localStorage).filter(k => k.startsWith('nh-settings')).forEach(k => localStorage.removeItem(k));
location.reload();
```

## How it works

nginx proxies everything to ABS untouched and rewrites the HTML on the way out: config and
theme scripts are inlined into the page (before first paint, so nothing flashes stock). Inlined
means no separate caching, so a rebuilt image is live on the next page load. Compression is
handled so `sub_filter` can rewrite, and WebSockets pass through for progress sync.

## Compatibility

The theme targets ABS's current DOM, so a big ABS UI change can break selectors until updated.
Verified against Audiobookshelf **2.35.1** and **2.36.0**. Open an issue with your ABS version
if something looks off. Not affiliated with the Audiobookshelf project.

## Build

```bash
docker build -t nanohive-abs-theme .

# multi-arch:
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/rodzalendo/nanohive-abs-theme:latest --push .

# readable (unminified) theme inside the image:
docker build --build-arg NH_MINIFY=false -t nanohive-abs-theme .
```

## License

MIT. See [LICENSE](LICENSE).
