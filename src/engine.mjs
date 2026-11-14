export class KidsWordsEngine {
  constructor(level) {
    this.level = structuredClone(level);
    this.solvedWords = new Set();
    this.bonusWordsFound = new Set();
  }

  getUnsolvedTargets() {
    return this.level.targets.filter(t => !this.solvedWords.has(t.word));
  }

  getDependencyCount(r, c) {
    let count = 0;
    for (const target of this.getUnsolvedTargets()) {
      if (target.path.some(([pr, pc]) => pr === r && pc === c)) {
        count++;
      }
    }
    return count;
  }

  isTileActive(r, c) {
    return this.getDependencyCount(r, c) > 0;
  }

  getActiveTileCount() {
    let active = 0;
    for (let r = 0; r < this.level.grid.rows; r++) {
      for (let c = 0; c < this.level.grid.cols; c++) {
        if (this.isTileActive(r, c)) active++;
      }
    }
    return active;
  }

  // Strictly ORTHOGONAL (Horizontal or Vertical ONLY, NO DIAGONAL: Manhattan distance == 1)
  isValidStep(prevCoord, nextCoord, currentPath) {
    const [r, c] = nextCoord;
    if (!this.isTileActive(r, c)) return false;
    if (currentPath.some(([pr, pc]) => pr === r && pc === c)) return false;
    if (!prevCoord) return true;
    const [pr, pc] = prevCoord;
    return Math.abs(r - pr) + Math.abs(c - pc) === 1;
  }

  spellFromPath(path) {
    return path.map(([r, c]) => this.level.grid.initial_letters[r][c]).join('');
  }

  submitPath(path) {
    if (!path || path.length < 2) {
      return { status: 'too_short', word: '' };
    }
    for (let i = 0; i < path.length; i++) {
      const [r, c] = path[i];
      if (!this.isTileActive(r, c)) {
        return { status: 'invalid_tile', word: '' };
      }
      if (i > 0) {
        const [pr, pc] = path[i - 1];
        if (Math.abs(r - pr) + Math.abs(c - pc) !== 1) {
          return { status: 'non_orthogonal', word: '' };
        }
      }
    }

    const word = this.spellFromPath(path);

    const target = this.getUnsolvedTargets().find(t => t.word === word);
    if (target) {
      const beforeActive = new Set();
      for (let r = 0; r < this.level.grid.rows; r++) {
        for (let c = 0; c < this.level.grid.cols; c++) {
          if (this.isTileActive(r, c)) beforeActive.add(`${r},${c}`);
        }
      }

      this.solvedWords.add(target.word);

      const shrunkTiles = [];
      for (const key of beforeActive) {
        const [r, c] = key.split(',').map(Number);
        if (!this.isTileActive(r, c)) {
          shrunkTiles.push([r, c]);
        }
      }

      return {
        status: 'target_solved',
        word: target.word,
        target,
        shrunkTiles,
        isLevelComplete: this.getUnsolvedTargets().length === 0
      };
    }

    if (this.solvedWords.has(word)) {
      return { status: 'already_solved', word };
    }

    if ((this.level.bonus_words || []).map(w => w.trim()).includes(word)) {
      const isNewBonus = !this.bonusWordsFound.has(word);
      this.bonusWordsFound.add(word);
      return { status: isNewBonus ? 'bonus_word' : 'already_bonus', word };
    }

    return { status: 'not_found', word };
  }
}
