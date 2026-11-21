// The three scenes, painted fresh on canvas every frame. One painter draws both
// pictures: `variant` 0 is the left picture, 1 is the right picture with the seven
// differences applied. Every difference lives at the coordinates its level lists in
// config.js, so the painter and the click test can never disagree about where it is.

import { LEVELS } from './config.js';
import { createRandom } from './random.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function sky(ctx, level) {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, level.skyTop);
  g.addColorStop(1, level.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 560, 560);
}

function starField(ctx, seed, count, top) {
  const rnd = createRandom(seed);
  for (let i = 0; i < count; i += 1) {
    const x = 20 + rnd() * 520;
    const y = 10 + rnd() * top;
    const r = 0.8 + rnd() * 1.6;
    ctx.fillStyle = `rgba(255, 244, 214, ${0.35 + rnd() * 0.55})`;
    circle(ctx, x, y, r);
  }
}

function bird(ctx, x, y, s) {
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 9 * s, y);
  ctx.stroke();
}

function koi(ctx, x, y, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = '#f08a3c';
  ellipse(ctx, 0, 0, 22, 9);
  poly(ctx, [[-20, 0], [-30, -8], [-30, 8]]);
  ctx.fillStyle = '#fff3e0';
  ellipse(ctx, 8, -3, 7, 4);
  ctx.fillStyle = '#241d33';
  circle(ctx, 14, -2, 1.8);
  ctx.restore();
}

