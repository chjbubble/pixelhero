# Pixel Platformer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-playable pixel-style platform action game with keyboard and gamepad controls, sword combat, enemies, a simple Boss fight, victory, and defeat.

**Architecture:** The game uses native Canvas and small ES modules. Input, level data, collision helpers, entities, rendering, and the main loop are separated so each part can be learned and tested independently.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Canvas 2D, browser Gamepad API, Node built-in `node:test` for pure logic tests.

---

## File Structure

- Create: `package.json` - test and local server commands.
- Create: `index.html` - browser entry with a Canvas and small control hint.
- Create: `styles.css` - centered pixel-art page styling.
- Create: `src/constants.js` - shared sizes, physics values, and game state names.
- Create: `src/math.js` - rectangle collision and clamp helpers.
- Create: `src/input.js` - keyboard and gamepad input normalized to actions.
- Create: `src/levels.js` - fixed near-single-screen level definition.
- Create: `src/entities.js` - player, enemies, Boss, attacks, damage, reset.
- Create: `src/render.js` - Canvas drawing for world, entities, UI, and end screens.
- Create: `src/main.js` - game setup, animation loop, restart handling.
- Create: `test/math.test.js` - collision helper tests.
- Create: `test/input.test.js` - input normalization tests.
- Create: `test/entities.test.js` - player/enemy/Boss logic tests.

## Task 1: Project Skeleton And Static Canvas

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `styles.css`
- Create: `src/constants.js`
- Create: `src/main.js`
- Create: `src/render.js`

- [ ] **Step 1: Create package scripts**

Create `package.json`:

```json
{
  "name": "pixel-platformer",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "npx http-server . -p 5173 -c-1",
    "test": "node --test"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create the page shell**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>像素勇者</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="game-shell">
      <canvas id="game" width="960" height="540" aria-label="像素风横版动作游戏"></canvas>
      <p class="hint">键盘：A/D 移动，W/空格跳跃，J 攻击，R 重开。手柄：摇杆/十字键、A/×、X/B/□/○、Start。</p>
    </main>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Add page styling**

Create `styles.css`:

```css
:root {
  color-scheme: dark;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  background: #17202a;
  color: #f7f2df;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
}

.game-shell {
  width: min(96vw, 1040px);
  display: grid;
  gap: 12px;
  justify-items: center;
}

canvas {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  image-rendering: pixelated;
  background: #8fd2ff;
  border: 4px solid #f7f2df;
  box-shadow: 0 16px 40px rgb(0 0 0 / 35%);
}

.hint {
  margin: 0;
  line-height: 1.6;
  text-align: center;
  color: #d7d0b8;
}
```

- [ ] **Step 4: Add shared constants**

Create `src/constants.js`:

```js
export const WIDTH = 960;
export const HEIGHT = 540;
export const GROUND_Y = 456;

export const GameState = Object.freeze({
  PLAYING: "playing",
  WON: "won",
  LOST: "lost"
});
```

- [ ] **Step 5: Draw a static scene**

Create `src/render.js`:

```js
import { HEIGHT, WIDTH, GROUND_Y } from "./constants.js";

export function renderScene(ctx) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#8fd2ff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#6b4f2a";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = "#3f8f45";
  ctx.fillRect(0, GROUND_Y, WIDTH, 18);

  ctx.fillStyle = "#1f5fbf";
  ctx.fillRect(72, GROUND_Y - 56, 32, 56);
}
```

Create `src/main.js`:

```js
import { HEIGHT, WIDTH } from "./constants.js";
import { renderScene } from "./render.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

renderScene(ctx);
```

- [ ] **Step 6: Verify in browser**

Run: `npm run start`

Expected: local server starts on `http://127.0.0.1:5173` or `http://localhost:5173`.

Open the URL and confirm: blue sky, ground, and a blue player rectangle are visible.

- [ ] **Step 7: Commit**

```bash
git add package.json index.html styles.css src/constants.js src/main.js src/render.js
git commit -m "feat: add canvas game shell"
```

## Task 2: Collision Helpers And Level Data

**Files:**
- Create: `src/math.js`
- Create: `src/levels.js`
- Create: `test/math.test.js`
- Modify: `src/render.js`

- [ ] **Step 1: Write collision tests**

