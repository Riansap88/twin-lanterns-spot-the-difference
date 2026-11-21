// The game state and its rules: levels, finds, misses, hints, the clock and the score.
// The world knows nothing about pixels; the renderer reads this state and paints it.

import { CLICK_SLOP, LEVELS, SCORING } from './config.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_HINT = 4;
export const EVENT_CLEAR = 8;
export const EVENT_OVER = 16;
export const EVENT_WIN = 32;

export const STATUS_TITLE = 'title';
export const STATUS_PLAY = 'play';
export const STATUS_CLEAR = 'clear';
export const STATUS_OVER = 'over';
export const STATUS_WIN = 'win';

function freshMarks() {
  return { found: [], wrong: [], hint: null };
}

export function createWorld(random) {
  const state = {
    levelIndex: 0,
    status: STATUS_TITLE,
    found: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    misses: 0,
    hintsLeft: SCORING.hintsPerLevel,
    timeLeft: LEVELS[0].timeLimit,
    timeUsed: 0,
    totalFound: 0,
    levelScore: 0,
    lastFoundLabel: '',
    message: '',
    marks: freshMarks(),
    hintPulse: null,
    muted: false,
    elapsed: 0,
  };

  function level() {
    return LEVELS[state.levelIndex];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.combo = 0;
    state.misses = 0;
    state.hintsLeft = SCORING.hintsPerLevel;
    state.timeLeft = LEVELS[index].timeLimit;
    state.timeUsed = 0;
    state.levelScore = 0;
    state.lastFoundLabel = '';
    state.message = `Find ${LEVELS[index].diffs.length} differences.`;
    state.marks = freshMarks();
    state.hintPulse = null;
    state.status = STATUS_PLAY;
  }

  function reset() {
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.totalFound = 0;
    state.elapsed = 0;
    startLevel(0);
    state.status = STATUS_TITLE;
  }

  function startGame() {
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.totalFound = 0;
    state.elapsed = 0;
    startLevel(0);
  }

  /** A click inside a picture, in panel-local coordinates. Either picture counts. */
  function clickAt(x, y) {
    if (state.status !== STATUS_PLAY) return EVENT_NONE;
    const diffs = level().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      const d = diffs[i];
      const dx = x - d.x;
      const dy = y - d.y;
      const reach = d.r + CLICK_SLOP;
      if (dx * dx + dy * dy > reach * reach) continue;
      if (state.found.has(d.id)) return EVENT_NONE;
      state.found.add(d.id);
      state.totalFound += 1;
      state.combo += 1;
      if (state.combo > state.bestCombo) state.bestCombo = state.combo;
      const gained = SCORING.findPoints + SCORING.comboBonus * (state.combo - 1);
      state.score += gained;
      state.levelScore += gained;
      state.lastFoundLabel = d.label;
      state.message = `${d.label}! +${gained}${state.combo > 1 ? ` (combo x${state.combo})` : ''}`;
      state.marks.found.push({ id: d.id, x: d.x, y: d.y, age: 0 });
      state.hintPulse = null;
      if (state.found.size === diffs.length) {
        const bonus = Math.round(state.timeLeft) * SCORING.timeBonusPerSecond;
        state.score += bonus;
        state.levelScore += bonus;
        state.message = `All ${diffs.length} found! Time bonus +${bonus}.`;
        if (state.levelIndex === LEVELS.length - 1) {
          state.status = STATUS_WIN;
          return EVENT_FOUND | EVENT_WIN;
        }
        state.status = STATUS_CLEAR;
        return EVENT_FOUND | EVENT_CLEAR;
      }
      return EVENT_FOUND;
    }
    state.combo = 0;
    state.misses += 1;
    state.score = Math.max(0, state.score - SCORING.missPenalty);
    state.levelScore = Math.max(0, state.levelScore - SCORING.missPenalty);
    state.message = `Not a difference. -${SCORING.missPenalty}`;
    state.marks.wrong.push({ x, y, age: 0 });
    if (state.marks.wrong.length > 6) state.marks.wrong.shift();
    return EVENT_MISS;
  }

  /** Spend one hint: a pulsing ring shows one difference you have not found yet. */
  function useHint() {
    if (state.status !== STATUS_PLAY || state.hintsLeft <= 0) return EVENT_NONE;
    const remaining = level().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return EVENT_NONE;
    const pick = remaining[Math.floor(random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hintPulse = { id: pick.id, x: pick.x, y: pick.y, age: 0 };
    state.message = `Hint: look near the ${pick.label.toLowerCase()}…`;
    return EVENT_HINT;
  }

  function nextLevel() {
    if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
  }

  function step(dt) {
    state.elapsed += dt;
    if (state.status !== STATUS_PLAY) return EVENT_NONE;
    state.timeLeft -= dt;
    state.timeUsed += dt;
    for (const mark of state.marks.found) mark.age += dt;
    for (const mark of state.marks.wrong) mark.age += dt;
    if (state.hintPulse) {
      state.hintPulse.age += dt;
      if (state.hintPulse.age > 4) state.hintPulse = null;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.status = STATUS_OVER;
      state.message = 'Time ran out.';
      return EVENT_OVER;
    }
    return EVENT_NONE;
  }

  return {
    state,
    level,
    reset,
    startGame,
    startLevel,
    clickAt,
    useHint,
    nextLevel,
    step,
  };
}
