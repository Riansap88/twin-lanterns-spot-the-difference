// Every tuning number, colour and level layout in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below depends
// on the screen size. Panel coordinates are local: each picture is 560x560, and a
// difference's x/y/r live in that space so the scene painter and the click test agree.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two pictures: left at x 48, right at x 672, both 560 wide and 560 tall. */
export const PANEL = { size: 560, leftX: 48, rightX: 672, y: 112 };

/** Top bar height; the bottom strip under the pictures holds the status line. */
export const HUD = { height: 96, bottomY: 676 };

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const SCORING = {
  findPoints: 100,
  comboBonus: 10,
  missPenalty: 25,
  hintsPerLevel: 3,
  timeBonusPerSecond: 5,
};

/** Click tolerance grows a little past the drawn shape so a fair tap still counts. */
export const CLICK_SLOP = 8;

export const PALETTE = {
  backdrop: '#14101d',
  hud: '#221a33',
  hudLine: '#3d3157',
  text: '#f5efe4',
  muted: '#b3a8c9',
  gold: '#f2c94c',
  goldDark: '#c9962e',
  teal: '#4fd1c5',
  red: '#e5534b',
  panelRing: '#6b5a8f',
};

/**
 * One level is one scene. `diffs` are the seven differences of that scene, each with a
 * short label (shown when it is found), a position in panel-local coordinates and a
 * click radius. The scene painter in scenes.js draws every element at exactly these
 * coordinates, so what you see is what you can click.
 */
export const LEVELS = [
  {
    name: 'Lantern Garden',
    subtitle: 'Dusk in the old garden',
    timeLimit: 180,
    skyTop: '#2b2350',
    skyBottom: '#e08a5a',
    diffs: [
      { id: 0, label: 'Moon crater', x: 452, y: 74, r: 34 },
      { id: 1, label: 'Bird on the wire', x: 280, y: 148, r: 26 },
      { id: 2, label: 'Lantern flame', x: 118, y: 462, r: 26 },
      { id: 3, label: 'Cat tail', x: 468, y: 500, r: 30 },
      { id: 4, label: 'Third koi', x: 300, y: 330, r: 30 },
      { id: 5, label: 'Stepping stone', x: 180, y: 512, r: 26 },
      { id: 6, label: 'Garden tulip', x: 516, y: 508, r: 24 },
    ],
  },
  {
    name: 'Harbor Morning',
    subtitle: 'First light over the pier',
    timeLimit: 150,
    skyTop: '#7fb2d9',
    skyBottom: '#f6d9a0',
    diffs: [
      { id: 0, label: 'Lighthouse beam', x: 118, y: 118, r: 40 },
      { id: 1, label: 'Boat flag', x: 330, y: 208, r: 24 },
      { id: 2, label: 'Harbor gull', x: 400, y: 88, r: 24 },
      { id: 3, label: 'Top crate', x: 488, y: 478, r: 30 },
      { id: 4, label: 'Rope coil', x: 92, y: 500, r: 26 },
      { id: 5, label: 'Lighthouse window', x: 118, y: 218, r: 22 },
      { id: 6, label: 'Jumping fish', x: 250, y: 378, r: 26 },
    ],
  },
  {
    name: 'Night Market',
    subtitle: 'Lanterns over the stalls',
    timeLimit: 120,
    skyTop: '#120e26',
    skyBottom: '#3a2350',
    diffs: [
      { id: 0, label: 'Sign symbol', x: 140, y: 130, r: 30 },
      { id: 1, label: 'Awning stripe', x: 140, y: 258, r: 26 },
      { id: 2, label: 'String lantern', x: 440, y: 108, r: 24 },
      { id: 3, label: 'Roof cat', x: 480, y: 208, r: 26 },
      { id: 4, label: 'Bright star', x: 90, y: 68, r: 22 },
      { id: 5, label: 'Dumpling stack', x: 330, y: 468, r: 26 },
      { id: 6, label: 'Banner tassel', x: 520, y: 328, r: 24 },
    ],
  },
];

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-lanterns.best';