Create `test/math.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { clamp, rectsOverlap } from "../src/math.js";

test("rectsOverlap returns true for intersecting rectangles", () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 10, y: 10, w: 20, h: 20 }), true);
});

test("rectsOverlap returns false when rectangles only touch edges", () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 20, y: 0, w: 20, h: 20 }), false);
});

test("clamp keeps values inside bounds", () => {
  assert.equal(clamp(12, 0, 10), 10);
  assert.equal(clamp(-2, 0, 10), 0);
  assert.equal(clamp(6, 0, 10), 6);
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because `src/math.js` does not exist.

- [ ] **Step 3: Implement helpers**

Create `src/math.js`:

```js
export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
```

- [ ] **Step 4: Add level data**

Create `src/levels.js`:

```js
import { GROUND_Y } from "./constants.js";

export function createLevel() {
  return {
    spawn: { x: 72, y: GROUND_Y - 56 },
    platforms: [
      { x: 0, y: GROUND_Y, w: 960, h: 84 },
      { x: 176, y: 350, w: 128, h: 24 },
      { x: 372, y: 292, w: 136, h: 24 },
      { x: 572, y: 372, w: 144, h: 24 }
    ],
    enemies: [
      { x: 300, y: GROUND_Y - 30, patrolMin: 260, patrolMax: 390 },
      { x: 604, y: 342, patrolMin: 580, patrolMax: 704 }
    ],
    boss: { x: 806, y: GROUND_Y - 112 }
  };
}
```

- [ ] **Step 5: Render platforms from level data**

Replace `src/render.js` with:

```js
import { HEIGHT, WIDTH, GROUND_Y } from "./constants.js";

export function renderScene(ctx, level) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#8fd2ff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#5d3f24";
  for (const platform of level.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#3f8f45";
    ctx.fillRect(platform.x, platform.y, platform.w, 8);
    ctx.fillStyle = "#5d3f24";
  }

  ctx.fillStyle = "#1f5fbf";
  ctx.fillRect(level.spawn.x, level.spawn.y, 32, 56);

  ctx.fillStyle = "#7ed957";
  for (const enemy of level.enemies) {
    ctx.fillRect(enemy.x, enemy.y, 34, 30);
  }

  ctx.fillStyle = "#8d3bb8";
  ctx.fillRect(level.boss.x, level.boss.y, 78, 112);

  ctx.fillStyle = "#263238";
  ctx.fillRect(760, 96, 4, GROUND_Y - 96);
}
```

Replace `src/main.js` with:

```js
import { HEIGHT, WIDTH } from "./constants.js";
import { createLevel } from "./levels.js";
import { renderScene } from "./render.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

const level = createLevel();
renderScene(ctx, level);
```

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS for 3 tests.

Run: `npm run start`

Expected: page shows ground, three platforms, two enemies, and one Boss.

- [ ] **Step 7: Commit**

```bash
git add src/math.js src/levels.js src/render.js src/main.js test/math.test.js
git commit -m "feat: add level layout and collision helpers"
```

## Task 3: Keyboard And Gamepad Input

**Files:**
- Create: `src/input.js`
- Create: `test/input.test.js`
- Modify: `src/main.js`

- [ ] **Step 1: Write input tests**

Create `test/input.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createActionState, readGamepadActions } from "../src/input.js";

test("createActionState returns all actions as false", () => {
  assert.deepEqual(createActionState(), {
    left: false,
    right: false,
    jump: false,
    attack: false,
    restart: false
  });
});

test("readGamepadActions maps standard buttons and dpad", () => {
  const gamepad = {
    axes: [0, 0],
    buttons: [
      { pressed: true },
      { pressed: false },
      { pressed: true },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: true },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: true }
    ]
  };

  assert.deepEqual(readGamepadActions(gamepad), {
    left: true,
    right: false,
    jump: true,
    attack: true,
    restart: true
  });
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because `src/input.js` does not exist.

- [ ] **Step 3: Implement input module**

Create `src/input.js`:

