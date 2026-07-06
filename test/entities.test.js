import test from "node:test";
import assert from "node:assert/strict";
import { BOSS_SCREEN, GROUND_Y, WORLD_WIDTH, WIDTH } from "../src/constants.js";
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
  const game = createGame(2);
  game.currentScreen = 4;
  game.boss.hp = 1;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;
  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(game.state, "won");
});

test("player stays on the merged world map when reaching a former screen edge", () => {
  const game = createGame();
  game.player.x = 950;
  updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 0);
  assert.equal(game.player.x > 950, true);
});

test("player enters the boss arena at the end of the merged world map", () => {
  const game = createGame();
  game.player.x = WORLD_WIDTH - 4;
  updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, BOSS_SCREEN);
  assert.equal(game.player.x, 24);
});

test("player returns from the boss arena to the end of the merged world map", () => {
  const game = createGame();
  game.currentScreen = BOSS_SCREEN;
  game.player.x = -2;
  updateGame(game, { left: true, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 0);
  assert.equal(game.player.x, WORLD_WIDTH - 56);
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

test("boss finishes windup after the player leaves the boss screen", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.player.x = game.boss.x - 120;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 3.01);
  assert.equal(game.boss.phase, "windup");

  game.currentScreen = 3;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 0.91);
  assert.equal(game.boss.phase, "charge");

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 0.56);
  assert.equal(game.boss.phase, "idle");
});

test("boss still aims at the player when it is on the old charge edge", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.boss.x = 620;
  game.player.x = 560;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 3.01);
  assert.equal(game.boss.phase, "windup");
  assert.equal(game.boss.chargeDirection, -1);

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.91);
  assert.equal(game.boss.phase, "charge");
  assert.equal(game.boss.vx < 0, true);
});

test("level has five screens with boss on the final screen", () => {
  const game = createGame();
  assert.equal(game.level.name, "史莱姆森林");
  assert.equal(game.level.screens.length, 5);
  assert.equal(game.boss.screen, 4);
});

test("player can traverse the merged world map and enter the boss arena", () => {
  const game = createGame();
  game.player.x = WORLD_WIDTH - 4;
  updateGame(game, { left: false, right: true, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, BOSS_SCREEN);
  assert.equal(game.player.x, 24);

  game.player.x = -2;
  updateGame(game, { left: true, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.currentScreen, 0);
  assert.equal(game.player.x, WORLD_WIDTH - 56);
});

test("touching a checkpoint stores respawn position", () => {
  const game = createGame();
  const checkpoint = game.level.worldMap.checkpoints[0];
  game.player.x = checkpoint.x;
  game.player.y = checkpoint.y;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);

  assert.deepEqual(game.checkpoint, {
    screen: 0,
    x: checkpoint.spawnX,
    y: checkpoint.spawnY
  });
});

test("restart respawns at the active checkpoint with full health", () => {
  const game = createGame();
  game.checkpoint = { screen: 0, x: 2992, y: 400 };
  game.currentScreen = BOSS_SCREEN;
  game.player.hp = 0;
  game.state = "lost";

  const restarted = restartGame(game);

  assert.equal(restarted.currentScreen, 0);
  assert.equal(restarted.player.x, 2992);
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
  const spike = game.level.worldMap.spikes[0];
  game.player.x = spike.x;
  game.player.y = spike.y - game.player.h + 4;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
  assert.equal(game.player.invuln > 0, true);

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
});

test("merged world map starts with four crates", () => {
  const game = createGame();
  assert.equal(game.level.worldMap.crates.length, 4);
  assert.equal(game.crates.length, 4);
});

test("crates sit on raised platforms", () => {
  const game = createGame();

  for (const crate of game.level.worldMap.crates) {
    const platform = game.level.worldMap.platforms.find(
      (candidate) =>
        candidate.y < GROUND_Y &&
        crate.y + 34 === candidate.y &&
        crate.x >= candidate.x &&
        crate.x + 34 <= candidate.x + candidate.w
    );

    assert.notEqual(platform, undefined);
  }
});

test("breaking a crate drops and applies a medkit", () => {
  const game = createGame();
  const crate = game.crates[0];
  game.player.hp = 3;
  game.player.x = crate.x - 40;
  game.player.y = crate.y;
  game.player.facing = 1;

  updateGame(game, { left: false, right: false, jump: false, attack: true, restart: false }, 1 / 60);
  assert.equal(crate.dead, true);
  assert.equal(game.pickups[0].type, "medkit");

  game.player.x = game.pickups[0].x;
  game.player.y = game.pickups[0].y;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 5);
  assert.equal(game.pickups[0].dead, true);
});

test("armor absorbs four hits before health is lost", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x;
  game.player.y = enemy.y;
  game.player.armor = 4;

  for (let hit = 3; hit >= 0; hit -= 1) {
    game.player.invuln = 0;
    updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
    assert.equal(game.player.armor, hit);
    assert.equal(game.player.hp, 5);
  }

  game.player.invuln = 0;
  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
});

test("arrows have five shots and can damage enemies", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x - 120;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  game.player.arrows = 5;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: true, restart: false }, 1 / 60);
  assert.equal(game.player.arrows, 4);
  for (let frame = 0; frame < 12; frame += 1) {
    updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1 / 60);
  }
  assert.equal(enemy.hp, 1);
});

test("attack stays melee when the player has arrows", () => {
  const game = createGame();
  const enemy = game.enemies[0];
  game.currentScreen = enemy.screen;
  game.player.x = enemy.x - 40;
  game.player.y = enemy.y - 20;
  game.player.facing = 1;
  game.player.arrows = 5;

  updateGame(game, { left: false, right: false, jump: false, attack: true, shoot: false, restart: false }, 1 / 60);

  assert.equal(game.player.arrows, 5);
  assert.equal(game.projectiles.length, 0);
  assert.equal(enemy.hp, 1);
});

