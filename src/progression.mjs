/**
 * Stateful Level Progression Manager for Kids Words (Parole in Fuga).
 *
 * Rules:
 * - Anonymous / Guest (`!userId || userId === 'guest'`):
 *   RAM-only session progress (`{ seby: 0, ale: 0 }`). Winning Level 1 unlocks Level 2
 *   for the current session, but refreshing (F5) or opening another browser resets to Level 1 (idx 0).
 * - Authenticated Kids / Family (`ale`, `seby`, `kate`, `lucilla`):
 *   Persistent per-user progress backed by localStorage AND Cloud Firestore (`extra.unlocked_max_idx`).
 *   Winning Level `i` unlocks `i + 1`. Ale's and Seby's progression remain strictly isolated.
 * - Admin / Papà (`riccardo`):
 *   Full debug access: all levels unlocked and admin solve-assist enabled.
 */
export class LevelProgression {
  constructor({ totalByTier = { seby: 3, ale: 4 }, storage = null } = {}) {
    this.totalByTier = { ...totalByTier };
    this.storage = storage;
    this.ramAnon = new Map(); // key `${userId || 'anon'}:${tier}` -> maxIdx
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
    if (!this.isPersistentUser(userId)) {
      return Math.min(maxTierIdx, this.ramAnon.get(`${userId || 'anon'}:${tier}`) || 0);
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
    const maxTierIdx = Math.max(0, (this.totalByTier[tier] || 1) - 1);
    const nextUnlocked = Math.min(maxTierIdx, Math.max(0, Number(completedIdx) + 1));

    if (!this.isPersistentUser(userId)) {
      const k = `${userId || 'anon'}:${tier}`;
      const val = Math.max(this.ramAnon.get(k) || 0, nextUnlocked);
      this.ramAnon.set(k, val);
      return val;
    }

    if (this.isAdmin(userId)) {
      return maxTierIdx;
    }

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
    // Persist merged high-water mark to localStorage as well
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
