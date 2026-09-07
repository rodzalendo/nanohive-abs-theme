/* NanoHive ABS - Server-wide Ratings API  v1.27.0  (nginx njs module)

   A tiny JSON API that lets every user of this server rate books (stars +
   short review, Plex-style) and see everyone else's ratings. Runs entirely
   inside the existing nginx container via the njs module - no extra service.

   Storage:  /data/nh/ratings.json  (same nh_theme_data volume as
             server-config.json, so ratings survive container recreation).

   Identity is verified SERVER-SIDE: every call replays the caller's own
   Bearer token against ABS /api/me (internal subrequest /_nh/api/whoami),
   so nobody can rate as someone else. Any authenticated ABS user may rate;
   admins may additionally remove another user's rating (moderation).

   Data shape (keys are libraryItemIds, or "series:<seriesId>" for whole-series
   ratings - same records, same rules, just a prefixed key):
     { "v": 1, "items": { "<libraryItemId>": {
         "<userId>": { "user": "<username>", "stars": 4.5,
                       "review": "…", "ts": 1753167600000 }
     } } }

   Endpoints (wired up in default.conf.template):
     GET  /_nh/api/ratings            -> whole store (family scale, tiny)
     GET  /_nh/api/ratings?item=<id>  -> just that item's ratings
     POST /_nh/api/ratings            -> { itemId, stars, review }
                                         stars 0/absent removes the rating;
                                         admins may pass forUser to remove
                                         someone else's.
     POST /_nh/api/ratings            -> { items: [ { itemId, stars, review } ] }
                                         bulk form (rating import), max 500 rows,
                                         ONE store rewrite, caller's own id only -
                                         forUser is not honoured in this form.

   Stars are 0.25-5 in QUARTER steps (v1.13.0; halves and wholes are a subset).
   The location caps the body at 64k, so a bulk caller must chunk to fit - njs
   cannot read a body that nginx spooled to a temp file.

   Known limit: the read-modify-write is not locked across nginx workers.
   At family scale simultaneous rating writes are vanishingly rare, and the
   write itself is atomic (tmp file + rename) so the store can never be torn
   - worst case one of two same-instant writes wins. */

import fs from 'fs';

const DATA = '/data/nh/ratings.json';

function readStore() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA));
    if (parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object') {
      return parsed;
    }
  } catch (e) {}
  return { v: 1, items: {} };
}

function writeStore(store) {
  const tmp = DATA + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, DATA);
}

function send(r, status, obj) {
  r.headersOut['Content-Type'] = 'application/json';
  r.headersOut['Cache-Control'] = 'no-store';
  // Every response here echoes text somebody typed (review bodies, report notes,
  // usernames). It is JSON and it is never rendered as a document, but saying so
  // costs one header and takes content-type guessing off the table entirely.
  r.headersOut['X-Content-Type-Options'] = 'nosniff';
  r.return(status, JSON.stringify(obj));
}

/* Identity comes from the caller's own JWT payload. The token was ALREADY
   validated by ABS itself before this handler runs - nginx auth_request replays
   it against /api/me and rejects the request otherwise - so decoding without
   signature verification is safe: we merely read back what ABS put into the
   token it just accepted (userId, username, type).
   NO njs subrequests here, deliberately: njs buffers subrequest responses in
   memory sized from Content-Length, and /api/me announces the caller's entire
   media progress (~90KB for an active listener) even for HEAD - which overflowed
   the buffer and killed requests with an empty reply. auth_request discards the
   body at any size instead. */
function whoami(r) {
  try {
    const auth = r.headersIn.Authorization || '';
    const m = /^Bearer\s+[^.]+\.([^.]+)\.[^.]+$/.exec(auth);
    if (!m) return null;
    let b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const p = JSON.parse(Buffer.from(b64, 'base64').toString());
    if (!p || !(p.userId || p.sub)) return null;
    return {
      id: String(p.userId || p.sub),
      name: String(p.username || 'user'),
      admin: p.type === 'root' || p.type === 'admin'
    };
  } catch (e) {
    return null;
  }
}

/* Names next to ratings are a SOCIAL feature now (#27-style follow-up):
   the global `names` switch ships OFF and overrides everything; with it on,
   admin per-user exclusions (social.json nameExcl) and each user's own
   shareRatingName pref still hide individual names. Masking happens on READ -
   the store keeps the real names, so flipping a switch back restores them.
   The caller always sees their OWN name; the nginx-gated admin twin sees
   every name, with masked rows flagged anon:1 instead of stripped. */
function handleGet(r, user) {
  const store = readStore();
  const isAdminGet = (r.variables && r.variables.nh_ratings_admin) === '1';
  const eff = socialEff(r);
  const hideAll = !eff.names;
  const hidden = {};
  if (!hideAll) {
    const soc = readSocial();
    (Array.isArray(soc.nameExcl) ? soc.nameExcl : []).forEach(function (id) { hidden[id] = 1; });
    nhNameOptOuts().forEach(function (id) { hidden[id] = 1; });
  }
  const me = user ? user.id : '';
  // shareRatings=false hides a user's ROWS from everyone else entirely
  // (stars, review, the lot); admins keep them with a hidden:1 flag
  const gone = {};
  nhRatingOptOuts().forEach(function (id) { gone[id] = 1; });
  const maskItem = function (rows) {
    const out = {};
    Object.keys(rows || {}).forEach(function (uid) {
      const e = rows[uid];
      if (uid !== me && gone[uid]) {
        if (isAdminGet) out[uid] = Object.assign({}, e, { hidden: 1 });
        return;
      }
      const masked = uid !== me && (hideAll || hidden[uid]);
      if (!masked) { out[uid] = e; return; }
      if (isAdminGet) { out[uid] = Object.assign({}, e, { anon: 1 }); return; }
      out[uid] = Object.assign({}, e, { user: '' });
    });
    return out;
  };
  const item = r.args && r.args.item;
  if (item) {
    const out = {};
    out[item] = maskItem(store.items[item] || {});
    return send(r, 200, { v: 1, items: out });
  }
  const full = { v: store.v || 1, items: {} };
  Object.keys(store.items || {}).forEach(function (id) { full.items[id] = maskItem(store.items[id]); });
  send(r, 200, full);
}

/* QUARTER steps, not half. v2.0.1 added a "star rating steps" setting with a
   quarter-star option, but this check still demanded halves - so every quarter
   rating the UI could produce (4.25, 3.75) was answered with a 400 and silently
   failed to save. Quarter is now the finest the store accepts, which is also what
   StoryGraph exports, so an imported 3.75 keeps its value. Halves and wholes are
   a subset, so nothing that used to be accepted is rejected now. */
