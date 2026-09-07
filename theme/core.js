/* NanoHive ABS - Core Theme & Player  v3.139.0  (injected build) */

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
  // Mirror the Bearer token from ABS's own traffic (axios/XHR + fetch). Theme
  // features that call the API (ratings, hero) previously guessed where each ABS
  // release keeps its token in the Vuex store - and the guesses go stale (observed:
  // a session where every store path was empty while ABS itself authenticated
  // fine). Whatever header ABS sends is by definition the right one.
  function nhSniffAuth(value) {
    try {
      if (value && /^Bearer .+/.test(String(value))) window.__NH_TOKEN = String(value).slice(7);
    } catch (e) {}
  }
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      let url = typeof input === 'string' ? input : (input && input.url);
      const bumped = bumpPersonalized(url);
      if (bumped !== url) input = (typeof input === 'string') ? bumped : new Request(bumped, input);
    } catch (e) {}
    try {
      const h = (init && init.headers) || (input && typeof input === 'object' && input.headers);
      if (h) nhSniffAuth(typeof h.get === 'function' ? h.get('Authorization') : (h.Authorization || h.authorization));
    } catch (e) {}
    return origFetch.call(this, input, init);
  };
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    try { arguments[1] = bumpPersonalized(url); } catch (e) {}
    return origOpen.apply(this, arguments);
  };
  const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    try { if (String(name).toLowerCase() === 'authorization') nhSniffAuth(value); } catch (e) {}
    return origSetHeader.apply(this, arguments);
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

  /* One control skin and one tile skin for every NanoHive-authored surface.
     These mirror what core.js already FORCES on toolbar buttons (the
     "#toolbar button:not([role=menuitem])" rule), so our injected controls and
     ABS's own pills resolve identically. Anything we inject references these
     instead of re-inventing numbers -- three separate rounds had drifted to
     three different "matching" heights and radii. */
  --nh-ctl-h:        28px;
  --nh-ctl-r:        11px;
  --nh-ctl-bg:       rgba(255,255,255,0.05);
  --nh-ctl-bg-hi:    rgba(255,255,255,0.10);
  --nh-ctl-bd:       var(--nh-hairline-lit);
  --nh-ctl-fs:       0.75rem;
  --nh-tile-r:       14px;
  --nh-tile-sh:      0 10px 24px rgba(0,0,0,0.40);
  --nh-tile-sh-hi:   0 18px 34px rgba(0,0,0,0.52);
  --nh-tile-bd-hi:   rgba(255,255,255,0.26);
  --nh-glass-bg:     linear-gradient(158deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.24) 100%);
  --nh-glass-edge:   inset 0 1px 0 rgba(255,255,255,0.18);

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
/* DEFAULT clearance for every other page (GitHub #16). The rules above hand it out
   per page type, so any route nobody thought of slid under the overlaid appbar with
   nothing to scroll back to: reported on /upload, and /account had it too.
   Opting IN page by page cannot work, since the list is whatever ABS ships next.
   So: pad .page by default, and exclude the containers that already pad an inner
   element (#bookshelf, .configContent, #item-page-wrapper) or they double up. */
#app-content .page:not(:has(#bookshelf)):not(:has(.configContent)):not(:has(#item-page-wrapper)) { padding-top: 75px !important; }

/* ============ SCROLLBAR STYLING ============ */
/* scrollbar-width: ABS only thins ONE scroller natively, so e.g. the book-detail
   page (#item-page-wrapper) showed a fat default bar on Firefox. Thin the VERTICAL
   scrollers only, horizontal shelf rows carry ABS's .no-scroll (hidden bar), and
   forcing a width there re-showed row scrollbars on Firefox (user report). */
#bookshelf, .page, #item-page-wrapper, .overflow-y-auto, .overflow-x-auto, .overflow-y-scroll, .overflow-x-scroll { scrollbar-color: var(--nh-amber) transparent !important; }
#bookshelf, .page, #item-page-wrapper, .overflow-y-auto, .overflow-y-scroll { scrollbar-width: thin !important; }
.no-scroll { scrollbar-width: none !important; }
#item-page-wrapper::-webkit-scrollbar { width: 8px; }
/* HORIZONTAL scrollbars never show, anywhere (user rule): sliders have arrow
   buttons and wheel/drag still scroll. Firefox can't hide one axis only, so
   horizontal-only scrollers (author-page sliders etc.) hide their bar entirely. */
::-webkit-scrollbar:horizontal { height: 0 !important; }
.overflow-x-auto:not(.overflow-y-auto):not(.overflow-y-scroll), .overflow-x-scroll:not(.overflow-y-auto):not(.overflow-y-scroll) { scrollbar-width: none !important; }
/* The series header column never shows a bar (it scrolls in sync with the grid) */
#nh-series-header { scrollbar-width: none !important; }
#nh-series-header::-webkit-scrollbar { display: none; width: 0; height: 0; }

/* Author pages: one coherent LEFT-anchored block. ABS centers the photo+bio as
   a lone island while the shelves sit left, on ultrawides that reads as two
   unrelated pages (user). Header aligns to the same gutter as the shelves,
   the bio stays at a readable measure, everything else spans the width. */
body.nh-author-page #app-content .page > .max-w-6xl > .flex.justify-center { justify-content: flex-start !important; }
body.nh-author-page #app-content .page > .max-w-6xl > .flex > .grow { max-width: 100ch; }
/* …but on phones that row WRAPS, so left-anchoring stranded the portrait at the
   edge with a screen of dead space beside it (Pawel). Stacked = centered: the
   photo line and the name centre, the bio keeps its left edge for reading. */
@media (max-width: 640px) {
  body.nh-author-page #app-content .page > .max-w-6xl > .flex.justify-center { justify-content: center !important; }
  body.nh-author-page #app-content .page > .max-w-6xl > .flex > div:first-child { margin-right: 0 !important; }
  /* the edit pencil shares the name's row, so centering the ROW leaves the name
     itself sitting left of centre, pin the pencil and centre the name alone */
  body.nh-author-page #app-content .page > .max-w-6xl > .flex > .grow > .flex.items-center { justify-content: center; position: relative; }
  body.nh-author-page #app-content .page > .max-w-6xl > .flex > .grow > .flex.items-center > h1 { flex: 1 1 auto; text-align: center; }
  body.nh-author-page #app-content .page > .max-w-6xl > .flex > .grow > .flex.items-center > :not(h1) { position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
}
@media (min-width: 1600px) {
  body.nh-author-page #app-content .page > .max-w-6xl { max-width: calc(100% - 128px) !important; }
  /* a touch more presence on big screens */
  body.nh-author-page #app-content .page .w-48 { width: 14rem; min-width: 14rem; }
  body.nh-author-page #app-content .page .w-48 .h-60 { height: 17.5rem; }
  body.nh-author-page #app-content .page > .max-w-6xl > .flex h1 { font-size: 2.3rem; }
}
/* No-photo placeholder: ABS blows a decorative svg up to 140% with negative
   margins, at ultrawide it reads as a BROKEN image. Tame it into a quiet
   watermark inside a proper card. Real <img> photos are untouched. */
body.nh-author-page .w-48 .bg-primary.overflow-hidden { border-radius: 14px !important; background-color: var(--nh-raised, #221e1a) !important; border: 1px solid var(--nh-hairline, rgba(255,255,255,0.08)); }
body.nh-author-page .w-48 .bg-primary.overflow-hidden > svg { width: 100% !important; height: 100% !important; margin: 0 !important; opacity: 0.15 !important; }

/* Toolbar item counts ("157 Series") are utility labels, not literary copy,    they were inheriting the global serif body font. */
#toolbar > p { font-family: var(--nh-sans, system-ui) !important; font-size: 0.8rem !important; letter-spacing: 0.02em; color: var(--nh-muted-2, #9a9085) !important; }
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
/* Custom logos are rarely square, never let ABS's fixed w/h box stretch them. */
#appbar a[href$="/"] img { object-fit: contain !important; }
#appbar h1 { font-family: var(--nh-serif); font-weight: 500; margin: 0 !important; margin-right: 1.5rem !important; margin-top: 2px !important; line-height: 1 !important; text-decoration: none !important; }
#appbar a:hover, #appbar a:hover h1 { text-decoration: none !important; }

[data-v-c2b8406a] > button, [data-v-7254587f] input, a[href$="/account"] {
  background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid var(--nh-hairline-lit) !important; border-radius: 11px !important; color: var(--nh-text-2) !important;
}
[data-v-7254587f] input:focus { background-color: rgba(255, 255, 255, 0.1) !important; border-color: var(--nh-amber) !important; }

/* CSS-Only Logo Colorizer, class added by enhancements.js to the specific <a> tag */
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
/* Scoped to <body>, NOT to a class on #toolbar itself. ABS replaces the #toolbar
   ELEMENT on filter/sort/library changes, and manageLayout only re-classes it on a
   200ms poll, so the fresh toolbar spent up to 200ms with no .nh-frosted-toolbar,
   i.e. without the position:fixed below. It dropped into a 0x0 wrapper and the whole
   page jumped, then jumped back: the "flickers once when I filter or sort" report.
   <body> is never replaced, so a new toolbar is styled correctly on its first frame. */
/* Side padding: flat 32px (stock ABS uses px-8 = 32px), so the item count and the
   filter/sort controls hug the screen edges at EVERY width, the old centered-band
   formula (50vw - 800px) pushed them absurdly inward on ultrawide monitors. */
body.nh-has-toolbar:not(.nh-home) #toolbar {
  position: fixed !important;
  /* Flush with the bottom of the appbar band, see nhMeasureAppbar. A 1px gap here
     is a strip of unblurred artwork between two frosted panels, and very visible. */
  top: var(--nh-appbar-h, 64px) !important;
  left: 80px !important;
  right: 0 !important;
  width: auto !important;
  height: 50px !important;
  z-index: 45 !important;
  background-color: rgba(var(--nh-bg-rgb), 0.45) !important;
  backdrop-filter: blur(28px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
  margin: 0 !important;
  padding-left: 32px !important;
  padding-right: 32px !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--nh-hairline-lit) !important;
  display: flex !important;
  align-items: center !important;
}

/* Unify library toolbar filter/sort controls with the top-menu search/selector pill style.
   :not([role=menuitem]), the toolbar kebab's dropdown ROWS are also <button>s nested in
   #toolbar; without the guard they inherit the pill border/background and look nothing
   like every other context menu (B4). */
body.nh-has-toolbar:not(.nh-home) #toolbar button:not([role="menuitem"]) {
  background-color: rgba(255,255,255,0.05) !important;
  border: 1px solid var(--nh-hairline-lit) !important;
  border-radius: 11px !important;
  color: var(--nh-text-2) !important;
  padding: 5px 12px !important;
  transition: background-color .15s, border-color .15s, color .15s !important;
}
body.nh-has-toolbar:not(.nh-home) #toolbar button:not([role="menuitem"]):hover {
  background-color: rgba(255,255,255,0.10) !important;
  border-color: var(--nh-amber) !important;
  color: var(--nh-text-1) !important;
}
/* A filter dropdown is TWO sibling buttons: the trigger, and a clear-✕ absolutely
   overlaying its right ~44px. ABS only pads the trigger by 12px, so a long filter
   name ("Gatunek: Action & Adventure") runs underneath that ✕, and our pill rule
   was also painting the overlay ✕ as a pill. Exclude absolutely-positioned buttons
   from the pill styling, and give a trigger that has such a sibling its room back. */
#toolbar div:has(> button.absolute.right-0) > button:not(.absolute) {
  padding-right: 46px !important;
}
body.nh-has-toolbar:not(.nh-home) #toolbar button.absolute:not([role="menuitem"]) {
  background-color: transparent !important;
  border-color: transparent !important;
}
body.nh-has-toolbar:not(.nh-home) #toolbar button .truncate, #toolbar .nh-lf-lbl {
  display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* HOME PAGE TOOLBAR (TRANSPARENT PUSH) */
body.nh-home #toolbar {
  position: fixed !important;
  top: var(--nh-appbar-h, 64px) !important;
  left: 80px !important;
  right: 0 !important;
  width: auto !important;
  height: 50px !important;
  z-index: 45 !important;
  margin: 0 !important;
  padding-left: 32px !important;
  padding-right: 32px !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0) !important;
  display: flex !important;
  align-items: center !important;
  padding-top: 10px !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  border: none !important;
  transition: opacity 0.25s ease !important;
}
body.nh-home #toolbar.nh-toolbar-scrolled {
  opacity: 0 !important;
  pointer-events: none !important;
}

@media (max-width: 768px) {
    body.nh-has-toolbar:not(.nh-home) #toolbar, body.nh-home #toolbar { left: 0 !important; }
}

/* ============ DROPDOWN / CONTEXT MENUS, unified NanoHive surface ============ */
/* EVERY ABS popover box shares Tailwind border-black-200 + shadow-lg, regardless of role
   or bg colour: ContextMenuDropdown (div role=menu), Sort/Filter selects, GlobalSearch
   (bg-bg), the library switcher (bg-primary), AND the book-card MoreMenu (plain divs, NO
   role=menu, which is exactly why the card three-dot kept its stock look). Match that
   shared signature so all of them are one surface.
   OPAQUE, not translucent: backdrop-filter blur is unreliable here, ABS wraps cards in
   transformed ancestors that stop it painting the page behind, so a see-through bg only
   showed sharp covers ("too transparent"). Near-solid frosted-dark; blur is a bonus only
   where the browser honours it. */
.border-black-200.shadow-lg {
    background-color: rgba(var(--nh-bg-rgb), 0.98) !important;
    backdrop-filter: blur(22px) saturate(150%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(150%) !important;
    border: 1px solid var(--nh-hairline-lit) !important;
    border-radius: 14px !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6) !important;
    padding: 4px !important;
    /* Set the SANS font on the box itself so every row inherits it even if a future ABS
       version renames the item classes below (material-symbols icons keep their own font). */
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
}
/* Items: every menu row (INCLUDING the roleless MoreMenu rows) carries hover:bg-white/5,    the one hook common to all four components. Compact SANS so the theme's serif body font
   can't widen a label onto a second line ("Show Subtitles"). */
.border-black-200.shadow-lg [class*="hover:bg-white"],
.border-black-200.shadow-lg [role="menuitem"] {
    color: var(--nh-text-2) !important;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
    font-size: 0.78rem !important;
    white-space: nowrap !important;
    border-radius: 9px !important;
    transition: background-color .12s, color .12s !important;
}
.border-black-200.shadow-lg [class*="hover:bg-white"] > *,
.border-black-200.shadow-lg [role="menuitem"] > * { color: inherit !important; font-family: inherit !important; }
.border-black-200.shadow-lg [class*="hover:bg-white"]:hover,
.border-black-200.shadow-lg [role="menuitem"]:hover { background-color: rgba(255,255,255,0.08) !important; color: var(--nh-text-1) !important; }
/* Selected sort/filter row → amber tint (its text-yellow-400 already maps to --nh-amber). */
.border-black-200.shadow-lg [role="menuitem"].text-yellow-400 { background-color: var(--nh-amber-tint) !important; }
/* ContextMenuDropdown hardcodes an inline width per call site (192px on the book page,
   a cramped 110px on toolbars and file/chapter tables), with our nowrap labels the
   narrow ones clipped and looked like a different menu. min-width beats inline width,
   so every menu grows to fit its own labels and they all read as ONE component.
   Scoped to [role="menu"] boxes: the native globalSearchMenu shares the border/shadow
   signature but is a width-bound results panel, not a menu. */
.border-black-200.shadow-lg[role="menu"],
.border-black-200.shadow-lg.z-50 { min-width: max-content !important; z-index: 50 !important; }
/* Kebab-menu rows (ContextMenuDropdown buttons + roleless card MoreMenu rows all carry
   hover:bg-white/5): identical geometry everywhere. Sort/filter listbox rows keep their
   native padding, they reserve right space for the selected-check icon. */
.border-black-200.shadow-lg [class*="hover:bg-white"] { padding: 7px 11px !important; }
/* Submenu Back rows carry pl-9 to clear their ABSOLUTE arrow_left container,    the unified padding crushed it and the arrow painted over the "B" (Pawel).
   Preserve the clearance wherever ABS asked for it. */
.border-black-200.shadow-lg [class*="hover:bg-white"][class*="pl-9"] { padding-left: 36px !important; }
/* One row typography for BOTH toolbar dropdowns, ABS ships the filter list at
   text-sm and the sort list at text-xs, which read as two different menus. */
#toolbar .w-36 ul li:not(.nh-lf-mhead), #toolbar .w-36 ul li:not(.nh-lf-mhead) span:not(.material-symbols) { font-size: 0.8rem !important; }
/* Our value submenus (author/genre/… lists) go COMPACT, they are long. */
#toolbar .w-36 ul.nh-lf-subopen .nh-lf-mi { padding: 4px 10px 4px 11px !important; }
#toolbar .w-36 ul.nh-lf-subopen .nh-lf-mi .nh-lf-mtxt { font-size: 0.76rem !important; }
/* ABS's OWN value lists (its Genre/Author/Narrator pages) match ours. A native
   submenu page is identified by its Back row, the only li carrying pl-9, via
   :has(); nhLfInjectMenus also tags it .nh-lf-natsub as a belt-and-braces hook.
   The Back row keeps its 36px clearance from the rule above. */
#toolbar .w-36 ul:has(> li[class*="pl-9"]) > li,
#toolbar .w-36 ul.nh-lf-natsub > li { padding-top: 4px !important; padding-bottom: 4px !important; }
/* the row's own padding is not enough: ABS puts py-2 on the label SPAN too,
   which is what actually set the 40px row height */
#toolbar .w-36 ul:has(> li[class*="pl-9"]) > li span:not(.material-symbols),
#toolbar .w-36 ul.nh-lf-natsub > li span:not(.material-symbols) { font-size: 0.76rem !important; padding-top: 0 !important; padding-bottom: 0 !important; }
#toolbar .w-36 ul:has(> li[class*="pl-9"]) > li .material-symbols,
#toolbar .w-36 ul.nh-lf-natsub > li .material-symbols { font-size: 1.05rem !important; }
.modal [class*="bg-linear-to-t"] { display: none !important; }

/* ============ ZOOM BUTTON FROSTED ============ */
div.fixed.right-4.z-50 > div { background-color: rgba(var(--nh-bg-rgb), 0.4) !important; backdrop-filter: blur(24px) saturate(135%) !important; -webkit-backdrop-filter: blur(24px) saturate(135%) !important; border: 1px solid var(--nh-hairline-lit) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.60) !important; color: var(--nh-text-1) !important; }
div.fixed.right-4.z-50 > div span.material-symbols { color: var(--nh-text-2) !important; transition: color 0.2s; }
div.fixed.right-4.z-50 > div span.material-symbols:hover { color: var(--nh-amber) !important; }

/* ============ LEFT NAV RAIL ============ */
[aria-label="Library Sidebar"], [aria-label="Config Navigation"] { background-color: var(--nh-rail) !important; border-right: 1px solid var(--nh-hairline) !important; box-shadow: none !important; height: 100%; }
#siderail-buttons-container a, [aria-label="Config Navigation"] a { color: var(--nh-muted-2) !important; border-bottom: none !important; background-color: transparent !important; margin: 2px 6px; width: calc(100% - 12px) !important; border-radius: 12px; transition: background-color .15s, color .15s; }
#siderail-buttons-container a { height: 4rem !important; }

#siderail-buttons-container a span.material-symbols, #siderail-buttons-container a span.abs-icons, [aria-label="Config Navigation"] a span.material-symbols {
  font-size: 1.6rem !important; color: var(--nh-icon-base) !important; transition: color 0.15s ease;
}

/* Rail icons we restyle are painted here, from a data attribute, rather than by
   writing into ABS's text node. Vue keeps a reference to the ORIGINAL text node,
   so a textContent write leaves that reference dangling: when Vue later recycles
   the same link for a different library it cannot clear what we wrote, and a
   podcast library rendered the book library's "groups" ligature on top of its
   own icon. Generated content is invisible to the vdom, so nothing desyncs. */
#siderail-buttons-container a span.nh-rail-icon, #nh-mobile-drawer a span.nh-rail-icon { font-size: 0 !important; }
#siderail-buttons-container a span.nh-rail-icon::before, #nh-mobile-drawer a span.nh-rail-icon::before {
  content: attr(data-nh-glyph);
  font-family: "Material Symbols Rounded", "Material Symbols Outlined", "Material Icons";
  font-size: 1.6rem; font-weight: normal; font-style: normal; line-height: 1;
  letter-spacing: normal; text-transform: none; white-space: nowrap; word-wrap: normal; direction: ltr;
  font-feature-settings: "liga"; -webkit-font-feature-settings: "liga"; -webkit-font-smoothing: antialiased;
}
#nh-mobile-drawer a span.nh-rail-icon::before { font-size: 1.3rem; }

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
   [cy-id="progressBar"] directly, resilient to ABS class-chain changes (h-1e vs h-1.5). */
[id^="cover-area-"].nh-finished [cy-id="progressBar"], [cy-id="card"].nh-finished [cy-id="progressBar"] { display: none !important; }
/* The badge was a dark translucent disc with a thin accent tick, which readers
   kept missing against busy artwork. Inverted and enlarged: a solid fill with a
   dark glyph reads at a glance on any cover, and the dark ring keeps it legible
   over pale artwork where the fill alone would wash out. --nh-finished-* are
   overridable so the colour is one edit rather than four. */
[id^="cover-area-"].nh-finished::after, [cy-id="card"].nh-finished::after {
  /* U+2714 HEAVY CHECK MARK, written as an escape so the source stays readable,
     followed by U+FE0E (text presentation selector), bare U+2714 is rendered as
     a colour emoji by Android and some Windows fonts, which would ignore the
     badge's own colours. font-variant-emoji says the same thing to newer engines. */
  content: '\\2714\\FE0E'; font-variant-emoji: text;
  position: absolute; bottom: 0.4em; left: 0.4em; z-index: 30;
  width: 1.75em; height: 1.75em; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--nh-finished-bg, #4c9a5e); color: var(--nh-finished-fg, #0d1a11);
  border: 1.5px solid rgba(0,0,0,0.38);
  font-weight: 800; font-size: 0.92em; line-height: 1;
  box-shadow: 0 2px 10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.16) inset;
}
.bookshelf-row h2 { font-family: var(--nh-serif) !important; font-weight: 500 !important; font-size: 1.55rem !important; letter-spacing: -0.01em; color: var(--nh-text-1) !important; }

/* ---- ABS's STANDARD (skeuomorphic) home view -------------------------------
   ABS ships two home layouts. In DETAIL view each shelf is a .bookshelf-row that
   CONTAINS its own <h2>, which the rule above styles. In STANDARD view, the one
   a user reported from the field, the strip is .bookshelf-row.categorizedBookshelfRow
   and the heading lives in a SIBLING placard: a small plate on a wooden shelf edge,
   drawn BELOW its books. So the rule above matched nothing there, the native titles
   kept ABS's plate (0.9em, and it scales with the cover-size widget) while our own
   injected rows drew 1.55rem serif headings above their books, "the titles are
   inconsistent in font and layout and size", which is exactly what it looked like.
   The whole theme is a restyle, so the fix is to bring this view into it rather than
   dress our rows up as wooden shelves: the plate loses its chrome, the shelf edge and
   the wood texture go, and the heading is promoted ABOVE the strip at our size. Both
   ABS views then present a home page identically, which is also what makes reordering
   and shelf-hiding behave the same in both.
   Scoped by :has(> .bookshelf-row.categorizedBookshelfRow) so it cannot reach DETAIL
   view; a browser without :has() simply keeps stock ABS. The left indent is copied
   from the strip in JS (nhStdShelfTitles), it is an em value ABS computes.
   NOTE the display below is deliberately NOT !important: Hide Homepage Shelves hides a
   shelf with an inline display:none, and an !important stylesheet rule outranks a plain
   inline style, with it, no shelf could be hidden in this view at all. The selector is
   specific enough (id + :has) to win on its own. */
#bookshelf div:has(> .bookshelf-row.categorizedBookshelfRow) { display: flex; flex-direction: column; }
#bookshelf div:has(> .bookshelf-row.categorizedBookshelfRow) > .bookshelf-row { order: 2; }
#bookshelf div:has(> .bookshelf-row.categorizedBookshelfRow) > div:not(.bookshelf-row) { order: 1; }
#bookshelf .categorizedBookshelfRow { background-image: none !important; }
#bookshelf .bookshelfDividerCategorized { display: none !important; }
#bookshelf .categoryPlacard { position: static !important; transform: none !important; width: auto !important; text-align: left !important; letter-spacing: normal !important; border-radius: 0 !important; }
#bookshelf .categoryPlacard > .shinyBlack { background: none !important; background-image: none !important; border: 0 !important; border-radius: 0 !important; height: auto !important; padding: 0 !important; justify-content: flex-start !important; }
#bookshelf .categoryPlacard h2 { font-family: var(--nh-serif) !important; font-weight: 500 !important; font-size: 1.55rem !important; letter-spacing: -0.01em !important; color: var(--nh-text-1) !important; margin: 0 0 0.5rem !important; }

/* Settings -> General: ABS's two "use bookshelf view" switches are hidden, because the
   theme owns both layouts and forces them to the detail view (nhForceDetailView). Left
   available they would let an admin switch the library grid to a view that has no card
   captions, and the caption line is where our rating badges live, so the ratings would
   vanish from every tile with no explanation.
   Matched on ABS's own element ids, which are language-independent (the labels are not,    see the shelf-hiding fix). The row is div.flex.items-center.py-2 ; :has() matches
   ancestors too, so the class list has to be the row's exact one or the whole settings
   card would disappear. */
