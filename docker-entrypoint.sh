#!/bin/sh
# Runs early (05-) inside nginx's /docker-entrypoint.d/ pipeline.
# Validates env before the image's built-in 20-envsubst step renders the template.
set -e

if [ -z "$ABS_UPSTREAM" ]; then
  echo "ERROR: ABS_UPSTREAM is not set (e.g. http://audiobookshelf:80)" >&2
  exit 1
fi

# NH_APP_NAME and NH_LOGO_URL land inside a JSON string literal in the injected
# <script>. A double quote or backslash would produce invalid JSON and the theme
# would fail to read its config, so refuse to start rather than half-work.
case "$NH_APP_NAME$NH_LOGO_URL" in
  *'"'*|*'\'*)
    echo 'ERROR: NH_APP_NAME / NH_LOGO_URL must not contain " or \' >&2
    exit 1
    ;;
esac

for var in NH_SHOW_LOGO_TEXT NH_COLORIZE_LOGO NH_SHOW_RECENT_SERIES; do
  eval "val=\$$var"
  case "$val" in
    true|false) ;;
    *) echo "ERROR: $var must be exactly 'true' or 'false' (got '$val')" >&2; exit 1 ;;
  esac
done

echo "[nanohive-abs-theme] upstream=${ABS_UPSTREAM} version=${THEME_VERSION:-latest} theme=${NH_BASE_THEME} accent=${NH_ACCENT_COLOR}"