function validStars(v) {
  return v >= 0.25 && v <= 5 && Math.round(v * 4) === v * 4;
}

function cleanReview(v) {
  const s = typeof v === 'string' ? v : '';
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, 1500);
}

const ITEM_ID_RE = /^(?:series:)?[A-Za-z0-9_-]{4,64}$/;

/* Bulk write, one file rewrite for the whole lot (importing a StoryGraph or
   Goodreads export is ~100 ratings; as single POSTs that is 100 read-modify-write
   cycles over the same file, each one a chance to lose a concurrent write).
   Rows are written ONLY under the caller's own verified id - there is deliberately
   no forUser here, so a bulk call can never touch anyone else's ratings. */
const BATCH_MAX = 500;

function handleBatch(r, user, rows) {
  if (!rows.length) return send(r, 400, { error: 'empty items' });
  if (rows.length > BATCH_MAX) return send(r, 400, { error: 'too many items (max ' + BATCH_MAX + ')' });

  const store = readStore();
  let saved = 0, removed = 0;
  const bad = [];
  const out = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== 'object') { bad.push(i); continue; }
    const itemId = String(row.itemId || '');
    if (!ITEM_ID_RE.test(itemId)) { bad.push(i); continue; }
    const stars = Number(row.stars);
    const drop = !stars;
    if (!drop && !validStars(stars)) { bad.push(i); continue; }

    const item = store.items[itemId] || {};
    if (drop) {
      if (item[user.id]) removed++;
      delete item[user.id];
    } else {
      item[user.id] = { user: user.name, stars: stars, review: cleanReview(row.review), ts: Date.now() };
      saved++;
    }
    if (Object.keys(item).length) store.items[itemId] = item;
    else delete store.items[itemId];
    out[itemId] = store.items[itemId] || {};
  }

  if (saved || removed) {
    try {
      writeStore(store);
    } catch (e) {
      return send(r, 500, { error: 'write failed' });
    }
  }
  send(r, 200, { ok: true, saved: saved, removed: removed, rejected: bad.length, badRows: bad.slice(0, 20), items: out });
}

async function handlePost(r, user) {
  let body = null;
  try { body = JSON.parse(r.requestText); } catch (e) {}
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'invalid JSON body' });

  if (Array.isArray(body.items)) return handleBatch(r, user, body.items);

  const itemId = String(body.itemId || '');
  if (!ITEM_ID_RE.test(itemId)) return send(r, 400, { error: 'invalid itemId' });

  // Admins may target someone else's rating (delete only, in practice);
  // everyone else can only ever write under their own verified id.
  // Admin-ness comes from NGINX, not the token: newer ABS JWTs carry no `type`
  // claim, so the payload check below is true for nobody and moderation failed
  // with a silent 403 for every admin. /_nh/api/ratings-admin is gated by
  // auth_request /_nh/admincheck and sets $nh_ratings_admin=1, which a client
  // cannot forge. The payload check stays as a fallback for legacy tokens.
  let targetId = user.id;
  if (body.forUser && String(body.forUser) !== user.id) {
    const isAdmin = (r.variables.nh_ratings_admin === '1') || user.admin;
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    targetId = String(body.forUser);
  }

  const stars = Number(body.stars);
  const remove = !stars;
  if (!remove && !validStars(stars)) {
    return send(r, 400, { error: 'stars must be 0.25-5 in quarter steps (0 removes)' });
  }

  const review = cleanReview(body.review);

  const store = readStore();
  const item = store.items[itemId] || {};
  if (remove) {
    delete item[targetId];
  } else {
    item[targetId] = { user: user.name, stars: stars, review: review, ts: Date.now() };
  }
  if (Object.keys(item).length) store.items[itemId] = item;
  else delete store.items[itemId];

  try {
    writeStore(store);
  } catch (e) {
    return send(r, 500, { error: 'write failed' });
  }
  const out = {};
  out[itemId] = store.items[itemId] || {};
  send(r, 200, { ok: true, items: out });
}

async function handle(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });

  if (r.method === 'GET') return handleGet(r, user);
  if (r.method === 'POST') return await handlePost(r, user);
  r.headersOut['Allow'] = 'GET, POST';
  send(r, 405, { error: 'method not allowed' });
}

/* Custom series metadata discovery (A1+): admin uploads land in
   /data/nh/series-covers/<id>.<ext> (images) and /data/nh/series-desc/<id>.txt
   (description overrides), both via the admin DAV path. This lists the folders
   ONCE per request so the client knows what exists without per-card probing.
   Same auth_request gate as ratings - any authenticated user may read.
   Also lists /data/nh/user-avatars (profile photos, written by avatar() below)
   so the ranking renders photos without per-user 404 probing. */
function meta(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });
  if (r.method !== 'GET') {
    r.headersOut['Allow'] = 'GET';
    return send(r, 405, { error: 'method not allowed' });
  }
  const covers = {}, descs = {}, avatars = {};
  try {
    fs.readdirSync('/data/nh/series-covers').forEach(function (f) {
      const m = /^([A-Za-z0-9_-]{4,64})\.(png|jpe?g|webp|gif|avif)$/.exec(f);
      if (m) covers[m[1]] = m[2];
    });
  } catch (e) {} // folder absent until the first upload - empty map is correct
  try {
    fs.readdirSync('/data/nh/series-desc').forEach(function (f) {
      const m = /^([A-Za-z0-9_-]{4,64})\.txt$/.exec(f);
      if (m) descs[m[1]] = 1;
    });
  } catch (e) {}
  try {
    fs.readdirSync('/data/nh/user-avatars').forEach(function (f) {
      const m = /^([A-Za-z0-9_-]{4,64})\.(png|jpe?g|webp|gif)$/.exec(f);
      if (m) avatars[m[1]] = m[2];
    });
  } catch (e) {}
  send(r, 200, { v: 1, covers: covers, descs: descs, avatars: avatars });
}

/* Profile photos (user avatars). POST = raw image bytes in the body (type
   sniffed from magic bytes, not trusted headers); DELETE removes. Identity from
   the caller's JWT - everyone manages their OWN photo; admins may pass
   ?forUser=<id> to set/remove someone else's (same moderation pattern as
   ratings). Files: /data/nh/user-avatars/<userId>.<ext>, served by a public
   regex location like series covers. The nginx location must buffer the body
   in memory (client_body_buffer_size >= client_max_body_size) so
   r.requestBuffer is populated. */
