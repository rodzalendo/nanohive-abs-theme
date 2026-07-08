/* NanoHive ABS — JS Enhancements  v6.34.0  (injected build) */

(function () {
  'use strict';

  let nhHomeCover = '';
  let isInjectingHero = false;

  const GOOGLE_FONTS = ["Spectral", "Inter", "Merriweather", "Montserrat", "Playfair Display", "Oswald", "Raleway", "Nunito", "Ubuntu", "Lora", "Work Sans", "Fira Sans", "Poppins", "Cinzel", "Bitter", "Quicksand"];
  let fontLink = document.getElementById('nh-custom-font-link');
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.id = 'nh-custom-font-link';
    fontLink.rel = 'stylesheet';
    const fontQuery = GOOGLE_FONTS.map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&');
    fontLink.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
    document.head.appendChild(fontLink);
  }

  // ==========================================
  // 1. SETTINGS & CUSTOMIZATIONS
  // ==========================================
  // Built-in defaults are deliberately neutral: a stock Audiobookshelf look with the
  // theme's layout on top. Operators override them via env vars (nginx injects
  // window.NH_CONFIG); users override those from the in-app settings panel.
  // Precedence: saved user settings > operator NH_CONFIG > these.
  const defaultSettings = {
    appName: "",
    showLogoText: true,
    colorizeLogo: false,
    logoUrl: "",
    accentColor: "#e0c27a",
    baseTheme: "warm",
    mainFont: "Merriweather",
    fontScale: 1.0,
    carouselTiming: 15,
    hideRailSeries: false,
    hideRailCollections: false,
    hideRailAuthors: false,
    hideRailNarrators: false,
    hideRailStats: false,
    hideHomeRecentlyAdded: false,
    hideHomeRecentSeries: false,
    hideHomeContinueSeries: false,
    hideHomeListenAgain: false,
    hideHomeDiscover: false,
    hideHomeNewAuthors: false,
    showCustomRecentSeries: true,
    recentSeriesCount: 12
  };

  const serverSettings = (window.NH_CONFIG && typeof window.NH_CONFIG === 'object') ? window.NH_CONFIG : {};

  let nhSettings = { ...defaultSettings, ...serverSettings };
  try {
    const saved = localStorage.getItem('nh-settings');
    if (saved) nhSettings = { ...defaultSettings, ...serverSettings, ...JSON.parse(saved) };
  } catch (e) {}

  const baseThemes = {
    warm:  { name: 'Warm Dark', canvas: '#181512', rail: '#120f0d', raised: '#221e1a', rgb: '24, 21, 18', appbar: 'rgba(24, 21, 18, 0.70)' },
    slate: { name: 'Cool Slate', canvas: '#111625', rail: '#0d111c', raised: '#1a2238', rgb: '17, 22, 37', appbar: 'rgba(17, 22, 37, 0.70)' },
    black: { name: 'True Black', canvas: '#080808', rail: '#050505', raised: '#141414', rgb: '8, 8, 8', appbar: 'rgba(8, 8, 8, 0.70)' },
    navy:  { name: 'Deep Navy', canvas: '#0a111a', rail: '#070c12', raised: '#101b29', rgb: '10, 17, 26', appbar: 'rgba(10, 17, 26, 0.70)' },
    mocha: { name: 'Mocha', canvas: '#231c18', rail: '#1c1613', raised: '#2e2520', rgb: '35, 28, 24', appbar: 'rgba(35, 28, 24, 0.70)' },
    pine:  { name: 'Deep Pine', canvas: '#121a15', rail: '#0e1410', raised: '#19241d', rgb: '18, 26, 21', appbar: 'rgba(18, 26, 21, 0.70)' },
    plum:    { name: 'Plum',    canvas: '#1a1320', rail: '#140e19', raised: '#261b2e', rgb: '26, 19, 32', appbar: 'rgba(26, 19, 32, 0.70)' },
    crimson: { name: 'Crimson', canvas: '#1d1212', rail: '#160d0d', raised: '#2b1b1b', rgb: '29, 18, 18', appbar: 'rgba(29, 18, 18, 0.70)' },
    ocean:   { name: 'Ocean',   canvas: '#0b1618', rail: '#081011', raised: '#122124', rgb: '11, 22, 24', appbar: 'rgba(11, 22, 24, 0.70)' },
    sand:    { name: 'Sand',    canvas: '#1c1814', rail: '#15120f', raised: '#2a241d', rgb: '28, 24, 20', appbar: 'rgba(28, 24, 20, 0.70)' },
    steel:   { name: 'Steel',   canvas: '#13171c', rail: '#0e1114', raised: '#1e242b', rgb: '19, 23, 28', appbar: 'rgba(19, 23, 28, 0.70)' },
    wine:    { name: 'Wine',    canvas: '#1a1014', rail: '#140c0f', raised: '#281820', rgb: '26, 16, 20', appbar: 'rgba(26, 16, 20, 0.70)' }
  };

  const presetColorsRow1 = ['#c88d36', '#5b8a62', '#4f728c', '#836589', '#b85b49', '#b5767a'];
  const presetColorsRow2 = ['#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#f44336', '#e91e63'];
  const presetColorsRow3 = ['#d4b383', '#8c9a83', '#798492', '#9b859d', '#c08779', '#a89f91'];
  const presetColorsRow4 = ['#e0c27a', '#7fa7c4', '#a88bbf', '#d98c7a', '#6fae8e', '#c77fa0'];
  const presetColorsRow5 = ['#ffc107', '#00bcd4', '#673ab7', '#8bc34a', '#ff5722', '#03a9f4'];
  const presetColors = [...presetColorsRow1, ...presetColorsRow2, ...presetColorsRow3, ...presetColorsRow4, ...presetColorsRow5];

  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') hex = '#c88d36';
    const r = parseInt(hex.slice(1, 3), 16) || 200;
    const g = parseInt(hex.slice(3, 5), 16) || 141;
    const b = parseInt(hex.slice(5, 7), 16) || 54;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function saveSettings() {
    localStorage.setItem('nh-settings', JSON.stringify(nhSettings));
  }

  function applySettings() {
    try {
      let style = document.getElementById('nh-dynamic-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'nh-dynamic-styles';
        document.head.appendChild(style);
      }

      const accentHover = nhSettings.accentColor + 'ee';
      const accentShadow = hexToRgba(nhSettings.accentColor, 0.30);
      const theme = baseThemes[nhSettings.baseTheme] || baseThemes.warm;
      const fontScale = nhSettings.fontScale || 1.0;

      let css = `
        :root {
          --nh-canvas: ${theme.canvas} !important;
          --nh-rail: ${theme.rail} !important;
          --nh-raised: ${theme.raised} !important;
          --nh-raised-hover: ${theme.raisedHover || theme.raised} !important;
          --nh-appbar-bg: ${theme.appbar} !important;
          --nh-bg-rgb: ${theme.rgb} !important;
          --nh-amber: ${nhSettings.accentColor} !important;
          --nh-amber-hover: ${accentHover} !important;
          --nh-amber-shadow: ${accentShadow} !important;
          --nh-serif: "${nhSettings.mainFont}", "Spectral", Georgia, serif !important;
          --nh-font-scale: ${fontScale} !important;
        }
      `;

      if (!nhSettings.showLogoText) css += `#appbar h1 { display: none !important; } `;
      if (nhSettings.hideRailSeries) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/series"] { display: none !important; } `;
      if (nhSettings.hideRailCollections) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/collections"] { display: none !important; } `;
      if (nhSettings.hideRailAuthors) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/authors"] { display: none !important; } `;
      if (nhSettings.hideRailNarrators) css += `[aria-label="Library Sidebar"] a[href$="/narrators"] { display: none !important; } `;
      if (nhSettings.hideRailStats) css += `[aria-label="Library Sidebar"] a[href$="/stats"] { display: none !important; } `;

      // CSS-only Logo Colorization via Safe DOM Insertion
      const img = document.querySelector('#appbar a[href$="/"] img');
      if (img) {
        if (!img.dataset.origSrc) img.dataset.origSrc = img.getAttribute('src');
        const targetSrc = nhSettings.logoUrl || img.dataset.origSrc;
        document.documentElement.style.setProperty('--nh-logo-url', `url("${targetSrc}")`);

        const aTag = img.parentElement;
        if (nhSettings.colorizeLogo) {
          aTag.classList.add('nh-logo-colorized');
        } else {
          aTag.classList.remove('nh-logo-colorized');
          if (img.getAttribute('src') !== targetSrc) {
            img.setAttribute('src', targetSrc);
          }
        }
      }

      if (style.textContent !== css) style.textContent = css;

      if (nhSettings.mainFont && nhSettings.mainFont.toLowerCase() !== 'spectral') {
        let customFontLink = document.getElementById('nh-custom-font-link');
        if (!customFontLink) {
          customFontLink = document.createElement('link');
          customFontLink.id = 'nh-custom-font-link';
          customFontLink.rel = 'stylesheet';
          document.head.appendChild(customFontLink);
        }
        const fontUrl = `https://fonts.googleapis.com/css2?family=${nhSettings.mainFont.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
        if (customFontLink.href !== fontUrl) customFontLink.href = fontUrl;
      }

      const brand = document.querySelector('#appbar a[href$="/"] h1');
      if (brand) {
        brand.textContent = nhSettings.appName || 'audiobookshelf';
      }

      const shelves = Array.from(document.querySelectorAll('.bookshelf-row'));
      shelves.forEach(row => {
        const h2 = row.querySelector('h2');
        if (!h2) return;
        const title = h2.textContent.trim().toLowerCase();

        let hide = false;
        if (nhSettings.hideHomeRecentlyAdded && (title.includes('recently added') || title.includes('ostatnio dodane') || title.includes('niedawno dodane'))) hide = true;
        if ((nhSettings.hideHomeRecentSeries || nhSettings.showCustomRecentSeries) && (title.includes('recent series') || title.includes('ostatnie serie') || title.includes('najnowsze serie'))) hide = true;
        if (nhSettings.hideHomeContinueSeries && (title.includes('continue series') || title.includes('kontynuuj seri'))) hide = true;
        if (nhSettings.hideHomeListenAgain && (title.includes('listen again') || title.includes('słuchaj ponownie'))) hide = true;
        if (nhSettings.hideHomeDiscover && (title.includes('discover') || title.includes('odkry'))) hide = true;
        if (nhSettings.hideHomeNewAuthors && (title.includes('newest authors') || title.includes('authors') || title.includes('autor'))) hide = true;

        if (hide) {
          row.style.display = 'none';
        } else if (row.style.display === 'none' && !row.dataset.heroInjected) {
          row.style.display = '';
        }
      });
    } catch (err) {
      // Catch silently so Vue execution isn't halted
    }
  }

  function createToggle(labelText, settingKey) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center py-2 cursor-pointer group';

    const renderBtnClass = (checked) =>
      checked ? 'bg-success border-success justify-end' : 'bg-primary border-black-100 justify-start';

    wrapper.innerHTML = `
      <div>
        <button type="button" class="border rounded-full flex items-center ${renderBtnClass(nhSettings[settingKey])}" style="width: 40px; transition: all 0.2s;">
          <span class="rounded-full border border-black-50 shadow-sm bg-white" style="width: 20px; height: 20px;"></span>
        </button>
      </div>
      <p class="pl-4 text-gray-200 group-hover:text-white transition-colors text-sm">${labelText}</p>
    `;

    wrapper.addEventListener('click', () => {
      nhSettings[settingKey] = !nhSettings[settingKey];
      saveSettings();
      wrapper.querySelector('button').className = `border rounded-full flex items-center ${renderBtnClass(nhSettings[settingKey])}`;
      applySettings();
    });

    return wrapper;
  }

  function renderThemeButtons(container) {
     container.innerHTML = '';
     container.className = '';
     container.style.display = 'grid';
     container.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
     container.style.gap = '10px';
     Object.entries(baseThemes).forEach(([k, v]) => {
        const btn = document.createElement('button');
        const isActive = nhSettings.baseTheme === k;
        btn.type = 'button';
        btn.textContent = v.name;
        btn.style.cssText = `padding: 11px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; text-align: center; cursor: pointer; color: #f4eee2; background: ${v.canvas}; border: 2px solid ${isActive ? 'var(--nh-amber)' : 'rgba(255,255,255,0.10)'}; box-shadow: ${isActive ? '0 0 12px var(--nh-amber-shadow)' : 'none'}; transition: border-color .15s, box-shadow .15s, transform .15s;`;
        btn.addEventListener('mouseenter', () => { if (!isActive) btn.style.transform = 'translateY(-2px)'; });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'none'; });
        btn.addEventListener('click', () => {
           nhSettings.baseTheme = k;
           saveSettings(); applySettings();
           renderThemeButtons(container);
        });
        container.appendChild(btn);
     });
  }

  function renderFontButtons(container) {
     container.innerHTML = '';
     container.className = 'flex flex-wrap gap-2 mt-2 mb-2';
     GOOGLE_FONTS.forEach(f => {
        const btn = document.createElement('button');
        const isActive = nhSettings.mainFont === f;
        btn.type = 'button';
        btn.className = `px-4 py-2 rounded-lg border-2 ${isActive ? 'border-accent bg-white/10 text-white shadow-lg scale-105 z-10' : 'border-white/10 bg-primary text-gray-300 hover:border-white/30 hover:scale-105'} transition-all text-sm`;
        btn.style.setProperty('font-family', `"${f}", sans-serif`, 'important');
        btn.textContent = f;
        btn.addEventListener('click', () => {
           nhSettings.mainFont = f;
           saveSettings(); applySettings();
           renderFontButtons(container);
        });
        container.appendChild(btn);
     });
  }

  function updateSwatchesUI() {
    const lowerAccent = (nhSettings.accentColor || '#c88d36').toLowerCase();

    document.querySelectorAll('.nh-color-preset').forEach(btn => {
      const isActive = btn.dataset.color === lowerAccent;
      btn.className = `nh-color-preset w-8 h-8 rounded-full border-2 ${isActive ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform shadow-md shrink-0`;
    });

    const isCustom = !presetColors.includes(lowerAccent);
    const customLabel = document.querySelector('#nh-custom-color-label');
    if (customLabel) {
       customLabel.className = `relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer border-2 ${isCustom ? 'border-white' : 'border-gray-500'} hover:scale-110 transition-transform shadow-md ml-4`;
    }
  }

  const NH_HASH = '#nh-customizations';

  function navLabel() {
    const lang = getUserLanguage().split('-')[0].toLowerCase();
    const map = { en: 'Customizations', pl: 'Personalizacja', de: 'Anpassung', fr: 'Personnalisation' };
    return map[lang] || map.en;
  }

  const PANEL_T = {
    en: {
      title: 'Theme Customizations', subtitle: 'Personalise the look of your library. Changes save automatically.',
      branding: 'Branding & Style', colour: 'Colour & Theme', homeCar: 'Home & Carousel', sidebar: 'Sidebar Menus',
      appName: 'App Name', appNameHint: 'Leave empty for the default name.',
      logoUrl: 'Custom Logo URL', logoHint: 'Leave empty for the default logo.',
      accent: 'Accent Colour', baseTheme: 'Base Theme', mainFont: 'Main Font',
      carousel: 'Carousel Auto-Advance', carouselHint: 'Seconds between slides. Set to 0 to disable.',
      customSeries: 'Expanded Recent Series', seriesCount: 'Recent Series Count', seriesCountHint: 'How many series to show in the expanded shelf.',
      hideShelves: 'Hide Homepage Shelves', sidebarHint: "Hide left-rail entries you don't use.",
      showAppName: 'Show App Name Text', colorizeLogo: 'Colorize Logo with Accent Colour',
      hideSeries: 'Hide Series', hideCollections: 'Hide Collections', hideAuthors: 'Hide Authors', hideNarrators: 'Hide Narrators', hideStats: 'Hide Stats',
      hideRecentlyAdded: 'Hide Recently Added', hideRecentSeries: 'Hide Recent Series', hideContinueSeries: 'Hide Continue Series', hideListenAgain: 'Hide Listen Again', hideDiscover: 'Hide Discover', hideNewestAuthors: 'Hide Newest Authors',
      gearLabel: 'Theme'
    },
    pl: {
      title: 'Personalizacja motywu', subtitle: 'Dostosuj wygląd swojej biblioteki. Zmiany zapisują się automatycznie.',
      branding: 'Marka i styl', colour: 'Kolor i motyw', homeCar: 'Strona główna i karuzela', sidebar: 'Menu boczne',
      appName: 'Nazwa aplikacji', appNameHint: 'Pozostaw puste, aby użyć domyślnej nazwy.',
      logoUrl: 'Własny adres URL logo', logoHint: 'Pozostaw puste, aby użyć domyślnego logo.',
      accent: 'Kolor akcentu', baseTheme: 'Motyw podstawowy', mainFont: 'Główna czcionka',
      carousel: 'Automatyczne przewijanie karuzeli', carouselHint: 'Sekundy między slajdami. Ustaw 0, aby wyłączyć.',
      customSeries: 'Rozszerzone ostatnie serie', seriesCount: 'Liczba ostatnich serii', seriesCountHint: 'Ile serii pokazać na rozszerzonej półce.',
      hideShelves: 'Ukryj półki strony głównej', sidebarHint: 'Ukryj nieużywane pozycje menu bocznego.',
      showAppName: 'Pokaż nazwę aplikacji', colorizeLogo: 'Pokoloruj logo kolorem akcentu',
      hideSeries: 'Ukryj Serie', hideCollections: 'Ukryj Kolekcje', hideAuthors: 'Ukryj Autorów', hideNarrators: 'Ukryj Lektorów', hideStats: 'Ukryj Statystyki',
      hideRecentlyAdded: 'Ukryj Ostatnio dodane', hideRecentSeries: 'Ukryj Ostatnie serie', hideContinueSeries: 'Ukryj Kontynuuj serię', hideListenAgain: 'Ukryj Słuchaj ponownie', hideDiscover: 'Ukryj Odkrywaj', hideNewestAuthors: 'Ukryj Najnowszych autorów',
      gearLabel: 'Motyw'
    },
    de: {
      title: 'Anpassungen', subtitle: 'Passe das Aussehen deiner Bibliothek an. Änderungen werden automatisch gespeichert.',
      branding: 'Marke & Stil', colour: 'Farbe & Thema', homeCar: 'Startseite & Karussell', sidebar: 'Seitenleisten-Menüs',
      appName: 'App-Name', appNameHint: 'Leer lassen für den Standardnamen.',
      logoUrl: 'Eigene Logo-URL', logoHint: 'Leer lassen für das Standardlogo.',
      accent: 'Akzentfarbe', baseTheme: 'Basisthema', mainFont: 'Hauptschriftart',
      carousel: 'Karussell Auto-Vorlauf', carouselHint: 'Sekunden zwischen Folien. 0 zum Deaktivieren.',
      customSeries: 'Erweiterte neue Serien', seriesCount: 'Anzahl neuer Serien', seriesCountHint: 'Wie viele Serien im erweiterten Regal angezeigt werden.',
      hideShelves: 'Startseiten-Regale ausblenden', sidebarHint: 'Nicht genutzte Einträge ausblenden.',
      showAppName: 'App-Namen anzeigen', colorizeLogo: 'Logo mit Akzentfarbe einfärben',
      hideSeries: 'Serien ausblenden', hideCollections: 'Sammlungen ausblenden', hideAuthors: 'Autoren ausblenden', hideNarrators: 'Sprecher ausblenden', hideStats: 'Statistiken ausblenden',
      hideRecentlyAdded: 'Kürzlich hinzugefügt ausblenden', hideRecentSeries: 'Neue Serien ausblenden', hideContinueSeries: 'Serie fortsetzen ausblenden', hideListenAgain: 'Erneut hören ausblenden', hideDiscover: 'Entdecken ausblenden', hideNewestAuthors: 'Neueste Autoren ausblenden',
      gearLabel: 'Design'
    }
  };
  function panelT() {
    const lang = getUserLanguage().split('-')[0].toLowerCase();
    return PANEL_T[lang] || PANEL_T.en;
  }

  function injectPanelStyles() {
    if (document.getElementById('nh-panel-style')) return;
    const s = document.createElement('style');
    s.id = 'nh-panel-style';
    s.textContent = `
      #nh-settings-panel { max-width: 1180px; margin: 0 auto; padding: 4px 12px 80px; }
      #nh-settings-panel .nh-head { margin-bottom: 30px; }
      #nh-settings-panel .nh-head h1 { font-family: var(--nh-serif); font-size: 2rem; font-weight: 600; color: var(--nh-amber); margin: 0; }
      #nh-settings-panel .nh-head p { color: var(--nh-muted, #9a9085); font-size: 0.95rem; margin: 6px 0 0; }
      #nh-settings-panel .nh-grid { column-width: 360px; column-gap: 24px; }
      #nh-settings-panel .nh-card { background: var(--nh-raised, #221e1a); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.06)); border-radius: 18px; padding: 24px 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.30); width: 100%; box-sizing: border-box; margin-bottom: 24px; break-inside: avoid; -webkit-column-break-inside: avoid; }
      #nh-settings-panel .nh-card-title { font-family: var(--nh-serif); color: var(--nh-amber); font-size: 1.15rem; font-weight: 600; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid var(--nh-hairline, rgba(255,255,255,0.08)); }
      #nh-settings-panel .nh-field { margin-bottom: 20px; }
      #nh-settings-panel .nh-field:last-child { margin-bottom: 0; }
      #nh-settings-panel .nh-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--nh-text-3, #cfc6ba); margin-bottom: 7px; letter-spacing: 0.01em; }
      #nh-settings-panel .nh-hint { font-size: 0.74rem; color: var(--nh-muted, #9a9085); margin: -2px 0 8px; }
      #nh-settings-panel input[type=text], #nh-settings-panel input[type=number] { width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.25); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); border-radius: 10px; padding: 10px 13px; color: var(--nh-text-1, #f4eee2); outline: none; transition: border-color .15s; font-size: 0.95rem; }
      #nh-settings-panel input[type=text]:focus, #nh-settings-panel input[type=number]:focus { border-color: var(--nh-amber); }
      #nh-settings-panel .nh-subhead { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--nh-muted, #9a9085); margin: 4px 0 6px; }
      #nh-settings-panel .nh-toggle-group { border-left: 2px solid var(--nh-hairline, rgba(255,255,255,0.07)); padding-left: 14px; }
      #nh-settings-panel .nh-divider { border-top: 1px solid var(--nh-hairline, rgba(255,255,255,0.08)); margin: 22px 0; }
      #nh-settings-modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; }
      #nh-settings-modal .nh-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
      #nh-settings-modal .nh-modal-container { position: relative; z-index: 1; width: 90%; max-width: 1100px; max-height: 85vh; background: var(--nh-canvas, #0b1618); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.12)); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.7); }
      #nh-settings-modal .nh-modal-close-row { display: flex; justify-content: flex-end; padding: 12px 16px 0; }
      #nh-settings-modal .nh-modal-close { background: none; border: none; color: var(--nh-text-2, #d8cfc2); font-size: 1.8rem; cursor: pointer; padding: 4px 12px; border-radius: 8px; line-height: 1; }
      #nh-settings-modal .nh-modal-close:hover { background: rgba(255,255,255,0.1); }
      #nh-settings-modal .nh-modal-body { flex: 1; overflow-y: auto; padding: 0 24px 32px; }
    `;
    document.head.appendChild(s);
  }

  function ensureConfigNavItem() {
    const nav = document.querySelector('[aria-label="Config Navigation"]');
    if (!nav) return;

    let item = nav.querySelector('#nh-config-nav-item');
    if (!item) {
      item = document.createElement('a');
      item.id = 'nh-config-nav-item';
      item.href = '/audiobookshelf/config' + NH_HASH;
      item.className = 'w-full px-3 h-12 border-b border-primary/30 flex items-center cursor-pointer relative hover:bg-primary/30';
      item.innerHTML = `<p class="leading-4"></p><div class="h-full w-0.5 bg-yellow-400 absolute top-0 left-0" style="display:none;"></div>`;

      const libLink = nav.querySelector('a[href$="/config/libraries"]');
      const settingsLink = nav.querySelector('a[href$="/config"]');
      if (libLink) {
        libLink.parentNode.insertBefore(item, libLink);
      } else if (settingsLink) {
        settingsLink.parentNode.insertBefore(item, settingsLink.nextSibling);
      } else {
        nav.appendChild(item);
      }

      item.addEventListener('click', (e) => {
        e.preventDefault();
        const onConfigRoot = /\/config\/?$/.test(window.location.pathname);
        if (onConfigRoot) {
          if (window.location.hash !== NH_HASH) window.location.hash = NH_HASH;
        } else {
          window.location.href = '/audiobookshelf/config' + NH_HASH;
        }
        setTimeout(() => { try { injectSettingsPanel(); } catch (err) {} }, 0);
      });
    }

    const p = item.querySelector('p');
    if (p && p.textContent !== navLabel()) p.textContent = navLabel();
  }

  function setNavActive(active) {
    const nav = document.querySelector('[aria-label="Config Navigation"]');
    if (!nav) return;
    const item = nav.querySelector('#nh-config-nav-item');
    const settings = nav.querySelector('a[href$="/config"]');
    if (active) {
      if (item) { item.classList.add('bg-primary/70'); item.classList.remove('hover:bg-primary/30'); item.setAttribute('aria-current', 'page'); }
      if (settings) { settings.classList.remove('bg-primary/70', 'nuxt-link-exact-active', 'nuxt-link-active'); settings.classList.add('hover:bg-primary/30'); settings.removeAttribute('aria-current'); }
    } else {
      if (item) { item.classList.remove('bg-primary/70'); item.classList.add('hover:bg-primary/30'); item.removeAttribute('aria-current'); }
    }
  }

  function createCustomizationsPanel(configPage, hideBranding = false) {
    injectPanelStyles();

    const panel = document.createElement('div');
    panel.id = 'nh-settings-panel';

    const T = panelT();

    const makeSwatch = (c) => `<button type="button" data-color="${c}" class="nh-color-preset w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform shadow-md shrink-0" style="background-color: ${c};"></button>`;

    const swatchesHtml = `
      <div style="display: flex; flex-wrap: wrap; gap: 11px; margin-top: 4px; align-items: center;">
        ${presetColors.map(makeSwatch).join('')}
        <label id="nh-custom-color-label" class="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer border-2 border-gray-500 hover:scale-110 transition-transform shadow-md" title="Custom Color" style="background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);">
          <input type="color" id="nh-in-color" class="absolute opacity-0 w-full h-full cursor-pointer" value="${nhSettings.accentColor}">
        </label>
      </div>
    `;

    panel.innerHTML = `
      <div class="nh-head">
        <h1>${T.title}</h1>
        <p>${T.subtitle}</p>
      </div>

      <div class="nh-grid">

        <section class="nh-card">
          <h2 class="nh-card-title">${T.branding}</h2>
          <div class="nh-field">
            <label class="nh-label">${T.appName}</label>
            <p class="nh-hint">${T.appNameHint}</p>
            <input type="text" id="nh-in-name" placeholder="audiobookshelf">
          </div>
          <div class="nh-field" id="nh-tog-text"></div>
          <div class="nh-field">
            <label class="nh-label">${T.logoUrl}</label>
            <p class="nh-hint">${T.logoHint}</p>
            <input type="text" id="nh-in-logo" placeholder="https://...">
          </div>
          <div class="nh-field" id="nh-tog-colorize"></div>
        </section>

        <section class="nh-card">
          <h2 class="nh-card-title">${T.colour}</h2>
          <div class="nh-field">
            <label class="nh-label">${T.accent}</label>
            ${swatchesHtml}
          </div>
          <div class="nh-divider"></div>
          <div class="nh-field">
            <label class="nh-label">${T.baseTheme}</label>
            <div id="nh-theme-buttons"></div>
          </div>
          <div class="nh-divider"></div>
          <div class="nh-field">
            <label class="nh-label">${T.mainFont}</label>
            <div id="nh-font-buttons"></div>
          </div>
        </section>

        <section class="nh-card">
          <h2 class="nh-card-title">${T.homeCar}</h2>
          <div class="nh-field">
            <label class="nh-label">${T.carousel}</label>
            <p class="nh-hint">${T.carouselHint}</p>
            <input type="number" id="nh-in-carousel" min="0" step="5">
          </div>
          <div class="nh-field" id="nh-tog-customseries"></div>
          <div class="nh-field">
            <label class="nh-label">${T.seriesCount}</label>
            <p class="nh-hint">${T.seriesCountHint}</p>
            <input type="number" id="nh-in-series-count" min="1" max="50" step="1">
          </div>
          <div class="nh-divider"></div>
          <div class="nh-subhead">${T.hideShelves}</div>
          <div id="nh-togs-home" class="nh-toggle-group"></div>
        </section>

        <section class="nh-card">
          <h2 class="nh-card-title">${T.sidebar}</h2>
          <p class="nh-hint" style="margin-top:0;">${T.sidebarHint}</p>
          <div id="nh-togs-rail" class="nh-toggle-group"></div>
        </section>

      </div>
    `;

    configPage.appendChild(panel);

    renderThemeButtons(panel.querySelector('#nh-theme-buttons'));
    renderFontButtons(panel.querySelector('#nh-font-buttons'));

    panel.querySelector('#nh-tog-text').appendChild(createToggle(T.showAppName, 'showLogoText'));
    panel.querySelector('#nh-tog-colorize').appendChild(createToggle(T.colorizeLogo, 'colorizeLogo'));

    const railTogs = panel.querySelector('#nh-togs-rail');
    railTogs.appendChild(createToggle(T.hideSeries, 'hideRailSeries'));
    railTogs.appendChild(createToggle(T.hideCollections, 'hideRailCollections'));
    railTogs.appendChild(createToggle(T.hideAuthors, 'hideRailAuthors'));
    railTogs.appendChild(createToggle(T.hideNarrators, 'hideRailNarrators'));
    railTogs.appendChild(createToggle(T.hideStats, 'hideRailStats'));

    const homeTogs = panel.querySelector('#nh-togs-home');
    homeTogs.appendChild(createToggle(T.hideRecentlyAdded, 'hideHomeRecentlyAdded'));
    homeTogs.appendChild(createToggle(T.hideRecentSeries, 'hideHomeRecentSeries'));
    homeTogs.appendChild(createToggle(T.hideContinueSeries, 'hideHomeContinueSeries'));
    homeTogs.appendChild(createToggle(T.hideListenAgain, 'hideHomeListenAgain'));
    homeTogs.appendChild(createToggle(T.hideDiscover, 'hideHomeDiscover'));
    homeTogs.appendChild(createToggle(T.hideNewestAuthors, 'hideHomeNewAuthors'));

    const bindInput = (id, key) => {
      const el = panel.querySelector(id);
      if (nhSettings[key] !== undefined) el.value = nhSettings[key];
      el.addEventListener('input', (e) => {
        nhSettings[key] = el.type === 'number' ? parseInt(e.target.value, 10) : e.target.value;
        saveSettings(); applySettings();
      });
      return el;
    };

    bindInput('#nh-in-name', 'appName');
    const logoInput = bindInput('#nh-in-logo', 'logoUrl');

    logoInput.addEventListener('change', (e) => {
      if (e.target.value.trim() === '') {
        nhSettings.colorizeLogo = false;
        saveSettings(); applySettings();
        const colorizeTogBtn = panel.querySelector('#nh-tog-colorize button');
        if (colorizeTogBtn) colorizeTogBtn.className = 'border rounded-full flex items-center bg-primary border-black-100 justify-start';
      }
    });

    bindInput('#nh-in-carousel', 'carouselTiming');
    bindInput('#nh-in-series-count', 'recentSeriesCount');
    panel.querySelector('#nh-tog-customseries').appendChild(createToggle(T.customSeries, 'showCustomRecentSeries'));

    const customPicker = panel.querySelector('#nh-in-color');
    customPicker.addEventListener('input', (e) => {
      nhSettings.accentColor = e.target.value;
      saveSettings(); applySettings(); updateSwatchesUI();
    });

    panel.querySelectorAll('.nh-color-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        nhSettings.accentColor = e.target.dataset.color;
        customPicker.value = nhSettings.accentColor;
        saveSettings(); applySettings(); updateSwatchesUI();
      });
    });

    updateSwatchesUI();

    if (hideBranding) {
      const brandingCard = panel.querySelector('#nh-in-name');
      if (brandingCard) { const card = brandingCard.closest('.nh-card'); if (card) card.style.display = 'none'; }
    }

    return panel;
  }

  // ==========================================
  // 7b. GEAR BUTTON (ALL USERS) + SETTINGS MODAL
  // ==========================================
  function isUserAdmin() {
    try { return !!(window.$nuxt && window.$nuxt.$store && window.$nuxt.$store.getters['user/getIsAdminOrUp']); } catch (e) { return false; }
  }

  function injectMobileMenuButton() {
    if (document.getElementById('nh-menu-btn')) return;
    const rail = document.getElementById('siderail-buttons-container');
    const logo = document.querySelector('#appbar a[href$="/"]');
    if (!rail || !logo || !logo.parentNode) return;

    // Build our own drawer from the rail links (ABS hides the rail's parent on mobile)
    const drawer = document.createElement('div');
    drawer.id = 'nh-mobile-drawer';
    rail.querySelectorAll('a').forEach(a => {
      const link = document.createElement('a');
      link.href = a.href;
      const span = a.querySelector('span.material-symbols, span.abs-icons');
      const label = a.querySelector('p, .truncate');
      link.innerHTML = `<span class="${span ? span.className : 'material-symbols'}">${span ? span.textContent : ''}</span><span class="nh-drawer-label">${label ? label.textContent : ''}</span>`;
      if (a.classList.contains('nuxt-link-exact-active')) link.classList.add('nh-drawer-active');
      drawer.appendChild(link);
    });

    const backdrop = document.createElement('div');
    backdrop.id = 'nh-menu-backdrop';

    const btn = document.createElement('a');
    btn.id = 'nh-menu-btn';
    btn.href = 'javascript:void(0)';
    btn.style.cssText = 'cursor:pointer; display:none; align-items:center; justify-content:center; padding:8px; border-radius:10px; margin-right:8px; color:var(--nh-text-2, #d8cfc2);';
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

    const closeMenu = () => document.body.classList.remove('nh-menu-open');
    btn.addEventListener('click', (e) => { e.preventDefault(); document.body.classList.toggle('nh-menu-open'); });
    backdrop.addEventListener('click', closeMenu);
    // $router.push() needs a base-relative path; a.href is a full absolute URL, so the
    // push silently no-ops. a.href already routes correctly, so navigate to it directly.
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      const href = a.getAttribute('href');
      if (href) window.location.assign(href);
    }));

    logo.parentNode.insertBefore(btn, logo);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    const mq = window.matchMedia('(max-width: 640px)');
    const applyVisibility = () => { btn.style.display = mq.matches ? 'flex' : 'none'; if (!mq.matches) closeMenu(); };
    applyVisibility();
    mq.addEventListener('change', applyVisibility);
  }

  function hideMobileUploadButton() {
    const links = document.querySelectorAll('#appbar a, #appbar button');
    links.forEach(el => {
      if (el.dataset.nhUploadChecked) return;
      const signals = [
        el.getAttribute('aria-label') || '',
        el.getAttribute('title') || '',
        el.getAttribute('href') || '',
        el.innerHTML || ''
      ].join(' ');
      if (/upload/i.test(signals)) {
        el.classList.add('nh-hide-upload-mobile');
        el.dataset.nhUploadChecked = '1';
      }
    });
  }

  function injectGearButton() {
    if (document.getElementById('nh-gear-btn')) return;
    const statsBtn = document.querySelector('#appbar a[href*="/stats"]');
    if (!statsBtn) return;

    const gear = document.createElement('a');
    gear.id = 'nh-gear-btn';
    gear.href = 'javascript:void(0)';
    gear.title = panelT().gearLabel;
    gear.style.cssText = 'cursor:pointer; display:flex; align-items:center; justify-content:center; padding:8px; border-radius:10px; margin-right:4px;';
    gear.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><rect x="2" y="3" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><rect x="7" y="7" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.8" fill="rgba(255,255,255,0.15)"/><circle cx="12" cy="14" r="2" fill="currentColor"/></svg>`;

    gear.addEventListener('click', (e) => {
      e.preventDefault();
      openSettingsModal();
    });

    statsBtn.parentNode.insertBefore(gear, statsBtn);
  }

  function openSettingsModal() {
    let modal = document.getElementById('nh-settings-modal');
    if (modal) { modal.remove(); }

    injectPanelStyles();
    modal = document.createElement('div');
    modal.id = 'nh-settings-modal';
    modal.innerHTML = `
      <div class="nh-modal-backdrop"></div>
      <div class="nh-modal-container">
        <div class="nh-modal-close-row"><button class="nh-modal-close">&times;</button></div>
        <div class="nh-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const body = modal.querySelector('.nh-modal-body');
    const oldPanel = document.getElementById('nh-settings-panel');
    if (oldPanel) oldPanel.remove();

    createCustomizationsPanel(body, !isUserAdmin());

    const close = () => modal.remove();
    modal.querySelector('.nh-modal-backdrop').addEventListener('click', close);
    modal.querySelector('.nh-modal-close').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  }

  function injectSettingsPanel() {
    ensureConfigNavItem();

    const path = window.location.pathname;
    const isConfigRoot = path === '/audiobookshelf/config' || path === '/audiobookshelf/config/';

    if (!isConfigRoot) {
      const ep = document.getElementById('nh-settings-panel');
      if (ep && !ep.closest('#nh-settings-modal')) ep.remove();
      setNavActive(false);
      return;
    }

    const configPage = document.querySelector('.configContent');
    if (!configPage) return;

    const wantCustom = window.location.hash === NH_HASH;
    let panel = document.querySelector('#nh-settings-panel:not(#nh-settings-modal #nh-settings-panel)');

    if (wantCustom) {
      if (!panel) panel = createCustomizationsPanel(configPage);
      panel.style.display = '';
      Array.from(configPage.children).forEach(ch => {
        if (ch !== panel && ch.style.display !== 'none') {
          ch.dataset.nhHidden = ch.style.display || '';
          ch.style.display = 'none';
        }
      });
      setNavActive(true);
    } else {
      if (panel) panel.style.display = 'none';
      Array.from(configPage.children).forEach(ch => {
        if (ch !== panel && ch.dataset.nhHidden !== undefined) {
          ch.style.display = ch.dataset.nhHidden;
          delete ch.dataset.nhHidden;
        }
      });
      setNavActive(false);
    }
  }

  // ==========================================
  // 8. JS SWEEPER FOR VUE FOOTER ARTIFACTS
  // ==========================================
  function sweepFooters() {
     document.querySelectorAll('div.border-t.bg-bg').forEach(el => {
         const txt = el.textContent || '';
         if (txt.includes('v2.') || txt.includes('docker')) {
             el.style.display = 'none';
             el.innerHTML = '';
             el.remove();
         }
     });
  }

  // ==========================================
  // 9. SWAP STATS LINK
  // ==========================================
  function swapStatsLinks() {
     const railStats = document.querySelector('#siderail-buttons-container a[href*="/stats"]');
     const topStats = document.querySelector('#appbar a[href*="/stats"]');

     if (railStats && railStats.getAttribute('href').includes('/library/')) {
         const libHref = railStats.getAttribute('href');
         railStats.setAttribute('href', '/audiobookshelf/config/stats');
         if (topStats) topStats.setAttribute('href', libHref);
     }
  }

  // ==========================================
  // 2. TRANSLATION DICTIONARY
  // ==========================================
  const getUserLanguage = () => {
    try {
      if (window.$nuxt && window.$nuxt.$i18n && window.$nuxt.$i18n.locale) {
        return window.$nuxt.$i18n.locale;
      }
      const vuexStr = localStorage.getItem('vuex');
      if (vuexStr) {
         const vuex = JSON.parse(vuexStr);
         if (vuex.user?.settings?.language) return vuex.user.settings.language;
      }
    } catch(e) {}
    return document.documentElement.lang || navigator.language || 'en';
  };

  const getTranslations = (langCode) => {
    const baseLang = langCode.split('-')[0].toLowerCase();
    const dictionary = {
      en: { morning: 'GOOD MORNING', afternoon: 'GOOD AFTERNOON', evening: 'GOOD EVENING', welcome: 'Welcome back', pickup: 'Pick up where you left off', by: 'by', continue: 'Continue', left: 'left', narratedBy: 'Narrated by', unknown: 'Unknown Title', fallbackDesc: 'Resume your current audiobook.' },
      pl: { morning: 'DZIEŃ DOBRY', afternoon: 'DOBREGO POPOŁUDNIA', evening: 'DOBRY WIECZÓR', welcome: 'Witaj ponownie', pickup: 'Wróć do słuchania', by: '', continue: 'Kontynuuj', left: 'pozostało', narratedBy: 'Czyta', unknown: 'Nieznany tytuł', fallbackDesc: 'Wznów słuchanie obecnego audiobooka.' },
      de: { morning: 'GUTEN MORGEN', afternoon: 'GUTEN TAG', evening: 'GUTEN ABEND', welcome: 'Willkommen zurück', pickup: 'Mache da weiter, wo du aufgehört hast', by: 'von', continue: 'Weiter', left: 'verbleibend', narratedBy: 'Gelesen von', unknown: 'Unbekannter Titel', fallbackDesc: 'Setze dein aktuelles Hörbuch fort.' },
      fr: { morning: 'BONJOUR', afternoon: 'BON APRÈS-MIDI', evening: 'BONSOIR', welcome: 'Bon retour', pickup: 'Reprenez là où vous vous étiez arrêté', by: 'de', continue: 'Continuer', left: 'restant', narratedBy: 'Lu par', unknown: 'Titre inconnu', fallbackDesc: 'Reprenez votre livre audio actuel.' }
    };
    return dictionary[baseLang] || dictionary.en;
  };

  // ==========================================
  // 3. ICONS & TIME HELPERS
  // ==========================================
  const RAIL_ICONS = [
    [/\/bookshelf\/series/,      'layers'],
    [/\/bookshelf\/collections/, 'collections_bookmark'],
    [/\/bookshelf\/authors/,     'groups'],
    [/\/bookshelf$/,             'menu_book'],
    [/\/narrators/,              'mic'],
    [/\/stats/,                  'bar_chart'],
    [/\/library\/[^/]+$/,        'home'],
  ];

  function remapRailIcons() {
    document.querySelectorAll('#siderail-buttons-container a').forEach((a) => {
      if (a.dataset.nhIcon) return;
      const href = a.getAttribute('href') || '';
      const match = RAIL_ICONS.find(([re]) => re.test(href));
      if (!match) return;
      const span = a.querySelector('span');
      if (!span) return;
      span.className = 'material-symbols text-2xl';
      span.textContent = match[1];
      a.dataset.nhIcon = '1';
    });
  }

  function localizeRail() {
    const lang = getUserLanguage().split('-')[0].toLowerCase();
    if (lang !== 'pl') return;
    document.querySelectorAll('#siderail-buttons-container a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!/\/library\/[^/]+$/.test(href)) return;
      a.querySelectorAll('p, .truncate, span:not(.material-symbols):not(.abs-icons)').forEach((el) => {
        if (el.textContent.trim() === 'Strona główna') el.textContent = 'Start';
      });
    });
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec) || sec <= 0) return '0m';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}m`;
  }

  // ==========================================
  // 4. HERO CAROUSEL INJECTION
  // ==========================================
  async function buildSlideData(card, t) {
    let title = card.querySelector('[cy-id="title"]')?.textContent.trim() || t.unknown;
    let author = card.querySelector('[cy-id="line2"]')?.textContent.trim() || "";
    let coverUrl = "";
    let id = null;

    const coverImg = card.querySelector('img[cy-id="coverImage"], img');
    if (coverImg && coverImg.src) {
      const match = coverImg.src.match(/\/api\/items\/([^/]+)\/cover/);
      if (match) id = match[1];
      try {
        const urlObj = new URL(coverImg.src, window.location.origin);
        urlObj.searchParams.set('width', '800');
        coverUrl = urlObj.toString();
      } catch(e) {
        coverUrl = coverImg.src;
      }
    }

    let leftSideText = "0%";
    let rightSideText = `0m ${t.left}`;
    let progressPercent = 0;
    let tagsHtml = "";
    let description = t.fallbackDesc;

    if (id) {
      let basePath = '/';
      try { basePath = window.__NUXT__.config.routerBasePath || '/'; } catch (e) {}
      if (!basePath.endsWith('/')) basePath += '/';
      const apiUrl = basePath + 'api/items/' + id + '?expanded=1&include=progress';

      let token = '';
      try {
        if (window.$nuxt && window.$nuxt.$store && window.$nuxt.$store.state.user) {
          token = window.$nuxt.$store.state.user.token;
        }
        if (!token) token = localStorage.getItem('token') || '';
        if (!token) {
          const vuexStr = localStorage.getItem('vuex');
          if (vuexStr) token = JSON.parse(vuexStr)?.user?.token || '';
        }
      } catch (e) {}

      try {
        const headersOpt = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch(apiUrl, { headers: headersOpt, credentials: 'include' });

        if (res.ok) {
          const itemData = await res.json();

          if (itemData.media?.metadata?.title) title = itemData.media.metadata.title;
          if (itemData.media?.metadata?.authorName) author = itemData.media.metadata.authorName;

          const descRaw = itemData.media?.metadata?.description;
          if (descRaw) {
            const tmp = document.createElement('div');
            tmp.innerHTML = descRaw;
            description = tmp.textContent || tmp.innerText;
            if (description.length > 450) description = description.substring(0, 445) + '...';
          }

          let durationSec = 0;
          let playedSec = 0;

          try {
            const vuexStr = localStorage.getItem('vuex');
            if (vuexStr) {
              const vuexData = JSON.parse(vuexStr);
              const mpList = vuexData?.user?.mediaProgress || [];
              const localProg = mpList.find(p => p.libraryItemId === id);
              if (localProg) {
                 if (localProg.duration) durationSec = Number(localProg.duration);
                 if (localProg.currentTime) playedSec = Number(localProg.currentTime);
                 if (localProg.progress) progressPercent = Number(localProg.progress) * 100;
              }
            }
          } catch(e) {}

          if (!durationSec) durationSec = Number(itemData.media?.duration) || Number(itemData.media?.metadata?.duration) || 0;

          const ump = itemData.userMediaProgress;
          if (ump) {
            if (ump.currentTime != null && !playedSec) playedSec = Number(ump.currentTime);
            if (ump.progress != null && !progressPercent) progressPercent = Number(ump.progress) * 100;
          }

          if (!progressPercent) {
             const pDiv = card.querySelector('.bg-yellow-400.absolute.bottom-0, [cy-id="progressBar"]');
             if (pDiv && pDiv.style.width) {
               const w = pDiv.style.width;
               progressPercent = w.includes('%') ? parseFloat(w) : (parseFloat(w) / (card.offsetWidth || 192)) * 100;
             }
          }
          if (!playedSec && durationSec > 0 && progressPercent > 0) {
            playedSec = durationSec * (progressPercent / 100);
          }

          if (isNaN(playedSec)) playedSec = 0;
          if (isNaN(durationSec)) durationSec = 0;
          if (isNaN(progressPercent)) progressPercent = 0;
          if (playedSec > durationSec) playedSec = durationSec;

          const leftSec = Math.max(0, durationSec - playedSec);

          leftSideText = `${Math.round(progressPercent)}%`;
          rightSideText = leftSec > 0 ? `${formatTime(leftSec)} ${t.left}` : `0m ${t.left}`;

          const tags = [];
          if (durationSec > 0) tags.push(formatTime(durationSec));

          const narrator = itemData.media?.metadata?.narratorName;
          if (narrator) tags.push(`${t.narratedBy} ${narrator}`);

          const genres = itemData.media?.metadata?.genres || [];
          if (genres.length > 0) tags.push(genres[0]);

          if (tags.length > 0) {
            tagsHtml = tags.map(tag => `<span style="background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.16); padding: 4px 14px; border-radius: 20px; font-size: 0.90rem; color: #ffffff; backdrop-filter: blur(4px);">${tag}</span>`).join('');
          }
        }
      } catch (e) {}
    }

    return { card, title, author, coverUrl, leftSideText, rightSideText, progressPercent, tagsHtml, description };
  }

  function slideMarkup(d, t) {
    return `
      <div class="nh-hero-slide" style="flex: 0 0 100%; min-width: 100%; box-sizing: border-box;">
        <div class="nh-hero-banner" style="position: relative; overflow: hidden; background-color: var(--nh-raised); border-radius: 24px; padding: 48px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s ease;">

          <div class="nh-hero-bg" style="position: absolute; inset: -12%; background-image: url('${d.coverUrl}'); background-size: cover; background-position: center; filter: blur(60px) brightness(0.5) saturate(1.4); z-index: 0; pointer-events: none;"></div>
          <div style="position: absolute; inset: 0; background: linear-gradient(110deg, rgba(var(--nh-bg-rgb), 0.92) 0%, rgba(var(--nh-bg-rgb), 0.62) 50%, rgba(var(--nh-bg-rgb), 0.22) 100%); z-index: 1; pointer-events: none;"></div>

          <div style="position: relative; z-index: 2; flex: 1; min-width: 0; padding-right: 64px; display: flex; flex-direction: column;">
            <div style="color: var(--nh-amber); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; font-family: system-ui, sans-serif;">${t.pickup}</div>
            <div class="nh-hero-title" style="font-family: var(--nh-serif); font-size: 3.4rem; font-weight: 600; line-height: 1.25; color: #ffffff; margin-bottom: 8px; padding-bottom: 4px; letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${d.title}</div>
            <div style="font-size: 1.25rem; color: #d8cfc2; margin-bottom: 20px; font-family: system-ui, sans-serif;">${t.by ? t.by + ' ' : ''}${d.author}</div>

            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; font-family: system-ui, sans-serif;">
              ${d.tagsHtml}
            </div>

            <div style="color: #c9bfb1; font-size: 1.15rem; line-height: 1.6; margin-bottom: 32px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; font-family: system-ui, sans-serif; max-width: 90%; text-shadow: 0 1px 8px rgba(0,0,0,0.5);">
              ${d.description}
            </div>

            <div style="display: flex; align-items: center; gap: 32px; font-family: system-ui, sans-serif;">
              <button class="nh-hero-play" style="background: var(--nh-amber); color: #14110d; border: none; border-radius: 12px; padding: 14px 32px; font-size: 1.15rem; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 0 25px var(--nh-amber-shadow);">
                <span class="material-symbols" style="font-size: 1.6rem; color: #14110d;">play_arrow</span> ${t.continue}
              </button>

              <div style="flex: 1; max-width: 320px;">
                <div style="height: 5px; background: rgba(255,255,255,0.15); border-radius: 3px; margin-bottom: 10px; overflow: hidden;">
                  <div style="height: 100%; width: ${d.progressPercent}%; background: var(--nh-amber); border-radius: 3px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: #c9bfb1;">
                  <span style="font-weight: 500;">${d.leftSideText}</span>
                  <span>${d.rightSideText}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="position: relative; z-index: 2; flex-shrink: 0; width: 340px; height: 340px;">
            <img src="${d.coverUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6);" />
          </div>
        </div>
      </div>
    `;
  }

  async function injectHeroBanner() {
    if (isInjectingHero || document.getElementById('nh-hero-container')) return;

    const headers = Array.from(document.querySelectorAll('.bookshelf-row h2'));
    const continueHeader = headers.find(h => {
      const txt = h.textContent.trim().toLowerCase();
      return txt.includes('continue') || txt.includes('kontynuuj') || txt.includes('weiter') || txt.includes('continu');
    });

    if (!continueHeader) return;

    const row = continueHeader.closest('.bookshelf-row');
    if (!row || row.dataset.heroInjected === 'true') return;

    let cards = Array.from(row.querySelectorAll('[cy-id="card"], [id^="book-card-"]'));
    if (!cards.length) return;
    cards = cards.slice(0, 10);

    isInjectingHero = true;

    const nativeChildren = Array.from(row.children);
    nativeChildren.forEach(c => { c.style.display = 'none'; });
    const skeleton = document.createElement('div');
    skeleton.id = 'nh-hero-skeleton';
    skeleton.style.marginBottom = '20px';
    skeleton.innerHTML = `
      <div style="margin-bottom:24px;padding:0 10px;">
        <div style="width:180px;height:13px;border-radius:6px;background:var(--nh-raised);opacity:.55;margin-bottom:12px;"></div>
        <div style="width:320px;height:40px;border-radius:8px;background:var(--nh-raised);opacity:.55;"></div>
      </div>
      <div style="height:436px;border-radius:24px;background:var(--nh-raised);position:relative;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <div class="nh-skel-shimmer" style="position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);transform:translateX(-100%);"></div>
      </div>
    `;
    row.appendChild(skeleton);
    try {
      const _sh = skeleton.querySelector('.nh-skel-shimmer');
      if (_sh && _sh.animate) _sh.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: 1400, iterations: Infinity, easing: 'ease-in-out' });
    } catch (e) {}

    const restoreNative = () => {
      const sk = document.getElementById('nh-hero-skeleton');
      if (sk) sk.remove();
      nativeChildren.forEach(c => { c.style.display = ''; });
    };

    try {
      const langCode = getUserLanguage();
      const t = getTranslations(langCode);

      const slides = (await Promise.all(cards.map(card => buildSlideData(card, t)))).filter(Boolean);
      if (!slides.length) { restoreNative(); return; }

      const dateString = new Intl.DateTimeFormat(langCode, { weekday: 'long' }).format(new Date()).toUpperCase();
      const hour = new Date().getHours();
      let greeting = t.evening;
      if (hour >= 5 && hour < 12) greeting = t.morning;
      else if (hour >= 12 && hour < 17) greeting = t.afternoon;
      const localizedDateHeader = `${dateString} · ${greeting}`;

      let username = "";
      const accLink = document.querySelector('a[href$="/account"] span.truncate');
      if (accLink) {
        username = accLink.textContent.trim();
        username = username.charAt(0).toUpperCase() + username.slice(1);
      }
      const welcomeText = username ? `${t.welcome}, ${username}` : t.welcome;

      const multi = slides.length > 1;
      const dotsHtml = slides.map((_, n) =>
        `<button class="nh-dot" data-i="${n}" style="border: none; padding: 0; height: 8px; border-radius: 4px; cursor: pointer; background: rgba(255,255,255,0.2); width: 8px; transition: width 0.25s ease, background 0.25s ease;"></button>`
      ).join('');

      const navHtml = multi ? `
        <div id="nh-hero-nav" style="display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 22px;">
          <button class="nh-nav-arrow" data-dir="-1" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s, opacity 0.2s;">
            <span class="material-symbols" style="font-size: 1.5rem; color: #d8cfc2;">chevron_left</span>
          </button>
          <div id="nh-hero-dots" style="display: flex; align-items: center; gap: 10px;">${dotsHtml}</div>
          <button class="nh-nav-arrow" data-dir="1" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s, opacity 0.2s;">
            <span class="material-symbols" style="font-size: 1.5rem; color: #d8cfc2;">chevron_right</span>
          </button>
        </div>
      ` : '';

      const heroContainer = document.createElement('div');
      heroContainer.id = 'nh-hero-container';
      heroContainer.style.marginBottom = '20px';

      heroContainer.innerHTML = `
        <div style="margin-bottom: 24px; padding: 0 10px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="color: #8a8075; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; font-family: system-ui, sans-serif;">${localizedDateHeader}</div>
            <h1 style="font-family: var(--nh-serif); font-size: 2.6rem; color: #f4eee2; font-weight: 500; margin: 0; line-height: 1;">${welcomeText}</h1>
          </div>
        </div>

        <div id="nh-hero-viewport" style="overflow: hidden; border-radius: 24px;">
          <div id="nh-hero-track" style="display: flex; transition: transform 0.9s ease;">
            ${slides.map(d => slideMarkup(d, t)).join('')}
          </div>
        </div>

        ${navHtml}
      `;

      const sk = document.getElementById('nh-hero-skeleton');
      if (sk) sk.remove();
      heroContainer.style.opacity = '0';
      heroContainer.style.transition = 'opacity 0.4s ease';
      row.appendChild(heroContainer);
      row.dataset.heroInjected = 'true';
      requestAnimationFrame(() => { heroContainer.style.opacity = '1'; });

      try {
        const rowPadLeft = getComputedStyle(row).paddingLeft;
        if (rowPadLeft && parseFloat(rowPadLeft) > 0) {
          heroContainer.style.boxSizing = 'border-box';
          heroContainer.style.width = '100%';
          heroContainer.style.paddingRight = rowPadLeft;
        }
      } catch (e) {}

      const slideEls = Array.from(heroContainer.querySelectorAll('.nh-hero-slide'));
      slideEls.forEach((el, n) => {
        const card = slides[n].card;
        const playBtn = el.querySelector('.nh-hero-play');
        const banner = el.querySelector('.nh-hero-banner');

        playBtn.addEventListener('mouseenter', () => playBtn.style.transform = 'scale(1.03)');
        playBtn.addEventListener('mouseleave', () => playBtn.style.transform = 'scale(1)');

        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const nativeBtn = card.querySelector('[cy-id="playButton"] .pointer-events-auto, [cy-id="playButton"] > div, .absolute.top-0.left-0.w-full.h-full.z-10 button');
          if (nativeBtn) nativeBtn.click();
          else card.click();
        });

        banner.addEventListener('click', () => card.click());
      });

      nhHomeCover = slides[0].coverUrl;
      setHomeBg(slides[0].coverUrl);

      if (multi) {
        const track = heroContainer.querySelector('#nh-hero-track');
        const dots = Array.from(heroContainer.querySelectorAll('.nh-dot'));
        const arrows = Array.from(heroContainer.querySelectorAll('.nh-nav-arrow'));
        let idx = 0;
        let timer = null;

        const goTo = (i) => {
          if (!document.body.contains(track)) { clearInterval(timer); return; }
          const len = slides.length;
          idx = ((i % len) + len) % len;
          track.style.transform = `translateX(-${idx * 100}%)`;
          dots.forEach((d, n) => {
            const active = n === idx;
            d.style.width = active ? '24px' : '8px';
            d.style.background = active ? 'var(--nh-amber)' : 'rgba(255,255,255,0.2)';
          });
          nhHomeCover = slides[idx].coverUrl;
          setHomeBg(slides[idx].coverUrl);
        };

        const startTimer = () => {
          clearInterval(timer);
          const timing = parseInt(nhSettings.carouselTiming, 10);
          if (timing > 0) {
            timer = setInterval(() => goTo(idx + 1), timing * 1000);
          }
        };

        arrows.forEach(a => a.addEventListener('click', () => { goTo(idx + parseInt(a.dataset.dir, 10)); startTimer(); }));
        dots.forEach((d, n) => d.addEventListener('click', () => { goTo(n); startTimer(); }));

        let touchStartX = 0, touchStartY = 0, touchDeltaX = 0, touching = false;
        track.addEventListener('touchstart', (e) => {
          touching = true;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchDeltaX = 0;
          clearInterval(timer);
        }, { passive: true });
        track.addEventListener('touchmove', (e) => {
          if (!touching) return;
          touchDeltaX = e.touches[0].clientX - touchStartX;
        }, { passive: true });
        track.addEventListener('touchend', () => {
          if (!touching) return;
          touching = false;
          const threshold = 40;
          if (Math.abs(touchDeltaX) > threshold) goTo(idx + (touchDeltaX < 0 ? 1 : -1));
          startTimer();
        });

        goTo(0);
        startTimer();
      }

    } catch (e) {
      restoreNative();
    } finally {
      isInjectingHero = false;
    }
  }

  // ==========================================
  // 5. HOME CINEMATIC BACKGROUND
  // ==========================================
  function setHomeBg(url) {
    if (!url) return;
    let bg = document.getElementById('nh-home-bg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'nh-home-bg';
      bg.appendChild(Object.assign(document.createElement('div'), { className: 'nh-bg-layer' }));
      bg.appendChild(Object.assign(document.createElement('div'), { className: 'nh-bg-layer' }));
      document.body.insertBefore(bg, document.body.firstChild);
      bg.dataset.active = '-1';
    }
    if (bg.dataset.url === url) return;
    const layers = bg.querySelectorAll('.nh-bg-layer');
    const activeIdx = parseInt(bg.dataset.active, 10);
    const nextIdx = activeIdx === 0 ? 1 : 0;
    layers[nextIdx].style.setProperty('background-image', `url("${url}")`, 'important');
    requestAnimationFrame(() => {
      layers[nextIdx].style.opacity = '1';
      if (activeIdx >= 0 && layers[activeIdx]) layers[activeIdx].style.opacity = '0';
    });
    bg.dataset.active = String(nextIdx);
    bg.dataset.url = url;
  }

  function getHomeBgUrl() {
    if (nhHomeCover) return nhHomeCover;
    try { return localStorage.getItem('nh-home-bg') || ''; } catch (e) { return ''; }
  }

  function manageCinematic() {
    const path = window.location.pathname;
    const itemPage = document.getElementById('item-page-wrapper');
    const bg = document.getElementById('nh-home-bg');

    const isSeriesDetail = /\/library\/[^/]+\/series\/[^/]+/.test(path);
    const isHome = /\/library\/[^/]+\/?$/.test(path);
    const isConfig = path.includes('/config');
    const isLibrarySub = /\/library\/[^/]+\//.test(path);

    const widen = (src) => { try { const u = new URL(src, location.origin); u.searchParams.set('width', '800'); return u.toString(); } catch (e) { return src; } };

    // Book item page → its own cover (darker)
    if (itemPage) {
      document.body.classList.add('nh-cinematic');
      document.body.classList.add('nh-cinematic-item');
      const img = itemPage.querySelector('img[src*="/cover"]');
      if (img && img.src) setHomeBg(widen(img.src));
      if (bg) bg.style.opacity = '1';
      return;
    }

    // Series detail page → first book cover (darker)
    if (isSeriesDetail) {
      document.body.classList.add('nh-cinematic');
      document.body.classList.add('nh-cinematic-item');
      const img = document.querySelector('#bookshelf img[src*="/cover"], [id^="cover-area-"] img');
      if (img && img.src) { setHomeBg(widen(img.src)); if (bg) bg.style.opacity = '1'; }
      return;
    }

    // Home → carousel cover (lighter)
    if (isHome) {
      document.body.classList.add('nh-cinematic');
      document.body.classList.remove('nh-cinematic-item');
      if (nhHomeCover) { setHomeBg(nhHomeCover); try { localStorage.setItem('nh-home-bg', nhHomeCover); } catch (e) {} }
      if (bg) bg.style.opacity = '1';
      return;
    }

    // Library sub-pages + Settings → reuse the Home background (lighter)
    if (isLibrarySub || isConfig) {
      const url = getHomeBgUrl();
      if (url) {
        document.body.classList.add('nh-cinematic');
        document.body.classList.remove('nh-cinematic-item');
        setHomeBg(url);
        if (bg) bg.style.opacity = '1';
        return;
      }
    }

    document.body.classList.remove('nh-cinematic');
    document.body.classList.remove('nh-cinematic-item');
    if (bg) bg.style.opacity = '0';
  }

  // ==========================================
  // 6. GOODREADS LINK (book detail)
  // ==========================================
  function injectGoodreads() {
    const wrapper = document.getElementById('item-page-wrapper');
    if (!wrapper) return;
    const h1 = wrapper.querySelector('h1');
    if (!h1) return;
    const playBtn = wrapper.querySelector('button.abs-btn.bg-success, .abs-btn.bg-success');
    if (!playBtn) return;

    let row = playBtn.parentElement;
    while (row && row !== wrapper && !(row.classList.contains('flex') && row.querySelectorAll('button, a').length >= 2)) {
      row = row.parentElement;
    }
    if (!row || row === wrapper) row = playBtn.closest('.flex');
    if (!row) return;

    const title = h1.textContent.trim();
    if (!title) return;
    const subEl = wrapper.querySelector('[cy-id="subtitle"], .nh-subtitle, [class*="subtitle"]');
    const subtitle = subEl ? subEl.textContent.trim() : '';
    const authEl = wrapper.querySelector('p.mb-2 a') || wrapper.querySelector('p.mb-2');
    const author = authEl ? authEl.textContent.trim() : '';
    const href = 'https://www.goodreads.com/search?q=' + encodeURIComponent([title, subtitle, author].filter(Boolean).join(' '));

    let a = row.querySelector('a[data-nh-goodreads]');
    if (!a) {
      a = document.createElement('a');
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Find on Goodreads';
      a.dataset.nhGoodreads = '1';
      a.className = 'icon-btn nh-goodreads-btn';
      a.innerHTML = '<img src="https://cdn.aptoide.com/imgs/8/0/0/800221239eae4d986d53aaeba991e771_icon.png" alt="Goodreads" />';
      if (row.lastElementChild) row.insertBefore(a, row.lastElementChild);
      else row.appendChild(a);
    }
    a.href = href;
  }

  // ==========================================
  // 10. CUSTOM EXPANDED "RECENT SERIES" SHELF
  // ==========================================
  let nhRecentSeries = { key: '', loading: false, data: null };

  function getBaseNH() {
    const p = window.location.pathname;
    const i = p.indexOf('/library/');
    if (i >= 0) return p.slice(0, i);
    try { const bp = window.__NUXT__ && window.__NUXT__.config && window.__NUXT__.config.routerBasePath; if (bp) return bp.replace(/\/$/, ''); } catch (e) {}
    return '';
  }
  function getLibIdNH() {
    const m = window.location.pathname.match(/\/library\/([^/]+)/);
    if (m) return m[1];
    try { return JSON.parse(localStorage.getItem('vuex') || '{}')?.libraries?.currentLibraryId || ''; } catch (e) { return ''; }
  }
  function getTokenNH() {
    try {
      if (window.$nuxt && window.$nuxt.$store && window.$nuxt.$store.state.user && window.$nuxt.$store.state.user.token) return window.$nuxt.$store.state.user.token;
      return localStorage.getItem('token') || JSON.parse(localStorage.getItem('vuex') || '{}')?.user?.token || '';
    } catch (e) { return ''; }
  }
  function escapeHtmlNH(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function fetchRecentSeries(libId, count) {
    const base = getBaseNH();
    const token = getTokenNH();
    const url = `${base}/api/libraries/${libId}/series?sort=addedAt&desc=1&limit=${count}&page=0`;
    const res = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {}, credentials: 'include' });
    if (!res.ok) return null;
    const d = await res.json();
    return (d.results || []).map(s => {
      const books = s.books || [];
      const covers = books.slice(0, 3).map(b => `${base}/api/items/${b.id || b.libraryItemId}/cover?width=400`);
      return { id: s.id, name: s.name, count: books.length, covers };
    });
  }

  function findNativeRecentSeriesRow() {
    return Array.from(document.querySelectorAll('.bookshelf-row')).find(r => {
      const h2 = r.querySelector('h2'); if (!h2) return false;
      const t = h2.textContent.trim().toLowerCase();
      return t.includes('recent series') || t.includes('ostatnie serie') || t.includes('najnowsze serie');
    }) || null;
  }

  function renderRecentSeriesInner(list, libId, base) {
    const lang = getUserLanguage().split('-')[0].toLowerCase();
    const titleMap = { en: 'Recent Series', pl: 'Ostatnie serie', de: 'Neue Serien', fr: 'Séries récentes' };
    const title = titleMap[lang] || titleMap.en;
    const token = getTokenNH();
    const tq = token ? '&token=' + encodeURIComponent(token) : '';
    const layers = ['c1', 'c2', 'c3'];
    const cards = list.map(s => {
      const cv = (s.covers || []).slice(0, 3);
      let inner = cv.length
        ? cv.map((url, i) => `<div class="nh-rs-cover ${layers[i]}" style="background-image:url('${url}${tq}')"></div>`).join('')
        : `<div class="nh-rs-cover c1" style="background:var(--nh-raised)"></div>`;
      const route = `/library/${libId}/series/${s.id}`;
      return `<a class="nh-rs-card" data-route="${route}" href="${base}${route}">
        <div class="nh-rs-covers">${inner}<div class="nh-rs-count">${s.count}</div></div>
        <p class="nh-rs-name">${escapeHtmlNH(s.name)}</p>
      </a>`;
    }).join('');
    return `<h2 class="nh-rs-heading">${escapeHtmlNH(title)}</h2><div class="nh-rs-scroll">${cards}</div>`;
  }

  function injectRecentSeriesStyles() {
    if (document.getElementById('nh-recent-series-style')) return;
    const s = document.createElement('style');
    s.id = 'nh-recent-series-style';
    s.textContent = `
      #nh-recent-series-row { margin: 0 0 2.2rem; box-sizing: border-box; width: 100%; }
      #nh-recent-series-row .nh-rs-heading { font-family: var(--nh-serif) !important; font-weight: 500; font-size: 1.55rem; letter-spacing: -0.01em; color: var(--nh-text-1, #f4eee2); margin: 0 0 1rem; }
      #nh-recent-series-row .nh-rs-scroll { display: flex; flex-wrap: nowrap; gap: calc(var(--nh-rs-cw, 140px) * 0.076); overflow-x: auto; overflow-y: hidden; padding: 6px 2px 14px; scrollbar-width: none; -ms-overflow-style: none; }
      #nh-recent-series-row .nh-rs-scroll::-webkit-scrollbar { display: none; height: 0; width: 0; }
      #nh-recent-series-row .nh-rs-card { flex: 0 0 auto; width: calc(var(--nh-rs-cw, 140px) * 1.171); text-decoration: none; }
      #nh-recent-series-row .nh-rs-covers { position: relative; width: var(--nh-rs-cw, 140px); height: var(--nh-rs-cw, 140px); margin-bottom: 36px; overflow: visible; }
      #nh-recent-series-row .nh-rs-cover { position: absolute; top: 0; left: 0; width: var(--nh-rs-cw, 140px); height: var(--nh-rs-cw, 140px); border-radius: 12px; background-size: cover; background-position: center; background-color: var(--nh-raised); box-shadow: 0 10px 24px rgba(0,0,0,0.42); transition: filter .2s ease, box-shadow .2s ease; }
      #nh-recent-series-row .nh-rs-cover.c1 { transform: translate(0,0); z-index: 3; }
      #nh-recent-series-row .nh-rs-cover.c2 { transform: translate(calc(var(--nh-rs-cw, 140px) * 0.086), calc(var(--nh-rs-cw, 140px) * 0.086)); z-index: 2; filter: brightness(0.78); }
      #nh-recent-series-row .nh-rs-cover.c3 { transform: translate(calc(var(--nh-rs-cw, 140px) * 0.171), calc(var(--nh-rs-cw, 140px) * 0.171)); z-index: 1; filter: brightness(0.60); }
      #nh-recent-series-row .nh-rs-card:hover .nh-rs-cover.c1 { filter: brightness(0.7); box-shadow: 0 10px 24px rgba(0,0,0,0.42); }
      #nh-recent-series-row .nh-rs-count { position: absolute; left: 8px; top: 8px; z-index: 5; background: rgba(255,255,255,0.55); backdrop-filter: blur(10px) brightness(1.2) saturate(1.05); -webkit-backdrop-filter: blur(10px) brightness(1.2) saturate(1.05); border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 2px 8px rgba(0,0,0,0.4); border-radius: 8px; padding: calc(var(--nh-rs-cw, 140px) * 0.015) calc(var(--nh-rs-cw, 140px) * 0.064); color: #000; font-weight: 700; font-size: clamp(9px, calc(var(--nh-rs-cw, 140px) * 0.093), 15px); font-family: var(--nh-sans, system-ui); }
      #nh-recent-series-row .nh-rs-name { font-family: var(--nh-serif) !important; font-weight: 500; color: var(--nh-text-2, #d8cfc2); font-size: var(--nh-rs-fs, 1rem); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    `;
    document.head.appendChild(s);
  }

  function nhRouterPush(route) {
    try { if (window.$nuxt && window.$nuxt.$router) { window.$nuxt.$router.push(route); return true; } } catch (e) {}
    try {
      const app = document.getElementById('__layout') || document.getElementById('__nuxt');
      const vue = app && (app.__vue__ || (app.firstElementChild && app.firstElementChild.__vue__));
      if (vue && vue.$router) { vue.$router.push(route); return true; }
    } catch (e) {}
    return false;
  }

  function applyRecentSeriesSize() {
    const row = document.getElementById('nh-recent-series-row');
    if (!row) return;
    let w = 0;
    // Use the same rendered size as a real (visible) book cover. Skip hidden
    // Continue-Listening covers (the hero replaces them, so they measure 0).
    const els = document.querySelectorAll('#bookshelf [id^="cover-area-"]');
    for (const el of els) {
      if (el.closest('#nh-hero-container') || el.closest('#nh-recent-series-row')) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 40) { w = r.width; break; }
    }
    if (!w) { try { w = (window.$nuxt && window.$nuxt.$store && window.$nuxt.$store.state.globals && window.$nuxt.$store.state.globals.bookshelfBookWidth) || 0; } catch (e) {} }
    if (w > 40) row.style.setProperty('--nh-rs-cw', Math.round(w) + 'px'); // square: width === height in CSS

    // Match the series title font to the book card titles (they scale with the size button too).
    const titles = document.querySelectorAll('#bookshelf [cy-id="title"]');
    for (const t of titles) {
      if (t.closest('#nh-hero-container') || t.closest('#nh-recent-series-row')) continue;
      if (t.getBoundingClientRect().width > 10) { row.style.setProperty('--nh-rs-fs', getComputedStyle(t).fontSize); break; }
    }
  }

  async function manageRecentSeries() {
    try {
      const homeOk = /\/library\/[^/]+\/?$/.test(window.location.pathname);
      if (!homeOk || !nhSettings.showCustomRecentSeries || nhSettings.hideHomeRecentSeries) {
        const ex = document.getElementById('nh-recent-series-row');
        if (ex) ex.remove();
        return;
      }
      const libId = getLibIdNH();
      if (!libId) return;
      const count = Math.max(1, parseInt(nhSettings.recentSeriesCount, 10) || 12);
      const key = libId + ':' + count;

      if (nhRecentSeries.key !== key && !nhRecentSeries.loading) {
        nhRecentSeries.loading = true;
        const data = await fetchRecentSeries(libId, count);
        nhRecentSeries = { key, loading: false, data };
        const stale = document.getElementById('nh-recent-series-row');
        if (stale) stale.remove();
      }
      if (nhRecentSeries.loading || !nhRecentSeries.data || !nhRecentSeries.data.length) return;

      if (document.getElementById('nh-recent-series-row')) {
        // Row already built. Re-park it before the (hidden) native Recent Series
        // row every cycle so it never strands at the bottom when the native row
        // mounts late, and re-copy padding to track ABS's cover-size slider zoom.
        const existing = document.getElementById('nh-recent-series-row');
        const nativeRow = findNativeRecentSeriesRow();
        if (nativeRow && nativeRow.parentNode && existing.nextElementSibling !== nativeRow) {
          nativeRow.parentNode.insertBefore(existing, nativeRow);
        }
        try {
          const sib = nativeRow || document.querySelector('.bookshelf-row:not(#nh-recent-series-row)');
          if (sib) { const cs = getComputedStyle(sib); existing.style.paddingLeft = cs.paddingLeft; existing.style.paddingRight = cs.paddingRight; }
        } catch (e) {}
        return;
      }

      injectRecentSeriesStyles();
      const base = getBaseNH();
      const nativeRow = findNativeRecentSeriesRow();
      const row = document.createElement('div');
      row.id = 'nh-recent-series-row';
      row.dataset.key = key;
      row.innerHTML = renderRecentSeriesInner(nhRecentSeries.data, libId, base);

      if (nativeRow && nativeRow.parentNode) nativeRow.parentNode.insertBefore(row, nativeRow);
      else { const bs = document.getElementById('bookshelf'); if (bs) bs.appendChild(row); else return; }

      try {
        const sib = nativeRow || document.querySelector('.bookshelf-row:not(#nh-recent-series-row)');
        if (sib) { const cs = getComputedStyle(sib); row.style.paddingLeft = cs.paddingLeft; row.style.paddingRight = cs.paddingRight; }
      } catch (e) {}

      row.querySelectorAll('.nh-rs-card').forEach(a => {
        a.addEventListener('click', (e) => {
          const rt = a.getAttribute('data-route');
          if (rt && nhRouterPush(rt)) e.preventDefault();
        });
      });
    } catch (e) {}
  }

  // Series deck scaling. Baseline constants (196/168/12/24) were designed at slider=100
  // (getSizeMultiplier = 100/120), so scale = m * 1.2 keeps slider 100 pixel-identical
  // to the baseline. Pure store read — no DOM measurement, no calibration. If the getter
  // is missing the vars stay unset and CSS fallbacks freeze the baseline look.
  // A store.watch updates the vars synchronously on slider commits: ABS re-measures its
  // dummy card right after the commit, and if the vars lag one mutation tick the shelf
  // computes slots from the previous size (rows overlap / titles clipped).
  let nhSeriesWatched = false;
  function nhSeriesScale() {
    const store = window.$nuxt && window.$nuxt.$store;
    if (!store) return;
    let m;
    try { m = store.getters['user/getSizeMultiplier']; } catch (e) { return; }
    if (typeof m !== 'number' || !(m > 0.05) || !(m < 10)) return;
    const s = m * 1.2;
    const root = document.documentElement.style;
    root.setProperty('--nh-series-w', Math.round(196 * s) + 'px');
    root.setProperty('--nh-series-cover', Math.round(168 * s) + 'px');
    root.setProperty('--nh-series-off1', Math.round(12 * s) + 'px');
    root.setProperty('--nh-series-off2', Math.round(24 * s) + 'px');
    if (!nhSeriesWatched && typeof store.watch === 'function') {
      nhSeriesWatched = true;
      try { store.watch((state, getters) => getters['user/getSizeMultiplier'], () => nhSeriesScale()); } catch (e) {}
      // ABS measures its dummy card once in mounted(), before these vars existed on a
      // cold load, and window resize only recomputes columns from that stale measurement
      // (windowResize -> executeRebuild -> initSizeData; no re-measure). Call the
      // component's own setCardSize + executeRebuild once, as soon as it exists.
      let tries = 0;
      const nudge = setInterval(() => {
        tries++;
        const el = document.getElementById('bookshelf');
        const vm = el && el.__vue__;
        if (vm && typeof vm.setCardSize === 'function') {
          clearInterval(nudge);
          Promise.resolve(vm.setCardSize()).then(() => { if (typeof vm.executeRebuild === 'function') vm.executeRebuild(); }).catch(() => {});
        } else if (tries > 20) clearInterval(nudge);
      }, 300);
    }
  }

  function runMutations() {
    const safe = (fn) => { try { fn(); } catch (e) { /* one failure must not block the rest */ } };
    safe(nhSeriesScale);
    safe(applySettings);
    safe(injectSettingsPanel);
    safe(sweepFooters);
    safe(swapStatsLinks);
    safe(remapRailIcons);
    safe(localizeRail);
    safe(injectMobileMenuButton);
    safe(hideMobileUploadButton);
    safe(injectGearButton);
    safe(injectHeroBanner);
    manageRecentSeries();
    applyRecentSeriesSize();
    safe(manageCinematic);
    safe(injectGoodreads);
  }

  setInterval(runMutations, 500);
})();