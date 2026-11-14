import assert from 'node:assert/strict';
import test from 'node:test';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LEVELS_IT } from '../src/levels_it.mjs';

test('Phase 1: All Italian levels satisfy grid bounds and D(r,c) >= 1 invariant', () => {
  assert.ok(LEVELS_IT.length >= 6, 'Should have at least 6 curated Italian levels (Seby + Ale)');
  for (const level of LEVELS_IT) {
    const engine = new KidsWordsEngine(level);
    for (const target of level.targets) {
      assert.equal(target.path.length, target.word.length, `Path length mismatch for ${target.word} in ${level.id}`);
      const seen = new Set();
      for (let i = 0; i < target.path.length; i++) {
        const [r, c] = target.path[i];
        const key = `${r},${c}`;
        assert.ok(!seen.has(key), `Duplicate coordinate ${key} in word ${target.word}`);
        seen.add(key);
        assert.equal(level.grid.initial_letters[r][c], target.word[i], `Letter mismatch at ${key} for ${target.word}`);
        if (i > 0) {
          const [pr, pc] = target.path[i - 1];
          assert.ok(Math.abs(r - pr) <= 1 && Math.abs(c - pc) <= 1, `Non-adjacent step in ${target.word}`);
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

test('Phase 2: Reference counter D(r,c) only shrinks tiles when all words using them are solved', () => {
  const level = LEVELS_IT.find(l => l.id === 'it_seby_001');
  const engine = new KidsWordsEngine(level);

  assert.equal(engine.getDependencyCount(0, 0), 2);
  assert.equal(engine.getDependencyCount(0, 1), 1);

  const res1 = engine.submitPath([[0, 0], [0, 1], [0, 2]]);
  assert.equal(res1.status, 'target_solved');
  assert.equal(res1.target.word, 'APE');
  assert.equal(engine.getDependencyCount(0, 0), 1, 'A is still needed by ARNIA');
  assert.equal(engine.getDependencyCount(0, 1), 0, 'P should be depleted (D=0)');
  assert.equal(engine.isTileActive(0, 1), false, 'P tile must be inactive/shrunk');
  assert.equal(engine.isTileActive(0, 0), true, 'A tile must remain active');
});

test('Phase 3: Endgame leaves exact K letters for the last word, then 0 active tiles on win', () => {
  const level = LEVELS_IT.find(l => l.id === 'it_seby_001');
  const engine = new KidsWordsEngine(level);

  engine.submitPath(level.targets[0].path);
  const res2 = engine.submitPath(level.targets[1].path);
  assert.equal(res2.target.word, 'ARNIA');
  assert.equal(res2.target.needs_explanation, true, 'ARNIA is B1+ and must trigger comic + TTS explanation');

  const lastWord = level.targets[2];
  assert.equal(engine.getActiveTileCount(), lastWord.word.length);

  const res3 = engine.submitPath(lastWord.path);
  assert.equal(res3.isLevelComplete, true);
  assert.equal(engine.getActiveTileCount(), 0, 'All tiles must disappear at level end to reveal the illustration!');
});