const AVATAR_DIR = '/data/nh/user-avatars';
const AVATAR_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function avatar(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });

  // Admin-ness: newer ABS JWTs carry NO `type` claim (just userId/username/iat),
  // so the payload alone can't prove admin. The /_nh/api/avatar-admin location
  // is gated by auth_request /_nh/admincheck (an admin-only ABS endpoint) and
  // sets $nh_avatar_admin=1 - nginx-verified, not client-claimable. The old
  // payload check stays as a fallback for legacy tokens.
  const isAdmin = (r.variables.nh_avatar_admin === '1') || user.admin;

  let targetId = user.id;
  const forUser = r.args && r.args.forUser;
  if (forUser && String(forUser) !== user.id) {
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    targetId = String(forUser);
  }
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(targetId)) return send(r, 400, { error: 'invalid user id' });

  const rmOthers = function (keep) {
    AVATAR_EXTS.forEach(function (e) {
      if (e === keep) return;
      try { fs.unlinkSync(AVATAR_DIR + '/' + targetId + '.' + e); } catch (err) {}
    });
  };

  if (r.method === 'DELETE') {
    rmOthers(null);
    return send(r, 200, { ok: true });
  }
  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'POST, DELETE';
    return send(r, 405, { error: 'method not allowed' });
  }

  const buf = r.requestBuffer;
  if (!buf || !buf.length) return send(r, 400, { error: 'empty body' });
  if (buf.length > 2 * 1024 * 1024) return send(r, 400, { error: 'too large (max 2MB)' });
  let ext = null;
  if (buf[0] === 0xFF && buf[1] === 0xD8) ext = 'jpg';
  else if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) ext = 'png';
  else if (buf.length > 11 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) ext = 'webp';
  else if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) ext = 'gif';
  if (!ext) return send(r, 400, { error: 'not a supported image (jpeg/png/webp/gif)' });

  try { fs.mkdirSync(AVATAR_DIR); } catch (e) {} // exists = fine
  rmOthers(ext);
  try {
    fs.writeFileSync(AVATAR_DIR + '/' + targetId + '.' + ext, buf);
  } catch (e) {
    return send(r, 500, { error: 'write failed' });
  }
  send(r, 200, { ok: true, ext: ext });
}

/* Social switches (#25) - what the server shares between users at all.

   Three flags, resolved per request as: admin-saved file > NH_SOCIAL env >
   built-in defaults. Time-only sharing stays on so the family ranking works
   out of the box; anything that would tell one user WHAT another user reads
   ships dark until an admin turns it on:
     time       (default ON)  totals + per-day minutes, feeds the ranking
     content    (default OFF) the top-titles list inside stats summaries
     whoReading (default OFF) per-book progress + finished titles (book pages)
   NH_SOCIAL=false (via $nh_social_env, set from the env at template render)
   turns all three off, the "return to vanilla" switch the reporter asked for.

   Enforcement lives HERE, not in the client: with a flag off the store stops
   being served (or has its titles stripped) on read AND write, so data already
   collected under older defaults goes quiet the moment the container updates,
   without being deleted - flipping the switch back on restores it.

   Admins can also exclude specific users: an exclude writes an ADMIN tombstone
   ({ out: 1, adm: 1 }) into both shared stores and drops the user's rows. The
   user's own browser cannot lift an admin tombstone (a plain opt-out remains
   the user's to lift by posting again); include removes it entirely.

   Store: /data/nh/social.json - only the keys an admin actually set. */
const SOCIAL = '/data/nh/social.json';
const SOCIAL_KEYS = ['time', 'content', 'whoReading', 'names'];
// names = usernames shown next to ratings/reviews. Same shape as the rest:
// the GLOBAL switch ships OFF and always overrides the per-user state; the
// per-user admin switches and each user's own toggle default to ON.
const SOCIAL_DEFAULTS = { time: true, content: false, whoReading: false, names: false };

function readSocial() {
  try {
    const p = JSON.parse(fs.readFileSync(SOCIAL));
    if (p && typeof p === 'object') return p;
  } catch (e) {}
  return {};
}

function writeSocial(store) {
  const tmp = SOCIAL + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, SOCIAL);
}

function socialEff(r) {
  const file = readSocial();
  const envOff = String((r.variables && r.variables.nh_social_env) || '') === 'false';
  const out = {};
  SOCIAL_KEYS.forEach(function (k) {
    if (typeof file[k] === 'boolean') out[k] = file[k];
    else if (envOff) out[k] = false;
    else out[k] = SOCIAL_DEFAULTS[k];
  });
  return out;
}

/* Tombstone views over the two shared stores, for the admin panel: who is
   admin-excluded, and who opted out themselves (shown read-only - an admin
   cannot opt someone back IN, that would defeat the point of the toggle). */
/* "Opted out" means the user said no to the RANKING (a stats tombstone) while a
   progress tombstone is just the shareReading default (opt-in, off), so it
   must NOT paint everyone as opted out in the admin roster. Admin exclusions
   still count from either store. */
/* Per-kind since Pawel wanted two admin toggles per user: "time" = the stats
   store (ranking), "books" = the progress store (which books, and the titles
   field inside stats posts). excluded/optedOut stay as the union for the
   places that only need "is this user dark at all" (board icon, old checks). */
function socialTombs() {
  const out = { excluded: [], optedOut: [], exclTime: [], exclBooks: [], optTime: [], optBooks: [] };
  const st = readStats();
  Object.keys(st.users || {}).forEach(function (uid) {
    const u = st.users[uid];
    if (!u || !u.out) return;
    (u.adm ? out.exclTime : out.optTime).push(uid);
  });
  const pg = readProgress();
  Object.keys(pg.users || {}).forEach(function (uid) {
    const u = pg.users[uid];
    if (!u || !u.out) return;
    (u.adm ? out.exclBooks : out.optBooks).push(uid);
  });
  out.excluded = out.exclTime.concat(out.exclBooks.filter(function (id) { return out.exclTime.indexOf(id) < 0; }));
  out.optedOut = out.optTime.filter(function (id) { return out.excluded.indexOf(id) < 0; });
  // names: admin exclusions live in social.json (ratings are keyed by item,
  // not user, so there is no per-user record to tombstone); the user's own
  // "no" is their shareRatingName pref
  const soc = readSocial();
  out.exclNames = Array.isArray(soc.nameExcl) ? soc.nameExcl.slice() : [];
  out.optNames = nhNameOptOuts();
  return out;
}

/* Users whose own toggle says "no name with my ratings" - read from the prefs
   store (the default is ON, so only an explicit false counts). */
function nhNameOptOuts() {
  return nhPrefOptOuts('shareRatingName');
}
/* And the stronger one: users hiding their RATINGS from everyone else. */
function nhRatingOptOuts() {
  return nhPrefOptOuts('shareRatings');
}
function nhPrefOptOuts(key) {
  const out = [];
  try {
    const users = (readPrefs().users) || {};
    Object.keys(users).forEach(function (uid) {
      const s = users[uid] && users[uid].settings;
      if (s && s[key] === false) out.push(uid);
    });
  } catch (e) {}
  return out;
}

