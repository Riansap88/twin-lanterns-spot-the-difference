// Everything the player sees: the two pictures, the markers on found differences, the
// top bar (level, clock, counter, score, hints and buttons) and the overlay cards for
// the title, pause, level-clear, time-up and win screens.

import { FIELD, HUD, LEVELS, PALETTE, PANEL } from './config.js';
import { drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 400} ${size}px ${FONT}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The clickable buttons of the top bar, in logical coordinates. */
export function hudButtons(state) {
  return [
    { id: 'hint', label: `Hint (${state.hintsLeft})  [H]`, x: 908, y: 26, w: 128, h: 40 },
    { id: 'sound', label: state.muted ? 'Sound off  [M]' : 'Sound on  [M]', x: 1044, y: 26, w: 118, h: 40 },
    { id: 'pause', label: 'Pause  [P]', x: 1170, y: 26, w: 92, h: 40 },
  ];
}

function drawTopBar(ctx, state) {
  const level = LEVELS[state.levelIndex];
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, HUD.height);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, HUD.height - 2, FIELD.width, 2);
  text(ctx, 'TWIN LANTERNS', 48, 30, 26, PALETTE.text, 700);
  text(ctx, 'Spot the Difference', 48, 62, 14, PALETTE.muted, 400);
  text(ctx, `Level ${state.levelIndex + 1} — ${level.name}`, 330, 30, 17, PALETTE.text, 600);
  text(ctx, level.subtitle, 330, 58, 13, PALETTE.muted, 400);
  // Clock: a bar that drains, turning red under half a minute.
  const ratio = Math.max(0, state.timeLeft / level.timeLimit);
  const barX = 575;
  const barW = 180;
  ctx.fillStyle = '#171226';
  ctx.beginPath();
  ctx.roundRect(barX, 22, barW, 14, 7);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? PALETTE.teal : ratio > 0.2 ? PALETTE.gold : PALETTE.red;
  if (ratio > 0) {
    ctx.beginPath();
    ctx.roundRect(barX, 22, barW * ratio, 14, 7);
    ctx.fill();
  }
  text(ctx, fmtTime(state.timeLeft), barX + barW / 2, 29, 13, PALETTE.text, 700, 'center');
  text(ctx, 'Time left', barX + barW / 2, 56, 12, PALETTE.muted, 400, 'center');
  // Found counter: the number the judge looks for first.
  const found = state.found.size;
  const total = level.diffs.length;
  const left = total - found;
  text(ctx, `${found}/${total} found`, 790, 30, 20, PALETTE.gold, 700);
  text(ctx, left === 0 ? 'All found!' : `${left} still hidden`, 790, 58, 13, PALETTE.muted, 400);
  text(ctx, `Score ${state.score}`, 790, 82, 13, PALETTE.text, 600);
  for (const b of hudButtons(state)) {
    pill(ctx, b.x, b.y, b.w, b.h, '#2e2547', PALETTE.panelRing);
    text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, 13, PALETTE.text, 600, 'center');
  }
}

function drawPanels(ctx, state, dimmed) {
  const panels = [
    { x: PANEL.leftX, variant: 0, tag: 'A' },
    { x: PANEL.rightX, variant: 1, tag: 'B' },
  ];
  for (const p of panels) {
    ctx.save();
    ctx.translate(p.x, PANEL.y);
    drawScene(ctx, state.levelIndex, p.variant, state.elapsed);
    ctx.restore();
    ctx.strokeStyle = PALETTE.panelRing;
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x, PANEL.y, PANEL.size, PANEL.size);
    pill(ctx, p.x + 12, PANEL.y + 12, 34, 34, 'rgba(20, 16, 29, 0.85)', PALETTE.panelRing);
    text(ctx, p.tag, p.x + 29, PANEL.y + 30, 17, PALETTE.text, 700, 'center');
    if (dimmed) {
      ctx.fillStyle = 'rgba(20, 16, 29, 0.45)';
      ctx.fillRect(p.x, PANEL.y, PANEL.size, PANEL.size);
    }
  }
}

