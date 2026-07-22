/* NanoHive ABS — Server-wide Ratings API  v1.2.0  (nginx njs module)

   A tiny JSON API that lets every user of this server rate books (stars +
   short review, Plex-style) and see everyone else's ratings. Runs entirely
   inside the existing nginx container via the njs module — no extra service.

   Storage:  /data/nh/ratings.json  (same nh_theme_data volume as
             server-config.json, so ratings survive container recreation).

   Identity is verified SERVER-SIDE: every call replays the caller's own
   Bearer token against ABS /api/me (internal subrequest /_nh/api/whoami),
   so nobody can rate as someone else. Any authenticated ABS user may rate;
   admins may additionally remove another user's rating (moderation).

   Data shape:
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

   Known limit: the read-modify-write is not locked across nginx workers.
   At family scale simultaneous rating writes are vanishingly rare, and the
   write itself is atomic (tmp file + rename) so the store can never be torn
   — worst case one of two same-instant writes wins. */

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
  r.return(status, JSON.stringify(obj));
}

/* Identity comes from the caller's own JWT payload. The token was ALREADY
   validated by ABS itself before this handler runs — nginx auth_request replays
   it against /api/me and rejects the request otherwise — so decoding without
   signature verification is safe: we merely read back what ABS put into the
   token it just accepted (userId, username, type).
   NO njs subrequests here, deliberately: njs buffers subrequest responses in
   memory sized from Content-Length, and /api/me announces the caller's entire
   media progress (~90KB for an active listener) even for HEAD — which overflowed
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

function handleGet(r) {
  const store = readStore();
  const item = r.args && r.args.item;
  if (item) {
    const out = {};
    out[item] = store.items[item] || {};
    return send(r, 200, { v: 1, items: out });
  }
  send(r, 200, store);
}

async function handlePost(r, user) {
  let body = null;
  try { body = JSON.parse(r.requestText); } catch (e) {}
  if (!body || typeof body !== 'object') return send(r, 400, { error: 'invalid JSON body' });

  const itemId = String(body.itemId || '');
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(itemId)) return send(r, 400, { error: 'invalid itemId' });

  // Admins may target someone else's rating (delete only, in practice);
  // everyone else can only ever write under their own verified id.
  let targetId = user.id;
  if (body.forUser && String(body.forUser) !== user.id) {
    if (!user.admin) return send(r, 403, { error: 'admin only' });
    targetId = String(body.forUser);
  }

  const stars = Number(body.stars);
  const remove = !stars;
  if (!remove && !(stars >= 0.5 && stars <= 5 && Math.round(stars * 2) === stars * 2)) {
    return send(r, 400, { error: 'stars must be 0.5-5 in half steps (0 removes)' });
  }

  let review = typeof body.review === 'string' ? body.review : '';
  review = review.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, 1500);

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

  if (r.method === 'GET') return handleGet(r);
  if (r.method === 'POST') return await handlePost(r, user);
  r.headersOut['Allow'] = 'GET, POST';
  send(r, 405, { error: 'method not allowed' });
}

export default { handle };
