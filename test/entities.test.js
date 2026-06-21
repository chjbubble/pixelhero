import test from "node:test";
import assert from "node:assert/strict";
import { createGame, restartGame, updateGame } from "../src/entities.js";

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

test("airborne player can jump one more time", () => {
  const game = createGame();
  game.player.grounded = true;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);

  game.player.grounded = false;
  game.player.vy = 120;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);

  assert.equal(game.player.vy < 0, true);
  assert.equal(game.player.jumpsUsed, 2);
});

test("player cannot jump a third time before landing", () => {
  const game = createGame();
  game.player.grounded = true;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  game.player.grounded = false;
  game.player.vy = 120;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);

  game.player.vy = 120;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);

  assert.equal(game.player.vy > 0, true);
  assert.equal(game.player.jumpsUsed, 2);
});

test("landing resets double jump count", () => {
  const game = createGame();
  game.player.y = 398;
  game.player.vy = 120;
  game.player.grounded = false;
  game.player.jumpsUsed = 2;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);

  assert.equal(game.player.grounded, true);
  assert.equal(game.player.jumpsUsed, 0);
});

test("holding jump does not automatically consume the double jump", () => {
  const game = createGame();
  game.player.grounded = true;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);

  game.player.grounded = false;
  game.player.vy = 120;
  updateGame(game, { left: false, right: false, jump: true, attack: false, restart: false }, 1 / 60);

  assert.equal(game.player.vy > 0, true);
  assert.equal(game.player.jumpsUsed, 1);
});

test("player attack damages an enemy in front of the player", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x - 40;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(enemy.hp, 1);
});

test("enemy is marked dead after two sword hits", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x - 40;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  game.player.attackCooldown = 0;
  enemy.invuln = 0;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(enemy.dead, true);
});

test("touching an enemy damages the player once", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
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
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x;
  game.player.y = enemy.y;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.state, "lost");
});

test("sword attack damages the boss", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(game.boss.hp, 7);
});

test("defeating the boss wins the game", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.boss.hp = 1;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(game.state, "won");
});

test("player switches from first screen to boss screen at the right edge", () => {
  const game = createGame();
  game.player.x = 950;
  updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 1);
  assert.equal(game.player.x, 24);
});

test("player switches from boss screen back to first screen at the left edge", () => {
  const game = createGame();
  game.currentScreen = 1;
  game.player.x = -2;
  updateGame(game, { left: true, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 0);
  assert.equal(game.player.x, 904);
});

test("boss belongs to the second screen and is short enough to jump over", () => {
  const game = createGame();
  assert.equal(game.boss.screen, 4);
  assert.equal(game.boss.w, 55);
  assert.equal(game.boss.h, 58);
  assert.equal(game.boss.y + game.boss.h, 456);
});

test("boss waits three seconds before windup and charges after windup", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.player.x = game.boss.x - 120;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 2.9);
  assert.equal(game.boss.phase, "idle");

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 0.11);
  assert.equal(game.boss.phase, "windup");

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 0.91);
  assert.equal(game.boss.phase, "charge");
});

test("level has five screens with boss on the final screen", () => {
  const game = createGame();
  assert.equal(game.level.screens.length, 5);
  assert.equal(game.boss.screen, 4);
});

test("player can advance through all five screens and return one screen", () => {
  const game = createGame();
  for (let screen = 1; screen <= 4; screen += 1) {
    game.player.x = 950;
    updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
    assert.equal(game.currentScreen, screen);
    assert.equal(game.player.x, 24);
  }

  game.player.x = -2;
  updateGame(game, { left: true, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 3);
  assert.equal(game.player.x, 904);
});

test("touching a checkpoint stores respawn position", () => {
  const game = createGame();
  game.currentScreen = 3;
  const checkpoint = game.level.screens[3].checkpoints[0];
  game.player.x = checkpoint.x;
  game.player.y = checkpoint.y;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);

  assert.deepEqual(game.checkpoint, {
    screen: 3,
    x: checkpoint.spawnX,
    y: checkpoint.spawnY
  });
});

test("restart respawns at the active checkpoint with full health", () => {
  const game = createGame();
  game.checkpoint = { screen: 3, x: 120, y: 400 };
  game.currentScreen = 4;
  game.player.hp = 0;
  game.state = "lost";

  const restarted = restartGame(game);

  assert.equal(restarted.currentScreen, 3);
  assert.equal(restarted.player.x, 120);
  assert.equal(restarted.player.y, 400);
  assert.equal(restarted.player.hp, 5);
});

test("restart after victory starts a new game at the original spawn", () => {
  const game = createGame();
  game.checkpoint = { screen: 3, x: 120, y: 400 };
  game.currentScreen = 4;
  game.state = "won";

  const restarted = restartGame(game);

  assert.equal(restarted.currentScreen, 0);
  assert.equal(restarted.player.x, restarted.level.spawn.x);
  assert.equal(restarted.player.y, restarted.level.spawn.y);
  assert.equal(restarted.checkpoint, null);
});

test("touching spikes damages the player once during invulnerability", () => {
  const game = createGame();
  game.currentScreen = 2;
  const spike = game.level.screens[2].spikes[0];
  game.player.x = spike.x;
  game.player.y = spike.y - game.player.h + 4;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
  assert.equal(game.player.invuln > 0, true);

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
});
