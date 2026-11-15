/**
 * Stateful Level Progression Manager for Kids Words (Parole in Fuga).
 *
 * Rules (Strict PuffinLogin Gate on Level 2+):
 * - Anonymous / Guest (`!userId || userId === 'guest'`):
 *   Locked to Level 1 (`idx === 0`) ONLY! Even after completing Level 1, Level 2+
 *   remains locked (`🔒`) until the player logs in with a named PuffinLogin profile.
 * - Authenticated Kids / Family (`ale`, `seby`, `kate`, `lucilla`):
 *   Persistent per-user progress backed by localStorage AND Cloud Firestore (`extra.unlocked_max_idx`).
 *   Winning Level `i` unlocks `i + 1`. Ale's and Seby's progression remain strictly isolated.
 * - Admin / Papà (`riccardo`):
 *   Full debug access: all levels unlocked and admin solve-assist enabled.
 */
export class LevelProgression {
  constructor({ totalByTier = { facile: 3, medio: 4, difficile: 3 }, storage = null } = {}) {
    this.totalByTier = { ...totalByTier };
    this.storage = storage;
    this.cloudCache = new Map(); // key `${userId}:${tier}` -> maxIdx
  }

  static storageKey(userId) {
    return `kids_words_progress_v1_${userId}`;
  }

  isAdmin(userId) {
    return userId === 'riccardo';
  }

  isPersistentUser(userId) {
    return Boolean(userId) && userId !== 'guest';
  }

  getUnlockedMaxIdx(userId, tier) {
    const maxTierIdx = Math.max(0, (this.totalByTier[tier] || 1) - 1);
    if (this.isAdmin(userId)) {
      return maxTierIdx;
    }
    // Sadistic gate: anonymous & guest players NEVER unlock Level 2+ without logging in!
    if (!this.isPersistentUser(userId)) {
      return 0;
    }
    let stored = 0;
    if (this.storage) {
      try {
        const raw = this.storage.getItem(LevelProgression.storageKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          stored = Number(parsed?.[tier] || 0);
        }
      } catch {}
    }
    const cloud = this.cloudCache.get(`${userId}:${tier}`) || 0;
    return Math.min(maxTierIdx, Math.max(stored, cloud));
  }

  isLevelUnlocked(userId, tier, idx) {
    if (idx <= 0) return true;
    return idx <= this.getUnlockedMaxIdx(userId, tier);
  }

  recordLevelCompleted(userId, tier, completedIdx) {
    // Anonymous / Guest cannot unlock Level 2+ without logging in
    if (!this.isPersistentUser(userId)) {
      return 0;
    }

    const maxTierIdx = Math.max(0, (this.totalByTier[tier] || 1) - 1);
    if (this.isAdmin(userId)) {
      return maxTierIdx;
    }

    const nextUnlocked = Math.min(maxTierIdx, Math.max(0, Number(completedIdx) + 1));
    const currentMax = this.getUnlockedMaxIdx(userId, tier);
    const updatedMax = Math.max(currentMax, nextUnlocked);
    this.cloudCache.set(`${userId}:${tier}`, updatedMax);

    if (this.storage) {
      try {
        const key = LevelProgression.storageKey(userId);
        const raw = this.storage.getItem(key);
        const data = raw ? JSON.parse(raw) : {};
        data[tier] = updatedMax;
        this.storage.setItem(key, JSON.stringify(data));
      } catch {}
    }
    return updatedMax;
  }

  mergeCloudScores(userId, scores = []) {
    if (!this.isPersistentUser(userId) || this.isAdmin(userId)) return;
    for (const s of scores) {
      if (!s || s.player_id !== userId) continue;
      const tier = s.extra?.tier;
      if (!tier || !(tier in this.totalByTier)) continue;
      const maxTierIdx = Math.max(0, (this.totalByTier[tier] || 1) - 1);
      const fromCompleted =
        s.extra?.level_index !== undefined ? Number(s.extra.level_index) + 1 : 0;
      const fromUnlocked =
        s.extra?.unlocked_max_idx !== undefined ? Number(s.extra.unlocked_max_idx) : 0;
      const candidate = Math.min(maxTierIdx, Math.max(fromCompleted, fromUnlocked));
      const key = `${userId}:${tier}`;
      const prev = this.cloudCache.get(key) || 0;
      if (candidate > prev) {
        this.cloudCache.set(key, candidate);
      }
    }
    if (this.storage) {
      try {
        const key = LevelProgression.storageKey(userId);
        const raw = this.storage.getItem(key);
        const data = raw ? JSON.parse(raw) : {};
        for (const tier of Object.keys(this.totalByTier)) {
          data[tier] = Math.max(Number(data[tier] || 0), this.cloudCache.get(`${userId}:${tier}`) || 0);
        }
        this.storage.setItem(key, JSON.stringify(data));
      } catch {}
    }
  }
}