function social(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });
  const isAdmin = (r.variables.nh_social_admin === '1') || user.admin;

  if (r.method === 'GET') {
    const eff = socialEff(r);
    if (!isAdmin) return send(r, 200, { v: 1, eff: eff });
    return send(r, 200, { v: 1, eff: eff, cfg: readSocial(), tombs: socialTombs() });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST';
    return send(r, 405, { error: 'method not allowed' });
  }
  if (!isAdmin) return send(r, 403, { error: 'admin only' });

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'bad body' });

  if (body.set && typeof body.set === 'object') {
    const store = readSocial();
    SOCIAL_KEYS.forEach(function (k) {
      if (typeof body.set[k] === 'boolean') store[k] = body.set[k];
    });
    try { writeSocial(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  }

  // kind: 'time' (stats/ranking), 'books' (progress + stats titles),
  // 'names' (username next to ratings - social.json list), absent = both stores
  const exclude = body.exclude && String(body.exclude);
  const include = body.include && String(body.include);
  const kind = body.kind === 'time' || body.kind === 'books' || body.kind === 'names' ? body.kind : null;
  if (kind === 'names' && (exclude || include)) {
    const id = exclude || include;
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return send(r, 400, { error: 'invalid user id' });
    const store = readSocial();
    const list = Array.isArray(store.nameExcl) ? store.nameExcl : [];
    if (exclude && list.indexOf(id) < 0) list.push(id);
    if (include) { const i2 = list.indexOf(id); if (i2 >= 0) list.splice(i2, 1); }
    store.nameExcl = list;
    try { writeSocial(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
    return send(r, 200, { v: 1, ok: true, eff: socialEff(r), cfg: readSocial(), tombs: socialTombs() });
  }
  if (exclude) {
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(exclude)) return send(r, 400, { error: 'invalid user id' });
    const name = String(body.user == null ? '' : body.user).slice(0, 60) || '?';
    // exclusion keeps whatever was shared (admin-only view), same as opt-outs
    const stamp = function (prev) { return Object.assign({}, prev || {}, { out: 1, adm: 1, user: name, ts: Date.now() }); };
    const st = readStats();
    const pg = readProgress();
    if (kind !== 'books') st.users[exclude] = stamp(st.users[exclude]);
    if (kind !== 'time') pg.users[exclude] = stamp(pg.users[exclude]);
    try { writeStats(st); writeProgress(pg); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  } else if (include) {
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(include)) return send(r, 400, { error: 'invalid user id' });
    const st = readStats();
    const pg = readProgress();
    // lift only ADMIN tombstones - a user's own opt-out is not the admin's to
    // undo. Lifting keeps the retained record live again (drop out/adm marks).
    const lift = function (store, id) {
      const u = store.users[id];
      if (!u || !u.adm) return;
      delete u.out; delete u.adm;
      // a bare stamp with no shared data underneath just goes away
      if (!Object.keys(u).some(function (k) { return k !== 'user' && k !== 'ts'; })) delete store.users[id];
    };
    if (kind !== 'books') lift(st, include);
    if (kind !== 'time') lift(pg, include);
    try { writeStats(st); writeProgress(pg); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  }

  send(r, 200, { v: 1, ok: true, eff: socialEff(r), cfg: readSocial(), tombs: socialTombs() });
}

/* Shared listening summaries (A5 - family leaderboard + year in review).

   Every participant's browser posts a SUMMARY of its own /api/me/listening-stats
   here; the store is then readable by any authenticated user, which is what makes
   a family board possible without handing out admin rights. Sharing is ON by
   default, and a DELETE erases everything the caller shared.

   A DELETE leaves a TOMBSTONE ({ out: 1 }) rather than removing the key. The
   listening data really is gone - the promise in the settings panel holds - but
   the board needs to tell "opted out" apart from "has not posted yet", and only
   the absence-vs-tombstone distinction can do that. Without it the ADMIN board
   (which ranks the real user roster, not this store) has no way to know who
   asked to be left out, and every user who simply had not opened the app since
   the feature shipped would vanish from it.

   Store: /data/nh/stats.json
     { "v": 1, "users": { "<userId>": {
         "user": "<username>", "total": <seconds>, "ts": <ms>,
         "days": { "YYYY-MM-DD": <seconds> },      // trimmed by the client, capped here
         "books": [ { "t": "<title>", "s": <seconds> } ]   // top few, for the board
       } | { "out": 1, "ts": <ms> } } }

   Only the caller's OWN record can be written: the id comes from the verified
   JWT, never from the body. Everything is bounded (day keys, book rows, string
   lengths) so one client cannot inflate the file. */
const STATS = '/data/nh/stats.json';
const STATS_MAX_DAYS = 420;
const STATS_MAX_BOOKS = 10;

function readStats() {
  try {
    const p = JSON.parse(fs.readFileSync(STATS));
    if (p && typeof p === 'object' && p.users && typeof p.users === 'object') return p;
  } catch (e) {}
  return { v: 1, users: {} };
}

function writeStats(store) {
  const tmp = STATS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, STATS);
}

function stats(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });
  const eff = socialEff(r);

  if (r.method === 'GET') {
    // ADMIN reads (the nginx-gated twin) see the full store: opted-out records
    // keep their figures now (Pawel: admins see everything, the UI just marks
    // them), and the server flags do not dark an admin's view.
    const isAdminGet = r.variables.nh_stats_admin === '1';
    const store = readStats();
    if (isAdminGet) return send(r, 200, store);
    // Social switches (#25): time off = the whole board is dark; content off =
    // titles stripped. Opted-out records serve as a BARE tombstone - the
    // retained figures are for admin eyes only.
    if (!eff.time) return send(r, 200, { v: 1, users: {} });
    // a books-side admin exclusion also strips any titles stored BEFORE it
    const pgUsers = readProgress().users || {};
    const out = { v: store.v || 1, users: {} };
    Object.keys(store.users).forEach(function (uid) {
      const u = store.users[uid];
      if (!u) return;
      if (u.out) { out.users[uid] = u.adm ? { out: 1, adm: 1, ts: u.ts } : { out: 1, ts: u.ts }; return; }
      const bx = pgUsers[uid] && pgUsers[uid].out && pgUsers[uid].adm;
      out.users[uid] = (eff.content && !bx) ? u : { user: u.user, total: u.total, days: u.days, books: [], ts: u.ts };
    });
    return send(r, 200, out);
  }

  if (r.method === 'DELETE') {
    // Opting out RETAINS the figures but flags the record: other users see a
    // bare tombstone (the GET above strips), admins keep seeing the numbers
    // with an opted-out mark (Pawel). The boards exclude flagged users for
    // everyone else, and absence still means "has not posted yet".
    const store = readStats();
    const prev = store.users[user.id];
    if (!prev || !prev.out) {
      store.users[user.id] = Object.assign({}, prev || {}, { out: 1, ts: Date.now() });
      try { writeStats(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
    }
    return send(r, 200, { ok: true });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST, DELETE';
    return send(r, 405, { error: 'method not allowed' });
  }

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'bad body' });

  // Admin seeding (round 11): the gated twin /_nh/api/stats-admin sets
  // $nh_stats_admin and may write ANY user's summary (?forUser=<id>), so the
  // family board is complete even for people who never open the web app. The
  // target's display name comes from the body then - the caller is the admin.
  // An opt-out tombstone is never overwritten from this path: opting out means
  // out, only the user's own browser posting again brings them back.
  let targetId = user.id;
  let targetName = user.name;
  const forUser = r.args && r.args.forUser;
  if (forUser && String(forUser) !== user.id) {
    const isAdmin = (r.variables.nh_stats_admin === '1') || user.admin;
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    targetId = String(forUser);
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(targetId)) return send(r, 400, { error: 'invalid user id' });
    targetName = String(body.user == null ? '' : body.user).slice(0, 60) || '?';
  }
  // With sharing dark, SEEDING stays off but a user's OWN post is still
  // processed: it lifts a plain tombstone (a "no" written while an old server
  // default forced the toggle off must heal when the toggle reads ON again) and
  // the stored record simply is not served until the flag returns. Without
  // this, the admin panel showed users as opted out who never chose anything.
  if (!eff.time && targetId !== user.id) return send(r, 200, { ok: true, skipped: 'social-off' });

  const total = Number(body.total);
  if (!isFinite(total) || total < 0) return send(r, 400, { error: 'bad total' });

  const days = {};
  let nDays = 0;
  const src = (body.days && typeof body.days === 'object') ? body.days : {};
  const keys = Object.keys(src).sort().reverse(); // newest first if we have to cut
  for (let i = 0; i < keys.length && nDays < STATS_MAX_DAYS; i++) {
    const k = keys[i];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    const v = Number(src[k]);
    if (!isFinite(v) || v <= 0) continue;
    days[k] = Math.round(v);
    nDays++;
  }

  // Titles are refused at the door, not just hidden on read: they need the
  // server content flag AND must come from the user's OWN browser (the seeder
  // cannot know anyone else's shareReading consent, so forUser never lands
  // titles). A pre-2.5 client that still sends them cannot land any either.
  // A books-side ADMIN exclusion (adm tombstone in the progress store) also
  // keeps titles out of the stats record: the two admin toggles are
  // time = this store, books = progress store + this titles field.
  const pgTomb = (readProgress().users || {})[targetId];
  const booksExcluded = !!(pgTomb && pgTomb.out && pgTomb.adm);
  const books = [];
  if (eff.content && targetId === user.id && !booksExcluded && Array.isArray(body.books)) {
    for (let i = 0; i < body.books.length && books.length < STATS_MAX_BOOKS; i++) {
      const b = body.books[i];
      if (!b || typeof b !== 'object') continue;
      const t = String(b.t == null ? '' : b.t).slice(0, 120);
      const s = Number(b.s);
      if (!t || !isFinite(s) || s <= 0) continue;
      books.push({ t: t, s: Math.round(s) });
    }
  }

  const store = readStats();
  const cur = store.users[targetId];
  // an ADMIN tombstone (adm: 1) blocks even the user's own re-post - only the
  // admin panel's include lifts it. A plain opt-out stays the user's to lift.
  if (cur && cur.out && (cur.adm || targetId !== user.id)) {
    return send(r, 200, { ok: true, skipped: 'opted-out' });
  }
  store.users[targetId] = {
    user: String(targetName).slice(0, 60),
    total: Math.round(total),
    days: days,
    books: books,
    ts: Date.now()
  };
  try { writeStats(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true, days: nDays });
}

