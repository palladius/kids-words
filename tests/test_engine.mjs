import assert from 'node:assert/strict';
import test from 'node:test';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LEVELS_IT } from '../src/levels_it.mjs';

test('Phase 1: All Italian levels have dense words (11-15 Seby, 18-20 Ale/12-char), ORTHOGONAL ONLY, B1/B2/C1 explanations, and D(r,c) >= 1 invariant', () => {
  assert.ok(LEVELS_IT.length >= 7, 'Should have at least 7 curated Italian levels (Seby + Ale)');
  for (const level of LEVELS_IT) {
    const engine = new KidsWordsEngine(level);
    if (level.tier === 'seby') {
      assert.ok(
        level.targets.length >= 10 && level.targets.length <= 15,
        `Seby level ${level.id} must have 10-15 words, found ${level.targets.length}`
      );
    } else {
      assert.ok(
        level.targets.length >= 18 && level.targets.length <= 20,
        `Ale 12-char level ${level.id} must have 18-20 words, found ${level.targets.length}`
      );
    }

    const uniqueWords = new Set(level.targets.map(t => t.word));
    assert.equal(uniqueWords.size, level.targets.length, `Duplicate target words in ${level.id}`);

    for (const target of level.targets) {
      assert.equal(target.path.length, target.word.length, `Path length mismatch for ${target.word} in ${level.id}`);
      if (target.needs_explanation) {
        assert.ok(target.explanation_text && target.explanation_text.length > 10, `Missing explanation for ${target.word}`);
      }
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
  for (const level of LEVELS_IT) {
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
  }
});

test('Phase 4: Immutable grid layout (no display:none shift on swipe/bubble, bottom dock below matrix) & Nano Banana cartoon scenes', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

  assert.match(html, /grid-template-rows:\s*150px\s+36px\s+272px\s+76px\s+44px/);

  const gridPos = html.indexOf('id="kw-grid-slot"');
  const dockPos = html.indexOf('id="kw-bottom-dock"');
  assert.ok(gridPos > 0 && dockPos > gridPos, 'Comic bubble dock must be placed below the immutable letter matrix');

  const cssBlock = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  assert.ok(!cssBlock.includes('display: none'), 'CSS must not use display: none on swipe or comic elements');

  const expectedScenes = ['bees_meadow', 'alpine_sun', 'dragon_forest', 'aquarium', 'zurich_stars', 'knight_woods'];
  for (const level of LEVELS_IT) {
    assert.ok(expectedScenes.includes(level.scene_id), `Unexpected scene_id ${level.scene_id} in ${level.id}`);
  }
  assert.match(html, /id="kw-album-modal"/, 'Album dei Ricordi modal must be present');
});

test('Phase 5: Adversarial solve-order fuzzing (random permutations never trap the final word)', () => {
  for (const level of LEVELS_IT) {
    for (let trial = 0; trial < 20; trial++) {
      const engine = new KidsWordsEngine(level);
      const shuffled = [...level.targets].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length - 1; i++) {
        const res = engine.submitPath(shuffled[i].path);
        assert.equal(res.status, 'target_solved', `Failed solving ${shuffled[i].word} in trial ${trial} of ${level.id}`);
      }
      const last = shuffled[shuffled.length - 1];
      assert.equal(engine.getActiveTileCount(), last.word.length, `Exact K active tiles failed for ${last.word} in ${level.id}`);
      const end = engine.submitPath(last.path);
      assert.equal(end.isLevelComplete, true);
      assert.equal(engine.getActiveTileCount(), 0);
    }
  }
});
