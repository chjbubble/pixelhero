import { BOSS_CHARGE_MAX_X, BOSS_CHARGE_MIN_X, GameState, GROUND_Y, HEIGHT, WIDTH } from "./constants.js";
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
const MAX_PLAYER_HP = 5;
const ARROW_SPEED = 520;
const BOSS_SHOT_SPEED = 360;

export function createGame(chapterIndex = 0) {
  const level = createLevel(chapterIndex);
  return {
    state: GameState.PLAYING,
    chapter: chapterIndex,
    level,
    currentScreen: 0,
    bossDefeated: false,
    checkpoint: null,
    player: {
      x: level.spawn.x,
      y: level.spawn.y,
      w: 32,
      h: 56,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: false,
      hp: MAX_PLAYER_HP,
      invuln: 0,
      armor: 0,
      arrows: 0,
      attackTimer: 0,
      attackCooldown: 0,
      jumpsUsed: 0,
      maxJumps: 2,
      jumpWasPressed: false
    },
    enemies: level.screens.flatMap((screen, screenIndex) =>
      screen.enemies.map((enemy) => ({
      x: enemy.x,
      y: enemy.y,
      w: 34,
      h: 30,
      vx: enemy.vx ?? level.enemySpeed,
      hp: 2,
      invuln: 0,
      dead: false,
      kind: enemy.kind ?? level.enemyKind,
      patrolMin: enemy.patrolMin,
        patrolMax: enemy.patrolMax,
        screen: screenIndex
      }))
    ),
    boss: {
      x: level.boss.x,
      y: level.boss.y,
      w: 55,
      h: 58,
      hp: 8,
      invuln: 0,
      dead: false,
      screen: level.boss.screen,
      kind: level.boss.kind,
      attack: level.boss.attack,
      aggroRange: level.boss.aggroRange ?? Infinity,
      patrolMin: level.boss.patrolMin ?? BOSS_CHARGE_MIN_X,
      patrolMax: level.boss.patrolMax ?? BOSS_CHARGE_MAX_X,
      phase: "idle",
      phaseTimer: level.boss.attack === "ranged" ? 0 : BOSS_IDLE_SECONDS,
      vx: level.boss.attack === "ranged" ? level.boss.patrolSpeed : 0,
      chargeDirection: -1
    },
    crates: level.screens.flatMap((screen, screenIndex) =>
      screen.crates.map((crate) => ({
        x: crate.x,
        y: crate.y,
        w: 34,
        h: 34,
        hp: 1,
        type: crate.type,
        style: crate.style ?? level.crateStyle,
        dead: false,
        screen: screenIndex
      }))
    ),
    pickups: [],
    projectiles: [],
    bossShots: []
  };
}

function getActiveScreen(game) {
  return game.level.screens[game.currentScreen];
}

function hasGroundUnderPlayer(screen, player) {
  return screen.platforms.some(
    (platform) =>
      platform.y === GROUND_Y &&
      player.x + player.w > platform.x &&
      player.x < platform.x + platform.w
  );
}

function getBossChargeDirection(boss, player) {
  return player.x < boss.x ? -1 : 1;
}