/** Level 0: a garden at dusk, with a koi pond, stone lanterns and a cat on the wall. */
function drawGarden(ctx, level, variant, time) {
  sky(ctx, level);
  starField(ctx, 101, 26, 150);
  // Moon: the crater dots are difference 0, so the right picture has a bare moon.
  const moon = level.diffs[0];
  ctx.fillStyle = '#f7ead0';
  circle(ctx, moon.x, moon.y, moon.r);
  if (variant === 0) {
    ctx.fillStyle = '#d9c39a';
    circle(ctx, moon.x - 10, moon.y - 6, 6);
    circle(ctx, moon.x + 8, moon.y + 8, 4.5);
    circle(ctx, moon.x + 12, moon.y - 12, 3);
  }
  // Distant hills.
  ctx.fillStyle = '#4a3560';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(140, 220, 300, 285);
  ctx.quadraticCurveTo(430, 330, 560, 260);
  ctx.lineTo(560, 560);
  ctx.lineTo(0, 560);
  ctx.closePath();
  ctx.fill();
  // Wire with birds: the middle bird is difference 1.
  line(ctx, 0, 148, 560, 148, 2, '#241d33');
  bird(ctx, 200, 148, 1);
  if (variant === 0) bird(ctx, 280, 148, 1);
  bird(ctx, 360, 148, 1);
  // Cherry tree on the left.
  ctx.fillStyle = '#5a3a2e';
  ctx.beginPath();
  ctx.moveTo(52, 330);
  ctx.quadraticCurveTo(58, 260, 46, 205);
  ctx.lineTo(62, 205);
  ctx.quadraticCurveTo(74, 265, 70, 330);
  ctx.closePath();
  ctx.fill();
  const blossom = createRandom(77);
  for (let i = 0; i < 26; i += 1) {
    const bx = 20 + blossom() * 110;
    const by = 150 + blossom() * 110;
    ctx.fillStyle = blossom() > 0.5 ? '#f2a7c3' : '#e87ea6';
    circle(ctx, bx, by, 7 + blossom() * 6);
  }
  // Koi pond.
  ctx.fillStyle = '#2e6f8e';
  ellipse(ctx, 300, 340, 190, 78);
  ctx.fillStyle = '#3f8fb0';
  ellipse(ctx, 300, 332, 165, 62);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [rx, ry, rw] of [[-70, -12, 60], [40, 14, 80], [90, -18, 46]]) {
    ctx.beginPath();
    ctx.ellipse(300 + rx, 340 + ry, rw, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  koi(ctx, 232, 322, false);
  koi(ctx, 368, 348, true);
  // Difference 4: a third koi only in the right picture.
  if (variant === 1) koi(ctx, 300, 330, false);
  // Stone lantern: its flame colour is difference 2.
  const lantern = level.diffs[2];
  ctx.fillStyle = '#8d8578';
  rect(ctx, lantern.x - 22, 500, 44, 12);
  rect(ctx, lantern.x - 7, 452, 14, 50);
  roundRect(ctx, lantern.x - 26, 428, 52, 26, 4);
  ctx.fillStyle = '#6d675e';
  poly(ctx, [[lantern.x - 30, 428], [lantern.x + 30, 428], [lantern.x, 404]]);
  ctx.fillStyle = variant === 0 ? '#ff9a3c' : '#4fd1c5';
  circle(ctx, lantern.x, 441, 8);
  ctx.fillStyle = 'rgba(255, 220, 150, 0.25)';
  circle(ctx, lantern.x, 441, 16);
  // Low wall on the right with the cat: its tail is difference 3.
  ctx.fillStyle = '#7a6a8c';
  rect(ctx, 400, 520, 160, 40);
  ctx.fillStyle = '#9484ab';
  rect(ctx, 400, 514, 160, 8);
  const cat = level.diffs[3];
  ctx.fillStyle = '#2e2a38';
  ellipse(ctx, cat.x, cat.y + 8, 26, 18);
  circle(ctx, cat.x - 14, cat.y - 8, 12);
  poly(ctx, [[cat.x - 24, cat.y - 14], [cat.x - 18, cat.y - 26], [cat.x - 12, cat.y - 15]]);
  poly(ctx, [[cat.x - 8, cat.y - 16], [cat.x - 4, cat.y - 28], [cat.x, cat.y - 15]]);
  ctx.strokeStyle = '#2e2a38';
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (variant === 0) {
    ctx.moveTo(cat.x + 22, cat.y + 14);
    ctx.quadraticCurveTo(cat.x + 44, cat.y + 2, cat.x + 38, cat.y - 22);
  } else {
    ctx.moveTo(cat.x + 22, cat.y + 14);
    ctx.quadraticCurveTo(cat.x + 40, cat.y + 22, cat.x + 30, cat.y + 30);
  }
  ctx.stroke();
  // Stepping stones: the middle one is difference 5.
  ctx.fillStyle = '#9a8f7a';
  ellipse(ctx, 120, 512, 34, 10);
  if (variant === 0) ellipse(ctx, 180, 512, 34, 10);
  ellipse(ctx, 240, 512, 34, 10);
  // Flower bed: the tulip at the right end is difference 6.
  const tulip = level.diffs[6];
  const bed = createRandom(55);
  for (let i = 0; i < 9; i += 1) {
    const fx = 300 + i * 24 + bed() * 6;
    const fy = 520 + bed() * 20;
    ctx.strokeStyle = '#3f7a3a';
    ctx.lineWidth = 2;
    line(ctx, fx, fy + 12, fx, fy, 2, '#3f7a3a');
    ctx.fillStyle = ['#e87ea6', '#f2c94c', '#c96fd1'][i % 3];
    circle(ctx, fx, fy, 6);
  }
  ctx.strokeStyle = '#3f7a3a';
  ctx.lineWidth = 2;
  line(ctx, tulip.x, tulip.y + 14, tulip.x, tulip.y, 2, '#3f7a3a');
  ctx.fillStyle = variant === 0 ? '#e87ea6' : '#f5f0e6';
  circle(ctx, tulip.x, tulip.y, 8);
  // Fireflies drift over the grass.
  const flies = createRandom(2024);
  for (let i = 0; i < 10; i += 1) {
    const fx = 30 + flies() * 500;
    const fy = 420 + flies() * 120;
    const glow = 0.35 + 0.4 * Math.abs(Math.sin(time * 1.4 + i * 1.7));
    ctx.fillStyle = `rgba(242, 201, 76, ${glow})`;
    circle(ctx, fx, fy, 2.6);
  }
}

/** Level 1: a harbour in the morning light, lighthouse, boat and pier. */
function drawHarbor(ctx, level, variant, time) {
  sky(ctx, level);
  // Sun with soft rays.
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 470, 78, 34);
  ctx.fillStyle = 'rgba(255, 243, 196, 0.25)';
  circle(ctx, 470, 78, 52);
  // Sea and horizon.
  ctx.fillStyle = '#3d7ea6';
  rect(ctx, 0, 360, 560, 200);
  ctx.fillStyle = '#5aa3c4';
  for (let i = 0; i < 5; i += 1) {
    const wy = 380 + i * 34;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= 560; x += 28) {
      const y = wy + Math.sin((x + i * 60) * 0.03 + time * 0.8) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Gulls: the middle one is difference 2.
  bird(ctx, 340, 80, 1);
  if (variant === 0) bird(ctx, 400, 88, 1);
  bird(ctx, 452, 70, 1);
  // Lighthouse: beam is difference 0, window is difference 5.
  const beam = level.diffs[0];
  const win = level.diffs[5];
  ctx.fillStyle = '#f5efe4';
  poly(ctx, [[96, 330], [140, 330], [132, 150], [104, 150]]);
  ctx.fillStyle = '#d4574a';
  poly(ctx, [[100, 290], [136, 290], [134, 250], [102, 250]]);
  poly(ctx, [[104, 200], [132, 200], [130, 168], [106, 168]]);
  ctx.fillStyle = '#3a3348';
  rect(ctx, 100, 132, 36, 20);
  ctx.fillStyle = variant === 0 ? '#ffe9a3' : '#3a3348';
  rect(ctx, win.x - 7, win.y - 10, 14, 20);
  if (variant === 0) {
    ctx.fillStyle = 'rgba(255, 233, 163, 0.35)';
    poly(ctx, [[136, beam.y - 8], [360, 40], [360, 150], [136, beam.y + 14]]);
    ctx.fillStyle = '#ffe9a3';
    circle(ctx, beam.x + 18, beam.y, 7);
  }
  // Boat with a flag: the flag colour is difference 1.
  const flag = level.diffs[1];
  ctx.fillStyle = '#7a4a2e';
  poly(ctx, [[280, 330], [392, 330], [372, 356], [300, 356]]);
  line(ctx, 336, 330, 336, 220, 4, '#5a3a2e');
  ctx.fillStyle = '#f5efe4';
  poly(ctx, [[340, 326], [340, 236], [392, 326]]);
  ctx.fillStyle = variant === 0 ? '#d4574a' : '#3d7ea6';
  poly(ctx, [[336, flag.y - 16], [362, flag.y - 8], [336, flag.y]]);
  // Jumping fish: difference 6.
  const fish = level.diffs[6];
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(fish.x, fish.y + 8, 26, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (variant === 0) {
    ctx.fillStyle = '#8fb8d8';
    ctx.beginPath();
    ctx.ellipse(fish.x, fish.y - 8, 16, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[fish.x + 12, fish.y - 12], [fish.x + 22, fish.y - 16], [fish.x + 14, fish.y - 4]]);
  }
  // Pier planks.
  ctx.fillStyle = '#8a6a44';
  rect(ctx, 0, 470, 560, 90);
  ctx.fillStyle = '#75582f';
  for (let x = 0; x < 560; x += 56) rect(ctx, x, 470, 3, 90);
  ctx.fillStyle = '#5a3a2e';
  for (const px of [40, 180, 320, 480]) rect(ctx, px, 470, 14, 90);
  // Crates: the top one is difference 3.
  const crate = level.diffs[3];
  ctx.fillStyle = '#b98a4e';
  rect(ctx, crate.x - 26, crate.y - 4, 52, 34);
  ctx.strokeStyle = '#7a5a30';
  ctx.lineWidth = 2;
  ctx.strokeRect(crate.x - 26, crate.y - 4, 52, 34);
  if (variant === 0) {
    ctx.fillStyle = '#c99a5e';
    rect(ctx, crate.x - 20, crate.y - 36, 40, 30);
    ctx.strokeRect(crate.x - 20, crate.y - 36, 40, 30);
  }
  // Rope coil: difference 4.
  const rope = level.diffs[4];
  if (variant === 0) {
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = 5;
    for (const rr of [20, 14, 8]) {
      ctx.beginPath();
      ctx.arc(rope.x, rope.y, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** Level 2: a night market, stalls, string lanterns and a cat on the roof. */
function drawMarket(ctx, level, variant, time) {
  sky(ctx, level);
  starField(ctx, 303, 30, 200);
  // The one bright star is difference 4.
  if (variant === 0) star(ctx, 90, 68, 12, '#ffe9a3');
  // String lanterns across the top: one is difference 2. They hang clear of the sign
  // board, which sits at the left of the string.
  line(ctx, 0, 96, 560, 96, 2, '#241d33');
  const lanternXs = [280, 360, 440, 520];
  for (const lx of lanternXs) {
    if (variant === 1 && lx === level.diffs[2].x) continue;
    ctx.fillStyle = '#e5534b';
    ellipse(ctx, lx, 112, 13, 16);
    ctx.fillStyle = '#f2c94c';
    rect(ctx, lx - 13, 108, 26, 3);
    rect(ctx, lx - 13, 118, 26, 3);
  }
  // Sign board: its symbol is difference 0.
  const sign = level.diffs[0];
  ctx.fillStyle = '#3a2e1e';
  roundRect(ctx, sign.x - 70, sign.y - 34, 140, 68, 10);
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 3;
  ctx.strokeRect(sign.x - 70, sign.y - 34, 140, 68);
  ctx.fillStyle = '#f2c94c';
  if (variant === 0) {
    ctx.beginPath();
    ctx.arc(sign.x, sign.y, 16, 0.4, Math.PI * 2 - 0.4);
    ctx.arc(sign.x + 8, sign.y - 4, 13, 0, Math.PI * 2);
    ctx.fill('evenodd');
  } else {
    star(ctx, sign.x, sign.y, 16, '#f2c94c');
  }
  // Left stall: its awning stripe is difference 1.
  const awning = level.diffs[1];
  ctx.fillStyle = '#6d4a2e';
  rect(ctx, 60, 300, 180, 130);
  for (let i = 0; i < 6; i += 1) {
    const sx = 60 + i * 30;
    const isStripe = i === 2;
    ctx.fillStyle = isStripe ? (variant === 0 ? '#d4574a' : '#4f9d6d') : '#f5efe4';
    poly(ctx, [[sx, 258], [sx + 30, 258], [sx + 30, 300], [sx, 300]]);
  }
  ctx.fillStyle = '#f2c94c';
  for (const gx of [90, 130, 170, 210]) circle(ctx, gx, 340, 10);
  ctx.fillStyle = '#e87ea6';
  for (const gx of [100, 150, 200]) circle(ctx, gx, 380, 9);
  // Right stall with a roof the cat sits on: the cat is difference 3.
  ctx.fillStyle = '#54423a';
  rect(ctx, 380, 320, 160, 110);
  ctx.fillStyle = '#3a2e28';
  poly(ctx, [[370, 320], [550, 320], [520, 268], [400, 268]]);
  const roofCat = level.diffs[3];
  if (variant === 0) {
    ctx.fillStyle = '#241d33';
    ellipse(ctx, roofCat.x, roofCat.y + 6, 18, 12);
    circle(ctx, roofCat.x - 10, roofCat.y - 6, 8);
    poly(ctx, [[roofCat.x - 16, roofCat.y - 10], [roofCat.x - 12, roofCat.y - 20], [roofCat.x - 7, roofCat.y - 11]]);
    poly(ctx, [[roofCat.x - 6, roofCat.y - 12], [roofCat.x - 2, roofCat.y - 21], [roofCat.x + 2, roofCat.y - 11]]);
  }
  ctx.fillStyle = '#f2c94c';
  for (const gx of [410, 450, 490, 520]) circle(ctx, gx, 360, 9);
  // Food stall in the middle: the dumpling stack is difference 5.
  const dumplings = level.diffs[5];
  ctx.fillStyle = '#7a5a30';
  rect(ctx, 270, 430, 150, 90);
  ctx.fillStyle = '#d9c39a';
  roundRect(ctx, 280, 420, 130, 22, 8);
  ctx.fillStyle = '#f5efe4';
  circle(ctx, dumplings.x - 14, dumplings.y, 12);
  circle(ctx, dumplings.x + 14, dumplings.y, 12);
  if (variant === 0) circle(ctx, dumplings.x, dumplings.y - 16, 12);
  // Banner on the right: its tassel is difference 6.
  const banner = level.diffs[6];
  ctx.fillStyle = '#d4574a';
  rect(ctx, banner.x - 16, 250, 32, 78);
  ctx.fillStyle = '#f2c94c';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('市', banner.x, 292);
  if (variant === 0) {
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 3;
    line(ctx, banner.x - 8, 328, banner.x - 8, 352, 3, '#f2c94c');
    line(ctx, banner.x + 8, 328, banner.x + 8, 352, 3, '#f2c94c');
    circle(ctx, banner.x - 8, 354, 3);
    circle(ctx, banner.x + 8, 354, 3);
  }
  // Cobblestones and warm light pools.
  ctx.fillStyle = '#2c2340';
  rect(ctx, 0, 520, 560, 40);
  ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';
  ellipse(ctx, 150, 540, 90, 12);
  ellipse(ctx, 420, 540, 100, 12);
  // A swaying paper lantern glow.
  const sway = Math.sin(time * 0.9) * 4;
  ctx.fillStyle = 'rgba(255, 190, 90, 0.20)';
  circle(ctx, 280 + sway, 470, 42);
}

const PAINTERS = [drawGarden, drawHarbor, drawMarket];

/** Paint one picture of `levelIndex`: variant 0 left, variant 1 right. */
export function drawScene(ctx, levelIndex, variant, time) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 560, 560);
  ctx.clip();
  PAINTERS[levelIndex](ctx, LEVELS[levelIndex], variant, time);
  ctx.restore();
}
