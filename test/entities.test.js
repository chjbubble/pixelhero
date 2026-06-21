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