```js
const pressedKeys = new Set();

export function createActionState() {
  return {
    left: false,
    right: false,
    jump: false,
    attack: false,
    restart: false
  };
}

export function installKeyboardListeners(target = window) {
  target.addEventListener("keydown", (event) => {
    pressedKeys.add(event.code);
  });
  target.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.code);
  });
}

export function readKeyboardActions() {
  return {
    left: pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft"),
    right: pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight"),
    jump: pressedKeys.has("KeyW") || pressedKeys.has("Space"),
    attack: pressedKeys.has("KeyJ"),
    restart: pressedKeys.has("KeyR")
  };
}

export function readGamepadActions(gamepad) {
  if (!gamepad) {
    return createActionState();
  }

  const axisX = gamepad.axes[0] ?? 0;
  const button = (index) => Boolean(gamepad.buttons[index]?.pressed);

  return {
    left: axisX < -0.35 || button(14),
    right: axisX > 0.35 || button(15),
    jump: button(0),
    attack: button(1) || button(2),
    restart: button(9)
  };
}

export function readActions() {
  const keyboard = readKeyboardActions();
  const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  const gamepad = Array.from(pads).find(Boolean);
  const pad = readGamepadActions(gamepad);

  return {
    left: keyboard.left || pad.left,
    right: keyboard.right || pad.right,
    jump: keyboard.jump || pad.jump,
    attack: keyboard.attack || pad.attack,
    restart: keyboard.restart || pad.restart
  };
}
```

- [ ] **Step 4: Wire input into startup**

Replace `src/main.js` with:

```js
import { HEIGHT, WIDTH } from "./constants.js";
import { installKeyboardListeners, readActions } from "./input.js";
import { createLevel } from "./levels.js";
import { renderScene } from "./render.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

installKeyboardListeners();

const level = createLevel();
function frame() {
  const actions = readActions();
  renderScene(ctx, level, actions);
  requestAnimationFrame(frame);
}

frame();
```

- [ ] **Step 5: Show input state for manual verification**

At the end of `renderScene` in `src/render.js`, add:

```js
  ctx.fillStyle = "#17202a";
  ctx.font = "18px monospace";
  ctx.fillText(`Input L:${Number(actions?.left)} R:${Number(actions?.right)} J:${Number(actions?.jump)} A:${Number(actions?.attack)}`, 24, 34);
```

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS for math and input tests.

Run: `npm run start`

Expected: pressing keyboard keys changes the input numbers. Connecting a standard gamepad and pressing the mapped buttons changes the same numbers.

- [ ] **Step 7: Commit**

```bash
git add src/input.js src/main.js src/render.js test/input.test.js
git commit -m "feat: add keyboard and gamepad input"
```

## Task 4: Player Movement, Gravity, And Platform Collision

**Files:**
- Create: `src/entities.js`
- Create: `test/entities.test.js`
- Modify: `src/main.js`
- Modify: `src/render.js`

- [ ] **Step 1: Write player movement tests**

Create `test/entities.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, updateGame } from "../src/entities.js";

test("player falls to the ground and becomes grounded", () => {
  const game = createGame();
  game.player.y = 300;
  game.player.vy = 0;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.y > 300, true);
});

test("player moves right when right action is pressed", () => {
  const game = createGame();
  const startX = game.player.x;
  updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.x > startX, true);
  assert.equal(game.player.facing, 1);
});

test("grounded player jumps when jump action is pressed", () => {
  const game = createGame();
  game.player.grounded = true;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.vy < 0, true);
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because `src/entities.js` does not exist.

- [ ] **Step 3: Implement player physics**

Create `src/entities.js` with player creation, gravity, horizontal movement, jumping, and top-only platform landing:

```js
import { GameState, GROUND_Y, WIDTH } from "./constants.js";
import { createLevel } from "./levels.js";

const PLAYER_SPEED = 240;
const JUMP_SPEED = 560;
const GRAVITY = 1500;

export function createGame() {
  const level = createLevel();
  return {
    state: GameState.PLAYING,
    level,
    player: {
      x: level.spawn.x,
      y: level.spawn.y,
      w: 32,
      h: 56,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: false,
      hp: 5,
      invuln: 0,
      attackTimer: 0,
      attackCooldown: 0
    }
  };
}

