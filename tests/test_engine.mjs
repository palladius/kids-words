import assert from 'node:assert/strict';
import test from 'node:test';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LEVELS_IT } from '../src/levels_it.mjs';

test('Phase 1: All Italian levels have dense words (11-16 Seby, 20-24 Ale 3x4/3x5/4x4), sorted by length, ORTHOGONAL ONLY, and D(r,c) >= 1 invariant', () => {
  assert.ok(LEVELS_IT.length >= 7, 'Should have at least 7 curated Italian levels (Seby + Ale)');
  for (const level of LEVELS_IT) {
    const engine = new KidsWordsEngine(level);
    if (level.tier === 'seby') {
      assert.ok(
        level.targets.length >= 11 && level.targets.length <= 16,
        `Seby level ${level.id} must have 11-16 words, found ${level.targets.length}`
      );
    } else {
      assert.ok(
        level.targets.length >= 20 && level.targets.length <= 24,
        `Ale level ${level.id} must have 20-24 words, found ${level.targets.length}`
      );
    }

    // Verify targets are grouped/sorted by length ascending
    for (let i = 1; i < level.targets.length; i++) {
      assert.ok(
        level.targets[i].word.length >= level.targets[i - 1].word.length,
        `Targets in ${level.id} must be sorted by length ascending (${level.targets[i - 1].word} before ${level.targets[i].word})`
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

test('Phase 4: Immutable grid layout, widescreen desktop media query, length-grouped word bank & Nano Banana scenes', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

  assert.match(html, /grid-template-rows:\s*130px\s+34px\s+286px\s+74px\s+44px/);
  assert.match(html, /@media\s*\(min-width:\s*940px\)/, 'Must have intelligent widescreen desktop layout');
  assert.match(html, /kw-len-group/, 'Target words must be grouped by length (3L | 4L | 5L)');

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
