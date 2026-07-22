/* NanoHive ABS — Book Details Redesign  v1.25.1  (injected build) */

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
        overflow: hidden !important;
    }
    /* Library set to standard covers: details cover goes 1.6:1 portrait too */
    html.nh-covers-std #item-page-wrapper > div.flex > div:first-child .relative.rounded-xs {
        aspect-ratio: 1 / 1.6;
    }

    #item-page-wrapper img[cy-id="coverImage"],
    #item-page-wrapper > div.flex > div:first-child img {
        border-radius: 20px !important;
        object-fit: cover !important;
        height: 100% !important;
        width: 100% !important;
    }

    /* Hide native cover overlays: the progress bar (BOTH in-progress bg-yellow-400 AND
       finished bg-success — ABS hardcodes its width to 208px, so it renders as a broken
       half-width stub on the resized detail cover) + the hover/edit overlay. The bar stays
       in the DOM (display:none) so the JS finished-badge can still read its bg-success state. */
    #item-page-wrapper > div.flex > div:first-child .bg-yellow-400.absolute.bottom-0,
    #item-page-wrapper > div.flex > div:first-child .bg-success.absolute.bottom-0,
    #item-page-wrapper > div.flex > div:first-child .group-hover\\:opacity-100 {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
    }

    /* Finished indicator: frosted circular checkmark, top-right of the cover, in the accent
       colour. Injected by JS (section 4) when the (hidden) native bar carries bg-success. */
    #nh-finished-badge {
        position: absolute !important; top: 14px !important; right: 14px !important; z-index: 20 !important;
        width: 44px !important; height: 44px !important; border-radius: 50% !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        background: rgba(20, 17, 13, 0.35) !important;
        backdrop-filter: blur(12px) saturate(1.3) !important; -webkit-backdrop-filter: blur(12px) saturate(1.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.22) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important; pointer-events: none !important;
    }
    #nh-finished-badge .material-symbols {
        font-size: 26px !important; line-height: 1 !important; color: var(--nh-amber, #e8a23e) !important;
        font-variation-settings: 'wght' 700 !important; text-shadow: 0 0 10px var(--nh-amber-shadow, rgba(232,162,62,0.45)) !important;
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
        /* Grid items default to min-width:auto and refuse to shrink below their
           content, so a long value (e.g. a 3-genre list) overflowed into the next
           column. min-width:0 lets it wrap within its own track instead. */
        min-width: 0 !important;
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
        overflow-wrap: anywhere !important;
        word-break: normal !important;
        line-height: 1.4 !important;
        max-width: 100% !important;
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
    #item-page-wrapper .abs-btn.bg-success,
    #item-page-wrapper .abs-btn.bg-info {
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
    #item-page-wrapper .abs-btn.bg-success:hover,
    #item-page-wrapper .abs-btn.bg-info:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 10px 24px rgba(232, 162, 62, 0.35) !important;
    }
    #item-page-wrapper .abs-btn.bg-success span,
    #item-page-wrapper .abs-btn.bg-info span {
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

    :is(#item-page-wrapper, .modal) .tracksTable {
        /* Sit the table in its own softly-recessed rounded panel so it reads as part
           of the theme instead of floating loose against the page. border-collapse
           must be separate for border-radius to take effect.
           overflow must stay VISIBLE: the Ebook/Library Files rows open a context
           dropdown positioned inside the table, and overflow:hidden clipped it at the
           panel edge. The panel background still rounds on its own; the corner cells
           below carry matching radii so hover highlights don't poke out square. */
        background: rgba(0,0,0,0.2) !important;
        width: 100% !important;
        border: none !important;
        border-radius: 18px !important;
        overflow: visible !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        margin-top: 16px !important;
    }
    :is(#item-page-wrapper, .modal) .tracksTable > *:first-child > tr:first-child > *:first-child { border-top-left-radius: 18px !important; }
    :is(#item-page-wrapper, .modal) .tracksTable > *:first-child > tr:first-child > *:last-child { border-top-right-radius: 18px !important; }
    :is(#item-page-wrapper, .modal) .tracksTable > *:last-child > tr:last-child > *:first-child { border-bottom-left-radius: 18px !important; }
    :is(#item-page-wrapper, .modal) .tracksTable > *:last-child > tr:last-child > *:last-child { border-bottom-right-radius: 18px !important; }
    /* While a row's context menu is open, lift its whole section above the following
       sections (equal z-index siblings paint in DOM order, so a menu spilling past the
       section's bottom edge would otherwise render underneath the next table). */
    #item-page-wrapper .w-full.my-2.mt-6:has(.border-black-200.shadow-lg) { position: relative !important; z-index: 25 !important; }
    /* Files-table row menus: let the box grow to its labels (ABS gives it a fixed
       width that clips "Set as supplementary"). Direction (drop-up vs drop-down) is
       decided per-open in JS from the actual space below — see nhMenuDirection. */
    :is(#item-page-wrapper, .modal) .tracksTable [role="menu"] { min-width: max-content !important; }

    :is(#item-page-wrapper, .modal) .tracksTable tr,
    :is(#item-page-wrapper, .modal) .tracksTable thead,
    :is(#item-page-wrapper, .modal) .tracksTable tbody,
    :is(#item-page-wrapper, .modal) .tracksTable tr:nth-child(even),
    :is(#item-page-wrapper, .modal) .tracksTable tr:nth-child(odd) {
        background-color: transparent !important;
    }

    :is(#item-page-wrapper, .modal) .tracksTable th {
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
    :is(#item-page-wrapper, .modal) .tracksTable td {
        padding: 16px 12px !important;
        border-bottom: 1px solid rgba(255,255,255,0.03) !important;
        color: #d8cfc2 !important;
        background-color: transparent !important;
        font-size: 0.95rem !important;
    }
    /* No separator under the last row — it would cut across the panel's rounded base. */
    :is(#item-page-wrapper, .modal) .tracksTable tr:last-child td {
        border-bottom: none !important;
    }
    :is(#item-page-wrapper, .modal) .tracksTable tr:hover td {
        background-color: rgba(255,255,255,0.04) !important;
    }
    :is(#item-page-wrapper, .modal) .tracksTable .font-mono {
        font-family: ui-monospace, "SFMono-Regular", Menlo, monospace !important;
        font-size: 0.9rem !important;
        color: #9a9085 !important;
    }
    :is(#item-page-wrapper, .modal) .tracksTable button {
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

        #item-page-wrapper .abs-btn.bg-success, #item-page-wrapper .abs-btn.bg-info { padding: 0 18px !important; height: 40px !important; font-size: 0.9rem !important; }
        #item-page-wrapper .icon-btn { width: 40px !important; height: 40px !important; }
        #item-page-wrapper [class*="pt-4 flex"] > div.relative { width: 40px !important; height: 40px !important; }

        /* Chapters / Audio Tracks / Library Files section headers + pills */
        #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary p { font-size: 1.05rem !important; }
        #item-page-wrapper .w-full.my-2.mt-6 > div.bg-primary .bg-black-400 { font-size: 0.78rem !important; padding: 3px 9px !important; }
        :is(#item-page-wrapper, .modal) .tracksTable th { font-size: 0.65rem !important; padding: 10px 8px !important; }
        :is(#item-page-wrapper, .modal) .tracksTable td { font-size: 0.82rem !important; padding: 10px 8px !important; }
        #item-page-wrapper button, #item-page-wrapper a { white-space: nowrap; }
    }

    /* ============ COMMUNITY RATINGS (server-wide, /_nh/api/ratings) ============ */
    /* Compact, headerless: an interactive star row directly under the Play/Read
       buttons (the buttons row carries margin-bottom:48px, so pull back up). */
    #nh-ratings { margin: -26px 0 40px; max-width: 95%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; position: relative; z-index: 10; }
    #nh-ratings .nh-rt-main { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 34px; }
    #nh-ratings .nh-rt-avg { color: var(--nh-amber, #e0c27a); font-size: 0.95rem; }
    .nh-rt-stars { position: relative; display: inline-block; font-size: 1.05rem; line-height: 1; letter-spacing: 2px; color: rgba(255,255,255,0.22); white-space: nowrap; user-select: none; }
    .nh-rt-stars .nh-rt-fill { position: absolute; top: 0; left: 0; height: 100%; overflow: hidden; white-space: nowrap; color: var(--nh-amber, #e0c27a); pointer-events: none; }
    #nh-rt-picker { cursor: pointer; font-size: 2.1rem; letter-spacing: 3px; }
    .nh-rt-score { font-size: 1.6rem; font-weight: 600; color: #f4eee2; font-family: var(--nh-serif), 'Spectral', serif; line-height: 1; }
    .nh-rt-your { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
    .nh-rt-your-label { color: #9a9085; font-size: 0.9rem; }
    .nh-rt-link { background: none; border: none; color: #9a9085; cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; font-family: inherit; }
    .nh-rt-link:hover { color: #d8cfc2; }
    .nh-rt-status { font-size: 0.85rem; color: #8a8075; }
    #nh-rt-modal { position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    .nh-rt-modal-bg { position: absolute; inset: 0; background: rgba(10, 8, 6, 0.6); backdrop-filter: blur(3px); }
    .nh-rt-modal-box { position: relative; width: min(92vw, 560px); max-height: 78vh; overflow-y: auto; background: rgba(var(--nh-bg-rgb, 24, 21, 18), 0.98); border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 16px 22px 12px; box-shadow: 0 24px 70px rgba(0,0,0,0.6); }
    .nh-rt-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .nh-rt-modal-head > span { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.15rem; color: #f4eee2; }
    .nh-rt-modal-x { background: none; border: none; color: #9a9085; font-size: 26px; line-height: 1; cursor: pointer; padding: 2px 6px; }
    .nh-rt-modal-x:hover { color: #ffffff; }
    /* Inside the popup the accent-coloured number can sit too dark on the panel — go white. */
    .nh-rt-modal-box .nh-rt-avg { color: #f4eee2; }
    #nh-rt-editor { margin-top: 10px; max-width: 620px; }
    #nh-rt-review { width: 100%; min-height: 58px; background: rgba(0,0,0,0.25); color: #d8cfc2; border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; padding: 10px 12px; font-size: 0.95rem; font-family: inherit; resize: vertical; box-sizing: border-box; }
    #nh-rt-review:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }
    .nh-rt-actions { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
    .nh-rt-btn { background: var(--nh-amber, #e0c27a); color: #14110d; border: none; border-radius: 9px; padding: 7px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer; }
    #nh-rt-list { margin-top: 14px; max-width: 620px; }
    .nh-rt-row { display: flex; flex-direction: column; gap: 3px; padding: 9px 2px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nh-rt-row:last-child { border-bottom: none; }
    .nh-rt-row-top { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
    .nh-rt-user { color: #f4eee2; font-weight: 600; font-size: 0.92rem; }
    .nh-rt-date { color: #8a8075; font-size: 0.78rem; }
    .nh-rt-text { color: #d8cfc2; font-size: 0.92rem; line-height: 1.5; margin: 1px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .nh-rt-del { background: none; border: none; color: #8a8075; cursor: pointer; font-size: 0.76rem; text-decoration: underline; padding: 0; }
    .nh-rt-del:hover { color: #d98c7a; }
    @media (max-width: 640px) {
      #nh-ratings { max-width: 100%; margin: -4px 0 24px; }
      #nh-rt-picker { font-size: 1.8rem; }
      .nh-rt-score { font-size: 1.3rem; }
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

  // ==========================================
  // 2.4 FILES-TABLE MENU DIRECTION
  // ==========================================
  // Flip a row's context menu upward ONLY when it would run past the bottom of the
  // viewport (typically the last rows of the last table). Everything else keeps the
  // native drop-down. Measured per open — a static CSS rule can't know the space.
  document.addEventListener('click', function () {
      setTimeout(function () {
          document.querySelectorAll(':is(#item-page-wrapper, .modal) .tracksTable [role="menu"]').forEach(function (m) {
              if (!m.offsetParent) return; // menu closed
              const wrap = m.parentElement;
              if (!wrap) return;
              const wr = wrap.getBoundingClientRect();
              const mh = m.getBoundingClientRect().height || 0;
              if (window.innerHeight - wr.bottom < mh + 16) {
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

  // ==========================================
  // 2.5 COMMUNITY RATINGS (server-wide, /_nh/api/ratings)
  // ==========================================
  // Stars + short reviews shared by every user of this server. The nginx side
  // (njs/nh-ratings.js) verifies identity against ABS /api/me, so the client
  // only ever sends its own Bearer token. All user-generated strings are
  // rendered via textContent — never innerHTML.
  // Resilience: right after a hard page load the Vue auth store may not have a
  // token yet, so the first fetch can 401 — retry with backoff instead of
  // latching an error. If the backend truly isn't there (404: theme deployed
  // without the njs API) the section removes itself quietly.
  const nhRt = { itemId: null, ratings: null, tries: 0, timer: null, fetching: false, gone: false, dead: false, editorOpen: false, draft: null, modalOpen: false };

  function nhRtEnabled() {
    // Same precedence as the rest of the theme: user setting > UI server
    // defaults > operator env config > default ON.
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('nh-settings') || '{}') || {}; } catch (e) {}
    const layers = [saved, window.NH_SERVER_CONFIG || {}, window.NH_CONFIG || {}];
    for (const l of layers) {
      if (l && l.showRatings !== undefined && l.showRatings !== null && l.showRatings !== '') return l.showRatings !== false;
    }
    return true;
  }

  function nhRtToken() {
    // First choice: the token sniffed from ABS's own API traffic (core.js mirrors
    // every Authorization header the app sends) — immune to store-layout changes.
    if (window.__NH_TOKEN) return window.__NH_TOKEN;
    try {
      const st = window.$nuxt && window.$nuxt.$store;
      if (st) {
        const t = st.getters['user/getToken'] || (st.state.user.user && (st.state.user.user.accessToken || st.state.user.user.token));
        if (t) return t;
      }
    } catch (e) {}
    try { return localStorage.getItem('token') || (JSON.parse(localStorage.getItem('vuex') || '{}').user || {}).token || ''; } catch (e) { return ''; }
  }

  function nhRtMe() {
    try {
      const st = window.$nuxt && window.$nuxt.$store;
      const u = st && st.state.user && st.state.user.user;
      if (!u || !u.id) return null;
      return { id: String(u.id), name: u.username || 'me', admin: !!st.getters['user/getIsAdminOrUp'] };
    } catch (e) { return null; }
  }

  function nhRtLang() {
    try { if (window.$nuxt && window.$nuxt.$i18n && window.$nuxt.$i18n.locale) return window.$nuxt.$i18n.locale; } catch (e) {}
    return document.documentElement.lang || navigator.language || 'en';
  }

  const NH_RT_T = {
    en: { ratingWords: ['rating', 'ratings'], reviewWords: ['review', 'reviews'], yourLabel: 'Your rating:', rateHint: 'Click to rate', ph: 'Add a short review (optional)…', save: 'Save', clear: 'Remove', addReview: 'Add a review', editReview: 'Edit review', you: 'you', err: 'Could not save', del: 'remove' },
    pl: { ratingWords: ['ocena', 'oceny', 'ocen'], reviewWords: ['recenzja', 'recenzje', 'recenzji'], yourLabel: 'Twoja ocena:', rateHint: 'Kliknij, aby ocenić', ph: 'Dodaj krótką recenzję (opcjonalnie)…', save: 'Zapisz', clear: 'Usuń', addReview: 'Dodaj recenzję', editReview: 'Edytuj recenzję', you: 'ty', err: 'Nie udało się zapisać', del: 'usuń' }
  };
  function nhRtT() { return NH_RT_T[(nhRtLang().split('-')[0] || 'en').toLowerCase()] || NH_RT_T.en; }

  // Pluralize with Polish three-form support: [one, few, many]; English: [one, many].
  function nhRtWord(n, forms) {
    if (forms.length === 2) return n === 1 ? forms[0] : forms[1];
    if (n === 1) return forms[0];
    const d = n % 10, h = n % 100;
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return forms[1];
    return forms[2];
  }

  function nhRtStarsEl(value, big) {
    const wrap = document.createElement('span');
    wrap.className = 'nh-rt-stars';
    if (big) wrap.id = 'nh-rt-picker';
    const base = document.createElement('span');
    base.textContent = '★★★★★';
    const fill = document.createElement('span');
    fill.className = 'nh-rt-fill';
    fill.textContent = '★★★★★';
    fill.style.width = (Math.max(0, Math.min(5, value || 0)) / 5 * 100) + '%';
    wrap.appendChild(base); wrap.appendChild(fill);
    wrap._fill = fill;
    return wrap;
  }

  function nhRtHeaders(json) {
    const h = {};
    const t = nhRtToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  function nhRtRemove() {
    const s = document.getElementById('nh-ratings');
    if (s) s.remove();
    const m = document.getElementById('nh-rt-modal');
    if (m) m.remove();
  }

  function nhRtRetry(itemId) {
    nhRt.tries++;
    if (nhRt.tries > 6) {
      nhRt.dead = true;
      try { console.warn('[NanoHive] ratings: giving up after retries — last HTTP status: ' + (nhRt.lastStatus || 'network/no-token')); } catch (e) {}
      nhRtRemove();
      return;
    }
    clearTimeout(nhRt.timer);
    nhRt.timer = setTimeout(() => { if (nhRt.itemId === itemId) nhRtFetch(itemId); }, 1200 * nhRt.tries);
  }

  function nhRtFetch(itemId) {
    if (nhRt.fetching) return;
    if (!nhRtToken()) { nhRt.lastStatus = 'no-token'; nhRtRetry(itemId); return; } // auth store not hydrated yet
    nhRt.fetching = true;
    fetch('/_nh/api/ratings?item=' + encodeURIComponent(itemId), { headers: nhRtHeaders(), credentials: 'include' })
      .then(r => {
        if (r.status === 404 || r.status === 405) { nhRt.gone = true; return null; } // no njs backend behind this proxy
        if (!r.ok) { nhRt.lastStatus = r.status; throw new Error(r.status); }
        return r.json();
      })
      .then(j => {
        nhRt.fetching = false;
        if (nhRt.itemId !== itemId) return; // navigated away meanwhile
        if (nhRt.gone) { nhRtRemove(); return; }
        nhRt.ratings = (j && j.items && j.items[itemId]) || {};
        nhRt.tries = 0;
        nhRtRender();
      })
      .catch(() => {
        nhRt.fetching = false;
        // Distinguish "never had a token" from "request died on the wire".
        if (typeof nhRt.lastStatus !== 'number') nhRt.lastStatus = 'network-error';
        if (nhRt.itemId === itemId) nhRtRetry(itemId);
      });
  }

  function nhRtSave(stars, review, forUser, statusEl) {
    const body = { itemId: nhRt.itemId, stars: stars, review: review || '' };
    if (forUser) body.forUser = forUser;
    fetch('/_nh/api/ratings', { method: 'POST', headers: nhRtHeaders(true), credentials: 'include', body: JSON.stringify(body) })
      .then(r => {
        if (!r.ok) {
          return r.text().then(t => {
            try { console.warn('[NanoHive] ratings save failed: HTTP ' + r.status + ' ' + String(t).slice(0, 200)); } catch (e) {}
            throw new Error(r.status);
          });
        }
        return r.json();
      })
      .then(j => {
        nhRt.ratings = (j.items && j.items[body.itemId]) || {};
        nhRt.err = false;
        nhRtRender();
      })
      .catch(() => { if (statusEl) statusEl.textContent = nhRtT().err; });
  }

  function nhRtRender() {
    const oldModal = document.getElementById('nh-rt-modal');
    if (oldModal) oldModal.remove();
    const section = document.getElementById('nh-ratings');
    if (!section) return;
    const T = nhRtT();
    const lang = nhRtLang();
    section.textContent = '';

    const ratings = nhRt.ratings || {};
    const entries = Object.keys(ratings).map(k => Object.assign({ uid: k }, ratings[k]))
      .filter(e => typeof e.stars === 'number')
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const me = nhRtMe();
    const mine = me ? ratings[me.id] : null;

    // --- Main row (Goodreads-style): big stars filled to the AVERAGE; hovering
    // previews your own rating and clicking saves it. Big numeric score beside,
    // then "N ratings · M reviews" which opens the reviews popup. ---
    const main = document.createElement('div');
    main.className = 'nh-rt-main';
    const status = document.createElement('span');
    status.className = 'nh-rt-status';

    const avg = entries.length ? entries.reduce((s, e) => s + e.stars, 0) / entries.length : 0;
    const nRev = entries.filter(e => e.review).length;

    const picker = nhRtStarsEl(avg, true);
    const setFill = v => { picker._fill.style.width = (Math.max(0, Math.min(5, v)) / 5 * 100) + '%'; };
    if (me) {
      picker.title = T.rateHint;
      const valFrom = e => {
        const rect = picker.getBoundingClientRect();
        const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const v = Math.ceil(((cx - rect.left) / rect.width) * 10) / 2;
        return Math.max(0.5, Math.min(5, v));
      };
      picker.addEventListener('mousemove', e => setFill(valFrom(e)));
      picker.addEventListener('mouseleave', () => setFill(avg));
      picker.addEventListener('click', e => {
        status.textContent = '…';
        nhRtSave(valFrom(e), nhRt.editorOpen ? (nhRt.draft || '') : ((mine && mine.review) || ''), null, status);
      });
    }
    main.appendChild(picker);

    if (entries.length) {
      const score = document.createElement('span');
      score.className = 'nh-rt-score';
      score.textContent = String(Number(avg.toFixed(2)));
      main.appendChild(score);
      const counts = document.createElement('button');
      counts.type = 'button';
      counts.className = 'nh-rt-link';
      counts.textContent = entries.length + ' ' + nhRtWord(entries.length, T.ratingWords) + (nRev ? ' · ' + nRev + ' ' + nhRtWord(nRev, T.reviewWords) : '');
      counts.addEventListener('click', () => { nhRt.modalOpen = true; nhRtRender(); });
      main.appendChild(counts);
    }
    if (!mine) main.appendChild(status);
    section.appendChild(main);

    // --- "Your rating:" line ---
    if (me && mine) {
      const yr = document.createElement('div');
      yr.className = 'nh-rt-your';
      const lab = document.createElement('span');
      lab.className = 'nh-rt-your-label';
      lab.textContent = T.yourLabel;
      yr.appendChild(lab);
      yr.appendChild(nhRtStarsEl(mine.stars));
      const num = document.createElement('span');
      num.className = 'nh-rt-avg';
      num.textContent = String(Number(mine.stars.toFixed(1)));
      yr.appendChild(num);
      const revBtn = document.createElement('button');
      revBtn.type = 'button';
      revBtn.className = 'nh-rt-link';
      revBtn.textContent = mine.review ? T.editReview : T.addReview;
      revBtn.addEventListener('click', () => {
        nhRt.editorOpen = !nhRt.editorOpen;
        if (nhRt.editorOpen && nhRt.draft === null) nhRt.draft = mine.review || '';
        nhRtRender();
      });
      yr.appendChild(revBtn);
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'nh-rt-link';
      clearBtn.textContent = T.clear;
      clearBtn.addEventListener('click', () => { nhRt.editorOpen = false; nhRt.draft = null; nhRtSave(0, '', null, status); });
      yr.appendChild(clearBtn);
      yr.appendChild(status);
      section.appendChild(yr);
    }

    // --- Collapsible review editor ---
    if (me && nhRt.editorOpen) {
      const ed = document.createElement('div');
      ed.id = 'nh-rt-editor';
      const ta = document.createElement('textarea');
      ta.id = 'nh-rt-review';
      ta.maxLength = 1500;
      ta.placeholder = T.ph;
      ta.value = nhRt.draft || '';
      ta.addEventListener('input', () => { nhRt.draft = ta.value; });
      ed.appendChild(ta);
      const actions = document.createElement('div');
      actions.className = 'nh-rt-actions';
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'nh-rt-btn';
      saveBtn.textContent = T.save;
      saveBtn.addEventListener('click', () => {
        nhRt.editorOpen = false;
        nhRtSave((mine && mine.stars) || 5, ta.value, null, status);
      });
      actions.appendChild(saveBtn);
      ed.appendChild(actions);
      section.appendChild(ed);
    }

    // --- Reviews popup (opened from the counts link; lives on <body> so it sits
    // above the appbar and player, which have their own stacking contexts) ---
    if (nhRt.modalOpen && entries.length) {
      const overlay = document.createElement('div');
      overlay.id = 'nh-rt-modal';
      const bg = document.createElement('div');
      bg.className = 'nh-rt-modal-bg';
      const box = document.createElement('div');
      box.className = 'nh-rt-modal-box';
      const closeModal = () => { nhRt.modalOpen = false; nhRtRender(); };
      bg.addEventListener('click', closeModal);
      const head = document.createElement('div');
      head.className = 'nh-rt-modal-head';
      const title = document.createElement('span');
      title.textContent = entries.length + ' ' + nhRtWord(entries.length, T.ratingWords) + (nRev ? ' · ' + nRev + ' ' + nhRtWord(nRev, T.reviewWords) : '');
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'nh-rt-modal-x';
      x.textContent = '×';
      x.addEventListener('click', closeModal);
      head.appendChild(title);
      head.appendChild(x);
      box.appendChild(head);

      entries.forEach(e => {
        const row = document.createElement('div');
        row.className = 'nh-rt-row';
        const top = document.createElement('div');
        top.className = 'nh-rt-row-top';
        const user = document.createElement('span');
        user.className = 'nh-rt-user';
        user.textContent = e.user + (me && e.uid === me.id ? ' (' + T.you + ')' : '');
        top.appendChild(user);
        top.appendChild(nhRtStarsEl(e.stars));
        const num = document.createElement('span');
        num.className = 'nh-rt-avg';
        num.textContent = e.stars.toFixed(1);
        top.appendChild(num);
        if (e.ts) {
          const date = document.createElement('span');
          date.className = 'nh-rt-date';
          try { date.textContent = new Date(e.ts).toLocaleDateString(lang); } catch (err2) { date.textContent = ''; }
          top.appendChild(date);
        }
        if (me && me.admin && e.uid !== me.id) {
          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'nh-rt-del';
          del.textContent = T.del;
          del.addEventListener('click', () => { if (window.confirm(T.clear + '?')) nhRtSave(0, '', e.uid, null); });
          top.appendChild(del);
        }
        row.appendChild(top);
        if (e.review) {
          const p = document.createElement('p');
          p.className = 'nh-rt-text';
          p.textContent = e.review;
          row.appendChild(p);
        }
        box.appendChild(row);
      });

      overlay.appendChild(bg);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }
  }

  function nhRtMaintain() {
    const m = window.location.pathname.match(/\/item\/([^/?#]+)/);
    const itemId = m ? m[1] : null;
    let section = document.getElementById('nh-ratings');

    if (!itemId || !nhRtEnabled()) {
      if (section) section.remove();
      const m = document.getElementById('nh-rt-modal');
      if (m) m.remove();
      nhRt.itemId = null;
      return;
    }

    // Backend absent (404) or retries exhausted for this item: stay hidden quietly.
    if (nhRt.itemId === itemId && (nhRt.gone || nhRt.dead)) {
      if (section) section.remove();
      return;
    }

    // Anchor directly under the Play/Read action row; description as fallback.
    const btnRow = document.querySelector('#item-page-wrapper .flex.items-center.justify-center.md\\:justify-start.pt-4')
      || document.querySelector('#item-page-wrapper [class*="pt-4 flex"]');
    const desc = document.getElementById('item-description');
    const recreated = !section;
    if (!section) {
      if (!btnRow && !desc) return; // page still mounting
      section = document.createElement('div');
      section.id = 'nh-ratings';
      if (btnRow) btnRow.insertAdjacentElement('afterend', section);
      else desc.insertAdjacentElement('beforebegin', section);
    }

    // (Re)load when the item changed OR Vue re-rendered the page and ate the old
    // section (recreated). Renders only happen on state changes, never on the
    // 500ms tick, so the review textarea is safe to type in.
    if (nhRt.itemId !== itemId || recreated) {
      if (nhRt.itemId !== itemId) {
        nhRt.gone = false; nhRt.dead = false; nhRt.tries = 0;
        nhRt.editorOpen = false; nhRt.draft = null; nhRt.modalOpen = false;
      }
      nhRt.itemId = itemId;
      nhRt.ratings = null;
      clearTimeout(nhRt.timer);
      nhRtRender();
      nhRtFetch(itemId);
    }
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

      // 4. Finished badge on the item-page cover — a frosted accent checkmark, top-right,
      //    replacing the hidden native progress-bar stub. The bar stays in the DOM, so its
      //    bg-success class still tells us the finished state. Resilient: prefer [cy-id],
      //    fall back to the positional bottom-left bar sitting in the cover's .group wrapper.
      const coverBar = document.querySelector('#item-page-wrapper [cy-id="progressBar"]')
          || Array.from(document.querySelectorAll('#item-page-wrapper .absolute.bottom-0.left-0'))
               .find(el => /bg-success|bg-yellow/.test(el.className) && el.closest('.group'));
      const coverWrap = coverBar && (coverBar.closest('.group') || coverBar.parentElement);
      if (coverWrap) {
          const finished = coverBar.classList.contains('bg-success');
          let badge = document.getElementById('nh-finished-badge');
          if (finished && !badge) {
              if (getComputedStyle(coverWrap).position === 'static') coverWrap.style.position = 'relative';
              badge = document.createElement('div');
              badge.id = 'nh-finished-badge';
              badge.setAttribute('aria-label', 'Finished');
              badge.innerHTML = '<span class="material-symbols">check</span>';
              coverWrap.appendChild(badge);
          } else if (!finished && badge) {
              badge.remove();
          }
      }

      // 5. Community ratings section (server-wide stars + reviews)
      try { nhRtMaintain(); } catch (e) {}
  }

  // Poll for Vue SPA navigation changes
  setInterval(enhanceBookDetails, 500);
})();