/* NanoHive ABS — Book Details Redesign  v1.19.0  (injected build) */

(function () {
  'use strict';

  // ==========================================
  // 1. CSS INJECTION (Page Layout & Cinematic BG)
  // ==========================================
  const css = `
    /* CINEMATIC BACKGROUND */
    #page-wrapper.nh-cinematic-mode,
    #page-wrapper.nh-cinematic-mode > #item-page-wrapper {
        background-color: transparent !important;
    }

    #nh-cinematic-bg {
        position: fixed !important;
        top: -10%; left: -10%; right: -10%; bottom: -10%;
        z-index: 0 !important;
        background-size: cover !important;
        background-position: center !important;
        background-color: transparent !important; /* Prevents Script 1 from painting it black */
        filter: blur(60px) brightness(0.5) saturate(1.4) !important;
        pointer-events: none !important;
        opacity: 0;
        transition: opacity 0.8s ease !important;
    }

    #nh-cinematic-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(20,17,13,0.1) 0%, rgba(20,17,13,0.6) 45%, #14110d 90%) !important;
    }

    #item-page-wrapper > div {
        position: relative;
        z-index: 10; /* Keeps content layered above the background */
    }

    /* Expand the page width for a cinematic look */
    #item-page-wrapper > div.flex.flex-col.lg\\:flex-row {
        max-width: min(96%, 1600px) !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    /* Left Column: cover, plus the metadata grid on desktop (the relocation JS moves it
       here above 1024px and back above the description below that, where this column
       collapses). Direction/display stay on at every width so a lone cover still centers;
       only the desktop sidebar WIDTH is gated to ABS's own lg:flex-row breakpoint. */
    #item-page-wrapper > div.flex > div:first-child {
        display: flex !important;
        flex-direction: column !important;
        align-self: flex-start !important;
    }
    @media (min-width: 1024px) {
      #item-page-wrapper > div.flex > div:first-child {
          min-width: min(420px, 35vw) !important;
          width: min(420px, 35vw) !important;
          margin-right: 5vw !important;
      }
      /* Metadata sits under the cover here, not above the description, so it gets a
         narrower grid and a hairline that reads as "attached to the cover". */
      #item-page-wrapper > div.flex > div:first-child .nh-metadata-container {
          width: 100% !important;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
          margin-top: 24px !important;
          padding-top: 24px !important;
          row-gap: 16px !important;
      }
    }

    #item-page-wrapper > div.flex > div:first-child .relative.rounded-xs {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        aspect-ratio: 1 / 1;
        border-radius: 20px !important;
        box-shadow: 0 30px 60px rgba(0,0,0,0.6) !important;
        cursor: zoom-in !important;
    }

    #item-page-wrapper img[cy-id="coverImage"],
    #item-page-wrapper > div.flex > div:first-child img {
        border-radius: 20px !important;
        object-fit: cover !important;
        height: 100% !important;
        width: 100% !important;
    }

    /* Hide native cover overlays.
       Progress bar: ABS hardcodes its width to 208px, so on the resized detail cover it
       renders as a stray ~half-width stub. Target it by position (bottom-0 left-0 h-1.5),
       NOT colour, so both the in-progress (bg-yellow-400) and finished (bg-success)
       variants go. It stays in the DOM (display:none), so its class is still readable for
       #nh-finished-badge detection below. Also hides the hover/edit overlay. */
    #item-page-wrapper > div.flex > div:first-child .absolute.bottom-0.left-0.h-1\\.5,
    #item-page-wrapper > div.flex > div:first-child .group-hover\\:opacity-100 {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
    }

    /* Finished indicator: frosted circular checkmark, top-right of the cover.
       Injected by JS (section 4) when the hidden native bar carries bg-success. */
    #nh-finished-badge {
        position: absolute !important;
        top: 14px !important;
        right: 14px !important;
        z-index: 20 !important;
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(20, 17, 13, 0.35) !important;
        backdrop-filter: blur(12px) saturate(1.3) !important;
        -webkit-backdrop-filter: blur(12px) saturate(1.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.22) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important;
        pointer-events: none !important;
    }
    #nh-finished-badge .material-symbols {
        font-size: 26px !important;
        line-height: 1 !important;
        color: var(--nh-amber, #e0c27a) !important;
        font-variation-settings: 'wght' 700 !important;
        text-shadow: 0 0 10px var(--nh-amber-shadow, rgba(224, 194, 122, 0.30)) !important;
    }

    /* Metadata Container */
    .nh-metadata-container {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
        row-gap: 20px !important;
        column-gap: 16px !important;
        margin-top: 32px !important;
        padding-top: 32px !important;
        border-top: 1px solid rgba(255,255,255,0.08) !important;
        align-items: flex-start !important;
    }
    .nh-metadata-container .flex.py-0\\.5 {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        padding: 0 !important;
        margin-top: 0 !important;
    }
    .nh-metadata-container .flex.py-0\\.5 > div:first-child {
        width: auto !important;
        min-width: 0 !important;
        margin-bottom: 4px !important;
    }
    .nh-metadata-container .flex.py-0\\.5 > div:first-child span {
        font-size: 0.75rem !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        color: #8a8075 !important;
        font-family: system-ui, sans-serif !important;
    }
    .nh-metadata-container .flex.py-0\\.5 > div:last-child {
        font-size: 0.95rem !important;
        color: #d8cfc2 !important;
        white-space: normal !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
        line-height: 1.4 !important;
    }
    .nh-metadata-container .flex.py-0\\.5 > div:last-child a {
        color: #f4eee2 !important;
    }

    /* Right Column: Title and Header Typography */
    #item-page-wrapper h1 {
        font-family: 'Spectral', serif !important;
        font-size: 3.6rem !important;
        font-weight: 500 !important;
        line-height: 1.1 !important;
        letter-spacing: -0.01em !important;
        margin-bottom: 12px !important;
        color: #ffffff !important;
    }
    #item-page-wrapper h1 + p {
        font-size: 1.5rem !important;
        color: #d8cfc2 !important;
        margin-bottom: 12px !important;
    }
    #item-page-wrapper p.mb-2 {
        font-size: 1.25rem !important;
        color: #9a9085 !important;
    }
    #item-page-wrapper p.mb-2 a {
        color: #f4eee2 !important;
    }

    /* Hide Native Progress Block */
    #item-page-wrapper .bg-primary.max-w-max[data-replaced="true"] {
        display: none !important;
    }

    /* Action Buttons Restyling */
    #item-page-wrapper [class*="pt-4 flex"],
    #item-page-wrapper .flex.items-center.justify-center.md\\:justify-start.pt-4 {
        gap: 12px !important;
        padding-top: 0 !important;
        margin-bottom: 48px !important;
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
    }
    #item-page-wrapper [class*="pt-4 flex"] > button,
    #item-page-wrapper [class*="pt-4 flex"] > div,
    #item-page-wrapper .flex.items-center.justify-center.md\\:justify-start.pt-4 > button,
    #item-page-wrapper .flex.items-center.justify-center.md\\:justify-start.pt-4 > div {
        margin: 0 !important;
    }

    #item-page-wrapper .flex.items-center.justify-center.md\\:justify-start.pt-4 > div.relative {
        width: 48px !important;
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }

    #item-page-wrapper .icon-btn {
        background-color: transparent !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        border-radius: 12px !important;
        width: 48px !important;
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    #item-page-wrapper .icon-btn:hover {
        background-color: rgba(255,255,255,0.06) !important;
        border-color: rgba(255,255,255,0.3) !important;
    }
    #item-page-wrapper .icon-btn span {
        font-size: 1.4rem !important;
        color: #d8cfc2 !important;
    }
    #item-page-wrapper .abs-btn.bg-success {
        background-color: #e8a23e !important;
        color: #14110d !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 0 32px !important;
        height: 48px !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        box-shadow: 0 8px 20px rgba(232, 162, 62, 0.25) !important;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    #item-page-wrapper .abs-btn.bg-success:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 10px 24px rgba(232, 162, 62, 0.35) !important;
    }
    #item-page-wrapper .abs-btn.bg-success span {
        color: #14110d !important;
        font-size: 1.6rem !important;
        margin-right: 8px !important;
        margin-left: -4px !important;
    }

    /* Description Formatting */
    #item-description {
        font-size: 1.15rem !important;
        line-height: 1.7 !important;
        color: #d8cfc2 !important;
        max-width: 95% !important;
        display: block !important;
        -webkit-line-clamp: unset !important;
        max-height: none !important;
        overflow: visible !important;
    }
    #item-page-wrapper button.text-slate-300 {
        display: none !important;
    }

    /* Tables & Accordions */
    #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary {
        background-color: transparent !important;
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        padding: 24px 0 !important;
    }
    #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary p {
        font-family: var(--nh-serif), 'Spectral', serif !important;
        font-size: 1.25rem !important;
        color: #f4eee2 !important;
    }
    #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary .bg-black-400 {
        background-color: rgba(255,255,255,0.08) !important;
        color: #d8cfc2 !important;
        border-radius: 20px !important;
        font-size: 0.9rem !important;
        padding: 4px 12px !important;
        font-family: system-ui, sans-serif !important;
    }

    #item-page-wrapper .tracksTable {
        background-color: transparent !important;
        width: 100% !important;
        border-collapse: collapse !important;
        margin-top: 16px !important;
    }

    #item-page-wrapper .tracksTable tr,
    #item-page-wrapper .tracksTable thead,
    #item-page-wrapper .tracksTable tbody,
    #item-page-wrapper .tracksTable tr:nth-child(even),
    #item-page-wrapper .tracksTable tr:nth-child(odd) {
        background-color: transparent !important;
    }

    #item-page-wrapper .tracksTable th {
        text-transform: uppercase !important;
        font-size: 0.75rem !important;
        letter-spacing: 0.1em !important;
        color: #8a8075 !important;
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        padding: 16px 12px !important;
        text-align: left;
        background-color: transparent !important;
        font-weight: 600 !important;
    }
    #item-page-wrapper .tracksTable td {
        padding: 16px 12px !important;
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        color: #d8cfc2 !important;
        background-color: transparent !important;
        font-size: 0.95rem !important;
    }
    #item-page-wrapper .tracksTable tr:hover td {
        background-color: rgba(255,255,255,0.04) !important;
    }
    #item-page-wrapper .tracksTable .font-mono {
        font-family: ui-monospace, "SFMono-Regular", Menlo, monospace !important;
        font-size: 0.9rem !important;
        color: #9a9085 !important;
    }
    #item-page-wrapper .tracksTable button {
        background-color: rgba(255,255,255,0.05) !important;
        border: none !important;
        border-radius: 8px !important;
    }
    /* ============ MOBILE ============ */
    @media (max-width: 640px) {
        /* Force single column even if ABS's own breakpoint differs from ours */
        #item-page-wrapper > div.flex { flex-direction: column !important; }
        #item-page-wrapper > div.flex > div:first-child {
            width: 100% !important; margin: 0 0 16px !important; align-self: stretch !important;
        }
        #item-page-wrapper h1 { font-size: 1.15rem !important; margin-bottom: 4px !important; text-align: left; }
        #item-page-wrapper h1 + p { font-size: 0.95rem !important; margin-bottom: 6px !important; }
        #item-page-wrapper p.mb-2 { font-size: 0.8rem !important; }
        #item-description { font-size: 0.85rem !important; line-height: 1.5 !important; max-width: 100% !important; }

        /* Metadata now sits before the description — compact wrapping pills, not a tall list */
        .nh-metadata-container {
            display: flex !important; flex-wrap: wrap !important; grid-template-columns: none !important;
            row-gap: 6px !important; column-gap: 10px !important; margin: 14px 0 !important; padding: 0 !important;
            border-top: none !important; max-height: 3.4rem !important; overflow: hidden !important;
        }
        .nh-metadata-container .flex.py-0\\.5 {
            flex: 0 0 auto !important; max-width: 47% !important; overflow: hidden !important;
            flex-direction: row !important; align-items: baseline !important; gap: 4px !important;
        }
        .nh-metadata-container .flex.py-0\\.5 > div:first-child span { font-size: 0.58rem !important; white-space: nowrap !important; flex-shrink: 0 !important; }
        .nh-metadata-container .flex.py-0\\.5 > div:last-child {
            font-size: 0.72rem !important; white-space: nowrap !important; overflow: hidden !important;
            text-overflow: ellipsis !important; min-width: 0 !important; flex: 1 1 auto !important;
        }

        #item-page-wrapper .abs-btn.bg-success { padding: 0 18px !important; height: 40px !important; font-size: 0.9rem !important; }
        #item-page-wrapper .icon-btn { width: 40px !important; height: 40px !important; }
        #item-page-wrapper [class*="pt-4 flex"] > div.relative { width: 40px !important; height: 40px !important; }

        /* Chapters / Audio Tracks / Library Files section headers + pills */
        #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary p { font-size: 1.05rem !important; }
        #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary .bg-black-400 { font-size: 0.78rem !important; padding: 3px 9px !important; }
        #item-page-wrapper .tracksTable th { font-size: 0.65rem !important; padding: 10px 8px !important; }
        #item-page-wrapper .tracksTable td { font-size: 0.82rem !important; padding: 10px 8px !important; }
        #item-page-wrapper button, #item-page-wrapper a { white-space: nowrap; }
    }
  `;

  const style = document.createElement('style');
  style.id = 'nanohive-abs-details-theme';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);


  // ==========================================
  // 2. JS DOM MUTATIONS (Safe Injections)
  // ==========================================
  function showFullscreenCover(src) {
      let overlay = document.getElementById('nh-fullscreen-cover');
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'nh-fullscreen-cover';
          Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
              backgroundColor: 'rgba(14, 12, 9, 0.92)', zIndex: '99999',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              backdropFilter: 'blur(15px)'
          });
          const img = document.createElement('img');
          Object.assign(img.style, {
              maxHeight: '90vh', maxWidth: '90vw', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              objectFit: 'contain'
          });
          overlay.appendChild(img);
          overlay.addEventListener('click', () => overlay.style.display = 'none');
          document.body.appendChild(overlay);
      }

      overlay.querySelector('img').src = src.replace('width=800', 'width=1600');
      overlay.style.display = 'flex';
  }

  function enhanceBookDetails() {
      const isBookPage = window.location.pathname.includes('/item/') || window.location.pathname.includes('/audiobook/');
      const pageWrapper = document.getElementById('page-wrapper');

      // Toggle cinematic mode based on page
      if (!isBookPage) {
          if (pageWrapper) pageWrapper.classList.remove('nh-cinematic-mode');
          const bg = document.getElementById('nh-cinematic-bg');
          if (bg) bg.style.opacity = '0';
          return;
      }

      if (pageWrapper) pageWrapper.classList.add('nh-cinematic-mode');

      // 0. Polish: strip "Autor"/"Autorzy"/"autorstwa" prefix before the author name.
      //    English ("by ") is left untouched because it doesn't match the pattern.
      const authorP = document.querySelector('#item-page-wrapper p.mb-2');
      if (authorP) {
          for (const node of Array.from(authorP.childNodes)) {
              if (node.nodeType === 3) {
                  const cleaned = node.textContent.replace(/^\s*autor\w*[\s:]+/i, '');
                  if (cleaned !== node.textContent) node.textContent = cleaned;
              } else if (node.nodeType === 1) {
                  break;
              }
          }
      }

      // 1. Relocate and Reorder Metadata Grid
      // Primary selector is fragile across ABS versions. If it misses (or finds a node
      // with no metadata rows), fall back to the metadata rows' own parent so the
      // redesign class still lands and the labels/values don't render as native pairs.
      let metadataContainer = document.querySelector('#item-page-wrapper .mb-4 > div:last-of-type');
      if (!metadataContainer || !metadataContainer.querySelector('.flex.py-0\\.5')) {
          const firstRow = document.querySelector('#item-page-wrapper .flex.py-0\\.5');
          if (firstRow && firstRow.parentElement) metadataContainer = firstRow.parentElement;
      }
      const descriptionEl = document.getElementById('item-description');
      const leftColumn = document.querySelector('#item-page-wrapper > div.flex > div:first-child');

      if (metadataContainer && descriptionEl && descriptionEl.parentNode) {
          if (!metadataContainer.classList.contains('nh-metadata-container') && metadataContainer.querySelector('.flex.py-0\\.5')) {
              metadataContainer.classList.add('nh-metadata-container');
          }

          // Desktop: under the cover in the left column. Mobile: above the description,
          // since the left column collapses. Runs every mutation cycle, so only move when
          // the container is in the wrong parent — otherwise we'd thrash the DOM.
          if (metadataContainer.classList.contains('nh-metadata-container')) {
              const desktop = window.matchMedia('(min-width: 1024px)').matches;
              if (desktop && leftColumn) {
                  if (metadataContainer.parentNode !== leftColumn) leftColumn.appendChild(metadataContainer);
              } else if (metadataContainer.parentNode !== descriptionEl.parentNode || metadataContainer.nextElementSibling !== descriptionEl) {
                  descriptionEl.parentNode.insertBefore(metadataContainer, descriptionEl);
              }
          }

          const items = Array.from(metadataContainer.querySelectorAll('.flex.py-0\\.5'));
          items.forEach(item => {
              const span = item.querySelector('span');
              if (!span) return;
              const header = span.textContent.trim().toUpperCase();

              item.style.gridColumn = 'auto';

              if (header.includes('NARRATOR')) item.style.order = 1;
              else if (header.includes('GENRE')) item.style.order = 2;
              else if (header.includes('PUBLISH YEAR')) item.style.order = 3;
              else if (header.includes('DURATION')) item.style.order = 4;
              else if (header.includes('PUBLISHER')) item.style.order = 5;
              else if (header.includes('SIZE')) item.style.order = 6;
              else if (header.includes('LANGUAGE')) item.style.order = 7;
              else if (header.includes('TAG')) {
                  item.style.order = 99;
                  item.style.gridColumn = '1 / -1';
              } else {
                  item.style.order = 50;
              }
          });
      }

      // 2. HD Cover & Cinematic Background
      const detailsCoverContainer = document.querySelector('#item-page-wrapper > div.flex > div:first-child .w-full.h-full.relative.bg-bg');
      if (detailsCoverContainer && !detailsCoverContainer.dataset.hdFixed) {
          const origImg = detailsCoverContainer.querySelector('img:not([data-nh-clone])');
          if (origImg && origImg.src && origImg.src.includes('/api/items/')) {
              detailsCoverContainer.dataset.hdFixed = 'true';
              origImg.style.opacity = '0';

              const clone = document.createElement('img');
              clone.className = origImg.className;
              clone.style.opacity = '1';
              clone.dataset.nhClone = '1';

              let highResSrc = origImg.src;
              try {
                const urlObj = new URL(origImg.src, window.location.origin);
                urlObj.searchParams.set('width', '800');
                highResSrc = urlObj.toString();
              } catch(e) {}

              clone.src = highResSrc;
              detailsCoverContainer.appendChild(clone);

              const wrapperLink = detailsCoverContainer.closest('.relative.rounded-xs');
              if (wrapperLink) {
                  wrapperLink.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showFullscreenCover(clone.src);
                  }, true);
              }

              // Inject Cinematic Background safely past Script 1's blocking rule
              let bg = document.getElementById('nh-cinematic-bg');
              if (!bg) {
                  bg = document.createElement('div');
                  bg.id = 'nh-cinematic-bg';
                  if (pageWrapper) pageWrapper.insertBefore(bg, pageWrapper.firstChild);
              }
              if (bg.dataset.bgUrl !== highResSrc) {
                  // !important is required here so Script 1 doesn't paint it black
                  bg.style.setProperty('background-image', `url("${highResSrc}")`, 'important');
                  bg.dataset.bgUrl = highResSrc;
                  setTimeout(() => bg.style.opacity = '1', 50);
              }
          }
      }

      // 3. Cinematic Progress Bar Injection
      const anyPill = document.querySelector('#item-page-wrapper .bg-primary.max-w-max');
      const existingCustom = document.getElementById('nh-custom-progress');
      if (!anyPill && existingCustom) existingCustom.remove();

      const nativeProgress = document.querySelector('#item-page-wrapper .bg-primary.max-w-max:not([data-replaced="true"])');
      if (nativeProgress) {
          nativeProgress.dataset.replaced = 'true';
          let percent = 0;
          let remainingText = "";

          const pTags = Array.from(nativeProgress.querySelectorAll('p'));
          pTags.forEach(p => {
              const txt = p.textContent.trim();
              if (txt.includes('%')) {
                  const match = txt.match(/(\d+)%/);
                  if (match) percent = parseInt(match[1], 10);
              } else if (txt.toLowerCase().includes('remaining') || txt.toLowerCase().includes('pozostało') || txt.toLowerCase().includes('left')) {
                  remainingText = txt;
              }
          });

          if (percent > 0 || remainingText) {
              const customUI = document.createElement('div');
              customUI.id = 'nh-custom-progress';
              customUI.style.width = '100%';
              customUI.style.maxWidth = '600px';
              customUI.style.marginTop = '16px';
              customUI.style.marginBottom = '36px';
              customUI.style.position = 'relative';

              customUI.innerHTML = `
                <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; width: 100%; margin-bottom: 12px;">
                    <div style="height: 100%; width: ${percent}%; background: #e8a23e; border-radius: 3px; box-shadow: 0 0 10px rgba(232,162,62,0.5);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: #8a8075; font-family: system-ui, sans-serif;">
                    <span>${remainingText}</span>
                    <span style="color: #d8cfc2; font-weight: 500;">${percent}%</span>
                </div>
              `;

              const nativeCloseBtn = nativeProgress.querySelector('.absolute, .material-symbols');
              if (nativeCloseBtn) {
                 const newClose = document.createElement('div');
                 newClose.innerHTML = '<span class="material-symbols" style="font-size: 1.2rem; color: #9a9085; cursor: pointer; transition: color 0.2s;">close</span>';
                 newClose.style.position = 'absolute';
                 newClose.style.right = '0';
                 newClose.style.top = '-26px';

                 newClose.addEventListener('mouseenter', () => newClose.querySelector('span').style.color = '#ffffff');
                 newClose.addEventListener('mouseleave', () => newClose.querySelector('span').style.color = '#9a9085');

                 newClose.addEventListener('click', (e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     if (nativeCloseBtn) nativeCloseBtn.click();
                 });

                 customUI.appendChild(newClose);
              }

              nativeProgress.insertAdjacentElement('afterend', customUI);
          }
      }

      // 4. Finished badge on cover (replaces the removed native progress bar).
      //    The native bar is hidden via CSS but stays in the DOM, so its class still tells us
      //    the state: bg-success == finished. Append/remove a frosted checkmark in the cover's
      //    positioned wrapper (.relative.group, the bar's parent) so it tracks toggles.
      const coverBar = document.querySelector('#item-page-wrapper > div.flex > div:first-child .absolute.bottom-0.left-0.h-1\\.5');
      if (coverBar && coverBar.parentElement) {
          const coverWrap = coverBar.parentElement;
          const finished = coverBar.classList.contains('bg-success');
          let badge = coverWrap.querySelector('#nh-finished-badge');
          if (finished && !badge) {
              badge = document.createElement('div');
              badge.id = 'nh-finished-badge';
              badge.setAttribute('aria-label', 'Finished');
              badge.innerHTML = '<span class="material-symbols">check</span>';
              coverWrap.appendChild(badge);
          } else if (!finished && badge) {
              badge.remove();
          }
      }

      // Edit Chapters / Manage Tracks buttons don't share a class — match by
      // text and force identical box sizing so one doesn't wrap taller than the other.
      const sectionButtons = Array.from(document.querySelectorAll('#item-page-wrapper button, #item-page-wrapper a')).filter(el => {
          const t = (el.textContent || '').trim();
          return t === 'Edit Chapters' || t === 'Manage Tracks';
      });
      sectionButtons.forEach(btn => {
          btn.style.whiteSpace = 'nowrap';
          btn.style.display = 'inline-flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
      });
  }

  // Poll for Vue SPA navigation changes
  setInterval(enhanceBookDetails, 500);
})();