/* Problem reports (users tell the admin a book is broken).

   A user POSTs { itemId, title, reason, note } from the book page; admins read
   and clear the queue. Reading and deleting are ADMIN-ONLY and that is enforced
   by nginx, not by this file: /_nh/api/reports-admin is gated by
   auth_request /_nh/admincheck and sets $nh_reports_admin=1. The token cannot be
   used to prove admin-ness (no `type` claim in current ABS JWTs), and the report
   list carries other people's names, so it must not be world-readable.

   Store: /data/nh/reports.json
     { "v": 1, "reports": [ { "id", "itemId", "title", "reason", "note",
                              "user", "userId", "ts" } ] }  (newest first) */
const REPORTS = '/data/nh/reports.json';
const REPORTS_MAX = 300;
const REPORT_REASONS = ['missing', 'quality', 'play', 'wrong', 'chapters', 'other'];

function readReports() {
  try {
    const p = JSON.parse(fs.readFileSync(REPORTS));
    if (p && typeof p === 'object' && Array.isArray(p.reports)) return p;
  } catch (e) {}
  return { v: 1, reports: [] };
}

function writeReports(store) {
  const tmp = REPORTS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, REPORTS);
}

function reports(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });
  const isAdmin = (r.variables.nh_reports_admin === '1') || user.admin;

  if (r.method === 'GET') {
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    return send(r, 200, readReports());
  }

  if (r.method === 'DELETE') { // resolve one report
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    const id = String((r.args && r.args.id) || '');
    if (!id) return send(r, 400, { error: 'missing id' });
    const store = readReports();
    const before = store.reports.length;
    store.reports = store.reports.filter(function (x) { return x.id !== id; });
    if (store.reports.length !== before) {
      try { writeReports(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
    }
    return send(r, 200, { ok: true, removed: before - store.reports.length });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST, DELETE';
    return send(r, 405, { error: 'method not allowed' });
  }

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'bad body' });

  const itemId = String(body.itemId || '');
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(itemId)) return send(r, 400, { error: 'invalid itemId' });
  const reason = String(body.reason || '');
  if (REPORT_REASONS.indexOf(reason) < 0) return send(r, 400, { error: 'invalid reason' });
  let note = typeof body.note === 'string' ? body.note : '';
  note = note.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, 600);
  const title = String(body.title == null ? '' : body.title).slice(0, 200);

  const store = readReports();
  // One open report per user per book: re-reporting updates rather than piles up.
  store.reports = store.reports.filter(function (x) { return !(x.itemId === itemId && x.userId === user.id); });
  store.reports.unshift({
    id: user.id.slice(0, 8) + '-' + itemId.slice(0, 8) + '-' + Date.now(),
    itemId: itemId, title: title, reason: reason, note: note,
    user: user.name.slice(0, 60), userId: user.id, ts: Date.now()
  });
  if (store.reports.length > REPORTS_MAX) store.reports.length = REPORTS_MAX;
  try { writeReports(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true });
}

