/* NanoHive ABS — Core Theme & Player  v3.27.61  (injected build) */

(function () {
  'use strict';

  function bumpPersonalized(url) {
    try {
      if (typeof url === 'string' && url.includes('/personalized')) {
        const u = new URL(url, window.location.origin);
        const cur = parseInt(u.searchParams.get('limit') || '0', 10);
        if (!cur || cur < 25) u.searchParams.set('limit', '25');
        return u.toString();
      }
    } catch (e) {}
    return url;
  }
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      let url = typeof input === 'string' ? input : (input && input.url);
      const bumped = bumpPersonalized(url);
      if (bumped !== url) input = (typeof input === 'string') ? bumped : new Request(bumped, input);
    } catch (e) {}
    return origFetch.call(this, input, init);
  };
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    try { arguments[1] = bumpPersonalized(url); } catch (e) {}
    return origOpen.apply(this, arguments);
  };

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap';

  const css = `
:root {
  --nh-bg-rgb:        24, 21, 18;
  --nh-canvas:        #181512;
  --nh-rail:          #120f0d;
  --nh-raised:        #221e1a;
  --nh-raised-hover:  #2d2925;
  --nh-amber:         #e0c27a;
  --nh-amber-hover:   #eccf91;
  --nh-amber-tint:    rgba(224, 194, 122, 0.12);
  --nh-amber-shadow:  rgba(224, 194, 122, 0.30);
  --nh-appbar-bg:     rgba(24, 21, 18, 0.70);
  --nh-text-1:        #f4eee2;
  --nh-text-2:        #d8cfc2;
  --nh-text-3:        #cfc6ba;
  --nh-muted:         #9a9085;
  --nh-muted-2:       #8a8075;
  --nh-icon-base:     #a89f94;
  --nh-serif:         "Spectral", Georgia, serif;
  --nh-sans:          system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --nh-hairline:      rgba(255,255,255,0.06);
  --nh-hairline-lit:  rgba(255,255,255,0.14);
  --nh-font-scale:    1;

  --color-info: var(--nh-amber) !important;
  --color-success: var(--nh-amber) !important;
  --color-accent: var(--nh-amber) !important;
  --nh-logo-url: url('/audiobookshelf/_nuxt/img/icon.d3d4aef.svg');
}

/* Global Font Size Scaling */
html { font-size: calc(16px * var(--nh-font-scale)) !important; }

.bg-bg { background-color: var(--nh-canvas) !important; }
.bg-primary, .bg-fg { background-color: var(--nh-raised) !important; }
.text-yellow-400, .text-accent { color: var(--nh-amber) !important; }
.bg-yellow-400, .bg-accent { background-color: var(--nh-amber) !important; }
.border-yellow-400, .border-accent { border-color: var(--nh-amber) !important; }
.text-yellow-300 { color: var(--nh-amber-hover) !important; }
.text-gray-400 { color: var(--nh-muted-2) !important; }
.text-gray-300 { color: var(--nh-text-3) !important; }
.text-gray-200, .text-gray-100, .text-gray-50 { color: var(--nh-text-2) !important; }
.bg-info { background-color: var(--nh-amber) !important; color: #000 !important; }
.text-info { color: var(--nh-amber) !important; }

/* FIX TRANSPARENCY SO BLUR WORKS natively without breaking scrolling */
html, body { background-color: var(--nh-canvas) !important; font-family: var(--nh-sans); }
#__nuxt, #__layout, .text-white.h-screen.bg-bg, #page-wrapper, #app-content, #app-content > *, #app-content .page > *, [id^="bookshelf"], [id^="bookshelf"] > div:not(.fixed), [id^="bookshelf"] [id^="shelf-"] {
  background-color: transparent !important; background-image: none !important;
}

/* ============ AMBIENT BLURRY BACKGROUND ============ */
#__layout::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: -2;
    background-color: var(--nh-canvas);
    background-image:
        radial-gradient(circle at 80% 0%, var(--nh-amber-shadow) 0%, transparent 70%),
        radial-gradient(circle at 20% 100%, rgba(var(--nh-bg-rgb), 1) 0%, var(--nh-canvas) 80%);
    pointer-events: none;
}
body.nh-cinematic #__layout::before, body.nh-cinematic-item #__layout::before {
    display: none !important;
}

/* ============ CORE SPACING ============ */
#app-content.has-siderail { margin-left: 80px !important; width: calc(100% - 80px) !important; }

/* HEIGHT ARITHMETIC (from ABS source, layouts/default.vue + assets/app.css):
   Native: appbar is IN FLOW (h-16), so ABS ships .page = calc(100% - 64px) and
   #bookshelf = calc(100% - 40/80px) to compensate for appbar + in-flow toolbar.
   This theme overlays both (appbar fixed below; toolbar wrapper collapsed to 0x0,
   #toolbar fixed), so those native subtractions become pure error: the old
   height:110% hack overshot the shell (the scroll "lip"), and the native -80px
   left a dead band. With overlays, every layer is exactly 100%; clearance comes
   from the padding-tops below (all elements are border-box via Tailwind preflight). */
.page {
  height: 100% !important;
  max-height: 100% !important;
  padding-left: 0px !important;
  margin-left: 0px !important;
  padding-bottom: 0px !important;
}
#bookshelf { height: 100% !important; max-height: 100% !important; }

/* Pushing content safely below the Appbars natively */
/* height:100% + content-box means padding-top is ADDED to the scroll height, so you can
   scroll past the content into a dead strip the size of the padding. Contain it. */
#bookshelf, #app-content .page { box-sizing: border-box !important; }
#bookshelf { padding-top: 75px !important; }
body.nh-has-toolbar #bookshelf { padding-top: 115px !important; }
body.nh-home #bookshelf { padding-top: 82px !important; }

.configContent { padding-top: 80px !important; }
body.nh-pad-page #app-content .page { padding-top: 75px !important; }
#item-page-wrapper { padding-top: 80px !important; }

/* ============ SCROLLBAR STYLING ============ */
#bookshelf, .page, .overflow-y-auto, .overflow-x-auto, .overflow-y-scroll, .overflow-x-scroll { scrollbar-color: var(--nh-amber) transparent !important; }
::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb { background: var(--nh-amber) !important; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover { background: var(--nh-amber-hover) !important; }

/* ============ TOP APPBAR (FROSTED) ============ */
#__layout > div > div.h-16.bg-primary:first-child {
    position: fixed !important; top: 0; left: 0; width: 100%; z-index: 60;
    background-color: rgba(var(--nh-bg-rgb), 0.45) !important;
    backdrop-filter: blur(28px) saturate(150%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
    border-bottom: 1px solid var(--nh-hairline-lit) !important;
    transition: none !important;
}
#__layout > div > div.h-16:first-child {
    background-color: rgba(var(--nh-bg-rgb), 0.45) !important;
    backdrop-filter: blur(28px) saturate(150%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
    transition: none !important;
}
#appbar { background: transparent !important; border: none !important; box-shadow: none !important; }

/* App Name Alignment & Styling */
#appbar a[href$="/"] { display: flex !important; align-items: center !important; height: 100% !important; text-decoration: none !important; }
#appbar h1 { font-family: var(--nh-serif); font-weight: 500; margin: 0 !important; margin-right: 1.5rem !important; margin-top: 2px !important; line-height: 1 !important; text-decoration: none !important; }
#appbar a:hover, #appbar a:hover h1 { text-decoration: none !important; }

[data-v-c2b8406a] > button, [data-v-7254587f] input, a[href$="/account"] {
  background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid var(--nh-hairline-lit) !important; border-radius: 11px !important; color: var(--nh-text-2) !important;
}
[data-v-7254587f] input:focus { background-color: rgba(255, 255, 255, 0.1) !important; border-color: var(--nh-amber) !important; }

/* CSS-Only Logo Colorizer — class added by enhancements.js to the specific <a> tag */
.nh-logo-colorized img { display: none !important; opacity: 0 !important; }
.nh-logo-colorized::before {
  content: ''; display: inline-block;
  width: 32px; min-width: 32px; height: 32px; margin-right: 8px;
  background-color: var(--nh-amber) !important;
  -webkit-mask: var(--nh-logo-url) no-repeat center / contain;
  mask: var(--nh-logo-url) no-repeat center / contain;
}
@media (min-width: 640px) { .nh-logo-colorized::before { width: 40px; min-width: 40px; height: 40px; margin-right: 16px; } }

/* ============ TOOLBAR MANAGER ============ */

/* Nullify the parent wrapper so the fixed toolbars aren't constricted */
#app-content .page > div.relative:has(> #toolbar) {
    position: static !important; width: 0 !important; height: 0 !important;
    margin: 0 !important; padding: 0 !important;
    border: none !important; background: transparent !important;
    box-shadow: none !important;
}

/* LIBRARY / SERIES PAGE TOOLBAR (FROSTED) */
#toolbar.nh-frosted-toolbar {
  position: fixed !important;
  top: 65px !important;
  left: 80px !important;
  right: 0 !important;
  width: auto !important;
  height: 50px !important;
  z-index: 45 !important;
  background-color: rgba(var(--nh-bg-rgb), 0.45) !important;
  backdrop-filter: blur(28px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
  margin: 0 !important;
  padding-left: calc(max(24px, 50vw - 800px)) !important;
  padding-right: calc(max(24px, 50vw - 800px)) !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--nh-hairline-lit) !important;
  display: flex !important;
  align-items: center !important;
}

/* Unify library toolbar filter/sort controls with the top-menu search/selector pill style */
#toolbar.nh-frosted-toolbar button {
  background-color: rgba(255,255,255,0.05) !important;
  border: 1px solid var(--nh-hairline-lit) !important;
  border-radius: 11px !important;
  color: var(--nh-text-2) !important;
  padding: 5px 12px !important;
  transition: background-color .15s, border-color .15s, color .15s !important;
}
#toolbar.nh-frosted-toolbar button:hover {
  background-color: rgba(255,255,255,0.10) !important;
  border-color: var(--nh-amber) !important;
  color: var(--nh-text-1) !important;
}

/* HOME PAGE TOOLBAR (TRANSPARENT PUSH) */
#toolbar.nh-home-toolbar {
  position: fixed !important;
  top: 64px !important;
  left: 80px !important;
  right: 0 !important;
  width: auto !important;
  height: 50px !important;
  z-index: 45 !important;
  margin: 0 !important;
  padding-left: calc(max(24px, 50vw - 800px)) !important;
  padding-right: calc(max(24px, 50vw - 800px)) !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0) !important;
  display: flex !important;
  align-items: center !important;
  padding-top: 10px !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  border: none !important;
  transition: opacity 0.25s ease !important;
}
#toolbar.nh-home-toolbar.nh-toolbar-scrolled {
  opacity: 0 !important;
  pointer-events: none !important;
}

@media (max-width: 768px) {
    #toolbar.nh-frosted-toolbar, #toolbar.nh-home-toolbar { left: 0 !important; }
}

/* ============ FILTER & SORT DROPDOWN MENUS (FROSTED) ============ */
div.libraryFilterMenu, div.librarySortMenu, div[role="menu"], div.librariesDropdownMenu, div.globalSearchMenu {
    background-color: rgba(var(--nh-bg-rgb), 0.97) !important;
    backdrop-filter: blur(20px) saturate(140%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
    border: 1px solid var(--nh-hairline-lit) !important;
    box-shadow: 0 12px 34px rgba(0,0,0,0.65) !important;
    z-index: 110 !important;
}
div.libraryFilterMenu .bg-bg, div.librarySortMenu .bg-bg, div.libraryFilterMenu ul, div.librarySortMenu ul {
    background-color: transparent !important;
}
.modal [class*="bg-linear-to-t"] { display: none !important; }

/* ============ ZOOM BUTTON FROSTED ============ */
div.fixed.right-4.z-50 > div { background-color: rgba(var(--nh-bg-rgb), 0.4) !important; backdrop-filter: blur(24px) saturate(135%) !important; -webkit-backdrop-filter: blur(24px) saturate(135%) !important; border: 1px solid var(--nh-hairline-lit) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.60) !important; color: var(--nh-text-1) !important; }
div.fixed.right-4.z-50 > div span.material-symbols { color: var(--nh-text-2) !important; transition: color 0.2s; }
div.fixed.right-4.z-50 > div span.material-symbols:hover { color: var(--nh-amber) !important; }

/* ============ LEFT NAV RAIL ============ */
[aria-label="Library Sidebar"], [aria-label="Config Navigation"] { background-color: var(--nh-rail) !important; border-right: 1px solid var(--nh-hairline) !important; box-shadow: none !important; height: 100%; }
#siderail-buttons-container a, [aria-label="Config Navigation"] a { color: var(--nh-muted-2) !important; border-bottom: none !important; background-color: transparent !important; margin: 2px 6px; border-radius: 12px; transition: background-color .15s, color .15s; }
#siderail-buttons-container a { height: 4rem !important; }

#siderail-buttons-container a span.material-symbols, #siderail-buttons-container a span.abs-icons, [aria-label="Config Navigation"] a span.material-symbols {
  font-size: 1.6rem !important; color: var(--nh-icon-base) !important; transition: color 0.15s ease;
}

#siderail-buttons-container a p, #siderail-buttons-container a .truncate, #siderail-buttons-container a > span:not(.material-symbols):not(.abs-icons) { font-size: 0.72rem !important; line-height: 1.1 !important; letter-spacing: 0.01em !important; margin-top: 3px !important; }
[aria-label="Config Navigation"] a { width: calc(100% - 12px) !important; border-radius: 10px !important; height: 2.6rem !important; border-color: var(--nh-hairline) !important; }

#siderail-buttons-container a:hover, [aria-label="Library Sidebar"] a:hover, [aria-label="Config Navigation"] a:hover { background-color: rgba(255,255,255,0.06) !important; color: var(--nh-text-1) !important; }
#siderail-buttons-container a:hover span, [aria-label="Config Navigation"] a:hover span { color: var(--nh-text-1) !important; }

#siderail-buttons-container a.nuxt-link-exact-active, [aria-label="Config Navigation"] a.nuxt-link-exact-active, [aria-label="Config Navigation"] a[aria-current="page"] { background-color: var(--nh-amber-tint) !important; color: var(--nh-amber) !important; }
#nh-gear-btn { background: transparent !important; color: var(--nh-text-2, #d8cfc2) !important; transition: color 0.15s, background-color 0.15s; }
#nh-gear-btn:hover { background: rgba(255,255,255,0.05) !important; color: var(--nh-amber) !important; }
[aria-label="Config Navigation"] a.nuxt-link-exact-active p, [aria-label="Config Navigation"] a[aria-current="page"] p { color: var(--nh-amber) !important; }
#siderail-buttons-container a.nuxt-link-exact-active span, [aria-label="Config Navigation"] a.nuxt-link-exact-active span, [aria-label="Config Navigation"] a[aria-current="page"] span { color: var(--nh-amber) !important; }
#siderail-buttons-container a > div.bg-yellow-400, [aria-label="Config Navigation"] a > div.bg-yellow-400 { display: none !important; }
[aria-label="Library Sidebar"] .border-t { border-color: var(--nh-hairline) !important; }

[aria-label="Library Sidebar"] .absolute.-right-4, [aria-label="Config Navigation"] .absolute.-right-4 { display: none !important; }

[id^="shelf-"] > div.box-shadow-book { background-color: transparent !important; box-shadow: none !important; }
[id^="cover-area-"] { border-radius: 14px !important; box-shadow: 0 10px 26px rgba(0,0,0,0.40) !important; }
[id^="cover-area-"] img, [id^="cover-area-"] > div { border-radius: 14px !important; }
[cy-id="title"] { font-family: var(--nh-serif) !important; font-weight: 500; color: var(--nh-text-2) !important; }
[cy-id="subtitle"], [cy-id="line2"], [cy-id="line3"] { color: var(--nh-muted-2) !important; }
[cy-id="progressBar"] { box-shadow: none !important; }

/* Finished books on shelves: the 100%-width bar carries no information, so hide it and
   mark the card with a small check badge (mirrors the detail-page read toggle).
   Cards are tagged .nh-finished by nhTagFinished() in enhancements.js, which inspects
   [cy-id="progressBar"] directly — resilient to ABS class-chain changes (h-1e vs h-1.5). */
[id^="cover-area-"].nh-finished [cy-id="progressBar"], [cy-id="card"].nh-finished [cy-id="progressBar"] { display: none !important; }
[id^="cover-area-"].nh-finished::after, [cy-id="card"].nh-finished::after {
  content: '✓'; position: absolute; bottom: 0.375em; left: 0.375em; z-index: 30;
  width: 1.35em; height: 1.35em; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: rgba(16,13,10,0.72); color: var(--nh-amber);
  border: 1px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  font-weight: 700; font-size: 0.78em; line-height: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.45);
}
.bookshelf-row h2 { font-family: var(--nh-serif) !important; font-weight: 500 !important; font-size: 1.55rem !important; letter-spacing: -0.01em; color: var(--nh-text-1) !important; }

[cy-id="leftScrollButton"]:hover, [cy-id="rightScrollButton"]:hover { color: var(--nh-amber) !important; background-color: var(--nh-amber-tint) !important; }

/* Drawer and backdrop are built in JS at every viewport, but all their styling lives in
   the max-width:640px block. Above that they'd otherwise be unstyled divs in normal flow,
   dumping the nav links as plain text at the bottom of the page. The mobile block's own
   display:flex / display:block override these. */
#nh-mobile-drawer, #nh-menu-backdrop { display: none; }

/* ============ SERIES & COLLECTION CARDS ============ */
/* Baseline geometry (196/196/168/12/24) proven on this ABS build; this build does NOT
   put inline heights on covers-area (that's why the fixed height exists). Scaling comes
   only from the vars, driven by user/getSizeMultiplier in enhancements.js, normalized so
   slider=100 reproduces the baseline exactly. Fallbacks = frozen baseline. */
[cy-id="card"][id^="series-card-"] { width: var(--nh-series-w, 196px) !important; }
[cy-id="covers-area"] { height: var(--nh-series-w, 196px) !important; overflow: visible !important; }
[cy-id="item"] { overflow: visible !important; }
[cy-id="covers-area"] > div:not([cy-id]) { background: transparent !important; box-shadow: none !important; overflow: visible !important; }
[cy-id="covers-area"] .bg-primary { background: transparent !important; }
[cy-id="covers-area"] .bg-primary > .relative { width: 100% !important; }
[id^="group-cover-"] { overflow: visible !important; box-shadow: none !important; }
[id^="group-cover-"] > div { left: 0 !important; top: 0 !important; width: var(--nh-series-cover, 168px) !important; height: var(--nh-series-cover, 168px) !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 10px 24px rgba(0,0,0,0.42) !important; transition: filter .2s ease, box-shadow .2s ease !important; }
[cy-id="card"][id^="series-card-"]:hover [id^="group-cover-"] > div:nth-child(1) { filter: brightness(0.7) !important; box-shadow: 0 10px 24px rgba(0,0,0,0.42) !important; }
[id^="group-cover-"] > div img { border-radius: 12px !important; }
[id^="group-cover-"] > div:nth-child(1) { transform: translate(0,0) !important; z-index: 3 !important; }
[id^="group-cover-"] > div:nth-child(2) { transform: translate(var(--nh-series-off1, 12px),var(--nh-series-off1, 12px)) !important; z-index: 2 !important; filter: brightness(0.78) !important; }
[id^="group-cover-"] > div:nth-child(3) { transform: translate(var(--nh-series-off2, 24px),var(--nh-series-off2, 24px)) !important; z-index: 1 !important; filter: brightness(0.60) !important; }
[id^="group-cover-"] > div:nth-child(n+4) { display: none !important; }
[cy-id="seriesLengthMarker"] { left: 0.375em !important; right: auto !important; background-color: rgba(255,255,255,0.55) !important; backdrop-filter: blur(10px) brightness(1.2) saturate(1.05) !important; -webkit-backdrop-filter: blur(10px) brightness(1.2) saturate(1.05) !important; border: 1px solid rgba(255,255,255,0.35) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important; z-index: 5 !important; }
[cy-id="seriesLengthMarker"] p { color: #000000 !important; font-weight: 700 !important; font-family: var(--nh-sans) !important; }
[cy-id="hoveringDisplayTitle"] { display: none !important; }
[id^="series-card-"] p:not([role="status"]), [id^="series-card-"] .truncate, [cy-id="detailBottomDisplayTitle"], [id^="collection-card-"] p, [id^="collection-card-"] .truncate { font-family: var(--nh-serif) !important; font-weight: 500 !important; color: var(--nh-text-2) !important; }

[id^="collection-card-"] .bg-primary.rounded-sm { border-radius: 14px !important; overflow: hidden !important; box-shadow: 0 10px 26px rgba(0,0,0,0.40) !important; }
[id^="collection-card-"] .bg-primary.rounded-sm > .rounded-xs { border-radius: 14px !important; }
[id^="collection-card-"] .flex > .rounded-xs { border-radius: 0 !important; }
[id^="collection-card-"] .box-shadow-book { box-shadow: 0 10px 26px rgba(0,0,0,0.40) !important; }

/* ============ NARRATORS PAGE ============ */
[id^="narrator-card-"], [id^="author-card-"] { background-color: var(--nh-raised) !important; border: 1px solid var(--nh-hairline) !important; border-radius: 16px !important; box-shadow: 0 8px 22px rgba(0,0,0,0.35) !important; transition: transform .2s ease, border-color .2s ease, background-color .2s ease !important; overflow: hidden !important; }
[id^="narrator-card-"]:hover, [id^="author-card-"]:hover { background-color: var(--nh-raised-hover) !important; border-color: var(--nh-hairline-lit) !important; transform: translateY(-3px) !important; }
[id^="narrator-card-"] p, [id^="author-card-"] p { font-family: var(--nh-serif) !important; color: var(--nh-text-2) !important; }
[id^="narrator-card-"] .text-gray-400, [id^="author-card-"] .text-gray-400 { font-family: var(--nh-sans) !important; color: var(--nh-muted-2) !important; }

#app-content .page .max-w-6xl { max-width: min(96%, 1500px) !important; margin-left: auto !important; margin-right: auto !important; }
#item-page-wrapper a.nh-goodreads-btn { text-decoration: none !important; }
#item-page-wrapper a.nh-goodreads-btn img { width: 26px !important; height: 26px !important; border-radius: 6px !important; display: block !important; }

/* ============ OVERRIDING DETAILS PAGE TYPOGRAPHY & BUTTONS ============ */
/* Read button (ebook attached, bg-info) matches the Play button */
body #page-wrapper #item-page-wrapper button.abs-btn.bg-info,
body #page-wrapper #item-page-wrapper button.abs-btn.bg-success,
body #page-wrapper #item-page-wrapper button[aria-label="Play"].bg-success {
    background-color: var(--nh-amber) !important; color: #14110d !important;
    border-color: transparent !important; box-shadow: 0 8px 20px var(--nh-amber-shadow) !important; transition: all 0.2s !important;
}
body #page-wrapper #item-page-wrapper button.abs-btn.bg-info:hover,
body #page-wrapper #item-page-wrapper button.abs-btn.bg-success:hover {
    box-shadow: 0 10px 24px var(--nh-amber-shadow) !important; transform: translateY(-1px) !important;
}
body #page-wrapper #item-page-wrapper button.abs-btn.bg-info * { color: #14110d !important; }
body #page-wrapper #item-page-wrapper button.abs-btn.bg-success * { color: #14110d !important; }

/* Kill the ABS corner artifacts on 'Playing' button hover states */
body #page-wrapper #item-page-wrapper button.abs-btn.bg-info::before,
body #page-wrapper #item-page-wrapper button.abs-btn.bg-info::after,
body #page-wrapper #item-page-wrapper button.abs-btn.bg-success::before,
body #page-wrapper #item-page-wrapper button.abs-btn.bg-success::after { display: none !important; }
body #page-wrapper #item-page-wrapper .w-full.my-2.mt-6 .abs-btn::before { border-radius: 8px !important; }

/* Restyle the user's injected progress bar natively to match theme */
body #nh-custom-progress > div:first-child > div {
    background-color: var(--nh-amber) !important; box-shadow: 0 0 10px var(--nh-amber-shadow) !important;
}

#page-wrapper #item-page-wrapper h1 { font-size: clamp(1.4rem, 6vw, 2.75rem) !important; margin-bottom: 8px !important; }
#item-page-wrapper .w-full.my-2.mt-6 .abs-btn { background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; color: var(--nh-text-2) !important; box-shadow: none !important; border-radius: 8px !important; transition: background-color 0.2s, color 0.2s !important; }
#item-page-wrapper .w-full.my-2.mt-6 .abs-btn:hover { background-color: rgba(255, 255, 255, 0.12) !important; color: #ffffff !important; }

/* ============ CINEMATIC BACKGROUND ============ */
#nh-cinematic-bg { display: none !important; }
#nh-home-bg { position: fixed !important; top: -10%; left: -10%; right: -10%; bottom: -10%; z-index: -1 !important; pointer-events: none !important; opacity: 0; transition: opacity 1.6s ease !important; }
#nh-home-bg .nh-bg-layer { position: absolute !important; inset: 0 !important; background-size: cover !important; background-position: center !important; filter: blur(55px) brightness(0.45) saturate(1.35) !important; opacity: 0; transition: opacity 2.8s ease !important; will-change: opacity, transform; animation: nh-breathe 20s ease-in-out infinite alternate; }
@keyframes nh-breathe { 0% { transform: scale(1.0); } 100% { transform: scale(1.2); } }
#nh-home-bg::after { content: ''; position: absolute; inset: 0; z-index: 2; background: linear-gradient(180deg, rgba(var(--nh-bg-rgb), 0.5) 0%, rgba(var(--nh-bg-rgb), 0.8) 55%, rgb(var(--nh-bg-rgb)) 100%) !important; }
body.nh-cinematic-item #nh-home-bg .nh-bg-layer { filter: blur(55px) brightness(0.62) saturate(1.3) !important; }
body.nh-cinematic-item #nh-home-bg::after { background: linear-gradient(180deg, rgba(var(--nh-bg-rgb), 0.3) 0%, rgba(var(--nh-bg-rgb), 0.6) 55%, rgb(var(--nh-bg-rgb)) 100%) !important; }

body.nh-cinematic, body.nh-cinematic #__nuxt, body.nh-cinematic #__layout, body.nh-cinematic .text-white.h-screen.bg-bg, body.nh-cinematic #page-wrapper, body.nh-cinematic #app-content, body.nh-cinematic #app-content > *, body.nh-cinematic #app-content .page, body.nh-cinematic #app-content .page > *, body.nh-cinematic #item-page-wrapper, body.nh-cinematic #item-page-wrapper > *, body.nh-cinematic [id^="bookshelf"], body.nh-cinematic [id^="bookshelf"] > div:not(.fixed), body.nh-cinematic [id^="shelf-"], body.nh-cinematic .bookshelf-row, body.nh-cinematic [aria-label="Library Sidebar"] { background-color: transparent !important; background-image: none !important; }

/* Settings pages: let the cinematic background show through (cards keep their own surface) */
body.nh-cinematic .configContent, body.nh-cinematic .configContent > *:not(.bg-bg):not([class*="rounded"]) { background-color: transparent !important; background-image: none !important; }

/* ============ EREADER SETTINGS EXTENSION (nhEreaderModal) ============ */
.nh-er-sep { height: 1px; background: rgba(255,255,255,0.12); margin: 18px 0 14px; }
.nh-er-title { font-family: var(--nh-serif), Georgia, serif; color: var(--nh-amber, #e0c27a); font-size: 1.05rem; letter-spacing: 0.04em; margin: 0 0 12px; }
.nh-er-preview { border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; padding: 12px 16px; margin: 0 0 16px; line-height: 1.5; }
.nh-er-preview .nh-er-aa { font-size: 1.6rem; font-weight: 600; margin-right: 12px; vertical-align: -2px; }
.nh-er-row { display: flex; align-items: flex-start; margin-bottom: 14px; }
.nh-er-row .nh-er-lab { width: 10rem; flex: 0 0 10rem; padding-top: 5px; }
.nh-er-ctl { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.nh-er-chip { border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 5px 12px; background: rgba(255,255,255,0.04); cursor: pointer; font-size: 0.9rem; color: var(--nh-text-2, #ddd); line-height: 1.3; }
.nh-er-chip:hover { background: rgba(255,255,255,0.1); }
.nh-er-chip.sel { border-color: var(--nh-amber, #e0c27a); color: var(--nh-amber, #e0c27a); box-shadow: 0 0 0 1px var(--nh-amber, #e0c27a); }
.nh-er-tile { min-width: 86px; text-align: center; }
.nh-er-tile.sel { color: inherit; }
.nh-er-swatch { width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; padding: 0; flex: 0 0 auto; }
.nh-er-swatch.sel { box-shadow: 0 0 0 2px var(--nh-amber, #e0c27a); }
input.nh-er-color { width: 36px; height: 26px; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; background: transparent; padding: 0 2px; cursor: pointer; }

/* ============ MODALS & TABLES ============ */
.modal.modal-bg { background-color: rgba(14,11,7,0.55) !important; backdrop-filter: blur(2px) !important; -webkit-backdrop-filter: blur(2px) !important; }
.modal.modal-bg .bg-bg { background-color: var(--nh-canvas) !important; }
.modal [style*="max-height: 80vh"], .modal .overflow-y-auto, .modal .overflow-y-scroll { max-height: 85vh !important; }
.modal trix-editor, .modal .trix-content { min-height: 240px !important; }

.configContent .bg-bg.rounded-md { background-color: var(--nh-raised) !important; border: 1px solid var(--nh-hairline) !important; border-radius: 16px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.30) !important; }
.configContent h1 { font-size: 1.6rem !important; }
.configContent h2.font-semibold { font-family: var(--nh-serif) !important; color: var(--nh-amber) !important; font-size: 1.1rem !important; font-weight: 600 !important; letter-spacing: 0.01em !important; }
button[role="checkbox"] { border-color: var(--nh-hairline) !important; }

#app-content table { width: 100% !important; border-collapse: collapse !important; }
#app-content table th { text-transform: uppercase !important; font-size: 0.72rem !important; letter-spacing: 0.08em !important; color: var(--nh-muted-2) !important; border-bottom: 1px solid var(--nh-hairline) !important; padding: 12px 10px !important; background: transparent !important; text-align: left !important; font-weight: 600 !important; }
#app-content table td { padding: 12px 10px !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; color: var(--nh-text-2) !important; background: transparent !important; }
#app-content table tr { background: transparent !important; }
#app-content table tr:hover td { background: rgba(255,255,255,0.04) !important; }

.page.streaming, #app-content .page.streaming, #ab-page-wrapper.streaming { height: 100% !important; max-height: none !important; padding-bottom: 0px !important; box-sizing: border-box !important; }

/* FLOATING FROSTED PLAYER (Matches Appbar) */
#mediaPlayerContainer { pointer-events: auto !important; position: fixed !important; left: 0 !important; right: 0 !important; margin-left: auto !important; margin-right: auto !important; width: min(94%, 1080px) !important; bottom: 24px !important; height: auto !important; padding-bottom: 12px !important; padding-top: 8px !important; z-index: 50 !important; background-color: rgba(var(--nh-bg-rgb), 0.4) !important; backdrop-filter: blur(28px) saturate(150%) !important; -webkit-backdrop-filter: blur(28px) saturate(150%) !important; border-radius: 20px !important; border: 1px solid var(--nh-hairline-lit) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.60) !important; }
#mediaPlayerContainer > div { background: transparent !important; box-shadow: none !important; }
#mediaPlayerContainer .text-gray-400, #mediaPlayerContainer .text-gray-300, #mediaPlayerContainer .text-gray-200, #mediaPlayerContainer .text-gray-100, #mediaPlayerContainer .text-gray-50, #mediaPlayerContainer p, #mediaPlayerContainer a, #mediaPlayerContainer span { color: #ffffff !important; text-shadow: 0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6) !important; }
#mediaPlayerContainer .bg-white, #mediaPlayerContainer .bg-white * { color: #14110d !important; text-shadow: none !important; }
#mediaPlayerContainer img.rounded-xs, #mediaPlayerContainer .rounded-xs { height: 60px !important; width: 60px !important; min-width: 60px !important; max-width: 60px !important; border-radius: 12px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
#mediaPlayerContainer a[href*="/item/"] { font-family: var(--nh-serif) !important; font-weight: 500 !important; font-size: 1.15rem !important; }
#mediaPlayerContainer button[aria-label="Play"], #mediaPlayerContainer button[aria-label="Pause"] { box-shadow: 0 0 22px var(--nh-amber-shadow), 0 4px 14px rgba(0,0,0,0.45) !important; }
#mediaPlayerContainer button[aria-label="Play"] span, #mediaPlayerContainer button[aria-label="Pause"] span { color: #14110d !important; text-shadow: none !important; }
#mediaPlayerContainer .flex.items-center.justify-center.cursor-pointer.h-full { border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 9px !important; padding: 3px 12px !important; background-color: rgba(0,0,0,0.4) !important; }
#mediaPlayerContainer .bg-gray-700 { box-shadow: 0 2px 6px rgba(0,0,0,0.6) !important; }
#mediaPlayerContainer .bg-gray-700 .bg-gray-200 { background-color: var(--nh-amber) !important; }
#mediaPlayerContainer .modal { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
#mediaPlayerContainer .modal * { text-shadow: none !important; }
#mediaPlayerContainer .modal .text-gray-300, #mediaPlayerContainer .modal .text-gray-400 { color: var(--nh-text-2) !important; }
body:has(#mediaPlayerContainer) [aria-label="Library Sidebar"] .border-t { display: none !important; }

.modal-bg .bg-bg { background-color: var(--nh-canvas) !important; }
.box-shadow-md, .box-shadow-lg { box-shadow: none !important; }
h1, h2, h3, h4, #app-content .text-xl:not(.material-symbols):not(.abs-icons), #app-content .text-2xl:not(.material-symbols):not(.abs-icons), #app-content .text-3xl:not(.material-symbols):not(.abs-icons), #app-content .text-4xl:not(.material-symbols):not(.abs-icons), #app-content .text-5xl:not(.material-symbols):not(.abs-icons) { font-family: var(--nh-serif) !important; font-weight: 500 !important; letter-spacing: -0.01em; }
input, textarea, select, button:not(.material-symbols), .font-mono { font-family: var(--nh-sans) !important; }
.font-mono { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace !important; }
#app-content .page .max-w-3xl, #app-content .page .max-w-4xl, #app-content .page .max-w-5xl { max-width: min(96%, 1600px) !important; margin-left: auto !important; margin-right: auto !important; }
.bg-success { background-color: var(--nh-amber) !important; }
button.bg-success, button.bg-success *, a.bg-success, a.bg-success *, .abs-btn.bg-success, .abs-btn.bg-success * { color: #14110d !important; text-shadow: none !important; }
.settings-content .text-lg, .settings-content h1 { font-family: var(--nh-serif) !important; }

/* ============ MOBILE (must stay last: equal-specificity !important, source order wins) ============ */
@media (max-width: 640px) {
    #app-content.has-siderail { margin-left: 0px !important; width: 100% !important; }

    /* ABS sizes the shell with Tailwind h-screen (100vh). On mobile 100vh includes the
       strip the address bar covers; dvh tracks the real visible viewport. */
    .h-screen, .text-white.h-screen.bg-bg { height: 100dvh !important; max-height: 100dvh !important; }

    /* Drawer */
    #nh-mobile-drawer {
        position: fixed; top: 0; left: 0; height: 100dvh; width: 232px; z-index: 200;
        display: flex; flex-direction: column; gap: 2px; padding: 72px 12px 22px;
        background: linear-gradient(180deg, rgba(var(--nh-bg-rgb),0.98) 0%, rgba(var(--nh-bg-rgb),0.94) 100%);
        backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%);
        border-right: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.12));
        box-shadow: 14px 0 44px rgba(0,0,0,0.5);
        transform: translateX(-100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    body.nh-menu-open #nh-mobile-drawer { transform: translateX(0); }
    #nh-mobile-drawer a {
        position: relative; display: flex; align-items: center; gap: 14px; padding: 11px 14px; border-radius: 10px;
        color: var(--nh-text-2, #d8cfc2); text-decoration: none; font-family: var(--nh-serif), Georgia, serif; font-size: 0.98rem; font-weight: 500;
        transition: background 0.15s, color 0.15s;
    }
    #nh-mobile-drawer a:hover { background: rgba(255,255,255,0.05); color: var(--nh-text-1, #f4eee2); }
    #nh-mobile-drawer a.nh-drawer-active { background: var(--nh-amber-tint, rgba(224,194,122,0.12)); color: var(--nh-amber, #e0c27a); }
    #nh-mobile-drawer a.nh-drawer-active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 58%; border-radius: 0 3px 3px 0; background: var(--nh-amber, #e0c27a); }
    #nh-mobile-drawer a span.material-symbols, #nh-mobile-drawer a span.abs-icons { font-size: 1.3rem; color: inherit; opacity: 0.85; }
    #nh-mobile-drawer .nh-drawer-label { font-family: var(--nh-serif), Georgia, serif; }
    #nh-menu-backdrop { display: none; position: fixed; inset: 0; z-index: 190; background: rgba(0,0,0,0.45); }
    body.nh-menu-open #nh-menu-backdrop { display: block; }

    /* Hero: flex row default-stretches all slides to the tallest one, but the
       banner inside each slide doesn't fill that stretched height on its own —
       that gap is both the "shadow on short slides" and the phantom scroll
       space below the carousel on the home page. Same bug, one fix. */
    #nh-hero-track { align-items: stretch !important; }
    .nh-hero-slide { display: flex !important; }
    .nh-hero-banner { height: 100% !important; }

    /* Appbar: the flex child that must be capped is the wrapper holding the search
       input, NOT the bare input. Capping the input lets its full-width wrapper still
       take 100% and shove the icon buttons off-screen. :has() targets that wrapper. */
    #appbar { display: flex !important; flex-wrap: nowrap !important; align-items: center !important; gap: 3px !important; padding-left: 6px !important; padding-right: 6px !important; }
    #appbar > * { min-width: 0 !important; }
    #appbar > *:not(:has(input)) { flex: 0 0 auto !important; }
    #appbar > *:has(input) { flex: 1 1 40px !important; }
    #appbar input { width: 100% !important; min-width: 0 !important; flex: 1 1 auto !important; }
    #appbar span.material-symbols, #appbar span.abs-icons { font-size: 1.05rem !important; }
    #appbar a, #appbar button { padding: 4px !important; flex-shrink: 0 !important; }
    #appbar img { height: 20px !important; }
    #appbar h1 { display: none !important; }
    .nh-hide-upload-mobile { display: none !important; }

    /* Drawer height already uses 100dvh at the source (see #nh-mobile-drawer above) —
       100vh includes the mobile address-bar strip, causing "one more swipe to
       reach the true bottom" on any page with a 100vh-sized fixed element. */

    /* Welcome heading — scoped to #bookshelf so book detail titles aren't touched */
    #bookshelf h1, #bookshelf .text-3xl, #bookshelf .text-4xl, #bookshelf .text-5xl { font-size: 1.3rem !important; line-height: 1.15 !important; }
    .bookshelf-row h2, .nh-rs-heading { font-size: 1.05rem !important; }

    /* Hero: single centered stack. Child 1=bg, 2=gradient, 3=text column, 4=cover. */
    .nh-hero-banner { flex-direction: column !important; align-items: center !important; text-align: center !important; padding: 16px !important; gap: 0 !important; border-radius: 14px !important; }
    .nh-hero-banner > div:nth-child(4) { order: 1 !important; width: 110px !important; height: 110px !important; margin: 0 auto 10px !important; flex-shrink: 0 !important; }
    .nh-hero-banner > div:nth-child(4) img { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 10px !important; }
    .nh-hero-banner > div:nth-child(3) { order: 2 !important; width: 100% !important; padding-right: 0 !important; min-width: 0 !important; align-items: center !important; }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(1) { display: none !important; }
    .nh-hero-title {
        font-size: 1.05rem !important; line-height: 1.25 !important; margin: 0 auto 3px !important; padding-bottom: 0 !important;
        white-space: normal !important; overflow: hidden !important; text-overflow: ellipsis !important;
        display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;
        text-align: center !important; max-width: 100% !important;
    }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(3) { font-size: 0.72rem !important; margin-bottom: 6px !important; text-align: center !important; }
    .nh-hero-banner div[style*="line-clamp"] { display: none !important; }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(4) { justify-content: center !important; margin-bottom: 8px !important; gap: 5px !important; }
    span[style*="border-radius: 20px"][style*="backdrop-filter"] { font-size: 0.58rem !important; padding: 2px 6px !important; }
    .nh-hero-banner > div:nth-child(3) > div:last-child { justify-content: center !important; flex-wrap: wrap !important; gap: 10px !important; width: 100% !important; }
    .nh-hero-play { padding: 6px 14px !important; font-size: 0.8rem !important; border-radius: 8px !important; }
    .nh-hero-play span.material-symbols { font-size: 1.05rem !important; }
    .nh-hero-banner div[style*="flex: 1; max-width: 320px"] { max-width: 200px !important; flex: none !important; width: 100% !important; }
    #nh-hero-nav { margin-top: 10px !important; }
    #nh-hero-nav .nh-nav-arrow { width: 30px !important; height: 30px !important; }
}

/* Series-page header (built by enhancements.js). All header styling lives HERE, not in
   the recent-series style block — that one is only injected on the home page, so a direct
   series-page load rendered the header unstyled.
   Mobile/stacked: header above #bookshelf, takes over appbar/toolbar clearance, bookshelf
   gives up that height so the 100% chain still sums. Desktop: two columns, details left. */
body #nh-series-header { padding: 87px 26px 10px; }
body.nh-has-toolbar #nh-series-header { padding-top: 127px; }
#nh-series-header .nh-sh-eyebrow { font-family: var(--nh-sans, system-ui); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--nh-amber, #e0c27a); opacity: 0.9; }
#nh-series-header h1 { font-family: var(--nh-serif), Georgia, serif; font-size: 1.6rem; font-weight: 600; color: var(--nh-text-1, #f2ecdf); margin: 4px 0 8px; line-height: 1.12; }
#nh-series-header .nh-sh-author { font-family: var(--nh-serif), Georgia, serif; font-size: 1.05rem; color: var(--nh-amber, #e0c27a); margin: 0 0 2px; }
#nh-series-header .nh-sh-stats { font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: var(--nh-muted-2, #9a9085); margin: 0 0 12px; }
#nh-series-header .nh-sh-desc { font-size: 0.88rem; line-height: 1.55; color: var(--nh-text-2, #cfc6b8); display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
@media (max-width: 1023.98px) {
  body #bookshelf.nh-with-series-header { padding-top: 12px !important; height: calc(100% - var(--nh-sh-h, 0px)) !important; }
}
@media (max-width: 640px) {
  #nh-series-header h1 { font-size: 1.25rem; }
  #nh-series-header .nh-sh-desc { -webkit-line-clamp: 2; }
}
/* Series page toolbar: fully transparent, name + count hidden, kebab kept.
   Scoped to body.nh-series-page (set by nhSeriesHeader) so library/collection
   toolbars keep their filter and sort controls untouched. */
body.nh-series-page #toolbar { background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
body.nh-series-page *:has(> #toolbar) { background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
body.nh-series-page #toolbar > p { display: none !important; }
body.nh-series-page #toolbar > div.w-6.h-6.rounded-full { display: none !important; }

@media (min-width: 1024px) {
  body .nh-series-cols { display: flex !important; align-items: stretch !important; }
  body #nh-series-header { flex: 0 0 34%; width: 34%; max-width: 520px; height: 100%; overflow-y: auto; padding: 127px 16px 32px 34px; box-sizing: border-box; }
  body #bookshelf.nh-with-series-header { height: 100% !important; flex: 1 1 auto; min-width: 0; padding-left: 0 !important; }
  #nh-series-header h1 { font-size: 2.2rem; }
  #nh-series-header .nh-sh-author { font-size: 1.25rem; }
  #nh-series-header .nh-sh-stats { font-size: 1.05rem; }
  #nh-series-header .nh-sh-desc { -webkit-line-clamp: 12; font-size: 0.95rem; max-width: 62ch; }
}
`;

  const style = document.createElement('style');
  style.id = 'nanohive-abs-theme';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
  (document.head || document.documentElement).appendChild(font);


  // ==========================================
  // JS DOM MUTATIONS: Toolbar Layout Split
  // ==========================================
  function manageLayout() {
      const _p = window.location.pathname;
      document.body.classList.toggle('nh-pad-page', /\/authors?\/[^/]+/.test(_p) || /\/collections?\/[^/]+/.test(_p));

      const toolbar = document.getElementById('toolbar');

      // 1. Clean up if no toolbar
      if (!toolbar) {
          document.body.classList.remove('nh-has-toolbar');
          document.body.classList.remove('nh-home');
          return;
      }

      document.body.classList.add('nh-has-toolbar');

      // Ensure the wrapper is visible (in case it got hidden by previous scripts)
      const wrapper = toolbar.closest('.relative');
      if (wrapper) wrapper.style.display = '';
      toolbar.style.display = '';

      // 2. Home is the library root (/library/<id>) with no sub-route.
      //    Everything else (bookshelf, series, collections, authors...) gets the frosted bar.
      const isHome = /\/library\/[^/]+\/?$/.test(window.location.pathname);
      document.body.classList.toggle('nh-home', isHome);

      if (isHome) {
          // ================= HOMEPAGE =================
          toolbar.classList.add('nh-home-toolbar');
          toolbar.classList.remove('nh-frosted-toolbar');
      } else {
          // ================= LIBRARY & SERIES PAGES =================
          toolbar.classList.add('nh-frosted-toolbar');
          toolbar.classList.remove('nh-home-toolbar');
      }
  }

  setInterval(manageLayout, 200);

  // Hide the Home toolbar (the lone "More" button) once the page is scrolled.
  function onAnyScroll(e) {
      const tb = document.getElementById('toolbar');
      if (!tb || !tb.classList.contains('nh-home-toolbar')) return;
      const el = e.target;
      let top = 0;
      if (el === document || el === document.documentElement || el === document.body) top = window.scrollY || 0;
      else if (el && typeof el.scrollTop === 'number') top = el.scrollTop;
      tb.classList.toggle('nh-toolbar-scrolled', top > 80);
  }
  document.addEventListener('scroll', onAnyScroll, true);



})();