export function restartGame(previousGame) {
  const game = createGame(previousGame.chapter ?? 0);
  const checkpoint = previousGame.checkpoint;
  if (previousGame.state === GameState.LOST && checkpoint) {
    game.checkpoint = { ...checkpoint };
    game.currentScreen = checkpoint.screen;
    game.player.x = checkpoint.x;
    game.player.y = checkpoint.y;
  }
  return game;
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

  if (player.armor > 0) {
    player.armor -= 1;
    player.invuln = 0.45;
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

function checkScreenTransitions(game) {
  const player = game.player;
  const lastScreen = game.level.screens.length - 1;

  if (player.x + player.w >= WIDTH && game.currentScreen < lastScreen) {
    game.currentScreen += 1;
    player.x = SCREEN_LEFT_ENTRY_X;
    player.y = Math.min(player.y, GROUND_Y - player.h);
    return;
  }

  if (
    player.x + player.w >= WIDTH &&
    game.currentScreen === lastScreen &&
    game.bossDefeated &&
    game.level.nextChapter !== null
  ) {
    Object.assign(game, createGame(game.level.nextChapter));
    return;
  }

  if (player.x <= 0 && game.currentScreen > 0) {
    game.currentScreen -= 1;
    player.x = SCREEN_RIGHT_ENTRY_X;
    player.y = Math.min(player.y, GROUND_Y - player.h);
    return;
  }

  player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));
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

  const jumpPressed = actions.jump && !player.jumpWasPressed;
  player.jumpWasPressed = actions.jump;

  if (jumpPressed && (player.grounded || player.jumpsUsed < player.maxJumps)) {
    player.vy = -JUMP_SPEED;
    player.grounded = false;
    player.jumpsUsed += 1;
  }

  const previousBottom = player.y + player.h;
  player.x += player.vx * dt;
  checkScreenTransitions(game);

  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  const activeScreen = getActiveScreen(game);

  for (const platform of activeScreen.platforms) {
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
      player.jumpsUsed = 0;
    }
  }

  if (!player.grounded && player.y + player.h > GROUND_Y && hasGroundUnderPlayer(activeScreen, player)) {
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.grounded = true;
    player.jumpsUsed = 0;
  }

  if (player.y > HEIGHT) {
    game.state = GameState.LOST;
    return;
  }

  for (const checkpoint of activeScreen.checkpoints) {
    if (rectsOverlap(player, checkpoint)) {
      game.checkpoint = {
        screen: game.currentScreen,
        x: checkpoint.spawnX,
        y: checkpoint.spawnY
      };
    }
  }

  for (const spike of activeScreen.spikes) {
    if (rectsOverlap(player, spike)) {
      damagePlayer(game, spike.x + spike.w / 2);
    }
  }

  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  if ((actions.attack || actions.shoot) && player.attackCooldown <= 0) {
    let acted = false;
    if (actions.shoot && player.arrows > 0) {
      player.arrows -= 1;
      acted = true;
      game.projectiles.push({
        x: player.facing === 1 ? player.x + player.w : player.x - 12,
        y: player.y + 26,
        w: 12,
        h: 6,
        vx: player.facing * ARROW_SPEED,
        screen: game.currentScreen,
        dead: false
      });
    } else if (actions.attack) {
      acted = true;
      player.attackTimer = 0.12;
    }
    if (acted) {
      player.attackCooldown = 0.32;
    }
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
    for (const crate of game.crates) {
      if (!crate.dead && crate.screen === game.currentScreen && rectsOverlap(sword, crate)) {
        crate.dead = true;
        spawnPickup(game, crate);
      }
    }

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
        advanceAfterBossDefeat(game);
      }
    }
  }

  for (const pickup of game.pickups) {
    if (!pickup.dead && pickup.screen === game.currentScreen && rectsOverlap(player, pickup)) {
      applyPickup(player, pickup);
    }
  }

  for (const projectile of game.projectiles) {
    if (projectile.dead || projectile.screen !== game.currentScreen) continue;
    projectile.x += projectile.vx * dt;
    if (projectile.x < 0 || projectile.x > WIDTH) {
      projectile.dead = true;
      continue;
    }

    for (const enemy of game.enemies) {
      if (!enemy.dead && enemy.screen === game.currentScreen && enemy.invuln <= 0 && rectsOverlap(projectile, enemy)) {
        enemy.hp -= 1;
        enemy.invuln = 0.28;
        projectile.dead = true;
        if (enemy.hp <= 0) {
          enemy.dead = true;
        }
      }
    }

    const boss = game.boss;
    if (!projectile.dead && game.currentScreen === boss.screen && boss.invuln <= 0 && rectsOverlap(projectile, boss)) {
      boss.hp -= 1;
      boss.invuln = 0.45;
      projectile.dead = true;
      if (boss.hp <= 0) {
        advanceAfterBossDefeat(game);
      }
    }
  }

  for (const enemy of game.enemies) {
    if (!enemy.dead && enemy.screen === game.currentScreen && rectsOverlap(player, enemy)) {
      damagePlayer(game, enemy.x);
    }
  }

  for (const shot of game.bossShots) {
    if (shot.dead || shot.screen !== game.currentScreen) continue;
    shot.x += shot.vx * dt;
    if (shot.x < BOSS_CHARGE_MIN_X || shot.x > BOSS_CHARGE_MAX_X) {
      shot.dead = true;
      continue;
    }
    if (rectsOverlap(player, shot)) {
      shot.dead = true;
      damagePlayer(game, shot.x);
    }
  }

  const boss = game.boss;
  const playerOnBossScreen = game.currentScreen === boss.screen;
  if (game.bossDefeated) {
    return;
  }
  if (!playerOnBossScreen && boss.phase === "idle") {
    return;
  }

  boss.invuln = Math.max(0, boss.invuln - dt);
  boss.phaseTimer -= dt;

  if (boss.attack === "ranged") {
    if (boss.phase === "idle") {
      boss.x += boss.vx * dt;
      if (boss.x < boss.patrolMin || boss.x > boss.patrolMax) {
        boss.vx *= -1;
        boss.x = Math.max(boss.patrolMin, Math.min(boss.patrolMax, boss.x));
      }
      if (boss.phaseTimer <= 0 && Math.abs(player.x - boss.x) <= boss.aggroRange) {
        boss.phase = "windup";
        boss.phaseTimer = BOSS_WINDUP_SECONDS;
        boss.vx = 0;
        boss.chargeDirection = getBossChargeDirection(boss, player);
      }
    } else if (boss.phase === "windup" && boss.phaseTimer <= 0) {
      boss.phase = "charge";
      boss.phaseTimer = BOSS_CHARGE_SECONDS;
      game.bossShots.push({
        x: boss.chargeDirection === 1 ? boss.x + boss.w : boss.x - 12,
        y: boss.y + 28,
        w: 12,
        h: 8,
        vx: boss.chargeDirection * BOSS_SHOT_SPEED,
        screen: boss.screen,
        dead: false
      });
    } else if (boss.phase === "charge" && boss.phaseTimer <= 0) {
      boss.phase = "idle";
      boss.phaseTimer = game.level.boss.idleSeconds ?? BOSS_IDLE_SECONDS;
      boss.vx = boss.chargeDirection * (game.level.boss.patrolSpeed ?? 45);
    }
  } else if (boss.phase === "idle" && boss.phaseTimer <= 0) {
    boss.phase = "windup";
    boss.phaseTimer = BOSS_WINDUP_SECONDS;
    boss.vx = 0;
    boss.chargeDirection = getBossChargeDirection(boss, player);
  } else if (boss.phase === "windup" && boss.phaseTimer <= 0) {
    boss.phase = "charge";
    boss.phaseTimer = BOSS_CHARGE_SECONDS;
    boss.vx = boss.chargeDirection * 340;
  } else if (boss.phase === "charge") {
    boss.x += boss.vx * dt;
    if (boss.phaseTimer <= 0 || boss.x < BOSS_CHARGE_MIN_X || boss.x > BOSS_CHARGE_MAX_X) {
      boss.phase = "idle";
      boss.phaseTimer = BOSS_IDLE_SECONDS;
      boss.vx = 0;
      boss.x = Math.max(BOSS_CHARGE_MIN_X, Math.min(BOSS_CHARGE_MAX_X, boss.x));
    }
  }

  if (playerOnBossScreen && rectsOverlap(player, boss)) {
    damagePlayer(game, boss.x);
  }
}

function advanceAfterBossDefeat(game) {
  if (game.level.nextChapter === null) {
    game.state = GameState.WON;
    return;
  }

  game.bossDefeated = true;
  game.boss.dead = true;
}

function spawnPickup(game, crate) {
  game.pickups.push({
    x: crate.x + 4,
    y: crate.y + 4,
    w: 26,
    h: 26,
    type: crate.type,
    dead: false,
    screen: crate.screen
  });
}

function applyPickup(player, pickup) {
  if (pickup.type === "medkit") {
    player.hp = Math.min(MAX_PLAYER_HP, player.hp + 2);
  } else if (pickup.type === "arrows") {
    player.arrows = 5;
  } else if (pickup.type === "armor") {
    player.armor = 4;
  }
  pickup.dead = true;
}
