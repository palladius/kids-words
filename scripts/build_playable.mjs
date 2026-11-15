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
  knight_woods: loadAssetDataUri('ale_seby_knight_woods.webp'),
};

const SCENES_IMG_PORTRAIT = {
  bees_meadow: loadAssetDataUri('ale_seby_bees_meadow_portrait.webp'),
  alpine_sun: loadAssetDataUri('ale_seby_alpine_sun_portrait.webp'),
  dragon_forest: loadAssetDataUri('ale_seby_dragon_forest_portrait.webp'),
  aquarium: loadAssetDataUri('ale_seby_aquarium_portrait.webp'),
  zurich_stars: loadAssetDataUri('ale_seby_zurich_stars_portrait.webp'),
  knight_woods: loadAssetDataUri('ale_seby_knight_woods_portrait.webp'),
};

// Vertical framing shift (%) so Ale & Seby's faces sit squarely inside the open portrait showcase band
const PORTRAIT_SHIFT_Y = {
  bees_meadow: '-21%',
  alpine_sun: '-10%',
  dragon_forest: '-11%',
  aquarium: '-20%',
  zurich_stars: '-20%',
  knight_woods: '-19%',
};

const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>🔤 Kids Words v${APP_VERSION} — Parole in Fuga (Ale & Seby)</title>
  <script type="module" src="./src/puffin-login.js"></script>
  <style>
    :root {
      --seby-color: #2563eb;
      --ale-color: #dc2626;
      --gold: #f59e0b;
      --radius: 16px;
      --tile: 96px;
      --gap: 9px;
      --tile-font: 40px;
      --tile-dep-font: 12px;
      --tile-radius: 18px;
      --font-sans: 'Nunito', 'Fredoka', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
    html, body {
      margin: 0;
      padding: 0;
      background: #0b1120;
      color: #f8fafc;
      font-family: var(--font-sans);
      min-height: 100dvh;
    }
    .kw-root {
      font-family: var(--font-sans);
      color: #f8fafc;
      max-width: 540px;
      height: 100dvh;
      min-height: 580px;
      margin: 0 auto;
      padding: 5px 6px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    /* TOP BAR (compact, single/two clean lines) */
    .kw-topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 8px;
      background: rgba(15, 23, 42, 0.94);
      color: #f8fafc;
      padding: 5px 9px;
      border-radius: 13px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      flex-shrink: 0;
    }
    .kw-profiles { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
    .kw-profile-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 999px;
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      font-weight: 800;
      font-size: 11.5px;
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
    .kw-level-nav {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-left: auto;
    }
    .kw-pill-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 9px;
      padding: 4px 8px;
      font-weight: 700;
      font-size: 11.5px;
      cursor: pointer;
      white-space: nowrap;
    }
    .kw-pill-btn:hover { background: rgba(255, 255, 255, 0.25); }
    .kw-pill-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* =====================================================================
     * PORTRAIT STAGE LAYOUT (Mobile-first vertical stack)
     * - Top HUD: compact Word Bank over the sky/canopy (never crushes!)
     * - Showcase Window: unobstructed window right over Ale & Seby's faces!
     * - Giant Keyboard Slot (~46-50% of stage): huge letter tiles!
     * - Bottom Comic Dock + Footer controls
     * ===================================================================== */
    .kw-stage {
      position: relative;
      flex: 1;
      min-height: 0;
      border-radius: 18px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
      display: grid;
      grid-template-rows: max-content minmax(88px, 1fr) minmax(210px, 46%) 48px 36px;
      grid-template-columns: 1fr;
      grid-template-areas:
        "hud"
        "showcase"
        "grid"
        "dock"
        "footer";
      gap: 5px;
      padding: 7px;
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
      height: 136%;
      object-fit: cover;
      object-position: center top;
      transform: translateY(var(--portrait-shift, -19%));
      display: block;
      transition: filter 0.35s ease, transform 0.35s ease;
    }
    .kw-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.26) 0%,
        rgba(15, 23, 42, 0.0) 16%,
        rgba(15, 23, 42, 0.0) 44%,
        rgba(15, 23, 42, 0.14) 85%,
        rgba(15, 23, 42, 0.45) 100%
      );
      pointer-events: none;
    }

    /* COMPACT GROUPED WORD BANK */
    .kw-hud-top {
      grid-area: hud;
      position: relative;
      z-index: 2;
      max-height: 108px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      background: rgba(15, 23, 42, 0.66);
      backdrop-filter: blur(8px);
      padding: 5px 8px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow-y: auto;
    }
    .kw-theme-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      font-weight: 800;
      flex-shrink: 0;
      gap: 6px;
    }
    .kw-targets {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;
      gap: 3px 8px;
      flex: 1;
    }
    .kw-len-group {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2.5px;
      padding-right: 5px;
      border-right: 1px solid rgba(255, 255, 255, 0.18);
    }
    .kw-len-group:last-child {
      border-right: none;
      padding-right: 0;
    }
    .kw-len-tag {
      font-size: 9px;
      font-weight: 900;
      color: #fde68a;
      background: rgba(245, 158, 11, 0.22);
      border: 1px solid rgba(245, 158, 11, 0.38);
      border-radius: 4px;
      padding: 1px 3.5px;
      line-height: 1.1;
    }
    .kw-word-slot {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      background: rgba(15, 23, 42, 0.85);
      padding: 1.5px 3px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      cursor: pointer;
      height: 15px;
      font-size: 9px;
    }
    .kw-word-slot.solved {
      background: rgba(22, 163, 74, 0.94);
      border-color: #86efac;
      padding: 1.5px 4.5px;
    }
    .kw-slot-box {
      width: 8px;
      height: 9.5px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 9px;
      color: #fff;
      line-height: 1;
    }
    .kw-word-slot.solved .kw-slot-box {
      background: transparent;
      width: auto;
      padding: 0 0.5px;
      letter-spacing: 0.3px;
    }

    /* SHOWCASE WINDOW FOR ALE & SEBY + LIVE SWIPE PILL */
    .kw-showcase {
      grid-area: showcase;
      position: relative;
      z-index: 3;
      pointer-events: none;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 2px;
    }
    .kw-swipe-slot {
      position: relative;
      z-index: 3;
      height: 32px;
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
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

    /* GIANT IMMUTABLE MATRIX SLOT (~50% OF STAGE HEIGHT!) */
    .kw-grid-slot {
      grid-area: grid;
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      min-height: 0;
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
      opacity: 0.05;
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
      border-radius: var(--tile-radius);
      background: rgba(255, 251, 235, 0.9);
      backdrop-filter: blur(4px);
      border: 3px solid #f59e0b;
      box-shadow: 0 5px 0 #b45309, 0 10px 18px rgba(0, 0, 0, 0.42);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.12s ease, opacity 0.35s ease, background-color 0.12s ease;
    }
    .kw-tile-letter {
      font-size: var(--tile-font);
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
      pointer-events: none;
    }
    .kw-tile-dep {
      position: absolute;
      top: 4px;
      right: 6px;
      font-size: var(--tile-dep-font);
      font-weight: 800;
      color: #92400e;
      background: rgba(245, 158, 11, 0.26);
      border-radius: 999px;
      padding: 0 5px;
      pointer-events: none;
    }
    .kw-tile.selected {
      background: #fde047;
      border-color: #ca8a04;
      box-shadow: 0 5px 0 #854d0e, 0 0 20px rgba(250, 204, 21, 0.95);
      transform: scale(1.04);
    }
    .kw-tile.hinted {
      border-color: #22c55e;
      box-shadow: 0 5px 0 #15803d, 0 0 20px rgba(34, 197, 94, 0.95);
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
      height: 48px;
      min-height: 48px;
      max-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kw-comic-bubble {
      width: 100%;
      max-width: 640px;
      height: 46px;
      background: rgba(255, 251, 235, 0.96);
      color: #1e293b;
      border: 2.5px solid #f59e0b;
      border-radius: 13px;
      padding: 3px 10px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      gap: 8px;
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
    .kw-comic-emoji { font-size: 22px; flex-shrink: 0; }
    .kw-comic-text {
      font-size: 11.5px;
      line-height: 1.2;
      font-weight: 700;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .kw-comic-badge {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #f59e0b;
      font-size: 9.5px;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 999px;
      margin-left: 4px;
    }

    /* FOOTER */
    .kw-footer {
      grid-area: footer;
      position: relative;
      z-index: 2;
      height: 36px;
      min-height: 36px;
      max-height: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.84);
      backdrop-filter: blur(8px);
      padding: 0 8px;
      border-radius: 11px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      font-size: 11px;
      overflow: hidden;
    }
    .kw-footer-meta {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 46%;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .kw-scene-caption {
      opacity: 0;
      width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kw-action-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: 900;
      border: none;
      border-radius: 9px;
      padding: 4px 9px;
      font-size: 11.5px;
      cursor: pointer;
      white-space: nowrap;
    }
    .kw-debug-hidden {
      position: absolute;
      width: 0;
      height: 0;
      padding: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }

    /* =====================================================================
     * DESKTOP WIDESCREEN INTELLIGENT LAYOUT (>= 940px & height >= 561px)
     * Uses extra width so Ale & Seby landscape art shines on the left while
     * the GIANT letter keyboard occupies the entire right half!
     * ===================================================================== */
    @media (min-width: 940px) and (min-height: 561px) {
      .kw-root {
        max-width: 1180px;
        height: auto;
        min-height: 100dvh;
        padding: 10px 14px;
        gap: 8px;
      }
      .kw-stage {
        flex: none;
        height: min(76vh, 710px);
        min-height: 620px;
        max-height: 710px;
        padding: 16px;
        gap: 10px 20px;
        grid-template-columns: 1.04fr 0.96fr;
        grid-template-rows: auto 1fr 64px 42px;
        grid-template-areas:
          "hud   grid"
          "showcase grid"
          "dock  grid"
          "footer footer";
      }
      .kw-bg-img {
        height: 100%;
        object-position: center center;
        transform: none;
      }
      .kw-bg-overlay {
        background: linear-gradient(
          90deg,
          rgba(15, 23, 42, 0.25) 0%,
          rgba(15, 23, 42, 0.04) 50%,
          rgba(15, 23, 42, 0.24) 100%
        );
      }
      .kw-hud-top {
        align-self: start;
        height: auto;
        min-height: 0;
        max-height: none;
        padding: 8px 11px;
        gap: 5px;
      }
      .kw-targets {
        display: flex;
        flex: 0 0 auto;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        gap: 6px 12px;
        overflow: visible;
      }
      .kw-len-group {
        padding-right: 10px;
        gap: 4px 5px;
      }
      .kw-word-slot {
        height: 19px;
        font-size: 10px;
      }
      .kw-showcase {
        align-items: flex-end;
        justify-content: flex-start;
        padding-bottom: 4px;
      }
      .kw-grid-slot {
        height: 100%;
        align-self: stretch;
      }
      .kw-bottom-dock {
        height: 64px;
        min-height: 64px;
        max-height: 64px;
      }
      .kw-comic-bubble {
        height: 62px;
        max-width: none;
      }
      .kw-comic-text {
        font-size: 13px;
        -webkit-line-clamp: 3;
      }
      .kw-footer {
        height: 42px;
        min-height: 42px;
        max-height: 42px;
        font-size: 12px;
      }
      .kw-footer-meta {
        max-width: 62%;
      }
      .kw-scene-caption {
        opacity: 0.85;
        width: auto;
      }
    }

    /* =====================================================================
     * MOBILE LANDSCAPE GUARD ("Ruota il telefono nell'altra direzione")
     * Triggers on rotated smartphones (landscape & short viewport <= 560px)
     * ===================================================================== */
    .kw-rotate-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: radial-gradient(circle at center, #1e293b 0%, #0b1120 100%);
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      gap: 14px;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    @media (orientation: landscape) and (max-height: 560px) {
      .kw-rotate-overlay {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
    }
    .kw-rotate-icon {
      font-size: 54px;
      animation: kw-tilt-phone 1.8s ease-in-out infinite;
    }
    @keyframes kw-tilt-phone {
      0%, 100% { transform: rotate(90deg); }
      45%, 65% { transform: rotate(0deg); }
    }
    .kw-rotate-title {
      font-size: 20px;
      font-weight: 900;
      color: #fde68a;
    }
    .kw-rotate-sub {
      font-size: 14px;
      color: #cbd5e1;
      max-width: 380px;
      line-height: 1.4;
    }

    .kw-bonus-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #fde68a;
      border-radius: 999px;
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
    }
    .kw-bonus-pill:hover {
      background: rgba(245, 158, 11, 0.32);
    }
    .kw-bonus-pill.pulse-gold {
      animation: kwGoldPulse 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      background: rgba(251, 191, 36, 0.45);
      border-color: #fde68a;
    }
    @keyframes kwGoldPulse {
      0% { transform: scale(1); box-shadow: 0 0 0 rgba(251, 191, 36, 0); }
      45% { transform: scale(1.22); box-shadow: 0 0 18px rgba(251, 191, 36, 0.85); }
      100% { transform: scale(1); box-shadow: 0 0 0 rgba(251, 191, 36, 0); }
    }
    .kw-flying-doubloon {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #fde047, #f59e0b);
      color: #451a03;
      border: 2px solid #fffbeb;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 900;
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.65);
      transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.48s ease;
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

    /* OVERLAY MODALS (Album, Treasure Trove & End-of-Level Hall of Fame) */
    .kw-album-modal,
    .kw-hof-modal {
      position: absolute;
      inset: 10px;
      z-index: 20;
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
    .kw-album-modal.visible,
    .kw-hof-modal.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    .kw-hof-modal[hidden] {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .kw-hof-scroll {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
    .kw-hof-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 4px;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }
    .kw-album-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      font-size: 15px;
      color: #fde68a;
    }
    .kw-album-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
      height: 125px;
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

    /* SLIM APP FOOTER */
    .kw-app-footer {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 9px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 10px;
      color: #94a3b8;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
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
  <!-- MOBILE LANDSCAPE ROTATE GUARD -->
  <div class="kw-rotate-overlay" id="kw-rotate-overlay" aria-live="polite">
    <div class="kw-rotate-icon">📱</div>
    <div class="kw-rotate-title">Ruota il telefono nell'altra direzione!</div>
    <div class="kw-rotate-sub">
      Metti il telefono in <strong>verticale ↕️</strong> per giocare con i tasti giganti e vedere Ale e Seby ben chiari!
    </div>
  </div>

  <div class="kw-root">
    <div class="kw-topbar">
      <div class="kw-profiles">
        <button class="kw-profile-btn active" data-tier="facile" id="btn-tier-facile">🐣 Bimbo / Facile</button>
        <button class="kw-profile-btn" data-tier="medio" id="btn-tier-medio">🐉 Ragazzo / Medio</button>
        <button class="kw-profile-btn" data-tier="difficile" id="btn-tier-difficile">🧠 Adulto / Difficile</button>
      </div>
      <div class="kw-level-nav">
        <button class="kw-pill-btn" id="btn-prev-lvl" title="Livello precedente">◀</button>
        <span id="lbl-level-idx" style="font-size:11.5px;font-weight:800;">Lv 1/3</span>
        <button class="kw-pill-btn" id="btn-next-lvl" title="Livello successivo">▶</button>
        <button class="kw-pill-btn" id="btn-album" title="Apri l'Album delle Foto Cartoon di Ale & Seby">🖼️</button>
        <puffin-login id="puffin-widget" app-id="kids-words" lang="it" require-login="false" compact></puffin-login>
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
          <span id="lbl-tiles-left" style="color:#fde68a;">Tessere: 9 · 0/11</span>
        </div>
        <div class="kw-targets" id="kw-targets"></div>
      </div>

      <!-- CLEAR ART SHOWCASE WINDOW (Ale & Seby always visible!) + Live Swipe Pill -->
      <div class="kw-showcase" id="kw-showcase">
        <div class="kw-swipe-slot" id="kw-swipe-slot">
          <div class="kw-current-word" id="kw-current-word"></div>
        </div>
      </div>

      <!-- GIANT RESPONSIVE MATRIX SLOT (~50% of stage!) -->
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
          <span id="lbl-progress-badge" style="color:#93c5fd;font-weight:800;">👤 Anonimo</span>
          <button class="kw-bonus-pill" id="btn-treasure" title="Apri il Forziere dei Dobloni (parole extra trovate)">
            🪙 <strong id="lbl-bonus-count">0</strong>
          </button>
          <span id="lbl-scene-caption" class="kw-scene-caption"></span>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0;">
          <button class="kw-pill-btn" id="btn-peek" title="Ammira Ale e Seby sullo sfondo">👀 Foto</button>
          <button class="kw-action-btn" id="btn-hint">💡 Aiuto</button>
          <button class="kw-action-btn kw-debug-hidden" id="btn-solve-one" title="Solo Papà Debug (Riccardo)" style="background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">✨ +1</button>
          <button class="kw-pill-btn" id="btn-reset">🔄</button>
        </div>
      </div>

      <!-- ALBUM OVERLAY MODAL -->
      <div class="kw-album-modal" id="kw-album-modal">
        <div class="kw-album-header">
          <span>🖼️ Galleria di Ale & Seby (Clicca una scheda sbloccata!)</span>
          <button class="kw-pill-btn" id="btn-album-close">✖ Chiudi</button>
        </div>
        <div class="kw-album-grid" id="kw-album-grid"></div>
      </div>

      <!-- TREASURE TROVE (BISCOTTIERA SEGRETA) MODAL -->
      <div class="kw-album-modal" id="kw-treasure-modal">
        <div class="kw-album-header">
          <span id="lbl-treasure-title">🍪 Biscottiera Segreta — Parole Bonus</span>
          <button class="kw-pill-btn" id="btn-treasure-close">✖ Chiudi</button>
        </div>
        <div style="font-size:12px;color:#cbd5e1;">
          Tutte le parole italiane reali in questa griglia (verificate su dizionario <em>it_IT</em>) che non erano tra le parole principali finiscono qui!
        </div>
        <div class="kw-treasure-chips" id="kw-treasure-chips"></div>
      </div>

      <!-- HALL OF FAME (ONLY shown & refreshed when a schema is completed!) -->
      <section id="hof-section" class="kw-hof-modal" hidden>
        <div class="kw-album-header">
          <span id="lbl-hof-title">🏆 Schema Completato · Hall of Fame</span>
          <button class="kw-pill-btn" id="btn-hof-close">✖ Chiudi</button>
        </div>
        <div class="kw-hof-scroll">
          <puffin-leaderboard id="game-lb" filter-game="kids-words" back-href="./" lang="it"></puffin-leaderboard>
        </div>
        <div class="kw-hof-actions">
          <button class="kw-pill-btn" id="btn-hof-admire">🖼️ Guarda Foto</button>
          <button class="kw-action-btn" id="btn-hof-next">▶ Prossimo Schema</button>
        </div>
      </section>
    </div>

    <!-- CARLESSIAN VERSION & GITHUB FOOTER -->
    <footer class="kw-app-footer" id="kw-app-footer">
      <div style="overflow:hidden;text-overflow:ellipsis;">
        <strong>🔤 Kids Words</strong> · <code style="color:#fde68a;">v${APP_VERSION}</code>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:nowrap;align-items:center;flex-shrink:0;">
        <a href="https://github.com/palladius/kids-words" target="_blank" rel="noopener noreferrer">🐙 GitHub</a>
        <a href="https://palladius.github.io/vetrina/" target="_blank" rel="noopener noreferrer">🎮 Vetrina</a>
        <a href="./ring.html">🔥💍 Ring</a>
      </div>
    </footer>
  </div>

  <script>
    const APP_VERSION = ${JSON.stringify(APP_VERSION)};
    const LEVELS_IT = ${JSON.stringify(LEVELS_IT)};
    const SCENES_IMG = ${JSON.stringify(SCENES_IMG)};
    const SCENES_IMG_PORTRAIT = ${JSON.stringify(SCENES_IMG_PORTRAIT)};
    const PORTRAIT_SHIFT_Y = ${JSON.stringify(PORTRAIT_SHIFT_Y)};
    ${KidsWordsEngine.toString()}
    ${LevelProgression.toString()}

    const progression = new LevelProgression({
      totalByTier: {
        facile: LEVELS_IT.filter(l => l.tier === 'facile').length,
        medio: LEVELS_IT.filter(l => l.tier === 'medio').length,
        difficile: LEVELS_IT.filter(l => l.tier === 'difficile').length,
      },
      storage: typeof window !== 'undefined' ? window.localStorage : null,
    });

    let currentTier = 'facile';
    let currentIdx = 0;
    let engine = null;
    let dragPath = [];
    let isDragging = false;
    let hintedCoords = [];
    let levelStartedAt = new Date().toISOString();
    let currentTileSize = 96;
    let currentTileGap = 9;
    let hofRevealTimer = null;

    function isDesktopWidescreen() {
      return window.matchMedia('(min-width: 940px) and (min-height: 561px)').matches;
    }

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

    function openLoginGate() {
      try {
        const w = document.getElementById('puffin-widget');
        if (w && typeof w.openModal === 'function') w.openModal({ tab: 'login' });
      } catch {}
    }

    function setTier(tier) {
      currentTier = tier;
      currentIdx = 0;
      document.getElementById('btn-tier-facile').classList.toggle('active', tier === 'facile');
      document.getElementById('btn-tier-medio').classList.toggle('active', tier === 'medio');
      document.getElementById('btn-tier-difficile').classList.toggle('active', tier === 'difficile');
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

    function hideHallOfFame() {
      if (hofRevealTimer) {
        clearTimeout(hofRevealTimer);
        hofRevealTimer = null;
      }
      const hof = document.getElementById('hof-section');
      if (hof) {
        hof.hidden = true;
        hof.classList.remove('visible');
      }
    }

    function loadLevel() {
      clampToUnlocked();
      hideHallOfFame();
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

    function computeAndApplyGridGeometry() {
      if (!engine) return;
      const lvl = engine.level;
      const rows = lvl.grid.rows;
      const cols = lvl.grid.cols;
      const slotEl = document.getElementById('kw-grid-slot');
      const wrapEl = document.getElementById('kw-grid-wrap');
      if (!slotEl || !wrapEl) return;

      const slotW = Math.max(200, slotEl.clientWidth - 8);
      const slotH = Math.max(200, slotEl.clientHeight - 8);
      const maxDim = Math.max(rows, cols);
      const gap = maxDim >= 5 ? 5 : Math.max(6, Math.min(12, Math.round(Math.min(slotW, slotH) * 0.026)));
      const maxByW = Math.floor((slotW - gap * (cols - 1)) / cols);
      const maxByH = Math.floor((slotH - gap * (rows - 1)) / rows);
      const tileSize = Math.max(40, Math.min(142, Math.min(maxByW, maxByH)));

      currentTileSize = tileSize;
      currentTileGap = gap;

      wrapEl.style.setProperty('--tile', tileSize + 'px');
      wrapEl.style.setProperty('--gap', gap + 'px');
      wrapEl.style.setProperty('--tile-font', Math.round(tileSize * 0.44) + 'px');
      wrapEl.style.setProperty('--tile-dep-font', Math.max(9, Math.round(tileSize * 0.145)) + 'px');
      wrapEl.style.setProperty('--tile-radius', Math.max(10, Math.round(tileSize * 0.21)) + 'px');
      drawLaser();
    }

    function updateBackgroundArt() {
      if (!engine) return;
      const lvl = engine.level;
      const bgImg = document.getElementById('kw-bg-img');
      if (!bgImg) return;
      const desktop = isDesktopWidescreen();
      const map = desktop ? SCENES_IMG : SCENES_IMG_PORTRAIT;
      const nextSrc = map[lvl.scene_id] || map.bees_meadow;
      if (bgImg.getAttribute('src') !== nextSrc) {
        bgImg.setAttribute('src', nextSrc);
      }
      bgImg.style.setProperty('--portrait-shift', desktop ? '0%' : (PORTRAIT_SHIFT_Y[lvl.scene_id] || '-6%'));
    }

    function renderAll() {
      const levels = getTierLevels();
      const lvl = engine.level;
      const solvedCount = engine.solvedWords.size;
      const totalCount = lvl.targets.length;
      const uid = getActiveUserId();
      const user = getActiveUser();
      const isAdmin = progression.isAdmin(uid);
      const isPersistent = progression.isPersistentUser(uid);
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);

      const lockStatus = isAdmin
        ? '👑'
        : (!isPersistent
            ? '🔒 Login Lv2+'
            : (maxUnlocked >= levels.length - 1 ? '🔓' : '🔒' + (maxUnlocked + 1) + '/' + levels.length));
      document.getElementById('lbl-level-idx').textContent =
        'Lv ' + (currentIdx + 1) + '/' + levels.length + ' (' + lockStatus + ')';

      const prevBtn = document.getElementById('btn-prev-lvl');
      const nextBtn = document.getElementById('btn-next-lvl');
      prevBtn.disabled = currentIdx <= 0 && !isAdmin;
      // Keep nextBtn clickable if anonymous so clicking it can prompt Login!
      nextBtn.disabled = isPersistent && currentIdx >= maxUnlocked && !isAdmin;
      nextBtn.title = !isPersistent
        ? 'Fai Login in alto a destra per sbloccare il Livello 2+!'
        : (nextBtn.disabled ? 'Completa questo livello per sbloccare il prossimo!' : 'Livello successivo');

      const solveOneBtn = document.getElementById('btn-solve-one');
      solveOneBtn.classList.toggle('kw-debug-hidden', !isAdmin);

      const progEl = document.getElementById('lbl-progress-badge');
      if (isAdmin) {
        progEl.textContent = '👑 Papà';
      } else if (isPersistent && user) {
        progEl.textContent = '🐧 ' + user.shortName + ' (' + (maxUnlocked + 1) + '/' + levels.length + ')';
      } else {
        progEl.textContent = '👤 Anon · 🔒 Lv2+';
      }

      document.getElementById('lbl-theme').textContent = lvl.theme;
      document.getElementById('lbl-scene-caption').textContent = '🎨 ' + lvl.scene_caption;
      document.getElementById('lbl-tiles-left').textContent =
        'Tessere: ' + engine.getActiveTileCount() + ' · ' + solvedCount + '/' + totalCount;
      document.getElementById('lbl-bonus-count').textContent = engine.bonusWordsFound.size;
      const treasureBtn = document.getElementById('btn-treasure');
      if (treasureBtn) {
        treasureBtn.title = 'Forziere dei Dobloni: ' + engine.bonusWordsFound.size + ' parole extra trovate (su ' + (lvl.bonus_words || []).length + ' nel dizionario)';
      }

      updateBackgroundArt();

      // Target slots GROUPED BY LENGTH ascending (3L | 4L | 5L)
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
            infoDot.style.fontSize = '9.5px';
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

      // Giant Responsive Grid
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
      computeAndApplyGridGeometry();
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
      if (!svg) return;
      if (dragPath.length < 2) {
        svg.innerHTML = '';
        return;
      }
      const pitch = currentTileSize + currentTileGap;
      const half = currentTileSize / 2;
      const strokeW = Math.max(6, Math.round(currentTileSize * 0.11));
      const pts = dragPath.map(([r, c]) => {
        const x = c * pitch + half;
        const y = r * pitch + half;
        return x + ',' + y;
      }).join(' ');
      svg.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="#f59e0b" stroke-width="' + strokeW + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.88"/>';
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

    async function refreshAndShowHallOfFame(kidName, hasNext) {
      const hof = document.getElementById('hof-section');
      const titleEl = document.getElementById('lbl-hof-title');
      const nextBtn = document.getElementById('btn-hof-next');
      const lb = document.getElementById('game-lb');

      if (titleEl) {
        titleEl.textContent = '🎉 Bravo ' + kidName + '! · 🏆 Hall of Fame Aggiornata';
      }
      if (nextBtn) {
        nextBtn.textContent = hasNext ? '▶ Prossimo Schema' : '🔄 Rigioca Tier';
      }
      if (lb) {
        if (typeof lb.render === 'function') lb.render();
        if (typeof lb.syncFromCloud === 'function') {
          try { await lb.syncFromCloud(); } catch {}
        }
        if (typeof lb.render === 'function') lb.render();
      }
      if (hof) {
        hof.hidden = false;
        hof.classList.add('visible');
      }
    }

    async function handleResult(res) {
      hintedCoords = [];
      if (res.status === 'target_solved') {
        const t = res.target;
        if (t.needs_explanation) {
          showComicBubble(t.emoji, t.word, t.explanation_text, 'Parola Ostica ' + t.cefr);
          speakItalian(t.word + '! ' + t.explanation_text);
        } else {
          showComicBubble(t.emoji || '🌟', t.word + '!', 'Ottimo colpo! Le lettere esaurite scompaiono svelando lo sfondo!', 'Parola Base ' + t.cefr);
          speakItalian(t.word + '!');
        }
        if (res.isLevelComplete) {
          const uid = getActiveUserId();
          const isPersistent = progression.isPersistentUser(uid);
          const newMaxUnlocked = progression.recordLevelCompleted(uid, currentTier, currentIdx);
          const kidName = getActiveUser()?.shortName || 'Campione';
          const levels = getTierLevels();
          const hasNext = currentIdx + 1 < levels.length;

          // Render immediately so final tiles vanish & level unlock updates without waiting for network
          renderAll();
          updateDragVisuals();

          // Persist score & update Hall of Fame
          let scoreSubmitted = false;
          try {
            if (window.PuffinLogin && isPersistent) {
              const endedAt = new Date().toISOString();
              const durationSec = Math.max(5, Math.round((Date.parse(endedAt) - Date.parse(levelStartedAt)) / 1000));
              const score = engine.level.targets.length * 100 + engine.bonusWordsFound.size * 25 + (currentIdx + 1) * 50;
              await window.PuffinLogin.submitScore({
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
              });
              scoreSubmitted = true;
            }
          } catch {}

          // Let the kid enjoy the revealed illustration & TTS, then show updated Hall of Fame
          const unlockMsg = hasNext
            ? 'Livello ' + (currentIdx + 2) + ' sbloccato!'
            : 'Hai completato tutti i livelli di questa modalità!';
          setTimeout(() => {
            if (!isPersistent) {
              const gateMsg = '🔒 Livello 2 bloccato per gli anonimi! Fai Login in alto a destra (🔐 Login) per sbloccare il Livello 2!';
              showComicBubble('🔐', 'Quadro Svelato! Ora fai Login!', gateMsg, 'Login Richiesto');
              speakItalian('Bravissimo! Ma per andare al livello 2 devi fare login!');
            } else {
              showComicBubble('🎉', 'Quadro Svelato, bravo ' + kidName + '!', unlockMsg, 'Schema Completato');
              speakItalian('Evviva ' + kidName + '! ' + unlockMsg);
            }
          }, 700);

          if (hofRevealTimer) clearTimeout(hofRevealTimer);
          hofRevealTimer = setTimeout(() => {
            refreshAndShowHallOfFame(kidName, hasNext && (isPersistent || progression.isAdmin(uid)));
          }, 1700);
        }
      } else if (res.status === 'bonus_word') {
        playBiribip();
        animateDoubloonToTreasure(res.word);
      } else if (res.status === 'already_solved') {
        showComicBubble('✅', res.word, 'Questa parola l’avevi già scoperta nello schema!', 'Già trovata');
      } else if (res.status === 'already_bonus') {
        playBiribip();
        const tBtn = document.getElementById('btn-treasure');
        if (tBtn) {
          tBtn.classList.remove('pulse-gold');
          void tBtn.offsetWidth;
          tBtn.classList.add('pulse-gold');
        }
      } else if (res.status === 'not_found' && res.word && res.word.length >= 3) {
        showComicBubble('🤔', res.word, 'Non risulta nel dizionario italiano di questa griglia. Prova un’altra strada!', 'Riprova');
      }
      renderAll();
      updateDragVisuals();
    }

    function playBiribip() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = window.__kwAudio || (window.__kwAudio = new AC());
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        [[987.77, 0.0, 0.06], [1318.51, 0.06, 0.09], [1567.98, 0.13, 0.11]].forEach(([freq, offset, dur]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + offset);
          gain.gain.setValueAtTime(0.001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.13, now + offset + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + dur + 0.01);
        });
      } catch {}
    }

    function animateDoubloonToTreasure(word) {
      try {
        const srcEl = document.getElementById('kw-grid-wrap') || document.getElementById('kw-current-word');
        const dstEl = document.getElementById('btn-treasure');
        if (!srcEl || !dstEl) return;
        const s = srcEl.getBoundingClientRect();
        const d = dstEl.getBoundingClientRect();
        const startX = s.left + s.width / 2 - 44;
        const startY = s.top + 10;
        const dx = d.left + d.width / 2 - (startX + 44);
        const dy = d.top + d.height / 2 - (startY + 14);

        const pill = document.createElement('div');
        pill.className = 'kw-flying-doubloon';
        pill.textContent = '🪙 ' + word + ' +1';
        pill.style.left = startX + 'px';
        pill.style.top = startY + 'px';
        document.body.appendChild(pill);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            pill.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.65)';
            pill.style.opacity = '0.18';
          });
        });
        setTimeout(() => {
          pill.remove();
          dstEl.classList.remove('pulse-gold');
          void dstEl.offsetWidth;
          dstEl.classList.add('pulse-gold');
        }, 480);
      } catch {}
    }

    function renderTreasure() {
      const chipsEl = document.getElementById('kw-treasure-chips');
      const total = (engine.level.bonus_words || []).length;
      const found = Array.from(engine.bonusWordsFound).sort((a, b) => a.length - b.length || a.localeCompare(b));
      document.getElementById('lbl-treasure-title').textContent =
        '🪙 Forziere dei Dobloni — ' + found.length + ' / ' + total + ' parole extra scoperte';
      if (!found.length) {
        chipsEl.innerHTML = '<div style="color:#94a3b8;font-size:13px;">Ancora nessun doblone nel forziere! Ogni parola italiana extra valida vola qui con un "biribip!" e vale +1 doblone d’oro!</div>';
        return;
      }
      chipsEl.innerHTML = found.map(w => '<span class="kw-treasure-chip">🪙 ' + w + '</span>').join('');
    }

    function tierDisplayName(tier) {
      if (tier === 'facile') return '🐣 Facile';
      if (tier === 'medio') return '🐉 Medio';
      return '🧠 Adulto';
    }

    function renderAlbum() {
      const albumGrid = document.getElementById('kw-album-grid');
      albumGrid.innerHTML = '';
      const uid = getActiveUserId();
      const isPersistent = progression.isPersistentUser(uid);
      LEVELS_IT.forEach((lvl) => {
        const tierLevels = LEVELS_IT.filter(x => x.tier === lvl.tier);
        const idxInTier = tierLevels.findIndex(x => x.id === lvl.id);
        const unlocked = progression.isLevelUnlocked(uid, lvl.tier, idxInTier);
        const card = document.createElement('div');
        card.className = 'kw-album-card' + (unlocked ? '' : ' locked');
        const tierBadge = tierDisplayName(lvl.tier);
        const lockLabel = unlocked ? '🔓 Sbloccato' : (isPersistent ? '🔒 Bloccato' : '🔐 Richiede Login');
        card.innerHTML =
          '<img src="' + (SCENES_IMG[lvl.scene_id] || SCENES_IMG.bees_meadow) + '" alt="' + lvl.theme + '"/>' +
          '<div class="kw-album-card-caption">' +
            '<div style="color:#fde68a;margin-bottom:2px;">' + tierBadge + ' · ' + lockLabel + ' · ' + lvl.theme + '</div>' +
            '<div style="opacity:0.85;font-weight:600;">' + lvl.scene_caption + '</div>' +
          '</div>';
        card.addEventListener('click', () => {
          if (!unlocked) {
            document.getElementById('kw-album-modal').classList.remove('visible');
            if (!isPersistent) {
              showComicBubble('🔐', 'Login Richiesto!', 'Per accedere al Livello 2+ devi fare Login in alto a destra!', 'Login Richiesto');
              openLoginGate();
            } else {
              showComicBubble('🔒', 'Livello Bloccato!', 'Completa prima i livelli precedenti per sbloccare "' + lvl.theme + '"!', 'Bloccato');
            }
            return;
          }
          setTier(lvl.tier);
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

    document.getElementById('btn-tier-facile').addEventListener('click', () => {
      setTier('facile');
      loadLevel();
    });

    document.getElementById('btn-tier-medio').addEventListener('click', () => {
      setTier('medio');
      loadLevel();
    });

    document.getElementById('btn-tier-difficile').addEventListener('click', () => {
      setTier('difficile');
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
      const isPersistent = progression.isPersistentUser(uid);
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);
      if (progression.isAdmin(uid)) {
        currentIdx = (currentIdx + 1) % levels.length;
        loadLevel();
      } else if (!isPersistent) {
        showComicBubble('🔐', 'Login Richiesto!', 'Per passare al Livello 2 devi prima fare Login (🔐 Login) in alto a destra!', 'Solo Utenti Registrati');
        openLoginGate();
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
      hideHallOfFame();
      document.getElementById('kw-album-modal').classList.toggle('visible');
    });

    document.getElementById('btn-album-close').addEventListener('click', () => {
      document.getElementById('kw-album-modal').classList.remove('visible');
    });

    document.getElementById('btn-treasure').addEventListener('click', () => {
      renderTreasure();
      document.getElementById('kw-album-modal').classList.remove('visible');
      hideHallOfFame();
      document.getElementById('kw-treasure-modal').classList.toggle('visible');
    });

    document.getElementById('btn-treasure-close').addEventListener('click', () => {
      document.getElementById('kw-treasure-modal').classList.remove('visible');
    });

    document.getElementById('btn-hof-close').addEventListener('click', hideHallOfFame);
    document.getElementById('btn-hof-admire').addEventListener('click', () => {
      hideHallOfFame();
      document.getElementById('kw-stage').classList.add('peeking');
    });
    document.getElementById('btn-hof-next').addEventListener('click', () => {
      const levels = getTierLevels();
      const uid = getActiveUserId();
      const maxUnlocked = progression.getUnlockedMaxIdx(uid, currentTier);
      if (currentIdx + 1 <= maxUnlocked && currentIdx + 1 < levels.length) {
        currentIdx += 1;
      } else if (progression.isAdmin(uid)) {
        currentIdx = (currentIdx + 1) % levels.length;
      } else {
        currentIdx = 0;
      }
      loadLevel();
    });

    document.getElementById('btn-peek').addEventListener('click', () => {
      document.getElementById('kw-stage').classList.toggle('peeking');
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      const unsolved = engine.getUnsolvedTargets();
      if (!unsolved.length) return;
      const next = unsolved[0];
      hintedCoords = currentTier === 'facile' ? next.path.slice(0, 2) : next.path.slice(0, 1);
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
      if (user.id === 'seby') {
        setTier('facile');
      } else if (user.id === 'ale') {
        setTier('medio');
      } else if (user.id === 'riccardo' || user.id === 'kate' || user.id === 'lucilla') {
        setTier('difficile');
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

    window.addEventListener('resize', () => {
      updateBackgroundArt();
      computeAndApplyGridGeometry();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateBackgroundArt();
        computeAndApplyGridGeometry();
      }, 120);
    });
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        computeAndApplyGridGeometry();
      });
      ro.observe(document.getElementById('kw-grid-slot'));
    }

    // Initial boot (supports ?tier=facile|medio|difficile permalink) + wait briefly for puffin-login upgrade
    try {
      const qpTier = new URLSearchParams(window.location.search).get('tier');
      if (qpTier && ['facile', 'medio', 'difficile'].includes(qpTier)) {
        setTier(qpTier);
      }
    } catch {}
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
