/* NanoHive ABS — Early Boot Shim  v1.3.0
   Runs inline in <head>, right after core.js. Applies the resolved theme
   (baked defaults merged with the user's saved overrides) before first paint,
   and paints the cached home cinematic background as soon as <body> exists,
   so the page opens fully themed instead of in stages.
   enhancements.js re-applies the same values later (idempotent) and handles
   the DOM-dependent bits (logo, brand text, hidden shelves). */
(function () {
  'use strict';

  // Neutral defaults. Must mirror defaultSettings in enhancements.js (visual subset).
  var DEFAULTS = { accentColor: '#e0c27a', mainFont: 'Merriweather', fontScale: 1.0, baseTheme: 'warm', logoUrl: '', colorizeLogo: false, customSeriesCards: true };

  // Operator defaults, injected by nginx from env vars. Precedence:
  // saved user settings > NH_CONFIG > DEFAULTS.
  var CFG = (window.NH_CONFIG && typeof window.NH_CONFIG === 'object') ? window.NH_CONFIG : {};
  // UI-saved server defaults (admin panel -> PUT -> /data/nh volume), injected via SSI.
  var SRV = (window.NH_SERVER_CONFIG && typeof window.NH_SERVER_CONFIG === 'object') ? window.NH_SERVER_CONFIG : {};

  // Must mirror baseThemes in enhancements.js.
  var THEMES = {
    warm:    { canvas: '#181512', rail: '#120f0d', raised: '#221e1a', rgb: '24, 21, 18',  appbar: 'rgba(24, 21, 18, 0.70)' },
    slate:   { canvas: '#111625', rail: '#0d111c', raised: '#1a2238', rgb: '17, 22, 37',  appbar: 'rgba(17, 22, 37, 0.70)' },
    black:   { canvas: '#080808', rail: '#050505', raised: '#141414', rgb: '8, 8, 8',     appbar: 'rgba(8, 8, 8, 0.70)' },
    navy:    { canvas: '#0a111a', rail: '#070c12', raised: '#101b29', rgb: '10, 17, 26',  appbar: 'rgba(10, 17, 26, 0.70)' },
    mocha:   { canvas: '#231c18', rail: '#1c1613', raised: '#2e2520', rgb: '35, 28, 24',  appbar: 'rgba(35, 28, 24, 0.70)' },
    pine:    { canvas: '#121a15', rail: '#0e1410', raised: '#19241d', rgb: '18, 26, 21',  appbar: 'rgba(18, 26, 21, 0.70)' },
    plum:    { canvas: '#1a1320', rail: '#140e19', raised: '#261b2e', rgb: '26, 19, 32',  appbar: 'rgba(26, 19, 32, 0.70)' },
    crimson: { canvas: '#1d1212', rail: '#160d0d', raised: '#2b1b1b', rgb: '29, 18, 18',  appbar: 'rgba(29, 18, 18, 0.70)' },
    ocean:   { canvas: '#0b1618', rail: '#081011', raised: '#122124', rgb: '11, 22, 24',  appbar: 'rgba(11, 22, 24, 0.70)' },
    sand:    { canvas: '#1c1814', rail: '#15120f', raised: '#2a241d', rgb: '28, 24, 20',  appbar: 'rgba(28, 24, 20, 0.70)' },
    steel:   { canvas: '#13171c', rail: '#0e1114', raised: '#1e242b', rgb: '19, 23, 28',  appbar: 'rgba(19, 23, 28, 0.70)' },
    wine:    { canvas: '#1a1014', rail: '#140c0f', raised: '#281820', rgb: '26, 16, 20',  appbar: 'rgba(26, 16, 20, 0.70)' }
  };

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem('nh-settings') || '{}') || {}; } catch (e) {}

  // `||` would discard legitimate falsy values (fontScale 0, colorizeLogo false).
  var pick = function (key) {
    if (saved[key] !== undefined && saved[key] !== null && saved[key] !== '') return saved[key];
    if (SRV[key] !== undefined && SRV[key] !== null && SRV[key] !== '') return SRV[key];
    if (CFG[key] !== undefined && CFG[key] !== null && CFG[key] !== '') return CFG[key];
    return DEFAULTS[key];
  };

  // Stock-series mode must be resolved before ABS measures its dummy card in
  // mounted(), or the bookshelf lays out with the wrong card widths (mangled grid
  // on refresh). <html> exists here; core.js gates on html.nh-stock-series.
  try {
    if (pick('customSeriesCards') === false) document.documentElement.classList.add('nh-stock-series');
  } catch (e) {}

  var s = {
    accentColor: pick('accentColor'),
    mainFont: pick('mainFont'),
    fontScale: pick('fontScale'),
    baseTheme: pick('baseTheme')
  };

  try {
    var t = THEMES[s.baseTheme] || THEMES.warm;
    var hexToRgba = function (hex, a) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
      if (!m) return 'rgba(224,194,122,' + a + ')';
      return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
    };
    var css = ':root{' +
      '--nh-canvas:' + t.canvas + ' !important;' +
      '--nh-rail:' + t.rail + ' !important;' +
      '--nh-raised:' + t.raised + ' !important;' +
      '--nh-raised-hover:' + t.raised + ' !important;' +
      '--nh-appbar-bg:' + t.appbar + ' !important;' +
      '--nh-bg-rgb:' + t.rgb + ' !important;' +
      '--nh-amber:' + s.accentColor + ' !important;' +
      '--nh-amber-hover:' + s.accentColor + 'ee !important;' +
      '--nh-amber-tint:' + hexToRgba(s.accentColor, 0.12) + ' !important;' +
      '--nh-amber-shadow:' + hexToRgba(s.accentColor, 0.30) + ' !important;' +
      '--nh-serif:"' + s.mainFont + '","Spectral",Georgia,serif !important;' +
      '--nh-font-scale:' + s.fontScale + ' !important;' +
      '}';
    var st = document.createElement('style');
    st.id = 'nh-early-vars';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);

    var families = ['Spectral:wght@400;500;600;700'];
    if (s.mainFont && s.mainFont.toLowerCase() !== 'spectral') {
      families.push(s.mainFont.replace(/ /g, '+') + ':wght@400;500;600;700');
    }
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.id = 'nh-custom-font-link';
    fl.href = 'https://fonts.googleapis.com/css2?family=' + families.join('&family=') + '&display=swap';
    (document.head || document.documentElement).appendChild(fl);
  } catch (e) {}

  // Logo: set the logo source URL early so core.js CSS has the mask ready
  // when enhancements.js adds the colorize class to the specific <a> tag.
  try {
    var logoUrl = pick('logoUrl');
    if (logoUrl) document.documentElement.style.setProperty('--nh-logo-url', 'url("' + logoUrl + '")');
  } catch (e) {}

  // Cached home cinematic background, painted as soon as <body> exists.
  try {
    var isHome = /\/library\/[^/]+\/?$/.test(location.pathname);
    var url = '';
    try { url = localStorage.getItem('nh-home-bg') || ''; } catch (e) {}
    if (isHome && url) {
      var paint = function () {
        if (!document.body || document.getElementById('nh-home-bg')) return;
        var bg = document.createElement('div');
        bg.id = 'nh-home-bg';
        var l0 = document.createElement('div'); l0.className = 'nh-bg-layer';
        var l1 = document.createElement('div'); l1.className = 'nh-bg-layer';
        bg.appendChild(l0); bg.appendChild(l1);
        document.body.insertBefore(bg, document.body.firstChild);
        l0.style.setProperty('background-image', 'url("' + url + '")', 'important');
        bg.dataset.active = '0';
        bg.dataset.url = url;
        document.body.classList.add('nh-cinematic');
        requestAnimationFrame(function () { l0.style.opacity = '1'; bg.style.opacity = '1'; });
      };
      if (document.body) paint();
      else new MutationObserver(function (m, obs) {
        if (document.body) { obs.disconnect(); paint(); }
      }).observe(document.documentElement, { childList: true });
    }
  } catch (e) {}
})();