/* Started-date overrides.

   ABS will NOT store a client-supplied startedAt: PATCH /api/me/progress/:id
   answers 200 and keeps its own value, and so does the batch route - it derives
   the date from listening sessions. Verified five ways. So a correction lives
   here instead, per user, and the book page shows the override when there is one.
   Nothing is written to ABS; clearing the override falls back to ABS's date.

   Store: /data/nh/dates.json
     { "v": 1, "users": { "<userId>": { "<itemId>": { "startedAt": <ms> } } } } */
const DATES = '/data/nh/dates.json';
const DATES_MAX_PER_USER = 500;

function readDates() {
  try {
    const p = JSON.parse(fs.readFileSync(DATES));
    if (p && typeof p === 'object' && p.users && typeof p.users === 'object') return p;
  } catch (e) {}
  return { v: 1, users: {} };
}

function writeDates(store) {
  const tmp = DATES + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, DATES);
}

function dates(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });

  if (r.method === 'GET') {
    // Only ever your own overrides - this is per-user display state.
    const store = readDates();
    return send(r, 200, { v: 1, items: store.users[user.id] || {} });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST';
    return send(r, 405, { error: 'method not allowed' });
  }

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  const itemId = String((body && body.itemId) || '');
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(itemId)) return send(r, 400, { error: 'invalid itemId' });

  const store = readDates();
  const mine = store.users[user.id] || (store.users[user.id] = {});
  const v = Number(body.startedAt);
  if (!body.startedAt) {
    delete mine[itemId];                       // clearing restores ABS's own date
  } else {
    if (!isFinite(v) || v <= 0) return send(r, 400, { error: 'bad startedAt' });
    if (!mine[itemId] && Object.keys(mine).length >= DATES_MAX_PER_USER) {
      return send(r, 400, { error: 'too many overrides' });
    }
    mine[itemId] = { startedAt: Math.round(v) };
  }
  try { writeDates(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true });
}

/* ---------------- Per-user theme preferences (GitHub #12) ----------------
   A shared browser used to hold ONE settings blob, so a family device handed
   whoever signed in next the previous person's theme. The client now namespaces
   its localStorage per ABS user id, and this endpoint is the other half: the
   same preferences follow a user to any browser they sign in on.

   Storage: /data/nh/prefs.json
     { "v": 1, "users": { "<userId>": { "ts": 1754_000_000_000, "settings": {…} } } }

   The value is the client's own settings DIFF - only keys that differ from the
   server/env defaults - so it stays small and an admin changing the defaults
   still reaches everyone. It is stored opaquely: this endpoint deliberately does
   not know the theme's setting names, so shipping a new setting needs no njs
   change. Size is capped instead of validated key by key.

     GET  /_nh/api/prefs -> { v, ts, settings }   your own, never anyone else's
     POST /_nh/api/prefs <- { settings, ts }      replaces your own copy

   Last write wins, which is what the client's timestamp compare expects. Two
   browsers open at once means the most recent save is the one that survives. */
const PREFS = '/data/nh/prefs.json';
const PREFS_MAX_BYTES = 16384;

function readPrefs() {
  try {
    const p = JSON.parse(fs.readFileSync(PREFS));
    if (p && typeof p === 'object' && p.users && typeof p.users === 'object') return p;
  } catch (e) {}
  return { v: 1, users: {} };
}

function writePrefs(store) {
  const tmp = PREFS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, PREFS);
}

function prefs(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });

  if (r.method === 'GET') {
    const mine = readPrefs().users[user.id] || null;
    return send(r, 200, { v: 1, ts: (mine && mine.ts) || 0, settings: (mine && mine.settings) || null });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST';
    return send(r, 405, { error: 'method not allowed' });
  }

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  const settings = body && body.settings;
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return send(r, 400, { error: 'settings must be an object' });
  }
  // Re-serialise before measuring: the cap has to bound what we STORE, and the
  // request body could be padded with whitespace to slip a large object past it.
  const encoded = JSON.stringify(settings);
  if (encoded.length > PREFS_MAX_BYTES) return send(r, 400, { error: 'settings too large' });

  const ts = Number(body.ts);
  const store = readPrefs();
  store.users[user.id] = {
    ts: (isFinite(ts) && ts > 0) ? Math.round(ts) : Date.now(),
    settings: JSON.parse(encoded),
  };
  try { writePrefs(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true, ts: store.users[user.id].ts });
}

/* Shared book progress (GitHub #23 - "who's reading this").

   Same contract as the A5 stats above: every participant's browser posts a
   SUMMARY of its own /api/me mediaProgress; the store is readable by any
   authenticated user; a DELETE leaves the same opt-out TOMBSTONE (see the
   stats note for why absence and opt-out must stay distinguishable). The
   admin twin (/_nh/api/progress-admin?forUser=) seeds everyone so the book
   page is complete before each person has even opened the app.

   Store: /data/nh/progress.json
     { "v": 1, "users": { "<userId>": {
         "user": "<username>", "ts": <ms>,
         "reading": [ { "i": "<itemId>", "p": 0.43, "ts": <ms> } ],
         "done":    [ { "i": "<itemId>", "ts": <ms> } ]
       } | { "out": 1, "ts": <ms> } } }

   Caps keep one user's record small enough that a full post always fits the
   location's 64k body limit (njs cannot read a body nginx spooled to disk):
   40 in-progress rows and 600 finished rows, both newest first - the client
   sorts, this end enforces. The book page never pulls the whole store: GET
   ?item=<id> answers only that item's rows, a few hundred bytes. */
const PROGRESS = '/data/nh/progress.json';
const PG_MAX_READING = 40;
const PG_MAX_DONE = 600;
const PG_ITEM_RE = /^[A-Za-z0-9_-]{4,64}$/;

function readProgress() {
  try {
    const p = JSON.parse(fs.readFileSync(PROGRESS));
    if (p && typeof p === 'object' && p.users && typeof p.users === 'object') {
      // One-time lift of pre-flip PLAIN tombstones (mig2). While shareReading
      // was opt-in, every browser wrote a progress tombstone by DEFAULT - it
      // was never an objection, and the toggle could not even be turned off
      // (it already was). After the flip those artifacts read as "opted out"
      // in the two-switch roster (Pawel's whoops screenshot). Admin tombstones
      // are real exclusions and stay. Applied in memory on every read until a
      // write path persists the marker; genuine opt-outs made after this
      // deploy re-tombstone on the user's next load and are never lifted.
      if (!p.mig2) {
        Object.keys(p.users).forEach(function (uid) {
          const u = p.users[uid];
          if (!u || !u.out || u.adm) return;
          delete u.out;
          if (!Object.keys(u).some(function (k) { return k !== 'user' && k !== 'ts'; })) delete p.users[uid];
        });
        p.mig2 = 1;
      }
      return p;
    }
  } catch (e) {}
  return { v: 1, users: {}, mig2: 1 };
}

