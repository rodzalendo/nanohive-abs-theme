# Fix: OIDC login broken behind an outer reverse proxy (X-Forwarded-Proto stomped)

**Repo:** `/opt/src/nanohive-abs-theme` (github.com/rodzalendo/nanohive-abs-theme)
**File to change:** `default.conf.template` (only file touched)
**Release:** shipped in `v1.8.0` (plan originally targeted v1.5.1) — user-visible bugfix

## Bug report

User runs: outer nginx (TLS termination, `https://test.mydomain.tld`) → nanohive-abs-theme container → ABS. Google OIDC login fails with "Invalid callback URL - must be same-origin". ABS log:

```
[OidcAuth] Rejected callback URL to different origin: https://test.mydomain.tld/audiobookshelf/login (expected ...)
[Auth] Rejected invalid callback URL: https://test.mydomain.tld/audiobookshelf/login
```

Login worked before the theme was inserted into the chain. (The user quoted the expected origin as `https://...` but likely retyped it; per the mechanism below the log should read `expected http://test.mydomain.tld` — worth asking them to confirm verbatim.)

## Root cause

`default.conf.template`, `location /` block:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

When the theme container sits behind another reverse proxy, `$scheme` is the scheme the theme container itself was reached with — plain `http`. This **replaces** the outer proxy's `X-Forwarded-Proto: https` on the way to ABS.

ABS validates OIDC callbacks in `server/auth/OidcAuthStrategy.js`, `isValidWebCallbackUrl()` (current `master` of advplyr/audiobookshelf, ~line 515–560). Relevant logic:

- `currentProtocol` = `https` if `req.secure` OR the incoming `x-forwarded-proto` list contains `https`, else `http`
- `currentHost` = `req.get('host')` (we forward `Host $host`, so this survives correctly)
- Absolute callback URL must match `currentProtocol` + `currentHost` exactly, then its pathname must start with `RouterBasePath + '/'`

With our header set to `http`, ABS computes expected origin `http://test.mydomain.tld`, the callback is `https://...` → protocol mismatch → the "different origin" rejection. Direct-access setups (browser → theme container over http, no outer proxy) never hit this because callback and expected origin are both `http`.

The user's `/audiobookshelf` subpath is a red herring: it passes the `RouterBasePath` check (they have `ROUTER_BASE_PATH` set in ABS, it worked pre-theme) and the code never reaches that check anyway — it bails at the protocol comparison first.

## Fix

Forward the incoming `X-Forwarded-Proto` untouched; fall back to `$scheme` only when the header is absent (i.e. the theme container is the edge proxy). Two changes:

**1.** Add after the existing `$connection_upgrade` map at the top of the file:

```nginx
# Preserve the client's original protocol when this container sits behind another
# reverse proxy (outer nginx / NPM / Traefik terminating TLS). $scheme here is how
# THIS container was reached — usually plain http — which would stomp the outer
# proxy's "X-Forwarded-Proto: https" and make ABS reject OIDC callback URLs as
# cross-origin (https callback vs http expected origin). Pass the incoming header
# through untouched; fall back to $scheme only when we are the edge proxy.
map $http_x_forwarded_proto $nh_fwd_proto {
    default $http_x_forwarded_proto;
    ''      $scheme;
}
```

**2.** In `location /`, change:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

to:

```nginx
proxy_set_header X-Forwarded-Proto $nh_fwd_proto;
```

Nothing else. Do NOT touch the `/_nh/admincheck` block (internal auth subrequest, protocol-agnostic). Do NOT change `X-Forwarded-For` ($proxy_add_x_forwarded_for already appends correctly) or `Host` ($host already preserves the incoming header).

Note: ABS splits the header on commas and accepts any list containing `https` ("NPM appends both http and https in x-forwarded-proto sometimes" — comment in ABS source), so pass-through of a comma list is safe.

## Verification

Config syntax already validated with `nginx -t` against a fully `envsubst`-rendered copy — passes. Re-verify after applying:

1. `grep -c nh_fwd_proto default.conf.template` → expect `2` (map declaration + usage; the map's
   `default` line references `$http_x_forwarded_proto`, not `$nh_fwd_proto`)
2. Rebuild the sandbox clone on port 13380 (`/opt/src/nanohive-abs-theme`, volume `nh-theme-test-data:/data/nh`)
3. Edge-proxy behavior unchanged: `curl -sI http://192.168.1.14:13380/login` → 200, page loads, theme scripts inlined
4. Simulate an outer TLS proxy: `curl -s -H 'X-Forwarded-Proto: https' http://192.168.1.14:13380/ping` → then confirm in ABS container logs / a debug endpoint that ABS received `https` (or simply trust the map; nginx behavior here is deterministic)
5. Production OIDC (Pawel's own setup, Cloudflare tunnel → 13378): tunnel already sends `X-Forwarded-Proto: https`, which the old config was ALSO stomping — OIDC isn't used on this instance so it never surfaced. After the fix, normal login and Socket.IO progress sync must still work on `audiobooks.nanohive.online`.

**Verified 2026-07-20** on CT 101 with a header-echo upstream (`mendhak/http-https-echo`) behind
a freshly built theme image: no incoming header → ABS-side sees `http` (edge behavior unchanged);
`X-Forwarded-Proto: https` → `https` (the reporter's case, previously stomped to `http`);
`X-Forwarded-Proto: http,https` → passed through intact (NPM comma-list case).

## Release

Standard cycle: commit in `/opt/src/nanohive-abs-theme` → `git pull --rebase origin main` → push → Actions rebuilds `:latest` → cut tag `v1.5.1` (user-visible fix; testers pin tags, `:latest` doesn't auto-update for them). No JS files change, so no version bumps in core.js/enhancements.js/book-details.js/nh-early.js; bump `THEME_VERSION` default if the Dockerfile/compose carries one for v1.5.1. Update README/CHANGELOG: note that setups with an upstream TLS-terminating proxy + OIDC were broken from the first release through v1.5.0.

## Reply to the bug reporter (draft)

> Good catch — this was our bug. The theme proxy was overwriting `X-Forwarded-Proto` with its own scheme (plain http between your nginx and the container), so ABS computed the expected origin as `http://` and rejected your `https://` callback. Fixed in v1.5.1: the proxy now passes your nginx's `X-Forwarded-Proto` through untouched. Pull `ghcr.io/rodzalendo/nanohive-abs-theme:1.5.1` (or newer) and it should work with no config changes on your side.