export function updateGame(game, actions, dt) {
  const player = game.player;

  player.vx = 0;
  if (actions.left) {
    player.vx = -PLAYER_SPEED;
    player.facing = -1;
  }
  if (actions.right) {
    player.vx = PLAYER_SPEED;
    player.facing = 1;
  }

  if (actions.jump && player.grounded) {
    player.vy = -JUMP_SPEED;
    player.grounded = false;
  }

  const previousBottom = player.y + player.h;
  player.x += player.vx * dt;
  player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const platform of game.level.platforms) {
    const landed =
      previousBottom <= platform.y &&
      player.y + player.h >= platform.y &&
      player.x + player.w > platform.x &&
      player.x < platform.x + platform.w &&
      player.vy >= 0;

    if (landed) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  if (player.y + player.h > GROUND_Y) {
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.grounded = true;
  }
}
```

- [ ] **Step 4: Connect game state to main loop**

Replace `src/main.js` with:

```js
import { HEIGHT, WIDTH } from "./constants.js";
import { createGame, updateGame } from "./entities.js";
import { installKeyboardListeners, readActions } from "./input.js";
import { renderGame } from "./render.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

installKeyboardListeners();

const game = createGame();
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  const actions = readActions();

  updateGame(game, actions, dt);
  renderGame(ctx, game, actions);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

- [ ] **Step 5: Render live player position**

Rename `renderScene` to `renderGame` in `src/render.js`, accept `game`, and draw `game.player` instead of `level.spawn`.

The player draw block should be:

```js
  const player = game.player;
  ctx.fillStyle = "#1f5fbf";
  ctx.fillRect(player.x, player.y, player.w, player.h);
```

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run start`

Expected: player moves left/right, jumps, lands on ground, and can land on platforms.

- [ ] **Step 7: Commit**

```bash
git add src/entities.js src/main.js src/render.js test/entities.test.js
git commit -m "feat: add player movement and platform collision"
```

## Task 5: Sword Attack And Enemy Combat

**Files:**
- Modify: `src/entities.js`
- Modify: `src/render.js`
- Modify: `test/entities.test.js`

- [ ] **Step 1: Add combat tests**

Append to `test/entities.test.js`:

```js
test("player attack damages an enemy in front of the player", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.player.x = enemy.x - 40;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(enemy.hp, 1);
});

test("enemy is marked dead after two sword hits", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.player.x = enemy.x - 40;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  game.player.attackCooldown = 0;
  enemy.invuln = 0;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(enemy.dead, true);
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because `game.enemies` and attack damage are not implemented.

- [ ] **Step 3: Add enemies and sword attack logic**

Modify `createGame()` in `src/entities.js` to include:

```js
    enemies: level.enemies.map((enemy) => ({
      x: enemy.x,
      y: enemy.y,
      w: 34,
      h: 30,
      vx: 70,
      hp: 2,
      invuln: 0,
      dead: false,
      patrolMin: enemy.patrolMin,
      patrolMax: enemy.patrolMax
    })),
    boss: {
      x: level.boss.x,
      y: level.boss.y,
      w: 78,
      h: 112,
      hp: 8,
      invuln: 0
    }
```

Import `rectsOverlap` from `src/math.js`, add:

```js
export function getSwordHitbox(player) {
  if (player.attackTimer <= 0) {
    return null;
  }

  return {
    x: player.facing === 1 ? player.x + player.w : player.x - 42,
    y: player.y + 14,
    w: 42,
    h: 24
  };
}
```

Inside `updateGame`, after movement, add attack timers and enemy damage:

```js
  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  if (actions.attack && player.attackCooldown <= 0) {
    player.attackTimer = 0.12;
    player.attackCooldown = 0.32;
  }

  for (const enemy of game.enemies) {
    if (enemy.dead) continue;
    enemy.invuln = Math.max(0, enemy.invuln - dt);
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.patrolMin || enemy.x > enemy.patrolMax) {
      enemy.vx *= -1;
      enemy.x = Math.max(enemy.patrolMin, Math.min(enemy.patrolMax, enemy.x));
    }
  }

  const sword = getSwordHitbox(player);
  if (sword) {
    for (const enemy of game.enemies) {
      if (!enemy.dead && enemy.invuln <= 0 && rectsOverlap(sword, enemy)) {
        enemy.hp -= 1;
        enemy.invuln = 0.28;
        enemy.x += player.facing * 14;
        if (enemy.hp <= 0) {
          enemy.dead = true;
        }
      }
    }
  }
```

- [ ] **Step 4: Render enemies and sword**

In `src/render.js`, draw `game.enemies` instead of `level.enemies`, skipping dead enemies. Draw the sword hitbox when `getSwordHitbox(game.player)` returns a rectangle.

```js
  for (const enemy of game.enemies) {
    if (enemy.dead) continue;
    ctx.fillStyle = enemy.invuln > 0 ? "#dfffd6" : "#7ed957";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  }
```

- [ ] **Step 5: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run start`

Expected: pressing `J` shows a short sword hitbox. Hitting an enemy twice removes it.

- [ ] **Step 6: Commit**

```bash
git add src/entities.js src/render.js test/entities.test.js
git commit -m "feat: add sword combat and enemies"
```

## Task 6: Player Damage, Defeat, And Restart

**Files:**
- Modify: `src/entities.js`
- Modify: `src/render.js`
- Modify: `test/entities.test.js`
- Modify: `src/main.js`

- [ ] **Step 1: Add damage tests**

Append to `test/entities.test.js`:

```js
test("touching an enemy damages the player once", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.player.x = enemy.x;
  game.player.y = enemy.y;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
});

