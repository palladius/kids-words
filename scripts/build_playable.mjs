import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVELS_IT } from '../src/levels_it.mjs';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LevelProgression } from '../src/progression.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const APP_VERSION = PKG.version || '1.2.0';

function loadAssetDataUri(filename) {
  const filePath = path.join(PUBLIC_DIR, 'assets', filename);
  const buf = fs.readFileSync(filePath);
  return 'data:image/webp;base64,' + buf.toString('base64');
}

const SCENES_IMG = {
  bees_meadow: loadAssetDataUri('ale_seby_bees_meadow.webp'),
  alpine_sun: loadAssetDataUri('ale_seby_alpine_sun.webp'),
  dragon_forest: loadAssetDataUri('ale_seby_dragon_forest.webp'),
  aquarium: loadAssetDataUri('ale_seby_aquarium.webp'),
  zurich_stars: loadAssetDataUri('ale_seby_zurich_stars.webp'),
  knight_woods: loadAssetDataUri('ale_seby_knight_woods.webp')
};

const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>🔤 Kids Words v${APP_VERSION} — Parole in Fuga (Ale & Seby)</title>
  <script type="module" src="./src/puffin-login.js"></script>
  <style>
    :root {
      --seby-color: #2563eb;
      --ale-color: #dc2626;
      --gold: #f59e0b;
      --radius: 16px;
      --tile: 62px;
      --gap: 8px;
      --font-sans: 'Nunito', 'Fredoka', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
    body {
      margin: 0;
      padding: 8px;
      background: #0b1120;
      color: #f8fafc;
      font-family: var(--font-sans);
    }
    .kw-root {
      font-family: var(--font-sans);
      color: #f8fafc;
      max-width: 560px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .kw-topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: rgba(15, 23, 42, 0.94);
      color: #f8fafc;
      padding: 8px 14px;
      border-radius: var(--radius);
      border: 1px solid rgba(255, 255, 255, 0.16);
      min-height: 48px;
    }
    .kw-profiles { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .kw-profile-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 999px;
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .kw-profile-btn.active[data-tier="seby"] {
      background: var(--seby-color);
      border-color: #93c5fd;
    }
    .kw-profile-btn.active[data-tier="ale"] {
      background: var(--ale-color);
      border-color: #fca5a5;
    }
    .kw-level-nav { display: flex; align-items: center; gap: 6px; }
    .kw-pill-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 10px;
      padding: 5px 10px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .kw-pill-btn:hover { background: rgba(255, 255, 255, 0.25); }

    /* =====================================================================
     * IMMUTABLE STAGE LAYOUT (Mobile-first 5-row vertical stack)
     * Matrix container NEVER shifts by 1px on swipe or comic explanation!
     * ===================================================================== */
    .kw-stage {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
      height: 626px;
      min-height: 626px;
      max-height: 626px;
      display: grid;
      grid-template-rows: 130px 34px 286px 74px 44px;
      grid-template-columns: 1fr;
      grid-template-areas:
        "hud"
        "swipe"
        "grid"
        "dock"
        "footer";
      gap: 6px;
      padding: 10px;
      color: #fff;
      background: #0f172a;
    }
    .kw-bg-art {
      position: absolute;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    }
    .kw-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
      transition: filter 0.35s ease, transform 0.35s ease;
    }
    .kw-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.38) 0%,
        rgba(15, 23, 42, 0.04) 40%,
        rgba(15, 23, 42, 0.08) 72%,
        rgba(15, 23, 42, 0.48) 100%
      );
      pointer-events: none;
    }

    /* COMPACT GROUPED WORD BANK (3-3-3 | 4-4-4 | 5-5) */
    .kw-hud-top {
      grid-area: hud;
      position: relative;
      z-index: 2;
      height: 130px;
      min-height: 130px;
      max-height: 130px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(8px);
      padding: 7px 10px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    .kw-theme-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      flex-shrink: 0;
      gap: 8px;
    }
    .kw-targets {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;
      gap: 6px 14px;
      flex: 1;
      overflow-y: auto;
    }
    .kw-len-group {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 3px 4px;
      padding-right: 6px;
      border-right: 1px solid rgba(255, 255, 255, 0.18);
    }
    .kw-len-group:last-child {
      border-right: none;
      padding-right: 0;
    }
    .kw-len-tag {
      font-size: 10px;
      font-weight: 900;
      color: #fde68a;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 5px;
      padding: 1px 4px;
      margin-right: 2px;
      line-height: 1.2;
    }
    .kw-word-slot {
      display: inline-flex;
      align-items: center;
      gap: 1.5px;
      background: rgba(15, 23, 42, 0.85);
      padding: 2px 4px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      cursor: pointer;
      height: 19px;
      font-size: 10px;
    }
    .kw-word-slot.solved {
      background: rgba(22, 163, 74, 0.94);
      border-color: #86efac;
      padding: 2px 5px;
    }
    .kw-slot-box {
      width: 11px;
      height: 13px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.16);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 10px;
      color: #fff;
      line-height: 1;
    }
    .kw-word-slot.solved .kw-slot-box {
      background: transparent;
      width: auto;
      padding: 0 0.5px;
      letter-spacing: 0.4px;
    }

    /* SWIPE LIVE WORD BAR (opacity/visibility only — NEVER display:none!) */
    .kw-swipe-slot {
      grid-area: swipe;
      position: relative;
      z-index: 3;
      height: 34px;
      min-height: 34px;
      max-height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .kw-current-word {
      height: 30px;
      min-width: 96px;
      padding: 0 16px;
      border-radius: 999px;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      font-size: 16px;
      letter-spacing: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border: 2px solid #fffbeb;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.92);
      transition: opacity 0.12s ease, transform 0.12s ease;
    }
    .kw-current-word.visible {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }

    /* IMMUTABLE MATRIX SLOT */
    .kw-grid-slot {
      grid-area: grid;
      position: relative;
      z-index: 2;
      height: 286px;
      min-height: 286px;
      max-height: 286px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kw-grid-wrap {
      position: relative;
      touch-action: none;
      transition: opacity 0.25s ease;
    }
    .kw-stage.peeking .kw-grid-wrap {
      opacity: 0.06;
      pointer-events: none;
    }
    .kw-grid {
      display: grid;
      gap: var(--gap);
      position: relative;
    }
    .kw-svg-laser {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 4;
    }
    .kw-tile {
      width: var(--tile);
      height: var(--tile);
      border-radius: 15px;
      background: rgba(255, 251, 235, 0.88);
      backdrop-filter: blur(4px);
      border: 3px solid #f59e0b;
      box-shadow: 0 4px 0 #b45309, 0 8px 14px rgba(0, 0, 0, 0.38);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.12s ease, opacity 0.35s ease, background-color 0.12s ease;
    }
    .kw-tile-letter {
      font-size: 25px;
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
      pointer-events: none;
    }
    .kw-tile-dep {
      position: absolute;
      top: 3px;
      right: 4px;
      font-size: 10px;
      font-weight: 800;
      color: #92400e;
      background: rgba(245, 158, 11, 0.25);
      border-radius: 999px;
      padding: 0 4px;
      pointer-events: none;
    }
    .kw-tile.selected {
      background: #fde047;
      border-color: #ca8a04;
      box-shadow: 0 4px 0 #854d0e, 0 0 16px rgba(250, 204, 21, 0.9);
      transform: scale(1.04);
    }
    .kw-tile.hinted {
      border-color: #22c55e;
      box-shadow: 0 4px 0 #15803d, 0 0 18px rgba(34, 197, 94, 0.95);
    }
    .kw-tile.depleted {
      opacity: 0;
      transform: scale(0.15) rotate(12deg);
      pointer-events: none;
    }

    /* BOTTOM COMIC / EXPLANATION DOCK */
    .kw-bottom-dock {
      grid-area: dock;
      position: relative;
      z-index: 3;
      height: 74px;
      min-height: 74px;
      max-height: 74px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kw-comic-bubble {
      width: 100%;
      max-width: 640px;
      height: 70px;
      background: rgba(255, 251, 235, 0.96);
      color: #1e293b;
      border: 3px solid #f59e0b;
      border-radius: 16px;
      padding: 6px 14px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .kw-comic-bubble.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .kw-comic-emoji { font-size: 26px; flex-shrink: 0; }
    .kw-comic-text {
      font-size: 13px;
      line-height: 1.25;
      font-weight: 700;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .kw-comic-badge {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #f59e0b;
      font-size: 10px;
      font-weight: 900;
      padding: 1px 6px;
      border-radius: 999px;
      margin-left: 4px;
    }

    /* FOOTER */
    .kw-footer {
      grid-area: footer;
      position: relative;
      z-index: 2;
      height: 44px;
      min-height: 44px;
      max-height: 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(8px);
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      font-size: 12px;
      overflow: hidden;
    }
    .kw-footer-meta {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 48%;
    }
    .kw-action-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: 900;
      border: none;
      border-radius: 9px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      white-space: nowrap;
    }

    /* =====================================================================
     * DESKTOP WIDESCREEN INTELLIGENT LAYOUT (>= 940px)
     * Uses extra screen width so the full cartoon artwork breathes cleanly
     * on the left while the grouped words flow naturally without scrollbars
     * and the immutable swipe matrix occupies the right column!
     * ===================================================================== */
    @media (min-width: 940px) {
      .kw-root {
        max-width: 1160px;
        padding-top: 6px;
      }
      .kw-stage {
        height: 676px;
        min-height: 676px;
        max-height: 676px;
        padding: 16px;
        gap: 10px 18px;
        grid-template-columns: 1.22fr 0.78fr;
        grid-template-rows: 166px 34px 306px 74px 44px;
        grid-template-areas:
          "hud   swipe"
          "hud   grid"
          "art   grid"
          "dock  dock"
          "footer footer";
      }
      .kw-hud-top {
        height: auto;
        min-height: 0;
        max-height: none;
        padding: 10px 14px;
      }
      .kw-targets {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        gap: 6px 12px;
        overflow: visible;
      }
      .kw-len-group {
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        padding-right: 10px;
        gap: 4px 5px;
      }
      .kw-grid-slot {
        height: 350px;
        min-height: 350px;
        max-height: 350px;
        align-self: center;
      }
      .kw-comic-bubble {
        max-width: 940px;
      }
      .kw-footer-meta {
        max-width: 66%;
      }
    }

    .kw-bonus-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #fde68a;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
    }
    .kw-bonus-pill:hover {
      background: rgba(245, 158, 11, 0.32);
    }
    .kw-treasure-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-content: flex-start;
      overflow-y: auto;
      flex: 1;
      padding: 4px 0;
    }
    .kw-treasure-chip {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      color: #fef3c7;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    /* ALBUM OVERLAY MODAL */
    .kw-album-modal {
      position: absolute;
      inset: 12px;
      z-index: 10;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      border: 2px solid #f59e0b;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .kw-album-modal.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    .kw-album-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 900;
      font-size: 16px;
      color: #fde68a;
    }
    .kw-album-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      flex: 1;
      overflow-y: auto;
    }
    .kw-album-card {
      background: rgba(30, 41, 59, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.14s ease, border-color 0.14s ease;
    }
    .kw-album-card:hover {
      transform: translateY(-2px);
      border-color: #f59e0b;
    }
    .kw-album-card img {
      width: 100%;
      height: 145px;
      object-fit: cover;
      display: block;
    }
    .kw-album-card-caption {
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.25;
      color: #f8fafc;
    }
    .kw-album-card.locked {
      opacity: 0.55;
      filter: grayscale(0.5);
    }
    .kw-pill-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .kw-debug-hidden {
      visibility: hidden;
      pointer-events: none;
    }
    .kw-hof-wrap {
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 16px;
      padding: 14px;
      margin-top: 4px;
    }
    .kw-app-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 12px;
      color: #94a3b8;
    }
    .kw-app-footer a {
      color: #93c5fd;
      text-decoration: none;
      font-weight: 700;
    }
    .kw-app-footer a:hover {
      text-decoration: underline;
      color: #fde68a;
    }
  </style>
</head>
<body>
  <div class="kw-root">
    <div class="kw-topbar">
      <div class="kw-profiles">
        <button class="kw-profile-btn active" data-tier="seby" id="btn-tier-seby">🏎️ Seby (3×3/3×4)</button>
        <button class="kw-profile-btn" data-tier="ale" id="btn-tier-ale">🐉 Ale / Sfida (3×4 · 3×5 · 4×4)</button>
      </div>
      <div class="kw-level-nav">
        <button class="kw-pill-btn" id="btn-prev-lvl" title="Livello precedente">◀</button>
        <span id="lbl-level-idx" style="font-size:12px;font-weight:800;">Livello 1 / 3</span>
        <button class="kw-pill-btn" id="btn-next-lvl" title="Livello successivo">▶</button>
        <button class="kw-pill-btn" id="btn-album" title="Apri l'Album delle Foto Cartoon di Ale & Seby">🖼️ Album</button>
        <button class="kw-pill-btn" id="btn-hof-toggle" title="Classifica di Famiglia">🏆</button>
        <puffin-login id="puffin-widget" app-id="kids-words" lang="it" require-login="false"></puffin-login>
      </div>
    </div>

    <div class="kw-stage" id="kw-stage">
      <div class="kw-bg-art" id="kw-bg-art">
        <img class="kw-bg-img" id="kw-bg-img" alt="Illustrazione Cartoon Ale e Seby" />
        <div class="kw-bg-overlay"></div>
      </div>

      <!-- HUD TOP: Compact Word Bank grouped by length (3 | 4 | 5) -->
      <div class="kw-hud-top" id="kw-hud-top">
        <div class="kw-theme-row">
          <span id="lbl-theme">🐝 Il Prato delle Api</span>
          <span id="lbl-tiles-left" style="color:#fde68a;">Tessere attive: 9 · Parole: 0/11</span>
        </div>
        <div class="kw-targets" id="kw-targets"></div>
      </div>

      <!-- SWIPE LIVE WORD SLOT -->
      <div class="kw-swipe-slot" id="kw-swipe-slot">
        <div class="kw-current-word" id="kw-current-word"></div>
      </div>

      <!-- IMMUTABLE MATRIX SLOT -->
      <div class="kw-grid-slot" id="kw-grid-slot">
        <div class="kw-grid-wrap" id="kw-grid-wrap">
          <svg class="kw-svg-laser" id="kw-svg-laser"></svg>
          <div class="kw-grid" id="kw-grid"></div>
        </div>
      </div>

      <!-- BOTTOM COMIC / EXPLANATION DOCK (BELOW the matrix) -->
      <div class="kw-bottom-dock" id="kw-bottom-dock">
        <div class="kw-comic-bubble" id="kw-comic-bubble">
          <span class="kw-comic-emoji" id="kw-comic-emoji">🐝</span>
          <div class="kw-comic-text" id="kw-comic-text"></div>
        </div>
      </div>

      <!-- FOOTER CONTROLS -->
      <div class="kw-footer" id="kw-footer">
        <div class="kw-footer-meta">
          <span id="lbl-progress-badge" style="color:#93c5fd;font-weight:800;">👤 Anonimo</span> ·
          <button class="kw-bonus-pill" id="btn-treasure" title="Apri la Biscottiera Segreta delle parole extra trovate!">
            🍪 Segrete: <strong id="lbl-bonus-count">0</strong> / <span id="lbl-bonus-total">0</span>
          </button>
          <span id="lbl-scene-caption" style="margin-left:6px;opacity:0.85;"></span>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0;">
          <button class="kw-pill-btn" id="btn-peek" title="Clicca per ammirare Ale e Seby sullo sfondo">👀 Foto</button>
          <button class="kw-action-btn" id="btn-hint">💡 Aiuto</button>
          <button class="kw-action-btn kw-debug-hidden" id="btn-solve-one" title="Solo Papà Debug (Riccardo)" style="background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">✨ Indovina 1</button>
          <button class="kw-pill-btn" id="btn-reset">🔄 Rigioca</button>
        </div>
      </div>

      <!-- ALBUM OVERLAY MODAL -->
      <div class="kw-album-modal" id="kw-album-modal">
        <div class="kw-album-header">
          <span>🖼️ Galleria dei Ricordi di Ale & Seby (Clicca una scheda sbloccata per giocarla!)</span>
          <button class="kw-pill-btn" id="btn-album-close">✖ Chiudi</button>
        </div>
        <div class="kw-album-grid" id="kw-album-grid"></div>
      </div>

      <!-- TREASURE TROVE (BISCOTTIERA SEGRETA) MODAL -->
      <div class="kw-album-modal" id="kw-treasure-modal">
        <div class="kw-album-header">
          <span id="lbl-treasure-title">🍪 Biscottiera Segreta — Parole Bonus Trovate</span>
          <button class="kw-pill-btn" id="btn-treasure-close">✖ Chiudi</button>
        </div>
        <div style="font-size:13px;color:#cbd5e1;">
          Tutte le parole italiane reali in questa griglia (verificate su dizionario <em>it_IT</em>) che non erano tra le parole principali finiscono qui nel tuo tesoro segreto!
        </div>
        <div class="kw-treasure-chips" id="kw-treasure-chips"></div>
      </div>
    </div>

    <!-- HALL OF FAME (Hidden during gameplay; revealed on level completion or 🏆 button) -->
    <section id="hof-section" class="kw-hof-wrap" hidden>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h2 style="margin:0;font-size:16px;color:#fde68a;">🏆 Hall of Fame — Kids Words</h2>
        <button class="kw-pill-btn" id="btn-hof-close">⬅️ Torna al Gioco</button>
      </div>
      <puffin-leaderboard id="game-lb" filter-game="kids-words" back-href="./" lang="it"></puffin-leaderboard>
    </section>

    <!-- CARLESSIAN VERSION & GITHUB FOOTER -->
    <footer class="kw-app-footer" id="kw-app-footer">
      <div>
        <strong>🔤 Kids Words</strong> (<em>Parole in Fuga</em>) · <code style="color:#fde68a;">v${APP_VERSION}</code>
        <span style="margin-left:8px;">© Carlesso Family</span>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
        <a href="https://github.com/palladius/kids-words" target="_blank" rel="noopener noreferrer">🐙 GitHub (palladius/kids-words)</a>
        <a href="https://palladius.github.io/vetrina/" target="_blank" rel="noopener noreferrer">🎮 Vetrina</a>
        <a href="./ring.html">🔥💍 Puffin Ring</a>
      </div>
    </footer>
  </div>

  <script>
    const APP_VERSION = ${JSON.stringify(APP_VERSION)};
    const LEVELS_IT = ${JSON.stringify(LEVELS_IT)};
    const SCENES_IMG = ${JSON.stringify(SCENES_IMG)};
    ${KidsWordsEngine.toString()}
    ${LevelProgression.toString()}

    const progression = new LevelProgression({
      totalByTier: {
        seby: LEVELS_IT.filter(l => l.tier === 'seby').length,
        ale: LEVELS_IT.filter(l => l.tier === 'ale').length,
      },
      storage: typeof window !== 'undefined' ? window.localStorage : null,
    });

    let currentTier = 'seby';
    let currentIdx = 0;
    let engine = null;
    let dragPath = [];
    let isDragging = false;
    let hintedCoords = [];
    let levelStartedAt = new Date().toISOString();

    function getActiveUser() {
      try {
        return window.PuffinLogin ? window.PuffinLogin.getCurrentUser() : null;
      } catch {
        return null;
      }
    }

    function getActiveUserId() {
      const u = getActiveUser();
      return u ? u.id : null;
    }

    function getTierLevels() {
      return LEVELS_IT.filter(l => l.tier === currentTier);
    }

    function speakItalian(text) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'it-IT';
          u.rate = 0.95;
          u.pitch = 1.1;
          window.speechSynthesis.speak(u);
        }
      } catch (e) {}
    }

    function clampToUnlocked() {
      const uid = getActiveUserId();
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);
      if (currentIdx > maxUnlocked) {
        currentIdx = maxUnlocked;
      }
    }

    function loadLevel() {
      clampToUnlocked();
      const levels = getTierLevels();
      const lvl = levels[currentIdx % levels.length];
      engine = new KidsWordsEngine(lvl);
      dragPath = [];
      isDragging = false;
      hintedCoords = [];
      levelStartedAt = new Date().toISOString();
      document.getElementById('kw-stage').classList.remove('peeking');
      document.getElementById('kw-album-modal').classList.remove('visible');
      document.getElementById('kw-treasure-modal').classList.remove('visible');
      document.getElementById('kw-comic-bubble').classList.remove('visible');
      document.getElementById('kw-current-word').classList.remove('visible');
      renderAll();
    }

    function showComicBubble(emoji, title, text, badge = 'Spiegazione B1+') {
      const bubble = document.getElementById('kw-comic-bubble');
      document.getElementById('kw-comic-emoji').textContent = emoji || '💡';
      document.getElementById('kw-comic-text').innerHTML =
        '<strong>' + title + '</strong> <span class="kw-comic-badge">' + badge + '</span><br/>' + text;
      bubble.classList.add('visible');
    }

    function renderAll() {
      const levels = getTierLevels();
      const lvl = engine.level;
      const solvedCount = engine.solvedWords.size;
      const totalCount = lvl.targets.length;
      const uid = getActiveUserId();
      const user = getActiveUser();
      const isAdmin = progression.isAdmin(uid);
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);

      // Update level counter & lock indicator
      const lockStatus = isAdmin
        ? '👑'
        : (maxUnlocked >= levels.length - 1 ? '🔓' : '🔒 ' + (maxUnlocked + 1) + '/' + levels.length);
      document.getElementById('lbl-level-idx').textContent =
        'Livello ' + (currentIdx + 1) + ' / ' + levels.length + ' (' + lockStatus + ')';

      const prevBtn = document.getElementById('btn-prev-lvl');
      const nextBtn = document.getElementById('btn-next-lvl');
      prevBtn.disabled = currentIdx <= 0 && !isAdmin;
      nextBtn.disabled = currentIdx >= maxUnlocked && !isAdmin;
      nextBtn.title = nextBtn.disabled
        ? 'Completa questo livello per sbloccare il prossimo!'
        : 'Livello successivo';

      // Papà Debug button ONLY visible to riccardo!
      const solveOneBtn = document.getElementById('btn-solve-one');
      solveOneBtn.classList.toggle('kw-debug-hidden', !isAdmin);

      // Progress badge in footer
      const progEl = document.getElementById('lbl-progress-badge');
      if (isAdmin) {
        progEl.textContent = '👑 Papà Debug (tutti sbloccati)';
      } else if (user && user.id !== 'guest') {
        progEl.textContent = '🐧 ' + user.shortName + ' · Sbloccati: ' + (maxUnlocked + 1) + '/' + levels.length;
      } else {
        progEl.textContent = '👤 Anonimo (solo sessione · F5 resetta)';
      }

      document.getElementById('lbl-theme').textContent = lvl.theme;
      document.getElementById('lbl-scene-caption').textContent = '🎨 ' + lvl.scene_caption;
      document.getElementById('lbl-tiles-left').textContent =
        'Tessere attive: ' + engine.getActiveTileCount() + ' · Parole: ' + solvedCount + '/' + totalCount;
      document.getElementById('lbl-bonus-count').textContent = engine.bonusWordsFound.size;
      document.getElementById('lbl-bonus-total').textContent = (lvl.bonus_words || []).length;

      // Nano Banana Cartoon Character-Consistency Backdrop
      const bgImg = document.getElementById('kw-bg-img');
      const nextSrc = SCENES_IMG[lvl.scene_id] || SCENES_IMG.bees_meadow;
      if (bgImg.getAttribute('src') !== nextSrc) {
        bgImg.setAttribute('src', nextSrc);
      }

      // Target slots GROUPED BY LENGTH ascending (3 3 3 | 4 4 4 | 5 5)
      const targetsEl = document.getElementById('kw-targets');
      targetsEl.innerHTML = '';
      const sortedTargets = [...lvl.targets].sort((a, b) => a.word.length - b.word.length || a.word.localeCompare(b.word));
      const groups = new Map();
      for (const t of sortedTargets) {
        const len = t.word.length;
        if (!groups.has(len)) groups.set(len, []);
        groups.get(len).push(t);
      }

      for (const [len, items] of groups.entries()) {
        const groupEl = document.createElement('div');
        groupEl.className = 'kw-len-group';
        groupEl.dataset.wordLen = String(len);

        const tag = document.createElement('span');
        tag.className = 'kw-len-tag';
        tag.textContent = len + 'L';
        tag.title = items.length + ' parole da ' + len + ' lettere';
        groupEl.appendChild(tag);

        for (const t of items) {
          const solved = engine.solvedWords.has(t.word);
          const slot = document.createElement('div');
          slot.className = 'kw-word-slot' + (solved ? ' solved' : '');
          slot.title = solved ? 'Riascolta ' + t.word : 'Parola da ' + t.word.length + ' lettere';

          for (let i = 0; i < t.word.length; i++) {
            const box = document.createElement('span');
            box.className = 'kw-slot-box';
            box.textContent = solved ? t.word[i] : '';
            slot.appendChild(box);
          }

          if (solved && t.needs_explanation) {
            const infoDot = document.createElement('span');
            infoDot.textContent = ' ' + (t.emoji || '💡');
            infoDot.style.fontSize = '10px';
            slot.appendChild(infoDot);
          }

          slot.addEventListener('click', () => {
            if (solved) {
              if (t.needs_explanation) {
                showComicBubble(t.emoji, t.word, t.explanation_text, 'Parola Curiosa ' + t.cefr);
                speakItalian(t.word + '! ' + t.explanation_text);
              } else {
                showComicBubble(t.emoji || '🌟', t.word, 'Parola già scoperta! Clicca le altre per riascoltarle.', 'Parola ' + t.cefr);
                speakItalian(t.word);
              }
            }
          });
          groupEl.appendChild(slot);
        }
        targetsEl.appendChild(groupEl);
      }

      // Immutable Grid (62px tile + 8px gap = 70px pitch)
      const gridEl = document.getElementById('kw-grid');
      gridEl.style.gridTemplateColumns = 'repeat(' + lvl.grid.cols + ', var(--tile))';
      gridEl.innerHTML = '';
      for (let r = 0; r < lvl.grid.rows; r++) {
        for (let c = 0; c < lvl.grid.cols; c++) {
          const dep = engine.getDependencyCount(r, c);
          const tile = document.createElement('div');
          const isSel = dragPath.some(([pr, pc]) => pr === r && pc === c);
          const isHint = hintedCoords.some(([hr, hc]) => hr === r && hc === c);
          tile.className = 'kw-tile' +
            (dep === 0 ? ' depleted' : '') +
            (isSel ? ' selected' : '') +
            (isHint ? ' hinted' : '');
          tile.dataset.r = r;
          tile.dataset.c = c;
          tile.innerHTML =
            '<span class="kw-tile-dep" title="Parole residue che usano questa lettera">' + (dep > 0 ? dep + '×' : '') + '</span>' +
            '<span class="kw-tile-letter">' + lvl.grid.initial_letters[r][c] + '</span>';

          tile.addEventListener('pointerdown', (e) => {
            if (dep === 0) return;
            e.preventDefault();
            isDragging = true;
            dragPath = [[r, c]];
            updateDragVisuals();
          });

          tile.addEventListener('pointerenter', () => {
            if (!isDragging || dep === 0) return;
            stepToTile(r, c);
          });

          gridEl.appendChild(tile);
        }
      }
      drawLaser();
    }

    function stepToTile(r, c) {
      if (!engine.isTileActive(r, c)) return;
      if (dragPath.length >= 2) {
        const [prevR, prevC] = dragPath[dragPath.length - 2];
        if (prevR === r && prevC === c) {
          dragPath.pop();
          updateDragVisuals();
          return;
        }
      }
      const prev = dragPath[dragPath.length - 1];
      if (engine.isValidStep(prev, [r, c], dragPath)) {
        dragPath.push([r, c]);
        updateDragVisuals();
      }
    }

    function updateDragVisuals() {
      const curEl = document.getElementById('kw-current-word');
      if (dragPath.length > 0) {
        curEl.textContent = engine.spellFromPath(dragPath);
        curEl.classList.add('visible');
      } else {
        curEl.classList.remove('visible');
      }
      document.querySelectorAll('.kw-tile').forEach(el => {
        const r = Number(el.dataset.r);
        const c = Number(el.dataset.c);
        const isSel = dragPath.some(([pr, pc]) => pr === r && pc === c);
        el.classList.toggle('selected', isSel);
      });
      drawLaser();
    }

    function drawLaser() {
      const svg = document.getElementById('kw-svg-laser');
      if (dragPath.length < 2) {
        svg.innerHTML = '';
        return;
      }
      // 62px tile + 8px gap = 70px pitch, center at 31px
      const pts = dragPath.map(([r, c]) => {
        const x = c * 70 + 31;
        const y = r * 70 + 31;
        return x + ',' + y;
      }).join(' ');
      svg.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.88"/>';
    }

    function finishSwipe() {
      if (!isDragging) return;
      isDragging = false;
      const path = [...dragPath];
      dragPath = [];
      if (path.length >= 2) {
        handleResult(engine.submitPath(path));
      } else {
        updateDragVisuals();
      }
    }

    function handleResult(res) {
      hintedCoords = [];
      if (res.status === 'target_solved') {
        const t = res.target;
        if (t.needs_explanation) {
          showComicBubble(t.emoji, t.word, t.explanation_text, 'Parola Ostica ' + t.cefr);
          speakItalian(t.word + '! ' + t.explanation_text);
        } else {
          showComicBubble(t.emoji || '🌟', t.word + '!', 'Ottimo colpo! Le lettere esaurite scompaiono svelando Ale e Seby!', 'Parola Base ' + t.cefr);
          speakItalian(t.word + '!');
        }
        if (res.isLevelComplete) {
          const uid = getActiveUserId();
          const newMaxUnlocked = progression.recordLevelCompleted(uid, currentTier, currentIdx);
          const kidName = getActiveUser()?.shortName || (currentTier === 'seby' ? 'Seby' : 'Ale');
          const levels = getTierLevels();
          const hasNext = currentIdx + 1 < levels.length;

          // Persist score + unlocked level index to Cloud Firestore via PuffinLogin
          try {
            if (window.PuffinLogin && progression.isPersistentUser(uid)) {
              const endedAt = new Date().toISOString();
              const durationSec = Math.max(5, Math.round((Date.parse(endedAt) - Date.parse(levelStartedAt)) / 1000));
              const score = engine.level.targets.length * 100 + engine.bonusWordsFound.size * 25 + (currentIdx + 1) * 50;
              window.PuffinLogin.submitScore({
                appId: 'kids-words',
                player_id: uid,
                score,
                startedAt: levelStartedAt,
                endedAt,
                durationSec,
                skipCardDrop: true,
                extra: {
                  tier: currentTier,
                  level_id: engine.level.id,
                  level_index: currentIdx,
                  unlocked_max_idx: newMaxUnlocked,
                  bonus_words: engine.bonusWordsFound.size,
                },
              }).catch(() => {});
            }
          } catch {}

          // Reveal Hall of Fame at end of match
          const hof = document.getElementById('hof-section');
          if (hof) hof.hidden = false;

          setTimeout(() => {
            const unlockMsg = hasNext
              ? 'Livello ' + (currentIdx + 2) + ' sbloccato! Premi ▶ in alto per continuare!'
              : 'Hai completato tutti i livelli di questa modalità!';
            showComicBubble('🎉', 'Quadro Svelato, bravo ' + kidName + '!', unlockMsg, 'Livello Completato');
            speakItalian('Evviva ' + kidName + '! ' + unlockMsg);
          }, 900);
        }
      } else if (res.status === 'bonus_word') {
        showComicBubble('🍪', res.word + ' — Parola Segreta!', 'Bravissimo! Aggiunta al Tesoro Segreto (' + engine.bonusWordsFound.size + '/' + (engine.level.bonus_words || []).length + ')!', 'Biscottiera +1');
        speakItalian('Parola segreta: ' + res.word);
      } else if (res.status === 'already_solved') {
        showComicBubble('✅', res.word, 'Questa parola l’avevi già scoperta nello schema!', 'Già trovata');
      } else if (res.status === 'already_bonus') {
        showComicBubble('🍪', res.word, 'Questa parola segreta è già nella tua biscottiera!', 'Già nel tesoro');
      } else if (res.status === 'not_found' && res.word && res.word.length >= 3) {
        showComicBubble('🤔', res.word, 'Non risulta nel dizionario italiano di questa griglia. Prova un’altra strada!', 'Riprova');
      }
      renderAll();
      updateDragVisuals();
    }

    function renderTreasure() {
      const chipsEl = document.getElementById('kw-treasure-chips');
      const total = (engine.level.bonus_words || []).length;
      const found = Array.from(engine.bonusWordsFound).sort((a, b) => a.length - b.length || a.localeCompare(b));
      document.getElementById('lbl-treasure-title').textContent =
        '🍪 Biscottiera Segreta — ' + found.length + ' / ' + total + ' parole scoperte';
      if (!found.length) {
        chipsEl.innerHTML = '<div style="color:#94a3b8;font-size:13px;">Ancora nessuna parola segreta trovata in questo livello. Prova a strisciare parole italiane extra (es. SOL, SOMA, ARARE...)!</div>';
        return;
      }
      chipsEl.innerHTML = found.map(w => '<span class="kw-treasure-chip">🍪 ' + w + '</span>').join('');
    }

    function renderAlbum() {
      const albumGrid = document.getElementById('kw-album-grid');
      albumGrid.innerHTML = '';
      const uid = getActiveUserId();
      LEVELS_IT.forEach((lvl) => {
        const tierLevels = LEVELS_IT.filter(x => x.tier === lvl.tier);
        const idxInTier = tierLevels.findIndex(x => x.id === lvl.id);
        const unlocked = progression.isLevelUnlocked(uid, lvl.tier, idxInTier);
        const card = document.createElement('div');
        card.className = 'kw-album-card' + (unlocked ? '' : ' locked');
        const tierBadge = lvl.tier === 'seby' ? '🏎️ Seby' : '🐉 Ale';
        const lockLabel = unlocked ? '🔓 Sbloccato' : '🔒 Bloccato';
        card.innerHTML =
          '<img src="' + (SCENES_IMG[lvl.scene_id] || SCENES_IMG.bees_meadow) + '" alt="' + lvl.theme + '"/>' +
          '<div class="kw-album-card-caption">' +
            '<div style="color:#fde68a;margin-bottom:2px;">' + tierBadge + ' · ' + lockLabel + ' · ' + lvl.theme + '</div>' +
            '<div style="opacity:0.85;font-weight:600;">' + lvl.scene_caption + '</div>' +
          '</div>';
        card.addEventListener('click', () => {
          if (!unlocked) {
            showComicBubble('🔒', 'Livello Bloccato!', 'Completa prima i livelli precedenti per sbloccare "' + lvl.theme + '"!', 'Bloccato');
            document.getElementById('kw-album-modal').classList.remove('visible');
            return;
          }
          currentTier = lvl.tier;
          document.getElementById('btn-tier-seby').classList.toggle('active', currentTier === 'seby');
          document.getElementById('btn-tier-ale').classList.toggle('active', currentTier === 'ale');
          currentIdx = idxInTier >= 0 ? idxInTier : 0;
          loadLevel();
        });
        albumGrid.appendChild(card);
      });
    }

    window.addEventListener('pointerup', finishSwipe);
    window.addEventListener('pointercancel', finishSwipe);

    document.getElementById('kw-grid-wrap').addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const tile = el && el.closest('.kw-tile');
      if (!tile) return;
      const r = Number(tile.dataset.r);
      const c = Number(tile.dataset.c);
      stepToTile(r, c);
    });

    document.getElementById('btn-tier-seby').addEventListener('click', () => {
      currentTier = 'seby';
      currentIdx = 0;
      document.getElementById('btn-tier-seby').classList.add('active');
      document.getElementById('btn-tier-ale').classList.remove('active');
      loadLevel();
    });

    document.getElementById('btn-tier-ale').addEventListener('click', () => {
      currentTier = 'ale';
      currentIdx = 0;
      document.getElementById('btn-tier-ale').classList.add('active');
      document.getElementById('btn-tier-seby').classList.remove('active');
      loadLevel();
    });

    document.getElementById('btn-prev-lvl').addEventListener('click', () => {
      const levels = getTierLevels();
      const uid = getActiveUserId();
      if (progression.isAdmin(uid)) {
        currentIdx = (currentIdx - 1 + levels.length) % levels.length;
        loadLevel();
      } else if (currentIdx > 0) {
        currentIdx -= 1;
        loadLevel();
      }
    });

    document.getElementById('btn-next-lvl').addEventListener('click', () => {
      const levels = getTierLevels();
      const uid = getActiveUserId();
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);
      if (progression.isAdmin(uid)) {
        currentIdx = (currentIdx + 1) % levels.length;
        loadLevel();
      } else if (currentIdx + 1 <= maxUnlocked && currentIdx + 1 < levels.length) {
        currentIdx += 1;
        loadLevel();
      } else {
        showComicBubble('🔒', 'Livello Bloccato', 'Finisci prima il Livello ' + (currentIdx + 1) + ' per sbloccare il successivo!', 'Progressione');
      }
    });

    document.getElementById('btn-album').addEventListener('click', () => {
      renderAlbum();
      document.getElementById('kw-treasure-modal').classList.remove('visible');
      document.getElementById('kw-album-modal').classList.toggle('visible');
    });

    document.getElementById('btn-album-close').addEventListener('click', () => {
      document.getElementById('kw-album-modal').classList.remove('visible');
    });

    document.getElementById('btn-treasure').addEventListener('click', () => {
      renderTreasure();
      document.getElementById('kw-album-modal').classList.remove('visible');
      document.getElementById('kw-treasure-modal').classList.toggle('visible');
    });

    document.getElementById('btn-treasure-close').addEventListener('click', () => {
      document.getElementById('kw-treasure-modal').classList.remove('visible');
    });

    document.getElementById('btn-hof-toggle').addEventListener('click', () => {
      const hof = document.getElementById('hof-section');
      hof.hidden = !hof.hidden;
    });

    document.getElementById('btn-hof-close').addEventListener('click', () => {
      document.getElementById('hof-section').hidden = true;
    });

    document.getElementById('btn-peek').addEventListener('click', () => {
      document.getElementById('kw-stage').classList.toggle('peeking');
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      const unsolved = engine.getUnsolvedTargets();
      if (!unsolved.length) return;
      const next = unsolved[0];
      hintedCoords = currentTier === 'seby' ? next.path.slice(0, 2) : next.path.slice(0, 1);
      renderAll();
    });

    document.getElementById('btn-solve-one').addEventListener('click', () => {
      if (!progression.isAdmin(getActiveUserId())) return;
      const unsolved = engine.getUnsolvedTargets();
      if (!unsolved.length) return;
      const next = unsolved[0];
      dragPath = [...next.path];
      updateDragVisuals();
      setTimeout(() => {
        dragPath = [];
        handleResult(engine.submitPath(next.path));
      }, 350);
    });

    document.getElementById('btn-reset').addEventListener('click', loadLevel);

    async function syncUserCloudProgression(user) {
      if (!user) return;
      if (user.id === 'ale' || user.id === 'seby') {
        currentTier = user.id;
        document.getElementById('btn-tier-seby').classList.toggle('active', currentTier === 'seby');
        document.getElementById('btn-tier-ale').classList.toggle('active', currentTier === 'ale');
      }
      if (window.PuffinLogin && progression.isPersistentUser(user.id)) {
        try {
          const scores = await window.PuffinLogin.getTopScores({ game_id: 'kids-words', limit: 200 });
          progression.mergeCloudScores(user.id, scores);
        } catch {}
      }
      const maxUnlocked = progression.getUnlockedMaxIdx(user.id, currentTier);
      currentIdx = progression.isAdmin(user.id) ? currentIdx : maxUnlocked;
      loadLevel();
    }

    window.addEventListener('puffin-user-changed', (e) => {
      const user = e.detail?.user || null;
      if (user) {
        syncUserCloudProgression(user);
      } else {
        currentIdx = 0;
        loadLevel();
      }
    });

    // Initial boot + wait briefly for puffin-login custom element upgrade
    loadLevel();
    setTimeout(() => {
      const u = getActiveUser();
      if (u) syncUserCloudProgression(u);
    }, 150);
  </script>
</body>
</html>`;

const outFile = path.join(PUBLIC_DIR, 'index.html');
fs.writeFileSync(outFile, html);
console.log('Built self-contained ' + outFile + ' (' + html.length + ' bytes)');