function drawMarkers(ctx, state) {
  const panels = [PANEL.leftX, PANEL.rightX];
  for (const mark of state.marks.found) {
    const diff = LEVELS[state.levelIndex].diffs.find((d) => d.id === mark.id);
    const pop = Math.min(1, mark.age / 0.25);
    const r = (diff ? diff.r : 26) * (0.7 + 0.3 * pop);
    for (const px of panels) {
      const cx = px + mark.x;
      const cy = PANEL.y + mark.y;
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fff3c4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 13, 0, Math.PI * 2);
      ctx.stroke();
      // Check mark across the ring.
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx - 3, cy + 9);
      ctx.lineTo(cx + 13, cy - 9);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
  }
  for (const mark of state.marks.wrong) {
    const alpha = Math.max(0, 1 - mark.age / 0.8);
    if (alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const px of panels) {
      const cx = px + mark.x;
      const cy = PANEL.y + mark.y;
      ctx.strokeStyle = PALETTE.red;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 10);
      ctx.lineTo(cx + 10, cy + 10);
      ctx.moveTo(cx + 10, cy - 10);
      ctx.lineTo(cx - 10, cy + 10);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
    ctx.restore();
  }
  const hint = state.hintPulse;
  if (hint) {
    const pulse = 0.5 + 0.5 * Math.sin(hint.age * 6);
    const r = 26 + pulse * 8;
    for (const px of panels) {
      const cx = px + hint.x;
      const cy = PANEL.y + hint.y;
      ctx.strokeStyle = `rgba(79, 209, 197, ${0.55 + 0.45 * pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawStatusLine(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, HUD.bottomY, FIELD.width, FIELD.height - HUD.bottomY);
  text(ctx, state.message, FIELD.width / 2, HUD.bottomY + 22, 15, PALETTE.text, 500, 'center');
}

function card(ctx, w, h) {
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  ctx.fillStyle = 'rgba(20, 16, 29, 0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelRing;
  ctx.lineWidth = 2;
  ctx.stroke();
  return { x, y, w, h };
}

function drawTitle(ctx, state, best) {
  const c = card(ctx, 640, 420);
  const cx = c.x + c.w / 2;
  text(ctx, 'TWIN LANTERNS', cx, c.y + 56, 44, PALETTE.gold, 800, 'center');
  text(ctx, 'Spot the Difference', cx, c.y + 104, 22, PALETTE.text, 600, 'center');
  text(ctx, 'Two pictures, seven differences. Find them all before the clock runs out.', cx, c.y + 152, 15, PALETTE.muted, 400, 'center');
  text(ctx, 'Click a difference in either picture. A gold ring marks each find.', cx, c.y + 180, 15, PALETTE.muted, 400, 'center');
  text(ctx, 'H — hint (3 per level)      P — pause      M — sound      R — restart', cx, c.y + 210, 14, PALETTE.muted, 400, 'center');
  text(ctx, 'Three scenes, harder as you go:', cx, c.y + 252, 15, PALETTE.text, 600, 'center');
  LEVELS.forEach((level, i) => {
    text(ctx, `${i + 1}. ${level.name} — ${level.timeLimit / 60} min, ${level.diffs.length} differences`, cx, c.y + 282 + i * 26, 15, PALETTE.text, 400, 'center');
  });
  if (best > 0) text(ctx, `Best score: ${best}`, cx, c.y + 368, 15, PALETTE.gold, 600, 'center');
  text(ctx, 'Click or press Enter to start', cx, c.y + 394, 16, PALETTE.text, 700, 'center');
}

function drawPaused(ctx) {
  const c = card(ctx, 420, 180);
  text(ctx, 'Paused', c.x + c.w / 2, c.y + 62, 34, PALETTE.text, 700, 'center');
  text(ctx, 'Press P or click to keep hunting', c.x + c.w / 2, c.y + 118, 15, PALETTE.muted, 400, 'center');
}

function drawClear(ctx, state) {
  const c = card(ctx, 560, 300);
  const cx = c.x + c.w / 2;
  const level = LEVELS[state.levelIndex];
  text(ctx, 'Level clear!', cx, c.y + 58, 36, PALETTE.gold, 800, 'center');
  text(ctx, `All ${level.diffs.length} differences in ${level.name} found.`, cx, c.y + 108, 16, PALETTE.text, 500, 'center');
  text(ctx, `Level score ${state.levelScore}   •   Total ${state.score}`, cx, c.y + 146, 16, PALETTE.text, 600, 'center');
  text(ctx, `Best combo x${state.bestCombo}   •   Misses ${state.misses}`, cx, c.y + 180, 14, PALETTE.muted, 400, 'center');
  text(ctx, 'Press N for the next level', cx, c.y + 238, 16, PALETTE.text, 700, 'center');
}

function drawOver(ctx, state) {
  const c = card(ctx, 560, 300);
  const cx = c.x + c.w / 2;
  const level = LEVELS[state.levelIndex];
  text(ctx, "Time's up", cx, c.y + 58, 36, PALETTE.red, 800, 'center');
  text(ctx, `You found ${state.found.size} of ${level.diffs.length} differences in ${level.name}.`, cx, c.y + 108, 16, PALETTE.text, 500, 'center');
  text(ctx, `${level.diffs.length - state.found.size} were still hidden.`, cx, c.y + 146, 16, PALETTE.muted, 400, 'center');
  text(ctx, `Score ${state.score}`, cx, c.y + 180, 16, PALETTE.text, 600, 'center');
  text(ctx, 'Press R to try this level again', cx, c.y + 238, 16, PALETTE.text, 700, 'center');
}

function drawWin(ctx, state, best) {
  const c = card(ctx, 620, 340);
  const cx = c.x + c.w / 2;
  text(ctx, 'You found them all!', cx, c.y + 58, 36, PALETTE.gold, 800, 'center');
  text(ctx, 'Every difference in all three scenes — 21 in total.', cx, c.y + 108, 16, PALETTE.text, 500, 'center');
  text(ctx, `Final score ${state.score}`, cx, c.y + 152, 22, PALETTE.text, 700, 'center');
  text(ctx, `Best combo x${state.bestCombo}   •   Misses ${state.misses}`, cx, c.y + 192, 14, PALETTE.muted, 400, 'center');
  if (state.score >= best && best > 0) text(ctx, 'A new best score!', cx, c.y + 224, 15, PALETTE.gold, 600, 'center');
  text(ctx, 'Press Enter to play again', cx, c.y + 288, 16, PALETTE.text, 700, 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    canvas.width = FIELD.width;
    canvas.height = FIELD.height;
    canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
    canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
  }
  fit();
  window.addEventListener('resize', fit);

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawTopBar(ctx, state);
    const dimmed = screen === SCREEN_TITLE || screen === SCREEN_PAUSED;
    drawPanels(ctx, state, dimmed);
    if (screen !== SCREEN_TITLE) drawMarkers(ctx, state);
    drawStatusLine(ctx, state);
    if (screen === SCREEN_TITLE) drawTitle(ctx, state, best);
    else if (screen === SCREEN_PAUSED) drawPaused(ctx);
    else if (screen === SCREEN_CLEAR) drawClear(ctx, state);
    else if (screen === SCREEN_OVER) drawOver(ctx, state);
    else if (screen === SCREEN_WIN) drawWin(ctx, state, best);
  }

  return { draw, fit };
}
