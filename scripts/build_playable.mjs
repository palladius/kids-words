import fs from 'node:fs';
import { LEVELS_IT } from '../src/levels_it.mjs';
import { KidsWordsEngine } from '../src/engine.mjs';

const scenesSvg = {
  meadow: `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sky)"/>
    <!-- Warm Sun -->
    <circle cx="650" cy="110" r="55" fill="#fde047" opacity="0.9"/>
    <!-- Distant Swiss Alps -->
    <polygon points="80,360 220,170 360,360" fill="#cbd5e1"/>
    <polygon points="185,218 220,170 255,218" fill="#f8fafc"/>
    <polygon points="280,360 450,150 620,360" fill="#94a3b8"/>
    <polygon points="410,200 450,150 490,200" fill="#ffffff"/>
    <!-- Rolling Meadow Hills -->
    <ellipse cx="250" cy="430" rx="420" ry="140" fill="#22c55e"/>
    <ellipse cx="600" cy="460" rx="450" ry="160" fill="url(#hill1)"/>
    <!-- Tree with Wooden Beehive (Arnia) on the right -->
    <rect x="640" y="210" width="38" height="190" rx="10" fill="#78350f"/>
    <circle cx="659" cy="180" r="85" fill="#16a34a"/>
    <circle cx="610" cy="210" r="60" fill="#22c55e"/>
    <!-- Wooden Arnia (Beehive box) -->
    <rect x="560" y="325" width="56" height="48" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="3"/>
    <polygon points="554,325 588,302 622,325" fill="#d97706" stroke="#78350f" stroke-width="3"/>
    <circle cx="588" cy="350" r="8" fill="#451a03"/>
    <!-- Cute Buzzing Bees -->
    <g transform="translate(520,285)"><ellipse rx="10" ry="7" fill="#facc15" stroke="#1e293b" stroke-width="2"/><ellipse cx="-3" cy="-7" rx="5" ry="3" fill="#e0f2fe"/></g>
    <g transform="translate(470,250)"><ellipse rx="9" ry="6" fill="#facc15" stroke="#1e293b" stroke-width="2"/><ellipse cx="2" cy="-6" rx="4" ry="3" fill="#e0f2fe"/></g>
    <!-- Cutie Back-View of ALE (8yo, Red Hoodie, Left) & SEBY (6yo, Blue Hoodie, Right) + Ghigna -->
    <!-- ALE (back view, taller, red hoodie) -->
    <g transform="translate(310, 415)">
      <path d="M-38,140 C-38,65 38,65 38,140 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3"/>
      <ellipse cx="0" cy="72" rx="26" ry="12" fill="#b91c1c"/> <!-- Hood resting on back -->
      <circle cx="0" cy="36" r="28" fill="#fed7aa"/>
      <path d="M-28,34 C-30,2 30,2 28,34 C24,52 -24,52 -28,34 Z" fill="#451a03"/> <!-- Warm brown hair from behind -->
      <!-- Arm pointing toward the beehive -->
      <path d="M26,82 L75,45" stroke="#dc2626" stroke-width="16" stroke-linecap="round"/>
      <circle cx="80" cy="41" r="8" fill="#fed7aa"/>
    </g>
    <!-- SEBY (back view, smaller 6yo, blue hoodie, leaning next to Ale) -->
    <g transform="translate(415, 438)">
      <path d="M-32,120 C-32,58 32,58 32,120 Z" fill="#2563eb" stroke="#1e3a8a" stroke-width="3"/>
      <ellipse cx="0" cy="64" rx="22" ry="10" fill="#1d4ed8"/>
      <circle cx="0" cy="32" r="24" fill="#fed7aa"/>
      <path d="M-24,30 C-26,4 26,4 24,30 C20,46 -20,46 -24,30 Z" fill="#78350f"/> <!-- Seby soft chestnut hair from behind -->
    </g>
    <!-- Little Dragon Ghigna sitting next to Ale -->
    <g transform="translate(235, 485)">
      <ellipse cx="0" cy="25" rx="20" ry="24" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.5"/>
      <circle cx="0" cy="-2" r="15" fill="#ef4444"/>
      <polygon points="-14,12 -32,-2 -12,24" fill="#fca5a5"/>
      <polygon points="14,12 32,-2 12,24" fill="#fca5a5"/>
    </g>
  </svg>`,

  aquarium: `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="65%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#ocean)"/>
    <!-- Light rays from surface -->
    <polygon points="150,0 260,0 380,500 80,500" fill="#38bdf8" opacity="0.16"/>
    <polygon points="450,0 560,0 680,500 390,500" fill="#7dd3fc" opacity="0.14"/>
    <!-- Cute Seppia (Cuttlefish) & Sea Turtles -->
    <g transform="translate(540, 210)">
      <ellipse cx="0" cy="0" rx="38" ry="24" fill="#f472b6" stroke="#fff" stroke-width="3"/>
      <circle cx="-12" cy="-4" r="5" fill="#0f172a"/>
      <path d="M35,-8 Q52,-15 48,-2 M36,0 Q55,0 50,8 M34,8 Q50,16 45,18" stroke="#fbcfe8" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Sailboat silhouette at top -->
    <polygon points="220,75 250,25 265,75" fill="#fef08a" opacity="0.8"/>
    <!-- Back-view of Ale & Seby looking through the giant aquarium glass -->
    <rect x="0" y="490" width="800" height="110" fill="#090d16"/>
    <g transform="translate(330, 425)">
      <path d="M-38,130 C-38,65 38,65 38,130 Z" fill="#dc2626"/>
      <circle cx="0" cy="36" r="27" fill="#451a03"/>
    </g>
    <g transform="translate(430, 445)">
      <path d="M-32,115 C-32,58 32,58 32,115 Z" fill="#2563eb"/>
      <circle cx="0" cy="32" r="24" fill="#78350f"/>
    </g>
  </svg>`
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
    .kw-root {
      font-family: var(--font-sans);
      color: var(--foreground, #f8fafc);
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .kw-topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: rgba(15, 23, 42, 0.85);
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: var(--radius);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .kw-profiles { display: flex; gap: 6px; align-items: center; }
    .kw-profile-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
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
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 10px;
      padding: 5px 10px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .kw-stage {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      min-height: 500px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 14px;
      color: #fff;
    }
    .kw-bg-art {
      position: absolute;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .kw-hud-top {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(15, 23, 42, 0.68);
      backdrop-filter: blur(6px);
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .kw-theme-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 800;
    }
    .kw-targets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .kw-word-slot {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(15, 23, 42, 0.78);
      padding: 5px 8px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      cursor: pointer;
    }
    .kw-word-slot.solved {
      background: rgba(22, 163, 74, 0.92);
      border-color: #86efac;
    }
    .kw-slot-box {
      width: 22px;
      height: 24px;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.18);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 13px;
      color: #fff;
    }
    .kw-middle-zone {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-height: 54px;
    }
    .kw-current-word {
      min-height: 34px;
      padding: 4px 16px;
      border-radius: 999px;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: 2px;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .kw-current-word.visible { display: inline-flex; }
    .kw-comic-bubble {
      max-width: 95%;
      background: #fffbeb;
      color: #1e293b;
      border: 3px solid #f59e0b;
      border-radius: 16px;
      padding: 8px 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      display: none;
      align-items: center;
      gap: 10px;
    }
    .kw-comic-bubble.visible { display: flex; }
    .kw-comic-emoji { font-size: 26px; flex-shrink: 0; }
    .kw-comic-text { font-size: 13px; line-height: 1.3; font-weight: 700; }
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
    .kw-grid-wrap {
      position: relative;
      z-index: 2;
      margin: 4px auto;
      touch-action: none;
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
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: rgba(255, 251, 235, 0.94);
      backdrop-filter: blur(5px);
      border: 3px solid #f59e0b;
      box-shadow: 0 5px 0 #b45309, 0 8px 14px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.16s ease, opacity 0.4s ease;
    }
    .kw-tile-letter {
      font-size: 28px;
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
      pointer-events: none;
    }
    .kw-tile-dep {
      position: absolute;
      top: 4px;
      right: 6px;
      font-size: 10px;
      font-weight: 800;
      color: #92400e;
      background: rgba(245, 158, 11, 0.25);
      border-radius: 999px;
      padding: 0 5px;
      pointer-events: none;
    }
    .kw-tile.selected {
      background: #fef08a;
      border-color: #eab308;
      transform: translateY(-3px) scale(1.06);
    }
    .kw-tile.hinted {
      border-color: #22c55e;
      box-shadow: 0 5px 0 #15803d, 0 0 18px rgba(34, 197, 94, 0.95);
    }
    .kw-tile.depleted {
      opacity: 0;
      transform: scale(0.15) rotate(15deg);
      pointer-events: none;
    }
    .kw-footer {
      position: relative;
      z-index: 2;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      padding: 8px 12px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      font-size: 12px;
    }
    .kw-action-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: 900;
      border: none;
      border-radius: 10px;
      padding: 6px 11px;
      font-size: 12px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="kw-root">
    <div class="kw-topbar">
      <div class="kw-profiles">
        <span style="font-size:12px;font-weight:800;">🐧 Giocatore:</span>
        <button class="kw-profile-btn active" data-tier="seby" id="btn-tier-seby">🏎️ Seby (6a · 3×3)</button>
        <button class="kw-profile-btn" data-tier="ale" id="btn-tier-ale">🐉 Ale (8a · 4×4)</button>
      </div>
      <div class="kw-level-nav">
        <button class="kw-pill-btn" id="btn-prev-lvl">◀</button>
        <span id="lbl-level-idx" style="font-size:12px;font-weight:800;">Livello 1 / 3</span>
        <button class="kw-pill-btn" id="btn-next-lvl">▶</button>
      </div>
    </div>

    <div class="kw-stage" id="kw-stage">
      <div class="kw-bg-art" id="kw-bg-art"></div>

      <div class="kw-hud-top">
        <div class="kw-theme-row">
          <span id="lbl-theme">🐝 Il Prato delle Api</span>
          <span id="lbl-tiles-left" style="color:#fde68a;">Tessere rimaste: 9</span>
        </div>
        <div class="kw-targets" id="kw-targets"></div>
      </div>

      <div class="kw-middle-zone">
        <div class="kw-current-word" id="kw-current-word"></div>
        <div class="kw-comic-bubble" id="kw-comic-bubble">
          <span class="kw-comic-emoji" id="kw-comic-emoji">🐝</span>
          <div class="kw-comic-text" id="kw-comic-text"></div>
        </div>
      </div>

      <div class="kw-grid-wrap" id="kw-grid-wrap">
        <svg class="kw-svg-laser" id="kw-svg-laser"></svg>
        <div class="kw-grid" id="kw-grid"></div>
      </div>

      <div class="kw-footer">
        <div>
          🍪 Parole Segrete: <strong id="lbl-bonus-count">0</strong>
          <span id="lbl-scene-caption" style="margin-left:6px;opacity:0.85;"></span>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="kw-action-btn" id="btn-hint">💡 Aiuto</button>
          <button class="kw-action-btn" id="btn-solve-one" style="background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">✨ Indovina 1 Parola</button>
          <button class="kw-pill-btn" id="btn-reset">🔄 Rigioca</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const LEVELS_IT = ${JSON.stringify(LEVELS_IT)};
    const SCENES_SVG = ${JSON.stringify(scenesSvg)};
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
      hintedCoords = [];
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
      document.getElementById('lbl-level-idx').textContent = 'Livello ' + (currentIdx + 1) + ' / ' + levels.length;
      document.getElementById('lbl-theme').textContent = lvl.theme;
      document.getElementById('lbl-scene-caption').textContent = '🎨 ' + lvl.scene_caption;
      document.getElementById('lbl-tiles-left').textContent = 'Tessere attive: ' + engine.getActiveTileCount();
      document.getElementById('lbl-bonus-count').textContent = engine.bonusWordsFound.size;

      // Backdrop SVG
      const bgEl = document.getElementById('kw-bg-art');
      bgEl.innerHTML = SCENES_SVG[lvl.scene_id] || SCENES_SVG.meadow;

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
              speakItalian(t.word);
            }
          }
        });
        targetsEl.appendChild(slot);
      }

      // Grid
      const gridEl = document.getElementById('kw-grid');
      gridEl.style.gridTemplateColumns = 'repeat(' + lvl.grid.cols + ', 72px)';
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
            const prev = dragPath[dragPath.length - 1];
            if (engine.isValidStep(prev, [r, c], dragPath)) {
              dragPath.push([r, c]);
              updateDragVisuals();
            }
          });

          gridEl.appendChild(tile);
        }
      }
      drawLaser();
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
        const x = c * 82 + 36;
        const y = r * 82 + 36;
        return x + ',' + y;
      }).join(' ');
      svg.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>';
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
          showComicBubble(t.emoji || '🌟', t.word + '!', 'Ottimo colpo! Le lettere esaurite scompaiono!', 'Parola Base ' + t.cefr);
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
        showComicBubble('🍪', res.word + ' (Parola Segreta!)', 'Questa parola finisce nel biscottiera bonus!', 'Bonus +1');
        speakItalian('Parola segreta: ' + res.word);
      }
      renderAll();
      updateDragVisuals();
    }

    window.addEventListener('pointerup', finishSwipe);

    // Touch move hit-testing for smooth finger swipe across tiles on mobile/tablet
    document.getElementById('kw-grid-wrap').addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const tile = el && el.closest('.kw-tile');
      if (!tile) return;
      const r = Number(tile.dataset.r);
      const c = Number(tile.dataset.c);
      if (!engine.isTileActive(r, c)) return;
      const prev = dragPath[dragPath.length - 1];
      if (engine.isValidStep(prev, [r, c], dragPath)) {
        dragPath.push([r, c]);
        updateDragVisuals();
      }
    });

    // Buttons
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
      // Prefer solving a word that shows either shrinking or B1+ explanation!
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
    // Auto-solve "APE" and "ARNIA" on initial load if requested or show initial state cleanly
  </script>
</body>
</html>`;

fs.writeFileSync('/home/riccardo/git/kids-words/public/index.html', html);
console.log('Built self-contained /home/riccardo/git/kids-words/public/index.html (' + html.length + ' bytes)');
