import assert from 'node:assert/strict';
import test from 'node:test';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LEVELS_IT } from '../src/levels_it.mjs';

test('Phase 1: All Italian levels have 8-10 words, ORTHOGONAL ONLY (no diagonals), and D(r,c) >= 1 invariant', () => {
  assert.ok(LEVELS_IT.length >= 6, 'Should have at least 6 curated Italian levels (Seby + Ale)');
  for (const level of LEVELS_IT) {
    const engine = new KidsWordsEngine(level);
    assert.ok(
      level.targets.length >= 8 && level.targets.length <= 10,
      `Level ${level.id} must have 8-10 cohesive words, found ${level.targets.length}`
    );

    const uniqueWords = new Set(level.targets.map(t => t.word));
    assert.equal(uniqueWords.size, level.targets.length, `Duplicate target words in ${level.id}`);

    for (const target of level.targets) {
      assert.equal(target.path.length, target.word.length, `Path length mismatch for ${target.word} in ${level.id}`);
      const seen = new Set();
      for (let i = 0; i < target.path.length; i++) {
        const [r, c] = target.path[i];
        const key = `${r},${c}`;
        assert.ok(!seen.has(key), `Duplicate coordinate ${key} in word ${target.word}`);
        seen.add(key);
        assert.equal(level.grid.initial_letters[r][c], target.word[i], `Letter mismatch at ${key} for ${target.word} in ${level.id}`);
        if (i > 0) {
          const [pr, pc] = target.path[i - 1];
          const manhattan = Math.abs(r - pr) + Math.abs(c - pc);
          assert.equal(
            manhattan,
            1,
            `DIAGONAL or non-adjacent step forbidden in ${level.id} word ${target.word}: (${pr},${pc}) -> (${r},${c})`
          );
        }
      }
    }

    for (let r = 0; r < level.grid.rows; r++) {
      for (let c = 0; c < level.grid.cols; c++) {
        if (level.grid.initial_letters[r][c]) {
          assert.ok(engine.getDependencyCount(r, c) >= 1, `Tile (${r},${c}) in ${level.id} has 0 initial dependencies!`);
        }
      }
    }
  }
});

test('Phase 2: Engine strictly rejects diagonal steps and enforces orthogonal-only swipe', () => {
  const level = LEVELS_IT[0];
  const engine = new KidsWordsEngine(level);

  assert.equal(engine.isValidStep([0, 0], [0, 1], [[0, 0]]), true, 'Horizontal step must be allowed');
  assert.equal(engine.isValidStep([0, 0], [1, 0], [[0, 0]]), true, 'Vertical step must be allowed');
  assert.equal(engine.isValidStep([0, 0], [1, 1], [[0, 0]]), false, 'Diagonal step must be REJECTED');
});

test('Phase 3: Solving all words except the last one leaves exact K letters for the final word', () => {
  const level = LEVELS_IT[0];
  const engine = new KidsWordsEngine(level);

  for (let i = 0; i < level.targets.length - 1; i++) {
    const res = engine.submitPath(level.targets[i].path);
    assert.equal(res.status, 'target_solved');
  }

  const lastTarget = level.targets[level.targets.length - 1];
  assert.equal(engine.getActiveTileCount(), lastTarget.word.length);

  const finalRes = engine.submitPath(lastTarget.path);
  assert.equal(finalRes.isLevelComplete, true);
  assert.equal(engine.getActiveTileCount(), 0);
});

test('Phase 4: Immutable grid layout (no display:none shift on swipe/bubble, bottom dock below matrix) & Nano Banana cartoon scenes', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

  // 1. Fixed 5-row CSS grid stage so no row can push the matrix
  assert.match(html, /grid-template-rows:\s*112px\s+36px\s+324px\s+76px\s+44px/);

  // 2. Bottom comic dock (#kw-bottom-dock) must appear AFTER #kw-grid-slot in DOM
  const gridPos = html.indexOf('id="kw-grid-slot"');
  const dockPos = html.indexOf('id="kw-bottom-dock"');
  assert.ok(gridPos > 0 && dockPos > gridPos, 'Comic bubble dock must be placed below the immutable letter matrix');

  // 3. Neither .kw-current-word nor .kw-comic-bubble may use display:none (prevents reflow/shift on swipe)
  const cssBlock = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  assert.ok(!cssBlock.includes('display: none'), 'CSS must not use display: none on swipe or comic elements');

  // 4. All levels map to existing Nano Banana cartoon WebP assets
  for (const level of LEVELS_IT) {
    assert.ok(
      ['bees_meadow', 'aquarium', 'dragon_forest', 'zurich_stars'].includes(level.scene_id),
      `Unexpected scene_id ${level.scene_id} in ${level.id}`
    );
  }
});