test("falling into the fourth screen pit loses immediately", () => {
  const game = createGame();
  game.player.x = WIDTH * 3 + 430;
  game.player.y = GROUND_Y - game.player.h;

  updateGame(game, { left: false, right: false, jump: false, attack: false, restart: false }, 1);
  assert.equal(game.state, "lost");
});

test("fourth screen spike sits on the right platform instead of the pit", () => {
  const game = createGame();
  const pitStart = WIDTH * 3 + 380;
  const pitEnd = WIDTH * 3 + 520;
  const spike = game.level.worldMap.spikes.at(-1);

  assert.equal(spike.x >= pitEnd || spike.x + spike.w <= pitStart, true);
});

test("player snaps to ground when opening on solid floor", () => {
  const game = createGame();
  game.player.y = GROUND_Y - game.player.h + 8;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);

  assert.equal(game.state, "playing");
  assert.equal(game.player.y, GROUND_Y - game.player.h);
  assert.equal(game.player.grounded, true);
});

test("second chapter is the corrupted graveyard with zombies", () => {
  const game = createGame(1);

  assert.equal(game.level.name, "腐败墓园");
  assert.equal(game.level.theme, "graveyard");
  assert.equal(game.level.screens.length, 5);
  assert.equal(game.enemies[0].kind, "zombie");
  assert.equal(Math.abs(game.enemies[0].vx), 35);
  assert.equal(game.boss.kind, "zombieBoss");
  assert.equal(game.boss.attack, "ranged");
});

test("defeating the first chapter boss unlocks the second chapter exit", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.boss.hp = 1;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;

  updateGame(game, { left: false, right: false, jump: false, attack: true, shoot: false, restart: false }, 1 / 60);

  assert.equal(game.state, "playing");
  assert.equal(game.chapter, 0);
  assert.equal(game.bossDefeated, true);
  assert.equal(game.boss.dead, true);
  assert.equal(game.currentScreen, 4);
});

test("second chapter starts only after defeated boss and right edge exit", () => {
  const game = createGame();
  game.currentScreen = 4;
  game.player.x = 950;

  updateGame(game, { left: false, right: true, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);
  assert.equal(game.chapter, 0);
  assert.equal(game.currentScreen, 4);

  game.bossDefeated = true;
  game.player.x = 950;
  updateGame(game, { left: false, right: true, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);

  assert.equal(game.chapter, 1);
  assert.equal(game.currentScreen, 0);
});

test("graveyard boss patrols until the player enters range", () => {
  const game = createGame(1);
  game.currentScreen = 4;
  game.player.x = 40;
  const startX = game.boss.x;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1);

  assert.equal(game.boss.phase, "idle");
  assert.notEqual(game.boss.x, startX);
});

test("graveyard boss finishes ranged windup after player leaves range", () => {
  const game = createGame(1);
  game.currentScreen = 4;
  game.player.x = game.boss.x - 120;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);
  assert.equal(game.boss.phase, "windup");

  game.player.x = 40;
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.91);

  assert.equal(game.boss.phase, "charge");
  assert.equal(game.bossShots.length, 1);
});

test("graveyard boss waits twice as long between ranged attacks", () => {
  const game = createGame(1);
  game.currentScreen = 4;
  game.player.x = game.boss.x - 120;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.91);
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.56);

  assert.equal(game.boss.phase, "idle");
  assert.equal(game.boss.phaseTimer, 6);
});

test("third chapter uses ruins enemies and spike trap boss", () => {
  const game = createGame(2);

  assert.equal(game.level.name, "雪地遗迹");
  assert.equal(game.level.theme, "ruins");
  assert.equal(game.enemies[0].kind, "ruinsBeast");
  assert.equal(game.boss.kind, "spikeBoss");
  assert.equal(game.boss.attack, "spikeTrap");
  assert.equal(game.level.nextChapter, null);
});

test("second chapter boss unlocks the third chapter exit", () => {
  const game = createGame(1);
  game.currentScreen = 4;
  game.boss.hp = 1;
  game.player.x = game.boss.x - 40;
  game.player.y = game.boss.y + 40;
  game.player.facing = 1;

  updateGame(game, { left: false, right: false, jump: false, attack: true, shoot: false, restart: false }, 1 / 60);
  game.player.x = 950;
  updateGame(game, { left: false, right: true, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);

  assert.equal(game.chapter, 2);
  assert.equal(game.currentScreen, 0);
});

test("ruins boss marks player ground then raises one-hit spikes", () => {
  const game = createGame(2);
  game.currentScreen = BOSS_SCREEN;
  game.player.x = 220;
  game.player.y = GROUND_Y - game.player.h;

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 2.01);
  assert.equal(game.boss.phase, "windup");
  assert.equal(game.bossTraps.length, 1);
  assert.equal(game.bossTraps[0].active, false);
  assert.equal(game.bossTraps[0].x, 200);

  game.player.x = 500;
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.91);
  assert.equal(game.boss.phase, "charge");
  assert.equal(game.bossTraps[0].active, true);

  game.player.x = 200;
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);
  game.player.invuln = 0;
  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 1 / 60);
  assert.equal(game.player.hp, 4);

  updateGame(game, { left: false, right: false, jump: false, attack: false, shoot: false, restart: false }, 0.5);
  assert.equal(game.boss.phase, "idle");
  assert.equal(game.bossTraps.length, 0);
});
