/* NanoHive ABS — JS Enhancements  v6.64.4  (injected build) */

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
    recentSeriesCount: 12,
    customSeriesCards: true,
    showHeroCarousel: true,
    continueReadingMode: 'combine'
  };

  const serverSettings = (window.NH_CONFIG && typeof window.NH_CONFIG === 'object') ? window.NH_CONFIG : {};
  // UI-saved server defaults (see the Server Defaults card): sit between env vars
  // and the user's own saved settings.
  const uiServerSettings = (window.NH_SERVER_CONFIG && typeof window.NH_SERVER_CONFIG === 'object') ? window.NH_SERVER_CONFIG : {};

  let nhLastCrMode;
  let nhSettings = { ...defaultSettings, ...serverSettings, ...uiServerSettings };
  try {
    const saved = localStorage.getItem('nh-settings');
    if (saved) nhSettings = { ...defaultSettings, ...serverSettings, ...uiServerSettings, ...JSON.parse(saved) };
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

      if (nhLastCrMode === undefined) nhLastCrMode = nhSettings.continueReadingMode;
      if (nhLastCrMode !== nhSettings.continueReadingMode) {
        nhLastCrMode = nhSettings.continueReadingMode;
        const hc = document.getElementById('nh-hero-container');
        if (hc) hc.remove();
        document.querySelectorAll('[data-hero-injected="true"]').forEach(function (r) {
          r.style.display = '';
          Array.from(r.children).forEach(function (c) { if (c.id !== 'nh-hero-container') c.style.display = ''; });
          delete r.dataset.heroInjected;
        });
      }

      const nhStock = nhSettings.customSeriesCards === false;
      if (document.documentElement.classList.contains('nh-stock-series') !== nhStock) {
        document.documentElement.classList.toggle('nh-stock-series', nhStock);
        // ABS measured its dummy card under the other mode's CSS; re-measure now.
        const bs = document.getElementById('bookshelf');
        const bvm = bs && bs.__vue__;
        if (bvm && typeof bvm.setCardSize === 'function') {
          Promise.resolve(bvm.setCardSize()).then(function () { if (typeof bvm.executeRebuild === 'function') bvm.executeRebuild(); }).catch(function () {});
        }
      }

      if (!nhSettings.showLogoText) css += `#appbar h1 { display: none !important; } #page-wrapper img[alt="Audiobookshelf Logo"] + h1 { display: none !important; } `;
      if (nhSettings.hideRailSeries) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/series"] { display: none !important; } `;
      if (nhSettings.hideRailCollections) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/collections"] { display: none !important; } `;
      if (nhSettings.hideRailAuthors) css += `[aria-label="Library Sidebar"] a[href$="/bookshelf/authors"] { display: none !important; } `;
      if (nhSettings.hideRailNarrators) css += `[aria-label="Library Sidebar"] a[href$="/narrators"] { display: none !important; } `;
      if (nhSettings.hideRailStats) css += `[aria-label="Library Sidebar"] a[href$="/stats"] { display: none !important; } `;

      // CSS-only Logo Colorization via Safe DOM Insertion
      // Appbar logo + the login page header (no #appbar there; anchored on its alt text)
      const logoImgs = document.querySelectorAll('#appbar a[href$="/"] img, #page-wrapper img[alt="Audiobookshelf Logo"]');
      logoImgs.forEach(function (img) {
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
      });

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

      document.querySelectorAll('#appbar a[href$="/"] h1, #page-wrapper img[alt="Audiobookshelf Logo"] + h1').forEach(function (brand) {
        brand.textContent = nhSettings.appName || 'audiobookshelf';
      });

      const shelves = nhShelfRows();
      shelves.forEach(row => {
        const h2 = row.querySelector('h2');
        if (!h2) return;
        const title = h2.textContent.trim().toLowerCase();

        let hide = false;
        if (nhSettings.hideHomeRecentlyAdded && (title.includes('recently added') || title.includes('ostatnio dodane') || title.includes('niedawno dodane'))) hide = true;
        if ((nhSettings.hideHomeRecentSeries || (nhSettings.showCustomRecentSeries && nhSettings.customSeriesCards !== false)) && (title.includes('recent series') || title.includes('ostatnie serie') || title.includes('najnowsze serie'))) hide = true;
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
    en: {"title": "Theme Customizations", "subtitle": "Personalise the look of your library. Changes save automatically.", "branding": "Branding & Style", "colour": "Colour & Theme", "homeCar": "Home & Carousel", "sidebar": "Sidebar Menus", "appName": "App Name", "appNameHint": "Leave empty for the default name.", "logoUrl": "Custom Logo URL", "logoHint": "Leave empty for the default logo.", "accent": "Accent Colour", "baseTheme": "Base Theme", "mainFont": "Main Font", "carousel": "Carousel Auto-Advance", "carouselHint": "Seconds between slides. Set to 0 to disable.", "customSeries": "Expanded Recent Series", "seriesCount": "Recent Series Count", "seriesCountHint": "How many series to show in the expanded shelf.", "hideShelves": "Hide Homepage Shelves", "sidebarHint": "Hide left-rail entries you don't use.", "showAppName": "Show App Name Text", "colorizeLogo": "Colorize Logo with Accent Colour", "hideSeries": "Hide Series", "hideCollections": "Hide Collections", "hideAuthors": "Hide Authors", "hideNarrators": "Hide Narrators", "hideStats": "Hide Stats", "hideRecentlyAdded": "Hide Recently Added", "hideRecentSeries": "Hide Recent Series", "hideContinueSeries": "Hide Continue Series", "hideListenAgain": "Hide Listen Again", "hideDiscover": "Hide Discover", "hideNewestAuthors": "Hide Newest Authors", "seriesCards": "Stacked Series Covers", "heroCarousel": "Home Carousel", "gearLabel": "Theme", "srvTitle": "Server Defaults", "srvHint": "Save your current settings as the defaults for every user of this server. Users can still personalise their own look on top. Mount a volume at /data/nh in the theme container to keep these across updates.", "srvSave": "Save as server defaults", "srvClear": "Clear server defaults", "srvSaved": "Saved", "srvCleared": "Cleared", "srvErr": "Failed — admin login required", "crMode": "Continue Reading Shelf", "crCombine": "Combine into carousel", "crSeparate": "Keep as separate shelf", "crHide": "Hidden", "logoUpload": "Upload from device…", "logoUploaded": "Uploaded ✓", "logoBadType": "Unsupported image type", "logoTooBig": "Image too large (max 4 MB)", "logoOr": "or"},
    pl: {"title": "Personalizacja motywu", "subtitle": "Dostosuj wygląd swojej biblioteki. Zmiany zapisują się automatycznie.", "branding": "Marka i styl", "colour": "Kolor i motyw", "homeCar": "Strona główna i karuzela", "sidebar": "Menu boczne", "appName": "Nazwa aplikacji", "appNameHint": "Pozostaw puste, aby użyć domyślnej nazwy.", "logoUrl": "Adres URL własnego logo", "logoHint": "Pozostaw puste, aby użyć domyślnego logo.", "accent": "Kolor akcentu", "baseTheme": "Motyw bazowy", "mainFont": "Czcionka główna", "carousel": "Automatyczne przewijanie karuzeli", "carouselHint": "Sekundy między slajdami. Ustaw 0, aby wyłączyć.", "customSeries": "Rozszerzone ostatnie serie", "seriesCount": "Liczba ostatnich serii", "seriesCountHint": "Ile serii pokazać na rozszerzonej półce.", "hideShelves": "Ukryj półki strony głównej", "sidebarHint": "Ukryj nieużywane pozycje menu bocznego.", "showAppName": "Pokaż nazwę aplikacji", "colorizeLogo": "Pokoloruj logo kolorem akcentu", "hideSeries": "Ukryj Serie", "hideCollections": "Ukryj Kolekcje", "hideAuthors": "Ukryj Autorów", "hideNarrators": "Ukryj Lektorów", "hideStats": "Ukryj Statystyki", "hideRecentlyAdded": "Ukryj Ostatnio dodane", "hideRecentSeries": "Ukryj Ostatnie serie", "hideContinueSeries": "Ukryj Kontynuuj serię", "hideListenAgain": "Ukryj Słuchaj ponownie", "hideDiscover": "Ukryj Odkrywaj", "hideNewestAuthors": "Ukryj Najnowszych autorów", "seriesCards": "Nakładane okładki serii", "heroCarousel": "Karuzela na stronie głównej", "gearLabel": "Motyw", "srvTitle": "Domyślne ustawienia serwera", "srvHint": "Zapisz bieżące ustawienia jako domyślne dla wszystkich użytkowników tego serwera. Użytkownicy nadal mogą personalizować swój wygląd. Zamontuj wolumin w /data/nh w kontenerze motywu, aby zachować je między aktualizacjami.", "srvSave": "Zapisz jako domyślne serwera", "srvClear": "Wyczyść domyślne serwera", "srvSaved": "Zapisano", "srvCleared": "Wyczyszczono", "srvErr": "Błąd — wymagane konto administratora", "crMode": "Półka Kontynuuj czytanie", "crCombine": "Połącz z karuzelą", "crSeparate": "Osobna półka", "crHide": "Ukryta", "logoUpload": "Wgraj z urządzenia…", "logoUploaded": "Wgrano ✓", "logoBadType": "Nieobsługiwany typ obrazu", "logoTooBig": "Obraz za duży (maks. 4 MB)", "logoOr": "lub"},
    de: {"title": "Design-Anpassungen", "subtitle": "Personalisiere das Aussehen deiner Bibliothek. Änderungen werden automatisch gespeichert.", "branding": "Branding & Stil", "colour": "Farbe & Design", "homeCar": "Startseite & Karussell", "sidebar": "Seitenmenüs", "appName": "App-Name", "appNameHint": "Leer lassen für den Standardnamen.", "logoUrl": "Eigene Logo-URL", "logoHint": "Leer lassen für das Standardlogo.", "accent": "Akzentfarbe", "baseTheme": "Basis-Design", "mainFont": "Hauptschriftart", "carousel": "Karussell-Autowechsel", "carouselHint": "Sekunden zwischen Folien. 0 zum Deaktivieren.", "customSeries": "Erweiterte neueste Serien", "seriesCount": "Anzahl neuester Serien", "seriesCountHint": "Wie viele Serien im erweiterten Regal gezeigt werden.", "hideShelves": "Startseiten-Regale ausblenden", "sidebarHint": "Nicht genutzte Menüeinträge ausblenden.", "showAppName": "App-Namen anzeigen", "colorizeLogo": "Logo mit Akzentfarbe einfärben", "hideSeries": "Serien ausblenden", "hideCollections": "Sammlungen ausblenden", "hideAuthors": "Autoren ausblenden", "hideNarrators": "Sprecher ausblenden", "hideStats": "Statistiken ausblenden", "hideRecentlyAdded": "Kürzlich hinzugefügt ausblenden", "hideRecentSeries": "Neueste Serien ausblenden", "hideContinueSeries": "Serie fortsetzen ausblenden", "hideListenAgain": "Erneut anhören ausblenden", "hideDiscover": "Entdecken ausblenden", "hideNewestAuthors": "Neueste Autoren ausblenden", "seriesCards": "Gestapelte Serien-Cover", "heroCarousel": "Startseiten-Karussell", "gearLabel": "Design", "srvTitle": "Server-Standardwerte", "srvHint": "Speichere deine aktuellen Einstellungen als Standard für alle Nutzer dieses Servers. Nutzer können ihren Look weiterhin selbst anpassen. Binde ein Volume unter /data/nh im Theme-Container ein, um sie über Updates hinweg zu behalten.", "srvSave": "Als Server-Standard speichern", "srvClear": "Server-Standard löschen", "srvSaved": "Gespeichert", "srvCleared": "Gelöscht", "srvErr": "Fehlgeschlagen — Admin-Anmeldung erforderlich", "crMode": "Weiterlesen-Regal", "crCombine": "In Karussell integrieren", "crSeparate": "Als eigenes Regal", "crHide": "Ausgeblendet"},
    fr: {"title": "Personnalisation du thème", "subtitle": "Personnalisez l’apparence de votre bibliothèque. Les modifications sont enregistrées automatiquement.", "branding": "Image de marque et style", "colour": "Couleur et thème", "homeCar": "Accueil et carrousel", "sidebar": "Menus latéraux", "appName": "Nom de l’application", "appNameHint": "Laissez vide pour le nom par défaut.", "logoUrl": "URL du logo personnalisé", "logoHint": "Laissez vide pour le logo par défaut.", "accent": "Couleur d’accent", "baseTheme": "Thème de base", "mainFont": "Police principale", "carousel": "Défilement automatique du carrousel", "carouselHint": "Secondes entre les diapositives. 0 pour désactiver.", "customSeries": "Séries récentes étendues", "seriesCount": "Nombre de séries récentes", "seriesCountHint": "Nombre de séries à afficher dans l’étagère étendue.", "hideShelves": "Masquer les étagères d’accueil", "sidebarHint": "Masquer les entrées du menu latéral inutilisées.", "showAppName": "Afficher le nom de l’application", "colorizeLogo": "Coloriser le logo avec la couleur d’accent", "hideSeries": "Masquer les séries", "hideCollections": "Masquer les collections", "hideAuthors": "Masquer les auteurs", "hideNarrators": "Masquer les narrateurs", "hideStats": "Masquer les statistiques", "hideRecentlyAdded": "Masquer Ajouts récents", "hideRecentSeries": "Masquer Séries récentes", "hideContinueSeries": "Masquer Continuer la série", "hideListenAgain": "Masquer Réécouter", "hideDiscover": "Masquer Découvrir", "hideNewestAuthors": "Masquer Nouveaux auteurs", "seriesCards": "Couvertures de séries empilées", "heroCarousel": "Carrousel d’accueil", "gearLabel": "Thème"},
    es: {"title": "Personalización del tema", "subtitle": "Personaliza el aspecto de tu biblioteca. Los cambios se guardan automáticamente.", "branding": "Marca y estilo", "colour": "Color y tema", "homeCar": "Inicio y carrusel", "sidebar": "Menús laterales", "appName": "Nombre de la aplicación", "appNameHint": "Déjalo vacío para el nombre predeterminado.", "logoUrl": "URL de logotipo personalizado", "logoHint": "Déjalo vacío para el logotipo predeterminado.", "accent": "Color de acento", "baseTheme": "Tema base", "mainFont": "Fuente principal", "carousel": "Avance automático del carrusel", "carouselHint": "Segundos entre diapositivas. 0 para desactivar.", "customSeries": "Series recientes ampliadas", "seriesCount": "Número de series recientes", "seriesCountHint": "Cuántas series mostrar en el estante ampliado.", "hideShelves": "Ocultar estantes de inicio", "sidebarHint": "Oculta entradas del menú lateral que no uses.", "showAppName": "Mostrar nombre de la aplicación", "colorizeLogo": "Colorear logotipo con el color de acento", "hideSeries": "Ocultar Series", "hideCollections": "Ocultar Colecciones", "hideAuthors": "Ocultar Autores", "hideNarrators": "Ocultar Narradores", "hideStats": "Ocultar Estadísticas", "hideRecentlyAdded": "Ocultar Añadidos recientemente", "hideRecentSeries": "Ocultar Series recientes", "hideContinueSeries": "Ocultar Continuar serie", "hideListenAgain": "Ocultar Escuchar de nuevo", "hideDiscover": "Ocultar Descubrir", "hideNewestAuthors": "Ocultar Autores más recientes", "seriesCards": "Portadas de series apiladas", "heroCarousel": "Carrusel de inicio", "gearLabel": "Tema"},
    it: {"title": "Personalizzazione del tema", "subtitle": "Personalizza l’aspetto della tua libreria. Le modifiche vengono salvate automaticamente.", "branding": "Brand e stile", "colour": "Colore e tema", "homeCar": "Home e carosello", "sidebar": "Menu laterali", "appName": "Nome dell’app", "appNameHint": "Lascia vuoto per il nome predefinito.", "logoUrl": "URL logo personalizzato", "logoHint": "Lascia vuoto per il logo predefinito.", "accent": "Colore d’accento", "baseTheme": "Tema di base", "mainFont": "Font principale", "carousel": "Avanzamento automatico carosello", "carouselHint": "Secondi tra le diapositive. 0 per disattivare.", "customSeries": "Serie recenti estese", "seriesCount": "Numero di serie recenti", "seriesCountHint": "Quante serie mostrare nello scaffale esteso.", "hideShelves": "Nascondi scaffali della home", "sidebarHint": "Nascondi le voci del menu laterale che non usi.", "showAppName": "Mostra nome dell’app", "colorizeLogo": "Colora il logo con il colore d’accento", "hideSeries": "Nascondi Serie", "hideCollections": "Nascondi Raccolte", "hideAuthors": "Nascondi Autori", "hideNarrators": "Nascondi Narratori", "hideStats": "Nascondi Statistiche", "hideRecentlyAdded": "Nascondi Aggiunti di recente", "hideRecentSeries": "Nascondi Serie recenti", "hideContinueSeries": "Nascondi Continua serie", "hideListenAgain": "Nascondi Riascolta", "hideDiscover": "Nascondi Scopri", "hideNewestAuthors": "Nascondi Autori più recenti", "seriesCards": "Copertine serie impilate", "heroCarousel": "Carosello della home", "gearLabel": "Tema"},
    pt: {"title": "Personalização do tema", "subtitle": "Personalize a aparência da sua biblioteca. As alterações são salvas automaticamente.", "branding": "Marca e estilo", "colour": "Cor e tema", "homeCar": "Início e carrossel", "sidebar": "Menus laterais", "appName": "Nome do aplicativo", "appNameHint": "Deixe vazio para o nome padrão.", "logoUrl": "URL de logotipo personalizado", "logoHint": "Deixe vazio para o logotipo padrão.", "accent": "Cor de destaque", "baseTheme": "Tema base", "mainFont": "Fonte principal", "carousel": "Avanço automático do carrossel", "carouselHint": "Segundos entre slides. 0 para desativar.", "customSeries": "Séries recentes expandidas", "seriesCount": "Número de séries recentes", "seriesCountHint": "Quantas séries mostrar na estante expandida.", "hideShelves": "Ocultar estantes da página inicial", "sidebarHint": "Oculte itens do menu lateral que você não usa.", "showAppName": "Mostrar nome do aplicativo", "colorizeLogo": "Colorir logotipo com a cor de destaque", "hideSeries": "Ocultar Séries", "hideCollections": "Ocultar Coleções", "hideAuthors": "Ocultar Autores", "hideNarrators": "Ocultar Narradores", "hideStats": "Ocultar Estatísticas", "hideRecentlyAdded": "Ocultar Adicionados recentemente", "hideRecentSeries": "Ocultar Séries recentes", "hideContinueSeries": "Ocultar Continuar série", "hideListenAgain": "Ocultar Ouvir novamente", "hideDiscover": "Ocultar Descobrir", "hideNewestAuthors": "Ocultar Autores mais recentes", "seriesCards": "Capas de séries empilhadas", "heroCarousel": "Carrossel da página inicial", "gearLabel": "Tema"},
    nl: {"title": "Thema-aanpassingen", "subtitle": "Personaliseer het uiterlijk van je bibliotheek. Wijzigingen worden automatisch opgeslagen.", "branding": "Branding & stijl", "colour": "Kleur & thema", "homeCar": "Home & carrousel", "sidebar": "Zijbalkmenu’s", "appName": "App-naam", "appNameHint": "Laat leeg voor de standaardnaam.", "logoUrl": "Aangepaste logo-URL", "logoHint": "Laat leeg voor het standaardlogo.", "accent": "Accentkleur", "baseTheme": "Basisthema", "mainFont": "Hoofdlettertype", "carousel": "Carrousel automatisch doorschuiven", "carouselHint": "Seconden tussen dia’s. 0 om uit te schakelen.", "customSeries": "Uitgebreide recente series", "seriesCount": "Aantal recente series", "seriesCountHint": "Hoeveel series in de uitgebreide plank tonen.", "hideShelves": "Homepagina-planken verbergen", "sidebarHint": "Verberg zijbalkitems die je niet gebruikt.", "showAppName": "App-naam tonen", "colorizeLogo": "Logo kleuren met accentkleur", "hideSeries": "Series verbergen", "hideCollections": "Collecties verbergen", "hideAuthors": "Auteurs verbergen", "hideNarrators": "Vertellers verbergen", "hideStats": "Statistieken verbergen", "hideRecentlyAdded": "Onlangs toegevoegd verbergen", "hideRecentSeries": "Recente series verbergen", "hideContinueSeries": "Serie voortzetten verbergen", "hideListenAgain": "Opnieuw luisteren verbergen", "hideDiscover": "Ontdekken verbergen", "hideNewestAuthors": "Nieuwste auteurs verbergen", "seriesCards": "Gestapelde seriecovers", "heroCarousel": "Home-carrousel", "gearLabel": "Thema"},
    cs: {"title": "Přizpůsobení motivu", "subtitle": "Přizpůsobte vzhled své knihovny. Změny se ukládají automaticky.", "branding": "Značka a styl", "colour": "Barva a motiv", "homeCar": "Domů a karusel", "sidebar": "Boční nabídky", "appName": "Název aplikace", "appNameHint": "Ponechte prázdné pro výchozí název.", "logoUrl": "URL vlastního loga", "logoHint": "Ponechte prázdné pro výchozí logo.", "accent": "Barva zvýraznění", "baseTheme": "Základní motiv", "mainFont": "Hlavní písmo", "carousel": "Automatické posouvání karuselu", "carouselHint": "Sekundy mezi snímky. 0 pro vypnutí.", "customSeries": "Rozšířené nedávné série", "seriesCount": "Počet nedávných sérií", "seriesCountHint": "Kolik sérií zobrazit v rozšířené poličce.", "hideShelves": "Skrýt poličky domovské stránky", "sidebarHint": "Skryjte položky bočního menu, které nepoužíváte.", "showAppName": "Zobrazit název aplikace", "colorizeLogo": "Obarvit logo barvou zvýraznění", "hideSeries": "Skrýt Série", "hideCollections": "Skrýt Kolekce", "hideAuthors": "Skrýt Autory", "hideNarrators": "Skrýt Vypravěče", "hideStats": "Skrýt Statistiky", "hideRecentlyAdded": "Skrýt Nedávno přidané", "hideRecentSeries": "Skrýt Nedávné série", "hideContinueSeries": "Skrýt Pokračovat v sérii", "hideListenAgain": "Skrýt Poslechnout znovu", "hideDiscover": "Skrýt Objevovat", "hideNewestAuthors": "Skrýt Nejnovější autory", "seriesCards": "Skládané obálky sérií", "heroCarousel": "Karusel na domovské stránce", "gearLabel": "Motiv"},
    sk: {"title": "Prispôsobenie motívu", "subtitle": "Prispôsobte vzhľad svojej knižnice. Zmeny sa ukladajú automaticky.", "branding": "Značka a štýl", "colour": "Farba a motív", "homeCar": "Domov a karusel", "sidebar": "Bočné ponuky", "appName": "Názov aplikácie", "appNameHint": "Ponechajte prázdne pre predvolený názov.", "logoUrl": "URL vlastného loga", "logoHint": "Ponechajte prázdne pre predvolené logo.", "accent": "Farba zvýraznenia", "baseTheme": "Základný motív", "mainFont": "Hlavné písmo", "carousel": "Automatické posúvanie karuselu", "carouselHint": "Sekundy medzi snímkami. 0 pre vypnutie.", "customSeries": "Rozšírené nedávne série", "seriesCount": "Počet nedávnych sérií", "seriesCountHint": "Koľko sérií zobraziť v rozšírenej poličke.", "hideShelves": "Skryť poličky domovskej stránky", "sidebarHint": "Skryte položky bočného menu, ktoré nepoužívate.", "showAppName": "Zobraziť názov aplikácie", "colorizeLogo": "Zafarbiť logo farbou zvýraznenia", "hideSeries": "Skryť Série", "hideCollections": "Skryť Kolekcie", "hideAuthors": "Skryť Autorov", "hideNarrators": "Skryť Rozprávačov", "hideStats": "Skryť Štatistiky", "hideRecentlyAdded": "Skryť Nedávno pridané", "hideRecentSeries": "Skryť Nedávne série", "hideContinueSeries": "Skryť Pokračovať v sérii", "hideListenAgain": "Skryť Počúvať znova", "hideDiscover": "Skryť Objavovať", "hideNewestAuthors": "Skryť Najnovších autorov", "seriesCards": "Skladané obálky sérií", "heroCarousel": "Karusel na domovskej stránke", "gearLabel": "Motív"},
    da: {"title": "Tematilpasninger", "subtitle": "Tilpas udseendet af dit bibliotek. Ændringer gemmes automatisk.", "branding": "Branding & stil", "colour": "Farve & tema", "homeCar": "Hjem & karrusel", "sidebar": "Sidemenuer", "appName": "Appnavn", "appNameHint": "Lad stå tomt for standardnavnet.", "logoUrl": "Brugerdefineret logo-URL", "logoHint": "Lad stå tomt for standardlogoet.", "accent": "Accentfarve", "baseTheme": "Basistema", "mainFont": "Hovedskrifttype", "carousel": "Automatisk karruselskift", "carouselHint": "Sekunder mellem slides. 0 for at deaktivere.", "customSeries": "Udvidede seneste serier", "seriesCount": "Antal seneste serier", "seriesCountHint": "Hvor mange serier der vises på den udvidede hylde.", "hideShelves": "Skjul hylder på forsiden", "sidebarHint": "Skjul menupunkter du ikke bruger.", "showAppName": "Vis appnavn", "colorizeLogo": "Farvelæg logo med accentfarve", "hideSeries": "Skjul Serier", "hideCollections": "Skjul Samlinger", "hideAuthors": "Skjul Forfattere", "hideNarrators": "Skjul Fortællere", "hideStats": "Skjul Statistik", "hideRecentlyAdded": "Skjul Senest tilføjet", "hideRecentSeries": "Skjul Seneste serier", "hideContinueSeries": "Skjul Fortsæt serie", "hideListenAgain": "Skjul Lyt igen", "hideDiscover": "Skjul Opdag", "hideNewestAuthors": "Skjul Nyeste forfattere", "seriesCards": "Stablede seriecovers", "heroCarousel": "Forside-karrusel", "gearLabel": "Tema"},
    sv: {"title": "Temaanpassningar", "subtitle": "Anpassa utseendet på ditt bibliotek. Ändringar sparas automatiskt.", "branding": "Varumärke & stil", "colour": "Färg & tema", "homeCar": "Hem & karusell", "sidebar": "Sidomenyer", "appName": "Appnamn", "appNameHint": "Lämna tomt för standardnamnet.", "logoUrl": "Anpassad logotyp-URL", "logoHint": "Lämna tomt för standardlogotypen.", "accent": "Accentfärg", "baseTheme": "Bastema", "mainFont": "Huvudtypsnitt", "carousel": "Automatisk karusellväxling", "carouselHint": "Sekunder mellan bilder. 0 för att inaktivera.", "customSeries": "Utökade senaste serier", "seriesCount": "Antal senaste serier", "seriesCountHint": "Hur många serier som visas på den utökade hyllan.", "hideShelves": "Dölj hyllor på startsidan", "sidebarHint": "Dölj sidomenyposter du inte använder.", "showAppName": "Visa appnamn", "colorizeLogo": "Färglägg logotypen med accentfärgen", "hideSeries": "Dölj Serier", "hideCollections": "Dölj Samlingar", "hideAuthors": "Dölj Författare", "hideNarrators": "Dölj Uppläsare", "hideStats": "Dölj Statistik", "hideRecentlyAdded": "Dölj Nyligen tillagda", "hideRecentSeries": "Dölj Senaste serier", "hideContinueSeries": "Dölj Fortsätt serie", "hideListenAgain": "Dölj Lyssna igen", "hideDiscover": "Dölj Upptäck", "hideNewestAuthors": "Dölj Nyaste författare", "seriesCards": "Staplade serieomslag", "heroCarousel": "Startsidans karusell", "gearLabel": "Tema"},
    no: {"title": "Tematilpasninger", "subtitle": "Tilpass utseendet på biblioteket ditt. Endringer lagres automatisk.", "branding": "Merkevare og stil", "colour": "Farge og tema", "homeCar": "Hjem og karusell", "sidebar": "Sidemenyer", "appName": "Appnavn", "appNameHint": "La stå tomt for standardnavnet.", "logoUrl": "Egendefinert logo-URL", "logoHint": "La stå tomt for standardlogoen.", "accent": "Aksentfarge", "baseTheme": "Basistema", "mainFont": "Hovedskrift", "carousel": "Automatisk karusellbytte", "carouselHint": "Sekunder mellom lysbilder. 0 for å deaktivere.", "customSeries": "Utvidede nylige serier", "seriesCount": "Antall nylige serier", "seriesCountHint": "Hvor mange serier som vises i den utvidede hyllen.", "hideShelves": "Skjul hyller på forsiden", "sidebarHint": "Skjul sidemenyoppføringer du ikke bruker.", "showAppName": "Vis appnavn", "colorizeLogo": "Fargelegg logoen med aksentfargen", "hideSeries": "Skjul Serier", "hideCollections": "Skjul Samlinger", "hideAuthors": "Skjul Forfattere", "hideNarrators": "Skjul Fortellere", "hideStats": "Skjul Statistikk", "hideRecentlyAdded": "Skjul Nylig lagt til", "hideRecentSeries": "Skjul Nylige serier", "hideContinueSeries": "Skjul Fortsett serie", "hideListenAgain": "Skjul Lytt igjen", "hideDiscover": "Skjul Oppdag", "hideNewestAuthors": "Skjul Nyeste forfattere", "seriesCards": "Stablede serieomslag", "heroCarousel": "Forsidekarusell", "gearLabel": "Tema"},
    fi: {"title": "Teeman mukautukset", "subtitle": "Mukauta kirjastosi ulkoasua. Muutokset tallentuvat automaattisesti.", "branding": "Brändi ja tyyli", "colour": "Väri ja teema", "homeCar": "Koti ja karuselli", "sidebar": "Sivuvalikot", "appName": "Sovelluksen nimi", "appNameHint": "Jätä tyhjäksi käyttääksesi oletusnimeä.", "logoUrl": "Mukautetun logon URL", "logoHint": "Jätä tyhjäksi käyttääksesi oletuslogoa.", "accent": "Korostusväri", "baseTheme": "Perusteema", "mainFont": "Pääfontti", "carousel": "Karusellin automaattinen vaihto", "carouselHint": "Sekunteja diojen välillä. 0 poistaa käytöstä.", "customSeries": "Laajennetut viimeisimmät sarjat", "seriesCount": "Viimeisimpien sarjojen määrä", "seriesCountHint": "Montako sarjaa näytetään laajennetulla hyllyllä.", "hideShelves": "Piilota etusivun hyllyt", "sidebarHint": "Piilota sivuvalikon kohteet, joita et käytä.", "showAppName": "Näytä sovelluksen nimi", "colorizeLogo": "Väritä logo korostusvärillä", "hideSeries": "Piilota Sarjat", "hideCollections": "Piilota Kokoelmat", "hideAuthors": "Piilota Kirjailijat", "hideNarrators": "Piilota Lukijat", "hideStats": "Piilota Tilastot", "hideRecentlyAdded": "Piilota Äskettäin lisätyt", "hideRecentSeries": "Piilota Viimeisimmät sarjat", "hideContinueSeries": "Piilota Jatka sarjaa", "hideListenAgain": "Piilota Kuuntele uudelleen", "hideDiscover": "Piilota Löydä", "hideNewestAuthors": "Piilota Uusimmat kirjailijat", "seriesCards": "Pinotut sarjakannet", "heroCarousel": "Etusivun karuselli", "gearLabel": "Teema"},
    ru: {"title": "Настройки темы", "subtitle": "Настройте внешний вид вашей библиотеки. Изменения сохраняются автоматически.", "branding": "Бренд и стиль", "colour": "Цвет и тема", "homeCar": "Главная и карусель", "sidebar": "Боковые меню", "appName": "Название приложения", "appNameHint": "Оставьте пустым для названия по умолчанию.", "logoUrl": "URL собственного логотипа", "logoHint": "Оставьте пустым для логотипа по умолчанию.", "accent": "Акцентный цвет", "baseTheme": "Базовая тема", "mainFont": "Основной шрифт", "carousel": "Автопрокрутка карусели", "carouselHint": "Секунд между слайдами. 0 — отключить.", "customSeries": "Расширенные недавние серии", "seriesCount": "Количество недавних серий", "seriesCountHint": "Сколько серий показывать на расширенной полке.", "hideShelves": "Скрыть полки главной страницы", "sidebarHint": "Скройте неиспользуемые пункты бокового меню.", "showAppName": "Показывать название приложения", "colorizeLogo": "Окрашивать логотип акцентным цветом", "hideSeries": "Скрыть Серии", "hideCollections": "Скрыть Коллекции", "hideAuthors": "Скрыть Авторов", "hideNarrators": "Скрыть Чтецов", "hideStats": "Скрыть Статистику", "hideRecentlyAdded": "Скрыть Недавно добавленные", "hideRecentSeries": "Скрыть Недавние серии", "hideContinueSeries": "Скрыть Продолжить серию", "hideListenAgain": "Скрыть Слушать снова", "hideDiscover": "Скрыть Обзор", "hideNewestAuthors": "Скрыть Новейших авторов", "seriesCards": "Стопки обложек серий", "heroCarousel": "Карусель на главной", "gearLabel": "Тема"},
    uk: {"title": "Налаштування теми", "subtitle": "Налаштуйте вигляд вашої бібліотеки. Зміни зберігаються автоматично.", "branding": "Бренд і стиль", "colour": "Колір і тема", "homeCar": "Головна та карусель", "sidebar": "Бічні меню", "appName": "Назва застосунку", "appNameHint": "Залиште порожнім для назви за замовчуванням.", "logoUrl": "URL власного логотипа", "logoHint": "Залиште порожнім для логотипа за замовчуванням.", "accent": "Акцентний колір", "baseTheme": "Базова тема", "mainFont": "Основний шрифт", "carousel": "Автопрокручування каруселі", "carouselHint": "Секунд між слайдами. 0 — вимкнути.", "customSeries": "Розширені нещодавні серії", "seriesCount": "Кількість нещодавніх серій", "seriesCountHint": "Скільки серій показувати на розширеній полиці.", "hideShelves": "Приховати полиці головної сторінки", "sidebarHint": "Приховайте невикористовувані пункти бічного меню.", "showAppName": "Показувати назву застосунку", "colorizeLogo": "Забарвити логотип акцентним кольором", "hideSeries": "Приховати Серії", "hideCollections": "Приховати Колекції", "hideAuthors": "Приховати Авторів", "hideNarrators": "Приховати Читців", "hideStats": "Приховати Статистику", "hideRecentlyAdded": "Приховати Нещодавно додані", "hideRecentSeries": "Приховати Нещодавні серії", "hideContinueSeries": "Приховати Продовжити серію", "hideListenAgain": "Приховати Слухати знову", "hideDiscover": "Приховати Огляд", "hideNewestAuthors": "Приховати Найновіших авторів", "seriesCards": "Стос обкладинок серій", "heroCarousel": "Карусель на головній", "gearLabel": "Тема"},
    be: {"title": "Налады тэмы", "subtitle": "Наладзьце выгляд вашай бібліятэкі. Змены захоўваюцца аўтаматычна.", "branding": "Брэнд і стыль", "colour": "Колер і тэма", "homeCar": "Галоўная і карусель", "sidebar": "Бакавыя меню", "appName": "Назва праграмы", "appNameHint": "Пакіньце пустым для назвы па змаўчанні.", "logoUrl": "URL уласнага лагатыпа", "logoHint": "Пакіньце пустым для лагатыпа па змаўчанні.", "accent": "Акцэнтны колер", "baseTheme": "Базавая тэма", "mainFont": "Асноўны шрыфт", "carousel": "Аўтапракрутка каруселі", "carouselHint": "Секунд паміж слайдамі. 0 — адключыць.", "customSeries": "Пашыраныя нядаўнія серыі", "seriesCount": "Колькасць нядаўніх серый", "seriesCountHint": "Колькі серый паказваць на пашыранай паліцы.", "hideShelves": "Схаваць паліцы галоўнай старонкі", "sidebarHint": "Схавайце пункты бакавога меню, якімі не карыстаецеся.", "showAppName": "Паказваць назву праграмы", "colorizeLogo": "Афарбаваць лагатып акцэнтным колерам", "hideSeries": "Схаваць Серыі", "hideCollections": "Схаваць Калекцыі", "hideAuthors": "Схаваць Аўтараў", "hideNarrators": "Схаваць Чытальнікаў", "hideStats": "Схаваць Статыстыку", "hideRecentlyAdded": "Схаваць Нядаўна дададзеныя", "hideRecentSeries": "Схаваць Нядаўнія серыі", "hideContinueSeries": "Схаваць Працягнуць серыю", "hideListenAgain": "Схаваць Слухаць зноў", "hideDiscover": "Схаваць Агляд", "hideNewestAuthors": "Схаваць Найноўшых аўтараў", "seriesCards": "Стос вокладак серый", "heroCarousel": "Карусель на галоўнай", "gearLabel": "Тэма"},
    bg: {"title": "Персонализация на темата", "subtitle": "Персонализирайте вида на библиотеката си. Промените се записват автоматично.", "branding": "Марка и стил", "colour": "Цвят и тема", "homeCar": "Начало и въртележка", "sidebar": "Странични менюта", "appName": "Име на приложението", "appNameHint": "Оставете празно за името по подразбиране.", "logoUrl": "URL на собствено лого", "logoHint": "Оставете празно за логото по подразбиране.", "accent": "Акцентен цвят", "baseTheme": "Основна тема", "mainFont": "Основен шрифт", "carousel": "Автоматично превъртане на въртележката", "carouselHint": "Секунди между слайдовете. 0 за изключване.", "customSeries": "Разширени скорошни поредици", "seriesCount": "Брой скорошни поредици", "seriesCountHint": "Колко поредици да се показват на разширения рафт.", "hideShelves": "Скриване на рафтовете на началната страница", "sidebarHint": "Скрийте неизползвани елементи от страничното меню.", "showAppName": "Показване на името на приложението", "colorizeLogo": "Оцветяване на логото с акцентния цвят", "hideSeries": "Скрий Поредици", "hideCollections": "Скрий Колекции", "hideAuthors": "Скрий Автори", "hideNarrators": "Скрий Разказвачи", "hideStats": "Скрий Статистика", "hideRecentlyAdded": "Скрий Наскоро добавени", "hideRecentSeries": "Скрий Скорошни поредици", "hideContinueSeries": "Скрий Продължи поредицата", "hideListenAgain": "Скрий Слушай отново", "hideDiscover": "Скрий Открий", "hideNewestAuthors": "Скрий Най-нови автори", "seriesCards": "Подредени корици на поредици", "heroCarousel": "Въртележка на началната страница", "gearLabel": "Тема"},
    hr: {"title": "Prilagodbe teme", "subtitle": "Prilagodite izgled svoje knjižnice. Promjene se spremaju automatski.", "branding": "Brend i stil", "colour": "Boja i tema", "homeCar": "Početna i vrtuljak", "sidebar": "Bočni izbornici", "appName": "Naziv aplikacije", "appNameHint": "Ostavite prazno za zadani naziv.", "logoUrl": "URL prilagođenog logotipa", "logoHint": "Ostavite prazno za zadani logotip.", "accent": "Boja isticanja", "baseTheme": "Osnovna tema", "mainFont": "Glavni font", "carousel": "Automatsko pomicanje vrtuljka", "carouselHint": "Sekunde između slajdova. 0 za isključivanje.", "customSeries": "Proširene nedavne serije", "seriesCount": "Broj nedavnih serija", "seriesCountHint": "Koliko serija prikazati na proširenoj polici.", "hideShelves": "Sakrij police početne stranice", "sidebarHint": "Sakrijte stavke bočnog izbornika koje ne koristite.", "showAppName": "Prikaži naziv aplikacije", "colorizeLogo": "Oboji logotip bojom isticanja", "hideSeries": "Sakrij Serije", "hideCollections": "Sakrij Zbirke", "hideAuthors": "Sakrij Autore", "hideNarrators": "Sakrij Pripovjedače", "hideStats": "Sakrij Statistiku", "hideRecentlyAdded": "Sakrij Nedavno dodano", "hideRecentSeries": "Sakrij Nedavne serije", "hideContinueSeries": "Sakrij Nastavi seriju", "hideListenAgain": "Sakrij Slušaj ponovno", "hideDiscover": "Sakrij Otkrij", "hideNewestAuthors": "Sakrij Najnovije autore", "seriesCards": "Naslagane naslovnice serija", "heroCarousel": "Vrtuljak početne stranice", "gearLabel": "Tema"},
    sl: {"title": "Prilagoditve teme", "subtitle": "Prilagodite videz svoje knjižnice. Spremembe se samodejno shranijo.", "branding": "Blagovna znamka in slog", "colour": "Barva in tema", "homeCar": "Domov in vrtiljak", "sidebar": "Stranski meniji", "appName": "Ime aplikacije", "appNameHint": "Pustite prazno za privzeto ime.", "logoUrl": "URL lastnega logotipa", "logoHint": "Pustite prazno za privzeti logotip.", "accent": "Poudarna barva", "baseTheme": "Osnovna tema", "mainFont": "Glavna pisava", "carousel": "Samodejno premikanje vrtiljaka", "carouselHint": "Sekunde med diapozitivi. 0 za izklop.", "customSeries": "Razširjene nedavne serije", "seriesCount": "Število nedavnih serij", "seriesCountHint": "Koliko serij prikazati na razširjeni polici.", "hideShelves": "Skrij police domače strani", "sidebarHint": "Skrijte elemente stranskega menija, ki jih ne uporabljate.", "showAppName": "Prikaži ime aplikacije", "colorizeLogo": "Pobarvaj logotip s poudarno barvo", "hideSeries": "Skrij Serije", "hideCollections": "Skrij Zbirke", "hideAuthors": "Skrij Avtorje", "hideNarrators": "Skrij Pripovedovalce", "hideStats": "Skrij Statistiko", "hideRecentlyAdded": "Skrij Nedavno dodano", "hideRecentSeries": "Skrij Nedavne serije", "hideContinueSeries": "Skrij Nadaljuj serijo", "hideListenAgain": "Skrij Poslušaj znova", "hideDiscover": "Skrij Odkrij", "hideNewestAuthors": "Skrij Najnovejše avtorje", "seriesCards": "Zložene naslovnice serij", "heroCarousel": "Vrtiljak domače strani", "gearLabel": "Tema"},
    hu: {"title": "Téma testreszabása", "subtitle": "Szabja testre könyvtára megjelenését. A módosítások automatikusan mentődnek.", "branding": "Arculat és stílus", "colour": "Szín és téma", "homeCar": "Kezdőlap és körhinta", "sidebar": "Oldalsó menük", "appName": "Alkalmazás neve", "appNameHint": "Hagyja üresen az alapértelmezett névhez.", "logoUrl": "Egyéni logó URL", "logoHint": "Hagyja üresen az alapértelmezett logóhoz.", "accent": "Kiemelőszín", "baseTheme": "Alaptéma", "mainFont": "Fő betűtípus", "carousel": "Körhinta automatikus léptetése", "carouselHint": "Másodpercek a diák között. 0 a kikapcsoláshoz.", "customSeries": "Bővített legutóbbi sorozatok", "seriesCount": "Legutóbbi sorozatok száma", "seriesCountHint": "Hány sorozat jelenjen meg a bővített polcon.", "hideShelves": "Kezdőlapi polcok elrejtése", "sidebarHint": "Rejtse el a nem használt oldalmenü-elemeket.", "showAppName": "Alkalmazásnév megjelenítése", "colorizeLogo": "Logó színezése a kiemelőszínnel", "hideSeries": "Sorozatok elrejtése", "hideCollections": "Gyűjtemények elrejtése", "hideAuthors": "Szerzők elrejtése", "hideNarrators": "Felolvasók elrejtése", "hideStats": "Statisztikák elrejtése", "hideRecentlyAdded": "Nemrég hozzáadottak elrejtése", "hideRecentSeries": "Legutóbbi sorozatok elrejtése", "hideContinueSeries": "Sorozat folytatása elrejtése", "hideListenAgain": "Újrahallgatás elrejtése", "hideDiscover": "Felfedezés elrejtése", "hideNewestAuthors": "Legújabb szerzők elrejtése", "seriesCards": "Halmozott sorozatborítók", "heroCarousel": "Kezdőlapi körhinta", "gearLabel": "Téma"},
    ro: {"title": "Personalizarea temei", "subtitle": "Personalizați aspectul bibliotecii dvs. Modificările se salvează automat.", "branding": "Brand și stil", "colour": "Culoare și temă", "homeCar": "Acasă și carusel", "sidebar": "Meniuri laterale", "appName": "Numele aplicației", "appNameHint": "Lăsați gol pentru numele implicit.", "logoUrl": "URL logo personalizat", "logoHint": "Lăsați gol pentru logo-ul implicit.", "accent": "Culoare de accent", "baseTheme": "Temă de bază", "mainFont": "Font principal", "carousel": "Avansare automată carusel", "carouselHint": "Secunde între diapozitive. 0 pentru dezactivare.", "customSeries": "Serii recente extinse", "seriesCount": "Numărul de serii recente", "seriesCountHint": "Câte serii să fie afișate pe raftul extins.", "hideShelves": "Ascunde rafturile paginii principale", "sidebarHint": "Ascundeți elementele din meniul lateral pe care nu le folosiți.", "showAppName": "Afișează numele aplicației", "colorizeLogo": "Colorează logo-ul cu culoarea de accent", "hideSeries": "Ascunde Serii", "hideCollections": "Ascunde Colecții", "hideAuthors": "Ascunde Autori", "hideNarrators": "Ascunde Naratori", "hideStats": "Ascunde Statistici", "hideRecentlyAdded": "Ascunde Adăugate recent", "hideRecentSeries": "Ascunde Serii recente", "hideContinueSeries": "Ascunde Continuă seria", "hideListenAgain": "Ascunde Ascultă din nou", "hideDiscover": "Ascunde Descoperă", "hideNewestAuthors": "Ascunde Cei mai noi autori", "seriesCards": "Coperți de serii suprapuse", "heroCarousel": "Carusel pagină principală", "gearLabel": "Temă"},
    lt: {"title": "Temos tinkinimas", "subtitle": "Tinkinkite savo bibliotekos išvaizdą. Pakeitimai išsaugomi automatiškai.", "branding": "Prekės ženklas ir stilius", "colour": "Spalva ir tema", "homeCar": "Pradžia ir karuselė", "sidebar": "Šoniniai meniu", "appName": "Programos pavadinimas", "appNameHint": "Palikite tuščią numatytajam pavadinimui.", "logoUrl": "Pasirinktinio logotipo URL", "logoHint": "Palikite tuščią numatytajam logotipui.", "accent": "Akcento spalva", "baseTheme": "Bazinė tema", "mainFont": "Pagrindinis šriftas", "carousel": "Automatinis karuselės sukimas", "carouselHint": "Sekundės tarp skaidrių. 0 — išjungti.", "customSeries": "Išplėstos naujausios serijos", "seriesCount": "Naujausių serijų skaičius", "seriesCountHint": "Kiek serijų rodyti išplėstoje lentynoje.", "hideShelves": "Slėpti pradžios puslapio lentynas", "sidebarHint": "Slėpkite nenaudojamus šoninio meniu punktus.", "showAppName": "Rodyti programos pavadinimą", "colorizeLogo": "Nuspalvinti logotipą akcento spalva", "hideSeries": "Slėpti Serijas", "hideCollections": "Slėpti Kolekcijas", "hideAuthors": "Slėpti Autorius", "hideNarrators": "Slėpti Skaitovus", "hideStats": "Slėpti Statistiką", "hideRecentlyAdded": "Slėpti Neseniai pridėta", "hideRecentSeries": "Slėpti Naujausias serijas", "hideContinueSeries": "Slėpti Tęsti seriją", "hideListenAgain": "Slėpti Klausyti dar kartą", "hideDiscover": "Slėpti Atrasti", "hideNewestAuthors": "Slėpti Naujausius autorius", "seriesCards": "Sudėtos serijų viršelės", "heroCarousel": "Pradžios puslapio karuselė", "gearLabel": "Tema"},
    lv: {"title": "Motīva pielāgošana", "subtitle": "Pielāgojiet savas bibliotēkas izskatu. Izmaiņas tiek saglabātas automātiski.", "branding": "Zīmols un stils", "colour": "Krāsa un motīvs", "homeCar": "Sākums un karuselis", "sidebar": "Sānu izvēlnes", "appName": "Lietotnes nosaukums", "appNameHint": "Atstājiet tukšu noklusējuma nosaukumam.", "logoUrl": "Pielāgota logotipa URL", "logoHint": "Atstājiet tukšu noklusējuma logotipam.", "accent": "Akcenta krāsa", "baseTheme": "Pamata motīvs", "mainFont": "Galvenais fonts", "carousel": "Karuseļa automātiskā pārslēgšana", "carouselHint": "Sekundes starp slaidiem. 0, lai atspējotu.", "customSeries": "Paplašinātas nesenās sērijas", "seriesCount": "Neseno sēriju skaits", "seriesCountHint": "Cik sērijas rādīt paplašinātajā plauktā.", "hideShelves": "Paslēpt sākumlapas plauktus", "sidebarHint": "Paslēpiet neizmantotos sānu izvēlnes vienumus.", "showAppName": "Rādīt lietotnes nosaukumu", "colorizeLogo": "Iekrāsot logotipu ar akcenta krāsu", "hideSeries": "Paslēpt Sērijas", "hideCollections": "Paslēpt Kolekcijas", "hideAuthors": "Paslēpt Autorus", "hideNarrators": "Paslēpt Lasītājus", "hideStats": "Paslēpt Statistiku", "hideRecentlyAdded": "Paslēpt Nesen pievienotos", "hideRecentSeries": "Paslēpt Nesenās sērijas", "hideContinueSeries": "Paslēpt Turpināt sēriju", "hideListenAgain": "Paslēpt Klausīties vēlreiz", "hideDiscover": "Paslēpt Atklāt", "hideNewestAuthors": "Paslēpt Jaunākos autorus", "seriesCards": "Sakrautas sēriju vāku bildes", "heroCarousel": "Sākumlapas karuselis", "gearLabel": "Motīvs"},
    et: {"title": "Teema kohandamine", "subtitle": "Kohandage oma raamatukogu välimust. Muudatused salvestatakse automaatselt.", "branding": "Bränd ja stiil", "colour": "Värv ja teema", "homeCar": "Avaleht ja karussell", "sidebar": "Külgmenüüd", "appName": "Rakenduse nimi", "appNameHint": "Jätke tühjaks vaikimisi nime jaoks.", "logoUrl": "Kohandatud logo URL", "logoHint": "Jätke tühjaks vaikimisi logo jaoks.", "accent": "Rõhuvärv", "baseTheme": "Põhiteema", "mainFont": "Peamine font", "carousel": "Karusselli automaatne liikumine", "carouselHint": "Sekundid slaidide vahel. 0 keelamiseks.", "customSeries": "Laiendatud hiljutised sarjad", "seriesCount": "Hiljutiste sarjade arv", "seriesCountHint": "Mitu sarja laiendatud riiulil kuvada.", "hideShelves": "Peida avalehe riiulid", "sidebarHint": "Peitke külgmenüü kirjed, mida te ei kasuta.", "showAppName": "Kuva rakenduse nimi", "colorizeLogo": "Värvi logo rõhuvärviga", "hideSeries": "Peida Sarjad", "hideCollections": "Peida Kogud", "hideAuthors": "Peida Autorid", "hideNarrators": "Peida Lugejad", "hideStats": "Peida Statistika", "hideRecentlyAdded": "Peida Hiljuti lisatud", "hideRecentSeries": "Peida Hiljutised sarjad", "hideContinueSeries": "Peida Jätka sarja", "hideListenAgain": "Peida Kuula uuesti", "hideDiscover": "Peida Avasta", "hideNewestAuthors": "Peida Uusimad autorid", "seriesCards": "Virnastatud sarjakaaned", "heroCarousel": "Avalehe karussell", "gearLabel": "Teema"},
    el: {"title": "Προσαρμογές θέματος", "subtitle": "Προσαρμόστε την εμφάνιση της βιβλιοθήκης σας. Οι αλλαγές αποθηκεύονται αυτόματα.", "branding": "Επωνυμία και στυλ", "colour": "Χρώμα και θέμα", "homeCar": "Αρχική και καρουζέλ", "sidebar": "Πλευρικά μενού", "appName": "Όνομα εφαρμογής", "appNameHint": "Αφήστε κενό για το προεπιλεγμένο όνομα.", "logoUrl": "URL προσαρμοσμένου λογότυπου", "logoHint": "Αφήστε κενό για το προεπιλεγμένο λογότυπο.", "accent": "Χρώμα έμφασης", "baseTheme": "Βασικό θέμα", "mainFont": "Κύρια γραμματοσειρά", "carousel": "Αυτόματη προώθηση καρουζέλ", "carouselHint": "Δευτερόλεπτα μεταξύ διαφανειών. 0 για απενεργοποίηση.", "customSeries": "Εκτεταμένες πρόσφατες σειρές", "seriesCount": "Αριθμός πρόσφατων σειρών", "seriesCountHint": "Πόσες σειρές θα εμφανίζονται στο εκτεταμένο ράφι.", "hideShelves": "Απόκρυψη ραφιών αρχικής σελίδας", "sidebarHint": "Αποκρύψτε στοιχεία πλευρικού μενού που δεν χρησιμοποιείτε.", "showAppName": "Εμφάνιση ονόματος εφαρμογής", "colorizeLogo": "Χρωματισμός λογότυπου με το χρώμα έμφασης", "hideSeries": "Απόκρυψη Σειρών", "hideCollections": "Απόκρυψη Συλλογών", "hideAuthors": "Απόκρυψη Συγγραφέων", "hideNarrators": "Απόκρυψη Αφηγητών", "hideStats": "Απόκρυψη Στατιστικών", "hideRecentlyAdded": "Απόκρυψη Πρόσφατα προστεθέντων", "hideRecentSeries": "Απόκρυψη Πρόσφατων σειρών", "hideContinueSeries": "Απόκρυψη Συνέχισης σειράς", "hideListenAgain": "Απόκρυψη Ακούστε ξανά", "hideDiscover": "Απόκρυψη Ανακαλύψτε", "hideNewestAuthors": "Απόκρυψη Νεότερων συγγραφέων", "seriesCards": "Στοιβαγμένα εξώφυλλα σειρών", "heroCarousel": "Καρουζέλ αρχικής σελίδας", "gearLabel": "Θέμα"},
    tr: {"title": "Tema Özelleştirmeleri", "subtitle": "Kitaplığınızın görünümünü kişiselleştirin. Değişiklikler otomatik kaydedilir.", "branding": "Marka ve Stil", "colour": "Renk ve Tema", "homeCar": "Ana Sayfa ve Slayt", "sidebar": "Yan Menüler", "appName": "Uygulama Adı", "appNameHint": "Varsayılan ad için boş bırakın.", "logoUrl": "Özel Logo URL’si", "logoHint": "Varsayılan logo için boş bırakın.", "accent": "Vurgu Rengi", "baseTheme": "Temel Tema", "mainFont": "Ana Yazı Tipi", "carousel": "Slayt Otomatik İlerleme", "carouselHint": "Slaytlar arası saniye. Devre dışı bırakmak için 0.", "customSeries": "Genişletilmiş Son Seriler", "seriesCount": "Son Seri Sayısı", "seriesCountHint": "Genişletilmiş rafta kaç seri gösterileceği.", "hideShelves": "Ana Sayfa Raflarını Gizle", "sidebarHint": "Kullanmadığınız yan menü öğelerini gizleyin.", "showAppName": "Uygulama Adını Göster", "colorizeLogo": "Logoyu Vurgu Rengiyle Renklendir", "hideSeries": "Serileri Gizle", "hideCollections": "Koleksiyonları Gizle", "hideAuthors": "Yazarları Gizle", "hideNarrators": "Seslendirenleri Gizle", "hideStats": "İstatistikleri Gizle", "hideRecentlyAdded": "Son Eklenenleri Gizle", "hideRecentSeries": "Son Serileri Gizle", "hideContinueSeries": "Seriye Devam Et’i Gizle", "hideListenAgain": "Tekrar Dinle’yi Gizle", "hideDiscover": "Keşfet’i Gizle", "hideNewestAuthors": "En Yeni Yazarları Gizle", "seriesCards": "Yığılmış Seri Kapakları", "heroCarousel": "Ana Sayfa Slaytı", "gearLabel": "Tema"},
    ca: {"title": "Personalització del tema", "subtitle": "Personalitzeu l’aspecte de la vostra biblioteca. Els canvis es desen automàticament.", "branding": "Marca i estil", "colour": "Color i tema", "homeCar": "Inici i carrusel", "sidebar": "Menús laterals", "appName": "Nom de l’aplicació", "appNameHint": "Deixeu-ho buit per al nom predeterminat.", "logoUrl": "URL de logotip personalitzat", "logoHint": "Deixeu-ho buit per al logotip predeterminat.", "accent": "Color d’èmfasi", "baseTheme": "Tema base", "mainFont": "Tipus de lletra principal", "carousel": "Avanç automàtic del carrusel", "carouselHint": "Segons entre diapositives. 0 per desactivar.", "customSeries": "Sèries recents ampliades", "seriesCount": "Nombre de sèries recents", "seriesCountHint": "Quantes sèries es mostren al prestatge ampliat.", "hideShelves": "Amaga els prestatges d’inici", "sidebarHint": "Amagueu entrades del menú lateral que no feu servir.", "showAppName": "Mostra el nom de l’aplicació", "colorizeLogo": "Acoloreix el logotip amb el color d’èmfasi", "hideSeries": "Amaga Sèries", "hideCollections": "Amaga Col·leccions", "hideAuthors": "Amaga Autors", "hideNarrators": "Amaga Narradors", "hideStats": "Amaga Estadístiques", "hideRecentlyAdded": "Amaga Afegits recentment", "hideRecentSeries": "Amaga Sèries recents", "hideContinueSeries": "Amaga Continua la sèrie", "hideListenAgain": "Amaga Escolta de nou", "hideDiscover": "Amaga Descobreix", "hideNewestAuthors": "Amaga Autors més nous", "seriesCards": "Cobertes de sèries apilades", "heroCarousel": "Carrusel d’inici", "gearLabel": "Tema"},
    eu: {"title": "Gaiaren pertsonalizazioa", "subtitle": "Pertsonalizatu zure liburutegiaren itxura. Aldaketak automatikoki gordetzen dira.", "branding": "Marka eta estiloa", "colour": "Kolorea eta gaia", "homeCar": "Hasiera eta karrusela", "sidebar": "Alboko menuak", "appName": "Aplikazioaren izena", "appNameHint": "Utzi hutsik izen lehenetsirako.", "logoUrl": "Logotipo pertsonalizatuaren URLa", "logoHint": "Utzi hutsik logotipo lehenetsirako.", "accent": "Azentu-kolorea", "baseTheme": "Oinarrizko gaia", "mainFont": "Letra-tipo nagusia", "carousel": "Karruselaren aurrerapen automatikoa", "carouselHint": "Diapositiben arteko segundoak. 0 desgaitzeko.", "customSeries": "Azken serie hedatuak", "seriesCount": "Azken serieen kopurua", "seriesCountHint": "Zenbat serie erakutsi apal hedatuan.", "hideShelves": "Ezkutatu hasierako apalak", "sidebarHint": "Ezkutatu erabiltzen ez dituzun alboko menuko sarrerak.", "showAppName": "Erakutsi aplikazioaren izena", "colorizeLogo": "Koloreztatu logotipoa azentu-kolorearekin", "hideSeries": "Ezkutatu Serieak", "hideCollections": "Ezkutatu Bildumak", "hideAuthors": "Ezkutatu Egileak", "hideNarrators": "Ezkutatu Narratzaileak", "hideStats": "Ezkutatu Estatistikak", "hideRecentlyAdded": "Ezkutatu Duela gutxi gehituak", "hideRecentSeries": "Ezkutatu Azken serieak", "hideContinueSeries": "Ezkutatu Jarraitu seriea", "hideListenAgain": "Ezkutatu Entzun berriro", "hideDiscover": "Ezkutatu Aurkitu", "hideNewestAuthors": "Ezkutatu Egile berrienak", "seriesCards": "Serieen azal pilatuak", "heroCarousel": "Hasierako karrusela", "gearLabel": "Gaia"},
    is: {"title": "Þemastillingar", "subtitle": "Sérsníddu útlit safnsins þíns. Breytingar vistast sjálfkrafa.", "branding": "Vörumerki og stíll", "colour": "Litur og þema", "homeCar": "Heim og hringekja", "sidebar": "Hliðarvalmyndir", "appName": "Heiti forrits", "appNameHint": "Skildu eftir autt fyrir sjálfgefið heiti.", "logoUrl": "Slóð á sérsniðið merki", "logoHint": "Skildu eftir autt fyrir sjálfgefið merki.", "accent": "Áherslulitur", "baseTheme": "Grunnþema", "mainFont": "Aðalletur", "carousel": "Sjálfvirk hringekjuskipting", "carouselHint": "Sekúndur milli glæra. 0 til að slökkva.", "customSeries": "Útvíkkaðar nýlegar seríur", "seriesCount": "Fjöldi nýlegra sería", "seriesCountHint": "Hversu margar seríur birtast í útvíkkuðu hillunni.", "hideShelves": "Fela hillur forsíðu", "sidebarHint": "Feldu hliðarvalmyndaratriði sem þú notar ekki.", "showAppName": "Sýna heiti forrits", "colorizeLogo": "Lita merkið með áherslulitnum", "hideSeries": "Fela Seríur", "hideCollections": "Fela Söfn", "hideAuthors": "Fela Höfunda", "hideNarrators": "Fela Lesara", "hideStats": "Fela Tölfræði", "hideRecentlyAdded": "Fela Nýlega bætt við", "hideRecentSeries": "Fela Nýlegar seríur", "hideContinueSeries": "Fela Halda áfram með seríu", "hideListenAgain": "Fela Hlusta aftur", "hideDiscover": "Fela Uppgötva", "hideNewestAuthors": "Fela Nýjustu höfunda", "seriesCards": "Staflaðar seríukápur", "heroCarousel": "Hringekja forsíðu", "gearLabel": "Þema"},
    ja: {"title": "テーマのカスタマイズ", "subtitle": "ライブラリの外観をカスタマイズします。変更は自動的に保存されます。", "branding": "ブランドとスタイル", "colour": "カラーとテーマ", "homeCar": "ホームとカルーセル", "sidebar": "サイドメニュー", "appName": "アプリ名", "appNameHint": "デフォルト名を使う場合は空欄のままにします。", "logoUrl": "カスタムロゴURL", "logoHint": "デフォルトロゴを使う場合は空欄のままにします。", "accent": "アクセントカラー", "baseTheme": "ベーステーマ", "mainFont": "メインフォント", "carousel": "カルーセル自動送り", "carouselHint": "スライド間の秒数。0で無効。", "customSeries": "拡張された最近のシリーズ", "seriesCount": "最近のシリーズ数", "seriesCountHint": "拡張シェルフに表示するシリーズ数。", "hideShelves": "ホームのシェルフを非表示", "sidebarHint": "使わないサイドメニュー項目を非表示にします。", "showAppName": "アプリ名を表示", "colorizeLogo": "ロゴをアクセントカラーで着色", "hideSeries": "シリーズを非表示", "hideCollections": "コレクションを非表示", "hideAuthors": "著者を非表示", "hideNarrators": "ナレーターを非表示", "hideStats": "統計を非表示", "hideRecentlyAdded": "最近追加を非表示", "hideRecentSeries": "最近のシリーズを非表示", "hideContinueSeries": "シリーズを続けるを非表示", "hideListenAgain": "もう一度聴くを非表示", "hideDiscover": "見つけるを非表示", "hideNewestAuthors": "最新の著者を非表示", "seriesCards": "重ねたシリーズカバー", "heroCarousel": "ホームカルーセル", "gearLabel": "テーマ"},
    ko: {"title": "테마 사용자화", "subtitle": "라이브러리 모양을 개인화하세요. 변경 사항은 자동으로 저장됩니다.", "branding": "브랜딩 및 스타일", "colour": "색상 및 테마", "homeCar": "홈 및 캐러셀", "sidebar": "사이드 메뉴", "appName": "앱 이름", "appNameHint": "기본 이름을 사용하려면 비워 두세요.", "logoUrl": "사용자 지정 로고 URL", "logoHint": "기본 로고를 사용하려면 비워 두세요.", "accent": "강조 색상", "baseTheme": "기본 테마", "mainFont": "기본 글꼴", "carousel": "캐러셀 자동 전환", "carouselHint": "슬라이드 간 초. 0이면 비활성화.", "customSeries": "확장된 최근 시리즈", "seriesCount": "최근 시리즈 수", "seriesCountHint": "확장 선반에 표시할 시리즈 수.", "hideShelves": "홈 선반 숨기기", "sidebarHint": "사용하지 않는 사이드 메뉴 항목을 숨깁니다.", "showAppName": "앱 이름 표시", "colorizeLogo": "로고를 강조 색상으로 칠하기", "hideSeries": "시리즈 숨기기", "hideCollections": "컬렉션 숨기기", "hideAuthors": "저자 숨기기", "hideNarrators": "낭독자 숨기기", "hideStats": "통계 숨기기", "hideRecentlyAdded": "최근 추가 숨기기", "hideRecentSeries": "최근 시리즈 숨기기", "hideContinueSeries": "시리즈 계속 숨기기", "hideListenAgain": "다시 듣기 숨기기", "hideDiscover": "발견 숨기기", "hideNewestAuthors": "최신 저자 숨기기", "seriesCards": "겹쳐진 시리즈 표지", "heroCarousel": "홈 캐러셀", "gearLabel": "테마"},
    zh: {"title": "主题自定义", "subtitle": "个性化你的媒体库外观。更改会自动保存。", "branding": "品牌与样式", "colour": "颜色与主题", "homeCar": "主页与轮播", "sidebar": "侧边菜单", "appName": "应用名称", "appNameHint": "留空则使用默认名称。", "logoUrl": "自定义徽标 URL", "logoHint": "留空则使用默认徽标。", "accent": "强调色", "baseTheme": "基础主题", "mainFont": "主字体", "carousel": "轮播自动切换", "carouselHint": "幻灯片间隔秒数。设为 0 可禁用。", "customSeries": "扩展的最近系列", "seriesCount": "最近系列数量", "seriesCountHint": "扩展书架中显示的系列数量。", "hideShelves": "隐藏主页书架", "sidebarHint": "隐藏不使用的侧边菜单项。", "showAppName": "显示应用名称", "colorizeLogo": "用强调色为徽标着色", "hideSeries": "隐藏系列", "hideCollections": "隐藏收藏", "hideAuthors": "隐藏作者", "hideNarrators": "隐藏朗读者", "hideStats": "隐藏统计", "hideRecentlyAdded": "隐藏最近添加", "hideRecentSeries": "隐藏最近系列", "hideContinueSeries": "隐藏继续系列", "hideListenAgain": "隐藏再听一次", "hideDiscover": "隐藏发现", "hideNewestAuthors": "隐藏最新作者", "seriesCards": "堆叠系列封面", "heroCarousel": "主页轮播", "gearLabel": "主题"},
    ar: {"title": "تخصيص السمة", "subtitle": "خصص مظهر مكتبتك. تُحفظ التغييرات تلقائيًا.", "branding": "العلامة والأسلوب", "colour": "اللون والسمة", "homeCar": "الرئيسية والشريط الدوار", "sidebar": "القوائم الجانبية", "appName": "اسم التطبيق", "appNameHint": "اتركه فارغًا للاسم الافتراضي.", "logoUrl": "رابط شعار مخصص", "logoHint": "اتركه فارغًا للشعار الافتراضي.", "accent": "لون التمييز", "baseTheme": "السمة الأساسية", "mainFont": "الخط الرئيسي", "carousel": "التقدم التلقائي للشريط الدوار", "carouselHint": "الثواني بين الشرائح. 0 للتعطيل.", "customSeries": "السلاسل الأخيرة الموسعة", "seriesCount": "عدد السلاسل الأخيرة", "seriesCountHint": "عدد السلاسل المعروضة في الرف الموسع.", "hideShelves": "إخفاء أرفف الصفحة الرئيسية", "sidebarHint": "أخفِ عناصر القائمة الجانبية التي لا تستخدمها.", "showAppName": "إظهار اسم التطبيق", "colorizeLogo": "تلوين الشعار بلون التمييز", "hideSeries": "إخفاء السلاسل", "hideCollections": "إخفاء المجموعات", "hideAuthors": "إخفاء المؤلفين", "hideNarrators": "إخفاء الرواة", "hideStats": "إخفاء الإحصائيات", "hideRecentlyAdded": "إخفاء المضاف حديثًا", "hideRecentSeries": "إخفاء السلاسل الأخيرة", "hideContinueSeries": "إخفاء متابعة السلسلة", "hideListenAgain": "إخفاء الاستماع مجددًا", "hideDiscover": "إخفاء الاستكشاف", "hideNewestAuthors": "إخفاء أحدث المؤلفين", "seriesCards": "أغلفة سلاسل متراكبة", "heroCarousel": "الشريط الدوار للرئيسية", "gearLabel": "السمة"},
    he: {"title": "התאמות ערכת נושא", "subtitle": "התאם אישית את מראה הספרייה שלך. השינויים נשמרים אוטומטית.", "branding": "מיתוג וסגנון", "colour": "צבע וערכת נושא", "homeCar": "דף הבית וקרוסלה", "sidebar": "תפריטי צד", "appName": "שם האפליקציה", "appNameHint": "השאר ריק לשם ברירת המחדל.", "logoUrl": "כתובת לוגו מותאם אישית", "logoHint": "השאר ריק ללוגו ברירת המחדל.", "accent": "צבע הדגשה", "baseTheme": "ערכת נושא בסיסית", "mainFont": "גופן ראשי", "carousel": "קידום אוטומטי של הקרוסלה", "carouselHint": "שניות בין שקופיות. 0 לביטול.", "customSeries": "סדרות אחרונות מורחבות", "seriesCount": "מספר סדרות אחרונות", "seriesCountHint": "כמה סדרות להציג במדף המורחב.", "hideShelves": "הסתר מדפי דף הבית", "sidebarHint": "הסתר פריטי תפריט צד שאינך משתמש בהם.", "showAppName": "הצג את שם האפליקציה", "colorizeLogo": "צבע את הלוגו בצבע ההדגשה", "hideSeries": "הסתר סדרות", "hideCollections": "הסתר אוספים", "hideAuthors": "הסתר מחברים", "hideNarrators": "הסתר מקריאים", "hideStats": "הסתר סטטיסטיקות", "hideRecentlyAdded": "הסתר נוספו לאחרונה", "hideRecentSeries": "הסתר סדרות אחרונות", "hideContinueSeries": "הסתר המשך סדרה", "hideListenAgain": "הסתר האזן שוב", "hideDiscover": "הסתר גלה", "hideNewestAuthors": "הסתר מחברים חדשים", "seriesCards": "כריכות סדרה בערימה", "heroCarousel": "קרוסלת דף הבית", "gearLabel": "ערכת נושא"},
    fa: {"title": "شخصی‌سازی پوسته", "subtitle": "ظاهر کتابخانه خود را شخصی‌سازی کنید. تغییرات به‌طور خودکار ذخیره می‌شوند.", "branding": "برند و سبک", "colour": "رنگ و پوسته", "homeCar": "خانه و چرخ‌ونما", "sidebar": "منوهای کناری", "appName": "نام برنامه", "appNameHint": "برای نام پیش‌فرض خالی بگذارید.", "logoUrl": "نشانی لوگوی سفارشی", "logoHint": "برای لوگوی پیش‌فرض خالی بگذارید.", "accent": "رنگ تأکید", "baseTheme": "پوسته پایه", "mainFont": "قلم اصلی", "carousel": "پیشروی خودکار چرخ‌ونما", "carouselHint": "ثانیه بین اسلایدها. برای غیرفعال‌سازی 0.", "customSeries": "سری‌های اخیر گسترش‌یافته", "seriesCount": "تعداد سری‌های اخیر", "seriesCountHint": "چند سری در قفسه گسترش‌یافته نمایش داده شود.", "hideShelves": "پنهان‌کردن قفسه‌های صفحه اصلی", "sidebarHint": "موارد منوی کناری که استفاده نمی‌کنید را پنهان کنید.", "showAppName": "نمایش نام برنامه", "colorizeLogo": "رنگ‌آمیزی لوگو با رنگ تأکید", "hideSeries": "پنهان‌کردن سری‌ها", "hideCollections": "پنهان‌کردن مجموعه‌ها", "hideAuthors": "پنهان‌کردن نویسندگان", "hideNarrators": "پنهان‌کردن گویندگان", "hideStats": "پنهان‌کردن آمار", "hideRecentlyAdded": "پنهان‌کردن به‌تازگی افزوده‌شده", "hideRecentSeries": "پنهان‌کردن سری‌های اخیر", "hideContinueSeries": "پنهان‌کردن ادامه سری", "hideListenAgain": "پنهان‌کردن دوباره گوش کن", "hideDiscover": "پنهان‌کردن کشف", "hideNewestAuthors": "پنهان‌کردن جدیدترین نویسندگان", "seriesCards": "جلدهای سری روی‌هم", "heroCarousel": "چرخ‌ونمای صفحه اصلی", "gearLabel": "پوسته"},
    hi: {"title": "थीम अनुकूलन", "subtitle": "अपनी लाइब्रेरी का रूप वैयक्तिकृत करें। परिवर्तन स्वतः सहेजे जाते हैं।", "branding": "ब्रांडिंग और शैली", "colour": "रंग और थीम", "homeCar": "होम और कैरोसेल", "sidebar": "साइड मेनू", "appName": "ऐप का नाम", "appNameHint": "डिफ़ॉल्ट नाम के लिए खाली छोड़ें।", "logoUrl": "कस्टम लोगो URL", "logoHint": "डिफ़ॉल्ट लोगो के लिए खाली छोड़ें।", "accent": "एक्सेंट रंग", "baseTheme": "मूल थीम", "mainFont": "मुख्य फ़ॉन्ट", "carousel": "कैरोसेल स्वतः आगे बढ़ना", "carouselHint": "स्लाइडों के बीच सेकंड। बंद करने के लिए 0।", "customSeries": "विस्तारित हाल की श्रृंखलाएँ", "seriesCount": "हाल की श्रृंखलाओं की संख्या", "seriesCountHint": "विस्तारित शेल्फ़ में कितनी श्रृंखलाएँ दिखाएँ।", "hideShelves": "होमपेज शेल्फ़ छिपाएँ", "sidebarHint": "साइड मेनू की अनुपयोगी प्रविष्टियाँ छिपाएँ।", "showAppName": "ऐप का नाम दिखाएँ", "colorizeLogo": "लोगो को एक्सेंट रंग से रंगें", "hideSeries": "श्रृंखलाएँ छिपाएँ", "hideCollections": "संग्रह छिपाएँ", "hideAuthors": "लेखक छिपाएँ", "hideNarrators": "वाचक छिपाएँ", "hideStats": "आँकड़े छिपाएँ", "hideRecentlyAdded": "हाल में जोड़े गए छिपाएँ", "hideRecentSeries": "हाल की श्रृंखलाएँ छिपाएँ", "hideContinueSeries": "श्रृंखला जारी रखें छिपाएँ", "hideListenAgain": "फिर से सुनें छिपाएँ", "hideDiscover": "खोजें छिपाएँ", "hideNewestAuthors": "नवीनतम लेखक छिपाएँ", "seriesCards": "परतदार श्रृंखला कवर", "heroCarousel": "होम कैरोसेल", "gearLabel": "थीम"},
    bn: {"title": "থিম কাস্টমাইজেশন", "subtitle": "আপনার লাইব্রেরির চেহারা ব্যক্তিগতকৃত করুন। পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।", "branding": "ব্র্যান্ডিং ও শৈলী", "colour": "রঙ ও থিম", "homeCar": "হোম ও ক্যারোজেল", "sidebar": "সাইড মেনু", "appName": "অ্যাপের নাম", "appNameHint": "ডিফল্ট নামের জন্য খালি রাখুন।", "logoUrl": "কাস্টম লোগো URL", "logoHint": "ডিফল্ট লোগোর জন্য খালি রাখুন।", "accent": "অ্যাকসেন্ট রঙ", "baseTheme": "মূল থিম", "mainFont": "প্রধান ফন্ট", "carousel": "ক্যারোজেল স্বয়ংক্রিয় অগ্রগতি", "carouselHint": "স্লাইডের মধ্যে সেকেন্ড। বন্ধ করতে 0।", "customSeries": "সম্প্রসারিত সাম্প্রতিক সিরিজ", "seriesCount": "সাম্প্রতিক সিরিজের সংখ্যা", "seriesCountHint": "সম্প্রসারিত তাকে কতটি সিরিজ দেখানো হবে।", "hideShelves": "হোমপেজের তাক লুকান", "sidebarHint": "অব্যবহৃত সাইড মেনু আইটেম লুকান।", "showAppName": "অ্যাপের নাম দেখান", "colorizeLogo": "লোগোকে অ্যাকসেন্ট রঙে রাঙান", "hideSeries": "সিরিজ লুকান", "hideCollections": "সংগ্রহ লুকান", "hideAuthors": "লেখক লুকান", "hideNarrators": "পাঠক লুকান", "hideStats": "পরিসংখ্যান লুকান", "hideRecentlyAdded": "সম্প্রতি যোগ করা লুকান", "hideRecentSeries": "সাম্প্রতিক সিরিজ লুকান", "hideContinueSeries": "সিরিজ চালিয়ে যান লুকান", "hideListenAgain": "আবার শুনুন লুকান", "hideDiscover": "আবিষ্কার লুকান", "hideNewestAuthors": "নতুনতম লেখক লুকান", "seriesCards": "স্তূপীকৃত সিরিজ কভার", "heroCarousel": "হোম ক্যারোজেল", "gearLabel": "থিম"},
    gu: {"title": "થીમ કસ્ટમાઇઝેશન", "subtitle": "તમારી લાઇબ્રેરીનો દેખાવ વ્યક્તિગત બનાવો. ફેરફારો આપમેળે સાચવાય છે.", "branding": "બ્રાન્ડિંગ અને શૈલી", "colour": "રંગ અને થીમ", "homeCar": "હોમ અને કેરોસેલ", "sidebar": "સાઇડ મેનૂ", "appName": "એપ્લિકેશનનું નામ", "appNameHint": "ડિફૉલ્ટ નામ માટે ખાલી છોડો.", "logoUrl": "કસ્ટમ લોગો URL", "logoHint": "ડિફૉલ્ટ લોગો માટે ખાલી છોડો.", "accent": "એક્સેન્ટ રંગ", "baseTheme": "મૂળ થીમ", "mainFont": "મુખ્ય ફૉન્ટ", "carousel": "કેરોસેલ સ્વયં આગળ વધવું", "carouselHint": "સ્લાઇડ્સ વચ્ચે સેકંડ. બંધ કરવા 0.", "customSeries": "વિસ્તૃત તાજેતરની શ્રેણીઓ", "seriesCount": "તાજેતરની શ્રેણીઓની સંખ્યા", "seriesCountHint": "વિસ્તૃત શેલ્ફમાં કેટલી શ્રેણીઓ બતાવવી.", "hideShelves": "હોમપેજ શેલ્ફ છુપાવો", "sidebarHint": "ન વપરાતી સાઇડ મેનૂ આઇટમ છુપાવો.", "showAppName": "એપ્લિકેશનનું નામ બતાવો", "colorizeLogo": "લોગોને એક્સેન્ટ રંગથી રંગો", "hideSeries": "શ્રેણીઓ છુપાવો", "hideCollections": "સંગ્રહો છુપાવો", "hideAuthors": "લેખકો છુપાવો", "hideNarrators": "વાચકો છુપાવો", "hideStats": "આંકડા છુપાવો", "hideRecentlyAdded": "તાજેતરમાં ઉમેરાયેલ છુપાવો", "hideRecentSeries": "તાજેતરની શ્રેણીઓ છુપાવો", "hideContinueSeries": "શ્રેણી ચાલુ રાખો છુપાવો", "hideListenAgain": "ફરી સાંભળો છુપાવો", "hideDiscover": "શોધો છુપાવો", "hideNewestAuthors": "નવીનતમ લેખકો છુપાવો", "seriesCards": "સ્તરબદ્ધ શ્રેણી કવર", "heroCarousel": "હોમ કેરોસેલ", "gearLabel": "થીમ"},
    vi: {"title": "Tùy chỉnh giao diện", "subtitle": "Cá nhân hóa giao diện thư viện của bạn. Thay đổi được lưu tự động.", "branding": "Thương hiệu & phong cách", "colour": "Màu sắc & giao diện", "homeCar": "Trang chủ & băng chuyền", "sidebar": "Menu bên", "appName": "Tên ứng dụng", "appNameHint": "Để trống để dùng tên mặc định.", "logoUrl": "URL logo tùy chỉnh", "logoHint": "Để trống để dùng logo mặc định.", "accent": "Màu nhấn", "baseTheme": "Giao diện cơ bản", "mainFont": "Phông chữ chính", "carousel": "Tự động chuyển băng chuyền", "carouselHint": "Số giây giữa các slide. 0 để tắt.", "customSeries": "Bộ truyện gần đây mở rộng", "seriesCount": "Số bộ truyện gần đây", "seriesCountHint": "Số bộ truyện hiển thị trên kệ mở rộng.", "hideShelves": "Ẩn các kệ trang chủ", "sidebarHint": "Ẩn các mục menu bên bạn không dùng.", "showAppName": "Hiện tên ứng dụng", "colorizeLogo": "Tô màu logo bằng màu nhấn", "hideSeries": "Ẩn Bộ truyện", "hideCollections": "Ẩn Bộ sưu tập", "hideAuthors": "Ẩn Tác giả", "hideNarrators": "Ẩn Người đọc", "hideStats": "Ẩn Thống kê", "hideRecentlyAdded": "Ẩn Mới thêm gần đây", "hideRecentSeries": "Ẩn Bộ truyện gần đây", "hideContinueSeries": "Ẩn Tiếp tục bộ truyện", "hideListenAgain": "Ẩn Nghe lại", "hideDiscover": "Ẩn Khám phá", "hideNewestAuthors": "Ẩn Tác giả mới nhất", "seriesCards": "Bìa bộ truyện xếp chồng", "heroCarousel": "Băng chuyền trang chủ", "gearLabel": "Giao diện"}
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
      #nh-settings-panel .nh-upload-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--nh-hairline-lit, rgba(255,255,255,0.14)); border-radius: 10px; padding: 9px 16px; color: var(--nh-text-1, #f4eee2); font-size: 0.86rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s, border-color .15s; }
      #nh-settings-panel .nh-upload-btn:hover { background: var(--nh-amber-tint, rgba(224,194,122,0.14)); border-color: var(--nh-amber); }
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

  function createCustomizationsPanel(configPage, hideBranding = false, isConfigPage = false) {
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
            <input type="text" id="nh-in-logo" placeholder="https://... ${T.logoOr || 'or'} /_nh/logo.png">
            <div id="nh-logo-upload-row" style="display:none; align-items:center; gap:10px; margin-top:10px;">
              <input type="file" id="nh-in-logo-file" accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif,image/avif,image/x-icon" style="display:none">
              <button type="button" id="nh-logo-upload-btn" class="nh-upload-btn">${T.logoUpload || 'Upload from device…'}</button>
              <span id="nh-logo-upload-status" class="nh-hint" style="margin:0;"></span>
            </div>
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
          <div class="nh-field" id="nh-tog-seriescards"></div>
          <div class="nh-field" id="nh-tog-herocarousel"></div>
          <div class="nh-field"><label class="nh-label" id="nh-cr-label"></label><div id="nh-sel-crmode"></div></div>
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

    // Logo upload (admin only): browse a device image, PUT it into the /data/nh volume,
    // then point the logo at the same-origin /_nh/logo.<ext> so it renders with NO internet.
    const logoUploadRow = panel.querySelector('#nh-logo-upload-row');
    if (logoUploadRow && isUserAdmin()) {
      logoUploadRow.style.display = 'flex';
      const logoFile = panel.querySelector('#nh-in-logo-file');
      const logoStatus = panel.querySelector('#nh-logo-upload-status');
      panel.querySelector('#nh-logo-upload-btn').addEventListener('click', () => logoFile.click());
      logoFile.addEventListener('change', () => {
        const file = logoFile.files && logoFile.files[0];
        if (!file) return;
        const byMime = { 'image/png': 'png', 'image/svg+xml': 'svg', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico' };
        let ext = byMime[file.type] || (file.name.split('.').pop() || '').toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (!/^(png|svg|jpg|webp|gif|avif|ico)$/.test(ext)) { logoStatus.textContent = T.logoBadType || PANEL_T.en.logoBadType; logoFile.value = ''; return; }
        if (file.size > 4 * 1024 * 1024) { logoStatus.textContent = T.logoTooBig || PANEL_T.en.logoTooBig; logoFile.value = ''; return; }
        logoStatus.textContent = '…';
        let token = '';
        try { const st = window.$nuxt.$store; token = st.getters['user/getToken'] || (st.state.user.user && (st.state.user.user.accessToken || st.state.user.user.token)) || ''; } catch (e) {}
        fetch('/_nh/data/logo.' + ext, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token }, body: file })
          .then((r) => {
            if (!r.ok) { logoStatus.textContent = T.srvErr || PANEL_T.en.srvErr; return; }
            // Cache-bust in the stored URL so the new logo shows at once and re-uploads
            // refresh too (applySettings re-asserts this exact src each tick).
            nhSettings.logoUrl = '/_nh/logo.' + ext + '?v=' + Date.now();
            logoInput.value = nhSettings.logoUrl;
            saveSettings(); applySettings();
            logoStatus.textContent = T.logoUploaded || PANEL_T.en.logoUploaded;
            setTimeout(() => { logoStatus.textContent = ''; }, 2500);
          })
          .catch(() => { logoStatus.textContent = T.srvErr || PANEL_T.en.srvErr; });
        logoFile.value = '';
      });
    }

    bindInput('#nh-in-carousel', 'carouselTiming');
    bindInput('#nh-in-series-count', 'recentSeriesCount');
    panel.querySelector('#nh-tog-customseries').appendChild(createToggle(T.customSeries, 'showCustomRecentSeries'));
    panel.querySelector('#nh-tog-seriescards').appendChild(createToggle(T.seriesCards || PANEL_T.en.seriesCards, 'customSeriesCards'));
    panel.querySelector('#nh-tog-herocarousel').appendChild(createToggle(T.heroCarousel || PANEL_T.en.heroCarousel, 'showHeroCarousel'));
    panel.querySelector('#nh-cr-label').textContent = T.crMode || PANEL_T.en.crMode;
    (function () {
      const sel = document.createElement('select');
      sel.className = 'nh-er-select';
      [['combine', T.crCombine || PANEL_T.en.crCombine], ['separate', T.crSeparate || PANEL_T.en.crSeparate], ['hide', T.crHide || PANEL_T.en.crHide]].forEach(function (o) {
        const opt = document.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        sel.appendChild(opt);
      });
      sel.value = nhSettings.continueReadingMode || 'combine';
      sel.addEventListener('change', function () {
        nhSettings.continueReadingMode = sel.value;
        saveSettings(); applySettings();
      });
      panel.querySelector('#nh-sel-crmode').appendChild(sel);
    })();

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

    // Server defaults — admins, config page only (not the quick modal). Saves the
    // current settings to the proxy (/data/nh volume) via an admin-authenticated PUT;
    // nginx injects the file into every page before first paint.
    if (isConfigPage && isUserAdmin()) {
      const sec = document.createElement('section');
      sec.className = 'nh-card';
      sec.innerHTML = '<h2 class="nh-card-title">' + (T.srvTitle || PANEL_T.en.srvTitle) + '</h2>' +
        '<p class="nh-hint" style="margin-bottom:14px;">' + (T.srvHint || PANEL_T.en.srvHint) + '</p>' +
        '<div style="display:flex; gap:12px; flex-wrap:wrap;">' +
        '<button type="button" id="nh-srv-save" style="background: var(--nh-amber, #e0c27a); color: #14110d; border: none; border-radius: 10px; padding: 10px 22px; font-weight: 600; cursor: pointer;">' + (T.srvSave || PANEL_T.en.srvSave) + '</button>' +
        '<button type="button" id="nh-srv-clear" style="background: transparent; color: var(--nh-muted-2, #a99f8f); border: 1px solid var(--nh-hairline, rgba(255,255,255,0.15)); border-radius: 10px; padding: 10px 22px; font-weight: 600; cursor: pointer;">' + (T.srvClear || PANEL_T.en.srvClear) + '</button>' +
        '</div>';
      (panel.querySelector('.nh-grid') || panel).appendChild(sec);

      const flashBtn = function (btn, msg) {
        const orig = btn.dataset.nhOrig || btn.textContent;
        btn.dataset.nhOrig = orig;
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = orig; }, 2500);
      };
      const nhAbsToken = function () {
        try {
          const st = window.$nuxt.$store;
          return st.getters['user/getToken'] || (st.state.user.user && (st.state.user.user.accessToken || st.state.user.user.token)) || '';
        } catch (e) { return ''; }
      };
      const putServerConfig = function (obj, btn, okText) {
        const clean = {};
        Object.keys(obj).forEach(function (k) {
          const v = obj[k];
          clean[k] = (typeof v === 'string') ? v.replace(/[<>]/g, '') : v;
        });
        fetch('/_nh/data/server-config.json', {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + nhAbsToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify(clean)
        }).then(function (r) {
          flashBtn(btn, r.ok ? okText : (T.srvErr || PANEL_T.en.srvErr));
        }).catch(function () { flashBtn(btn, T.srvErr || PANEL_T.en.srvErr); });
      };
      sec.querySelector('#nh-srv-save').addEventListener('click', function (e) {
        putServerConfig(nhSettings, e.target, T.srvSaved || PANEL_T.en.srvSaved);
      });
      sec.querySelector('#nh-srv-clear').addEventListener('click', function (e) {
        const btn = e.target;
        const clean = {};
        fetch('/_nh/data/server-config.json', {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + nhAbsToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify(clean)
        }).then(function (r) {
          if (!r.ok) { flashBtn(btn, T.srvErr || PANEL_T.en.srvErr); return; }
          // Also drop this browser's personal overrides so the admin lands on the
          // true stock look — server clear alone can't touch localStorage.
          try { localStorage.removeItem('nh-settings'); } catch (err) {}
          flashBtn(btn, T.srvCleared || PANEL_T.en.srvCleared);
          setTimeout(function () { window.location.reload(); }, 700);
        }).catch(function () { flashBtn(btn, T.srvErr || PANEL_T.en.srvErr); });
      });
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
      if (!panel) panel = createCustomizationsPanel(configPage, false, true);
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
      en: {"morning": "GOOD MORNING", "afternoon": "GOOD AFTERNOON", "evening": "GOOD EVENING", "welcome": "Welcome back", "pickup": "Pick up where you left off", "by": "by", "continue": "Continue", "left": "left", "narratedBy": "Narrated by", "unknown": "Unknown Title", "fallbackDesc": "Resume your current audiobook."},
      pl: {"morning": "DZIEŃ DOBRY", "afternoon": "DOBREGO POPOŁUDNIA", "evening": "DOBRY WIECZÓR", "welcome": "Witaj ponownie", "pickup": "Wróć do słuchania", "by": "", "continue": "Kontynuuj", "left": "pozostało", "narratedBy": "Czyta", "unknown": "Nieznany tytuł", "fallbackDesc": "Wznów słuchanie obecnego audiobooka."},
      de: {"morning": "GUTEN MORGEN", "afternoon": "GUTEN TAG", "evening": "GUTEN ABEND", "welcome": "Willkommen zurück", "pickup": "Mache da weiter, wo du aufgehört hast", "by": "von", "continue": "Weiter", "left": "verbleibend", "narratedBy": "Gelesen von", "unknown": "Unbekannter Titel", "fallbackDesc": "Setze dein aktuelles Hörbuch fort."},
      fr: {"morning": "BONJOUR", "afternoon": "BON APRÈS-MIDI", "evening": "BONSOIR", "welcome": "Bon retour", "pickup": "Reprenez là où vous vous étiez arrêté", "by": "de", "continue": "Continuer", "left": "restant", "narratedBy": "Lu par", "unknown": "Titre inconnu", "fallbackDesc": "Reprenez votre livre audio actuel."},
      es: {"morning": "BUENOS DÍAS", "afternoon": "BUENAS TARDES", "evening": "BUENAS NOCHES", "welcome": "Bienvenido de nuevo", "pickup": "Continúa donde lo dejaste", "by": "de", "continue": "Continuar", "left": "restante", "narratedBy": "Narrado por", "unknown": "Título desconocido", "fallbackDesc": "Reanuda tu audiolibro actual."},
      it: {"morning": "BUONGIORNO", "afternoon": "BUON POMERIGGIO", "evening": "BUONASERA", "welcome": "Bentornato", "pickup": "Riprendi da dove avevi interrotto", "by": "di", "continue": "Continua", "left": "rimanente", "narratedBy": "Narrato da", "unknown": "Titolo sconosciuto", "fallbackDesc": "Riprendi il tuo audiolibro attuale."},
      pt: {"morning": "BOM DIA", "afternoon": "BOA TARDE", "evening": "BOA NOITE", "welcome": "Bem-vindo de volta", "pickup": "Continue de onde parou", "by": "de", "continue": "Continuar", "left": "restante", "narratedBy": "Narrado por", "unknown": "Título desconhecido", "fallbackDesc": "Retome seu audiolivro atual."},
      nl: {"morning": "GOEDEMORGEN", "afternoon": "GOEDEMIDDAG", "evening": "GOEDENAVOND", "welcome": "Welkom terug", "pickup": "Ga verder waar je gebleven was", "by": "door", "continue": "Doorgaan", "left": "resterend", "narratedBy": "Verteld door", "unknown": "Onbekende titel", "fallbackDesc": "Hervat je huidige luisterboek."},
      cs: {"morning": "DOBRÉ RÁNO", "afternoon": "DOBRÉ ODPOLEDNE", "evening": "DOBRÝ VEČER", "welcome": "Vítejte zpět", "pickup": "Pokračujte tam, kde jste skončili", "by": "od", "continue": "Pokračovat", "left": "zbývá", "narratedBy": "Čte", "unknown": "Neznámý název", "fallbackDesc": "Pokračujte ve své aktuální audioknize."},
      sk: {"morning": "DOBRÉ RÁNO", "afternoon": "DOBRÉ POPOLUDNIE", "evening": "DOBRÝ VEČER", "welcome": "Vitajte späť", "pickup": "Pokračujte tam, kde ste skončili", "by": "od", "continue": "Pokračovať", "left": "zostáva", "narratedBy": "Číta", "unknown": "Neznámy názov", "fallbackDesc": "Pokračujte vo svojej aktuálnej audioknihe."},
      da: {"morning": "GODMORGEN", "afternoon": "GOD EFTERMIDDAG", "evening": "GODAFTEN", "welcome": "Velkommen tilbage", "pickup": "Fortsæt hvor du slap", "by": "af", "continue": "Fortsæt", "left": "tilbage", "narratedBy": "Fortalt af", "unknown": "Ukendt titel", "fallbackDesc": "Genoptag din aktuelle lydbog."},
      sv: {"morning": "GOD MORGON", "afternoon": "GOD EFTERMIDDAG", "evening": "GOD KVÄLL", "welcome": "Välkommen tillbaka", "pickup": "Fortsätt där du slutade", "by": "av", "continue": "Fortsätt", "left": "kvar", "narratedBy": "Uppläst av", "unknown": "Okänd titel", "fallbackDesc": "Återuppta din nuvarande ljudbok."},
      no: {"morning": "GOD MORGEN", "afternoon": "GOD ETTERMIDDAG", "evening": "GOD KVELD", "welcome": "Velkommen tilbake", "pickup": "Fortsett der du slapp", "by": "av", "continue": "Fortsett", "left": "igjen", "narratedBy": "Fortalt av", "unknown": "Ukjent tittel", "fallbackDesc": "Gjenoppta din nåværende lydbok."},
      fi: {"morning": "HYVÄÄ HUOMENTA", "afternoon": "HYVÄÄ PÄIVÄÄ", "evening": "HYVÄÄ ILTAA", "welcome": "Tervetuloa takaisin", "pickup": "Jatka siitä mihin jäit", "by": "–", "continue": "Jatka", "left": "jäljellä", "narratedBy": "Lukija", "unknown": "Tuntematon nimi", "fallbackDesc": "Jatka nykyistä äänikirjaasi."},
      ru: {"morning": "ДОБРОЕ УТРО", "afternoon": "ДОБРЫЙ ДЕНЬ", "evening": "ДОБРЫЙ ВЕЧЕР", "welcome": "С возвращением", "pickup": "Продолжите с того места, где остановились", "by": "—", "continue": "Продолжить", "left": "осталось", "narratedBy": "Читает", "unknown": "Неизвестное название", "fallbackDesc": "Продолжите текущую аудиокнигу."},
      uk: {"morning": "ДОБРОГО РАНКУ", "afternoon": "ДОБРОГО ДНЯ", "evening": "ДОБРОГО ВЕЧОРА", "welcome": "З поверненням", "pickup": "Продовжте з того місця, де зупинилися", "by": "—", "continue": "Продовжити", "left": "залишилося", "narratedBy": "Читає", "unknown": "Невідома назва", "fallbackDesc": "Продовжте свою поточну аудіокнигу."},
      be: {"morning": "ДОБРАЙ РАНІЦЫ", "afternoon": "ДОБРЫ ДЗЕНЬ", "evening": "ДОБРЫ ВЕЧАР", "welcome": "З вяртаннем", "pickup": "Працягніце з таго месца, дзе спыніліся", "by": "—", "continue": "Працягнуць", "left": "засталося", "narratedBy": "Чытае", "unknown": "Невядомая назва", "fallbackDesc": "Працягніце сваю бягучую аўдыякнігу."},
      bg: {"morning": "ДОБРО УТРО", "afternoon": "ДОБЪР ДЕН", "evening": "ДОБЪР ВЕЧЕР", "welcome": "Добре дошли отново", "pickup": "Продължете откъдето спряхте", "by": "от", "continue": "Продължи", "left": "остават", "narratedBy": "Разказва", "unknown": "Неизвестно заглавие", "fallbackDesc": "Продължете текущата си аудиокнига."},
      hr: {"morning": "DOBRO JUTRO", "afternoon": "DOBAR DAN", "evening": "DOBRA VEČER", "welcome": "Dobrodošli natrag", "pickup": "Nastavite gdje ste stali", "by": "od", "continue": "Nastavi", "left": "preostalo", "narratedBy": "Pripovijeda", "unknown": "Nepoznat naslov", "fallbackDesc": "Nastavite svoju trenutnu audioknjigu."},
      sl: {"morning": "DOBRO JUTRO", "afternoon": "DOBER DAN", "evening": "DOBER VEČER", "welcome": "Dobrodošli nazaj", "pickup": "Nadaljujte, kjer ste ostali", "by": "od", "continue": "Nadaljuj", "left": "preostalo", "narratedBy": "Pripoveduje", "unknown": "Neznan naslov", "fallbackDesc": "Nadaljujte svojo trenutno zvočno knjigo."},
      hu: {"morning": "JÓ REGGELT", "afternoon": "JÓ NAPOT", "evening": "JÓ ESTÉT", "welcome": "Üdvözöljük újra", "pickup": "Folytassa ott, ahol abbahagyta", "by": "–", "continue": "Folytatás", "left": "van hátra", "narratedBy": "Felolvassa", "unknown": "Ismeretlen cím", "fallbackDesc": "Folytassa jelenlegi hangoskönyvét."},
      ro: {"morning": "BUNĂ DIMINEAȚA", "afternoon": "BUNĂ ZIUA", "evening": "BUNĂ SEARA", "welcome": "Bine ați revenit", "pickup": "Continuați de unde ați rămas", "by": "de", "continue": "Continuă", "left": "rămas", "narratedBy": "Narat de", "unknown": "Titlu necunoscut", "fallbackDesc": "Reluați audiobook-ul curent."},
      lt: {"morning": "LABAS RYTAS", "afternoon": "LABA DIENA", "evening": "LABAS VAKARAS", "welcome": "Sveiki sugrįžę", "pickup": "Tęskite nuo ten, kur baigėte", "by": "–", "continue": "Tęsti", "left": "liko", "narratedBy": "Skaito", "unknown": "Nežinomas pavadinimas", "fallbackDesc": "Tęskite dabartinę garso knygą."},
      lv: {"morning": "LABRĪT", "afternoon": "LABDIEN", "evening": "LABVAKAR", "welcome": "Laipni lūdzam atpakaļ", "pickup": "Turpiniet no vietas, kur pārtraucāt", "by": "–", "continue": "Turpināt", "left": "atlicis", "narratedBy": "Lasa", "unknown": "Nezināms nosaukums", "fallbackDesc": "Turpiniet savu pašreizējo audiogrāmatu."},
      et: {"morning": "TERE HOMMIKUST", "afternoon": "TERE PÄEVAST", "evening": "TERE ÕHTUST", "welcome": "Tere tulemast tagasi", "pickup": "Jätkake sealt, kus pooleli jäite", "by": "–", "continue": "Jätka", "left": "jäänud", "narratedBy": "Loeb", "unknown": "Tundmatu pealkiri", "fallbackDesc": "Jätkake oma praegust audioraamatut."},
      el: {"morning": "ΚΑΛΗΜΕΡΑ", "afternoon": "ΚΑΛΟ ΑΠΟΓΕΥΜΑ", "evening": "ΚΑΛΗΣΠΕΡΑ", "welcome": "Καλώς ήρθατε ξανά", "pickup": "Συνεχίστε από εκεί που σταματήσατε", "by": "του", "continue": "Συνέχεια", "left": "απομένουν", "narratedBy": "Αφήγηση", "unknown": "Άγνωστος τίτλος", "fallbackDesc": "Συνεχίστε το τρέχον ηχητικό σας βιβλίο."},
      tr: {"morning": "GÜNAYDIN", "afternoon": "İYİ GÜNLER", "evening": "İYİ AKŞAMLAR", "welcome": "Tekrar hoş geldiniz", "pickup": "Kaldığınız yerden devam edin", "by": "–", "continue": "Devam Et", "left": "kaldı", "narratedBy": "Seslendiren", "unknown": "Bilinmeyen Başlık", "fallbackDesc": "Mevcut sesli kitabınıza devam edin."},
      ca: {"morning": "BON DIA", "afternoon": "BONA TARDA", "evening": "BONA NIT", "welcome": "Benvingut de nou", "pickup": "Continueu on ho vau deixar", "by": "de", "continue": "Continua", "left": "restant", "narratedBy": "Narrat per", "unknown": "Títol desconegut", "fallbackDesc": "Repreneu el vostre audiollibre actual."},
      eu: {"morning": "EGUN ON", "afternoon": "ARRATSALDE ON", "evening": "GABON", "welcome": "Ongi etorri berriro", "pickup": "Jarraitu utzi zenuen tokitik", "by": "–", "continue": "Jarraitu", "left": "geratzen da", "narratedBy": "Narratzailea", "unknown": "Izenburu ezezaguna", "fallbackDesc": "Jarraitu zure uneko audioliburua."},
      is: {"morning": "GÓÐAN DAGINN", "afternoon": "GÓÐAN DAG", "evening": "GOTT KVÖLD", "welcome": "Velkomin aftur", "pickup": "Haltu áfram þar sem frá var horfið", "by": "eftir", "continue": "Halda áfram", "left": "eftir", "narratedBy": "Lesari", "unknown": "Óþekktur titill", "fallbackDesc": "Haltu áfram með núverandi hljóðbók."},
      ja: {"morning": "おはようございます", "afternoon": "こんにちは", "evening": "こんばんは", "welcome": "おかえりなさい", "pickup": "続きから再開しましょう", "by": "著", "continue": "続きを聴く", "left": "残り", "narratedBy": "朗読", "unknown": "不明なタイトル", "fallbackDesc": "現在のオーディオブックを再開します。"},
      ko: {"morning": "좋은 아침입니다", "afternoon": "좋은 오후입니다", "evening": "좋은 저녁입니다", "welcome": "다시 오신 것을 환영합니다", "pickup": "멈춘 곳에서 이어서 들어보세요", "by": "저자", "continue": "계속 듣기", "left": "남음", "narratedBy": "낭독", "unknown": "알 수 없는 제목", "fallbackDesc": "현재 오디오북을 이어서 들으세요."},
      zh: {"morning": "早上好", "afternoon": "下午好", "evening": "晚上好", "welcome": "欢迎回来", "pickup": "从上次的位置继续", "by": "作者", "continue": "继续", "left": "剩余", "narratedBy": "朗读", "unknown": "未知标题", "fallbackDesc": "继续收听当前有声书。"},
      ar: {"morning": "صباح الخير", "afternoon": "مساء الخير", "evening": "مساء الخير", "welcome": "مرحبًا بعودتك", "pickup": "تابع من حيث توقفت", "by": "لـ", "continue": "متابعة", "left": "متبقٍ", "narratedBy": "بصوت", "unknown": "عنوان غير معروف", "fallbackDesc": "استأنف كتابك الصوتي الحالي."},
      he: {"morning": "בוקר טוב", "afternoon": "צהריים טובים", "evening": "ערב טוב", "welcome": "ברוך שובך", "pickup": "המשך מהמקום שבו הפסקת", "by": "מאת", "continue": "המשך", "left": "נותרו", "narratedBy": "מקריא", "unknown": "כותרת לא ידועה", "fallbackDesc": "המשך את ספר האודיו הנוכחי שלך."},
      fa: {"morning": "صبح بخیر", "afternoon": "عصر بخیر", "evening": "شب بخیر", "welcome": "خوش برگشتید", "pickup": "از جایی که رها کردید ادامه دهید", "by": "از", "continue": "ادامه", "left": "باقی‌مانده", "narratedBy": "با صدای", "unknown": "عنوان ناشناخته", "fallbackDesc": "کتاب صوتی فعلی خود را از سر بگیرید."},
      hi: {"morning": "सुप्रभात", "afternoon": "शुभ दोपहर", "evening": "शुभ संध्या", "welcome": "वापसी पर स्वागत है", "pickup": "जहाँ छोड़ा था वहीं से जारी रखें", "by": "द्वारा", "continue": "जारी रखें", "left": "शेष", "narratedBy": "वाचन", "unknown": "अज्ञात शीर्षक", "fallbackDesc": "अपनी वर्तमान ऑडियोबुक फिर से शुरू करें।"},
      bn: {"morning": "সুপ্রভাত", "afternoon": "শুভ অপরাহ্ন", "evening": "শুভ সন্ধ্যা", "welcome": "ফিরে আসায় স্বাগতম", "pickup": "যেখানে থেমেছিলেন সেখান থেকে চালিয়ে যান", "by": "লেখক", "continue": "চালিয়ে যান", "left": "বাকি", "narratedBy": "পাঠ করেছেন", "unknown": "অজানা শিরোনাম", "fallbackDesc": "আপনার বর্তমান অডিওবুক আবার শুরু করুন।"},
      gu: {"morning": "સુપ્રભાત", "afternoon": "શુભ બપોર", "evening": "શુભ સાંજ", "welcome": "પાછા આવવા બદલ સ્વાગત છે", "pickup": "જ્યાં છોડ્યું હતું ત્યાંથી ચાલુ રાખો", "by": "દ્વારા", "continue": "ચાલુ રાખો", "left": "બાકી", "narratedBy": "વાચન", "unknown": "અજાણ્યું શીર્ષક", "fallbackDesc": "તમારી વર્તમાન ઑડિયોબુક ફરી શરૂ કરો."},
      vi: {"morning": "CHÀO BUỔI SÁNG", "afternoon": "CHÀO BUỔI CHIỀU", "evening": "CHÀO BUỔI TỐI", "welcome": "Chào mừng trở lại", "pickup": "Tiếp tục từ chỗ bạn đã dừng", "by": "của", "continue": "Tiếp tục", "left": "còn lại", "narratedBy": "Người đọc", "unknown": "Tiêu đề không xác định", "fallbackDesc": "Tiếp tục sách nói hiện tại của bạn."}
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

    let hasAudio = true;
    let hasEbook = false;

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

          const nhEbookFormat = itemData.media?.ebookFormat || itemData.media?.ebookFile?.ebookFormat || '';
          hasAudio = Number(itemData.media?.duration) > 0;
          hasEbook = !!nhEbookFormat;
          const isEbookOnly = !hasAudio && hasEbook;

          const ump = itemData.userMediaProgress;
          if (ump) {
            if (ump.currentTime != null && !playedSec) playedSec = Number(ump.currentTime);
            if (ump.progress != null && !progressPercent) progressPercent = Number(ump.progress) * 100;
            if (isEbookOnly && ump.ebookProgress != null && !progressPercent) progressPercent = Number(ump.ebookProgress) * 100;
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
          // Ebooks have no time axis: show only the percentage, no "0m left".
          rightSideText = isEbookOnly ? '' : (leftSec > 0 ? `${formatTime(leftSec)} ${t.left}` : `0m ${t.left}`);
          if (isEbookOnly && description === t.fallbackDesc) description = t.pickup + '.';

          const tags = [];
          if (durationSec > 0) tags.push(formatTime(durationSec));
          if (isEbookOnly && nhEbookFormat) tags.push(String(nhEbookFormat).toUpperCase());

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

    return { card, title, author, coverUrl, leftSideText, rightSideText, progressPercent, tagsHtml, description, hasAudio, hasEbook };
  }

  function slideMarkup(d, t) {
    return `
      <div class="nh-hero-slide" style="flex: 0 0 100%; min-width: 100%; box-sizing: border-box; display: flex;">
        <div class="nh-hero-banner" style="width: 100%; position: relative; overflow: hidden; background-color: var(--nh-raised); border-radius: 24px; padding: 48px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s ease;">

          <div class="nh-hero-bg" style="position: absolute; inset: -12%; background-image: url('${d.coverUrl}'); background-size: cover; background-position: center; filter: blur(60px) brightness(0.5) saturate(1.4); z-index: 0; pointer-events: none;"></div>
          <div style="position: absolute; inset: 0; background: linear-gradient(110deg, rgba(var(--nh-bg-rgb), 0.92) 0%, rgba(var(--nh-bg-rgb), 0.62) 50%, rgba(var(--nh-bg-rgb), 0.22) 100%); z-index: 1; pointer-events: none;"></div>

          <div style="position: relative; z-index: 2; flex: 1; min-width: 0; padding-right: 64px; display: flex; flex-direction: column;">
            <div style="color: var(--nh-amber); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; font-family: system-ui, sans-serif;">${t.pickup}</div>
            <div class="nh-hero-title" style="font-family: var(--nh-serif); font-size: 3.4rem; font-weight: 600; line-height: 1.2; color: #ffffff; margin-bottom: 8px; padding-bottom: 4px; letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0,0,0,0.5); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 100%;">${d.title}</div>
            <div style="font-size: 1.25rem; color: #d8cfc2; margin-bottom: 20px; font-family: system-ui, sans-serif;">${t.by ? t.by + ' ' : ''}${d.author}</div>

            ${d.tagsHtml ? `<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; font-family: system-ui, sans-serif;">${d.tagsHtml}</div>` : ''}

            <div style="color: #c9bfb1; font-size: 1.15rem; line-height: 1.6; margin-bottom: 32px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; font-family: system-ui, sans-serif; max-width: 90%; text-shadow: 0 1px 8px rgba(0,0,0,0.5);">
              ${d.description}
            </div>

            <div style="display: flex; align-items: center; gap: 32px; font-family: system-ui, sans-serif;">
              ${d.hasAudio ? `<button class="nh-hero-play" style="background: var(--nh-amber); color: #14110d; border: none; border-radius: 12px; padding: 14px 32px; font-size: 1.15rem; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 0 25px var(--nh-amber-shadow);">
                <span class="material-symbols" style="font-size: 1.6rem; color: #14110d;">play_arrow</span> ${t.continue}
              </button>` : ''}
              ${d.hasEbook ? `<button class="nh-hero-read" style="background: var(--nh-amber); color: #14110d; border: none; border-radius: 12px; padding: 14px 32px; font-size: 1.15rem; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 0 25px var(--nh-amber-shadow);">
                <span class="material-symbols" style="font-size: 1.6rem; color: #14110d;">auto_stories</span> ${(window.$nuxt && window.$nuxt.$strings && window.$nuxt.$strings.ButtonRead) || 'Read'}
              </button>` : ''}

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

          <div style="position: relative; z-index: 2; flex-shrink: 0; display: flex; align-items: center;">
            <img src="${d.coverUrl}" style="height: 380px; width: auto; max-width: 420px; object-fit: contain; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6);" />
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Home-page DOM compatibility (ABS home-view modes + newer builds)
  // ------------------------------------------------------------------
  // ABS renders the home shelves in two different ways, and the theme has to work
  // in both — plus stay resilient to newer builds that restructure the card DOM:
  //
  //  • DETAIL view    : each shelf is a `.bookshelf-row` (widgets-item-slider) that
  //                     directly contains its <h2> heading and its cards.
  //  • STANDARD view  : the ABS DEFAULT (skeuomorphic). The card strip carries
  //    (skeuomorphic)   `.bookshelf-row.categorizedBookshelfRow`, but the <h2> lives
  //                     in a SIBLING placard, so `strip.querySelector('h2')` is null.
  //                     The real per-shelf container is the strip's component-root
  //                     parent, which holds both the placard <h2> and the strip; its
  //                     Vue instance also exposes `shelf.id` (continue-listening, …).
  //  • newer builds   : may drop `.bookshelf-row` entirely and expose only
  //                     `[id^="cover-area-"]` cards — derive shelves from headings.
  //
  // The hero + shelf logic below routes every shelf/card lookup through these three
  // helpers so it no longer assumes the DETAIL-view DOM. (Reported by a user on the
  // default STANDARD view: hero carousel never appeared because `.bookshelf-row`
  // rows had no <h2> inside them.)

  // Every card-like element inside a shelf. Tiered so builds that expose BOTH the
  // book-card wrapper AND its inner cover-area don't count each card twice.
  const NH_CARD_SEL = '[cy-id="card"], [id^="book-card-"]';
  function nhCardsIn(root) {
    if (!root) return [];
    let cards = Array.from(root.querySelectorAll(NH_CARD_SEL));
    if (!cards.length) cards = Array.from(root.querySelectorAll('[id^="cover-area-"]'));
    return cards;
  }

  // Stable shelf id from a shelf row's Vue instance, across both home views
  // (DETAIL exposes `shelfId`; STANDARD exposes `shelf.id`).
  function nhShelfId(row) {
    const vm = row && row.__vue__;
    if (!vm) return null;
    return vm.shelfId || (vm.$props && vm.$props.shelfId) || (vm.shelf && vm.shelf.id) || null;
  }

  // The home-page shelf rows: elements that each contain ONE shelf's heading and
  // its cards. Falls through DETAIL → STANDARD → classless newer builds.
  function nhShelfRows() {
    const scope = document.getElementById('bookshelf');
    if (!scope) return [];
    const strips = Array.from(scope.querySelectorAll('.bookshelf-row'));
    if (strips.length) {
      const rows = [];
      strips.forEach(function (strip) {
        let row = strip;
        // STANDARD view: the heading is a sibling placard, so climb to the shelf
        // component root that holds both the <h2> and this strip.
        if (!strip.querySelector('h2')) {
          let p = strip.parentElement, hops = 0;
          while (p && p !== scope && hops < 4) {
            if (p.querySelector('h2')) { row = p; break; }
            p = p.parentElement; hops++;
          }
        }
        if (rows.indexOf(row) === -1) rows.push(row);
      });
      return rows;
    }
    // Newer builds with no `.bookshelf-row` at all: anchor each shelf on its heading
    // and climb to the nearest ancestor that also holds its cards/covers.
    const anyCard = NH_CARD_SEL + ', [id^="cover-area-"]';
    const rows = [];
    scope.querySelectorAll('h2').forEach(function (h2) {
      let el = h2.parentElement, hops = 0, row = null;
      while (el && el !== scope.parentElement && hops < 8) {
        if (el.querySelector(anyCard)) { row = el; break; }
        el = el.parentElement; hops++;
      }
      if (row && rows.indexOf(row) === -1) rows.push(row);
    });
    return rows;
  }

  async function injectHeroBanner() {
    // Toggle off: remove the hero and restore the stock Continue Listening shelf.
    if (nhSettings.showHeroCarousel === false) {
      const ex = document.getElementById('nh-hero-container');
      if (ex) ex.remove();
      document.querySelectorAll('[data-hero-injected="true"]').forEach(function (injectedRow) {
        injectedRow.style.display = '';
        Array.from(injectedRow.children).forEach(c => { if (c.id !== 'nh-hero-container') c.style.display = ''; });
        delete injectedRow.dataset.heroInjected;
      });
      return;
    }
    // Continue Reading shelf handling runs every tick, before any carousel guard:
    // 'hide' hides the whole row; leaving 'hide' restores it (combined rows are
    // restored by the mode-change teardown in applySettings instead).
    const nhFindShelf = function (sid) {
      return nhShelfRows().find(function (r) { return nhShelfId(r) === sid; });
    };
    const crRow = nhFindShelf('continue-reading');
    if (crRow) {
      if (nhSettings.continueReadingMode === 'hide') crRow.style.display = 'none';
      else if (crRow.style.display === 'none' && crRow.dataset.heroInjected !== 'true') crRow.style.display = '';
    }

    if (isInjectingHero || document.getElementById('nh-hero-container')) return;

    // Identify Continue Listening structurally (shelfId prop on the slider's Vue
    // instance) — header-text matching missed languages like Spanish ("Seguir
    // Escuchando"), so the carousel never appeared there. Text match kept as fallback.
    const rows = nhShelfRows();
    const row = rows.find(r => {
      const sid = nhShelfId(r);
      if (sid) return sid === 'continue-listening';
      const h = r.querySelector('h2');
      const txt = h ? h.textContent.trim().toLowerCase() : '';
      return txt.includes('continue') || txt.includes('kontynuuj') || txt.includes('weiter') || txt.includes('continu');
    });
    if (!row || row.dataset.heroInjected === 'true') return;

    let cards = nhCardsIn(row);
    if (!cards.length) return;

    // Combine mode: fold Continue Reading items into the carousel and hide that shelf.
    let crCombined = null;
    if (nhSettings.continueReadingMode === 'combine' && crRow && crRow.dataset.heroInjected !== 'true') {
      const crCards = nhCardsIn(crRow);
      if (crCards.length) {
        cards = cards.concat(crCards);
        crCombined = crRow;
      }
    }
    cards = cards.slice(0, 10);

    isInjectingHero = true;

    let nativeChildren = Array.from(row.children);
    if (crCombined) {
      crCombined.dataset.heroInjected = 'true';
      crCombined.style.display = 'none'; // the emptied row still paints its own box
    }
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
      if (crCombined) { crCombined.style.display = ''; delete crCombined.dataset.heroInjected; }
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
        const banner = el.querySelector('.nh-hero-banner');
        // Programmatic .click() fires handlers even on v-show-hidden elements (the
        // hosting card is itself hidden), so no visibility check — routing by cy-id
        // is what keeps audio and ebook actions apart.
        const clickNative = function (sel) {
          const host = card.querySelector(sel);
          if (!host) return false;
          const b = host.querySelector('.pointer-events-auto') || host.querySelector('div, button') || host;
          b.click();
          return true;
        };
        const wireBtn = function (btn, sel) {
          if (!btn) return;
          btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.03)');
          btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!clickNative(sel)) card.click();
          });
        };
        wireBtn(el.querySelector('.nh-hero-play'), '[cy-id="playButton"]');
        wireBtn(el.querySelector('.nh-hero-read'), '[cy-id="readButton"]');

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
    return nhShelfRows().find(r => {
      if (nhShelfId(r) === 'recent-series') return true;
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
        ? cv.map((url, i) => `<div class="nh-rs-cover ${layers[i]}"><i class="nh-rs-bg" style="background-image:url('${url}${tq}')"></i><i class="nh-rs-fg" style="background-image:url('${url}${tq}')"></i></div>`).join('')
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
      #nh-recent-series-row .nh-rs-cover { position: absolute; top: 0; left: 0; width: var(--nh-rs-cw, 140px); height: var(--nh-rs-cw, 140px); border-radius: 12px; overflow: hidden; background-color: var(--nh-raised); box-shadow: 0 10px 24px rgba(0,0,0,0.42); transition: filter .2s ease, box-shadow .2s ease; }
      #nh-recent-series-row .nh-rs-bg, #nh-recent-series-row .nh-rs-fg { position: absolute; inset: 0; display: block; background-position: center; background-repeat: no-repeat; border-radius: inherit; }
      #nh-recent-series-row .nh-rs-bg { background-size: cover; filter: blur(14px) brightness(0.85); transform: scale(1.15); }
      #nh-recent-series-row .nh-rs-fg { background-size: contain; }
      html.nh-covers-std #nh-recent-series-row .nh-rs-covers { height: calc(var(--nh-rs-cw, 140px) * 1.6); }
      html.nh-covers-std #nh-recent-series-row .nh-rs-cover { height: calc(var(--nh-rs-cw, 140px) * 1.6); }
      #nh-recent-series-row .nh-rs-cover.c1 { transform: translate(0,0); z-index: 3; }
      #nh-recent-series-row .nh-rs-cover.c2 { transform: translate(calc(var(--nh-rs-cw, 140px) * 0.086), calc(var(--nh-rs-cw, 140px) * 0.086)); z-index: 2; filter: brightness(0.78); }
      #nh-recent-series-row .nh-rs-cover.c3 { transform: translate(calc(var(--nh-rs-cw, 140px) * 0.171), calc(var(--nh-rs-cw, 140px) * 0.171)); z-index: 1; filter: brightness(0.60); }
      #nh-recent-series-row .nh-rs-card:hover .nh-rs-cover.c1 { filter: brightness(0.7); box-shadow: 0 10px 24px rgba(0,0,0,0.42); }
      #nh-recent-series-row .nh-rs-count { position: absolute; left: 8px; top: 8px; z-index: 5; background: rgba(255,255,255,0.55); backdrop-filter: blur(10px) brightness(1.2) saturate(1.05); -webkit-backdrop-filter: blur(10px) brightness(1.2) saturate(1.05); border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 2px 8px rgba(0,0,0,0.4); border-radius: 999px; min-width: 1.7em; text-align: center; padding: 0.12em 0.45em; color: #000; font-weight: 700; font-size: clamp(8px, calc(var(--nh-rs-cw, 140px) * 0.078), 12.5px); font-family: var(--nh-sans, system-ui); }
      #nh-recent-series-row .nh-rs-name { font-family: var(--nh-serif) !important; font-weight: 500; color: var(--nh-text-2, #d8cfc2); font-size: var(--nh-rs-fs, 1rem); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    `;
    document.head.appendChild(s);
  }

  function nhRouterPush(route) {
    // Page-world path: direct router access (proxy injection, userscript in page context).
    try { if (window.$nuxt && window.$nuxt.$router) { window.$nuxt.$router.push(route); return true; } } catch (e) {}
    try {
      const app = document.getElementById('__layout') || document.getElementById('__nuxt');
      const vue = app && (app.__vue__ || (app.firstElementChild && app.firstElementChild.__vue__));
      if (vue && vue.$router) { vue.$router.push(route); return true; }
    } catch (e) {}
    // Isolated-world path (Chrome content script): window.$nuxt is unreachable, so drive
    // Vue Router through the History API. It listens for popstate and navigates
    // client-side without a full reload — so the media player survives.
    try {
      const base = getBaseNH().replace(/\/$/, '');
      const url = base + route;
      if (window.history && typeof window.history.pushState === 'function') {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        return true;
      }
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
      if (!homeOk || !nhSettings.showCustomRecentSeries || nhSettings.customSeriesCards === false || nhSettings.hideHomeRecentSeries) {
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
          const sib = nativeRow || nhShelfRows().find(r => r.id !== 'nh-recent-series-row');
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
        const sib = nativeRow || nhShelfRows().find(r => r.id !== 'nh-recent-series-row');
        if (sib) { const cs = getComputedStyle(sib); row.style.paddingLeft = cs.paddingLeft; row.style.paddingRight = cs.paddingRight; }
      } catch (e) {}

      // Navigation is handled by a single delegated listener (nhBindRecentSeriesNav),
      // not per-card handlers — the row's innerHTML is rebuilt on data changes, which
      // would strip listeners bound to individual <a> elements and let the browser
      // follow the raw href, reloading the page and killing playback.
      nhBindRecentSeriesNav();
    } catch (e) {}
  }

  // One capture-phase listener on a stable ancestor. Intercepts clicks on any current
  // or future .nh-rs-card and routes them client-side, so the media player survives.
  // Tagged on the node itself (not a module flag) so it re-binds if #bookshelf is
  // replaced on library switches.
  function nhBindRecentSeriesNav() {
    const host = document.getElementById('bookshelf');
    if (!host || host.dataset.nhRsNav === '1') return;
    host.dataset.nhRsNav = '1';
    host.addEventListener('click', (e) => {
      const card = e.target.closest && e.target.closest('.nh-rs-card');
      if (!card) return;
      const rt = card.getAttribute('data-route');
      if (rt && nhRouterPush(rt)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
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
    if (nhSettings.customSeriesCards === false) return;
    const store = window.$nuxt && window.$nuxt.$store;
    if (!store) return;
    let m;
    try { m = store.getters['user/getSizeMultiplier']; } catch (e) { return; }
    if (typeof m !== 'number' || !(m > 0.05) || !(m < 10)) return;
    // 1.6:1 mode grows tile heights x1.6, so shrink the base scale to keep the
    // stacked cards' footprint close to the stock series cards at the same slider.
    const s = m * (document.documentElement.classList.contains('nh-covers-std') ? 0.85 : 1.2);
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

  // Mark <html> when the current library prefers standard 1.6:1 covers, so CSS can
  // adapt card typography per mode. Getter returns 1.6 or 1 (square).
  function nhCoverModeClass() {
    let r = 1;
    try { r = window.$nuxt.$store.getters['libraries/getBookCoverAspectRatio'] || 1; } catch (e) { return; }
    const want = r > 1;
    if (document.documentElement.classList.contains('nh-covers-std') !== want) {
      document.documentElement.classList.toggle('nh-covers-std', want);
    }
  }

  // Tag finished covers. Anchored on [id^="cover-area-"], the progressBar's real
  // positioned ancestor — book cards on this build don't carry cy-id="card", which is
  // why the previous card-anchored tagger matched nothing. bg-success is confirmed
  // present on finished bars (user-supplied DOM), so the class check is sufficient
  // and needs no Vue access (works from extensions too).
  function nhTagFinished() {
    document.querySelectorAll('[cy-id="progressBar"]').forEach((p) => {
      const host = p.closest('[id^="cover-area-"]') || p.closest('[cy-id="card"]');
      if (host) host.classList.toggle('nh-finished', p.classList.contains('bg-success'));
    });
  }

  // Series detail page header: series name, authors, count · duration, and the
  // description of book #1 (smallest whole sequence ≥ 1; 0.x novellas lose to real
  // entries; fractional beats none). Data read straight from the bookshelf vm's
  // loaded entities — no extra API call. Idempotent: updates in place each cycle.
  function nhSeriesHeader() {
    const onSeries = /\/library\/[^/]+\/series\/[^/?#]+/.test(location.pathname);
    const bookshelf = document.getElementById('bookshelf');
    const existing = document.getElementById('nh-series-header');
    if (!onSeries || !bookshelf) {
      if (existing) {
        const par = existing.parentNode;
        existing.remove();
        if (par && par.classList) par.classList.remove('nh-series-cols');
      }
      if (bookshelf) {
        bookshelf.classList.remove('nh-with-series-header');
        if (bookshelf.parentNode && bookshelf.parentNode.classList) bookshelf.parentNode.classList.remove('nh-series-cols');
      }
      document.documentElement.style.removeProperty('--nh-sh-h');
      document.body.classList.remove('nh-series-page');
      return;
    }
    const vm = bookshelf.__vue__;
    const ents = vm && Array.isArray(vm.entities) ? vm.entities.filter(Boolean) : [];
    if (!ents.length) return;

    let seriesName = '', best = null, bestScore = Infinity, dur = 0;
    const authors = [];
    ents.forEach((e) => {
      const md = (e.media && e.media.metadata) || {};
      if (e.media && e.media.duration) dur += e.media.duration;
      if (md.authorName && authors.indexOf(md.authorName) === -1) authors.push(md.authorName);
      const se = md.series;
      if (se && se.name && !seriesName) seriesName = se.name;
      const q = se ? parseFloat(se.sequence) : NaN;
      // integer ≥1 scores its own value (1 wins), fractional ≥1 after all integers,
      // sub-1 novellas after those, sequence-less last
      const score = isFinite(q) ? (q >= 1 ? (Number.isInteger(q) ? q : q + 1000) : q + 2000) : 3000;
      if (score < bestScore) { bestScore = score; best = e; }
    });

    let desc = '';
    try {
      const raw = best && best.media && best.media.metadata && best.media.metadata.description;
      if (raw) { const t = document.createElement('div'); t.innerHTML = raw; desc = (t.textContent || '').trim(); }
    } catch (e) {}

    const total = (vm.totalEntities && vm.totalEntities > ents.length) ? vm.totalEntities : ents.length;
    const allLoaded = !vm.totalEntities || ents.length >= vm.totalEntities;
    const durStr = allLoaded && dur > 60 ? Math.floor(dur / 3600) + 'h ' + Math.round((dur % 3600) / 60) + 'm' : '';
    const authStr = authors.slice(0, 2).join(', ') + (authors.length > 2 ? ' & more' : '');
    const authorLine = authStr ? 'by ' + authStr : '';
    const statsLine = [total + (total === 1 ? ' book' : ' books'), durStr].filter(Boolean).join(' · ');

    let h = existing;
    if (!h) {
      h = document.createElement('div');
      h.id = 'nh-series-header';
      h.innerHTML = '<div class="nh-sh-eyebrow">Series</div><h1></h1><div class="nh-sh-author"></div><div class="nh-sh-stats"></div><p class="nh-sh-desc"></p>';
      bookshelf.parentNode.insertBefore(h, bookshelf);
    }
    const set = (sel, txt) => { const el = h.querySelector(sel); if (el && el.textContent !== txt) el.textContent = txt; };
    set('h1', seriesName);
    set('.nh-sh-author', authorLine);
    set('.nh-sh-stats', statsLine);
    set('.nh-sh-desc', desc);
    h.querySelector('.nh-sh-desc').style.display = desc ? '' : 'none';
    bookshelf.classList.add('nh-with-series-header');
    document.body.classList.add('nh-series-page');
    if (bookshelf.parentNode && bookshelf.parentNode.classList) bookshelf.parentNode.classList.add('nh-series-cols');
    document.documentElement.style.setProperty('--nh-sh-h', h.offsetHeight + 'px');

    // Entering the two-column layout changes #bookshelf's width, but ABS only re-measures
    // on real window resizes or settings changes — nudge one setCardSize + rebuild per route.
    if (h.dataset.nudged !== location.pathname) {
      h.dataset.nudged = location.pathname;
      setTimeout(() => {
        try {
          const vm2 = bookshelf.__vue__;
          if (vm2 && typeof vm2.setCardSize === 'function') {
            Promise.resolve(vm2.setCardSize()).then(() => { if (typeof vm2.executeRebuild === 'function') vm2.executeRebuild(); }).catch(() => {});
          }
        } catch (e) {}
      }, 80);
    }
  }

  // ===================== EREADER CUSTOMIZATION =====================
  // Extends ABS's epub reader (settings modal + rendition). Facts from ABS source:
  // #viewer hosts the epub.js rendition (EpubReader.vue); ABS applies its colour theme
  // via contents.addStylesheetRules and RE-APPLIES on every settings change, so our
  // rules must land after — applyTheme is patched to chain our pass. Fonts are set via
  // rendition.themes.font(), and the font files must be loaded INSIDE the iframe, so a
  // content hook injects a Google Fonts stylesheet into each rendered chapter.
  const NH_ER_FONTS_SERIF = ['Literata', 'Merriweather', 'Lora', 'EB Garamond', 'Crimson Pro'];
  const NH_ER_FONTS_SANS = ['Atkinson Hyperlegible', 'Inter', 'Source Sans 3', 'Nunito Sans', 'Lexend'];
  const NH_ER_FONTS_DYS = ['OpenDyslexic'];
  // Google Fonts only — OpenDyslexic loads from fontsource (not on Google Fonts)
  const NH_EREADER_FONTS = NH_ER_FONTS_SERIF.concat(NH_ER_FONTS_SANS);
  const NH_DYS_CSS = 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5/index.css';
  function nhFontGeneric(f) { return NH_ER_FONTS_SERIF.indexOf(f) !== -1 ? 'serif' : 'sans-serif'; }
  // ABS's own Dark/Sepia/Light are folded in as presets (its Theme row is hidden by the
  // modal builder) so there is ONE colour control. They're implemented as overlay rules
  // with the exact ABS colours, so the underlying ABS theme state never fights us.
  // 'dark' is the neutral state and stores as '' (no overlay at all).
  const NH_EREADER_PAGES = {
    dark:     { label: 'Dark',     fg: '#ffffff', bg: function () { return '#232323'; } },
    sepia:    { label: 'Sepia',    fg: '#5b4636', bg: function () { return '#f4ecd8'; } },
    light:    { label: 'Light',    fg: '#000000', bg: function () { return '#ffffff'; } },
    nanohive: { label: 'Theme', fg: function () { try { const v = getComputedStyle(document.documentElement).getPropertyValue('--nh-text-1').trim(); return v || '#e8e0d2'; } catch (e) { return '#e8e0d2'; } }, bg: function () { try { const v = getComputedStyle(document.documentElement).getPropertyValue('--nh-canvas').trim(); return v || '#181512'; } catch (e) { return '#181512'; } } },
    black:    { label: 'Black',    fg: '#c9c2b6', bg: function () { return '#000000'; } },
    paper:    { label: 'Paper',    fg: '#2e2a24', bg: function () { return '#f7f3ea'; } }
  };

  function nhEreaderGet(k) { try { return (JSON.parse(localStorage.getItem('nh-settings') || '{}') || {})[k] || ''; } catch (e) { return ''; } }
  function nhEreaderSet(k, v) {
    try {
      const s = JSON.parse(localStorage.getItem('nh-settings') || '{}') || {};
      s[k] = v; localStorage.setItem('nh-settings', JSON.stringify(s));
    } catch (e) {}
  }

  function nhFindEpubVm() {
    let el = document.getElementById('viewer');
    while (el) { if (el.__vue__ && el.__vue__.rendition) return el.__vue__; el = el.parentElement; }
    return null;
  }

  function nhPresetFg(p) { return typeof p.fg === 'function' ? p.fg() : p.fg; }
  function nhEreaderEff() {
    // Unset = follow the active NanoHive theme (item: theme colours are the ereader default)
    const preset = NH_EREADER_PAGES[nhEreaderGet('ereaderPage') || 'nanohive'];
    return {
      font: nhEreaderGet('ereaderFont'),
      fg: nhEreaderGet('ereaderFg') || (preset ? nhPresetFg(preset) : ''),
      bg: nhEreaderGet('ereaderBg') || (preset ? preset.bg() : '')
    };
  }

  function nhDecorateContents(c) {
    const eff = nhEreaderEff();
    try { if (eff.font) c.addStylesheet(eff.font === 'OpenDyslexic' ? NH_DYS_CSS : 'https://fonts.googleapis.com/css2?family=' + eff.font.replace(/ /g, '+') + ':ital,wght@0,400;0,700;1,400&display=swap'); } catch (e) {}
    if (eff.fg || eff.bg) {
      const all = {}, links = {};
      if (eff.fg) { all.color = eff.fg + '!important'; links.color = eff.fg + '!important'; }
      if (eff.bg) { all['background-color'] = eff.bg + '!important'; }
      try { c.addStylesheetRules({ '*': all, a: links }); } catch (e) {}
    }
  }

  // The reader shell (#reader) around the pages carries ABS's data-theme background;
  // painted to match the effective page colour so the surround never mismatches.
  function nhPaintShell() {
    const r = document.getElementById('reader');
    if (!r) return;
    const eff = nhEreaderEff();
    if (eff.bg) {
      r.style.setProperty('background-color', eff.bg, 'important');
      if (eff.fg) r.style.setProperty('color', eff.fg, 'important');
    } else {
      r.style.removeProperty('background-color');
      r.style.removeProperty('color');
    }
  }

  function nhApplyEreader() {
    const vm = nhFindEpubVm();
    if (!vm || !vm.rendition) return;
    const rend = vm.rendition;
    if (!rend.__nhHook) {
      rend.__nhHook = true;
      try { rend.hooks.content.register(function (c) { nhDecorateContents(c); }); } catch (e) {}
    }
    if (!vm.__nhPatched && typeof vm.applyTheme === 'function') {
      vm.__nhPatched = true;
      const orig = vm.applyTheme.bind(vm);
      // ABS re-applies its theme on EVERY settings change (incl. font-size/spacing),
      // which resets rendition.themes.font() back to ABS's font. Re-assert ours after
      // orig() so a size change no longer wipes the reader's chosen NanoHive font.
      vm.applyTheme = function () {
        orig();
        try { const e2 = nhEreaderEff(); if (e2.font) rend.themes.font('"' + e2.font + '", ' + nhFontGeneric(e2.font)); } catch (e) {}
        try { rend.getContents().forEach(nhDecorateContents); } catch (e) {}
      };
    }
    const eff = nhEreaderEff();
    try {
      if (eff.font) rend.themes.font('"' + eff.font + '", ' + nhFontGeneric(eff.font));
      else if (vm.ereaderSettings && vm.ereaderSettings.font) rend.themes.font(vm.ereaderSettings.font);
    } catch (e) {}
    // ABS pass first (restores stock when everything is Default), ours chained after
    try { vm.applyTheme(); } catch (e) {}
    nhPaintShell();
  }

  function nhEreaderFontsLink() {
    if (document.getElementById('nh-er-fonts')) return;
    const l = document.createElement('link');
    l.id = 'nh-er-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + NH_EREADER_FONTS.map(function (f) { return 'family=' + f.replace(/ /g, '+') + ':wght@400;600'; }).join('&') + '&display=swap';
    if (!document.getElementById('nh-er-dys-css')) {
      const d = document.createElement('link');
      d.id = 'nh-er-dys-css'; d.rel = 'stylesheet'; d.href = NH_DYS_CSS;
      document.head.appendChild(d);
    }
    document.head.appendChild(l);
  }

  const NH_ER_FG_SWATCHES = ['#ffffff', '#e8e0d2', '#c9c2b6', '#5b4636', '#2e2a24', '#000000'];
  const NH_ER_BG_SWATCHES = ['#232323', '#181512', '#0b1618', '#000000', '#f4ecd8', '#f7f3ea', '#ffffff'];
  const NH_ER_SAMPLE = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs \u2014 0123456789. She said, \u201cReading should feel effortless.\u201d';

  // Keeps the preview live against ABS's own sliders (scale, spacing, boldness) —
  // called every mutation cycle, cheap no-op when the preview isn't on screen.
  function nhEreaderPreviewSync() {
    const prev = document.getElementById('nh-er-preview');
    if (!prev) return;
    const vm = nhFindEpubVm();
    const s = (vm && vm.ereaderSettings) || {};
    const eff = nhEreaderEff();
    const fg = eff.fg || '#ffffff';
    prev.style.fontFamily = eff.font ? '"' + eff.font + '", ' + nhFontGeneric(eff.font) : ((s.font === 'sans') ? 'ui-sans-serif, system-ui, sans-serif' : 'Georgia, serif');
    prev.style.color = fg;
    prev.style.background = eff.bg || '#232323';
    const fs = (s.fontScale || 100) / 100;
    const ls = (s.lineSpacing || 115) / 100;
    const ts = (s.textStroke || 0) / 100;
    prev.style.fontSize = (fs * 16) + 'px';
    prev.style.lineHeight = (ls * fs) + 'rem';
    prev.style.webkitTextStroke = ts + 'px ' + fg;
    nhPaintShell();
  }

  function nhEreaderModal() {
    // Anchor on ABS's Sans/Serif toggle buttons — they're hardcoded untranslated in
    // ABS source, so this works in every UI language (the old 'Theme:' text anchor
    // broke the whole extension on non-English UIs).
    const fontBtn = Array.prototype.find.call(document.querySelectorAll('button.toggle-btn'), function (b) { return b.textContent.trim() === 'Serif'; });
    if (!fontBtn) return;
    const card = fontBtn.closest('div.bg-bg') || fontBtn.closest('.rounded-lg');
    if (!card || card.dataset.nhExt) return;
    card.dataset.nhExt = '1';
    nhEreaderFontsLink();

    // ABS's Theme row (first row) is superseded by our Page theme presets, and its
    // Sans/Serif toggle by our full typeface dropdown — one control each, not two.
    const absRows = card.querySelectorAll('.flex.items-center');
    if (absRows[0]) absRows[0].style.display = 'none';
    const absFontRow = fontBtn.closest('.flex.items-center');
    if (absFontRow) absFontRow.style.display = 'none';

    const rebuild = function () {
      delete card.dataset.nhExt;
      const p0 = document.getElementById('nh-er-preview'); if (p0) p0.remove();
      const s0 = card.querySelector('.nh-er'); if (s0) s0.remove();
      nhEreaderModal();
      nhApplyEreader();
    };
    const pick = function (key, val) { nhEreaderSet(key, val); rebuild(); };

    // Live sample at the very top of the modal
    const prev = document.createElement('div');
    prev.id = 'nh-er-preview';
    prev.className = 'nh-er-preview';
    prev.innerHTML = '<span class="nh-er-aa">Aa</span>' + NH_ER_SAMPLE;
    card.insertBefore(prev, card.firstChild);

    const sec = document.createElement('div');
    sec.className = 'nh-er';
    sec.appendChild(Object.assign(document.createElement('div'), { className: 'nh-er-sep' }));
    const title = document.createElement('p');
    title.className = 'nh-er-title'; title.textContent = 'NanoHive';
    sec.appendChild(title);

    const row = function (labelText, ctlChildren) {
      const r = document.createElement('div');
      r.className = 'nh-er-row';
      const lab = document.createElement('div');
      lab.className = 'nh-er-lab';
      lab.innerHTML = '<p class="text-lg">' + labelText + '</p>';
      const ctl = document.createElement('div');
      ctl.className = 'nh-er-ctl';
      ctlChildren.forEach(function (ch) { ctl.appendChild(ch); });
      r.appendChild(lab); r.appendChild(ctl);
      return r;
    };
    const chip = function (text, sel, onClick, styler) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nh-er-chip' + (sel ? ' sel' : '');
      b.textContent = text;
      if (styler) styler(b);
      b.addEventListener('click', onClick);
      return b;
    };
    const swatch = function (color, sel, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nh-er-swatch' + (sel ? ' sel' : '');
      b.style.background = color;
      b.title = color;
      b.addEventListener('click', onClick);
      return b;
    };
    const colorInput = function (cur, onPick) {
      const i = document.createElement('input');
      i.type = 'color'; i.className = 'nh-er-color';
      i.value = /^#[0-9a-f]{6}$/i.test(cur) ? cur : '#e0c27a';
      i.addEventListener('change', function () { onPick(i.value); });
      return i;
    };

    const curFont = nhEreaderGet('ereaderFont');
    const fontSel = document.createElement('select');
    fontSel.className = 'nh-er-select';
    const defOpt = document.createElement('option');
    defOpt.value = ''; defOpt.textContent = 'Default (ABS)';
    fontSel.appendChild(defOpt);
    [['Serif', NH_ER_FONTS_SERIF], ['Sans serif', NH_ER_FONTS_SANS], ['Dyslexia friendly', NH_ER_FONTS_DYS]].forEach(function (grp) {
      const og = document.createElement('optgroup');
      og.label = grp[0];
      grp[1].forEach(function (f) {
        const o = document.createElement('option');
        o.value = f; o.textContent = f;
        o.style.fontFamily = '"' + f + '", ' + nhFontGeneric(f);
        og.appendChild(o);
      });
      fontSel.appendChild(og);
    });
    fontSel.value = curFont || '';
    if (curFont) fontSel.style.fontFamily = '"' + curFont + '", ' + nhFontGeneric(curFont);
    fontSel.addEventListener('change', function () { pick('ereaderFont', fontSel.value); });
    sec.appendChild(row('Typeface', [fontSel]));

    const curPage = nhEreaderGet('ereaderPage');
    const hasCustom = !!(nhEreaderGet('ereaderFg') || nhEreaderGet('ereaderBg'));
    sec.appendChild(row('Page theme', Object.keys(NH_EREADER_PAGES).map(function (k) {
      const p = NH_EREADER_PAGES[k];
      const sel = !hasCustom && (curPage === k || (!curPage && k === 'nanohive'));
      return chip(p.label, sel, function () {
        nhEreaderSet('ereaderPage', k === 'nanohive' ? '' : k);
        nhEreaderSet('ereaderFg', ''); nhEreaderSet('ereaderBg', '');
        rebuild();
      }, function (b) { b.classList.add('nh-er-tile'); b.style.background = p.bg(); b.style.color = nhPresetFg(p); b.style.borderColor = 'rgba(255,255,255,0.35)'; });
    })));

    const curFg = nhEreaderGet('ereaderFg');
    sec.appendChild(row('Text colour', [chip('Auto', !curFg, function () { pick('ereaderFg', ''); })].concat(
      NH_ER_FG_SWATCHES.map(function (cc) { return swatch(cc, curFg.toLowerCase() === cc, function () { pick('ereaderFg', cc); }); }),
      [colorInput(curFg, function (v) { pick('ereaderFg', v); })]
    )));
    const curBg = nhEreaderGet('ereaderBg');
    sec.appendChild(row('Background', [chip('Auto', !curBg, function () { pick('ereaderBg', ''); })].concat(
      NH_ER_BG_SWATCHES.map(function (cc) { return swatch(cc, curBg.toLowerCase() === cc, function () { pick('ereaderBg', cc); }); }),
      [colorInput(curBg, function (v) { pick('ereaderBg', v); })]
    )));

    card.appendChild(sec);
    nhEreaderPreviewSync();
  }

  function nhEreader() {
    const vm = nhFindEpubVm();
    if (vm && vm.rendition && !vm.rendition.__nhInit) { vm.rendition.__nhInit = true; nhApplyEreader(); }
    nhEreaderModal();
  }

  // Version footer at the bottom of the library sidebar rail (and mobile drawer).
  // ABS 2.35+ moved its version link into a hidden changelog modal, so users lost the
  // at-a-glance "what am I running" readout. Restore it and add the theme version.
  // Bump NH_THEME_VERSION on each release (the composite THEME_VERSION from NH_CONFIG is
  // shown on hover for exact per-file versions).
  const NH_THEME_VERSION = 'v1.8.0';
  function nhAbsVersion() {
    try {
      const v = window.$nuxt && window.$nuxt.$store && window.$nuxt.$store.state.serverSettings && window.$nuxt.$store.state.serverSettings.version;
      if (v) return String(v).replace(/^v?/, 'v');
    } catch (e) {}
    const a = document.querySelector('a[href*="/releases/tag/v"]');
    if (a) { const m = a.textContent.trim().match(/\d+\.\d+\.\d+/); if (m) return 'v' + m[0]; }
    return '';
  }
  function nhVersionFooterMarkup(f) {
    const abs = nhAbsVersion();
    const composite = (window.NH_CONFIG && window.NH_CONFIG.themeVersion) || '';
    f.title = composite ? 'NanoHive theme build: ' + composite : '';
    if (f.dataset.v === abs) return;
    f.dataset.v = abs;
    f.innerHTML = `<div style="opacity:.85;">Audiobookshelf${abs ? ' ' + abs : ''}</div>` +
                  `<div style="margin-top:2px;color:var(--nh-amber);opacity:.8;">NanoHive ${NH_THEME_VERSION}</div>`;
  }
  function nhVersionFooter() {
    // Desktop rail: append inside it and pin to the viewport's bottom-left. Because it
    // lives inside the rail (display:none on mobile via `hidden md:block`), it auto-hides
    // on mobile — where we instead drop a copy into the slide-out drawer (below).
    const rail = document.querySelector('[aria-label="Library Sidebar"]');
    if (rail) {
      let f = rail.querySelector('#nh-version-footer');
      if (!f) {
        f = document.createElement('div');
        f.id = 'nh-version-footer';
        f.style.cssText = 'position:fixed;bottom:0;left:0;width:80px;box-sizing:border-box;padding:10px 4px;text-align:center;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:0.6rem;line-height:1.35;color:var(--nh-muted-2);pointer-events:none;z-index:50;';
        rail.appendChild(f);
      }
      nhVersionFooterMarkup(f);
    }
    // Mobile drawer (#nh-mobile-drawer is a flex column) — pin a footer to its bottom.
    const drawer = document.getElementById('nh-mobile-drawer');
    if (drawer) {
      let df = drawer.querySelector('#nh-version-footer-mobile');
      if (!df) {
        df = document.createElement('div');
        df.id = 'nh-version-footer-mobile';
        df.style.cssText = 'margin-top:auto;padding:16px 8px 6px;text-align:center;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:0.7rem;line-height:1.4;color:var(--nh-muted-2);';
        drawer.appendChild(df);
      }
      nhVersionFooterMarkup(df);
    }
  }

  function runMutations() {
    const safe = (fn) => { try { fn(); } catch (e) { /* one failure must not block the rest */ } };
    safe(nhVersionFooter);
    safe(nhSeriesScale);
    safe(nhCoverModeClass);
    safe(nhSeriesHeader);
    safe(nhTagFinished);
    safe(nhEreader);
    safe(nhEreaderPreviewSync);
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