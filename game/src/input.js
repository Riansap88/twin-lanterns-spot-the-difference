// Pointer and keyboard input. Pointer positions are mapped into the game's fixed
// 1280x720 logical space, so a click lands where the player aimed whatever the window
// size is. Keys are gathered into an action bitmask the main loop drains each frame.

import { FIELD } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_NEXT = 32;
export const ACTION_LEVEL_1 = 64;
export const ACTION_LEVEL_2 = 128;
export const ACTION_LEVEL_3 = 256;

export function createInput(canvas) {
  let actions = 0;
  let pointer = null;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pointer = toLogical(event);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        actions |= ACTION_CONFIRM;
        break;
      case 'p':
      case 'P':
      case 'Escape':
        actions |= ACTION_PAUSE;
        break;
      case 'h':
      case 'H':
        actions |= ACTION_HINT;
        break;
      case 'r':
      case 'R':
        actions |= ACTION_RESTART;
        break;
      case 'm':
      case 'M':
        actions |= ACTION_MUTE;
        break;
      case 'n':
      case 'N':
        actions |= ACTION_NEXT;
        break;
      case '1':
        actions |= ACTION_LEVEL_1;
        break;
      case '2':
        actions |= ACTION_LEVEL_2;
        break;
      case '3':
        actions |= ACTION_LEVEL_3;
        break;
      default:
        break;
    }
  });

  function takePointer() {
    const p = pointer;
    pointer = null;
    return p;
  }

  function takeActions() {
    const a = actions;
    actions = 0;
    return a;
  }

  return { takePointer, takeActions };
}
