[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Riansap88/twin-lanterns-spot-the-difference/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Riansap88/twin-lanterns-spot-the-difference/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

# Twin Lanterns — Spot the Difference

A complete spot-the-difference game that plays offline in a desktop browser from its
own files. Two near-identical pictures side by side, seven differences per scene, a
gold ring on every difference you find, a counter of how many are still hidden, hints
that behave, and a clock you can feel.

Three original scenes, harder as you go:

1. **Lantern Garden** — dusk in the old garden, 3 minutes, 7 differences.
2. **Harbor Morning** — first light over the pier, 2.5 minutes, 7 differences.
3. **Night Market** — lanterns over the stalls, 2 minutes, 7 differences.

Every picture is drawn fresh on canvas by the game's own code: no borrowed art, no
network request, no build step.

## How to play

- Click a difference in either picture. A gold ring and check mark it on both sides.
- A wrong click costs 25 points and breaks your combo.
- **H** spends a hint (3 per level): a pulsing ring shows one difference you have not
  found yet. **P** pauses, **M** toggles sound, **R** restarts the level, **N** goes to
  the next level, **1/2/3** jump to a scene from the title screen.
- Find all 7 before the clock runs out for a time bonus. Finish all three scenes to win.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The screenshots in `screenshots/` are real renders of
this game, staged with `?shot=start|play|hint|end&seed=1`.

## Layout

- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and
  writes `dossier.json` with the vendored make.fun library.
- `game/index.html` — the page; `game/src/` holds the game, one file per job:
  `config.js` (tuning and levels), `random.js` (seeded RNG), `world.js` (rules and
  state), `scenes.js` (the three painted scenes), `render.js` (pictures, HUD and
  overlays), `input.js` (pointer and keyboard), `audio.js` (synthesised sound),
  `shots.js` (screenshot scenes), `main.js` (boot and loop).
- `vendor/makefun-game.ts` — the kit's library, unchanged.

An entry for the [best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
competition on make.fun.
