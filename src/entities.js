import { GameState, GROUND_Y, WIDTH } from "./constants.js";
import { createLevel } from "./levels.js";
import { rectsOverlap } from "./math.js";

const PLAYER_SPEED = 240;
const JUMP_SPEED = 560;
const GRAVITY = 1500;
const SCREEN_LEFT_ENTRY_X = 24;
const SCREEN_RIGHT_ENTRY_X = WIDTH - 56;
const BOSS_IDLE_SECONDS = 3;
const BOSS_WINDUP_SECONDS = 0.9;
const BOSS_CHARGE_SECONDS = 0.55;

export function createGame() {
  const level = createLevel();
  return {
    state: GameState.PLAYING,
    level,
    currentScreen: 0,
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
    },
    enemies: level.screens.flatMap((screen, screenIndex) =>
      screen.enemies.map((enemy) => ({
      x: enemy.x,
      y: enemy.y,
      w: 34,
      h: 30,
      vx: 70,
      hp: 2,
      invuln: 0,
      dead: false,
      patrolMin: enemy.patrolMin,
        patrolMax: enemy.patrolMax,
        screen: screenIndex
      }))
    ),
    boss: {
      x: level.boss.x,
      y: level.boss.y,
      w: 78,
      h: 72,
      hp: 8,
      invuln: 0,
      screen: level.boss.screen,
      phase: "idle",
      phaseTimer: BOSS_IDLE_SECONDS,
      vx: 0,
      chargeDirection: -1
    }
  };
}

function getActiveScreen(game) {
  return game.level.screens[game.currentScreen];
}

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

export function updateGame(game, actions, dt) {
  if (game.state !== GameState.PLAYING) {
    return;
  }

  const player = game.player;
  player.invuln = Math.max(0, player.invuln - dt);

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

  if (game.currentScreen === 0 && player.x + player.w >= WIDTH) {
    game.currentScreen = 1;
    player.x = SCREEN_LEFT_ENTRY_X;
    player.y = Math.min(player.y, GROUND_Y - player.h);
  } else if (game.currentScreen === 1 && player.x <= 0) {
    game.currentScreen = 0;
    player.x = SCREEN_RIGHT_ENTRY_X;
    player.y = Math.min(player.y, GROUND_Y - player.h);
  } else {
    player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));
  }

  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const platform of getActiveScreen(game).platforms) {
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

  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  if (actions.attack && player.attackCooldown <= 0) {
    player.attackTimer = 0.12;
    player.attackCooldown = 0.32;
  }

  for (const enemy of game.enemies) {
    if (enemy.dead || enemy.screen !== game.currentScreen) continue;
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
      if (!enemy.dead && enemy.screen === game.currentScreen && enemy.invuln <= 0 && rectsOverlap(sword, enemy)) {
        enemy.hp -= 1;
        enemy.invuln = 0.28;
        enemy.x += player.facing * 14;
        if (enemy.hp <= 0) {
          enemy.dead = true;
        }
      }
    }

    const boss = game.boss;
    if (game.currentScreen === boss.screen && boss.invuln <= 0 && rectsOverlap(sword, boss)) {
      boss.hp -= 1;
      boss.invuln = 0.45;
      if (boss.hp <= 0) {
        game.state = GameState.WON;
      }
    }
  }

  for (const enemy of game.enemies) {
    if (!enemy.dead && enemy.screen === game.currentScreen && rectsOverlap(player, enemy)) {
      damagePlayer(game, enemy.x);
    }
  }

  const boss = game.boss;
  if (game.currentScreen !== boss.screen) {
    return;
  }

  boss.invuln = Math.max(0, boss.invuln - dt);
  boss.phaseTimer -= dt;

  if (boss.phase === "idle" && boss.phaseTimer <= 0) {
    boss.phase = "windup";
    boss.phaseTimer = BOSS_WINDUP_SECONDS;
    boss.vx = 0;
    boss.chargeDirection = player.x < boss.x ? -1 : 1;
  } else if (boss.phase === "windup" && boss.phaseTimer <= 0) {
    boss.phase = "charge";
    boss.phaseTimer = BOSS_CHARGE_SECONDS;
    boss.vx = boss.chargeDirection * 340;
  } else if (boss.phase === "charge") {
    boss.x += boss.vx * dt;
    if (boss.phaseTimer <= 0 || boss.x < 620 || boss.x > 880) {
      boss.phase = "idle";
      boss.phaseTimer = BOSS_IDLE_SECONDS;
      boss.vx = 0;
      boss.x = Math.max(620, Math.min(880, boss.x));
    }
  }

  if (rectsOverlap(player, boss)) {
    damagePlayer(game, boss.x);
  }
}
