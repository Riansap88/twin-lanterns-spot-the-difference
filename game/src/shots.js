// The screenshot scenes behind ?shot=start|play|hint|end. Each one sets the world to a
// real state the rules can produce (a fresh title, a mid-hunt with three of seven
// found, a hint pulsing on the night market, a finished level), so the frame is what
// a short game really looks like, and the same seed always gives the same frame.

import { LEVELS } from './config.js';
import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { STATUS_CLEAR, STATUS_PLAY } from './world.js';

function markFound(world, ids) {
  const state = world.state;
  for (const id of ids) {
    const diff = LEVELS[state.levelIndex].diffs.find((d) => d.id === id);
    if (!diff) continue;
    state.found.add(id);
    state.marks.found.push({ id, x: diff.x, y: diff.y, age: 1 });
  }
  state.totalFound += ids.length;
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the best
 * score to show. Any other name is the title scene.
 */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'play') {
    world.startGame();
    markFound(world, [0, 2, 4]);
    state.combo = 3;
    state.bestCombo = 3;
    state.score = 340;
    state.levelScore = 340;
    state.timeLeft = 132;
    state.message = 'Moon crater! +100 (combo x3) — 4 still hidden.';
    state.status = STATUS_PLAY;
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  if (name === 'hint') {
    world.startGame();
    world.startLevel(2);
    markFound(world, [1, 4]);
    state.combo = 2;
    state.bestCombo = 2;
    state.score = 890;
    state.levelScore = 890;
    state.timeLeft = 88;
    const target = LEVELS[2].diffs[0];
    state.hintPulse = { id: target.id, x: target.x, y: target.y, age: 1.2 };
    state.message = 'Hint: look near the sign symbol…';
    state.status = STATUS_PLAY;
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  if (name === 'end') {
    world.startGame();
    markFound(world, [0, 1, 2, 3, 4, 5, 6]);
    state.combo = 7;
    state.bestCombo = 7;
    state.timeLeft = 96;
    state.score = 1240;
    state.levelScore = 1240;
    state.message = 'All 7 found! Time bonus +480.';
    state.status = STATUS_CLEAR;
    return { screen: SCREEN_CLEAR, best: 1250 };
  }
  world.reset();
  return { screen: SCREEN_TITLE, best: 1250 };
}
