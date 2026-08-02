/* NanoHive ABS — Book Details Redesign  v1.43.0  (injected build) */

(function () {
  'use strict';

  // ==========================================
  // 1. CSS INJECTION (Page Layout & Cinematic BG)
  // ==========================================
  const css = `
    /* CINEMATIC BACKGROUND: the page itself goes transparent; the actual blurred-cover
       backdrop is the body-level #nh-home-bg managed by enhancements.js (one shared,
       crossfading background for home, series, and item pages). The old per-page
       #nh-cinematic-bg element was removed — core.js had display:none'd it anyway. */
    #page-wrapper.nh-cinematic-mode,
    #page-wrapper.nh-cinematic-mode > #item-page-wrapper {
        background-color: transparent !important;
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

    /* Finished indicator, top-right of the cover. Injected by JS (section 4) when
       the (hidden) native bar carries bg-success. This is the SAME mark the shelf
       cards carry (core.js, .nh-finished::after) and it has to look identical —
       it used to be a frosted disc with a thin accent tick, which read as a
       different thing entirely once the shelf badge became a solid green fill.
       Colours come from the same --nh-finished-* variables, so both move together. */
    #nh-finished-badge {
        position: absolute !important; top: 14px !important; right: 14px !important; z-index: 20 !important;
        width: 44px !important; height: 44px !important; border-radius: 50% !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        background: var(--nh-finished-bg, #4c9a5e) !important;
        border: 1.5px solid rgba(0, 0, 0, 0.38) !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.16) inset !important;
        pointer-events: none !important;
    }
    /* The glyph is drawn here rather than taken from the injected <span>, so it is
       byte-for-byte the shelf badge's mark: U+2714 with the U+FE0E text-presentation
       selector, which stops Android rendering it as a colour emoji. */
    #nh-finished-badge .material-symbols { display: none !important; }
    #nh-finished-badge::after {
        content: '\\2714\\FE0E'; font-variant-emoji: text;
        font-family: var(--nh-sans, system-ui), sans-serif !important;
        font-size: 23px !important; font-weight: 800 !important; line-height: 1 !important;
        color: var(--nh-finished-fg, #0d1a11) !important;
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
        /* 1.7 was set for flowing prose. Publisher blurbs are usually a couple of
           paragraphs followed by a cast list, one short line per paragraph, and at
           1.7 plus a paragraph margin every one of those names sat 50px from the
           next. 1.55 is still comfortable for prose and lands the same 40px rhythm
           stock ABS has, with our larger type. */
        line-height: 1.55 !important;
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
    /* Paragraphs rebuilt from a pre-line description: one controlled gap instead
       of a whole empty line at 1.7 line-height. */
    #item-description.nh-desc-para { white-space: normal !important; }
    #item-description.nh-desc-para .nh-desc-p { margin: 0 0 0.62em !important; }
    #item-description.nh-desc-para .nh-desc-p:last-child { margin-bottom: 0 !important; }
    /* An HTML description gets the SAME gap. ABS's description editor writes one <p>
       per line, so a publisher's cast list ("Narrator - X", "Asha - Y", …) is a dozen
       paragraphs, each carrying a full 1em margin on top of our 1.7 line-height:
       measured 50px per line against 24px for the same text in the editor, which is
       what "the gaps are huge" was. Until now only the rebuilt plain-text path got a
       controlled gap, so the two kinds of description did not even match each other.
       white-space is normalised too: ABS renders the field pre-line, so newlines
       BETWEEN the <p> tags in the stored markup add another blank line on top of the
       margin. Real <br> elements still break, as they should. */
    #item-description:has(> p), #item-description:has(> div) { white-space: normal !important; }
    #item-description > p, #item-description > div { margin: 0 0 0.62em !important; }
    #item-description > p:last-child, #item-description > div:last-child { margin-bottom: 0 !important; }

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
    /* :not([role=menuitem]) — the row-kebab dropdown's items are <button>s inside the
       table too; without the guard they render as stacked pills instead of menu rows. */
    :is(#item-page-wrapper, .modal) .tracksTable button:not([role="menuitem"]) {
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
        /* The label CELL itself must never flex-shrink under its nowrap span —
           it squeezed to "GENR" with the value painting right after (Pawel's
           phone). max-content pins the cell to the label's own width. */
        .nh-metadata-container .flex.py-0\\.5 > div:first-child {
            flex: 0 0 auto !important; width: auto !important; min-width: max-content !important; margin-bottom: 0 !important;
        }
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
    /* Report link + its dialog */
    #nh-rp-link { display: inline-flex; align-items: center; gap: 5px; margin-top: 14px; background: none; border: none; padding: 4px 0; cursor: pointer; color: #8a8075; font-family: system-ui, sans-serif; font-size: 0.82rem; transition: color .15s ease; }
    #nh-rp-link:hover { color: var(--nh-amber, #e0c27a); }
    #nh-rp-link:focus-visible { outline: 2px solid var(--nh-amber, #e0c27a); outline-offset: 3px; border-radius: 6px; }
    #nh-rp-link .material-symbols { font-size: 1.05rem; }
    #nh-rp-modal { position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    .nh-rp-book { font-family: var(--nh-serif), 'Spectral', serif; font-size: 1.05rem; color: #f4eee2; margin: 2px 0 12px; }
    .nh-rp-lbl { font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: #8a8075; margin: 0 0 8px; }
    .nh-rp-reasons { display: grid; gap: 2px; margin-bottom: 12px; }
    .nh-rp-reason { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 9px; cursor: pointer; color: #d8cfc2; font-size: 0.92rem; transition: background .15s ease; }
    .nh-rp-reason:hover { background: rgba(255,255,255,0.05); }
    .nh-rp-reason input { accent-color: var(--nh-amber, #e0c27a); width: 16px; height: 16px; flex: none; }
    .nh-rp-reason:focus-within { background: rgba(255,255,255,0.07); }
    #nh-rp-note { width: 100%; min-height: 74px; background: rgba(0,0,0,0.25); color: #d8cfc2; border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; padding: 9px 11px; font-size: 0.92rem; font-family: inherit; resize: vertical; box-sizing: border-box; }
    #nh-rp-note:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }

    /* Started / Finished, directly under the metadata block. Matches that block's
       label/value rhythm so it reads as one more pair of metadata rows. */
    #nh-bd-dates { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); column-gap: 16px; row-gap: 14px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .nh-bd-dt { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
    .nh-bd-dt-l { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8075; font-family: system-ui, sans-serif; margin-bottom: 4px; }
    .nh-bd-dt-v { font-size: 0.95rem; color: #d8cfc2; }
    .nh-bd-dt-inp { width: 100%; max-width: 190px; background: var(--nh-ctl-bg, rgba(255,255,255,0.05)); color: #d8cfc2; border: 1px solid var(--nh-ctl-bd, rgba(255,255,255,0.14)); border-radius: var(--nh-ctl-r, 11px); padding: 5px 9px; font-family: system-ui, sans-serif; font-size: 0.88rem; transition: border-color .15s ease, background .15s ease; }
    .nh-bd-dt-inp:hover { background: rgba(255,255,255,0.09); border-color: var(--nh-tile-bd-hi, rgba(255,255,255,0.26)); }
    .nh-bd-dt-inp:focus { outline: none; border-color: var(--nh-amber, #e0c27a); }
    .nh-bd-dt-inp.nh-bd-dt-saving { opacity: 0.5; }

    #nh-ratings { margin: -26px 0 40px; max-width: 95%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; position: relative; z-index: 10; }
    #nh-ratings .nh-rt-main { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 34px; }
    #nh-ratings .nh-rt-avg { color: var(--nh-amber, #e0c27a); font-size: 0.95rem; }
    .nh-rt-stars { position: relative; display: inline-block; font-size: 1.05rem; line-height: 1; letter-spacing: 2px; color: rgba(255,255,255,0.22); white-space: nowrap; user-select: none; }
    .nh-rt-stars .nh-rt-fill { position: absolute; top: 0; left: 0; height: 100%; overflow: hidden; white-space: nowrap; color: var(--nh-amber, #e0c27a); pointer-events: none; }
    #nh-rt-picker { cursor: pointer; font-size: 2.1rem; letter-spacing: 3px; }
    .nh-rt-score { font-size: 1.6rem; font-weight: 600; color: #f4eee2; font-family: var(--nh-serif), 'Spectral', serif; line-height: 1; }
    /* The readout changes value under a moving cursor, so it gets a fixed box:
       wide enough for the longest value ("4.25"), centred, and with tabular
       figures so even the digits keep their places. Without this the "N ratings"
       link beside it slid left and right the whole time you were choosing.
       :not(:empty) so an unrated book reserves nothing until there is a value. */
    .nh-rt-score:not(:empty) { display: inline-block; min-width: 2.4em; text-align: center; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
    /* While the stars are previewing YOUR rating the number follows them, so it
       has to stop reading as the community average for those few seconds. */
    .nh-rt-score.nh-rt-score-preview { color: var(--nh-amber, #e0c27a); }
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

  // (2.4 files-table menu direction moved to core.js in v1.28.0: the drop-up
  //  flip now applies to EVERY unified [role=menu] dropdown, not just tables.)

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
    // A library can opt out of ratings entirely (podcast libraries do by
    // default) — that decision is owned by enhancements.js, which knows the
    // current library's media type. Absent, assume the library takes part.
    if (window.__nhRatingsHere && !window.__nhRatingsHere()) return false;
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

  // ---- Started / Finished dates, under the metadata block in the left column --
  // ABS records both but shows neither. The finished date is EDITABLE (a PATCH of
  // finishedAt sticks); the started date is not — ABS accepts the field, answers
  // 200 and then keeps its own value, verified twice — so it is shown as plain
  // text rather than as a picker that silently does nothing.
  const NH_BD_DT = {
    en: { started: 'Started', finished: 'Finished', edit: 'Change the finished date', editStart: 'Change the started date' },
    pl: { started: 'Rozpoczęto', finished: 'Ukończono', edit: 'Zmień datę ukończenia', editStart: 'Zmień datę rozpoczęcia' },
    de: { started: 'Begonnen', finished: 'Beendet', edit: 'Abschlussdatum ändern', editStart: 'Startdatum ändern' },
    fr: { started: 'Commencé', finished: 'Terminé', edit: 'Modifier la date de fin', editStart: 'Modifier la date de début' },
    es: { started: 'Empezado', finished: 'Terminado', edit: 'Cambiar la fecha de fin', editStart: 'Cambiar la fecha de inicio' }
  };
  function nhBdDtT() { return NH_BD_DT[(nhRtLang().split('-')[0] || 'en').toLowerCase()] || NH_BD_DT.en; }

  // Our own started-date overrides, fetched once per session.
  const nhBdStarted = {};
  let nhBdStartedLoaded = false;
  function nhBdLoadStarted() {
    if (nhBdStartedLoaded) return;
    if (!nhRtToken()) return;         // retry on a later tick once authenticated
    nhBdStartedLoaded = true;
    fetch('/_nh/api/dates', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        const it = (j && j.items) || {};
        Object.keys(it).forEach(function (k) { if (it[k] && it[k].startedAt) nhBdStarted[k] = it[k].startedAt; });
      })
      .catch(function () {});
  }

  function nhBdIso(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function nhBdDates() {
    const m = window.location.pathname.match(/\/item\/([^/?#]+)/);
    const host = document.querySelector('.nh-metadata-container');
    const old = document.getElementById('nh-bd-dates');
    if (!m || !host) { if (old) old.remove(); return; }
    let prog = null;
    try {
      const mp = window.$nuxt.$store.state.user.user.mediaProgress || [];
      prog = mp.find((x) => x && x.libraryItemId === m[1]) || null;
    } catch (e) {}
    if (!prog || (!prog.startedAt && !prog.finishedAt)) { if (old) old.remove(); return; }
    const T = nhBdDtT();
    nhBdLoadStarted();
    const sig = m[1] + ':' + (nhBdStarted[m[1]] || prog.startedAt || 0) + ':' + (prog.finishedAt || 0);
    let box = old;
    if (box && box.dataset.sig === sig && box.previousElementSibling === host) return;
    if (!box) { box = document.createElement('div'); box.id = 'nh-bd-dates'; }
    box.dataset.sig = sig;
    box.textContent = '';

    const mk = (label) => {
      const cell = document.createElement('div'); cell.className = 'nh-bd-dt';
      const l = document.createElement('span'); l.className = 'nh-bd-dt-l'; l.textContent = label;
      cell.appendChild(l);
      return cell;
    };
    // readOnly date inputs render without the browser's calendar glyph, so each
    // one is wrapped with our own accent icon (core.js .nh-date-wrap) — the cue
    // that the field opens a picker.
    const wrapDate = (inp) => {
      const w = document.createElement('span'); w.className = 'nh-date-wrap';
      w.appendChild(inp);
      const ic = document.createElement('span'); ic.className = 'nh-date-ico';
      w.appendChild(ic);
      return w;
    };
    const startMs = nhBdStarted[m[1]] || prog.startedAt;
    if (startMs) {
      const c = mk(T.started);
      const inp = document.createElement('input');
      inp.type = 'date'; inp.className = 'nh-bd-dt-inp'; inp.title = T.editStart;
      inp.readOnly = true;
      inp.value = nhBdIso(startMs);
      inp.addEventListener('change', () => {
        if (!inp.value) return;
        const p = inp.value.split('-');
        const ms = new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0).getTime();
        inp.classList.add('nh-bd-dt-saving');
        // Our own store, not ABS: it accepts startedAt and then keeps its own
        // value on every route that exists (verified five ways).
        fetch('/_nh/api/dates', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + nhRtToken(), 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemId: m[1], startedAt: ms })
        }).then((r) => {
          inp.classList.remove('nh-bd-dt-saving');
          if (r.ok) { nhBdStarted[m[1]] = ms; box.dataset.sig = ''; }
        }).catch(() => { inp.classList.remove('nh-bd-dt-saving'); });
      });
      c.appendChild(wrapDate(inp));
      box.appendChild(c);
    }
    if (prog.finishedAt) {
      const c = mk(T.finished);
      const inp = document.createElement('input');
      inp.type = 'date'; inp.className = 'nh-bd-dt-inp'; inp.title = T.edit;
      inp.readOnly = true;
      inp.value = nhBdIso(prog.finishedAt);
      inp.addEventListener('change', () => {
        if (!inp.value) return;
        const p = inp.value.split('-');
        const ms = new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0).getTime();
        inp.classList.add('nh-bd-dt-saving');
        fetch('/api/me/progress/' + m[1], {
          method: 'PATCH',
          headers: { Authorization: 'Bearer ' + nhRtToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ finishedAt: ms })
        }).then((r) => {
          inp.classList.remove('nh-bd-dt-saving');
          if (!r.ok) return;
          try {
            window.$nuxt.$store.state.user.user.mediaProgress.forEach((x) => { if (x.libraryItemId === m[1]) x.finishedAt = ms; });
          } catch (e) {}
        }).catch(() => { inp.classList.remove('nh-bd-dt-saving'); });
      });
      c.appendChild(wrapDate(inp));
      box.appendChild(c);
    }
    if (!box.childNodes.length) { if (box.parentNode) box.remove(); return; }
    if (box.previousElementSibling !== host || box.parentNode !== host.parentNode) {
      host.parentNode.insertBefore(box, host.nextSibling);
    }
  }

  // ---- Report a problem -----------------------------------------------------
  // Deliberately NOT injected into ABS's three-dot menu. That button is a wrapper
  // that is not directly clickable, its dropdown markup has changed between ABS
  // builds, and an entry hidden in there could not be verified end to end. A
  // labelled link under the metadata is always present, testable, and easier to
  // find when something is actually wrong with a book.
  const NH_RP_REASONS = ['missing', 'quality', 'play', 'wrong', 'chapters', 'other'];
  const NH_RP_T = {
    en: { menu: 'Report a problem', title: 'Report a problem', what: 'What is wrong?', note: 'Anything else the admin should know? (optional)', send: 'Send report', sent: 'Sent. Thanks.', fail: 'Could not send',
      missing: 'Missing or incomplete content', quality: 'Bad audio quality', play: 'Will not play', wrong: 'Wrong book, cover or metadata', chapters: 'Chapters are wrong', other: 'Something else' },
    pl: { menu: 'Zgłoś problem', title: 'Zgłoś problem', what: 'Co jest nie tak?', note: 'Coś jeszcze, co powinien wiedzieć administrator? (opcjonalnie)', send: 'Wyślij zgłoszenie', sent: 'Wysłano. Dzięki.', fail: 'Nie udało się wysłać',
      missing: 'Brakująca lub niepełna treść', quality: 'Zła jakość dźwięku', play: 'Nie odtwarza się', wrong: 'Zła książka, okładka lub metadane', chapters: 'Błędne rozdziały', other: 'Coś innego' },
    de: { menu: 'Problem melden', title: 'Problem melden', what: 'Was stimmt nicht?', note: 'Sonst noch etwas für die Administration? (optional)', send: 'Meldung senden', sent: 'Gesendet. Danke.', fail: 'Senden fehlgeschlagen',
      missing: 'Fehlender oder unvollständiger Inhalt', quality: 'Schlechte Tonqualität', play: 'Spielt nicht ab', wrong: 'Falsches Buch, Cover oder Metadaten', chapters: 'Kapitel stimmen nicht', other: 'Etwas anderes' },
    fr: { menu: 'Signaler un problème', title: 'Signaler un problème', what: 'Quel est le problème ?', note: 'Autre chose à signaler ? (facultatif)', send: 'Envoyer', sent: 'Envoyé. Merci.', fail: 'Envoi impossible',
      missing: 'Contenu manquant ou incomplet', quality: 'Mauvaise qualité audio', play: 'Ne se lit pas', wrong: 'Mauvais livre, couverture ou métadonnées', chapters: 'Chapitres incorrects', other: 'Autre chose' },
    es: { menu: 'Informar de un problema', title: 'Informar de un problema', what: '¿Qué ocurre?', note: '¿Algo más que deba saber el administrador? (opcional)', send: 'Enviar informe', sent: 'Enviado. Gracias.', fail: 'No se pudo enviar',
      missing: 'Contenido ausente o incompleto', quality: 'Mala calidad de audio', play: 'No se reproduce', wrong: 'Libro, portada o metadatos incorrectos', chapters: 'Capítulos incorrectos', other: 'Otra cosa' }
  };
  function nhRpT() {
    // The shared panel dictionary carries rp* in every language (round 12);
    // the local table below stays as the fallback shape.
    try {
      const T = window.__nhPanelT && window.__nhPanelT();
      if (T && T.rpTitle) {
        return { menu: T.rpMenu, title: T.rpTitle, what: T.rpWhat, note: T.rpNote, send: T.rpSend, sent: T.rpSent, fail: T.rpFail,
          missing: T.rpMissing, quality: T.rpQuality, play: T.rpPlay, wrong: T.rpWrong, chapters: T.rpChapters, other: T.rpOther };
      }
    } catch (e) {}
    return NH_RP_T[(nhRtLang().split('-')[0] || 'en').toLowerCase()] || NH_RP_T.en;
  }

  function nhRpDialog(itemId, title) {
    const T = nhRpT();
    const old = document.getElementById('nh-rp-modal'); if (old) old.remove();
    const overlay = document.createElement('div'); overlay.id = 'nh-rp-modal';
    const bg = document.createElement('div'); bg.className = 'nh-rt-modal-bg';
    const box = document.createElement('div'); box.className = 'nh-rt-modal-box';
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    bg.addEventListener('click', close);
    const head = document.createElement('div'); head.className = 'nh-rt-modal-head';
    const h = document.createElement('span'); h.textContent = T.title;
    const x = document.createElement('button'); x.type = 'button'; x.className = 'nh-rt-modal-x'; x.textContent = '×';
    x.addEventListener('click', close);
    head.appendChild(h); head.appendChild(x); box.appendChild(head);

    const bk = document.createElement('p'); bk.className = 'nh-rp-book'; bk.textContent = title || '';
    box.appendChild(bk);
    const lbl = document.createElement('p'); lbl.className = 'nh-rp-lbl'; lbl.textContent = T.what;
    box.appendChild(lbl);
    // A real radio group: keyboard-navigable and announced correctly, unlike a
    // row of divs.
    const group = document.createElement('div'); group.className = 'nh-rp-reasons';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', T.what);
    let chosen = '';
    NH_RP_REASONS.forEach((key, idx) => {
      const id = 'nh-rp-r-' + key;
      const row = document.createElement('label'); row.className = 'nh-rp-reason'; row.htmlFor = id;
      const inp = document.createElement('input');
      inp.type = 'radio'; inp.name = 'nh-rp-reason'; inp.id = id; inp.value = key;
      if (idx === 0) { inp.checked = true; chosen = key; }
      inp.addEventListener('change', () => { if (inp.checked) chosen = key; });
      const span = document.createElement('span'); span.textContent = T[key];
      row.appendChild(inp); row.appendChild(span);
      group.appendChild(row);
    });
    box.appendChild(group);

    const ta = document.createElement('textarea');
    ta.id = 'nh-rp-note'; ta.maxLength = 600; ta.placeholder = T.note;
    box.appendChild(ta);

    const acts = document.createElement('div'); acts.className = 'nh-rt-actions';
    const send = document.createElement('button'); send.type = 'button'; send.className = 'nh-rt-btn'; send.textContent = T.send;
    const status = document.createElement('span'); status.className = 'nh-rt-status';
    send.addEventListener('click', () => {
      send.disabled = true; status.textContent = '…';
      fetch('/_nh/api/reports', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + nhRtToken(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId: itemId, title: title || '', reason: chosen, note: ta.value || '' })
      }).then((r) => {
        if (!r.ok) { send.disabled = false; status.textContent = T.fail; return; }
        status.textContent = T.sent;
        setTimeout(close, 1100);
      }).catch(() => { send.disabled = false; status.textContent = T.fail; });
    });
    acts.appendChild(send); acts.appendChild(status);
    box.appendChild(acts);
    overlay.appendChild(bg); overlay.appendChild(box); document.body.appendChild(overlay);
  }

  // Preferred home for the report action: FIRST entry of the book page's
  // three-dot menu. That menu is a Vue component whose `items` array we can
  // unshift into — far more robust than injecting DOM into a dropdown whose
  // markup ABS has changed before. Its action name is ours, so the emit is
  // intercepted here rather than handed to ABS, which would not know it.
  function nhKebabReport() {
    // The tracks table's row kebabs also carry [aria-haspopup=menu] — and sit
    // earlier in the DOM, which is exactly how the entry first shipped into the
    // WRONG menu (Pawel's screenshot: Report above Download/Delete/More Info).
    // The real item menu is the ui-context-menu-dropdown in the Play-button row;
    // it has NO aria-haspopup, so it is identified by its vm's own items
    // (Collections / Playlists / …), never by markup.
    // First, take the entry back out of any tracks menu it was put into.
    document.querySelectorAll('#item-page-wrapper .tracksTable [aria-haspopup="menu"], #item-page-wrapper table [aria-haspopup="menu"]').forEach((el) => {
      let tvm = null;
      try { tvm = el.__vue__ || (el.parentElement && el.parentElement.__vue__); } catch (e) {}
      if (tvm && Array.isArray(tvm.items)) {
        const idx = tvm.items.findIndex((x) => x && x.action === 'nh-report');
        if (idx >= 0) tvm.items.splice(idx, 1);
      }
    });
    let vm = null;
    const cands = document.querySelectorAll('#item-page-wrapper div.relative');
    for (const el of cands) {
      if (el.closest('.tracksTable, table')) continue;
      let cvm = null;
      try { cvm = el.__vue__; } catch (e) {}
      // 'playlists' too, not just 'collections': Collections needs the update
      // permission, so a REGULAR user's item menu is e.g. [playlists, download]
      // and matching on collections alone left them the fallback link (Pawel).
      // Playlists is in every signed-in user's item menu; download alone is NOT
      // a valid marker — the tracks-table kebabs are download-only.
      if (cvm && Array.isArray(cvm.items) &&
          cvm.items.some((x) => x && (x.action === 'collections' || x.action === 'playlists' || x.action === 'nh-report'))) { vm = cvm; break; }
    }
    if (!vm || !Array.isArray(vm.items)) return false;
    if (!vm.__nhRpHooked) {
      vm.__nhRpHooked = true;
      const orig = vm.$emit.bind(vm);
      vm.$emit = function (name) {
        const args = Array.prototype.slice.call(arguments, 1);
        const a = args[0];
        const act = a && (a.action || a);
        if (act === 'nh-report') {
          const mm = window.location.pathname.match(/\/item\/([^/?#]+)/);
          const h1 = document.querySelector('#item-page-wrapper h1');
          if (mm) nhRpDialog(mm[1], h1 ? h1.textContent.trim() : '');
          return;                       // never forward an action ABS cannot handle
        }
        return orig.apply(vm, arguments);
      };
    }
    // `items` may be recomputed by ABS; the guard means the tick simply re-adds it.
    if (!vm.items.some((x) => x && x.action === 'nh-report')) {
      vm.items.unshift({ text: nhRpT().menu, action: 'nh-report' });
    }
    return true;
  }

  function nhReportLink() {
    const m = window.location.pathname.match(/\/item\/([^/?#]+)/);
    const host = document.querySelector('.nh-metadata-container');
    const old = document.getElementById('nh-rp-link');
    if (!m || !host) { if (old) old.remove(); return; }
    // In the menu is where Pawel wants it. The standalone link stays only as a
    // fallback for a build where the menu component is not what we expect —
    // otherwise the feature would simply vanish.
    if (nhKebabReport()) { if (old) old.remove(); return; }
    let btn = old;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button'; btn.id = 'nh-rp-link';
      btn.innerHTML = '<span class="material-symbols">flag</span>';
      btn.appendChild(document.createTextNode(' ' + nhRpT().menu));
      btn.addEventListener('click', () => {
        const h1 = document.querySelector('#item-page-wrapper h1');
        const mm = window.location.pathname.match(/\/item\/([^/?#]+)/);
        if (mm) nhRpDialog(mm[1], h1 ? h1.textContent.trim() : '');
      });
    }
    // after the dates block when there is one, otherwise straight after metadata
    const dates = document.getElementById('nh-bd-dates');
    const anchor = (dates && dates.parentNode === host.parentNode) ? dates : host;
    if (btn.previousElementSibling !== anchor || btn.parentNode !== anchor.parentNode) {
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    }
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

  // Ink-aware clip so a half star splits at the glyph's visual middle — the
  // shared helper lives in enhancements.js (always loaded first); the naive
  // row-percentage stays as the fallback shape.
  function nhRtFillSet(wrap, fill, v) {
    if (window.__nhStarFill) { window.__nhStarFill(wrap, fill, v); return; }
    fill.style.width = (Math.max(0, Math.min(5, v || 0)) / 5 * 100) + '%';
  }

  // Every rating number on this page, formatted for the chosen precision — a
  // hardcoded toFixed(1) turned a 4.25 quarter-star rating into "4.3".
  function nhRtStarText(v) {
    return window.__nhStarText ? window.__nhStarText(v) : String(Number((+v || 0).toFixed(2)));
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
    wrap.appendChild(base); wrap.appendChild(fill);
    nhRtFillSet(wrap, fill, value || 0);
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
    // Moderating someone else's rating goes through the admin-gated twin of the
    // endpoint: admin-ness is proven by nginx replaying the token against an
    // admin-only ABS route, because the token itself no longer says.
    const url = forUser ? '/_nh/api/ratings-admin' : '/_nh/api/ratings';
    fetch(url, { method: 'POST', headers: nhRtHeaders(true), credentials: 'include', body: JSON.stringify(body) })
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
        // Let the card badges / library filter (enhancements.js) patch their
        // shared ratings map without a refetch.
        try { window.dispatchEvent(new CustomEvent('nh-rating-change', { detail: { itemId: body.itemId, ratings: nhRt.ratings } })); } catch (e) {}
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
    const setFill = v => nhRtFillSet(picker, picker._fill, v);
    // Always present, even before anyone has rated: it is the readout the hover
    // preview writes into, and with quarter stars the number is the only way to
    // tell 4.25 from 4.5 while dragging along the row.
    const score = document.createElement('span');
    score.className = 'nh-rt-score';
    score.textContent = entries.length ? nhRtStarText(avg) : '';
    const restoreScore = () => {
      score.textContent = entries.length ? nhRtStarText(avg) : '';
      score.classList.remove('nh-rt-score-preview');
    };
    if (me) {
      picker.title = T.rateHint;
      const valFrom = e => {
        const rect = picker.getBoundingClientRect();
        const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        // Rating precision is a setting (full / half / quarter stars); the step
        // comes from enhancements.js, which is injected before this file.
        const st = (window.__nhStarStep && window.__nhStarStep()) || 0.5;
        const v = Math.ceil(((cx - rect.left) / rect.width) * (5 / st)) * st;
        return Math.max(st, Math.min(5, v));
      };
      const preview = v => {
        setFill(v);
        score.textContent = nhRtStarText(v);
        score.classList.add('nh-rt-score-preview');
      };
      picker.addEventListener('mousemove', e => preview(valFrom(e)));
      picker.addEventListener('mouseleave', () => { setFill(avg); restoreScore(); });
      picker.addEventListener('click', e => {
        status.textContent = '…';
        nhRtSave(valFrom(e), nhRt.editorOpen ? (nhRt.draft || '') : ((mine && mine.review) || ''), null, status);
      });
    }
    main.appendChild(picker);
    main.appendChild(score);

    if (entries.length) {
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
      num.textContent = nhRtStarText(mine.stars);
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
        num.textContent = nhRtStarText(e.stars);
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
    // A leftover series-mounted instance (enhancements' header can outlive the
    // route by a tick) must never be adopted as the book-page section.
    if (section && section.dataset.nhExternal === '1') { section.remove(); section = null; }

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

  // Series-page mount API: enhancements.js calls this every tick from the series
  // header with key "series:<seriesId>". It reuses the SAME widget state, renderer
  // and endpoints — a book page and a series page never coexist, so one instance
  // serves both. Returns true while the widget is (or just became) live; false
  // when disabled, torn down, or the backend is absent. Call with a null host to
  // tear down (also clears the body-level reviews popup and the shared state).
  window.__nhRatingsMount = function (host, key) {
    let section = document.getElementById('nh-ratings');
    const external = section && section.dataset.nhExternal === '1';
    if (!host || !host.isConnected || !key || !nhRtEnabled()) {
      // Tear down only what a series mount owns: the external section, the popup,
      // and series-keyed state. Book-page sections are nhRtMaintain's business.
      if (external || (!section && nhRt.itemId && nhRt.itemId.indexOf('series:') === 0)) {
        if (external) section.remove();
        const modal = document.getElementById('nh-rt-modal');
        if (modal) modal.remove();
        clearTimeout(nhRt.timer);
        nhRt.itemId = null;
      }
      return false;
    }
    // Backend absent (404) or retries exhausted for this key: stay hidden quietly —
    // recreating the section would refetch in a loop.
    if (nhRt.itemId === key && (nhRt.gone || nhRt.dead)) {
      if (external) section.remove();
      return false;
    }
    if (section && (!external || section.parentNode !== host)) { section.remove(); section = null; }
    const recreated = !section;
    if (!section) {
      section = document.createElement('div');
      section.id = 'nh-ratings';
      section.dataset.nhExternal = '1';
      host.appendChild(section);
    }
    if (nhRt.itemId !== key || recreated) {
      if (nhRt.itemId !== key) {
        nhRt.gone = false; nhRt.dead = false; nhRt.tries = 0;
        nhRt.editorOpen = false; nhRt.draft = null; nhRt.modalOpen = false;
      }
      nhRt.itemId = key;
      nhRt.ratings = null;
      clearTimeout(nhRt.timer);
      nhRtRender();
      nhRtFetch(key);
    }
    return true;
  };

  function enhanceBookDetails() {
    try { nhDescParagraphs(); } catch (e) {}
    try { nhBdDates(); } catch (e) {}
    try { nhReportLink(); } catch (e) {}
      const isBookPage = window.location.pathname.includes('/item/') || window.location.pathname.includes('/audiobook/');
      const pageWrapper = document.getElementById('page-wrapper');

      // Toggle cinematic mode based on page
      if (!isBookPage) {
          if (pageWrapper) pageWrapper.classList.remove('nh-cinematic-mode');
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
          // Placeholder artwork (item has no cover file): there is nothing to
          // upgrade — mark the container done anyway, or the page-reveal mask
          // waits its full failsafe for a swap that can never happen.
          if (origImg && origImg.src && !origImg.src.includes('/api/items/')) {
              detailsCoverContainer.dataset.hdFixed = 'true';
          }
          if (origImg && origImg.src && origImg.src.includes('/api/items/')) {
              detailsCoverContainer.dataset.hdFixed = 'true';

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

              // The original is NEVER hidden. The clone copies its class list, so it
              // is positioned identically and simply sits on top once it decodes;
              // until then, and if it never does, ABS's own cover is what shows.
              //
              // This used to set origImg.style.opacity = '0' the moment the swap
              // started, which is how a book could open with no cover at all: Vue owns
              // that <img> and re-renders the subtree freely, so the ordering
              //   we hide the original -> we append the clone -> Vue patches, keeps the
              //   hidden original and drops our clone
              // leaves an empty box until something re-renders it. It reproduced as
              // "sometimes", because whether Vue patches in that window depends on
              // timing and on whether the 800px derivative was already cached (ABS
              // generates those on demand, so a first view can take seconds).
              // Not hiding it removes the failure mode outright rather than narrowing
              // the window: there is no state in which the cover box is empty.
              clone.addEventListener('error', () => { if (clone.parentNode) clone.remove(); });

              clone.src = highResSrc;
              detailsCoverContainer.appendChild(clone);
              if (clone.complete && !clone.naturalWidth) clone.remove(); // already failed

              const wrapperLink = detailsCoverContainer.closest('.relative.rounded-xs');
              if (wrapperLink) {
                  wrapperLink.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showFullscreenCover(clone.src);
                  }, true);
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

  // Reactive scheduler (mirrors enhancements.js): run within ~80ms of DOM changes so
  // the item-page redesign (and thus the page-reveal mask) lands as soon as Vue
  // mounts, instead of on the next 500ms poll. enhanceBookDetails is idempotent
  // Rebuild a plain-text description into paragraphs. Only when ABS rendered it
  // as raw text (no element children) — an HTML description is left untouched.
  // Vue owns this node: if it ever patches the text back in, the stamp no longer
  // matches and we simply rebuild, so the two cannot fight.
  function nhDescParagraphs() {
    const d = document.getElementById('item-description');
    if (!d) return;
    if (d.children.length && !d.classList.contains('nh-desc-para')) return; // real HTML description
    const text = (d.classList.contains('nh-desc-para') ? (d.dataset.nhSrc || '') : d.textContent) || '';
    if (!/\n\s*\n/.test(text)) return;
    const stamp = String(text.length) + ':' + text.slice(0, 48);
    if (d.dataset.nhPara === stamp) return;
    const parts = text.split(/\n\s*\n+/).map((x) => x.trim()).filter(Boolean);
    if (parts.length < 2) return;
    d.dataset.nhPara = stamp;
    d.dataset.nhSrc = text;
    d.textContent = '';
    parts.forEach((t) => {
      const el = document.createElement('p');
      el.className = 'nh-desc-p';
      el.textContent = t;
      d.appendChild(el);
    });
    d.classList.add('nh-desc-para');
  }

  // (dataset markers guard every mutation), so settled pages go quiet.
  let bdTickQueued = false;
  let bdLastTickAt = 0;
  function bdQueueTick() {
    if (bdTickQueued) return;
    bdTickQueued = true;
    requestAnimationFrame(() => {
      const wait = Math.max(0, 80 - (Date.now() - bdLastTickAt));
      setTimeout(() => {
        bdTickQueued = false;
        bdLastTickAt = Date.now();
        try { enhanceBookDetails(); } catch (e) {}
      }, wait);
    });
  }
  try {
    new MutationObserver(bdQueueTick).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  // Heartbeat fallback for non-DOM state changes
  setInterval(enhanceBookDetails, 500);
})();