function writeProgress(store) {
  const tmp = PROGRESS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, PROGRESS);
}

function pgRows(list, max, withP) {
  const out = [];
  if (!Array.isArray(list)) return out;
  for (let i = 0; i < list.length && out.length < max; i++) {
    const e = list[i];
    if (!e || typeof e !== 'object') continue;
    const id = String(e.i || '');
    if (!PG_ITEM_RE.test(id)) continue;
    const ts = Number(e.ts);
    const row = { i: id, ts: (isFinite(ts) && ts > 0) ? Math.round(ts) : Date.now() };
    if (withP) {
      const p = Number(e.p);
      if (!isFinite(p) || p <= 0 || p >= 1) continue;
      row.p = Math.round(p * 1000) / 1000;
    }
    out.push(row);
  }
  return out;
}

/* #25 consent migration: a "no" said before 2.4.0 lives only in stats.json.
   The progress store shipped later under the SAME user-facing switch, so those
   tombstones must carry over - without this, the admin seeder finds no
   objection on file and publishes a reading list its owner already refused.
   Runs once (mig marker), lazily on the first progress request that reads. */
function pgMigrate(store) {
  if (store.mig) return false;
  const st = readStats();
  // Post-split this only carries over ADMIN exclusions: a user's own stats
  // "no" is about listening TIME now and must not dark the books side (they
  // are separate switches). Plain-tombstone carry-over would also be undone
  // by the mig2 lift immediately anyway.
  Object.keys(st.users || {}).forEach(function (uid) {
    const u = st.users[uid];
    if (u && u.out && u.adm && !store.users[uid]) {
      store.users[uid] = { out: 1, adm: 1, user: u.user, ts: u.ts || Date.now() };
    }
  });
  store.mig = 1;
  return true;
}

function progress(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });
  const eff = socialEff(r);

  if (r.method === 'GET') {
    const isAdminGet = r.variables.nh_progress_admin === '1';
    // whoReading off (#25, the default): the store goes dark on read for
    // everyone but ADMIN reads (the gated twin) - admins see everything, with
    // opted-out rows flagged instead of hidden (Pawel).
    if (!eff.whoReading && !isAdminGet) {
      const item0 = r.args && r.args.item;
      if (item0) return send(r, 200, { v: 1, item: String(item0), users: {} });
      return send(r, 200, { v: 1, users: {} });
    }
    const store = readProgress();
    if (pgMigrate(store)) { try { writeProgress(store); } catch (e) {} }
    const item = r.args && r.args.item;
    if (!item) {
      if (isAdminGet) return send(r, 200, store);
      // strip retained figures out of tombstoned records for everyone else
      const full = { v: store.v || 1, mig: store.mig, users: {} };
      Object.keys(store.users).forEach(function (uid) {
        const u = store.users[uid];
        if (!u) return;
        full.users[uid] = u.out ? (u.adm ? { out: 1, adm: 1, ts: u.ts } : { out: 1, ts: u.ts }) : u;
      });
      return send(r, 200, full);
    }
    // Per-item view: one compact row per user who has this book started or
    // finished. p present = in progress; f: 1 = finished; out: 1 (admin only)
    // marks a user who opted out of sharing.
    const out = {};
    Object.keys(store.users).forEach(function (uid) {
      const u = store.users[uid];
      if (!u) return;
      if (u.out && !isAdminGet) return;
      const rd = (u.reading || []).filter(function (e) { return e.i === item; })[0];
      const dn = (u.done || []).filter(function (e) { return e.i === item; })[0];
      if (rd) out[uid] = { user: u.user, p: rd.p, ts: rd.ts };
      else if (dn) out[uid] = { user: u.user, f: 1, ts: dn.ts };
      if (out[uid] && u.out) out[uid].out = 1;
    });
    return send(r, 200, { v: 1, item: String(item), users: out });
  }

  if (r.method === 'DELETE') {
    // Deliberately NOT gated on eff.whoReading: an opt-out must always be able
    // to land, feature enabled or not, so the "no" is on file for later.
    // Retains the rows (admin-only view), flags the record for everyone else.
    const store = readProgress();
    pgMigrate(store);
    const prev = store.users[user.id];
    if (!prev || !prev.out) {
      store.users[user.id] = Object.assign({}, prev || {}, { out: 1, ts: Date.now() });
      try { writeProgress(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
    }
    return send(r, 200, { ok: true });
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST, DELETE';
    return send(r, 405, { error: 'method not allowed' });
  }

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'bad body' });

  // Admin seeding twin - same rules as stats: the gate is nginx's, the target's
  // display name comes from the body, and an opt-out tombstone is never
  // overwritten from this path.
  let targetId = user.id;
  let targetName = user.name;
  const forUser = r.args && r.args.forUser;
  if (forUser && String(forUser) !== user.id) {
    const isAdmin = (r.variables.nh_progress_admin === '1') || user.admin;
    if (!isAdmin) return send(r, 403, { error: 'admin only' });
    targetId = String(forUser);
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(targetId)) return send(r, 400, { error: 'invalid user id' });
    targetName = String(body.user == null ? '' : body.user).slice(0, 60) || '?';
  }
  // Same rule as stats: seeding stays gated on the flag, the user's OWN post is
  // always processed so a stale plain tombstone can heal (andrzej case: the
  // fossil default + the unconditional opt-out DELETE tombstoned users who
  // never chose anything, and with whoReading off nothing could ever lift it).
  if (!eff.whoReading && targetId !== user.id) return send(r, 200, { ok: true, skipped: 'social-off' });

  const store = readProgress();
  pgMigrate(store); // the write below persists it
  const cur = store.users[targetId];
  // adm tombstones block even the user's own re-post, same rule as stats
  if (cur && cur.out && (cur.adm || targetId !== user.id)) {
    return send(r, 200, { ok: true, skipped: 'opted-out' });
  }
  // shareReading is OPT-IN: the seeder may only REFRESH a record the user's own
  // browser created, an absent user has no consent on file to seed from.
  // UPDATE (Pawel flipped the default): shareReading is ON by default now, so
  // absence no longer means refusal and the seeder may fill absent users
  // again. Tombstones (the explicit "no") are still skipped above.
  const reading = pgRows(body.reading, PG_MAX_READING, true);
  const done = pgRows(body.done, PG_MAX_DONE, false);
  store.users[targetId] = {
    user: String(targetName).slice(0, 60),
    reading: reading,
    done: done,
    ts: Date.now()
  };
  try { writeProgress(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true, reading: reading.length, done: done.length });
}