div.flex.items-center.py-2:has(> div > p > #settings-home-page-uses-bookshelf),
div.flex.items-center.py-2:has(> div > p > #settings-library-uses-bookshelf) { display: none !important; }

[cy-id="leftScrollButton"]:hover, [cy-id="rightScrollButton"]:hover { color: var(--nh-amber) !important; background-color: var(--nh-amber-tint) !important; }

/* Scroll arrows for the shelves WE build (GitHub #21). ABS puts a pair beside each
   shelf title; our own rows are built from scratch and never had them, so their
   last items could not be reached without a trackpad swipe. Same 32px round
   buttons in the same place, but only once the strip really overflows, and the
   one that cannot move is dimmed rather than removed so the pair does not jump. */
.nh-sa-head { display: flex; align-items: center; gap: 6px; }
.nh-sa-head > h2 { flex: 1 1 auto; min-width: 0; }
.nh-sa-btns { flex: none; display: none; align-items: center; gap: 2px; }
.nh-sa-head.nh-sa-on .nh-sa-btns { display: flex; }
.nh-sa-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 50%; background: none; color: var(--nh-text-2, #cfc6b8); cursor: pointer; transition: color .15s ease, background-color .15s ease, opacity .15s ease; }
.nh-sa-btn:hover { color: var(--nh-amber, #e0c27a); background-color: var(--nh-amber-tint, rgba(224,194,122,0.12)); }
.nh-sa-btn.nh-sa-off { opacity: 0.25; pointer-events: none; }
/* Our headings carry a bottom margin; the wrapper owns it now so the buttons sit
   on the title's line rather than being pushed below it. */
.nh-sa-head > h2.nh-rs-heading, .nh-sa-head > h2.nh-rf-heading { margin-bottom: 0 !important; }
#nh-recent-series-row .nh-sa-head, :is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-sa-head { margin: 0 0 1rem; }

/* Drawer and backdrop are built in JS at every viewport, but all their styling lives in
   the max-width:640px block. Above that they'd otherwise be unstyled divs in normal flow,
   dumping the nav links as plain text at the bottom of the page. The mobile block's own
   display:flex / display:block override these. */
#nh-mobile-drawer, #nh-menu-backdrop { display: none; }

/* Version footer: the NanoHive line links to this build's own release notes.
   The desktop footer sits over the rail with pointer-events:none so it never
   eats a click meant for the nav, which means the anchor has to re-enable them
   for itself. Everything else about the line is unchanged. */
.nh-vf-link { display: inline-block; margin-top: 2px; color: var(--nh-amber, #e0c27a); opacity: 0.8; text-decoration: none; pointer-events: auto; }
.nh-vf-link:hover, .nh-vf-link:focus-visible { opacity: 1; text-decoration: underline; }
.nh-vf-link:focus-visible { outline: 1px solid var(--nh-amber, #e0c27a); outline-offset: 2px; border-radius: 3px; }

/* ============ SERIES & COLLECTION CARDS ============ */
/* Baseline geometry (196/196/168/12/24) proven on this ABS build; this build does NOT
   put inline heights on covers-area (that's why the fixed height exists). Scaling comes
   only from the vars, driven by user/getSizeMultiplier in enhancements.js, normalized so
   slider=100 reproduces the baseline exactly. Fallbacks = frozen baseline. */
html:not(.nh-stock-series) [cy-id="card"][id^="series-card-"] { width: var(--nh-series-w, 196px) !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] { height: var(--nh-series-w, 196px) !important; overflow: visible !important; }
html:not(.nh-stock-series) [cy-id="item"] { overflow: visible !important; }
/* :not(.nh-sc-tile), the shorthand's !important would wipe the custom series
   cover's inline background-image (A1). EVERY themed child injected into
   covers-area needs its own :not() here or this rule silently erases it: it has
   already eaten the custom cover tile (A1), the rating strip's gradient (.nh-cr)
   and, without the third exclusion, the completion badge (.nh-sp, #13). */
html:not(.nh-stock-series) [cy-id="covers-area"] > div:not([cy-id]):not(.nh-sc-tile):not(.nh-cr):not(.nh-sp) { background: transparent !important; box-shadow: none !important; overflow: visible !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] .bg-primary { background: transparent !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] .bg-primary > .relative { width: 100% !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] { overflow: visible !important; box-shadow: none !important; }
/* The fan only reveals a 14px / 29px sliver of the covers behind the front one,
   and that sliver is their bottom-right CORNER. Any cover that is dark at that
   corner -- which is most of them, and all of the generated demo covers -- makes
   the stack read as two drop shadows rather than as a stack of books. A hairline
   ring plus a hard edge shadow separates the layers regardless of the artwork. */
/* No hairline ring on the deck covers (Pawel), just the drop shadow. */
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div { left: 0 !important; top: 0 !important; width: var(--nh-series-cover, 168px) !important; height: var(--nh-series-cover, 168px) !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 10px 24px rgba(0,0,0,0.42) !important; transition: filter .2s ease, box-shadow .2s ease !important; }
html:not(.nh-stock-series) [cy-id="card"][id^="series-card-"]:hover [id^="group-cover-"] > div:nth-child(1) { filter: brightness(0.7) !important; box-shadow: 0 10px 24px rgba(0,0,0,0.42) !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div img { border-radius: 12px !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div:nth-child(1) { transform: translate(0,0) !important; z-index: 3 !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div:nth-child(2) { transform: translate(var(--nh-series-off1, 12px),var(--nh-series-off1, 12px)) !important; z-index: 2 !important; filter: brightness(0.78) !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div:nth-child(3) { transform: translate(var(--nh-series-off2, 24px),var(--nh-series-off2, 24px)) !important; z-index: 1 !important; filter: brightness(0.60) !important; }
html:not(.nh-stock-series) [cy-id="covers-area"] [id^="group-cover-"] > div:nth-child(n+4) { display: none !important; }
/* Standard 1.6:1 libraries: stacked tiles go portrait (heights x1.6, widths unchanged) */
html:not(.nh-stock-series).nh-covers-std [cy-id="covers-area"] { height: calc(var(--nh-series-w, 196px) * 1.6) !important; }
html:not(.nh-stock-series).nh-covers-std [cy-id="covers-area"] [id^="group-cover-"] > div { height: calc(var(--nh-series-cover, 168px) * 1.6) !important; }
/* Custom series cover (A1): the uploaded image becomes the FRONT of the stack,    it sits exactly on the c1 slot (same size/position, one z higher) so books
   #1/#2 still peek out behind and custom series read like stock ones. Hidden in
   stock mode, that mode means "give me ABS's native look". */
.nh-sc-tile { position: absolute; top: 0; left: 0; width: var(--nh-series-cover, 168px); height: var(--nh-series-cover, 168px); border-radius: 12px; background-position: center; background-size: cover; background-color: var(--nh-raised); box-shadow: 0 10px 24px rgba(0,0,0,0.42); z-index: 4; transition: filter .2s ease; }
html.nh-covers-std .nh-sc-tile { height: calc(var(--nh-series-cover, 168px) * 1.6); }
html:not(.nh-stock-series) [id^="series-card-"].nh-has-custom:hover .nh-sc-tile { filter: brightness(0.7); }
html.nh-stock-series .nh-sc-tile { display: none !important; }
[cy-id="seriesLengthMarker"] { left: 0.375em !important; right: auto !important; background-color: rgba(255,255,255,0.55) !important; backdrop-filter: blur(10px) brightness(1.2) saturate(1.05) !important; -webkit-backdrop-filter: blur(10px) brightness(1.2) saturate(1.05) !important; border: 1px solid rgba(255,255,255,0.35) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important; z-index: 5 !important; }
[cy-id="seriesLengthMarker"] p { color: #000000 !important; font-weight: 700 !important; font-family: var(--nh-sans) !important; }
[cy-id="hoveringDisplayTitle"] { display: none !important; }
html.nh-stock-series [id^="series-card-"] [cy-id="hoveringDisplayTitle"] { display: flex !important; background: rgba(0,0,0,0.3) !important; }
html.nh-stock-series [id^="series-card-"] [cy-id="hoveringDisplayTitle"] > * { visibility: hidden !important; }
[cy-id="seriesProgressBar"] { display: none !important; }
/* Series completion badge (#13), the replacement for the native bar hidden just
   above. Anchored to the top-right corner of the FRONT cover of the stack, which
   sits at left 0 / top 0 and is --nh-series-cover wide, so the corner is that
   width minus a small inset. z-index clears the deck (1-4) and ABS's own cover
   wrapper, which is Tailwind z-10, a lower value only shows during the cover's
   fade-in, which is exactly how the rating badge first shipped broken.
   Green = every book finished, amber = started but not finished. A series nobody
   has touched gets no badge at all. */
/* FIXED colours, deliberately NOT var(--nh-amber). The "started" state used the
   accent, which is whatever colour the user picked, on a warm or greenish accent
   the two states became the same badge at two brightnesses (Pawel). Finished and
   started mean different things, so they get their own hues and keep them whatever
   the theme is. Green and orange are ~120 degrees apart in hue and differ in
   lightness too, so they stay distinguishable for red-green colour blindness. */
.nh-sp { position: absolute; top: 6px; left: calc(var(--nh-series-cover, 168px) - 6px); transform: translateX(-100%); z-index: 20; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; line-height: 0; color: #04240f; background: #3fbf6a; border: 1px solid rgba(0,0,0,0.35); box-shadow: 0 2px 8px rgba(0,0,0,0.45); pointer-events: none; }
/* The tick is a stroked SVG path, so its weight is ours to set rather than
   whatever the UI font gives (Pawel: it read too thin as a text glyph). */
.nh-sp svg { display: block; width: 14px; height: 14px; }
/* Started-but-not-finished: orange, and a HALF-FILLED disc rather than a tick, so
   the two states differ in shape as well as colour and neither depends on the
   viewer seeing hue correctly. */
.nh-sp-some { color: #2a1400; background: #f3922b; }
html.nh-stock-series .nh-sp { display: none !important; }
/* In the home Recent Series row the front cover is the full --nh-rs-cw tile. */
#nh-recent-series-row .nh-sp { left: calc(var(--nh-rs-cw, 140px) - 6px); }
/* Collapsed-series cards on the library page are book cards, so the badge hangs
   off the cover area's own right edge rather than the series-deck width. */
[id^="cover-area-"] > .nh-sp { top: 6px; left: auto; right: 6px; transform: none; }
[id^="series-card-"] p:not([role="status"]), [id^="series-card-"] .truncate, [cy-id="detailBottomDisplayTitle"], [id^="collection-card-"] p, [id^="collection-card-"] .truncate { font-family: var(--nh-serif) !important; font-weight: 500 !important; color: var(--nh-text-2) !important; }

[id^="collection-card-"] .bg-primary.rounded-sm { border-radius: 14px !important; overflow: hidden !important; box-shadow: 0 10px 26px rgba(0,0,0,0.40) !important; }
[id^="collection-card-"] .bg-primary.rounded-sm > .rounded-xs { border-radius: 14px !important; }
[id^="collection-card-"] .flex > .rounded-xs { border-radius: 0 !important; }
[id^="collection-card-"] .box-shadow-book { box-shadow: 0 10px 26px rgba(0,0,0,0.40) !important; }

/* ============ STANDARD (1.6:1) COVER MODE ============ */
/* Set per-library by nhCoverModeClass() when the library prefers 1.6:1 covers.
   Narrower cards truncate sooner, so ease the title/author size slightly. */
html.nh-covers-std #bookshelf [cy-id="title"],
html.nh-covers-std .categorizedBookshelfRow [cy-id="title"] { font-size: 0.85em !important; }
html.nh-covers-std #bookshelf [cy-id="title"] + p,
html.nh-covers-std .categorizedBookshelfRow [cy-id="title"] + p { font-size: 0.72em !important; }

/* ============ NARRATORS PAGE ============ */
/* Legacy ABS builds gave author/narrator cards ids; ABS 2.35 does not (measured:
   an [id^="author-card-"] selector matches 0 elements on /bookshelf/authors,
   while book and series cards still have theirs). These stay as compat for older
   servers -- the live styling is the AUTHORS LISTING block further down. Values
   kept in step with the shared art-tile skin. */
[id^="narrator-card-"], [id^="author-card-"] { background-color: var(--nh-raised) !important; border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)) !important; border-radius: var(--nh-tile-r, 14px) !important; box-shadow: var(--nh-tile-sh, 0 10px 24px rgba(0,0,0,0.40)) !important; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important; overflow: hidden !important; }
[id^="narrator-card-"]:hover, [id^="author-card-"]:hover { filter: brightness(0.7) !important; border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)) !important; }
[id^="narrator-card-"] p, [id^="author-card-"] p { font-family: var(--nh-serif) !important; color: var(--nh-text-2) !important; }
[id^="narrator-card-"] .text-gray-400, [id^="author-card-"] .text-gray-400 { font-family: var(--nh-sans) !important; color: var(--nh-muted-2) !important; }

/* ---- "Rate finished" home row ---------------------------------------------
   Books finished but never rated. Sized off the same em-based scale ABS uses for
   its own shelves so it sits in the rhythm of the page rather than next to it. */
:is(#nh-rate-finished-row, #nh-mark-finished-row) { width: 100%; box-sizing: border-box; margin: 1.5em 0; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-heading { font-family: var(--nh-serif), 'Spectral', serif !important; font-weight: 500; font-size: 1.55rem; letter-spacing: -0.01em; color: var(--nh-text-1, #f4eee2); margin: 0 0 14px; }
/* match ABS's own shelf headings on phones (16.8px there vs our fixed 24.8px,    the row title read as a different species on mobile, Pawel) */
@media (max-width: 640px) { :is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-heading { font-size: 1.05rem; margin-bottom: 10px; } }

/* ---- Reported problems on the ACCOUNT page (admins) ----------------------
   The admin end of "Report a problem" lives under the account settings, the
   appbar badge's button leads exactly here. List rows reuse .nh-rp-*. */
#nh-acc-reports { margin: 18px 0 22px; padding: 20px 22px 22px; background: var(--nh-raised, #221e1a); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.06)); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.30); }
#nh-acc-reports .nh-acc-rp-t { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.15rem; font-weight: 600; color: var(--nh-amber, #e0c27a); margin: 0 0 6px; }
#nh-acc-reports .nh-acc-rp-hint { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); margin: 0 0 14px; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-scroll { display: flex; flex-wrap: nowrap; gap: 16px; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; scrollbar-width: none; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-scroll::-webkit-scrollbar { display: none; height: 0; width: 0; }
/* Tile size tracks the cover-size control: --nh-rf-cw/--nh-rf-fs are measured off
   a real ABS cover and title each layout (nhRateFinishedSize), exactly as the
   Recent Series row does. They were hardcoded 154px/0.82rem, which is why this
   row alone ignored the +/- button and sat at a different size to everything
   around it. The fallbacks only apply before the first measurement lands. */
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card { flex: 0 0 auto; width: var(--nh-rf-cw, 154px); text-decoration: none; cursor: pointer; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-cover { position: relative; width: var(--nh-rf-cw, 154px); height: var(--nh-rf-cw, 154px); border-radius: var(--nh-tile-r, 14px); background-position: center; background-size: cover; background-color: var(--nh-raised, #221e1a); box-shadow: var(--nh-tile-sh, 0 10px 24px rgba(0,0,0,0.40)); transition: filter .18s ease, box-shadow .18s ease; }
html.nh-covers-std :is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-cover { height: calc(var(--nh-rf-cw, 154px) * 1.6); }
/* Tiles DARKEN on hover, they never lift (house rule). */
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card:hover .nh-rf-cover { filter: brightness(0.7); }
/* Saved: collapse the card out of the row instead of it just vanishing. */
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card { transition: opacity .24s ease, transform .24s ease; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card.nh-rf-done { opacity: 0; transform: scale(0.94); pointer-events: none; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-title { font-family: var(--nh-serif), 'Spectral', serif; font-size: var(--nh-rf-fs, 0.82rem); color: var(--nh-text-2, #d8cfc2); margin: 8px 0 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* The prompt under the title is what tells you the tile is a rating control --
   the row used to say so only by revealing stars on hover, which said nothing at
   all on a phone. Tapping the tile opens the rate sheet (nhRfSheet). */
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-cta { display: flex; align-items: center; gap: 0.3em; font-family: var(--nh-sans, system-ui); font-size: calc(var(--nh-rf-fs, 0.82rem) * 0.92); color: var(--nh-muted-2, #9a9085); margin: 3px 0 0; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-cta .nh-rt-stars { font-size: 1em; letter-spacing: 1px; }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card:hover .nh-rf-cta { color: var(--nh-amber, #e0c27a); }
:is(#nh-rate-finished-row, #nh-mark-finished-row) .nh-rf-card:hover .nh-rf-cta .nh-rt-stars { color: rgba(224,194,122,0.45); }
/* Rate sheet: the ratings-popup chrome (book-details.js injects it on every page)
   with one oversized star row. Sized so a HALF star -- the smallest thing you can
   aim at -- clears 24px: 3.3rem measures ~250px across, /10 = 25px each. The old
   strip on the tile put half-stars at 11px, which was never a thumb target. The
   250px has to survive a 360px phone too, hence the reduced box padding below. */
/* Everything in the sheet sits on ONE centered axis (Pawel): cover on top,
   title and author centered beneath it, then the stars, value and buttons,    the old cover-left/text-right row was the only left-aligned block in an
   otherwise centered dialog. */
#nh-rf-sheet .nh-rf-sheet-cover { width: 96px; height: 96px; border-radius: 12px; background-size: cover; background-position: center; background-color: var(--nh-raised, #221e1a); flex: none; }
#nh-rf-sheet .nh-rf-sheet-top { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; margin: 8px 0 14px; }
#nh-rf-sheet .nh-rf-sheet-meta { min-width: 0; max-width: 100%; }
#nh-rf-sheet .nh-rf-sheet-t { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.15rem; color: var(--nh-text-1, #f4eee2); line-height: 1.25; margin: 0 0 3px; }
#nh-rf-sheet .nh-rf-sheet-a { font-family: var(--nh-sans, system-ui); font-size: 0.85rem; color: var(--nh-muted-2, #9a9085); margin: 0; }
#nh-rf-sheet .nh-rf-pick { display: flex; justify-content: center; padding: 4px 0 2px; }
#nh-rf-sheet .nh-rf-pick .nh-rt-stars { font-size: 3.3rem; letter-spacing: 5px; cursor: pointer; touch-action: none; }
/* min-height holds the row even while empty, so the buttons never shift when the
   picked value appears. The margin below is the gap under the stars Pawel asked
   to keep. */
#nh-rf-sheet .nh-rf-val { text-align: center; font-family: var(--nh-sans, system-ui); font-size: 0.9rem; color: var(--nh-text-2, #d8cfc2); min-height: 1.3em; margin: 10px 0 16px; }
#nh-rf-sheet .nh-rt-actions { justify-content: center; gap: 12px; flex-wrap: wrap; padding-bottom: 4px; margin-top: 0; }
#nh-rf-sheet .nh-rt-btn { min-width: 148px; padding: 9px 18px; border: 1px solid transparent; }
/* Its own centered line, never a flex sibling: sharing the wrap line with a
   button pushed that button off the centerline by half the status width. */
#nh-rf-sheet .nh-rt-status { flex-basis: 100%; text-align: center; margin: 0; }
/* Secondary: same silhouette as Save, quieter fill. */
#nh-rf-sheet .nh-rf-btn2 { background: rgba(255,255,255,0.06); color: var(--nh-text-2, #d8cfc2); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); }
#nh-rf-sheet .nh-rf-btn2:hover { background: rgba(255,255,255,0.11); border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }
#nh-rf-sheet .nh-rt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
@media (max-width: 640px) {
  /* Buy back the width the star row needs rather than shrinking the targets. */
  #nh-rf-sheet .nh-rt-modal-box { padding-left: 12px; padding-right: 12px; }
  #nh-rf-sheet .nh-rf-sheet-cover { width: 80px; height: 80px; }
  #nh-rf-sheet .nh-rf-sheet-top { gap: 10px; }
  /* Stacked buttons: full width and equal, not two centered raggeds (Pawel). */
  #nh-rf-sheet .nh-rt-actions { flex-direction: column; align-items: stretch; gap: 8px; }
  #nh-rf-sheet .nh-rt-btn { width: 100%; min-width: 0; }
}

/* Home reordering is done with the flex order property so no DOM node ever
   moves (see nhHomeOrderApply). Flex does not collapse adjacent vertical
   margins the way block layout did, which would double every gap -- zeroing
   only margin-top leaves each row's own margin-bottom as the single spacer, so
   the rhythm is identical to before.
   The class is stamped by nhHomeOrderApply on the exact element whose children it
   ordered -- never inferred from the DOM shape, which differs between ABS's two home
   views and silently put the flex context one level too deep in the standard one. */
.nh-home-flexed { display: flex !important; flex-direction: column !important; }
.nh-home-flexed > * { margin-top: 0 !important; }

/* ---- home section reorder (settings panel) -------------------------------- */
.nh-ho-wrap { margin-top: 14px; }
.nh-ho-lbl { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--nh-muted-2, #8a8075); margin-bottom: 8px; }
.nh-ho-list { display: flex; flex-direction: column; gap: 6px; }
.nh-ho-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: var(--nh-ctl-r, 11px); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); }
.nh-ho-name { flex: 1 1 auto; font-family: var(--nh-sans, system-ui); font-size: 0.82rem; color: var(--nh-text-2, #d8cfc2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-ho-btn { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); background: transparent; color: var(--nh-text-2, #d8cfc2); cursor: pointer; transition: background-color .15s, border-color .15s, opacity .15s; }
.nh-ho-btn .material-symbols { font-size: 1rem; }
.nh-ho-btn:hover:not(:disabled) { background: var(--nh-ctl-bg-hi, rgba(255,255,255,0.10)); border-color: var(--nh-amber, #e0c27a); }
.nh-ho-btn:disabled { opacity: 0.3; cursor: default; }
.nh-ho-reset { align-self: flex-start; margin-top: 4px; background: none; border: none; padding: 0; color: var(--nh-amber, #e0c27a); font-family: var(--nh-sans, system-ui); font-size: 0.78rem; cursor: pointer; }
.nh-ho-reset:hover { color: var(--nh-amber-hover, #eccf91); }
.nh-ho-empty { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-muted-2, #8a8075); margin: 0; }

/* ---- AUTHORS LISTING GRID (ABS 2.35) --------------------------------------
   The only stable hooks are cy-id plus the /author/ href. The href guard is
   load-bearing: series cards share cy-id="card", and this selector matched 56
   elements on /bookshelf/authors versus 0 on /bookshelf and /bookshelf/series.
   Card geometry is owned by the virtualized shelf (inline min/max-width plus a
   transform), so we restyle INSIDE the box rather than fight the layout engine. */
#bookshelf a[href*="/author/"] [cy-id="imageArea"] {
  position: relative !important;
  background-color: var(--nh-raised, #221e1a) !important;
  border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)) !important;
  border-radius: var(--nh-tile-r, 14px) !important;
  box-shadow: var(--nh-tile-sh, 0 10px 24px rgba(0,0,0,0.40)) !important;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
}
/* Darken on hover, like the book and series cards. The theme's tiles do not
   lift -- a raise here made the authors shelf and the rate-finished row the odd
   ones out (Pawel). */
#bookshelf a[href*="/author/"]:hover [cy-id="imageArea"] {
  border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)) !important;
  filter: brightness(0.7) !important;
}
#bookshelf a[href*="/author/"] [cy-id="imageArea"] > div:first-child {
  background: linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 70%) !important;
  border-radius: inherit !important;
}
#bookshelf a[href*="/author/"] [cy-id="imageArea"] img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
/* No photo: ABS blows a white person silhouette up to 140 percent at opacity .6
   and it reads as a broken image. Hide it and draw the narrators page's initial
   medallion from the attribute nhAuthorsBar stamps. */
#bookshelf a[href*="/author/"] [cy-id="imageArea"] > div:first-child > svg { display: none !important; }
/* Percentage box so the same medallion works on the big listing tiles and on the
   smaller cards in the home page's Newest Authors shelf; the font size steps up
   only on the listing page, where there is room for it. */
/* An author with no photo gets a SILHOUETTE, not a bare initial: a lone letter in
   a circle read as an empty ellipse (Pawel). The disc is ::before, the figure is
   ::after painted as a mask so it takes the accent colour, same technique as the
   book-site logos. */
#bookshelf a[href*="/author/"] [cy-id="imageArea"][data-nh-ini]::before {
  content: "";
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: 46%; height: 46%; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--nh-hairline, rgba(255,255,255,0.06));
}
#bookshelf a[href*="/author/"] [cy-id="imageArea"][data-nh-ini]::after {
  content: "";
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: 24%; height: 24%;
  background-color: var(--nh-amber, #e0c27a); opacity: 0.7;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm0 1.9c-5.1 0-9.2 2.6-9.2 5.7V22h18.4v-1.9c0-3.1-4.1-5.7-9.2-5.7Z'/></svg>") center/contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm0 1.9c-5.1 0-9.2 2.6-9.2 5.7V22h18.4v-1.9c0-3.1-4.1-5.7-9.2-5.7Z'/></svg>") center/contain no-repeat;
}
body.nh-authors-list #bookshelf a[href*="/author/"] [cy-id="imageArea"][data-nh-ini]::after { width: 26%; height: 26%; }
#bookshelf a[href*="/author/"] [cy-id="textInline"] {
  background: linear-gradient(to top, rgba(12,10,8,0.94) 0%, rgba(12,10,8,0.75) 58%, rgba(12,10,8,0) 100%) !important;
  padding: 24px 10px 11px !important;
}
#bookshelf a[href*="/author/"] [cy-id="textInline"] p:first-child { font-family: var(--nh-serif), 'Spectral', serif !important; font-weight: 500 !important; font-size: 0.88rem !important; color: #efe9dd !important; }
#bookshelf a[href*="/author/"] [cy-id="textInline"] p + p { font-family: var(--nh-sans, system-ui) !important; font-size: 0.7rem !important; color: var(--nh-muted-2, #8a8075) !important; margin-top: 2px !important; }
#bookshelf a[href*="/author/"] [cy-id="spinner"] { border-radius: inherit !important; }
#bookshelf a[href*="/author/"] [cy-id="match"],
#bookshelf a[href*="/author/"] [cy-id="edit"] {
  border-radius: 10px !important; background: rgba(12,10,8,0.55) !important;
  -webkit-backdrop-filter: blur(6px) !important; backdrop-filter: blur(6px) !important;
}

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
#nh-home-bg .nh-bg-layer { position: absolute !important; inset: 0 !important; background-size: cover !important; background-position: center !important; filter: blur(55px) brightness(0.45) saturate(1.35) !important; opacity: 0; transition: opacity 2.8s ease, filter 1.2s ease !important; will-change: opacity, transform; animation: nh-breathe 20s ease-in-out infinite alternate; }
@keyframes nh-breathe { 0% { transform: scale(1.0); } 100% { transform: scale(1.2); } }
/* Home <-> item mode: gradients can't transition, so BOTH overlays exist stacked and
   crossfade via opacity (::after = home tint, ::before = lighter item tint); the layer
   brightness change rides the filter transition above. Previously the gradient and
   filter swapped instantly, a visible snap when opening a book. */
#nh-home-bg::after { content: ''; position: absolute; inset: 0; z-index: 2; background: linear-gradient(180deg, rgba(var(--nh-bg-rgb), 0.5) 0%, rgba(var(--nh-bg-rgb), 0.8) 55%, rgb(var(--nh-bg-rgb)) 100%) !important; opacity: 1; transition: opacity 1.2s ease !important; }
#nh-home-bg::before { content: ''; position: absolute; inset: 0; z-index: 2; background: linear-gradient(180deg, rgba(var(--nh-bg-rgb), 0.3) 0%, rgba(var(--nh-bg-rgb), 0.6) 55%, rgb(var(--nh-bg-rgb)) 100%) !important; opacity: 0; transition: opacity 1.2s ease !important; }
body.nh-cinematic-item #nh-home-bg .nh-bg-layer { filter: blur(55px) brightness(0.62) saturate(1.3) !important; }
body.nh-cinematic-item #nh-home-bg::after { opacity: 0; }
body.nh-cinematic-item #nh-home-bg::before { opacity: 1; }

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
.nh-er-select { background: rgba(255,255,255,0.06); color: var(--nh-text-1, #eee); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 6px 10px; font-size: 0.9rem; min-width: 14rem; max-width: 100%; cursor: pointer; }
.nh-er-select:focus { outline: none; border-color: var(--nh-amber, #e0c27a); box-shadow: 0 0 0 1px var(--nh-amber, #e0c27a); }
.nh-er-select optgroup, .nh-er-select option { background: var(--nh-canvas, #181512); color: var(--nh-text-1, #eee); }

/* ============ MODALS & TABLES ============ */
.modal.modal-bg { background-color: rgba(14,11,7,0.55) !important; backdrop-filter: blur(2px) !important; -webkit-backdrop-filter: blur(2px) !important; }
.modal.modal-bg .bg-bg { background-color: var(--nh-canvas) !important; }
/* Modal outer box: bound to the viewport (ABS ships it at 80vh inline). It scrolls as a
   whole, so this alone keeps single-scroll modals (e.g. the item editor) usable. */
.modal [style*="max-height: 80vh"] { max-height: 90vh !important; }
/* Scroll regions NESTED inside a modal (e.g. the Find-Chapters results list) must leave
   room for the modal's header + footer buttons. The old rule inflated them to 85vh too,
   so header + 85vh list + footer overflowed the viewport and the Apply/Map buttons fell
   off the bottom. Cap nested lists well below the box height instead. */
.modal [style*="max-height: 80vh"] .overflow-y-auto,
.modal [style*="max-height: 80vh"] .overflow-y-scroll,
.modal .max-h-80.overflow-y-auto { max-height: 60vh !important; }
/* Those three selectors are DEAD on ABS 2.36: nothing carries an inline
   "max-height: 80vh" any more (established while fixing #14). Kept for older builds.
   REMOVED in 2.3.1, and worth saying why so it does not come back (GitHub #22):
   a rule was added here in 2.1.1 capping every scroller inside the modal at
   calc(100% - 150px), to stop a long Find Chapters list pushing its buttons off
   screen. It also hit the editor's own form area, which cost 70px (#19), and the
   exclusion added in 2.1.2 named #formWrapper specifically. That id does not
   exist in every ABS layout, niblem85's dialog has no #formWrapper at all, so on
   those the cap applied to the main form scroller and stole 150px, which is the
   band he kept reporting.
   It was never needed anyway: the panel clamp below already keeps the buttons on
   screen, proven by re-running the 192-row test at every height with this rule
   removed. Adding a second guard on top of one that already worked caused two
   separate regressions. Do not re-add it without first showing the clamp is
   insufficient. */
/* #22 follow-up. Cover and Match still stopped short of the panel's bottom edge
   while Details filled it. Same symptom, two unrelated stock-ABS causes.
   COVER: the results grid is "sm:max-h-80 sm:overflow-y-scroll", a hard 320px box
   inside a 648px tab. Past about four rows of covers the grid stops 95px above the
   panel edge and that band stays empty however far you scroll. Drop the cap and the
   nested scrollbar with it. The tab already owns a scroller (the same single-scroll
   shape Details uses), so letting that one do the work fills the panel. BOTH classes
   are required in the selector: max-h-80 on its own is every ui-dropdown menu in the
   app, and those must keep their cap. The negative bottom margin cancels the mb-5 each
   cover tile carries for the row gutter, which is needed between rows but is dead
   weight under the last one. That leaves the container's own py-6 as the only gap at
   the edge, which is what the Details form leaves too.
   MATCH: a smaller band, 31px, and a different reason. ABS sizes the results list with
   its own rule, height: calc(100% - 80px), a hardcoded guess at what the search form
   above it takes (124px below the sm breakpoint, where that form wraps to two rows).
   The form and its mt-4 measure 74px, so the list hands back 6px it could have used,
   and #match-wrapper's py-6 accounts for the other 24. The Loading / No Results
   placeholders miss by much more: they are h-full, 100% of the wrapper, sitting below
   a 58px form, so they hang 33px past the bottom edge, get clipped, and their centred
   text sits visibly low. One flex column gives all three exactly the height that is
   left, at any window size and either breakpoint, with no number to guess. The
   selected-match panel is position:absolute, so flex layout skips it and its own
   h-full still resolves against the padding box, unchanged. */
.modal [class*="max-h-80"][class*="overflow-y-scroll"] { max-height: none !important; overflow-y: visible !important; margin-bottom: -1.25rem !important; }
.modal #match-wrapper { display: flex !important; flex-direction: column !important; }
.modal #match-wrapper > form { flex: 0 0 auto !important; }
.modal #match-wrapper > .matchListWrapper,
.modal #match-wrapper > .h-full:not(.absolute) { flex: 1 1 auto !important; min-height: 0 !important; max-height: none !important; height: auto !important; }
/* GitHub #14, the item editor's Save buttons are unreachable on a short viewport.
   ABS's Modal component sizes its panel with INLINE styles computed when the modal
   opens (height: innerHeight - 150; margin-top: 75px) and never re-clamps them, so the
   panel keeps a height the viewport no longer has. Nothing scrolls back to the footer:
   the panel is inside a position:fixed overlay, and the only scroller (#formWrapper)
   sits ABOVE the button row. Reproduced identically on unthemed ABS, so this is an
   upstream flaw we bound rather than a regression of ours.
   Fixing it in CSS costs one rule and covers every trigger, browser or OS zoom, a
   resized window, a bookmarks bar appearing, a rotated tablet. max-height beats the
   inline height, #formWrapper's own max-height is a PERCENTAGE of the panel so the
   form area shrinks with it, and the footer stays on screen.
   Panel bottom = (viewport + height + margin-top) / 2 (the overlay centres it), so the
   panel fits exactly while height + margin-top <= viewport. Leaving 20px of slack keeps
   a visible gap rather than a flush edge. */
.modal > div[style*="min-height"][style*="margin-top"] { max-height: calc(95vh - 75px) !important; max-height: calc(100dvh - 95px) !important; }
/* Below this, 75px of top margin is a big slice of the screen. Trade most of it for
   content, but NOT all of it: the item editor's tab strip is absolutely positioned
   ABOVE the panel (-top-10, i.e. 40px up), so a margin smaller than that pushes
   Details/Cover/Chapters/Files off the top edge, and those are the only way to move
   between tabs. Keep enough room for the strip and take the rest off the height. */
@media (max-height: 560px) {
  .modal > div[style*="min-height"][style*="margin-top"] { margin-top: 46px !important; max-height: calc(95vh - 56px) !important; max-height: calc(100dvh - 66px) !important; }
}
/* Description rich-text editor (Trix). ABS ships it neutral-gray (rgb(35,35,35)) which
   clashes with the warm theme, recolour the editor surface and its toolbar. Use
   background-COLOR (not the shorthand) on buttons so their icon background-image survives.
   NOT scoped to .modal: ABS lazy-loads Trix's stylesheet with the edit-modal chunk, and the
   .modal ancestor never matched, so this whole block was dead CSS. Trix only ever renders in
   that modal, so plain element selectors are both sufficient and reliable.
   (Never use backticks in these comments - this whole sheet is one template literal.) */
trix-editor, .trix-content {
    min-height: 240px !important;
    background-color: rgba(0,0,0,0.2) !important;
    color: var(--nh-text-2) !important;
    border: 1px solid var(--nh-hairline-lit) !important;
    border-radius: 12px !important;
}
trix-toolbar { background-color: transparent !important; }
trix-toolbar .trix-button-group { background-color: transparent !important; border: 1px solid var(--nh-hairline) !important; border-radius: 10px !important; overflow: hidden; }
trix-toolbar .trix-button { background-color: transparent !important; border-bottom: none !important; color: var(--nh-text-2) !important; }
trix-toolbar .trix-button:not(:first-child) { border-left: 1px solid var(--nh-hairline) !important; }
trix-toolbar .trix-button:hover { background-color: var(--nh-amber-tint) !important; }
trix-toolbar .trix-button.trix-active { background-color: var(--nh-amber-tint) !important; }
/* Trix 1.3.1 paints each glyph as a black SVG data-URI on the button's ::before at opacity .6,
   which on the dark surface is near-invisible. Filter the ::before rather than the button so
   the glyph brightens without inverting the amber hover/active background behind it. */
trix-toolbar .trix-button::before {
    opacity: 1 !important;
    filter: invert(1) sepia(0.25) !important;
}
trix-toolbar .trix-button:hover::before,
trix-toolbar .trix-button.trix-active::before {
    filter: invert(1) sepia(0.6) saturate(2.2) brightness(1.05) !important;
}
trix-toolbar .trix-button:disabled::before { opacity: 0.3 !important; }

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

/* Bottom clearance so the LAST item can scroll clear of the floating player (fixed,
   bottom:24px, ~110px tall). It MUST go on the real scroll containers, never on the
   .page wrapper: .page is overflow-hidden + h-full, so padding there only shrinks the
   inner scroller and leaves a permanent empty "lip". As scroller padding it lives inside
   the scroll flow, so it's only ever seen once you scroll to the very bottom. Home/library
   scrolls on #bookshelf, item pages on #item-page-wrapper. Only while the player is open. */
body:has(#mediaPlayerContainer) #bookshelf,
body:has(#mediaPlayerContainer) #item-page-wrapper { padding-bottom: var(--nh-player-pad, 190px) !important; }
/* …and the two page-level scrollers that were missing it: the series header
   COLUMN on desktop (its description ran 26px under the player) and the plain
   page wrapper behind /account and /config (183px under). The item page is
   excluded, #item-page-wrapper above already reserves its own clearance, and
   padding both would double it. Phones are covered by .nh-series-cols instead,
   hence the desktop-only guard on the header. */
body:has(#mediaPlayerContainer) #page-wrapper:not(:has(#item-page-wrapper)),
body:has(#mediaPlayerContainer) #nh-cols-grid { padding-bottom: var(--nh-player-pad, 190px) !important; }
@media (min-width: 1024px) {
  body:has(#mediaPlayerContainer) #nh-series-header { padding-bottom: var(--nh-player-pad, 190px) !important; }
}

/* Series page: the grid must be able to scroll AT LEAST as far as the header
   overflows, or a short shelf under a long description leaves the header's
   tail unreachable (user report). A real ::after spacer, not padding, Chrome
   ignores a scroll container's bottom padding past overflowing content. */
body.nh-series-page #bookshelf.nh-with-series-header::after { content: ''; display: block; width: 1px; height: var(--nh-sp-extra, 0px); }

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
#mediaPlayerContainer .bg-gray-700 { box-shadow: 0 2px 6px rgba(0,0,0,0.6) !important; border-radius: 9999px !important; }
#mediaPlayerContainer .bg-gray-700 .bg-gray-200 { background-color: var(--nh-amber) !important; }
#mediaPlayerContainer .modal { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
#mediaPlayerContainer .modal * { text-shadow: none !important; }
#mediaPlayerContainer .modal .text-gray-300, #mediaPlayerContainer .modal .text-gray-400 { color: var(--nh-text-2) !important; }
body:has(#mediaPlayerContainer) [aria-label="Library Sidebar"] .border-t { display: none !important; }
body:has(#reader) #mediaPlayerContainer { z-index: 61 !important; }
/* #24: the 61 above beats every menu the ereader itself opens. The settings
   modal is a .modal that teleports to body when shown (display flex, still
   z-60, one short); the TOC drawer lives INSIDE #reader (z-60 context), so no
   z-index of its own could ever clear the player. Fix both: any visible modal
   outrunning the player while reading, and the reader itself lifted while its
   drawer is open (open = translate-x-0 on the transition-transform child; the
   modal-child variant covers ABS builds that keep the modal inside #reader). */
body:has(#reader) .modal:not(.hidden) { z-index: 70 !important; }
#reader:has(> .transition-transform.translate-x-0),
#reader:has(> .modal:not(.hidden)) { z-index: 70 !important; }
/* Fill the whole viewport with the reader background when the player is open.
   Stock shrinks #reader to calc(100% - 164px), exposing the page underneath.
   Safe: epub.js computes page height in JS (windowHeight - 164), not from this CSS,
   so text never flows under the floating player. */
#reader.reader-player-open { height: 100% !important; }

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
       banner inside each slide doesn't fill that stretched height on its own,        that gap is both the "shadow on short slides" and the phantom scroll
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
    /* Preserve logo aspect ratio on mobile. The old height-only cap left width at the
       32px min-w-8 box, so object-fit:fill squished square/custom logos to 32x20.
       Let width track height and never stretch. */
    #appbar a[href$="/"] img { height: 22px !important; width: auto !important; min-width: 0 !important; max-width: 150px !important; object-fit: contain !important; }
    #appbar h1 { display: none !important; }
    .nh-hide-upload-mobile { display: none !important; }

    /* Drawer height already uses 100dvh at the source (see #nh-mobile-drawer above),        100vh includes the mobile address-bar strip, causing "one more swipe to
       reach the true bottom" on any page with a 100vh-sized fixed element. */

    /* Welcome heading, scoped to #bookshelf so book detail titles aren't touched */
    #bookshelf h1, #bookshelf .text-3xl, #bookshelf .text-4xl, #bookshelf .text-5xl { font-size: 1.3rem !important; line-height: 1.15 !important; }
    /* #bookshelf .categoryPlacard h2 is the STANDARD-view shelf title; it has to step
       down with its DETAIL-view twin or the two views disagree on a phone. */
    .bookshelf-row h2, .nh-rs-heading, #bookshelf .categoryPlacard h2 { font-size: 1.05rem !important; }

    /* Card labels (title/author under the covers): ABS scales them by inheritance from
       the cover-size slider, so at small sizes (60) they shrink to ~7px. Floor the text
       wrapper at a readable size; 1em keeps larger slider values exactly as they were. */
    [cy-id="detailBottom"] { font-size: max(0.72rem, 1em) !important; }

}

/* Hero: on portrait / narrow widths (phone AND tablet, up to 1023px) the desktop
   2-column layout leaves a big central gap, a truncated title, and blank space below
   the buttons. Use a centered vertical stack that fills the width. Sizes scale with the
   viewport (clamp) so one block covers ~320-1023px. Child 1=bg, 2=gradient, 3=text, 4=cover. */
@media (max-width: 1023.98px) {
    /* Do NOT zero padding-right here: enhancements.js sets it to the shelf row's own
       padding-left so the banner is inset equally on both sides. Zeroing it (old rule)
       made the carousel touch the right screen edge while keeping the left gutter. */
    #nh-hero-container { width: 100% !important; }
    .nh-hero-banner { flex-direction: column !important; align-items: center !important; text-align: center !important; padding: clamp(20px, 4vw, 40px) clamp(18px, 4vw, 44px) !important; gap: 0 !important; border-radius: 18px !important; }
    /* cover on top, real portrait aspect, responsive, never cropped */
    .nh-hero-banner > div:nth-child(4) { order: 1 !important; width: auto !important; height: auto !important; margin: 0 auto clamp(14px, 2.5vw, 22px) !important; flex-shrink: 0 !important; }
    /* --nh-hero-cover-h: set by nhHeroFit on phones so the whole banner fits
       the first screen; the fallback is the stock responsive clamp. */
    .nh-hero-banner > div:nth-child(4) img { width: auto !important; height: var(--nh-hero-cover-h, clamp(150px, 26vw, 250px)) !important; max-width: 62vw !important; object-fit: contain !important; border-radius: 12px !important; }
    #nh-hero-container.nh-hero-tight .nh-hero-banner div[style*="line-clamp"] { -webkit-line-clamp: 2 !important; }
    /* text column: full width, centered */
    .nh-hero-banner > div:nth-child(3) { order: 2 !important; width: 100% !important; padding-right: 0 !important; min-width: 0 !important; align-items: center !important; }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(1) { margin-bottom: 10px !important; }
    .nh-hero-title {
        white-space: normal !important; font-size: clamp(1.4rem, 4.2vw, 2.6rem) !important; line-height: 1.2 !important;
        display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;
        overflow: hidden !important; text-align: center !important; margin: 0 auto 6px !important; max-width: 100% !important; padding-bottom: 0 !important;
    }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(3) { font-size: clamp(0.85rem, 2vw, 1.15rem) !important; margin-bottom: 14px !important; text-align: center !important; }
    /* description: keep it (it fills the space) but clamp + constrain + center */
    .nh-hero-banner div[style*="line-clamp"] { display: -webkit-box !important; -webkit-line-clamp: 3 !important; font-size: clamp(0.85rem, 1.8vw, 1.05rem) !important; line-height: 1.5 !important; margin: 0 auto 18px !important; max-width: 560px !important; text-align: center !important; }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(4) { justify-content: center !important; margin-bottom: 16px !important; gap: 8px !important; }
    span[style*="border-radius: 20px"][style*="backdrop-filter"] { font-size: clamp(0.6rem, 1.4vw, 0.8rem) !important; padding: 3px 9px !important; }
    /* button + progress row: center + wrap; progress sits under the button on narrow */
    .nh-hero-banner > div:nth-child(3) > div:last-child { justify-content: center !important; flex-wrap: wrap !important; gap: 16px !important; width: 100% !important; }
    .nh-hero-play, .nh-hero-read { padding: clamp(9px, 1.6vw, 14px) clamp(20px, 3.2vw, 32px) !important; font-size: clamp(0.9rem, 1.9vw, 1.15rem) !important; border-radius: 10px !important; }
    .nh-hero-banner div[style*="flex: 1; max-width: 320px"] { max-width: 360px !important; flex: 1 1 220px !important; width: 100% !important; }
    #nh-hero-nav { margin-top: 16px !important; }
    #nh-hero-nav .nh-nav-arrow { width: clamp(32px, 5vw, 40px) !important; height: clamp(32px, 5vw, 40px) !important; }
}

/* Hero auto-advance toggle. Paused is a sticky state, not a momentary press, so
   it has to read as latched rather than as one more arrow: the accent ring is
   what tells you the carousel is being held rather than merely idle. */
#nh-hero-pause { margin-left: 6px; }
#nh-hero-pause:hover { background: rgba(255,255,255,0.12) !important; }
#nh-hero-pause.nh-hero-paused { background: var(--nh-amber-tint, rgba(224,194,122,0.12)) !important; border-color: var(--nh-amber, #e0c27a) !important; }
#nh-hero-pause.nh-hero-paused .material-symbols { color: var(--nh-amber, #e0c27a) !important; }

/* Phones: the cover IS the hero (Pawel). Eyebrow, tag chips and the description
   go; the cover grows to ~60vw; the progress bar shares ONE line with the
   Continue button (no wrap). nth-child targeting stays valid because hidden
   children still count for :nth-child. */
@media (max-width: 640px) {
    .nh-hero-banner { padding: 20px 16px 22px !important; }
    .nh-hero-banner > div:nth-child(3) > div:nth-child(1) { display: none !important; }  /* eyebrow */
    .nh-hero-banner .nh-hero-tags { display: none !important; }
    /* div+class ties the line-clamp rule's specificity; later block wins */
    .nh-hero-banner div.nh-hero-desc { display: none !important; }
    .nh-hero-banner > div:nth-child(4) img { height: var(--nh-hero-cover-h, clamp(220px, 60vw, 330px)) !important; max-width: 84vw !important; }
    .nh-hero-author { margin-bottom: 14px !important; font-size: 0.95rem !important; }
    /* progress bar first, Continue full-width under it (Pawel), explicit
       order on the progress box, not column-reverse, so a Read button keeps
       its place after Play */
    .nh-hero-banner > div:nth-child(3) > div:last-child { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
    .nh-hero-banner div[style*="flex: 1; max-width: 320px"] { order: -1 !important; flex: none !important; width: 100% !important; max-width: none !important; }
    .nh-hero-prog-left, .nh-hero-prog-right { font-size: 0.72rem !important; }
    .nh-hero-play, .nh-hero-read { width: 100% !important; justify-content: center !important; padding: 11px 18px !important; font-size: 0.95rem !important; }
}

/* Series-page header (built by enhancements.js). All header styling lives HERE, not in
   the recent-series style block, that one is only injected on the home page, so a direct
   series-page load rendered the header unstyled.
   Mobile/stacked: header above #bookshelf, takes over appbar/toolbar clearance, bookshelf
   gives up that height so the 100% chain still sums. Desktop: two columns, details left. */
body #nh-series-header { padding: 87px 26px 10px; }
body.nh-has-toolbar #nh-series-header { padding-top: 127px; }
#nh-series-header .nh-sh-eyebrow { font-family: var(--nh-sans, system-ui); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--nh-amber, #e0c27a); opacity: 0.9; }
/* Custom series cover in the header (A1): full column width, same box the
   description text fills. Upload/remove live in the series toolbar kebab menu
   (admin only, injected by enhancements.js); the header just hosts the hidden
   file input and a tiny status glyph. */
/* The shadow must fit INSIDE the header column's padding. That column is
   overflow-y:auto, and CSS promotes the other axis to auto as well, so it clips
   horizontally: a 34px blur reaches ~17px sideways against a 16px right padding
   and got sliced into a hard vertical edge. Negative spread keeps the shadow
   under the cover (~6px sideways) instead of racing the padding. */
#nh-series-header .nh-sh-cover { display: none; position: relative; width: 100%; aspect-ratio: 1 / 1; border-radius: 14px; background-position: center; background-size: cover; background-color: var(--nh-raised, #221e1a); box-shadow: 0 14px 24px -6px rgba(0,0,0,0.55); margin: 0 0 16px; }
#nh-series-header .nh-sh-cover.nh-on { display: block; }
html.nh-covers-std #nh-series-header .nh-sh-cover { aspect-ratio: 1 / 1.6; }
#nh-series-header .nh-sh-tools { display: inline-flex; gap: 6px; margin-left: 10px; vertical-align: middle; }
#nh-series-header .nh-sh-editstatus { font-size: 0.72rem; color: var(--nh-muted-2, #9a9085); }
/* Author names in the header are SPA links to the author page */
#nh-series-header .nh-sh-author a { color: inherit; cursor: pointer; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color .15s; }
#nh-series-header .nh-sh-author a:hover { border-bottom-color: var(--nh-amber, #e0c27a); }
/* Series description editor modal (admin; reuses the ratings popup chrome) */
#nh-sd-modal, #nh-col-modal, #nh-ct-modal, #nh-ab-modal, #nh-us-modal, #nh-ae-modal, #nh-rf-sheet, #nh-hx-modal, #nh-rd-modal, #nh-amf-confirm { position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
/* Carousel X confirmation (#18). Small, so it gets a narrower box than the rest.
   z-index above the shared 500: it can be raised from the home page while nothing
   else is open, but it must never end up behind anything it was opened from. */
#nh-hx-modal { z-index: 620; }
#nh-hx-modal .nh-rt-modal-box { max-width: 440px; width: 92vw; padding: 24px 24px 18px; }
#nh-hx-modal .nh-hx-msg { margin: 0 0 20px; font-size: 0.95rem; line-height: 1.55; color: var(--nh-text-1, #f4eee2); }
/* Three actions, and the labels are full sentences in some languages, so they wrap
   to their own lines rather than being squeezed onto one. Cancel sits apart from
   the two that actually do something. */
#nh-hx-modal .nh-hx-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap; }
#nh-hx-modal .nh-hx-btn { padding: 9px 18px; border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; background: none; color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.86rem; cursor: pointer; min-height: 38px; }
#nh-hx-modal .nh-hx-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
#nh-hx-modal .nh-hx-cancel { margin-right: auto; }
/* Keeps your place, and matches what stock ABS does, so this is the default. */
#nh-hx-modal .nh-hx-hide { border-color: var(--nh-amber, #e0c27a); color: var(--nh-amber, #e0c27a); }
#nh-hx-modal .nh-hx-hide:hover { background: var(--nh-amber, #e0c27a); color: #241c0c; }
/* Discards your place. Warm red so it reads as the heavier choice without shouting. */
#nh-hx-modal .nh-hx-reset { border-color: rgba(224,122,106,0.55); color: #e07a6a; }
#nh-hx-modal .nh-hx-reset:hover { background: rgba(224,122,106,0.16); color: #f0a294; border-color: #e07a6a; }
@media (max-width: 520px) {
  #nh-hx-modal .nh-hx-actions { flex-direction: column-reverse; align-items: stretch; }
  #nh-hx-modal .nh-hx-cancel { margin-right: 0; }
  #nh-hx-modal .nh-hx-btn { width: 100%; }
}
.nh-sd-ta { width: 100%; min-height: 180px; background: rgba(0,0,0,0.25); color: var(--nh-text-2, #d8cfc2); border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; padding: 10px 12px; font-size: 0.92rem; line-height: 1.5; font-family: inherit; resize: vertical; box-sizing: border-box; }
.nh-sd-ta:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }
#nh-series-header h1 { font-family: var(--nh-serif), Georgia, serif; font-size: 1.6rem; font-weight: 600; color: var(--nh-text-1, #f2ecdf); margin: 4px 0 8px; line-height: 1.12; }
#nh-series-header .nh-sh-author { font-family: var(--nh-serif), Georgia, serif; font-size: 1.05rem; color: var(--nh-amber, #e0c27a); margin: 0 0 2px; }
#nh-series-header .nh-sh-stats { font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: var(--nh-muted-2, #9a9085); margin: 0 0 12px; }
#nh-series-header .nh-sh-desc { font-size: 0.88rem; line-height: 1.55; color: var(--nh-text-2, #cfc6b8); display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden; margin: 0; white-space: pre-line; }
#nh-series-header .nh-sh-desc.nh-open { -webkit-line-clamp: unset; display: block; overflow: visible; }
#nh-series-header .nh-sh-more { background: none; border: none; padding: 4px 0 0; margin: 0; color: var(--nh-amber, #e0c27a); font-size: 0.8rem; font-family: var(--nh-sans, system-ui); cursor: pointer; text-align: left; }
#nh-series-header .nh-sh-more:hover { text-decoration: underline; }
/* Series rating: DERIVED from the books' ratings (no separate user rating).
   Big non-interactive stars + score + how many books are rated. */
#nh-series-header .nh-sh-rate { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 12px; font-family: var(--nh-sans, system-ui); }
#nh-series-header .nh-sh-rate .nh-rt-stars { font-size: 1.5rem; letter-spacing: 2px; }
/* align-items:center centres the BOXES, not the ink. The star glyph has no
   descender so it hangs at the bottom of its line box, while the serif digits
   use none of the font's descent and ride high in theirs -- measured 2px apart
   at every breakpoint, and the same 2px for both default fonts (Spectral and
   Merriweather). The "N rated" note is already aligned to 0.09px, so it must
   not move. Do NOT switch the row to align-items:baseline: measured baselines
   are stars 765.31 / score 762.31 / note 760.72, which is strictly worse. */
#nh-series-header .nh-sh-rate .nh-rt-score { font-size: 1.25rem; font-weight: 600; color: #f4eee2; font-family: var(--nh-serif), 'Spectral', serif; line-height: 1; position: relative; top: 2px; }
#nh-series-header .nh-sh-rate .nh-sh-rate-note { font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); }
/* A7: average-rating stars on a rated card (library grid, home shelves, series
   page, search page). They live in the CAPTION, right-aligned on the line ABS
   already draws for the author, and they are always visible.
   WHY NOT ON THE COVER, ON HOVER (what this replaces): a hover-revealed badge is
   unreachable on a phone, and hover-on-desktop / always-on-touch is two designs
   rather than one (Pawel: "I rather have it the same on both mobile and web").
   WHY THE EXISTING LINE and not a new one: ABS computes card and shelf-row
   heights in Vue, so a third caption line spills into the row underneath.
   Sized in em, not rem: ABS scales the whole shelf by writing font-size on
   #bookshelf, so em makes the stars track the cover-size control for free.
   The room the stars need is reserved by nhCardRatings() as a padding on the
   text element, it is measured, because a fixed reserve is either wasteful or
   short depending on cover size. */
[id^="description-area-"] .nh-cr, [cy-id="detailBottomText"] .nh-cr { position: absolute; right: 0; bottom: 0.14em; z-index: 5; display: flex; align-items: center; pointer-events: none; }
/* Book captions are two lines and the badge belongs on the lower (author) one,
   hence bottom-anchoring above. A SERIES caption is just the title, so that same
   anchor left the stars hanging below it (Pawel). Span the caption and centre. */
[id^="series-card-"] [cy-id="detailBottomText"] .nh-cr { top: 0; bottom: 0; align-items: center; }
/* On the page background, not over artwork: drop the white/text-shadow treatment
   the cover strip needed and sit in the caption palette instead. */
[id^="description-area-"] .nh-cr .nh-cr-stars, [cy-id="detailBottomText"] .nh-cr .nh-cr-stars { font-size: 0.74em; letter-spacing: 0.05em; }
[id^="description-area-"] .nh-cr .nh-cr-num, [cy-id="detailBottomText"] .nh-cr .nh-cr-num { font-size: 0.72em; font-weight: 600; color: var(--nh-text-2, #d8cfc2); text-shadow: none; }
.nh-cr-wrap { display: inline-flex; align-items: center; gap: 0.32em; font-family: var(--nh-sans, system-ui); }
.nh-cr-n { font-size: 0.68rem; color: rgba(255,255,255,0.75); }
.nh-cr-num { font-size: 0.82rem; font-weight: 700; color: #fff; line-height: 1; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }
.nh-gs-stars { margin-top: 2px; }
.nh-gs-stars .nh-cr-stars { font-size: 0.7rem; letter-spacing: 1px; }
.nh-gs-stars .nh-cr-n { color: var(--nh-muted-2, #9a9085); }
/* A8 v2: rating options integrated INTO the native Filter/Sort dropdowns + the
   overlay results grid. While active the native (virtual) shelf is only
   visibility-hidden, its layout and measuring loops keep running so handing
   back never re-flows. The dropdowns themselves get a frosted reskin. */
#toolbar button.bg-bg { background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 9px !important; transition: background 0.15s, border-color 0.15s; }
#toolbar button.bg-bg:hover { background: rgba(255,255,255,0.11) !important; border-color: rgba(255,255,255,0.30) !important; }
#toolbar ul li.select-none { font-family: var(--nh-sans, system-ui); }
#toolbar ul li.select-none:hover { background: rgba(255,255,255,0.07); }
.nh-lf-mhead { padding: 8px 12px 3px; font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); font-family: var(--nh-sans, system-ui); border-top: 1px solid rgba(255,255,255,0.08); margin-top: 4px; list-style: none; }
.nh-lf-mi { list-style: none; }
.nh-lf-mi .nh-lf-mcheck { position: absolute; top: 50%; transform: translateY(-50%); right: 10px; font-size: 0.85rem; font-weight: 700; color: var(--nh-amber, #e0c27a); font-family: var(--nh-sans, system-ui); }
/* dropdown identity icons (funnel / arrows), the two buttons looked identical */
#toolbar .nh-lf-ico { display: inline-flex; align-items: center; flex: none; margin-right: 6px; opacity: 0.7; color: currentColor; }
#toolbar .nh-lf-hasico { justify-content: flex-start !important; }
#toolbar .nh-lf-hasico > .truncate, #toolbar .nh-lf-hasico > .nh-lf-lbl { flex: 1 1 auto; min-width: 0; }
/* value rows carry counts; keep the check slot readable for "2↓" badges */
.nh-lf-mi { padding-right: 34px !important; }
#toolbar .nh-lf-count { display: inline-flex; align-items: center; height: 2.25rem; padding: 0 12px; margin-right: 4px; border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; background: rgba(255,255,255,0.06); font-size: 0.75rem; color: var(--nh-text-2, #cfc6b8); font-family: var(--nh-sans, system-ui); white-space: nowrap; }
#toolbar .nh-lf-clearx { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: 4px; border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; background: rgba(255,255,255,0.06); font-size: 0.8rem; color: var(--nh-text-2, #cfc6b8); font-family: var(--nh-sans, system-ui); cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
#toolbar .nh-lf-clearx:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.3); }

/* Carousel X (GitHub #18): reset progress on the book showing, same action as the X
   beside the progress bar on the book page. It sits in the carousel's own top-right
   corner rather than on the cover, because the whole banner (cover included) is one
   big click target that opens the book, and a control inside it invites mis-clicks.
   Hidden until the carousel is hovered, and it keeps a generous hit area. */
.nh-hero-banner .nh-hero-x {
  position: absolute; top: 14px; right: 14px; z-index: 5;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.18); border-radius: 50%;
  background: rgba(0,0,0,0.42); color: #e8e0d2;
  font-family: var(--nh-sans, system-ui), sans-serif; font-size: 0.95rem; line-height: 1;
  cursor: pointer; opacity: 0; transition: opacity .18s ease, background .18s ease, color .18s ease, border-color .18s ease;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.nh-hero-banner:hover .nh-hero-x, .nh-hero-x:focus-visible { opacity: 1; }
.nh-hero-banner .nh-hero-x:hover { background: rgba(0,0,0,0.7); color: #fff; border-color: rgba(255,255,255,0.4); }
/* Touch has no hover, so leave it visible but quiet. */
@media (hover: none) {
  .nh-hero-banner .nh-hero-x { opacity: 0.75; }
}

/* ============ FILTER & SORT PANEL (v2.1) ============ */
/* Replaces ABS's two dropdowns with one pill, a chip row of what is active, and a
   panel holding the whole state at once. The native wrappers are only HIDDEN, never
   removed: Vue still owns that DOM, so modernFilters:false brings them straight
   back with nothing to rebuild. (No backticks in this file - see the header.) */
body.nh-ff-active #toolbar .nh-ff-nat { display: none !important; }
#toolbar #nh-ff-btn { display: inline-flex; align-items: center; gap: 7px; height: 2.25rem; padding: 0 12px; margin-right: 6px; border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; background: rgba(255,255,255,0.06); font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-text-2, #cfc6b8); cursor: pointer; white-space: nowrap; transition: background 0.15s, color 0.15s, border-color 0.15s; }
#toolbar #nh-ff-btn:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.3); }
#toolbar #nh-ff-btn.nh-ff-live { border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }
#toolbar #nh-ff-btn svg { flex: none; opacity: 0.85; }
#toolbar #nh-ff-btn .nh-ff-pip { display: inline-flex; align-items: center; justify-content: center; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px; background: var(--nh-amber, #e0c27a); color: #241c0c; font-size: 0.66rem; font-weight: 700; }
/* Chips live INSIDE the toolbar. A row of their own under a position:fixed toolbar
   would have to be accounted for in #bookshelf's padding, and every element that
   measures that padding would need to learn about it. */
#toolbar #nh-ff-chips { display: inline-flex; align-items: center; gap: 6px; max-width: min(52vw, 760px); overflow-x: auto; overflow-y: hidden; scrollbar-width: none; margin-right: 6px; vertical-align: middle; }
#toolbar #nh-ff-chips::-webkit-scrollbar { display: none; height: 0; }
#toolbar .nh-ff-chip { display: inline-flex; align-items: center; gap: 6px; flex: none; height: 26px; padding: 0 9px; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; background: rgba(255,255,255,0.07); font-family: var(--nh-sans, system-ui); font-size: 0.72rem; color: var(--nh-text-2, #cfc6b8); cursor: pointer; white-space: nowrap; }
#toolbar .nh-ff-chip:hover { background: rgba(255,255,255,0.14); color: #fff; }
#toolbar .nh-ff-chip i { font-style: normal; opacity: 0.6; font-size: 0.68rem; }
#toolbar .nh-ff-chip:hover i { opacity: 1; }
#toolbar .nh-ff-chip-sort { border-color: rgba(224,194,122,0.4); color: var(--nh-amber, #e0c27a); }
#toolbar .nh-ff-chip-clear { border-style: dashed; opacity: 0.8; }

#nh-ff-pop { position: fixed; z-index: 400; display: none; width: min(94vw, 660px); overflow-y: auto; overscroll-behavior: contain; background: var(--nh-canvas, #181512); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.13)); border-radius: 16px; box-shadow: 0 22px 60px rgba(0,0,0,0.66); font-family: var(--nh-sans, system-ui); scrollbar-width: thin; }
#nh-ff-pop .nh-ff-cols { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 7fr); gap: 0; align-items: start; }
#nh-ff-pop .nh-ff-col { padding: 16px 18px; min-width: 0; }
#nh-ff-pop .nh-ff-sortcol { border-right: 1px solid var(--nh-hairline, rgba(255,255,255,0.07)); }
#nh-ff-pop h3 { margin: 0 0 10px; font-size: 0.68rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); font-weight: 600; }
#nh-ff-pop .nh-ff-empty { margin: 0; padding: 6px 0; font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); font-style: italic; }
/* Two rows per level: name (with its precedence number and controls) above, the
   spelled-out direction below. On one row the direction pill squeezed the name
   down to "Ra...", and the name is the part you actually read. */
#nh-ff-pop .nh-ff-level { display: grid; grid-template-columns: 19px minmax(0, 1fr) auto auto; grid-template-areas: "num lbl up rm" "dir dir dir dir"; gap: 4px 7px; align-items: center; padding: 7px 0; }
#nh-ff-pop .nh-ff-level-nat { grid-template-columns: 19px minmax(0, 1fr); grid-template-areas: "num lbl" "dir dir"; border-top: 1px dashed rgba(255,255,255,0.12); margin-top: 4px; }
#nh-ff-pop .nh-ff-level-nat .nh-ff-lvl-lbl, #nh-ff-pop .nh-ff-level-nat .nh-ff-num { color: var(--nh-muted-2, #9a9085); }
#nh-ff-pop .nh-ff-addmenu button.nh-ff-cur { color: var(--nh-amber, #e0c27a); }
#nh-ff-pop .nh-ff-num { grid-area: num; display: inline-flex; align-items: center; justify-content: center; width: 19px; height: 19px; border-radius: 6px; background: rgba(224,194,122,0.16); color: var(--nh-amber, #e0c27a); font-size: 0.68rem; font-weight: 700; }
#nh-ff-pop .nh-ff-lvl-lbl { grid-area: lbl; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; color: var(--nh-text-1, #f4eee2); }
#nh-ff-pop .nh-ff-move { grid-area: up; }
#nh-ff-pop .nh-ff-rm { grid-area: rm; }
#nh-ff-pop .nh-ff-lvl-ctl { grid-area: dir; display: flex; flex-wrap: wrap; gap: 6px; }
#nh-ff-pop .nh-ff-dir { padding: 3px 9px; border: 1px solid rgba(255,255,255,0.14); border-radius: 7px; background: rgba(255,255,255,0.05); color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.7rem; cursor: pointer; white-space: nowrap; }
#nh-ff-pop .nh-ff-opt { border-style: dashed; }
#nh-ff-pop .nh-ff-dir:hover { background: rgba(255,255,255,0.12); color: #fff; }
#nh-ff-pop .nh-ff-move, #nh-ff-pop .nh-ff-rm { width: 22px; height: 22px; border: none; border-radius: 6px; background: none; color: var(--nh-muted-2, #9a9085); font-size: 0.78rem; cursor: pointer; }
#nh-ff-pop .nh-ff-move:hover, #nh-ff-pop .nh-ff-rm:hover { background: rgba(255,255,255,0.1); color: #fff; }
#nh-ff-pop .nh-ff-move:disabled { opacity: 0.25; cursor: default; }
#nh-ff-pop .nh-ff-add { margin-top: 8px; width: 100%; padding: 7px 10px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 9px; background: none; color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.78rem; text-align: left; cursor: pointer; }
#nh-ff-pop .nh-ff-add:hover { border-color: var(--nh-amber, #e0c27a); color: #fff; }
#nh-ff-pop .nh-ff-addmenu { margin-top: 6px; display: flex; flex-direction: column; border: 1px solid var(--nh-hairline, rgba(255,255,255,0.08)); border-radius: 9px; overflow: hidden; }
#nh-ff-pop .nh-ff-addmenu button { padding: 7px 11px; border: none; background: none; color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.8rem; text-align: left; cursor: pointer; }
#nh-ff-pop .nh-ff-addmenu button:hover { background: rgba(255,255,255,0.08); color: #fff; }
#nh-ff-pop .nh-ff-fhead { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
#nh-ff-pop .nh-ff-fhead h3 { margin: 0; flex: none; }
#nh-ff-pop .nh-ff-search { flex: 1 1 auto; min-width: 0; padding: 6px 10px; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; background: rgba(0,0,0,0.25); color: var(--nh-text-1, #f4eee2); font-family: inherit; font-size: 0.78rem; }
#nh-ff-pop .nh-ff-search:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }
#nh-ff-pop .nh-ff-search::-webkit-search-cancel-button { display: none; }
#nh-ff-pop .nh-ff-sec { border-top: 1px solid var(--nh-hairline, rgba(255,255,255,0.06)); }
#nh-ff-pop .nh-ff-sec:first-child { border-top: none; }
#nh-ff-pop .nh-ff-sec-h { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 2px; border: none; background: none; color: var(--nh-text-1, #f4eee2); font-family: inherit; font-size: 0.82rem; text-align: left; cursor: pointer; }
#nh-ff-pop .nh-ff-sec-h:hover { color: var(--nh-amber, #e0c27a); }
#nh-ff-pop .nh-ff-caret { flex: none; width: 12px; color: var(--nh-muted-2, #9a9085); font-size: 0.7rem; }
#nh-ff-pop .nh-ff-secn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px; background: var(--nh-amber, #e0c27a); color: #241c0c; font-size: 0.64rem; font-weight: 700; }
#nh-ff-pop .nh-ff-vals { padding: 0 0 8px 20px; }
#nh-ff-pop .nh-ff-val { display: flex; align-items: center; gap: 8px; padding: 4px 6px 4px 0; border-radius: 7px; cursor: pointer; }
#nh-ff-pop .nh-ff-val:hover { background: rgba(255,255,255,0.05); }
#nh-ff-pop .nh-ff-val input { flex: none; width: 14px; height: 14px; accent-color: var(--nh-amber, #e0c27a); cursor: pointer; }
#nh-ff-pop .nh-ff-vlbl { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: var(--nh-text-2, #cfc6b8); }
#nh-ff-pop .nh-ff-vn { flex: none; font-size: 0.7rem; color: var(--nh-muted-2, #9a9085); font-variant-numeric: tabular-nums; }
#nh-ff-pop .nh-ff-more { margin-top: 4px; padding: 4px 0; border: none; background: none; color: var(--nh-amber, #e0c27a); font-family: inherit; font-size: 0.75rem; cursor: pointer; }
#nh-ff-pop .nh-ff-foot { position: sticky; bottom: 0; display: flex; align-items: center; gap: 10px; padding: 11px 18px; border-top: 1px solid var(--nh-hairline, rgba(255,255,255,0.08)); background: var(--nh-canvas, #181512); }
#nh-ff-pop .nh-ff-info { flex: 1 1 auto; font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); font-variant-numeric: tabular-nums; }
#nh-ff-pop .nh-ff-foot-btn { padding: 6px 14px; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; background: none; color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.78rem; cursor: pointer; }
#nh-ff-pop .nh-ff-foot-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
#nh-ff-pop .nh-ff-done { border-color: var(--nh-amber, #e0c27a); color: var(--nh-amber, #e0c27a); }
/* Narrow screens: one column, and the chip row gives way to the pill's counter. */
@media (max-width: 720px) {
  #nh-ff-pop .nh-ff-cols { grid-template-columns: minmax(0, 1fr); }
  #nh-ff-pop .nh-ff-sortcol { border-right: none; border-bottom: 1px solid var(--nh-hairline, rgba(255,255,255,0.07)); }
  #toolbar #nh-ff-chips { display: none; }
}
/* Skeleton bars while the series data loads: the header column is created (and the
   two-column layout entered) BEFORE any data arrives, so the shelf never re-flows,    these placeholders just keep the reserved column from looking empty meanwhile. */
#nh-series-header.nh-sh-loading h1::before { content: ''; display: block; width: 62%; height: 1.5em; border-radius: 9px; background: rgba(255,255,255,0.08); }
#nh-series-header.nh-sh-loading .nh-sh-author::before { content: ''; display: block; width: 42%; height: 0.95em; border-radius: 7px; background: rgba(255,255,255,0.07); }
#nh-series-header.nh-sh-loading .nh-sh-stats::before { content: ''; display: block; width: 30%; height: 0.85em; border-radius: 7px; background: rgba(255,255,255,0.06); }
#nh-series-header.nh-sh-loading .nh-sh-desc { min-height: 5.6em; background: repeating-linear-gradient(180deg, rgba(255,255,255,0.055) 0, rgba(255,255,255,0.055) 0.75em, transparent 0.75em, transparent 1.4em); border-radius: 7px; }
#nh-series-header.nh-sh-loading h1, #nh-series-header.nh-sh-loading .nh-sh-author, #nh-series-header.nh-sh-loading .nh-sh-stats { animation: nh-sh-pulse 1.4s ease-in-out infinite alternate; }
@keyframes nh-sh-pulse { from { opacity: 0.55; } to { opacity: 1; } }
@media (max-width: 1023.98px) {
  /* Phones/stacked: the PAGE WRAPPER is the scroller and the shelf grows to its
     full content height (it does not scroll at all). Header simply sits above
     the grid in normal flow.

     Why not ABS's own scroller: a viewport-height change RESETS #bookshelf's
     scrollTop (measured: 3000 -> 19) and re-mounts its cards, and on Android the
     URL bar hides the instant you drag, so every scroll snapped back a moment
     later and the page felt frozen with the books parked far below. The wrapper
     is OUR element: its scrollTop survives that same rebuild untouched
     (measured: 3217 -> 3223). No transform sync, no measured padding, no
     --nh-sh-h dependency, nothing to go stale. */
  body.nh-series-page .nh-series-cols { position: relative; height: 100%; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
  body #bookshelf.nh-with-series-header { position: relative !important; height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; padding-top: 8px !important; }
  body #nh-series-header { position: static !important; transform: none !important; pointer-events: auto; }
  /* the floating cover-size control overlaps the last row, so the wrapper ends
     with room under it; the player (when up) needs the bigger clearance */
  /* !important: .page carries Tailwind's p-4, and ABS builds its utilities as
     !important, so a plain padding-bottom here never lands */
  body.nh-series-page .nh-series-cols { padding-bottom: 96px !important; }
  body:has(#mediaPlayerContainer).nh-series-page .nh-series-cols { padding-bottom: var(--nh-player-pad, 190px) !important; }
  body:has(#mediaPlayerContainer) #bookshelf.nh-with-series-header { padding-bottom: 0 !important; }
}
@media (max-width: 640px) {
  #nh-series-header h1 { font-size: 1.25rem; }
  #nh-series-header .nh-sh-desc { -webkit-line-clamp: 4; }
}
/* Series page mask: hidden from the instant of navigation (route hook) until the
   two-column layout is applied, the shelf re-measured, and badges painted, then one
   clean fade-in. Kills the staged reveal (wide books -> squeeze -> shift -> badges). */
/* Same instant-hide / animated-reveal split as the general page mask */
body.nh-series-page #bookshelf, #nh-series-header { transition: none; }
body.nh-series-page.nh-series-ready #bookshelf, body.nh-series-page.nh-series-ready #nh-series-header { transition: opacity 0.4s ease; }
body.nh-series-page:not(.nh-series-ready) #bookshelf,
body.nh-series-page:not(.nh-series-ready) #nh-series-header { opacity: 0 !important; }

/* Same idea for every other app page (home, grids, book detail, collections,
   settings, ...): the whole page container is masked from the instant of navigation
   until its content has settled (nhPageReveal), then one fade-in. The series detail
   pages use the dedicated mask above; login is handled by the boot veil. */
/* Hide is INSTANT (the outgoing page must vanish the moment navigation starts,    a 0.4s fade-out left its content ghosting mid-screen, user report); only the
   REVEAL of the settled page animates. */
body.nh-page-loading #app-content .page { transition: none; }
body.nh-page-loading.nh-page-ready #app-content .page { transition: opacity 0.4s ease; }
body.nh-page-loading:not(.nh-page-ready) #app-content .page { opacity: 0 !important; }
/* ============ ONE SIDE GUTTER FOR EVERY MAIN PAGE ============ */
/* Pawel: "margins on the sides of all main pages are different, unify them, I like
   the collections ones best." The collections grid's 44/64px is now the single
   source of truth (--nh-gutter) and every CSS-driven surface reads it.
   NOT unified here: the ABS virtual bookshelf (books/series GRID pages). Its ~107px
   is ABS centring fixed-width cards inside its own 64px shelfPadding, the leftover
   of the column it cannot fit is split onto both sides. It is computed in Vue
   (entitiesPerShelf / bookshelfMarginLeft), not CSS, and overriding that chain broke
   the card widths and collapsed the series view on resize. The supported lever is
   the cover-size setting; see the note in the handoff. */
/* The gutter is a DESKTOP measure. Held at 44px it ate 88px of a 360px phone --
   a quarter of the screen -- so it steps down with the viewport. Ordered widest
   query last among the max-widths: media queries add NO specificity, so the
   winner is source order. The min-width rule does not overlap them, so it can
   stay where it is. */
:root { --nh-gutter: 44px; }
@media (max-width: 1023.98px) { :root { --nh-gutter: 28px; } }
@media (max-width: 640px) { :root { --nh-gutter: 18px; } }
@media (max-width: 400px) { :root { --nh-gutter: 14px; } }
@media (min-width: 1600px) { :root { --nh-gutter: 64px; } }

/* ---- Centring the ABS virtual grid ----------------------------------------
   ABS lays each card out in a SLOT that is the card plus a 24px trailing gap,
   and centres those slots inside (viewport - 10px reserved for a scrollbar).
   Both of those live only on the right, so every grid row lands 17px left of
   true centre -- measured identical at 360px/1 column and 900px/3 columns.
   The cards carry an inline transform: translate3d(...) we must not touch, so
   the shift rides on margin-left, which composes with a transform and moves the
   card and its cover-background sibling by the same amount. NOT left: ABS's
   Tailwind build marks utilities !important, so the left-0 on every card beats
   any selector we can write (this cost a debugging round -- the rule matched,
   and left still computed to 0px). NOT a transform on the row either: that would
   make each shelf its own stacking context and drop card menus behind the row
   below. Nothing here touches the Vue sizing chain (entitiesPerShelf /
   bookshelfMarginLeft) -- overriding that broke card widths before.
   The offset is measured per layout in nhShelfNudge() -- a hardcoded 17px would
   be wrong the moment ABS changes its gap or a scrollbar appears.
   Grid pages only (body.nh-home is the carousel/shelf page, whose rows are
   horizontal scrollers with their own centring). */
body:not(.nh-home) #bookshelf [id^="shelf-"] > .absolute { margin-left: var(--nh-shelf-nudge, 0px); }
/* Phones: hand ABS back the 16px it holds in reserve. It sizes a grid with
   floor((shelfWidth - 16) / (cardWidth + gap)), so a layout can land one column
   short by a couple of pixels, Pawel's 360px phone at cover size 80 needed 346
   for two series columns and was offered 344. Widening the MEASURED shelf by
   exactly that reserve buys the column. The inflation is symmetric (-8px left,
   +16px wide = +8px right), so ABS's bookshelfMarginLeft and nhShelfNudge both
   still centre the row over the real viewport and nothing can overflow: the row
   is at most as wide as the true width. Not on home, its rows are horizontal
   scrollers with their own gutters. */
@media (max-width: 640px) {
  body:not(.nh-home) #bookshelf { width: calc(100% + 16px) !important; margin-left: -8px !important; }
}
/* Home shelf rows (were 32px) */
body.nh-home #bookshelf .bookshelf-row { padding-left: var(--nh-gutter) !important; padding-right: var(--nh-gutter) !important; }
/* Narrators card grid (was 4px inside a 32px shelf pad) */
#nh-narrators { padding-left: var(--nh-gutter) !important; padding-right: var(--nh-gutter) !important; }
body.nh-narrators-page #bookshelf { padding-left: 0 !important; padding-right: 0 !important; }

/* Filter / sort / search rebuild: ABS empties the virtual shelf and refills it, so
   the grid blanked and snapped back once per action. Cover the SHELF ONLY (the
   toolbar keeps its controls live under your cursor) for that beat, then fade back.
   Same instant-hide / animated-reveal split as the page mask. */
body.nh-requery #bookshelf { transition: none; }
body.nh-requery.nh-requery-ready #bookshelf { transition: opacity 0.25s ease; }
body.nh-requery:not(.nh-requery-ready) #bookshelf { opacity: 0 !important; }

/* B5: eased card entrance, cards mounting during the post-navigation window fade
   in instead of popping (opacity only: the virtual shelf owns the cards'
   positioning, transforms are off-limits). The window now closes ~1.2s after the
   REVEAL rather than 2.2s after the route change, so it never expires before a
   slow page has even appeared. :not([data-nh-stale]) keeps the animation off the
   OUTGOING page's still-mounted shelf, which nhRouteMask marks, restarting 100+
   dead cards' animations on every navigation bought nothing. */
@keyframes nhCardIn { from { opacity: 0; } to { opacity: 1; } }
/* Covers that land after the reveal ease in instead of snapping (nhCoverFadeIn
   tags each <img> on its load event). Short: this is polish on an already-visible
   page, not an entrance. */
@keyframes nhImgIn { from { opacity: 0; } to { opacity: 1; } }
#bookshelf img.nh-img-in, #item-page-wrapper img.nh-img-in { animation: nhImgIn 0.28s ease both; }
body.nh-entering #bookshelf:not([data-nh-stale]) [id^="book-card-"], body.nh-entering #bookshelf:not([data-nh-stale]) [id^="series-card-"], body.nh-entering #bookshelf:not([data-nh-stale]) [id^="collection-card-"], body.nh-entering #bookshelf:not([data-nh-stale]) [id^="author-card-"], body.nh-entering #bookshelf:not([data-nh-stale]) [id^="narrator-card-"], body.nh-entering #bookshelf:not([data-nh-stale]) [id^="playlist-card-"], body.nh-entering #nh-narrators .nh-nr-card { animation: nhCardIn 0.5s ease both; }
/* A9: narrators page, card grid replaces the stock table */
body.nh-narrators-page #app-content .page table { display: none !important; }
#nh-narrators { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 4px 4px 120px; }
.nh-nr-card { display: block; background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 70%); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.09)); border-radius: 14px; padding: 16px; text-decoration: none; color: inherit; transition: box-shadow 0.18s ease, border-color 0.18s ease; }
.nh-nr-card:hover { box-shadow: 0 12px 26px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.2); }
.nh-nr-covers { position: relative; height: 118px; margin-bottom: 14px; overflow: hidden; border-radius: 8px; }
/* fixed-size boxes: no reflow while covers stream in (the load-time jitter) */
.nh-nr-cbox { position: absolute; top: 0; display: block; width: 112px; height: 112px; border-radius: 7px; overflow: hidden; box-shadow: 0 6px 14px rgba(0,0,0,0.45); background: rgba(0,0,0,0.25); }
html.nh-covers-std .nh-nr-cbox { width: 70px; }
.nh-nr-cbox img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nh-nr-covers .nh-nr-c0 { left: 0; z-index: 3; }
.nh-nr-covers .nh-nr-c1 { left: 34%; top: 3px; z-index: 2; filter: brightness(0.85); }
.nh-nr-covers .nh-nr-c2 { left: 64%; top: 6px; z-index: 1; filter: brightness(0.7); }
.nh-nr-ph { display: flex; align-items: center; justify-content: center; width: 112px; height: 112px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.09)); font-family: var(--nh-serif), 'Spectral', serif; font-size: 2.4rem; color: var(--nh-amber, #e0c27a); }
.nh-nr-name { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.05rem; font-weight: 500; color: #efe9dd; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nh-nr-count2 { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); margin: 3px 0 0; }
/* narrators toolbar: right-aligned, pills matching the reskinned dropdowns */
#nh-nr-bar { display: flex; align-items: center; gap: 10px; margin-left: auto; }
/* .nh-nr-search is used by BOTH toolbars -- narrators (#nh-nr-bar) and authors
   (#nh-au-bar, created by nhAuthorsBar). Scoping it to #nh-nr-bar left the
   AUTHORS filter on ABS's Tailwind preflight (border 0, radius 0, transparent,
   16px system-ui), so it read as bare text floating at the toolbar's right edge.
   box-sizing is required: preflight leaves inputs content-box on some builds and
   190px + 12px padding would render 214px. Skin and hover match the canonical
   toolbar-button rule, so this input, the dropdown beside it and ABS's own pills
   are finally one family. */
.nh-nr-search { box-sizing: border-box; height: var(--nh-ctl-h, 28px); width: 190px; padding: 0 12px; border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: var(--nh-ctl-r, 11px); background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: var(--nh-text-1, #f4eee2); font-size: var(--nh-ctl-fs, 0.75rem); font-family: var(--nh-sans, system-ui); outline: none; transition: background-color .15s, border-color .15s, color .15s; }
.nh-nr-search::placeholder { color: var(--nh-muted-2, #8a8075); }
.nh-nr-search:hover { background: var(--nh-ctl-bg-hi, rgba(255,255,255,0.10)); border-color: var(--nh-amber, #e0c27a); }
.nh-nr-search:focus { border-color: var(--nh-amber, #e0c27a); box-shadow: 0 0 0 2px rgba(224,194,122,0.18); }
/* themed sort dropdown, pill button + DARK menu (a native select pops the
   white OS list, nothing like the reskinned dropdowns elsewhere) */
.nh-nr-dd { position: relative; }
.nh-nr-dd-btn { display: inline-flex; align-items: center; justify-content: space-between; height: 28px; width: 176px; padding: 0 12px; border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; background: rgba(255,255,255,0.06); color: var(--nh-text-2, #cfc6b8); font-size: 0.75rem; font-family: var(--nh-sans, system-ui); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.nh-nr-dd-btn:hover { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.30); }
.nh-nr-dd-chev { color: var(--nh-muted-2, #9a9085); font-size: 0.85rem; line-height: 1; margin-top: -4px; }
.nh-nr-dd-menu { display: none; position: absolute; top: calc(100% + 4px); right: 0; min-width: 100%; z-index: 60; background: var(--nh-raised, #221e1a); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 4px 0; box-shadow: 0 14px 30px rgba(0,0,0,0.5); }
.nh-nr-dd.nh-open .nh-nr-dd-menu { display: block; }
.nh-nr-dd-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 11px; font-size: 0.75rem; font-family: var(--nh-sans, system-ui); color: var(--nh-text-2, #cfc6b8); cursor: pointer; white-space: nowrap; }
.nh-nr-dd-row:hover { background: rgba(255,255,255,0.07); }
.nh-nr-dd-row .nh-nr-dd-check { visibility: hidden; color: var(--nh-amber, #e0c27a); font-weight: 700; margin-left: 12px; }
.nh-nr-dd-row.nh-active .nh-nr-dd-check { visibility: visible; }
#toolbar .nh-nr-count, #toolbar .nh-au-count { margin-right: auto; }
/* 16px is the gap ABS itself puts between the Match button and the sort dropdown
   (sm:ml-4). margin-left:auto computes to 0 here because ABS's own .grow spacer
   already absorbed the free space, so this padding is what creates the gap. */
/* gap, or the filter input and the Tidy button sit flush against each other
   at desktop widths (Pawel), the ≤640 block sets its own tighter gap. */
#nh-au-bar { display: flex; align-items: center; margin-left: auto; padding-left: 16px; gap: 10px; }
@media (max-width: 640px) {
  #nh-narrators { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); padding: 12px 14px 160px; gap: 14px; }
  .nh-nr-search { flex: 1 1 80px; min-width: 64px; width: auto; }
  #toolbar .nh-nr-count, #toolbar .nh-au-count { display: none; }
  /* Every child of these bars must be able to SHRINK: a justify-content:flex-end
     row whose content overflows spills out the LEFT edge, which painted the
     search box on top of the sort dropdown on the authors toolbar (phone). */
  #nh-nr-bar, #nh-au-bar { margin-left: 0; padding-left: 0; gap: 6px; flex: 1 1 auto; min-width: 0; justify-content: flex-end; }
  #nh-nr-bar select, #nh-au-bar select { max-width: 108px; }
  /* Four controls on one 360-412px row: everything one step smaller so the
     LABELS survive (they were ellipsising to "Matc…"/"Filt"), with real gaps,      the search box was sitting flush against both neighbours. */
  #nh-au-bar { gap: 7px; padding-left: 7px; }
  #nh-au-bar .nh-nr-search { flex: 1 1 44px; min-width: 40px; padding: 0 7px; font-size: 0.66rem; }
  #nh-au-bar .nh-nr-search:focus { flex-basis: 130px; }
  /* #toolbar-scoped: the base .nh-au-tidy rule lives LATER in this stylesheet
     and a media query adds no specificity, so a bare .nh-au-tidy here loses. */
  #toolbar .nh-au-tidy { flex: 0 1 auto; min-width: 0; max-width: 78px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 4px 7px; font-size: 0.63rem; }
  #toolbar > .abs-btn { font-size: 0.61rem !important; padding: 0 6px !important; height: 26px !important; white-space: nowrap !important; flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  body.nh-authors-list #toolbar, body.nh-narrators-page #toolbar { padding-left: 12px !important; padding-right: 12px !important; }
  body.nh-authors-list #toolbar .w-36, body.nh-narrators-page #toolbar .w-36 { width: 96px !important; flex: 0 0 auto; height: 26px !important; margin-left: 8px !important; }
  body.nh-authors-list #toolbar .w-36 button, body.nh-narrators-page #toolbar .w-36 button { font-size: 0.62rem !important; padding-left: 7px !important; padding-right: 5px !important; }
  body.nh-authors-list #toolbar .w-36 button .material-symbols { font-size: 0.95rem !important; }
  /* Author tiles: two-line names instead of "A. C. G…", the single-line
     truncate leaves 6 characters at this tile width. */
  #bookshelf a[href*="/author/"] [cy-id="textInline"] p:first-child {
    white-space: normal !important; font-size: 0.8rem !important; line-height: 1.25 !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important;
  }
  #bookshelf a[href*="/author/"] [cy-id="textInline"] { padding: 20px 8px 9px !important; }
  #bookshelf a[href*="/author/"] [cy-id="textInline"] p + p { font-size: 0.66rem !important; }
}
@media (max-width: 480px) { #nh-nr-bar .nh-nr-search { flex-basis: 100px; } }
/* B6: customizations panel sections + lock chip */
/* column-span, not grid-column: the panel is CSS COLUMNS (masonry), where a
   heading without span sits inside one column and the neighbouring column's
   first card starts higher than it (Pawel's screenshot). Spanning all columns
   makes every card below start on one line. */
.nh-sect { column-span: all; grid-column: 1 / -1; font-family: var(--nh-sans, system-ui); font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); border-bottom: 1px solid var(--nh-hairline, rgba(255,255,255,0.09)); padding: 14px 2px 7px; margin-bottom: 18px; }

/* ---- themed select (nhSelectify): a native <select>'s popup is OS chrome no
   CSS can reach (the white list in Pawel's screenshot), so every themed select
   keeps the hidden native element for state + change events and renders this
   frosted menu instead, same chrome as the unified dropdown menus. */
.nh-sel { position: relative; display: block; width: 100%; }
.nh-sel select.nh-sel-native { display: none !important; }
.nh-sel-btn { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.25); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); border-radius: 10px; padding: 10px 13px; color: var(--nh-text-1, #f4eee2); font-family: var(--nh-sans, system-ui); font-size: 0.95rem; text-align: left; cursor: pointer; transition: border-color .15s, background .15s; }
.nh-sel-btn:hover { border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)); background: rgba(0,0,0,0.32); }
.nh-sel.nh-open .nh-sel-btn, .nh-sel-btn:focus-visible { outline: none; border-color: var(--nh-amber, #e0c27a); }
.nh-sel-lab { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.nh-sel-chev { flex: none; font-size: 0.7rem; color: var(--nh-muted-2, #9a9085); transition: transform .15s ease; }
.nh-sel.nh-open .nh-sel-chev { transform: rotate(180deg); }
.nh-sel-menu { position: absolute; top: calc(100% + 6px); left: 0; min-width: 100%; z-index: 620; display: none; box-sizing: border-box; padding: 5px; border-radius: 12px; background: rgba(var(--nh-bg-rgb, 24, 21, 18), 0.97); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%); box-shadow: 0 18px 50px rgba(0,0,0,0.55); max-height: min(42vh, 380px); overflow-y: auto; scrollbar-width: thin; }
/* No .nh-sel.nh-open / .nh-sel.nh-up descendant rules here on purpose: the menu is
   not inside the select any more (see .nh-sel-fixed further down). */
/* ---- rating import (StoryGraph / Goodreads CSV) ----
   The dialog opens FROM the customizations pop-up (z-index 1000), so it sits above
   it at 1100, and the themed dropdowns inside it are a fixed layer at 1200, above
   both. It is not in the shared modal rule for that reason (that one is z-index
   500), but it repeats the same centring so it is a centred box and not a static
   block. It carries its own scroller: a match list can be hundreds of rows. */
#nh-imp-modal { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; font-family: var(--nh-sans, system-ui); }
#nh-imp-modal .nh-imp-bg { position: absolute; inset: 0; background: rgba(6,5,4,0.66); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
#nh-imp-modal .nh-imp-box { position: relative; z-index: 1; display: flex; flex-direction: column; width: min(94vw, 1080px); max-height: 88vh; background: var(--nh-canvas, #0b1618); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.13)); border-radius: 18px; box-shadow: 0 26px 74px rgba(0,0,0,0.7); overflow: hidden; }
#nh-imp-modal .nh-imp-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 10px; }
#nh-imp-modal .nh-imp-h { font-family: var(--nh-serif), Georgia, serif; font-size: 1.24rem; color: var(--nh-amber, #e0c27a); }
#nh-imp-modal .nh-imp-x { background: none; border: none; color: var(--nh-muted-2, #9a9085); font-size: 1.7rem; line-height: 1; cursor: pointer; padding: 2px 8px; border-radius: 8px; min-width: 36px; min-height: 36px; }
#nh-imp-modal .nh-imp-x:hover { color: #fff; background: rgba(255,255,255,0.08); }
#nh-imp-modal .nh-imp-sub { padding: 0 20px; font-size: 0.86rem; color: var(--nh-text-2, #cfc6b8); }
#nh-imp-modal .nh-imp-libs { margin-top: 3px; font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-tiles { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 20px 4px; }
#nh-imp-modal .nh-imp-tile { flex: 1 1 120px; min-width: 104px; background: rgba(0,0,0,0.24); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.07)); border-radius: 12px; padding: 9px 12px; }
#nh-imp-modal .nh-imp-tn { font-family: var(--nh-serif), Georgia, serif; font-size: 1.5rem; line-height: 1.1; color: var(--nh-text-1, #f4eee2); }
#nh-imp-modal .nh-imp-tl { font-size: 0.7rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); margin-top: 2px; }
#nh-imp-modal .nh-imp-ok .nh-imp-tn { color: #7fd18b; }
#nh-imp-modal .nh-imp-warn .nh-imp-tn { color: var(--nh-amber, #e0c27a); }
#nh-imp-modal .nh-imp-opts { display: flex; flex-wrap: wrap; gap: 8px 22px; padding: 12px 20px 0; }
#nh-imp-modal .nh-imp-opt { display: inline-flex; align-items: center; gap: 8px; font-size: 0.86rem; color: var(--nh-text-2, #cfc6b8); cursor: pointer; min-height: 32px; }
#nh-imp-modal .nh-imp-opt input { accent-color: var(--nh-amber, #e0c27a); width: 16px; height: 16px; }
#nh-imp-modal .nh-imp-body { flex: 1; overflow-y: auto; scrollbar-gutter: stable; padding: 6px 20px 10px; }
#nh-imp-modal .nh-imp-sec { margin-top: 14px; }
#nh-imp-modal .nh-imp-sec h3 { display: flex; align-items: center; gap: 12px; margin: 0 0 6px; font-size: 0.7rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); border-bottom: 1px solid var(--nh-hairline, rgba(255,255,255,0.07)); padding-bottom: 6px; }
#nh-imp-modal .nh-imp-all { margin-left: auto; background: none; border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); border-radius: 999px; color: var(--nh-text-2, #cfc6b8); font-family: inherit; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 12px; cursor: pointer; min-height: 32px; }
#nh-imp-modal .nh-imp-all:hover { border-color: var(--nh-amber, #e0c27a); color: #fff; }
#nh-imp-modal .nh-imp-hint { margin: 0 0 8px; font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-row { display: flex; align-items: center; gap: 10px; padding: 5px 2px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.84rem; }
#nh-imp-modal .nh-imp-row:hover { background: rgba(255,255,255,0.03); }
#nh-imp-modal .nh-imp-cbw { flex: none; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; margin-left: -4px; cursor: pointer; }
#nh-imp-modal .nh-imp-cb { flex: none; width: 17px; height: 17px; accent-color: var(--nh-amber, #e0c27a); cursor: pointer; }
#nh-imp-modal .nh-imp-cb:disabled { opacity: 0.35; cursor: default; }
/* wide enough for "4.25 <star>" on one line, at 2.6em the glyph wrapped under the digits */
#nh-imp-modal .nh-imp-stars { flex: none; width: 3.6em; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--nh-amber, #e0c27a); }
/* the star glyph is written as a CSS escape; inside this template literal it needs
   DOUBLING, a single-backslash CSS escape is read as an octal escape here and is a
   hard SyntaxError, in a comment just as much as in a rule */
#nh-imp-modal .nh-imp-stars::after { content: ' \\2605'; font-size: 0.85em; }
#nh-imp-modal .nh-imp-src, #nh-imp-modal .nh-imp-dst { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
#nh-imp-modal .nh-imp-src b, #nh-imp-modal .nh-imp-dst b { font-weight: 500; color: var(--nh-text-1, #f4eee2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#nh-imp-modal .nh-imp-src i, #nh-imp-modal .nh-imp-dst i { font-style: normal; font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#nh-imp-modal .nh-imp-arrow { flex: none; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-lib { font-style: normal; font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--nh-amber, #e0c27a); opacity: 0.85; }
#nh-imp-modal .nh-imp-skip { font-style: italic; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-why { flex: none; min-width: 4.6em; text-align: right; font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-whydup { color: #e08a6a; }
#nh-imp-modal .nh-imp-isdup { opacity: 0.62; }
#nh-imp-modal .nh-imp-mine { flex: none; font-size: 0.72rem; color: var(--nh-amber, #e0c27a); }
#nh-imp-modal .nh-imp-row .nh-sel.nh-sel-inline { flex: 1 1 0; min-width: 0; width: auto; }
#nh-imp-modal .nh-imp-row .nh-sel-btn { padding: 5px 9px; font-size: 0.78rem; border-radius: 8px; }
#nh-imp-modal .nh-imp-nolist { max-height: 190px; overflow-y: auto; font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); }
#nh-imp-modal .nh-imp-nolist div { padding: 2px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#nh-imp-modal .nh-imp-foot { display: flex; align-items: center; gap: 16px; padding: 12px 20px 16px; border-top: 1px solid var(--nh-hairline, rgba(255,255,255,0.07)); }
#nh-imp-modal .nh-imp-prog { flex: 1 1 auto; display: none; align-items: center; gap: 10px; }
#nh-imp-modal .nh-imp-foot.nh-imp-working .nh-imp-prog { display: flex; }
#nh-imp-modal .nh-imp-prog { position: relative; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.09); overflow: visible; }
#nh-imp-modal .nh-imp-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 999px; background: var(--nh-amber, #e0c27a); transition: width .2s ease; }
#nh-imp-modal .nh-imp-pt { position: absolute; left: 0; top: 12px; font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; }
#nh-imp-modal .nh-imp-acts { margin-left: auto; display: flex; gap: 10px; }
#nh-imp-modal .nh-imp-cancel, #nh-imp-modal .nh-imp-go { font-family: inherit; font-size: 0.86rem; padding: 9px 18px; border-radius: 10px; cursor: pointer; min-height: 38px; border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); background: rgba(0,0,0,0.25); color: var(--nh-text-2, #cfc6b8); }
#nh-imp-modal .nh-imp-cancel:hover { border-color: rgba(255,255,255,0.26); color: #fff; }
#nh-imp-modal .nh-imp-go { border-color: var(--nh-amber, #e0c27a); color: var(--nh-amber, #e0c27a); }
#nh-imp-modal .nh-imp-go:hover:not(:disabled) { background: var(--nh-amber, #e0c27a); color: #1a1512; }
#nh-imp-modal .nh-imp-go:disabled { opacity: 0.4; cursor: default; }
#nh-imp-modal .nh-imp-busy .nh-imp-body { opacity: 0.5; pointer-events: none; }
#nh-imp-modal .nh-imp-result { margin: 18px 0 0; font-family: var(--nh-serif), Georgia, serif; font-size: 1.05rem; color: var(--nh-text-1, #f4eee2); }
#nh-imp-modal .nh-imp-bad { color: #e08a6a; }
/* the trigger in the customizations panel */
.nh-imp-file { display: none; }
.nh-imp-btn { font-family: var(--nh-sans, system-ui); font-size: 0.86rem; padding: 9px 16px; border-radius: 10px; border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); background: rgba(0,0,0,0.25); color: var(--nh-text-2, #cfc6b8); cursor: pointer; min-height: 38px; }
.nh-imp-btn:hover { border-color: var(--nh-amber, #e0c27a); color: #fff; }
.nh-imp-note { margin-top: 8px; font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); }
.nh-imp-note.nh-imp-bad { color: #e08a6a; }
/* phones: the two sides of a match row stack, and the picker gets a full line */
@media (max-width: 760px) {
  #nh-imp-modal .nh-imp-box { width: 96vw; max-height: 92vh; }
  #nh-imp-modal .nh-imp-row { flex-wrap: wrap; gap: 6px 8px; padding: 8px 2px; }
  #nh-imp-modal .nh-imp-arrow { display: none; }
  #nh-imp-modal .nh-imp-src, #nh-imp-modal .nh-imp-dst { flex: 1 1 100%; }
  /* line the stacked destination up under the source text, past the tap target */
  #nh-imp-modal .nh-imp-dst { padding-left: 42px; }
  #nh-imp-modal .nh-imp-row .nh-sel.nh-sel-inline { flex: 1 1 100%; margin-left: 42px; }
  #nh-imp-modal .nh-imp-why { margin-left: auto; }
  /* The checkbox itself stays 17px (the OS draws it); the label around it takes the
     thumb-sized hit area. Keyed off WIDTH, not (hover: none): that query does not
     fire on a touchscreen laptop and cannot be relied on here, the same finding
     that moved the card rating badges into the caption. */
  #nh-imp-modal .nh-imp-cbw { width: 34px; height: 34px; margin-left: -8px; }
}
/* and on any touch device, whatever its width */
@media (hover: none) {
  #nh-imp-modal .nh-imp-cbw { width: 34px; height: 34px; margin-left: -8px; }
}

/* The menu is a child of <body>, not of the select, and becomes a fixed layer when
   open, so no ancestor overflow can clip it, no scroller's scrollHeight changes, and
   the panel's own DOM is never mutated (Firefox re-balances a multi-column box when
   nodes come or go inside it, nudging every card). top/left/bottom/min-width/max-height
   are set inline by place(). Display is keyed off the menu's OWN class for the same
   reason: it is not a descendant of .nh-sel.nh-open any more. The z-index clears both
   the settings pop-up (1000) and the import dialog (1100). */
.nh-sel-menu.nh-sel-fixed { display: block; position: fixed; z-index: 1200; }
.nh-sel-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 11px; border-radius: 8px; color: var(--nh-text-2, #d8cfc2); font-family: var(--nh-sans, system-ui); font-size: 0.9rem; cursor: pointer; white-space: nowrap; }
.nh-sel-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
/* Keyboard focus inside the menu. Same weight as :hover so arrowing through the list
   reads exactly like pointing at it; there is no focus ring because the rows are not
   focusable elements, the menu keeps focus and moves this class. */
.nh-sel-item.nh-active { background: rgba(255,255,255,0.10); color: #fff; outline: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.16)); outline-offset: -1px; }
.nh-sel-item.nh-on { color: var(--nh-text-1, #f4eee2); }
.nh-sel-item.nh-on::after { content: '✓'; color: var(--nh-amber, #e0c27a); font-size: 0.85em; }
.nh-sel-group { padding: 8px 11px 3px; font-family: var(--nh-sans, system-ui); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); cursor: default; }
/* inline variant (toolbar-style hosts, e.g. the server-stats library filter) */
.nh-sel.nh-sel-inline { display: inline-block; width: auto; min-width: 190px; }
.nh-lock-chip { font-size: 0.8rem; opacity: 0.75; }

/* ---- Global cross-library search (A2, enhancements.js nhGlobalSearch) ----
   The native per-library dropdown is hidden while the merged panel is on; the
   panel anchors inside ABS's own position:relative search wrapper. */
body.nh-global-search #appbar .globalSearchMenu { display: none !important; }
#nh-gs-panel { position: absolute; z-index: 45; top: calc(100% + 6px); left: 0; width: min(560px, calc(100vw - 24px)); max-height: min(70vh, 620px); overflow-y: auto; background: rgba(var(--nh-bg-rgb, 24, 21, 18), 0.98); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; box-shadow: 0 24px 70px rgba(0,0,0,0.55); padding: 6px; font-family: var(--nh-sans, system-ui); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
#nh-gs-panel .nh-gs-msg { padding: 14px 12px; font-size: 0.85rem; color: var(--nh-muted-2, #9a9085); }
#nh-gs-panel .nh-gs-head { padding: 8px 10px 4px; font-size: 0.64rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--nh-amber, #e0c27a); opacity: 0.85; }
#nh-gs-panel .nh-gs-row { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 9px; cursor: pointer; }
#nh-gs-panel .nh-gs-row.nh-gs-sel { background: rgba(255,255,255,0.07); }
/* Follows the library's cover aspect like every other cover in the theme,    square by default, 1:1.6 only when the standard-covers mode is on. It was
   hardcoded portrait, so square art came out letterboxed in search results. */
#nh-gs-panel .nh-gs-cover { width: 40px; height: 40px; min-width: 40px; object-fit: cover; border-radius: 5px; background: rgba(0,0,0,0.3); }
html.nh-covers-std #nh-gs-panel .nh-gs-cover { height: 64px; }
#nh-gs-panel .nh-gs-icon { width: 40px; min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 9px; background: rgba(255,255,255,0.06); color: var(--nh-muted-2, #9a9085); font-size: 22px; }
#nh-gs-panel .nh-gs-text { flex: 1 1 auto; min-width: 0; }
#nh-gs-panel .nh-gs-title { margin: 0; font-size: 0.9rem; color: var(--nh-text-1, #f2ecdf); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#nh-gs-panel .nh-gs-sub { margin: 1px 0 0; font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#nh-gs-panel .nh-gs-chips { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 45%; }
#nh-gs-panel .nh-gs-chip { font-size: 0.66rem; line-height: 1; padding: 4px 8px; border-radius: 999px; background: var(--nh-amber-tint, rgba(224,194,122,0.12)); border: 1px solid var(--nh-amber-shadow, rgba(224,194,122,0.30)); color: var(--nh-amber, #e0c27a); white-space: nowrap; cursor: pointer; }
#nh-gs-panel .nh-gs-chip:hover { background: var(--nh-amber-shadow, rgba(224,194,122,0.30)); }
@media (max-width: 639.98px) {
  #nh-gs-panel { position: fixed; top: 60px; left: 10px; right: 10px; width: auto; max-height: 60vh; }
}

/* Series page toolbar: fully transparent, name + count hidden, kebab kept.
   Scoped to body.nh-series-page (set by nhSeriesHeader) so library/collection
   toolbars keep their filter and sort controls untouched. */
/* .nh-has-toolbar and :not(.nh-home) are repeated ON PURPOSE: the frosted band
   is painted by body.nh-has-toolbar:not(.nh-home) #toolbar (two classes), so a
   single-class override here lost the specificity duel and the blur stayed
   (Pawel). Matching that selector and adding .nh-series-page wins outright. */
body.nh-series-page.nh-has-toolbar:not(.nh-home) #toolbar,
body.nh-series-page #toolbar { background: transparent !important; background-color: transparent !important; border: none !important; border-bottom: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
body.nh-series-page *:has(> #toolbar) { background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
body.nh-series-page #toolbar > p { display: none !important; }
body.nh-series-page #toolbar > div.w-6.h-6.rounded-full { display: none !important; }

@media (min-width: 1024px) {
  body .nh-series-cols { display: flex !important; align-items: stretch !important; overflow: hidden !important; }
  /* Column-height box with INTERNAL scroll driven only by nhSeriesSyncScroll
     (scrollbar hidden, wheel forwarded to the grid), height:auto let a long
     description stretch the whole flex row and blow up the grid's geometry. */
  body #nh-series-header { flex: 0 0 34%; width: 34%; max-width: 520px; height: 100%; overflow-y: auto; padding: 127px 16px 32px 34px; box-sizing: border-box; }
  body #bookshelf.nh-with-series-header { height: 100% !important; flex: 1 1 auto; min-width: 0; padding-left: 0 !important; }
  #nh-series-header h1 { font-size: 2.2rem; }
  #nh-series-header .nh-sh-author { font-size: 1.25rem; }
  #nh-series-header .nh-sh-stats { font-size: 1.05rem; }
  #nh-series-header .nh-sh-desc { -webkit-line-clamp: 24; font-size: 0.95rem; max-width: 62ch; }
}

/* ============================================================
   A10, Collection detail page (/collection/<id>)
   The native page is already a two-column skeleton (stacked cover
   left, content right) but capped at max-w-6xl and centered, with
   the books rendered by a slow table. We widen it to the same axis
   the series page uses, restyle the description, and replace the
   table with a fast cover grid (built client-side from vm.bookItems).
   ============================================================ */
body.nh-collection-page #page-wrapper .max-w-6xl { max-width: min(96%, 2100px) !important; }
@media (min-width: 1600px) {
  body.nh-collection-page #page-wrapper .max-w-6xl { max-width: calc(100% - 128px) !important; }
}
body.nh-collection-page #page-wrapper .my-8.max-w-2xl { max-width: 70ch !important; }
body.nh-collection-page #page-wrapper .my-8.max-w-2xl p { font-size: 0.95rem; line-height: 1.6; color: var(--nh-text-2, #cfc6b8); white-space: pre-line; }
/* admin "edit description" affordance under the blurb */
.nh-col-edit { background: none; border: none; cursor: pointer; color: var(--nh-amber, #e0c27a); font-family: var(--nh-sans, system-ui); font-size: 0.8rem; padding: 8px 0 0; display: inline-flex; align-items: center; gap: 5px; }
/* No underline. It ran under the leading glyph too, which read as a rendering
   bug rather than a link. Brighten on hover instead, like the theme's other
   text buttons. */
.nh-col-edit, .nh-col-edit:hover { text-decoration: none; }
.nh-col-edit:hover { color: var(--nh-amber-hover, #eccf91); }
.nh-col-edit .material-symbols { font-size: 1rem; }
/* fast cover grid replacing tables-collection-books-table */
.nh-col-native-hide { display: none !important; }
#nh-col-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 24px 18px; margin: 10px 0 48px; }
@media (min-width: 1600px) { #nh-col-grid { grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 32px 24px; } }
.nh-col-tile { display: flex; flex-direction: column; gap: 8px; text-decoration: none; cursor: pointer; }
.nh-col-tile .nh-col-cover { position: relative; width: 100%; aspect-ratio: 1 / 1; border-radius: 8px; overflow: hidden; background: var(--nh-raised, #221e1a); box-shadow: 0 8px 20px rgba(0,0,0,0.42); transition: transform .18s ease, box-shadow .18s ease; }
html.nh-covers-std .nh-col-tile .nh-col-cover { aspect-ratio: 1 / 1.6; }
.nh-col-tile:hover .nh-col-cover { filter: brightness(0.7); }
/* A book tile is a book tile wherever it appears (Pawel): hover dim + the rating
   badge in the lower-left corner, exactly like a library card. */
.nh-col-tile .nh-col-dim { position: absolute; inset: 0; z-index: 2; background: rgba(0,0,0,0.22); opacity: 0; transition: opacity .18s ease; pointer-events: none; }
.nh-col-tile:hover .nh-col-dim { opacity: 1; }
/* Book tiles inside a collection follow the library cards: the rating sits on the
   author line of the caption, always visible, never on the artwork and never
   gated on hover (see the A7 note above for why hover lost). */
.nh-col-arow { display: flex; align-items: center; gap: 6px; justify-content: space-between; }
.nh-col-arow .nh-col-a { min-width: 0; flex: 1 1 auto; }
.nh-col-arow .nh-cr { flex: none; pointer-events: none; }
/* Smaller than the library-grid badge on purpose: these tiles start at 118px, so
   every pixel the rating takes comes straight off the author name next to it. */
.nh-col-arow .nh-cr .nh-cr-stars { font-size: 0.64rem; letter-spacing: 0.5px; }
.nh-col-arow .nh-cr .nh-cr-num { font-size: 0.66rem; font-weight: 600; color: var(--nh-text-2, #d8cfc2); text-shadow: none; }
.nh-col-arow .nh-cr .nh-cr-wrap { gap: 3px; }
.nh-col-tile .nh-col-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nh-col-tile .nh-col-ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 10px; font-family: var(--nh-serif), Georgia, serif; font-size: 0.8rem; color: var(--nh-text-2, #cfc6b8); }
.nh-col-tile .nh-col-t { font-family: var(--nh-sans, system-ui); font-size: 0.82rem; color: #efe9dc; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nh-col-tile .nh-col-a { font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-col-count { font-family: var(--nh-sans, system-ui); font-size: 0.82rem; color: var(--nh-muted-2, #9a9085); margin: 0 0 4px; }

/* ---- A10: Collections LANDING page (/library/<id>/bookshelf/collections) ----
   The native shelf renders each collection as a wide two-cover card that loads
   many full covers at once (slow at scale) and reads generically. We hide the
   native cards and mount our own tile grid inside #bookshelf: each collection
   is an ICON EMBLEM on a category-tinted card (fast, no cover images at all),
   with the name and a book count. Click → the /collection/<id> detail. An
   admin-only "New" tile opens the curated template picker. */
/* Hide the native shelf entirely (NOT its children), our grid is a SIBLING in
   .page, never inside #bookshelf: injecting foreign nodes into the LazyBookshelf
   corrupts Vue's reconciliation when the SAME component re-renders for series
   (collections↔series share one #bookshelf), leaving series blank. */
body.nh-collections-page #bookshelf { display: none !important; }
body.nh-collections-page #toolbar > p:not(.nh-cl-count-top) { display: none !important; }
#toolbar .nh-cl-count-top { font-family: var(--nh-sans, system-ui); font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; margin-right: 8px; }
#nh-cols-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); gap: 34px 26px; padding: 16px var(--nh-gutter) 64px; height: 100%; overflow-y: auto; box-sizing: border-box; align-content: start; scrollbar-width: thin; }
@media (max-width: 640px) {
  #nh-cols-grid { grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 16px 12px; padding-left: 14px; padding-right: 14px; padding-bottom: 150px; }
  .nh-cl-emblem .nh-cl-ico { font-size: 2rem; }
  .nh-cl-emblem .nh-cl-wm { font-size: 4.4rem; right: -10px; bottom: -14px; }
}
@media (min-width: 1600px) { #nh-cols-grid { grid-template-columns: repeat(auto-fill, minmax(212px, 1fr)); gap: 42px 32px; padding: 22px var(--nh-gutter) 72px; } }
.nh-cl-card { display: flex; flex-direction: column; gap: 4px; text-decoration: none; cursor: pointer; }
/* Glass tile. The pane is translucent so backdrop-filter can pick up the ambient
   cinematic background behind the grid; the genre tint arrives as a corner radial
   from nhColEmblemBg, never as a fill. Flat saturated fills are what made this
   grid read as a candy shop. */
/* Borderless (Pawel): the inner top highlight still gives the glass its edge,
   but there is no outline drawn round the tile. Author and narrator cards keep
   theirs deliberately, they are the only tiles that are mostly flat colour. */
.nh-cl-emblem { position: relative; width: 100%; aspect-ratio: 1 / 1; border-radius: var(--nh-tile-r, 14px); overflow: hidden; display: flex; align-items: center; justify-content: center; border: none; background-image: var(--nh-cl-bg, none); background-color: rgba(24,21,18,0.34); -webkit-backdrop-filter: blur(16px) saturate(1.15); backdrop-filter: blur(16px) saturate(1.15); box-shadow: var(--nh-tile-sh, 0 10px 24px rgba(0,0,0,0.40)), var(--nh-glass-edge, inset 0 1px 0 rgba(255,255,255,0.18)), inset 0 -30px 40px -22px rgba(0,0,0,0.55); transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.nh-cl-card:hover .nh-cl-emblem { filter: brightness(0.7); border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)); }
.nh-cl-emblem .nh-cl-ico { position: relative; font-size: 3.1rem; color: rgba(255,255,255,0.92); text-shadow: 0 2px 14px rgba(0,0,0,0.45); z-index: 2; }
/* No blur available: thicken the pane so it stays a panel rather than a wash. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .nh-cl-emblem { background-color: rgba(24,21,18,0.72); }
}
/* large faint watermark of the same icon = a graphic behind the emblem */
.nh-cl-emblem .nh-cl-wm { position: absolute; right: -18px; bottom: -26px; font-size: 8.6rem; line-height: 1; color: rgba(255,255,255,0.13); transform: rotate(-10deg); z-index: 0; pointer-events: none; }
.nh-cl-card:hover .nh-cl-emblem .nh-cl-wm { color: rgba(255,255,255,0.17); }
/* detail-page: category emblem replacing the collection's native two-book cover */
.nh-col-emblem { border-radius: var(--nh-tile-r, 14px); box-shadow: var(--nh-tile-sh-hi, 0 18px 34px rgba(0,0,0,0.52)), var(--nh-glass-edge, inset 0 1px 0 rgba(255,255,255,0.18)), inset 0 -30px 40px -22px rgba(0,0,0,0.55); }
.nh-col-emblem .nh-cl-ico { font-size: 4.4rem; }
.nh-col-emblem .nh-cl-wm { font-size: 12rem; right: -26px; bottom: -38px; }
.nh-cl-name { font-family: var(--nh-serif), 'Spectral', Georgia, serif; font-size: 1.06rem; font-weight: 600; color: #f4eee2; line-height: 1.25; margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nh-cl-count { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); margin: 0; }
/* admin "New from template" tile */
.nh-cl-new .nh-cl-emblem { background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(224,194,122,0.4); box-shadow: none; }
.nh-cl-new .nh-cl-emblem .material-symbols { color: var(--nh-amber, #e0c27a); font-size: 3rem; text-shadow: none; }
.nh-cl-new:hover .nh-cl-emblem { border-color: var(--nh-amber, #e0c27a); background: rgba(224,194,122,0.06); transform: none; box-shadow: none; }
/* template picker modal */
#nh-ct-modal .nh-rt-modal-box { max-width: 760px; width: 92vw; }
#nh-ct-modal .nh-ct-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 12px; margin-top: 14px; max-height: 62vh; overflow-y: auto; padding-right: 4px; }
.nh-ct-tile { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; padding: 14px; border-radius: 11px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; text-align: left; transition: background .15s, border-color .15s; }
.nh-ct-tile:hover { background: rgba(255,255,255,0.07); border-color: rgba(224,194,122,0.45); }
.nh-ct-ico { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
.nh-ct-ico .material-symbols { font-size: 1.5rem; color: #fff; }
.nh-ct-name { font-family: var(--nh-serif), Georgia, serif; font-size: 0.94rem; font-weight: 600; color: #f4eee2; }
.nh-ct-desc { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; line-height: 1.42; color: var(--nh-muted-2, #9a9085); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* ============================================================
   A11, Admin Family Scoreboard + per-user drill-down (/config/stats)
   ============================================================ */
/* clear the fixed appbar at the top AND the fixed settings sub-rail on the left
   (w-44 = 176px, position:fixed left-0), #page-wrapper here spans the FULL width
   with no offset of its own, so a wide centered grid would slide under both.
   Scoped to nh-stats-dash so only this page. */
body.nh-stats-dash #page-wrapper { padding-top: 96px !important; box-sizing: border-box; }
@media (min-width: 768px) {
  body.nh-stats-dash #page-wrapper { padding-left: 200px !important; padding-right: 30px !important; }
}
/* Your Stats (left/top) + Server Ranking (right/bottom): stacked on narrow,
   side by side on wide, using most of the width (was capped ~900px = big margins). */
/* padding-bottom, not margin: #page-wrapper is the scroller, and a margin on the
   last child collapses out of the scroll height, the page ended flush against
   the ranking card with nothing under it (Pawel). */
#nh-stats-grid { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 2000px; margin: 0 auto; padding-bottom: 72px; align-items: stretch; }
/* Your Stats already contains its OWN native card panels (bg-bg rounded-md
   shadow-lg border), Your Stats + Year in Review. So .configContent is just a
   transparent passthrough here (adding a panel double-wrapped it = the misaligned
   titles + off heatmap). We match the RANKING to the native panel instead (below). */
#nh-stats-grid > .configContent { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; background: none !important; border: none !important; box-shadow: none !important; }
/* Side-by-side only when each column can hold Your Stats' intrinsic content:
   chart (w-96=384) + sessions (w-80=320) + card padding ≈ 740px per column.
   Below that, stack, a squeezed column clips the native row (overflow-hidden). */
@media (min-width: 1800px) {
  #nh-stats-grid { flex-direction: row; align-items: flex-start; }
  #nh-stats-grid > * { flex: 1 1 0; min-width: 0; }
}
/* Safety net inside the (possibly halved) column: the chart/sessions row may
   wrap instead of clipping, fixed-width blocks may shrink, the heatmap pans
   inside its wrapper (scrollbars are hidden theme-wide) instead of poking out,
   and the card itself clips anything that still tries to escape. */
#nh-stats-grid .configContent .bg-bg.rounded-md { overflow: hidden; }
#nh-stats-grid .configContent .bg-bg.rounded-md .flex.flex-col.md\\:flex-row { flex-wrap: wrap; }
/* .w-96 (the chart) is deliberately NOT capped: its bars are absolutely
   positioned against a 384px box, so capping the box just clips them. It is
   fitted by scaling instead, see nhStatsFit. */
#nh-stats-grid .configContent .bg-bg.rounded-md .w-80 { max-width: 100%; }
/* overflow-x HIDDEN, not auto: nhStatsFit scales the heatmap to fit, but a scale
   never changes the layout box, and scrollWidth is measured from that box, so
   the container still believed it had ~24px of overflow and kept a scrollbar
   under a graph that visually fits perfectly. Nothing is actually clipped. */
#nh-stats-grid .configContent .bg-bg.rounded-md > .w-full.my-2 { max-width: 100%; overflow-x: hidden; }
/* ---- "Your Stats" reskin -------------------------------------------------
   All ABS's own markup; we only restyle it so it reads as part of the theme
   instead of a stock panel parked next to the ranking. Selectors prefer
   [class*="…"] over escaped Tailwind names, inside a JS template literal an
   escaped class needs a DOUBLE backslash (.md\\:flex-row), which is a standing
   invitation to a silent selector typo. */
#nh-stats-grid .configContent .bg-bg.rounded-md {
  background: var(--nh-raised, #221e1a) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
  padding: 18px 20px 22px !important;
}
#nh-stats-grid .configContent h1 { font-family: var(--nh-serif), 'Spectral', Georgia, serif !important; color: var(--nh-text-1, #f4eee2) !important; letter-spacing: -0.01em; }
#nh-stats-grid .configContent h1[class*="text-xl"] { font-size: 1.5rem !important; font-weight: 600 !important; }
#nh-stats-grid .configContent h1[class*="text-2xl"] { font-size: 1.2rem !important; font-weight: 500 !important; }
/* The three headline figures become tiles, matching .nh-sb-tile on the ranking. */
#nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="justify-center"] { gap: 12px; margin-bottom: 4px; flex-wrap: wrap; }
#nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="justify-center"] > div {
  align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 10px 20px 10px 14px !important;
}
#nh-stats-grid .configContent span.material-symbols { color: var(--nh-amber, #e0c27a) !important; opacity: 0.88; }
/* Every figure on the page in the display serif, like the ranking's totals. The
   p[] guard matters: the icons carry text-5xl too, and turning THEM serif would
   swap the material-symbols ligature for tofu. */
#nh-stats-grid .configContent p[class*="text-4xl"],
#nh-stats-grid .configContent p[class*="text-5xl"] {
  font-family: var(--nh-serif), 'Spectral', serif !important; font-weight: 600 !important;
  color: var(--nh-text-1, #f4eee2) !important; line-height: 1.05 !important;
}
/* Scoped to the trio row on purpose: ABS reuses text-white/80 for the Recent
   Sessions TITLES, and unscoped this shrank a book title to 10.9px and shouted
   it in caps. */
#nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="justify-center"] p[class*="text-white/80"] {
  color: var(--nh-muted-2, #9a9085) !important; text-transform: uppercase;
  letter-spacing: 0.05em; font-size: 0.68rem !important;
}
/* Recent Sessions rows: title readable, meta muted, amount in the accent. */
#nh-stats-grid .configContent div[class*="w-80"] p[class*="text-white/80"] { color: var(--nh-text-2, #d8cfc2) !important; font-size: 0.9rem !important; }
#nh-stats-grid .configContent div[class*="w-80"] p[class*="text-white/50"] { color: var(--nh-muted-2, #9a9085) !important; }
#nh-stats-grid .configContent div[class*="w-80"] p[class*="font-bold"] { color: var(--nh-amber, #e0c27a) !important; }
/* ABS ships the chart column as "scale-75 lg:scale-100", and this is TAILWIND v4
   (note the "mb-4!" bang-suffix elsewhere in its markup), where scale-75 compiles
   to the standalone "scale" property, NOT to transform. transform:none looks
   like it works because at lg the class resets to 100% anyway; below lg the
   column stayed at 0.75 and, since a scale never shrinks the layout BOX, it both
   under-filled its width and left the rest of the box as dead space.
   Both here and on the year heatmap the size is now driven by nhStatsFit(), which
   scales to exactly the room available and cancels the leftover box with negative
   margins, so the scale is disabled from BOTH properties here. */
#nh-stats-grid .configContent div[class*="scale-75"] { scale: none !important; transform: none; transform-origin: top left; }
/* Both columns also carry mx-auto, which in a flex ROW resolves to "push apart",
   so on a wide card they drifted to opposite edges with a 300px hole between
   them. Centre the PAIR with a real gap instead. Only from md up: below that ABS
   stacks the columns and mx-auto is doing the right thing (centring each). */
/* Both columns also carry mx-auto, which in a flex ROW resolves to "push apart",
   and both are a FIXED width (w-96 / w-80), so on a wide card they drifted to
   opposite edges with a hole between them and hard-truncated session titles.
   The chart cannot grow (its bars are absolutely positioned against a 384px box)
   but the session list can, so the row is left-aligned and Recent Sessions takes
   the slack. Only from md up: below that ABS stacks the columns and mx-auto is
   doing the right thing (centring each). */
@media (min-width: 768px) {
  #nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="flex-col"] { justify-content: flex-start; align-items: flex-start; gap: 40px; }
  #nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="flex-col"] > div { margin-left: 0 !important; margin-right: 0 !important; }
  /* The chart column grows too now, nhStatsFit scales the chart up to fill it
     (it is DOM boxes, not a bitmap), so both columns share the row instead of
     the chart sitting small at a fixed 384px with dead space beside it. */
  /* Grows to share the row, but NOT centred and NOT scaled up: its children are
     a fixed 384px, so centring makes them overflow both edges once the column is
     narrower than that, and scaling up fed a positive margin back into the flex
     sizing and walked the chart out of the card. Left-aligned and fit-to-shrink
     is the stable arrangement. */
  #nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="flex-col"] > div[class*="w-96"] { flex: 0 0 auto; }
  /* Basis low enough that the session list can still sit BESIDE the 384px chart
     inside a half-width Your Stats column (the grid goes two-up at 1800px, which
     leaves it ~790px of content). At 380px it missed by 14px and dropped onto its
     own line, stacking the card three rows deep. */
  #nh-stats-grid .configContent .bg-bg.rounded-md > div[class*="flex-col"] > div[class*="w-80"] { flex: 1 1 320px; min-width: 260px; width: auto !important; max-width: 640px; }
  /* the session row's own fixed columns, so a long title uses the new room */
  #nh-stats-grid .configContent div[class*="w-80"] div[class*="w-56"] { width: auto !important; flex: 1 1 auto; min-width: 0; }
  #nh-stats-grid .configContent div[class*="w-80"] div[class*="w-18"] { flex: 0 0 auto; }
}

/* ---- "Your listening" insight panel (ours, injected above the heatmap) ---- */
/* Lives as a third child of the native chart/sessions row, so it claims whatever
   width those two fixed-size columns leave over and wraps under them when there
   is none. width:100% covers the fallback position (a plain block above the
   heatmap); on the main axis the flex-basis wins, so both cases are right. */
/* A big flex-basis on purpose. As a third column the panel only earns its place
   when it is genuinely wide; below that it wraps onto its own full-width line
   under the chart and the session list, where auto-fit gives it four or five
   columns and it stops towering over them (Pawel: "all over the place in
   mid-sized screen"). */
#nh-ys { width: 100%; flex: 1 1 720px; min-width: 280px; margin: 24px 0 6px; }
.nh-ys-title { font-family: var(--nh-serif), 'Spectral', Georgia, serif; font-size: 1.2rem; font-weight: 500; color: var(--nh-text-1, #f4eee2); margin: 0 0 12px; }
/* Exactly three columns at every desktop width (Pawel), auto-fit made the
   column count drift with the panel's luck in the flex row. Phones keep the
   single-column override below. The server-stats page reuses the card look via
   .nh-ls-grid but keeps auto-fit: its grid spans the whole page, where four or
   five columns are the point. */
.nh-ys-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-content: start; }
.nh-ls-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.nh-ys-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 13px 15px 14px; min-width: 0; }
.nh-ys-h { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); margin-bottom: 11px; }
/* wrap: three long durations side by side overlapped at mid widths */
.nh-ys-figrow { display: flex; flex-wrap: wrap; gap: 10px 16px; }
.nh-ys-fig { flex: 1 1 90px; min-width: 0; }
/* nowrap: a duration is one token, "6h 44m" broke across two lines in a narrow
   column and made the card twice as tall as the one beside it. */
.nh-ys-val { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.4rem; font-weight: 600; color: var(--nh-text-1, #f4eee2); line-height: 1.1; white-space: nowrap; }
.nh-ys-lab { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; color: var(--nh-muted-2, #9a9085); margin-top: 3px; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.nh-ys-delta { font-weight: 600; }
.nh-ys-delta.up { color: #6fbf87; }
.nh-ys-delta.down { color: #d98c7a; }
/* ranked lists: cover, name over a bar, time */
.nh-ys-row { display: flex; align-items: center; gap: 9px; padding: 4px 0; }
.nh-ys-thumb { flex: none; width: 26px; height: 26px; border-radius: 5px; background: var(--nh-raised, #221e1a) center/cover; }
.nh-ys-mid { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.nh-ys-name { font-family: var(--nh-sans, system-ui); font-size: 0.8rem; color: var(--nh-text-2, #d8cfc2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-ys-bar { display: block; height: 4px; border-radius: 3px; background: rgba(255,255,255,0.07); overflow: hidden; }
.nh-ys-fill { display: block; height: 100%; border-radius: 3px; background: var(--nh-amber, #e0c27a); }
.nh-ys-time { flex: none; font-family: var(--nh-sans, system-ui); font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; }
/* weekday columns */
.nh-ys-week { display: flex; align-items: flex-end; gap: 6px; height: 96px; }
.nh-ys-day { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; min-width: 0; }
.nh-ys-dtrack { flex: 1 1 auto; width: 100%; display: flex; align-items: flex-end; }
/* Neutral bars with only the heaviest day in the accent, the point of this card
   is which day stands out, and seven accent bars answer that with none. */
.nh-ys-dfill { width: 100%; border-radius: 4px 4px 2px 2px; background: rgba(255,255,255,0.13); }
.nh-ys-day.nh-ys-top .nh-ys-dfill { background: var(--nh-amber, #e0c27a); }
.nh-ys-dlab { font-family: var(--nh-sans, system-ui); font-size: 0.65rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; }
.nh-ys-day.nh-ys-top .nh-ys-dlab { color: var(--nh-text-2, #d8cfc2); }
/* finished-book tools: a title with either a date field or a mark-done button */
.nh-ys-frow { display: flex; align-items: center; gap: 8px; padding: 4px 0; transition: opacity .22s ease, transform .22s ease; min-width: 0; }
.nh-ys-frow .nh-ys-name { flex: 1 1 auto; }
.nh-ys-frow.nh-ys-gone { opacity: 0; transform: translateX(10px); }
.nh-ys-pct { flex: none; font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); }
/* Full-bleed card + its own inner grid: with a cover, a title AND a full date per
   row, one column of the insights grid is not enough, the date field was being
   clipped mid-year. */
.nh-ys-card.nh-ys-wide { grid-column: 1 / -1; }
.nh-ys-fgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2px 20px; }
/* auto width, not a fixed em: the rendered width of a date field depends on the
   locale's format, and a fixed one truncates in some of them. */
/* Date fields carry the theme, not the browser default: raised surface, the
   theme's control border and radius, and an ACCENT-tinted calendar glyph.
   Chrome paints that glyph as a black bitmap, so it is recoloured with a filter
   chain (invert to white, then sepia+hue-rotate toward the accent), there is no
   colour property for it. */
.nh-ys-date { flex: none; width: auto; min-width: 8.5em; background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: var(--nh-text-2, #d8cfc2); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: var(--nh-ctl-r, 11px); padding: 4px 8px; font-family: var(--nh-sans, system-ui); font-size: 0.76rem; transition: border-color .15s ease, background .15s ease; }
.nh-ys-date:hover { background: rgba(255,255,255,0.09); border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)); }
.nh-ys-date:focus { outline: none; border-color: var(--nh-amber, #e0c27a); background: rgba(255,255,255,0.09); }
.nh-ys-date.nh-ys-saving { opacity: 0.5; }
/* The calendar glyph is OUR overlay span, not the input's own indicator:
   browsers drop ::-webkit-calendar-picker-indicator on readOnly date inputs
   (and readOnly is what suppresses the native popup for the themed picker), so
   round 9 silently lost the icon. The span is pointer-events:none, clicks land
   on the input and open the popover, and an accent-coloured MASK, so it tracks
   any accent. Every readOnly date input gets wrapped in .nh-date-wrap. */
.nh-date-wrap { position: relative; display: inline-flex; align-items: center; min-width: 0; }
.nh-ys-date, .nh-bd-dt-inp { -webkit-appearance: none; appearance: none; }
.nh-ys-date::-webkit-calendar-picker-indicator, .nh-bd-dt-inp::-webkit-calendar-picker-indicator { display: none !important; }
.nh-date-wrap > input { width: 100%; padding-right: 28px; }
.nh-date-ico {
  position: absolute; right: 9px; top: 50%; width: 14px; height: 14px;
  transform: translateY(-50%); pointer-events: none; opacity: 0.8;
  background-color: var(--nh-amber, #e0c27a);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 2v2H5.5A2.5 2.5 0 0 0 3 6.5v13A2.5 2.5 0 0 0 5.5 22h13a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 18.5 4H17V2h-2v2H9V2H7Zm12 8v9.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V10h14Z'/></svg>") center/contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 2v2H5.5A2.5 2.5 0 0 0 3 6.5v13A2.5 2.5 0 0 0 5.5 22h13a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 18.5 4H17V2h-2v2H9V2H7Zm12 8v9.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V10h14Z'/></svg>") center/contain no-repeat;
  transition: opacity .15s ease;
}
.nh-date-wrap:hover .nh-date-ico, .nh-date-wrap:focus-within .nh-date-ico { opacity: 1; }
/* the wrap takes over the input's slot in each host layout */
.nh-ys-frow .nh-date-wrap { flex: none; }
.nh-bd-dt .nh-date-wrap { width: 100%; max-width: 190px; }
.nh-ys-done { flex: none; background: none; border: none; padding: 2px; cursor: pointer; color: var(--nh-muted-2, #9a9085); display: inline-flex; border-radius: 50%; transition: color .15s ease; }
.nh-ys-done:hover { color: var(--nh-amber, #e0c27a); }
.nh-ys-done:focus-visible { outline: 2px solid var(--nh-amber, #e0c27a); outline-offset: 2px; }
.nh-ys-done .material-symbols { font-size: 1.2rem; }
.nh-ys-done:disabled { opacity: 0.4; cursor: default; }

/* Filter matched nothing: our message replaces ABS's "empty library" panel and
   its scan / add-books buttons, which are the wrong offer entirely here. Hiding
   #bookshelf's other children covers both the empty shelves and ABS's own
   empty-state block wherever inside it that lands. */
body.nh-lf-none #bookshelf > *:not(#nh-lf-none) { display: none !important; }
#nh-lf-none { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 64px 20px; text-align: center; }
.nh-lf-none-t { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.25rem; color: var(--nh-text-2, #d8cfc2); margin: 0; }
.nh-lf-none-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: var(--nh-ctl-r, 11px); color: var(--nh-text-2, #d8cfc2); padding: 7px 18px; font-family: var(--nh-sans, system-ui); font-size: 0.86rem; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
.nh-lf-none-btn:hover { background: rgba(255,255,255,0.10); border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }

/* ---- our 7-day chart (replaces ABS's) -------------------------------------
   The native Minutes-Listening column is retired outright: its bars are pinned
   to a 384px box at scale(.75) and two rounds of transform surgery could not
   make it fill the card. nhWeekChart builds the same figures fluid-width. */
#nh-stats-grid .configContent div[class*="scale-75"] { display: none !important; }
#nh-wk { flex: 1.35 1 380px; min-width: 300px; }
.nh-wk-title { font-family: var(--nh-serif), 'Spectral', Georgia, serif; font-size: 1.2rem; font-weight: 500; color: var(--nh-text-1, #f4eee2); margin: 0 0 18px; }
.nh-wk-bars { display: flex; align-items: stretch; gap: 10px; height: 210px; }
.nh-wk-day { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; }
.nh-wk-v { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; min-height: 1.1em; }
.nh-wk-track { flex: 1 1 auto; width: 100%; max-width: 46px; display: flex; align-items: flex-end; }
.nh-wk-fill { width: 100%; border-radius: 7px 7px 3px 3px; background: rgba(255,255,255,0.13); transition: height .3s ease; }
.nh-wk-day.nh-wk-top .nh-wk-fill { background: var(--nh-amber, #e0c27a); }
.nh-wk-day.nh-wk-top .nh-wk-v { color: var(--nh-text-2, #d8cfc2); }
.nh-wk-lab { font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; }
/* The four summary figures sit ABOVE the bars as tiles (Pawel: read the numbers
   first, then the shape). Shares the scoreboard tile look; 4-up, 2×2 on phones. */
.nh-sb-tiles.nh-wk-tiles { grid-template-columns: repeat(4, 1fr); margin: 0 0 16px; }
.nh-wk-tiles .nh-sb-tval { font-size: 1.35rem; }
@media (max-width: 640px) { .nh-wk-bars { height: 160px; gap: 6px; } .nh-wk-track { max-width: 34px; } .nh-sb-tiles.nh-wk-tiles { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

/* ---- themed date-picker popover (nhDpOpen) -------------------------------- */
#nh-dp { position: fixed; z-index: 620; width: 264px; padding: 12px; border-radius: 14px;
  background: rgba(var(--nh-bg-rgb), 0.97); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14));
  backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 18px 50px rgba(0,0,0,0.55); font-family: var(--nh-sans, system-ui); }
.nh-dp-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.nh-dp-month { font-family: var(--nh-serif), 'Spectral', serif; font-size: 0.98rem; color: var(--nh-text-1, #f4eee2); text-transform: capitalize; }
.nh-dp-nav { background: rgba(255,255,255,0.05); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: 9px; color: var(--nh-text-2, #d8cfc2); width: 30px; height: 30px; font-size: 1rem; line-height: 1; cursor: pointer; transition: background .15s, border-color .15s; }
.nh-dp-nav:hover { background: rgba(255,255,255,0.10); border-color: var(--nh-amber, #e0c27a); }
.nh-dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.nh-dp-w { text-align: center; font-size: 0.66rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); padding: 4px 0 6px; }
.nh-dp-day { background: none; border: none; border-radius: 8px; width: 100%; aspect-ratio: 1; font-family: inherit; font-size: 0.8rem; color: var(--nh-text-2, #d8cfc2); cursor: pointer; transition: background .12s; }
.nh-dp-day:hover { background: rgba(255,255,255,0.09); }
.nh-dp-day.nh-dp-out { color: rgba(154,144,133,0.45); }
.nh-dp-day.nh-dp-today { box-shadow: inset 0 0 0 1px rgba(224,194,122,0.55); }
.nh-dp-day.nh-dp-sel { background: var(--nh-amber, #e0c27a); color: #14110d; font-weight: 700; }
.nh-dp-day.nh-dp-sel:hover { background: var(--nh-amber, #e0c27a); }

/* ---- Server statistics (admin) --------------------------------------------
   Mounts where the sidebar's "Library Stats" ACTUALLY goes: /library/<id>/stats
   (there is no /config/library-stats route in ABS, round 9 aimed at a URL that
   never mounts). On the library route the host is the page's own #bookshelf
   scroller, which already clears the toolbar, so only the CONFIG variant (kept
   for other ABS builds) needs the sub-rail and appbar padding. */
body.nh-libstats-cfg #page-wrapper { padding-top: 96px !important; box-sizing: border-box; }
@media (min-width: 768px) {
  body.nh-libstats-cfg #page-wrapper { padding-left: 200px !important; padding-right: 30px !important; }
}
#nh-libstats { max-width: 1700px; margin: 0 auto; padding: 16px 18px 72px; }
.nh-ls-sel { background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: var(--nh-text-2, #d8cfc2); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: var(--nh-ctl-r, 11px); padding: 7px 12px; font-family: var(--nh-sans, system-ui); font-size: 0.86rem; cursor: pointer; }
.nh-ls-sel:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }
.nh-ls-sel option { background: #1d1a16; color: #e8e0d2; }
.nh-ls-grid { margin-top: 18px; }

/* server-defaults area picker */
#nh-srv-groups { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 0 0 14px; }
.nh-srv-grp { display: inline-flex; align-items: center; gap: 7px; font-family: var(--nh-sans, system-ui); font-size: 0.86rem; color: var(--nh-text-2, #d8cfc2); cursor: pointer; }
.nh-srv-grp input { accent-color: var(--nh-amber, #e0c27a); width: 15px; height: 15px; }

/* Admin: authors with no books, and the reported-problems queue. */
.nh-au-tidy { background: rgba(255,255,255,0.05); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.12)); border-radius: 11px; color: var(--nh-text-2, #d8cfc2); padding: 5px 12px; font-family: var(--nh-sans, system-ui); font-size: 0.8rem; cursor: pointer; white-space: nowrap; transition: background .15s, border-color .15s, color .15s; }
.nh-au-tidy:hover { background: rgba(255,255,255,0.10); border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }
.nh-ae-body { max-height: 56vh; overflow-y: auto; }
.nh-ae-list { display: grid; gap: 2px; margin-bottom: 12px; }
.nh-ae-row { font-family: var(--nh-sans, system-ui); font-size: 0.9rem; color: var(--nh-text-2, #d8cfc2); padding: 5px 8px; border-radius: 8px; background: rgba(255,255,255,0.04); }
.nh-rp-list { display: grid; gap: 8px; }
.nh-rp-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 11px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); }
.nh-rp-main { flex: 1 1 auto; min-width: 0; }
.nh-rp-t { display: block; font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: var(--nh-text-1, #f4eee2); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-rp-t:hover { color: var(--nh-amber, #e0c27a); }
.nh-rp-meta { font-family: var(--nh-sans, system-ui); font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); margin-top: 2px; }
.nh-rp-note-txt { font-family: var(--nh-sans, system-ui); font-size: 0.84rem; color: var(--nh-text-2, #d8cfc2); margin-top: 6px; white-space: pre-wrap; overflow-wrap: anywhere; }
.nh-rp-done { flex: none; }

/* Autoplay notice: says which book just started on its own. */
#nh-ap-toast { position: fixed; left: 50%; bottom: 210px; transform: translateX(-50%); z-index: 400; max-width: min(90vw, 460px); padding: 11px 18px; border-radius: 12px; background: rgba(var(--nh-bg-rgb), 0.96); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); box-shadow: 0 12px 34px rgba(0,0,0,0.5); color: var(--nh-text-1, #f4eee2); font-family: var(--nh-sans, system-ui); font-size: 0.88rem; text-align: center; opacity: 1; transition: opacity .5s ease; }
#nh-ap-toast.nh-ap-out { opacity: 0; }

@media (max-width: 640px) {
  .nh-ys-grid { grid-template-columns: 1fr; gap: 12px; }
  .nh-ys-val { font-size: 1.3rem; }
  .nh-ys-week { height: 84px; }
  #nh-ap-toast { bottom: 150px; }
}
#nh-stats-grid .configContent div[class*="bg-white/10"] { background-color: rgba(255,255,255,0.07) !important; }
/* Recent Sessions: rows get a divider and a hover, the button becomes a pill. */
#nh-stats-grid .configContent .abs-btn {
  background: rgba(255,255,255,0.05) !important; border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.12)) !important;
  border-radius: 11px !important; color: var(--nh-text-2, #d8cfc2) !important; box-shadow: none !important;
  transition: background .15s, border-color .15s, color .15s;
}
#nh-stats-grid .configContent .abs-btn:hover { background: rgba(255,255,255,0.10) !important; border-color: var(--nh-amber, #e0c27a) !important; color: var(--nh-text-1, #f4eee2) !important; }
#nh-stats-grid .configContent p[class*="text-white/70"] { color: var(--nh-muted-2, #9a9085) !important; }
/* ---- the year heatmap ----
   The panel is CSS; the CELLS are not, ABS writes their colour inline, as a
   fixed GitHub-green ramp, so no stylesheet can reach them and they stayed green
   whatever the accent. nhHeatmapSkin() repaints them; see it for the mapping. */
/* Edge to edge like every other block in the card (Pawel): ABS's wrapper is
   shrink-to-fit around the grid, so it floated in the middle at whatever width
   the grid happened to be. Full width here; nhStatsFit then scales the grid to
   match, so the year actually spans the card. */
#heatmap > div { width: 100% !important; max-width: none !important; margin-left: 0 !important; margin-right: 0 !important; }
#heatmap > div > p { font-family: var(--nh-sans, system-ui) !important; color: var(--nh-muted-2, #9a9085) !important; font-size: 0.8rem !important; }
#heatmap div[class*="border-white/25"] {
  border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 14px !important;
  background: rgba(255,255,255,0.03) !important; padding: 14px 10px !important;
}
#heatmap div[class*="text-gray-300"] { color: var(--nh-muted-2, #9a9085) !important; font-family: var(--nh-sans, system-ui) !important; }
#heatmap div[class*="rounded-xs"] { border-radius: 3px !important; outline: none !important; }

/* match the native Your Stats panel exactly: #221e1a, radius 16, border 0.06,
   shadow 0 8px 24px 0.3, p-4 (16px), so the two columns are true twins. */
#nh-scoreboard { width: 100%; margin: 0; padding: 16px 18px; border-radius: 16px; background: var(--nh-raised, #221e1a); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 8px 24px rgba(0,0,0,0.3); box-sizing: border-box; }
/* summary tiles */
.nh-sb-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.nh-sb-tile { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px 10px; text-align: center; }
.nh-sb-tval { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.7rem; font-weight: 600; color: #f4eee2; line-height: 1; }
.nh-sb-tlab { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); margin-top: 6px; }
/* podium (top 3) */
/* Podium. The portrait is the point of this block, so it carries the size, and
   the place is a numbered chip on a coloured ring rather than an emoji medal,
   which every OS drew in its own house style (Windows: a blue-ribboned sticker
   that matched nothing else here). --nh-pl is the place colour: gold / silver /
   bronze, set per tile and reused by the ring, the chip and the panel wash. */
.nh-sb-podium { display: grid; grid-template-columns: 1fr 1.12fr 1fr; gap: 16px; align-items: end; justify-content: center; margin-bottom: 24px; }
.nh-sb-pod { --nh-pl: 224,194,122; --nh-pl-lt: 255,241,201; --nh-pl-dk: 146,110,44; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 22px 14px 20px; border-radius: 18px; cursor: pointer; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); text-align: center; transition: filter .18s ease, background .18s ease, border-color .18s ease; }
/* Tiles darken on hover, they never lift (house rule, book and series cards set
   the convention and a lift made these the odd ones out). */
.nh-sb-pod:hover { filter: brightness(1.14); border-color: rgba(var(--nh-pl), 0.55); }
.nh-sb-pod.p1 { --nh-pl: 231,196,110; --nh-pl-lt: 255,245,206; --nh-pl-dk: 150,109,32; padding: 34px 14px 26px; background: linear-gradient(165deg, rgba(var(--nh-pl),0.20), rgba(var(--nh-pl),0.04)); border-color: rgba(var(--nh-pl),0.42); box-shadow: 0 14px 34px rgba(0,0,0,0.38); }
.nh-sb-pod.p2 { --nh-pl: 206,209,219; --nh-pl-lt: 250,251,255; --nh-pl-dk: 118,124,138; background: linear-gradient(165deg, rgba(var(--nh-pl),0.13), rgba(var(--nh-pl),0.03)); border-color: rgba(var(--nh-pl),0.26); }
.nh-sb-pod.p3 { --nh-pl: 205,127,80; --nh-pl-lt: 244,186,146; --nh-pl-dk: 122,64,30; background: linear-gradient(165deg, rgba(var(--nh-pl),0.14), rgba(var(--nh-pl),0.03)); border-color: rgba(var(--nh-pl),0.28); }
/* Wrapper exists so the rank chip can hang off the portrait without the flex
   column reserving a row for it. */
.nh-sb-pod-avw { position: relative; display: inline-flex; margin-bottom: 3px; }
/* isolation: the photo inside .nh-sb-pod-av is absolutely positioned with
   z-index:1, and the avatar itself is position:relative with z-index:auto, so it
   creates NO stacking context and that 1 escapes into whatever context does
   exist, painting the photo OVER the medal that follows it in the DOM. Half of
   each medal disappeared behind the portrait. Isolating the avatar keeps the
   photo inside it; the medal's own z-index then only has its siblings to beat.
   Same fix as the appbar account photo, see the note there. */
.nh-sb-pod-av { isolation: isolate; }
.nh-sb-pod-av { width: 78px; height: 78px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-weight: 700; font-size: 1.9rem; box-shadow: 0 0 0 2px rgba(var(--nh-pl),0.55), 0 6px 18px rgba(0,0,0,0.35); }
.nh-sb-pod.p1 .nh-sb-pod-av { width: 104px; height: 104px; font-size: 2.5rem; background: linear-gradient(150deg, rgba(var(--nh-pl),0.5), rgba(var(--nh-pl),0.2)); box-shadow: 0 0 0 3px rgba(var(--nh-pl),0.7), 0 0 30px rgba(var(--nh-pl),0.18), 0 8px 22px rgba(0,0,0,0.4); }
/* A struck medal rather than a numbered dot. Four cues do the work at 28px:
   a MILLED RIM (the conic gradient painted on the border box, alternating light
   and dark around the circumference reads as a reeded coin edge), a DOMED FACE
   (radial highlight offset to the top-left, clipped to the content box, which the
   2px padding separates from the rim), an ENGRAVED RING (::after), and an
   EMBOSSED numeral (dark ink with a light shadow beneath). The ribbon a real
   medal hangs from is deliberately left off: at this size it collapses into a
   smudge against the portrait behind it. */
.nh-sb-pod-rank {
  position: absolute; right: -4px; bottom: -4px; z-index: 3; width: 31px; height: 31px;
  box-sizing: border-box; padding: 2px; border-radius: 50%;
  display: grid; place-items: center;
  font-family: var(--nh-sans, system-ui); font-size: 0.95rem; font-weight: 800;
  line-height: 1; color: #2a1d04; text-shadow: 0 1px 0 rgba(255,255,255,0.5);
  background:
    radial-gradient(circle at 34% 27%, rgba(var(--nh-pl-lt),0.98), rgb(var(--nh-pl)) 54%, rgb(var(--nh-pl-dk)) 100%) content-box,
    conic-gradient(from 212deg, rgb(var(--nh-pl-dk)), rgba(var(--nh-pl-lt),0.95) 20%, rgb(var(--nh-pl)) 40%, rgb(var(--nh-pl-dk)) 58%, rgba(var(--nh-pl-lt),0.9) 80%, rgb(var(--nh-pl-dk)) 100%) border-box;
  box-shadow: 0 0 0 2px var(--nh-raised, #221e1a), 0 2px 6px rgba(0,0,0,0.55);
}
.nh-sb-pod-rank::after {
  content: ""; position: absolute; inset: 4px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.28);
  box-shadow: inset 0 -1px 2px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.22);
  pointer-events: none;
}
.nh-sb-pod.p1 .nh-sb-pod-rank { width: 40px; height: 40px; padding: 3px; font-size: 1.2rem; right: 0; bottom: 0; }
.nh-sb-pod.p1 .nh-sb-pod-rank::after { inset: 5px; }
.nh-sb-pod-name { font-family: var(--nh-sans, system-ui); font-size: 1.02rem; font-weight: 600; color: #f4eee2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-sb-pod.p1 .nh-sb-pod-name { font-size: 1.14rem; }
.nh-sb-pod-time { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.2rem; color: var(--nh-amber, #e0c27a); }
.nh-sb-pod.p1 .nh-sb-pod-time { font-size: 1.5rem; }
.nh-sb-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.nh-sb-title { font-family: var(--nh-serif), 'Spectral', Georgia, serif; font-size: 1.5rem; font-weight: 600; color: #f4eee2; margin: 0; }
.nh-sb-toggle { display: inline-flex; gap: 4px; background: rgba(0,0,0,0.25); border-radius: 999px; padding: 3px; }
.nh-sb-pill { background: none; border: none; cursor: pointer; font-family: var(--nh-sans, system-ui); font-size: 0.8rem; color: var(--nh-muted-2, #9a9085); padding: 5px 13px; border-radius: 999px; transition: background .15s, color .15s; }
.nh-sb-pill:hover { color: #e8e0d2; }
.nh-sb-pill.nh-on { background: var(--nh-amber, #e0c27a); color: #24211c; font-weight: 600; }
/* ranks 4+, tiles, not a bar list: a photo, a name and a time read at a glance
   where a column of bars scaled to an arbitrary maximum said very little. */
/* padding-bottom, not just a max-height: the list used to be sliced flush by the
   scroll box, so the last row always looked like a rendering error rather than
   the end of the list. */
/* On the Server statistics page the board is appended after the list grid and
   brought no spacing of its own (the config-stats grid normally provides it). */
#nh-libstats > #nh-scoreboard { margin-top: 30px; }
/* No inner scroll box (Pawel): the page is the scroller, the list just grows. */
.nh-sb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); gap: 10px; padding-right: 2px; padding-bottom: 10px; }
.nh-sb-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px 13px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; text-align: center; transition: filter .15s ease, background .15s, border-color .15s; }
.nh-sb-card:hover { filter: brightness(1.14); background: rgba(255,255,255,0.07); border-color: rgba(224,194,122,0.35); }
.nh-sb-card.nh-sb-idle { opacity: 0.55; }
.nh-sb-crank { position: absolute; top: 8px; left: 10px; font-family: var(--nh-sans, system-ui); font-size: 0.7rem; font-weight: 600; color: var(--nh-muted-2, #9a9085); }
.nh-sb-av.nh-sb-cav { width: 58px; height: 58px; font-size: 1.4rem; }
.nh-sb-cname { font-family: var(--nh-sans, system-ui); font-size: 0.9rem; color: #efe9dc; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-sb-ctime { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.12rem; color: var(--nh-amber, #e0c27a); line-height: 1.1; }
.nh-sb-csub { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; color: var(--nh-muted-2, #9a9085); }
.nh-sb-tsub { font-family: var(--nh-sans, system-ui); font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); margin-top: 2px; }
.nh-sb-pod-sub { font-family: var(--nh-sans, system-ui); font-size: 0.76rem; color: var(--nh-muted-2, #9a9085); margin-top: -3px; }
.nh-us-sub { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; color: var(--nh-muted-2, #9a9085); margin-top: 1px; }
.nh-sb-av.nh-sb-av-sm { width: 30px; height: 30px; font-size: 0.85rem; }
.nh-sb-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, rgba(224,194,122,0.35), rgba(224,194,122,0.12)); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-weight: 600; font-size: 0.95rem; }
.nh-sb-mid { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.nh-sb-name { font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: #efe9dc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-sb-bar { display: block; height: 6px; border-radius: 4px; background: rgba(255,255,255,0.07); overflow: hidden; }
.nh-sb-fill { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--nh-amber, #e0c27a), #c79a4e); min-width: 2px; transition: width .3s ease; }
.nh-sb-time { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1rem; color: #f4eee2; white-space: nowrap; }
.nh-sb-loading { text-align: center; color: var(--nh-muted-2, #9a9085); padding: 8px; font-size: 1.1rem; }
.nh-sb-headright { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.nh-sb-yir { font-family: var(--nh-sans, system-ui); font-size: 0.8rem; padding: 6px 15px; border-radius: 999px; border: 1px solid rgba(224,194,122,0.4); background: rgba(224,194,122,0.12); color: var(--nh-amber, #e0c27a); cursor: pointer; white-space: nowrap; transition: background .15s, color .15s; }
.nh-sb-yir:hover { background: var(--nh-amber, #e0c27a); color: #24211c; }
.nh-sb-empty { font-family: var(--nh-sans, system-ui); font-size: 0.9rem; line-height: 1.55; color: var(--nh-muted-2, #9a9085); padding: 10px 2px 4px; }
/* Year in Review (A5), the caller's own last 12 months */
#nh-yir-modal { position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
#nh-yir-modal .nh-rt-modal-box { max-width: 720px; width: 94vw; }
/* ONE scroller in this sheet, not two (Pawel, phone). Two bars appeared side by
   side because the box scrolls at 78vh while the body scrolls at 74vh, and
   74vh + header + padding does not fit inside 78vh. Flex column: header pinned,
   body is the single scrolling area. */
#nh-yir-modal .nh-rt-modal-box { display: flex; flex-direction: column; overflow: hidden; }
#nh-yir-modal .nh-rt-modal-head { flex: 0 0 auto; }
.nh-yir-body { flex: 1 1 auto; min-height: 0; max-height: 74vh; overflow-y: auto; }
#nh-yir-modal .nh-yir-body { max-height: none; }
/* …and the page BEHIND a modal must not scroll either, its bar sat right next
   to the sheet's own. Every scroller we own is frozen while a modal is up. */
body.nh-modal-open #bookshelf,
body.nh-modal-open .nh-series-cols,
body.nh-modal-open #nh-cols-grid,
body.nh-modal-open #app-content .page { overflow: hidden !important; }
.nh-yir-chart { display: flex; align-items: flex-end; gap: 6px; height: 190px; padding: 6px 2px 0; }
.nh-yir-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; height: 100%; }
.nh-yir-barwrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.nh-yir-bar { width: 74%; max-width: 34px; border-radius: 6px 6px 2px 2px; background: linear-gradient(180deg, var(--nh-amber, #e0c27a), rgba(199,154,78,0.55)); }
.nh-yir-val { font-family: var(--nh-sans, system-ui); font-size: 0.62rem; color: var(--nh-muted-2, #9a9085); margin-bottom: 4px; white-space: nowrap; }
.nh-yir-lab { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; color: var(--nh-muted-2, #9a9085); margin-top: 6px; text-transform: capitalize; }
/* per-user drill-down modal */
#nh-us-modal .nh-rt-modal-box { max-width: 520px; width: 92vw; }
.nh-us-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 6px 0 14px; }
.nh-us-tile { background: rgba(255,255,255,0.04); border-radius: 11px; padding: 12px 8px; text-align: center; }
.nh-us-val { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.25rem; font-weight: 600; color: #f4eee2; line-height: 1.1; }
.nh-us-lab { font-family: var(--nh-sans, system-ui); font-size: 0.68rem; color: var(--nh-muted-2, #9a9085); margin-top: 3px; }
.nh-us-sec { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--nh-amber, #e0c27a); margin: 6px 0 8px; }
.nh-us-books { display: flex; flex-direction: column; gap: 3px; }
.nh-us-book { display: flex; justify-content: space-between; gap: 12px; padding: 6px 8px; border-radius: 8px; }
.nh-us-book:nth-child(odd) { background: rgba(255,255,255,0.03); }
.nh-us-bt { font-family: var(--nh-sans, system-ui); font-size: 0.86rem; color: #e8e0d2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-us-btime { font-family: var(--nh-sans, system-ui); font-size: 0.82rem; color: var(--nh-muted-2, #9a9085); white-space: nowrap; }
/* profile photos: the img layers over the initial-letter circle (404 → letter shows) */
.nh-sb-av, .nh-sb-pod-av, .nh-av-prev { position: relative; overflow: hidden; }
.nh-sb-av img, .nh-sb-pod-av img, .nh-av-prev img { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.nh-av-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.nh-av-prev { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,0.08); display: inline-flex; align-items: center; justify-content: center; font-family: var(--nh-sans, system-ui); font-weight: 600; font-size: 1.05rem; color: #f4eee2; flex: none; }
.nh-us-hleft { display: inline-flex; align-items: center; gap: 11px; }
.nh-us-hav { width: 38px; height: 38px; font-size: 0.95rem; }
/* Settings → Users: ABS's table is kept as the source of truth but hidden, and
   re-presented as people cards (photo, name, type, listening total). Every
   action clicks the native control underneath. */
body.nh-users-grid .configContent table { display: none !important; }
/* ABS pins the config panel to 900px; a card grid earns the extra room on a wide
   screen. The widening itself is MEASURED in JS (nhUsersWiden) because the
   settings sub-rail is position:fixed over a full-width wrapper, centring a
   wider box inside that wrapper slides its left edge under the rail and clips
   the heading. Inline styles are removed on leave (.configContent is shared). */
#nh-ug-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin: 2px 0 10px; }
.nh-ug-sort { display: inline-flex; gap: 4px; background: rgba(0,0,0,0.25); border-radius: 999px; padding: 3px; }
.nh-ug-spill { background: none; border: none; cursor: pointer; font-family: var(--nh-sans, system-ui); font-size: 0.78rem; color: var(--nh-muted-2, #9a9085); padding: 5px 14px; border-radius: 999px; transition: background .15s, color .15s; }
.nh-ug-spill:hover { color: #e8e0d2; }
.nh-ug-spill.nh-on { background: var(--nh-amber, #e0c27a); color: #24211c; font-weight: 600; }
#nh-ug-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(272px, 1fr)); gap: 12px; margin-top: 6px; text-align: left; }
.nh-ug-card { position: relative; display: flex; align-items: flex-start; gap: 13px; padding: 14px 15px; border-radius: 15px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: transform .15s ease, background .15s, border-color .15s; }
.nh-ug-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.07); border-color: rgba(224,194,122,0.32); }
.nh-ug-card:focus-visible { outline: 2px solid var(--nh-amber, #e0c27a); outline-offset: 2px; }
.nh-ug-avwrap { position: relative; flex: none; }
.nh-ug-av { position: relative; overflow: hidden; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, rgba(224,194,122,0.32), rgba(224,194,122,0.1)); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-weight: 600; font-size: 1.4rem; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; padding: 0; transition: border-color .15s; }
.nh-ug-av:hover { border-color: var(--nh-amber, #e0c27a); }
.nh-ug-av.nh-busy { opacity: 0.5; }
.nh-ug-av img { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
/* ABS's own .material-symbols rule sets display, and it loads after ours, a
   single-class selector here loses and the glyph lands in the top-left corner
   instead of the middle. Beat it on specificity, not on order. */
.nh-ug-av .nh-ug-cam { position: absolute; inset: 0; z-index: 2; display: flex !important; align-items: center; justify-content: center; line-height: 1; border-radius: 50%; background: rgba(0,0,0,0.55); color: #f4eee2; font-size: 1.2rem; opacity: 0; transition: opacity .15s; }
.nh-ug-av:hover .nh-ug-cam { opacity: 1; }
.nh-ug-online { position: absolute; bottom: 1px; right: 1px; z-index: 4; width: 12px; height: 12px; border-radius: 50%; background: #58c27d; border: 2px solid #1c1916; }
.nh-ug-rm { position: absolute; top: -3px; right: -3px; z-index: 3; width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: #2a2521; color: var(--nh-muted-2, #9a9085); font-size: 0.85rem; line-height: 1; cursor: pointer; padding: 0; display: none; align-items: center; justify-content: center; }
.nh-ug-card:hover .nh-ug-rm { display: flex; }
.nh-ug-rm:hover { color: #ff8f8f; border-color: rgba(255,143,143,0.5); }
.nh-ug-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.nh-ug-namerow { display: flex; align-items: center; gap: 8px; min-width: 0; }
.nh-ug-name { font-family: var(--nh-sans, system-ui); font-size: 1rem; font-weight: 600; color: #f4eee2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-ug-type { flex: none; font-family: var(--nh-sans, system-ui); font-size: 0.64rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; background: rgba(255,255,255,0.08); color: var(--nh-muted-2, #9a9085); }
.nh-ug-type.t-root, .nh-ug-type.t-admin { background: rgba(224,194,122,0.18); color: var(--nh-amber, #e0c27a); }
.nh-ug-timerow { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; margin-top: 2px; }
.nh-ug-time { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.25rem; color: var(--nh-amber, #e0c27a); line-height: 1; }
.nh-ug-tlab { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; color: var(--nh-muted-2, #9a9085); }
.nh-ug-meta, .nh-ug-act { font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nh-ug-act { opacity: 0.75; }
.nh-ug-acts { position: absolute; top: 10px; right: 10px; display: flex; gap: 2px; opacity: 0; transition: opacity .15s; }
.nh-ug-card:hover .nh-ug-acts, .nh-ug-card:focus-within .nh-ug-acts { opacity: 1; }
.nh-ug-act-btn { background: none; border: none; cursor: pointer; color: var(--nh-muted-2, #9a9085); padding: 3px; border-radius: 7px; display: flex; }
.nh-ug-act-btn .material-symbols { font-size: 1.05rem; }
.nh-ug-act-btn:hover { color: #f4eee2; background: rgba(255,255,255,0.08); }
.nh-ug-act-btn.nh-del:hover { color: #ff8f8f; }
/* "Update Account" modal: profile-picture control above the fields */
#nh-um-photo { display: flex; align-items: center; gap: 14px; padding: 0 0 16px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.nh-um-prev { position: relative; overflow: hidden; width: 60px; height: 60px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, rgba(224,194,122,0.32), rgba(224,194,122,0.1)); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-weight: 600; font-size: 1.5rem; }
.nh-um-prev img { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.nh-um-txt { display: flex; flex-direction: column; gap: 7px; }
.nh-um-lab { font-family: var(--nh-sans, system-ui); font-size: 0.78rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); }
.nh-um-btns { display: flex; gap: 8px; }
.nh-um-btn { font-family: var(--nh-sans, system-ui); font-size: 0.82rem; padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(224,194,122,0.4); background: rgba(224,194,122,0.14); color: var(--nh-amber, #e0c27a); cursor: pointer; transition: background .15s, color .15s; }
.nh-um-btn:hover { background: var(--nh-amber, #e0c27a); color: #24211c; }
.nh-um-btn[disabled] { opacity: 0.5; cursor: default; }
.nh-um-rm { border-color: rgba(255,255,255,0.14); background: none; color: var(--nh-muted-2, #9a9085); }
.nh-um-rm:hover { background: rgba(255,143,143,0.15); border-color: rgba(255,143,143,0.45); color: #ff8f8f; }
/* template picker, build phase (name + book search) */
.nh-ct-build { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.nh-ct-input { width: 100%; box-sizing: border-box; padding: 9px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-size: 0.9rem; }
.nh-ct-input:focus { outline: none; border-color: rgba(224,194,122,0.5); }
.nh-ct-desc-ta { min-height: 68px; }
.nh-ct-results { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.nh-ct-row { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 8px 11px; border-radius: 7px; background: rgba(255,255,255,0.03); border: 1px solid transparent; cursor: pointer; text-align: left; }
.nh-ct-row:hover { background: rgba(255,255,255,0.07); }
.nh-ct-row.nh-on { border-color: var(--nh-amber, #e0c27a); background: rgba(224,194,122,0.12); }
.nh-ct-row.nh-ct-have { opacity: 0.5; cursor: default; }
.nh-ct-row.nh-ct-have .nh-ct-rt { color: var(--nh-amber, #e0c27a); }
/* Why the create button is disabled, ABS rejects a collection with no books, so
   this is a server constraint we can only explain, not remove. */
.nh-ct-hint { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; line-height: 1.42; color: var(--nh-muted-2, #8a8075); margin: 2px 0 0; }
/* icon + accent picker (create dialog and the detail page's Change icon modal) */
.nh-ci-wrap { display: flex; flex-direction: column; gap: 6px; }
.nh-ci-lbl { font-family: var(--nh-sans, system-ui); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--nh-muted-2, #8a8075); margin-top: 4px; }
.nh-ci-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.nh-ci-opt, .nh-ci-sw { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; cursor: pointer; border-radius: var(--nh-ctl-r, 11px); border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); transition: background-color .15s, border-color .15s; }
.nh-ci-opt .material-symbols { font-size: 1.15rem; color: var(--nh-text-2, #d8cfc2); }
.nh-ci-opt:hover, .nh-ci-sw:hover { background: var(--nh-ctl-bg-hi, rgba(255,255,255,0.10)); border-color: var(--nh-amber, #e0c27a); }
.nh-ci-opt.nh-on { border-color: var(--nh-amber, #e0c27a); background: rgba(224,194,122,0.14); }
.nh-ci-opt.nh-on .material-symbols { color: var(--nh-amber, #e0c27a); }
.nh-ci-sw { position: relative; }
.nh-ci-sw::after { content: ''; position: absolute; inset: 5px; border-radius: 6px; background: var(--nh-sw, #5c5048); }
.nh-ci-sw.nh-on { border-color: var(--nh-amber, #e0c27a); box-shadow: 0 0 0 2px rgba(224,194,122,0.18); }
/* live preview of the resulting tile, reusing the real glass emblem */
.nh-ci-prev { width: 92px; height: 92px; aspect-ratio: auto; margin-top: 8px; align-self: flex-start; }
.nh-ci-prev .nh-cl-ico { font-size: 2.2rem; }
#nh-col-editrow .nh-col-icobtn { margin-left: 8px; }
/* The picker was cramped at 100% zoom: 32px chips and a 92px preview. Scale the
   whole widget up, and widen the modal that hosts it. :has() keeps the width
   bump off the plain "edit description" modal, which shares #nh-col-modal. */
#nh-col-modal:has(.nh-ci-wrap) .nh-rt-modal-box { max-width: 660px; width: 94vw; }
.nh-ci-wrap { gap: 8px; }
.nh-ci-lbl { font-size: 0.74rem; margin-top: 8px; }
.nh-ci-grid { gap: 8px; }
.nh-ci-opt, .nh-ci-sw { width: 44px; height: 44px; }
.nh-ci-opt .material-symbols { font-size: 1.55rem; }
.nh-ci-sw::after { inset: 7px; border-radius: 7px; }
.nh-ci-prev { width: 132px; height: 132px; margin-top: 12px; }
.nh-ci-prev .nh-cl-ico { font-size: 3.1rem; }
@media (max-width: 640px) {
  .nh-ci-opt, .nh-ci-sw { width: 38px; height: 38px; }
  .nh-ci-prev { width: 104px; height: 104px; }
}
/* author result row: a person glyph + name, click adds all their books */
.nh-ct-row.nh-ct-author { flex-direction: row; align-items: center; gap: 9px; border-left: 2px solid rgba(224,194,122,0.5); }
.nh-ct-row.nh-ct-author .material-symbols { font-size: 1.15rem; color: var(--nh-amber, #e0c27a); flex: none; }
.nh-ct-row.nh-ct-author .nh-ct-atext { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.nh-ct-rt { font-family: var(--nh-sans, system-ui); font-size: 0.86rem; color: #efe9dc; }
.nh-ct-ra { font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); }
.nh-ct-empty { padding: 10px; text-align: center; color: var(--nh-muted-2, #9a9085); font-size: 0.82rem; font-family: var(--nh-sans, system-ui); }
.nh-ct-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.nh-ct-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 4px 3px 10px; border-radius: 20px; background: rgba(224,194,122,0.16); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-size: 0.76rem; }
.nh-ct-chip button { background: rgba(0,0,0,0.25); border: none; color: #f4eee2; width: 17px; height: 17px; border-radius: 50%; cursor: pointer; line-height: 1; font-size: 0.85rem; }
.nh-rt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
/* Appbar account button: the user's photo next to their name. */
.nh-acc-av { position: relative; overflow: hidden; flex: none; width: 22px; height: 22px; border-radius: 50%; margin-right: 8px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(150deg, rgba(224,194,122,0.35), rgba(224,194,122,0.12)); color: #f4eee2; font-family: var(--nh-sans, system-ui); font-weight: 600; font-size: 0.7rem; line-height: 1; }
/* isolation + z-index:auto on the image: the avatar is position:relative with
   z-index:auto, so it created NO stacking context, and an absolutely-positioned
   child carrying z-index:1 escapes into whatever ancestor context does exist.
   That is how the photo alone painted on top of ABS's "N items selected" bar
   while the rest of the account button stayed correctly behind it. Isolating
   here means the photo can never paint above something its own button doesn't. */
.nh-acc-av { isolation: isolate; }
.nh-acc-av img { position: absolute; inset: 0; z-index: auto; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
/* ABS's selection bar REPLACES the appbar for the duration of a multi-select, so
   the account button must not be competing with it at all. Both are z-index 60,
   which makes the winner depend on DOM order and therefore on the ABS build. */
body.nh-selecting #appbar a[href$="/account"] { visibility: hidden !important; }
/* The stock person glyph at the right of the account button is redundant once
   the avatar is in there. Only hide it from md up: below 768px the name row is
   hidden and that glyph is the button's ONLY content, so an unscoped hide would
   leave an empty 36x36 bordered square on phones. The icon wrapper is the sole
   DIRECT child carrying pointer-events-none, and the avatar is a grandchild, so
   a child combinator cannot reach the avatar. The :has() gate means turning the
   accountPhoto toggle off restores the stock icon automatically. Reclaiming the
   40px the icon reserved gives the username 74px to 102px before truncating. */
@media (min-width: 768px) {
  #appbar a[href$="/account"]:has(.nh-acc-av) > span.pointer-events-none { display: none !important; }
  #appbar a[href$="/account"]:has(.nh-acc-av) { padding-right: 0.75rem !important; }
}
/* Open problem reports, pinned to the account button (admins only). The link is
   already position:relative; pointer-events none so the button stays one click
   target. z-index 2 beats the isolated avatar (whose photo tops out at 1). */
.nh-rp-badge { position: absolute; top: -6px; right: -6px; z-index: 2; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; background: var(--nh-amber, #e0c27a); color: #14110d; font-family: var(--nh-sans, system-ui); font-weight: 700; font-size: 0.66rem; line-height: 17px; text-align: center; box-shadow: 0 1px 5px rgba(0,0,0,0.5); pointer-events: none; }
/* Mark-as-finished badge (green, bottom corner so it can coexist with the
   admin's report badge above). Clickable: it routes to the stats card. */
.nh-amf-badge { position: absolute; bottom: -6px; right: -6px; z-index: 2; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; background: #58c27d; color: #04240f; font-family: var(--nh-sans, system-ui); font-weight: 700; font-size: 0.66rem; line-height: 17px; text-align: center; box-shadow: 0 1px 5px rgba(0,0,0,0.5); cursor: pointer; }
.nh-amf-chk { font-size: 1rem; line-height: 1; color: #58c27d; }
#nh-ys-almost.nh-amf-flash { animation: nh-amf-flash 1.3s ease 2; }
@keyframes nh-amf-flash { 0%, 100% { box-shadow: none; } 50% { box-shadow: 0 0 0 3px #58c27d; } }
/* Finished + Almost done side by side once both exist (spans the insights grid) */
.nh-fd-cols { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
@media (max-width: 980px) { .nh-fd-cols { grid-template-columns: 1fr; } }
.nh-fd-cols > .nh-ys-card { margin: 0; }
/* mark-as-finished confirmation dialog */
#nh-amf-confirm .nh-rt-modal-box { max-width: 420px; width: 92vw; }
.nh-amf-q-title { margin: 10px 0 2px; font-family: var(--nh-serif, serif); font-size: 1.1rem; color: var(--nh-text-1, #f4eee2); }
.nh-amf-q { margin: 2px 0 16px; font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: var(--nh-muted-2, #9a9085); }
.nh-amf-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.nh-amf-yes { background: var(--nh-amber, #e0c27a); color: #14110d; border: none; border-radius: 10px; padding: 10px 20px; font-family: var(--nh-sans, system-ui); font-weight: 600; cursor: pointer; }
.nh-amf-no { background: transparent; color: var(--nh-muted-2, #9a9085); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.15)); border-radius: 10px; padding: 10px 20px; font-family: var(--nh-sans, system-ui); font-weight: 600; cursor: pointer; }
.nh-amf-no:hover, .nh-amf-yes:hover { filter: brightness(1.08); }
/* admin-only marker: this user opted out, others cannot see them */
.nh-sb-opted { font-size: 0.95em; margin-left: 6px; vertical-align: -2px; color: var(--nh-muted-2, #9a9085); opacity: 0.85; }
/* sessions card (admin tab): rows are links; a pulsing dot marks live ones */
.nh-sesh-row { text-decoration: none; }
.nh-sesh-row:hover .nh-ys-name { color: var(--nh-amber, #e0c27a); }
.nh-sesh-sub { display: flex; align-items: center; gap: 6px; font-family: var(--nh-sans, system-ui); font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); }
.nh-sesh-dot { width: 8px; height: 8px; border-radius: 50%; background: #58c27d; box-shadow: 0 0 6px #58c27d; animation: nh-sesh-pulse 1.6s ease infinite; }
@keyframes nh-sesh-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
body.nh-selecting .nh-rp-badge { visibility: hidden !important; }
/* Collection actions live in the toolbar / title row, not as grid tiles.
   TWO contexts, TWO rules -- one shared rule served neither: a 999px amber pill
   37.7px tall, sitting in a toolbar whose controls are 28px frosted 11px-radius
   pills, AND in a title row whose buttons are 36px and bottom-aligned.
   Landing page: no !important here, so the canonical toolbar-button rule paints
   it exactly like the sort dropdown, amber hover border included. The
   declarations below repeat those values without !important purely as a
   fallback for the frames before body.nh-has-toolbar lands.
   Detail page: 36px and no bottom margin, or it floats 4px off the row's shared
   baseline and stretches the row from 36px to 41.7px.
   Accent stays in the glyph and the hover border, never in the fill -- an
   amber-filled pill is why this read as alien next to everything else. */
#toolbar button.nh-cl-newbtn {
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto;
  font-family: var(--nh-sans, system-ui); font-size: var(--nh-ctl-fs, 0.75rem); line-height: 1;
  white-space: nowrap; cursor: pointer;
  padding: 5px 12px; border-radius: var(--nh-ctl-r, 11px);
  border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14));
  background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: var(--nh-text-2, #d8cfc2);
  transition: background-color .15s, border-color .15s, color .15s;
}
#toolbar button.nh-cl-newbtn:hover { background: var(--nh-ctl-bg-hi, rgba(255,255,255,0.10)); border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }
#toolbar button.nh-cl-newbtn .material-symbols { font-size: 1rem; line-height: 1; color: var(--nh-amber, #e0c27a); }
.nh-col-addbtn { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; margin: 0 0 0 8px; border-radius: 8px; border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: var(--nh-text-2, #d8cfc2); font-family: var(--nh-sans, system-ui); font-size: 0.82rem; line-height: 1; white-space: nowrap; cursor: pointer; transition: background-color .15s, border-color .15s, color .15s; }
.nh-col-addbtn:hover { background: var(--nh-ctl-bg-hi, rgba(255,255,255,0.10)); border-color: var(--nh-amber, #e0c27a); color: var(--nh-text-1, #f4eee2); }
.nh-col-addbtn .material-symbols { font-size: 1.05rem; line-height: 1; color: var(--nh-amber, #e0c27a); }
/* Book-page lookup buttons: square icon buttons in the action row, matching the
   native edit/collections icon buttons (Pawel). The service favicon sits over an
   initial-letter fallback, so a blocked request still leaves a usable button. */
/* These sit INSIDE the book action row, between "mark as finished" and the
   3-dot menu, so they must be the same button as their neighbours rather than a
   smaller variant. Measured off the stock buttons: 48x48, radius 12px, 1px
   rgba(255,255,255,0.15), transparent fill, mark 22.4px in --nh-text-2. */
.nh-bs-row { display: inline-flex; align-items: center; gap: 4px; margin: 0 2px; vertical-align: middle; }
#item-page-wrapper a.nh-bs-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 48px !important; height: 48px !important; min-width: 48px !important; padding: 0 !important; box-sizing: border-box; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: transparent; text-decoration: none !important; overflow: hidden; transition: border-color .15s, background-color .15s, color .15s; }
#item-page-wrapper a.nh-bs-btn:hover { border-color: var(--nh-amber, #e0c27a); background: rgba(255,255,255,0.06); }
#item-page-wrapper a.nh-bs-btn:hover .nh-bs-letter { color: var(--nh-amber, #e0c27a); }
.nh-bs-letter { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--nh-sans, system-ui); font-size: 1.25rem; font-weight: 600; line-height: 1; color: var(--nh-text-2, #d8cfc2); transition: color .15s; }
/* The bundled logos are white-on-transparent, so they are painted as a MASK over
   currentColor rather than drawn as an image. That makes them one-colour flat
   marks that inherit the button's colour and its amber hover, matching the
   material icons beside them instead of introducing brand colours. */
.nh-bs-logo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 22px; height: 22px; background-color: var(--nh-text-2, #d8cfc2); transition: background-color .15s; -webkit-mask: var(--nh-bs-logo) center / contain no-repeat; mask: var(--nh-bs-logo) center / contain no-repeat; }
#item-page-wrapper a.nh-bs-btn:hover .nh-bs-logo { background-color: var(--nh-amber, #e0c27a); }

/* Who's reading this (#23): facepile button in the action row + its popup.
   The button matches the 48px book-site squares next to it; inside, up to three
   overlapping mini avatars (photo layers over the monogram, the scoreboard
   trick: on 404 the img removes itself and the letter shows). */
#item-page-wrapper button.nh-rd-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 48px !important; height: 48px !important; min-width: 48px !important; padding: 0 !important; margin: 0 2px; box-sizing: border-box; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: transparent; cursor: pointer; vertical-align: middle; transition: border-color .15s, background-color .15s; }
#item-page-wrapper button.nh-rd-btn:hover { border-color: var(--nh-amber, #e0c27a); background: rgba(255,255,255,0.06); }
.nh-rd-fp-av { position: relative; overflow: hidden; width: 18px; height: 18px; margin-left: -6px; border-radius: 50%; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; background: var(--nh-raised, #221e1a); border: 1px solid rgba(255,255,255,0.25); font-family: var(--nh-sans, system-ui); font-size: 0.6rem; font-weight: 700; line-height: 1; color: var(--nh-text-2, #d8cfc2); }
.nh-rd-fp-av:first-child { margin-left: 0; }
.nh-rd-fp-av img { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.nh-rd-fp-more { font-size: 0.56rem; }
#nh-rd-modal .nh-rt-modal-box { max-width: 480px; width: 92vw; }
.nh-rd-list { display: flex; flex-direction: column; gap: 2px; margin-top: 6px; max-height: min(56vh, 480px); overflow-y: auto; scrollbar-width: thin; }
.nh-rd-row { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 10px; }
.nh-rd-row:hover { background: rgba(255,255,255,0.04); }
.nh-rd-av { position: relative; overflow: hidden; width: 30px; height: 30px; border-radius: 50%; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; background: var(--nh-raised, #221e1a); border: 1px solid rgba(255,255,255,0.18); font-family: var(--nh-sans, system-ui); font-size: 0.82rem; font-weight: 700; color: var(--nh-text-2, #d8cfc2); }
.nh-rd-av img { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.nh-rd-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--nh-sans, system-ui); font-size: 0.92rem; color: var(--nh-text-1, #f4eee2); }
.nh-rd-stat { display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; font-family: var(--nh-sans, system-ui); }
.nh-rd-bar { position: relative; width: 74px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.12); overflow: hidden; }
.nh-rd-fill { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 999px; background: var(--nh-amber, #e0c27a); }
.nh-rd-pct { font-size: 0.8rem; font-weight: 600; color: var(--nh-text-2, #d8cfc2); min-width: 34px; text-align: right; }
.nh-rd-fin { font-size: 0.8rem; font-weight: 600; color: var(--nh-amber, #e0c27a); }
.nh-rd-when { font-size: 0.74rem; color: var(--nh-muted-2, #9a9085); }
/* panel: grouped checkbox list */
#nh-booksites .nh-bs-group { font-family: var(--nh-sans, system-ui); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--nh-muted-2, #9a9085); margin: 12px 0 6px; }
#nh-booksites .nh-bs-group:first-child { margin-top: 0; }
#nh-booksites .nh-bs-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 4px 12px; }
#nh-booksites .nh-bs-check { display: flex; align-items: center; gap: 8px; font-family: var(--nh-sans, system-ui); font-size: 0.85rem; color: var(--nh-text-2, #d8cfc2); cursor: pointer; padding: 3px 0; }
#nh-booksites .nh-bs-check input { accent-color: var(--nh-amber, #e0c27a); width: 15px; height: 15px; cursor: pointer; }
/* No late horizontal shift when a vertical scrollbar appears: reserve its space
   up front on the scrollers that hold grids. */
#bookshelf, #page-wrapper, #app-content .page, .configContent { scrollbar-gutter: stable; }
/* ---- B3: touch + phone ----------------------------------------------------
   Two separate problems, two separate queries. (hover: none) is about INPUT:
   anything we only reveal on hover is otherwise unreachable on a phone or
   tablet. max-width is about SIZE: our own controls have to stay finger-sized
   (~32px) and readable at 360-412px. */
@media (hover: none) {
  .nh-ug-acts { opacity: 1; }              /* edit / delete on a user card */
  .nh-ug-card .nh-ug-rm { display: flex; } /* remove photo */
}
@media (max-width: 640px) {
  .nh-ug-type { font-size: 0.72rem; }
  .nh-ug-act-btn { padding: 7px; }
  /* the remove-photo badge is always visible on touch, so it must be tappable */
  .nh-ug-card .nh-ug-rm { width: 32px; height: 32px; font-size: 1.1rem; top: -7px; right: -7px; }
  .nh-ug-act-btn .material-symbols { font-size: 1.15rem; }
  .nh-ug-spill, .nh-sb-pill { padding: 9px 16px; }
  #toolbar button.nh-cl-newbtn { min-height: 34px; }
  .nh-sb-yir { padding: 9px 16px; }
  #nh-ug-bar { justify-content: flex-start; }
  .nh-nr-dd-btn, .nh-nr-search { min-height: 34px; }
  .nh-rt-link { min-height: 32px; display: inline-flex; align-items: center; }
  .nh-rt-stars { font-size: 1.5rem; letter-spacing: 3px; }   /* half-star taps need room */
  /* Carousel dots stay 8px tall visually but get a 32px hit area: the padding
     enlarges the box and background-clip keeps the paint in the content box.
     !important because the active-dot colour is written as an inline style. */
  .nh-dot { height: 32px !important; padding: 12px 4px !important; background-clip: content-box !important; box-sizing: border-box; }
  .nh-sb-grid { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); }
  /* The podium keeps its three columns on a phone, so the enlarged portraits have
     to come back down or the winner's 104px tile is wider than its column. */
  .nh-sb-podium { gap: 8px; }
  .nh-sb-pod { padding: 14px 6px 12px; border-radius: 14px; gap: 6px; }
  .nh-sb-pod.p1 { padding: 20px 6px 16px; }
  .nh-sb-pod-av { width: 54px; height: 54px; font-size: 1.35rem; }
  .nh-sb-pod.p1 .nh-sb-pod-av { width: 68px; height: 68px; font-size: 1.7rem; }
  .nh-sb-pod-rank { width: 24px; height: 24px; padding: 1.5px; font-size: 0.78rem; right: -2px; bottom: -2px; }
  .nh-sb-pod-rank::after { inset: 3px; }
  .nh-sb-pod.p1 .nh-sb-pod-rank { width: 30px; height: 30px; padding: 2px; font-size: 0.92rem; right: 0; bottom: 0; }
  .nh-sb-pod.p1 .nh-sb-pod-rank::after { inset: 4px; }
  .nh-sb-pod-name { font-size: 0.8rem; }
  .nh-sb-pod.p1 .nh-sb-pod-name { font-size: 0.88rem; }
  .nh-sb-pod-time { font-size: 0.95rem; }
  .nh-sb-pod.p1 .nh-sb-pod-time { font-size: 1.1rem; }
  .nh-sb-av.nh-sb-cav { width: 48px; height: 48px; font-size: 1.2rem; }
  .nh-us-tiles { grid-template-columns: repeat(2, 1fr); }
  .nh-yir-chart { height: 150px; gap: 3px; }
  .nh-yir-val { display: none; }           /* twelve tiny numbers do not fit a phone */
  .nh-yir-lab { font-size: 0.62rem; }
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
  // Where the appbar actually ends, published as --nh-appbar-h for the toolbars to
  // butt against. The frosted toolbar used to hardcode top:65px while ABS's appbar
  // wrapper is h-16 = 64px, leaving a 1px band of the page showing through between
  // them. It read far wider than 1px because both surfaces are backdrop-filtered and
  // a blur thins out at its own edge, so the seam was a strip of SHARP artwork
  // between two frosted panels ("small gap between top bar and toolbar", Pawel).
  // Measured rather than corrected to a constant: the frosted band is the appbar's
  // PARENT (#appbar itself is transparent and 1px shorter), and a fractional height
  // there would reopen the hairline. Floored, so any rounding overlaps instead of
  // gapping - the two surfaces share a tint, so a sub-pixel overlap is invisible
  // while a sub-pixel gap is not.
  function nhMeasureAppbar() {
      const ab = document.getElementById('appbar');
      const band = ab && ab.parentElement;
      if (!band) return;
      const h = Math.floor(band.getBoundingClientRect().bottom);
      if (!(h > 30 && h < 140)) return; // hidden or mid-mount: keep the last good value
      const v = h + 'px';
      if (document.documentElement.style.getPropertyValue('--nh-appbar-h') !== v) {
          document.documentElement.style.setProperty('--nh-appbar-h', v);
      }
  }

  function manageLayout() {
      const _p = window.location.pathname;
      document.body.classList.toggle('nh-pad-page', /\/authors?\/[^/]+/.test(_p) || /\/collections?\/[^/]+/.test(_p));

      nhMeasureAppbar();

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

  // The 200ms poll stays as a backstop, but body.nh-home must flip the INSTANT the
  // route changes: home and grid toolbars sit at different tops, so a stale class
  // was a visible 200ms jolt on every navigation. enhancements.js also calls this
  // from its reactive tick (~80ms after any DOM change) via the handle below.
  setInterval(manageLayout, 200);
  window.__nhManageLayout = manageLayout;
  try {
      const _push = history.pushState;
      history.pushState = function () { const r = _push.apply(this, arguments); try { manageLayout(); } catch (e) {} return r; };
      const _repl = history.replaceState;
      history.replaceState = function () { const r = _repl.apply(this, arguments); try { manageLayout(); } catch (e) {} return r; };
      window.addEventListener('popstate', function () { try { manageLayout(); } catch (e) {} });
  } catch (e) {}

  // ==========================================
  // CONTEXT-MENU DROP-UP (all menus, B4)
  // ==========================================
  // Flip ANY unified dropdown upward when it would run past the bottom of the
  // viewport (last table rows, toolbar kebabs near the fold, card menus at the
  // bottom shelf). Space is measured per open - a static CSS rule can't know it.
  // Generalized from the files-table-only listener that shipped in book-details
  // v1.25; only flips when there is actually room above.
  document.addEventListener('click', function () {
      setTimeout(function () {
          document.querySelectorAll('.border-black-200.shadow-lg[role="menu"]').forEach(function (m) {
              if (!m.offsetParent) return; // menu closed
              const wrap = m.parentElement;
              if (!wrap) return;
              const wr = wrap.getBoundingClientRect();
              const mh = m.getBoundingClientRect().height || 0;
              if (window.innerHeight - wr.bottom < mh + 16 && wr.top > mh + 16) {
                  m.style.setProperty('top', 'auto', 'important');
                  m.style.setProperty('bottom', 'calc(100% + 4px)', 'important');
                  m.style.setProperty('margin-top', '0', 'important');
              } else {
                  m.style.removeProperty('top');
                  m.style.removeProperty('bottom');
                  m.style.removeProperty('margin-top');
              }
          });
      }, 60);
  }, true);

  // Hide the Home toolbar (the lone "More" button) once the page is scrolled.
  function onAnyScroll(e) {
      const tb = document.getElementById('toolbar');
      // body, not the toolbar element: a freshly-remounted toolbar has no classes yet.
      if (!tb || !document.body.classList.contains('nh-home')) return;
      const el = e.target;
      let top = 0;
      if (el === document || el === document.documentElement || el === document.body) top = window.scrollY || 0;
      else if (el && typeof el.scrollTop === 'number') top = el.scrollTop;
      tb.classList.toggle('nh-toolbar-scrolled', top > 80);
  }
  document.addEventListener('scroll', onAnyScroll, true);



})();