test("player reaches lost state when hp reaches zero", () => {
  const game = createGame();
  game.player.hp = 1;
  const enemy = game.enemies[0];
  game.player.x = enemy.x;
  game.player.y = enemy.y;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.state, "lost");
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because player damage is not implemented.

- [ ] **Step 3: Implement player damage**

In `src/entities.js`, import `GameState` if not already imported. Add:

```js
function damagePlayer(game, sourceX) {
  const player = game.player;
  if (player.invuln > 0 || game.state !== GameState.PLAYING) {
    return;
  }

  player.hp -= 1;
  player.invuln = 1;
  player.vx = player.x < sourceX ? -180 : 180;
  player.vy = -260;

  if (player.hp <= 0) {
    game.state = GameState.LOST;
  }
}
```

Inside `updateGame`, skip gameplay updates when state is not playing, reduce `player.invuln`, and check enemy overlap:

```js
  if (game.state !== GameState.PLAYING) {
    return;
  }

  player.invuln = Math.max(0, player.invuln - dt);
```

After enemy movement:

```js
  for (const enemy of game.enemies) {
    if (!enemy.dead && rectsOverlap(player, enemy)) {
      damagePlayer(game, enemy.x);
    }
  }
```

- [ ] **Step 4: Add restart**

In `src/main.js`, change `let game = createGame();` and inside the frame:

```js
  if (actions.restart && game.state !== "playing") {
    game = createGame();
  }
```

- [ ] **Step 5: Render health and defeat screen**

In `src/render.js`, draw player HP at the top and show a centered defeat message when `game.state === "lost"`:

```js
  ctx.fillStyle = "#17202a";
  ctx.font = "20px monospace";
  ctx.fillText(`HP: ${game.player.hp}`, 24, 32);
```

End screen text:

```js
  if (game.state === "lost") {
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = "#f7f2df";
    ctx.font = "40px monospace";
    ctx.fillText("失败 - 按 R 或 Start 重开", 230, 270);
  }
```

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run start`

Expected: touching enemies lowers HP once per invulnerability window. At 0 HP, defeat screen appears. `R` restarts.

- [ ] **Step 7: Commit**

```bash
git add src/entities.js src/render.js src/main.js test/entities.test.js
git commit -m "feat: add player damage and restart"
```

## Task 7: Boss Fight And Victory

**Files:**
- Modify: `src/entities.js`
- Modify: `src/render.js`
- Modify: `test/entities.test.js`

- [ ] **Step 1: Add Boss tests**

Append to `test/entities.test.js`:

```js
test("sword attack damages the boss", () => {
  const game = createGame();
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(game.boss.hp, 7);
});

test("defeating the boss wins the game", () => {
  const game = createGame();
  game.boss.hp = 1;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(game.state, "won");
});
```

- [ ] **Step 2: Run tests to see the expected failure**

Run: `npm test`

Expected: FAIL because Boss damage and victory are not implemented.

- [ ] **Step 3: Add Boss state and damage**

In `createGame().boss`, add:

```js
      phase: "idle",
      phaseTimer: 0.8,
      vx: 0
```

Inside sword damage logic, after enemy checks:

```js
    if (game.boss.invuln <= 0 && rectsOverlap(sword, game.boss)) {
      game.boss.hp -= 1;
      game.boss.invuln = 0.45;
      if (game.boss.hp <= 0) {
        game.state = GameState.WON;
      }
    }
```

- [ ] **Step 4: Add Boss charge behavior**

Inside `updateGame`, after Boss invulnerability decreases:

```js
  const boss = game.boss;
  boss.invuln = Math.max(0, boss.invuln - dt);
  boss.phaseTimer -= dt;

  if (boss.phase === "idle" && Math.abs(player.x - boss.x) < 230) {
    boss.phase = "windup";
    boss.phaseTimer = 0.55;
    boss.vx = 0;
  } else if (boss.phase === "windup" && boss.phaseTimer <= 0) {
    boss.phase = "charge";
    boss.phaseTimer = 0.55;
    boss.vx = player.x < boss.x ? -340 : 340;
  } else if (boss.phase === "charge") {
    boss.x += boss.vx * dt;
    if (boss.phaseTimer <= 0 || boss.x < 766 || boss.x > 880) {
      boss.phase = "idle";
      boss.phaseTimer = 1.1;
      boss.vx = 0;
      boss.x = Math.max(766, Math.min(880, boss.x));
    }
  }

  if (rectsOverlap(player, boss)) {
    damagePlayer(game, boss.x);
  }
```

- [ ] **Step 5: Render Boss health and victory screen**

In `src/render.js`, render Boss with a warning color during windup and draw Boss HP:

```js
  ctx.fillStyle = game.boss.phase === "windup" ? "#d65f5f" : "#8d3bb8";
  ctx.fillRect(game.boss.x, game.boss.y, game.boss.w, game.boss.h);
  ctx.fillStyle = "#17202a";
  ctx.font = "20px monospace";
  ctx.fillText(`Boss HP: ${game.boss.hp}`, 760, 32);
```

End screen text:

```js
  if (game.state === "won") {
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = "#f7f2df";
    ctx.font = "40px monospace";
    ctx.fillText("胜利 - 按 R 或 Start 重开", 230, 270);
  }
```

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run start`

Expected: Boss changes color before charging, charges horizontally, damages player on contact, loses HP when hit by sword, and victory appears at 0 HP.

- [ ] **Step 7: Commit**

```bash
git add src/entities.js src/render.js test/entities.test.js
git commit -m "feat: add boss fight and victory"
```

## Task 8: Pixel-Art Polish And Final Verification

**Files:**
- Modify: `src/render.js`
- Modify: `styles.css`
- Modify: `README.md`

- [ ] **Step 1: Add README**

Create `README.md`:

````md
# 像素勇者

一个原生 Canvas 制作的像素风横版动作小游戏。

## 运行

```bash
npm run start
```

打开 `http://localhost:5173`。

## 测试

```bash
npm test
```

## 操作

- 键盘：A/D 或方向键移动，W/空格跳跃，J 攻击，R 重开
- 手柄：左摇杆或十字键移动，南键跳跃，西键或东键攻击，Start/Menu 重开
````

- [ ] **Step 2: Improve pixel rendering**

In `src/render.js`, replace plain rectangles with small helper functions such as `drawPlayer`, `drawSlime`, and `drawBoss`. Use only filled rectangles at an 8px grid size, no image files.

The player helper should draw at least: body, face, boots, and sword when attacking.

The enemy helper should draw at least: green body, dark eyes, and flash color during invulnerability.

The Boss helper should draw at least: large body, eyes, horns, and red windup color.

- [ ] **Step 3: Add final browser checks**

Run: `npm test`

Expected: PASS.

Run: `npm run start`

Manual checks:

- Keyboard can move, jump, attack, and restart.
- A connected standard gamepad can move, jump, attack, and restart.
- Player can land on all platforms.
- Two sword hits defeat each normal enemy.
- Enemy contact damages the player and does not drain HP instantly.
- Boss windup is visible before charge.
- Sword hits reduce Boss HP.
- Boss defeat shows victory.
- Player HP reaching 0 shows defeat.

- [ ] **Step 4: Commit**

```bash
git add README.md styles.css src/render.js
git commit -m "docs: add play instructions and pixel polish"
```

## Self-Review

- Spec coverage: This plan covers Canvas setup, fixed level layout, keyboard input, Gamepad API input, player movement, jumping, platform collision, sword attack, normal enemies, player damage, invulnerability, defeat, Boss charge, Boss HP, victory, pixel-style drawing, restart, tests, and README instructions.
- Placeholder scan: No red-flag placeholder wording or unspecified implementation steps remain.
- Type consistency: The plan consistently uses `game`, `player`, `enemies`, `boss`, `state`, `hp`, `invuln`, `attackTimer`, `attackCooldown`, `left`, `right`, `jump`, `attack`, and `restart`.
