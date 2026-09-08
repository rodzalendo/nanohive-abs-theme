# --- stage 1: minify the theme payload (B1) ---------------------------------
# Every HTML document SSI-inlines all four theme files, so their size is paid on
# every page load. Sources in git stay readable; only the image artifact is
# minified. The `/* NanoHive … vX.Y.Z */` header line of each file is preserved
# so the version stamp is still visible in the served payload.
#   NH_MINIFY=false  ->  ship the sources verbatim (escape hatch for debugging)
FROM node:22-alpine AS themebuild
ARG NH_MINIFY=true
WORKDIR /src
COPY theme/ ./theme/
RUN if [ "$NH_MINIFY" = "true" ]; then \
      npm install --silent --no-audit --no-fund --no-package-lock esbuild@0.24.2 && \
      for f in core.js enhancements.js book-details.js nh-early.js; do \
        # Rebuild the banner as a CLOSED one-line comment. Taking line 1 verbatim
        # is wrong: nh-early.js's header spans several lines, so the copied line
        # opened a comment that then swallowed the whole minified file.
        hdr=$(head -n 1 "theme/$f" | sed 's|/\*||; s|\*/||; s|^ *||; s| *$||'); \
        printf '/* %s */\n' "$hdr" > "/tmp/banner-$f"; \
        ./node_modules/.bin/esbuild "theme/$f" --minify --target=es2020 --charset=utf8 --legal-comments=none --outfile="/tmp/min-$f"; \
        cat "/tmp/banner-$f" "/tmp/min-$f" > "theme/$f"; \
        # A broken artifact must fail the BUILD, not the browser.
        node --check "theme/$f" || exit 1; \
        printf '%-18s %s\n' "$f" "$(wc -c < "theme/$f") bytes"; \
      done; \
    else echo "NH_MINIFY=false - shipping readable sources"; fi

FROM nginx:alpine

# Theme payload, served at /_nh/ and inlined into HTML via SSI
COPY --from=themebuild /src/theme/ /usr/share/nginx/nh-theme/

# Config template processed by the image's built-in envsubst step
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Ratings API (njs). nginx:alpine ships the njs module but does not load it;
# prepend the load_module directive to the main config.
COPY njs/nh-ratings.js /etc/nginx/njs/nh-ratings.js
RUN sed -i '1i load_module modules/ngx_http_js_module.so;' /etc/nginx/nginx.conf

# Env-validation guard, runs before substitution (05- prefix)
COPY docker-entrypoint.sh /docker-entrypoint.d/05-check-env.sh
RUN chmod +x /docker-entrypoint.d/05-check-env.sh

# Restrict substitution to OUR vars so nginx's own $host/$http_upgrade survive.
# Every NH_* var below must match this filter or it will be left literal in the
# generated config and the injected JSON will be invalid.
ENV NGINX_ENVSUBST_FILTER="^(ABS_UPSTREAM|THEME_VERSION|NH_[A-Z0-9_]+)$" \
    THEME_VERSION="core3.139.0_enh6.233.0_book1.55.0_early1.9.0_njs1.27.0"

# --- Default appearance. Each user can override any of these in the in-app
# --- settings panel (gear icon); their choice is stored per-browser.
ENV NH_APP_NAME="" \
    NH_SHOW_LOGO_TEXT="true" \
    NH_COLORIZE_LOGO="false" \
    NH_LOGO_URL="" \
    NH_ACCENT_COLOR="#e0c27a" \
    NH_BASE_THEME="warm" \
    NH_MAIN_FONT="Merriweather" \
    NH_FONT_SCALE="1.0" \
    NH_CAROUSEL_TIMING="15" \
    NH_SHOW_RECENT_SERIES="true" \
    NH_RECENT_SERIES_COUNT="12" \
    NH_CUSTOM_SERIES_CARDS="true" \
    NH_SHOW_HERO_CAROUSEL="true" \
    NH_SHOW_RATINGS="true" \
    NH_GLOBAL_SEARCH="true" \
    NH_SOCIAL="" \
    NH_HC_UPSTREAM="https://api.hardcover.app/v1/graphql" \
    NH_PROXY_BUFFER_SIZE="16k" \
    NH_GOODREADS_UPSTREAM="" \
    NH_FOUC_BG="#181512"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/_nh/core.js >/dev/null 2>&1 || exit 1