/* ---- Community ratings (#27) --------------------------------------------
   One "what everyone else thinks" score per book, Goodreads numbers fetched
   by browsers through the /_nh/gr/ relay to the abs-tract helper and read by
   everyone. Separate from NanoHive's own user ratings.

     /data/nh/community.json
     { "v": 1, "items": { "<libraryItemId>": {
         "r": 4.05, "n": 127809, "src": "gr", "key": "43587154",
         "url": "https://www.goodreads.com/book/show/43587154-jade-city", "title": "Jade City",
         "by": "Frank Herbert", "at": 1757000000000, "manual": 1 } } }
   A lookup that found nothing is stored as { "miss": 1, "at": ... } so a run
   can skip it and a later run can retry it. */
const COMMUNITY = '/data/nh/community.json';
const COMMUNITY_MAX_BYTES = 6 * 1024 * 1024;
const COMMUNITY_BATCH = 500;

function readCommunity() {
  try {
    const parsed = JSON.parse(fs.readFileSync(COMMUNITY));
    if (parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object') {
      // Goodreads only since v2.6.0: scores from the short-lived Open Library
      // phase are dropped on read, so pages re-fetch them from Goodreads.
      Object.keys(parsed.items).forEach(function (id) {
        var e = parsed.items[id];
        if (e && typeof e.r === 'number' && e.src !== 'gr') delete parsed.items[id];
      });
      return parsed;
    }
  } catch (e) {}
  return { v: 1, items: {} };
}

function writeCommunity(store) {
  const tmp = COMMUNITY + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, COMMUNITY);
}

function cleanCommunityEntry(v) {
  if (!v || typeof v !== 'object') return null;
  const out = { at: Number(v.at) || Date.now() };
  if (v.miss) { out.miss = 1; return out; }
  const rating = Number(v.r), count = Number(v.n);
  if (!(rating >= 0 && rating <= 5) || !(count >= 0) || Math.floor(count) !== count) return null;
  out.r = Math.round(rating * 100) / 100;
  out.n = count;
  out.src = 'gr';
  if (v.key != null) out.key = String(v.key).slice(0, 120);
  if (v.url != null && /^https:\/\/(www\.)?goodreads\.com\//.test(String(v.url))) out.url = String(v.url).slice(0, 300);
  if (v.title != null) out.title = String(v.title).slice(0, 200);
  if (v.by != null) out.by = String(v.by).slice(0, 200);
  if (v.manual) out.manual = 1;
  return out;
}

function community(r) {
  const user = whoami(r);
  if (!user) return send(r, 401, { error: 'not authenticated' });

  if (r.method === 'GET') {
    const store = readCommunity();
    const item = r.args && r.args.item;
    if (item) { // the book page wants one entry, not the whole map
      const one = {};
      if (store.items[item]) one[item] = store.items[item];
      return send(r, 200, { v: 1, items: one });
    }
    return send(r, 200, store);
  }

  if (r.method !== 'POST') {
    r.headersOut['Allow'] = 'GET, POST';
    return send(r, 405, { error: 'method not allowed' });
  }
  // Admin-ness comes from nginx's auth_request against ABS /api/users on the
  // admin twin; the JWT's type claim is not trusted for this.
  const isAdmin = r.variables.nh_community_admin === '1';

  let body;
  try { body = JSON.parse(r.requestText || '{}'); } catch (e) { return send(r, 400, { error: 'bad json' }); }
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'bad body' });

  // Any signed-in user may FILL a gap: a book page that finds no entry looks
  // the score up itself and stores it, so the map grows as people browse. One
  // item per call, never over an existing score or an admin's manual pick, and
  // the entry is validated like everything else. Admins fix mistakes.
  if (!isAdmin) {
    const ids = body.set && typeof body.set === 'object' ? Object.keys(body.set) : [];
    if (body.clear || body.del || ids.length !== 1 || !ITEM_ID_RE.test(ids[0])) return send(r, 403, { error: 'admin only' });
    const store = readCommunity();
    const cur = store.items[ids[0]];
    if (cur && (cur.manual || typeof cur.r === 'number')) return send(r, 409, { error: 'already set' });
    const entry = cleanCommunityEntry(body.set[ids[0]]);
    if (!entry) return send(r, 400, { error: 'bad entry' });
    delete entry.manual;
    store.items[ids[0]] = entry;
    if (JSON.stringify(store).length > COMMUNITY_MAX_BYTES) return send(r, 400, { error: 'store too large' });
    try { writeCommunity(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
    return send(r, 200, { ok: true, set: 1 });
  }

  const store = body.clear === true ? { v: 1, items: {} } : readCommunity();
  let set = 0, del = 0, rejected = 0;
  if (Array.isArray(body.del)) {
    body.del.slice(0, COMMUNITY_BATCH).forEach(function (id) {
      if (ITEM_ID_RE.test(String(id)) && store.items[id]) { delete store.items[id]; del++; }
    });
  }
  if (body.set && typeof body.set === 'object') {
    const ids = Object.keys(body.set).slice(0, COMMUNITY_BATCH);
    ids.forEach(function (id) {
      if (!ITEM_ID_RE.test(id)) { rejected++; return; }
      const entry = cleanCommunityEntry(body.set[id]);
      if (!entry) { rejected++; return; }
      store.items[id] = entry;
      set++;
    });
  }
  const encoded = JSON.stringify(store);
  if (encoded.length > COMMUNITY_MAX_BYTES) return send(r, 400, { error: 'store too large' });
  try { writeCommunity(store); } catch (e) { return send(r, 500, { error: 'write failed' }); }
  send(r, 200, { ok: true, set: set, del: del, rejected: rejected, total: Object.keys(store.items).length });
}

/* Goodreads helper address (#27), evaluated by nginx per request (js_set):
   the admin-saved goodreadsUrl in server-config.json wins, then the
   NH_GOODREADS_UPSTREAM env, else empty = not set up (the relay answers 404). */
function grUpstream(r) {
  try {
    const cfg = JSON.parse(fs.readFileSync('/data/nh/server-config.json'));
    const u = String((cfg && cfg.goodreadsUrl) || '').trim().replace(/\/+$/, '');
    if (/^https?:\/\/[^\s"'<>]+$/.test(u)) return u;
  } catch (e) {}
  const env = String((r.variables && r.variables.nh_gr_env) || '').trim().replace(/\/+$/, '');
  return /^https?:\/\//.test(env) ? env : '';
}

export default { handle, meta, avatar, stats, reports, dates, prefs, progress, social, community, grUpstream };
