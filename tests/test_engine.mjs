import assert from 'node:assert/strict';
import test from 'node:test';
import { KidsWordsEngine } from '../src/engine.mjs';
import { LEVELS_IT } from '../src/levels_it.mjs';
import { LevelProgression } from '../src/progression.mjs';

test('Phase 1: All 10 Italian levels (<=16 tiles max: Facile 3x3/3x4, Medio 3x4/3x5/4x4, Difficile 3x5/4x4), sorted by length, ORTHOGONAL ONLY, and D(r,c) >= 1 invariant', () => {
  assert.ok(LEVELS_IT.length >= 10, 'Should have 10 curated Italian levels (Facile + Medio + Difficile Adult)');
  for (const level of LEVELS_IT) {
    const area = level.grid.rows * level.grid.cols;
    assert.ok(area <= 16, `Grid ${level.id} (${level.grid.rows}x${level.grid.cols}=${area}) exceeds max 16 letters!`);
    const engine = new KidsWordsEngine(level);
    if (level.tier === 'facile') {
      assert.ok(
        level.targets.length >= 11 && level.targets.length <= 16,
        `Facile level ${level.id} must have 11-16 words, found ${level.targets.length}`
      );
    } else if (level.tier === 'medio') {
      assert.ok(
        level.targets.length >= 20 && level.targets.length <= 24,
        `Medio level ${level.id} must have 20-24 words, found ${level.targets.length}`
      );
    } else {
      assert.equal(level.tier, 'difficile');
      assert.ok(
        level.targets.length >= 28 && level.targets.length <= 34,
        `Difficile Adult level ${level.id} must have 28-34 cohesive targets, found ${level.targets.length}`
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

test('Phase 4: Giant 50% responsive keyboard, portrait/desktop layouts, rotate guard, end-of-level Hall of Fame & Nano Banana scenes', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

  assert.match(html, /minmax\(210px,\s*46%\)/, 'Portrait stage must dedicate ~46-50% height to the giant letter keyboard');
  assert.match(html, /computeAndApplyGridGeometry/, 'Tile sizes & SVG laser must scale dynamically with grid slot');
  assert.match(html, /SCENES_IMG_PORTRAIT/, 'Must bundle portrait 9:16 Ale & Seby artwork for vertical phone view');
  assert.match(html, /@media\s*\(min-width:\s*940px\)/, 'Must have intelligent widescreen desktop layout');
  assert.match(html, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*560px\)/, 'Must prompt to rotate phone in mobile landscape');
  assert.match(html, /Ruota il telefono/, 'Rotate overlay must instruct user in Italian');
  assert.match(html, /kw-len-group/, 'Target words must be grouped by length (3L | 4L | 5L)');

  // Hall of Fame must NOT have a topbar toggle during gameplay; it only opens after completing a schema
  assert.ok(!html.includes('id="btn-hof-toggle"'), 'Hall of Fame toggle button must be removed from gameplay topbar');
  assert.match(html, /<section id="hof-section"[^>]*hidden/, 'Hall of Fame must be hidden during gameplay');
  assert.match(html, /refreshAndShowHallOfFame/, 'Hall of Fame must refresh & open upon completing a schema');

  const gridPos = html.indexOf('id="kw-grid-slot"');
  const dockPos = html.indexOf('id="kw-bottom-dock"');
  assert.ok(gridPos > 0 && dockPos > gridPos, 'Comic bubble dock must be placed below the letter matrix');

  const cssBlock = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  assert.ok(!cssBlock.includes('display: none'), 'CSS must not use display: none on swipe, rotate, or modal elements');

  const expectedScenes = ['bees_meadow', 'alpine_sun', 'dragon_forest', 'aquarium', 'zurich_stars', 'knight_woods'];
  for (const level of LEVELS_IT) {
    assert.ok(expectedScenes.includes(level.scene_id), `Unexpected scene_id ${level.scene_id} in ${level.id}`);
  }
  assert.match(html, /id="btn-tier-facile"/);
  assert.match(html, /id="btn-tier-medio"/);
  assert.match(html, /id="btn-tier-difficile"/);
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

test('Phase 6: Exhaustive Italian dictionary completeness (every Hunspell it_IT word on every grid — incl. SOL, SOLO, SOMA, ARARE — is accepted)', async () => {
  const fs = await import('node:fs');
  const lexicon = JSON.parse(
    fs.readFileSync(new URL('../data/it_grid_lexicon.json', import.meta.url), 'utf8')
  );

  function findAllGridWordPaths(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const map = new Map();
    function dfs(r, c, path, word) {
      if (word.length >= 3 && word.length <= 7 && !map.has(word)) {
        map.set(word, [...path]);
      }
      if (word.length >= 7) return;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !path.some(([pr, pc]) => pr === nr && pc === nc)) {
          path.push([nr, nc]);
          dfs(nr, nc, path, word + grid[nr][nc]);
          path.pop();
        }
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dfs(r, c, [[r, c]], grid[r][c]);
      }
    }
    return map;
  }

  for (const level of LEVELS_IT) {
    const validWords = lexicon[level.id];
    assert.ok(Array.isArray(validWords) && validWords.length > 0, `Missing lexicon entries for ${level.id}`);
    const gridPaths = findAllGridWordPaths(level.grid.initial_letters);

    // Fresh engine per check so tile depletion never blocks testing bonus/target recognition
    for (const word of validWords) {
      const path = gridPaths.get(word);
      assert.ok(path, `Word ${word} in lexicon must be reachable orthogonally on ${level.id}`);
      const engine = new KidsWordsEngine(level);
      const res = engine.submitPath(path);
      assert.ok(
        res.status === 'target_solved' || res.status === 'bonus_word',
        `Valid Italian word "${word}" on ${level.id} was NOT accepted (got status=${res.status})!`
      );
    }
  }

  // Explicit regression check for Riccardo & Ale's discovered words in it_ale_001
  const ale1 = LEVELS_IT.find(l => l.id === 'it_ale_001');
  const ale1Paths = findAllGridWordPaths(ale1.grid.initial_letters);
  for (const mustAccept of ['SOL', 'SOLO', 'SOMA', 'ARARE', 'ASOLE', 'MARE', 'RAMO', 'ROSA']) {
    const engine = new KidsWordsEngine(ale1);
    const res = engine.submitPath(ale1Paths.get(mustAccept));
    assert.ok(
      res.status === 'target_solved' || res.status === 'bonus_word',
      `Regression fail on it_ale_001: "${mustAccept}" must be accepted!`
    );
  }
});

test('Phase 7: Sadistic Login Gate on Level 2+ (Anon/Guest strictly locked to Level 1) + Ale/Seby/Papà Progression & Footer version/GH link', async () => {
  const fs = await import('node:fs');
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

  // Verify PuffinLogin, Leaderboard, Version & GitHub link in HTML
  assert.match(html, /<puffin-login[^>]*app-id="kids-words"/);
  assert.match(html, /<puffin-leaderboard[^>]*filter-game="kids-words"/);
  assert.match(html, new RegExp(`v${pkg.version.replace(/\./g, '\\.')}`));
  assert.match(html, /https:\/\/github\.com\/palladius\/kids-words/);
  assert.ok(fs.existsSync(new URL('../public/src/puffin-login.js', import.meta.url)), 'puffin-login.js must exist in public/src/');
  assert.ok(fs.existsSync(new URL('../public/src/puffin-cards.js', import.meta.url)), 'puffin-cards.js must exist in public/src/');

  const store = new Map();
  const mockStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };

  const p1 = new LevelProgression({ totalByTier: { facile: 3, medio: 4, difficile: 3 }, storage: mockStorage });

  // 1. Sadistic Login Gate: Anonymous & Guest NEVER unlock Level 2+ even after winning Level 1!
  assert.equal(p1.isLevelUnlocked(null, 'facile', 0), true);
  assert.equal(p1.isLevelUnlocked(null, 'medio', 0), true);
  assert.equal(p1.isLevelUnlocked(null, 'difficile', 0), true);
  assert.equal(p1.isLevelUnlocked(null, 'medio', 1), false);
  assert.equal(p1.recordLevelCompleted(null, 'medio', 0), 0);
  assert.equal(p1.recordLevelCompleted('guest', 'facile', 0), 0);
  assert.equal(p1.isLevelUnlocked(null, 'medio', 1), false, 'Anonymous MUST stay locked on Level 1 without login!');
  assert.equal(p1.isLevelUnlocked('guest', 'facile', 1), false, 'Guest MUST stay locked on Level 1 without login!');

  // 2. Ale wins Level 1 & Level 2 on medio -> persists across F5, while Seby remains locked at Level 1!
  p1.recordLevelCompleted('ale', 'medio', 0);
  p1.recordLevelCompleted('ale', 'medio', 1);
  const pNewSession = new LevelProgression({ totalByTier: { facile: 3, medio: 4, difficile: 3 }, storage: mockStorage });
  assert.equal(pNewSession.getUnlockedMaxIdx('ale', 'medio'), 2, 'Ale should have Level 3 (idx 2) unlocked after F5');
  assert.equal(pNewSession.getUnlockedMaxIdx('seby', 'facile'), 0, 'Seby must still be at Level 1 (idx 0)');
  assert.equal(pNewSession.isLevelUnlocked('seby', 'facile', 1), false);

  // 3. Cross-device Cloud Firestore sync unlocks Ale on a fresh device (empty localStorage)
  const freshDevice = new LevelProgression({ totalByTier: { facile: 3, medio: 4, difficile: 3 }, storage: null });
  assert.equal(freshDevice.getUnlockedMaxIdx('ale', 'medio'), 0);
  freshDevice.mergeCloudScores('ale', [
    { player_id: 'ale', extra: { tier: 'medio', level_index: 2, unlocked_max_idx: 3 } },
    { player_id: 'seby', extra: { tier: 'facile', level_index: 0, unlocked_max_idx: 1 } },
  ]);
  assert.equal(freshDevice.getUnlockedMaxIdx('ale', 'medio'), 3, 'Ale should sync Level 4 (idx 3) from Cloud Firestore');
  assert.equal(freshDevice.getUnlockedMaxIdx('seby', 'facile'), 0, 'Seby scores must NOT unlock Ale');

  // 4. Papà Admin (riccardo) has all levels unlocked including Adult Difficile 6x6 Schemone
  assert.equal(freshDevice.isAdmin('riccardo'), true);
  assert.equal(freshDevice.getUnlockedMaxIdx('riccardo', 'facile'), 2);
  assert.equal(freshDevice.getUnlockedMaxIdx('riccardo', 'medio'), 3);
  assert.equal(freshDevice.getUnlockedMaxIdx('riccardo', 'difficile'), 2);
});
