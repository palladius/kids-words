import fs from 'node:fs';
import path from 'node:path';
import { LEVELS_IT } from '../src/levels_it.mjs';
import { KidsWordsEngine } from '../src/engine.mjs';

function loadAssetDataUri(filename) {
  const filePath = path.join('/home/riccardo/git/kids-words/public/assets', filename);
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
  <title>🔤 Kids Words — Parole in Fuga (Ale & Seby Edition)</title>
  <style>
    :root {
      --seby-color: #2563eb;
      --ale-color: #dc2626;
      --gold: #f59e0b;
      --radius: 16px;
      --font-sans: 'Nunito', 'Fredoka', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
    body {
      margin: 0;
      padding: 8px;
      background: #0f172a;
      color: #f8fafc;
      font-family: var(--font-sans);
    }
    .kw-root {
      font-family: var(--font-sans);
      color: var(--foreground, #f8fafc);
      max-width: 780px;
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
      background: rgba(15, 23, 42, 0.92);
      color: #f8fafc;
      padding: 8px 14px;
      border-radius: var(--radius);
      border: 1px solid rgba(255, 255, 255, 0.16);
      height: 50px;
    }
    .kw-profiles { display: flex; gap: 6px; align-items: center; }
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
     * IMMUTABLE 5-ROW STAGE LAYOUT
     * Every row has a strict, locked pixel height so #kw-grid-wrap NEVER
     * shifts by even 1px when swiping or when explanations appear below!
     * ===================================================================== */
    .kw-stage {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      height: 626px;
      min-height: 626px;
      max-height: 626px;
      display: grid;
      grid-template-rows: 150px 36px 272px 76px 44px;
      gap: 6px;
      padding: 12px;
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
    /* Subtle vignette so HUD and grid pop clearly while keeping Ale & Seby vivid */
    .kw-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.45) 0%,
        rgba(15, 23, 42, 0.08) 35%,
        rgba(15, 23, 42, 0.08) 70%,
        rgba(15, 23, 42, 0.55) 100%
      );
      pointer-events: none;
    }

    /* ROW 1: HUD TOP (150px locked — fits up to 20 words cleanly!) */
    .kw-hud-top {
      position: relative;
      z-index: 2;
      height: 150px;
      min-height: 150px;
      max-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 5px;
      background: rgba(15, 23, 42, 0.76);
      backdrop-filter: blur(8px);
      padding: 8px 10px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    .kw-theme-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .kw-targets {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 5px;
      justify-content: center;
      align-content: center;
      flex: 1;
      overflow-y: auto;
    }
    .kw-word-slot {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: rgba(15, 23, 42, 0.84);
      padding: 3px 5px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      cursor: pointer;
      height: 23px;
      font-size: 11px;
    }
    .kw-word-slot.solved {
      background: rgba(22, 163, 74, 0.94);
      border-color: #86efac;
    }
    .kw-slot-box {
      width: 15px;
      height: 17px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.18);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 11px;
      color: #fff;
    }

    /* ROW 2: SWIPE BAR (36px locked — uses opacity/visibility, NEVER display:none) */
    .kw-swipe-slot {
      position: relative;
      z-index: 3;
      height: 36px;
      min-height: 36px;
      max-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .kw-current-word {
      height: 32px;
      min-width: 96px;
      padding: 0 18px;
      border-radius: 999px;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      font-size: 17px;
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

    /* ROW 3: IMMUTABLE MATRIX SLOT (272px locked) */
    .kw-grid-slot {
      position: relative;
      z-index: 2;
      height: 272px;
      min-height: 272px;
      max-height: 272px;
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
      opacity: 0.08;
      pointer-events: none;
    }
    .kw-grid {
      display: grid;
      gap: 10px;
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
      width: 68px;
      height: 68px;
      border-radius: 16px;
      background: rgba(255, 251, 235, 0.88);
      backdrop-filter: blur(4px);
      border: 3px solid #f59e0b;
      box-shadow: 0 5px 0 #b45309, 0 8px 14px rgba(0, 0, 0, 0.38);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.12s ease, opacity 0.35s ease, background-color 0.12s ease;
    }
    .kw-tile-letter {
      font-size: 27px;
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
      pointer-events: none;
    }
    .kw-tile-dep {
      position: absolute;
      top: 4px;
      right: 5px;
      font-size: 10px;
      font-weight: 800;
      color: #92400e;
      background: rgba(245, 158, 11, 0.25);
      border-radius: 999px;
      padding: 0 5px;
      pointer-events: none;
    }
    /* No translateY shift on selection so tile hitboxes never move under the cursor */
    .kw-tile.selected {
      background: #fde047;
      border-color: #ca8a04;
      box-shadow: 0 5px 0 #854d0e, 0 0 16px rgba(250, 204, 21, 0.9);
      transform: scale(1.04);
    }
    .kw-tile.hinted {
      border-color: #22c55e;
      box-shadow: 0 5px 0 #15803d, 0 0 18px rgba(34, 197, 94, 0.95);
    }
    .kw-tile.depleted {
      opacity: 0;
      transform: scale(0.15) rotate(12deg);
      pointer-events: none;
    }

    /* ROW 4: BOTTOM COMIC / EXPLANATION DOCK (76px locked — BELOW the grid!) */
    .kw-bottom-dock {
      position: relative;
      z-index: 3;
      height: 76px;
      min-height: 76px;
      max-height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kw-comic-bubble {
      width: 100%;
      max-width: 640px;
      height: 72px;
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
    .kw-comic-emoji { font-size: 28px; flex-shrink: 0; }
    .kw-comic-text {
      font-size: 13px;
      line-height: 1.28;
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

    /* ROW 5: FOOTER (44px locked) */
    .kw-footer {
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
     * ALBUM DEI RICORDI MODAL (Overlay inside #kw-stage, zero shift!)
     * ===================================================================== */
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
      grid-template-columns: repeat(3, 1fr);
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
  </style>
</head>
<body>
  <div class="kw-root">
    <div class="kw-topbar">
      <div class="kw-profiles">
        <span style="font-size:12px;font-weight:800;">🐧 Giocatore:</span>
        <button class="kw-profile-btn active" data-tier="seby" id="btn-tier-seby">🏎️ Seby (6a · 3×3)</button>
        <button class="kw-profile-btn" data-tier="ale" id="btn-tier-ale">🐉 Ale / Sfida (12 lett · 20 parole)</button>
      </div>
      <div class="kw-level-nav">
        <button class="kw-pill-btn" id="btn-prev-lvl" title="Livello precedente">◀</button>
        <span id="lbl-level-idx" style="font-size:12px;font-weight:800;">Livello 1 / 3</span>
        <button class="kw-pill-btn" id="btn-next-lvl" title="Livello successivo">▶</button>
        <button class="kw-pill-btn" id="btn-album" title="Apri l'Album delle Foto Cartoon di Ale & Seby">🖼️ Album</button>
      </div>
    </div>

    <div class="kw-stage" id="kw-stage">
      <div class="kw-bg-art" id="kw-bg-art">
        <img class="kw-bg-img" id="kw-bg-img" alt="Illustrazione Cartoon Ale e Seby" />
        <div class="kw-bg-overlay"></div>
      </div>

      <!-- ROW 1: HUD TOP (112px locked) -->
      <div class="kw-hud-top" id="kw-hud-top">
        <div class="kw-theme-row">
          <span id="lbl-theme">🐝 Il Prato delle Api</span>
          <span id="lbl-tiles-left" style="color:#fde68a;">Tessere attive: 9 · Parole: 0/8</span>
        </div>
        <div class="kw-targets" id="kw-targets"></div>
      </div>

      <!-- ROW 2: SWIPE LIVE WORD SLOT (36px locked) -->
      <div class="kw-swipe-slot" id="kw-swipe-slot">
        <div class="kw-current-word" id="kw-current-word"></div>
      </div>

      <!-- ROW 3: IMMUTABLE GRID SLOT (324px locked) -->
      <div class="kw-grid-slot" id="kw-grid-slot">
        <div class="kw-grid-wrap" id="kw-grid-wrap">
          <svg class="kw-svg-laser" id="kw-svg-laser"></svg>
          <div class="kw-grid" id="kw-grid"></div>
        </div>
      </div>

      <!-- ROW 4: BOTTOM COMIC / EXPLANATION DOCK (76px locked, BELOW the matrix) -->
      <div class="kw-bottom-dock" id="kw-bottom-dock">
        <div class="kw-comic-bubble" id="kw-comic-bubble">
          <span class="kw-comic-emoji" id="kw-comic-emoji">🐝</span>
          <div class="kw-comic-text" id="kw-comic-text"></div>
        </div>
      </div>

      <!-- ROW 5: FOOTER CONTROLS (44px locked) -->
      <div class="kw-footer" id="kw-footer">
        <div class="kw-footer-meta">
          ➕ <strong>Solo Orizz/Vert</strong> · 🍪 Segrete: <strong id="lbl-bonus-count">0</strong>
          <span id="lbl-scene-caption" style="margin-left:6px;opacity:0.85;"></span>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0;">
          <button class="kw-pill-btn" id="btn-peek" title="Clicca per ammirare Ale e Seby sullo sfondo">👀 Foto</button>
          <button class="kw-action-btn" id="btn-hint">💡 Aiuto</button>
          <button class="kw-action-btn" id="btn-solve-one" style="background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">✨ Indovina 1</button>
          <button class="kw-pill-btn" id="btn-reset">🔄 Rigioca</button>
        </div>
      </div>

      <!-- ALBUM OVERLAY MODAL -->
      <div class="kw-album-modal" id="kw-album-modal">
        <div class="kw-album-header">
          <span>🖼️ Galleria dei Ricordi di Ale & Seby (Clicca una scheda per giocarla!)</span>
          <button class="kw-pill-btn" id="btn-album-close">✖ Chiudi</button>
        </div>
        <div class="kw-album-grid" id="kw-album-grid"></div>
      </div>
    </div>
  </div>

  <script>
    const LEVELS_IT = ${JSON.stringify(LEVELS_IT)};
    const SCENES_IMG = ${JSON.stringify(SCENES_IMG)};
    ${KidsWordsEngine.toString()}

    let currentTier = 'seby';
    let currentIdx = 0;
    let engine = null;
    let dragPath = [];
    let isDragging = false;
    let hintedCoords = [];

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

    function loadLevel() {
      const levels = getTierLevels();
      const lvl = levels[currentIdx % levels.length];
      engine = new KidsWordsEngine(lvl);
      dragPath = [];
      isDragging = false;
      hintedCoords = [];
      document.getElementById('kw-stage').classList.remove('peeking');
      document.getElementById('kw-album-modal').classList.remove('visible');
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

      document.getElementById('lbl-level-idx').textContent = 'Livello ' + (currentIdx + 1) + ' / ' + levels.length;
      document.getElementById('lbl-theme').textContent = lvl.theme;
      document.getElementById('lbl-scene-caption').textContent = '🎨 ' + lvl.scene_caption;
      document.getElementById('lbl-tiles-left').textContent =
        'Tessere attive: ' + engine.getActiveTileCount() + ' · Parole: ' + solvedCount + '/' + totalCount;
      document.getElementById('lbl-bonus-count').textContent = engine.bonusWordsFound.size;

      // Nano Banana Cartoon Character-Consistency Backdrop
      const bgImg = document.getElementById('kw-bg-img');
      const nextSrc = SCENES_IMG[lvl.scene_id] || SCENES_IMG.bees_meadow;
      if (bgImg.getAttribute('src') !== nextSrc) {
        bgImg.setAttribute('src', nextSrc);
      }

      // Target slots
      const targetsEl = document.getElementById('kw-targets');
      targetsEl.innerHTML = '';
      for (const t of lvl.targets) {
        const solved = engine.solvedWords.has(t.word);
        const slot = document.createElement('div');
        slot.className = 'kw-word-slot' + (solved ? ' solved' : '');
        slot.title = solved ? 'Riascolta ' + t.word : 'Parola da ' + t.word.length + ' lettere';
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = solved ? (t.emoji || '⭐') : '🔒';
        slot.appendChild(emojiSpan);
        for (let i = 0; i < t.word.length; i++) {
          const box = document.createElement('span');
          box.className = 'kw-slot-box';
          box.textContent = solved ? t.word[i] : '';
          slot.appendChild(box);
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
        targetsEl.appendChild(slot);
      }

      // Immutable Grid
      const gridEl = document.getElementById('kw-grid');
      gridEl.style.gridTemplateColumns = 'repeat(' + lvl.grid.cols + ', 68px)';
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
      const pts = dragPath.map(([r, c]) => {
        const x = c * 78 + 34;
        const y = r * 78 + 34;
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
          const kidName = currentTier === 'seby' ? 'Seby' : 'Ale';
          const allWords = engine.level.targets.map(x => x.word).join(', ');
          setTimeout(() => {
            showComicBubble('🎉', 'Quadro Svelato, bravo ' + kidName + '!', 'Hai scoperto tutte le parole: ' + allWords + '!', 'Livello Completato');
            speakItalian('Evviva ' + kidName + '! Hai scoperto tutte le parole: ' + allWords + '!');
          }, 900);
        }
      } else if (res.status === 'bonus_word') {
        showComicBubble('🍪', res.word + ' (Parola Segreta!)', 'Questa parola finisce nella biscottiera bonus!', 'Bonus +1');
        speakItalian('Parola segreta: ' + res.word);
      }
      renderAll();
      updateDragVisuals();
    }

    function renderAlbum() {
      const albumGrid = document.getElementById('kw-album-grid');
      albumGrid.innerHTML = '';
      LEVELS_IT.forEach((lvl) => {
        const card = document.createElement('div');
        card.className = 'kw-album-card';
        const tierBadge = lvl.tier === 'seby' ? '🏎️ Seby 3×3' : '🐉 Ale 4×4';
        card.innerHTML =
          '<img src="' + (SCENES_IMG[lvl.scene_id] || SCENES_IMG.bees_meadow) + '" alt="' + lvl.theme + '"/>' +
          '<div class="kw-album-card-caption">' +
            '<div style="color:#fde68a;margin-bottom:2px;">' + tierBadge + ' · ' + lvl.theme + '</div>' +
            '<div style="opacity:0.85;font-weight:600;">' + lvl.scene_caption + '</div>' +
          '</div>';
        card.addEventListener('click', () => {
          currentTier = lvl.tier;
          document.getElementById('btn-tier-seby').classList.toggle('active', currentTier === 'seby');
          document.getElementById('btn-tier-ale').classList.toggle('active', currentTier === 'ale');
          const tierLevels = getTierLevels();
          currentIdx = tierLevels.findIndex(x => x.id === lvl.id);
          if (currentIdx < 0) currentIdx = 0;
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
      currentIdx = (currentIdx - 1 + levels.length) % levels.length;
      loadLevel();
    });

    document.getElementById('btn-next-lvl').addEventListener('click', () => {
      const levels = getTierLevels();
      currentIdx = (currentIdx + 1) % levels.length;
      loadLevel();
    });

    document.getElementById('btn-album').addEventListener('click', () => {
      renderAlbum();
      document.getElementById('kw-album-modal').classList.toggle('visible');
    });

    document.getElementById('btn-album-close').addEventListener('click', () => {
      document.getElementById('kw-album-modal').classList.remove('visible');
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

    loadLevel();
  </script>
</body>
</html>`;

fs.writeFileSync('/home/riccardo/git/kids-words/public/index.html', html);
console.log('Built self-contained /home/riccardo/git/kids-words/public/index.html (' + html.length + ' bytes)');
