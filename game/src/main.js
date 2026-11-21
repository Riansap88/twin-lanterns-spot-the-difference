// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between six screens: title, play, paused, level-clear, time-up
// and win. Clicks on the top bar hit its buttons; clicks inside a picture hunt for a
// difference in either picture.
//
// ?seed=N fixes the random draws. ?shot=start|play|hint|end (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady for a
// screenshot.

import { BEST_KEY, HUD, LEVELS, PANEL, STEP } from './config.js';
import { createRandom } from './random.js';
import {
  EVENT_CLEAR,
  EVENT_FOUND,
  EVENT_HINT,
  EVENT_MISS,
  EVENT_OVER,
  EVENT_WIN,
  STATUS_CLEAR,
  STATUS_OVER,
  STATUS_PLAY,
  STATUS_TITLE,
  STATUS_WIN,
  createWorld,
} from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_LEVEL_1,
  ACTION_LEVEL_2,
  ACTION_LEVEL_3,
  ACTION_MUTE,
  ACTION_NEXT,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import {
  SCREEN_CLEAR,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
  createRenderer,
  hudButtons,
} from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

window.__errors = [];
window.addEventListener('error', (event) => {
  window.__errors.push(String(event.message || event.error || 'error'));
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();
const input = createInput(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;
  const state = world.state;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.startGame();
    screen = SCREEN_PLAY;
    lastTickSecond = -1;
    announce(`Playing ${LEVELS[0].name}. Find ${LEVELS[0].diffs.length} differences.`);
  }

  function startLevel(index) {
    audio.unlock();
    world.startLevel(index);
    screen = SCREEN_PLAY;
    lastTickSecond = -1;
    announce(`Playing ${LEVELS[index].name}. Find ${LEVELS[index].diffs.length} differences.`);
  }

  function finishLevel() {
    audio.clear();
    screen = state.status === STATUS_WIN ? SCREEN_WIN : SCREEN_CLEAR;
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
    announce(state.message);
  }

  function endGame() {
    audio.miss();
    screen = SCREEN_OVER;
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
    announce(`Time up. Found ${state.found.size} of ${LEVELS[state.levelIndex].diffs.length}.`);
  }

  function handlePointer() {
    const p = input.takePointer();
    if (!p) return;
    audio.unlock();
    if (p.y < HUD.height) {
      for (const b of hudButtons(state)) {
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
          if (b.id === 'hint') doHint();
          else if (b.id === 'sound') toggleMute();
          else if (b.id === 'pause') togglePause();
          return;
        }
      }
      return;
    }
    if (screen === SCREEN_TITLE) {
      startGame();
      return;
    }
    if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    if (screen === SCREEN_CLEAR) {
      world.nextLevel();
      screen = SCREEN_PLAY;
      announce(`Playing ${LEVELS[state.levelIndex].name}.`);
      return;
    }
    if (screen === SCREEN_OVER) {
      startLevel(state.levelIndex);
      return;
    }
    if (screen === SCREEN_WIN) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    let panel = null;
    if (p.x >= PANEL.leftX && p.x <= PANEL.leftX + PANEL.size && p.y >= PANEL.y && p.y <= PANEL.y + PANEL.size) {
      panel = { x: p.x - PANEL.leftX, y: p.y - PANEL.y };
    } else if (p.x >= PANEL.rightX && p.x <= PANEL.rightX + PANEL.size && p.y >= PANEL.y && p.y <= PANEL.y + PANEL.size) {
      panel = { x: p.x - PANEL.rightX, y: p.y - PANEL.y };
    }
    if (panel) doClick(panel.x, panel.y);
  }

  function doClick(x, y) {
    const events = world.clickAt(x, y);
    if (events & EVENT_FOUND) {
      audio.find();
      announce(state.message);
      if (events & (EVENT_CLEAR | EVENT_WIN)) finishLevel();
    } else if (events & EVENT_MISS) {
      audio.miss();
      announce(state.message);
    }
  }

  function doHint() {
    const events = world.useHint();
    if (events & EVENT_HINT) {
      audio.hint();
      announce(state.message);
    }
  }

  function toggleMute() {
    audio.setMuted(!audio.isMuted());
    state.muted = audio.isMuted();
    announce(state.muted ? 'Sound off.' : 'Sound on.');
  }

  function togglePause() {
    if (screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (!actions) return;
    if (actions & ACTION_MUTE) toggleMute();
    if (screen === SCREEN_TITLE) {
      if (actions & ACTION_CONFIRM) startGame();
      else if (actions & ACTION_LEVEL_1) startLevel(0);
      else if (actions & ACTION_LEVEL_2) startLevel(1);
      else if (actions & ACTION_LEVEL_3) startLevel(2);
      return;
    }
    if (screen === SCREEN_PLAY) {
      if (actions & ACTION_PAUSE) togglePause();
      else if (actions & ACTION_HINT) doHint();
      else if (actions & ACTION_RESTART) startLevel(state.levelIndex);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (actions & (ACTION_PAUSE | ACTION_CONFIRM)) togglePause();
      else if (actions & ACTION_RESTART) startLevel(state.levelIndex);
      return;
    }
    if (screen === SCREEN_CLEAR) {
      if (actions & (ACTION_NEXT | ACTION_CONFIRM)) {
        world.nextLevel();
        screen = SCREEN_PLAY;
        announce(`Playing ${LEVELS[state.levelIndex].name}.`);
      }
      return;
    }
    if (screen === SCREEN_OVER) {
      if (actions & (ACTION_RESTART | ACTION_CONFIRM)) startLevel(state.levelIndex);
      return;
    }
    if (screen === SCREEN_WIN) {
      if (actions & ACTION_CONFIRM) startGame();
    }
  }

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_OVER) endGame();
    if (state.status === STATUS_PLAY && state.timeLeft <= 10) {
      const whole = Math.ceil(state.timeLeft);
      if (whole !== lastTickSecond) {
        lastTickSecond = whole;
        audio.tick();
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handlePointer();
    handleActions();
    if (screen === SCREEN_PLAY || screen === SCREEN_TITLE) {
      while (accumulator >= STEP && (screen === SCREEN_PLAY || screen === SCREEN_TITLE)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
