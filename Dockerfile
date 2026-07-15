FROM nginx:alpine

# Theme payload, served at /_nh/ and inlined into HTML via SSI
COPY theme/ /usr/share/nginx/nh-theme/

# Config template processed by the image's built-in envsubst step
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Env-validation guard, runs before substitution (05- prefix)
COPY docker-entrypoint.sh /docker-entrypoint.d/05-check-env.sh
RUN chmod +x /docker-entrypoint.d/05-check-env.sh

# Restrict substitution to OUR vars so nginx's own $host/$http_upgrade survive.
# Every NH_* var below must match this filter or it will be left literal in the
# generated config and the injected JSON will be invalid.
ENV NGINX_ENVSUBST_FILTER="^(ABS_UPSTREAM|THEME_VERSION|NH_[A-Z0-9_]+)$" \
    THEME_VERSION="core3.29.1_enh6.64.0_book1.22.0_early1.3.0"

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
    NH_FOUC_BG="#181512"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/_nh/core.js >/dev/null 2>&1 || exit 1
