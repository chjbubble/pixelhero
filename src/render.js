import { HEIGHT, WIDTH, GROUND_Y } from "./constants.js";
import { getSwordHitbox } from "./entities.js";

export function getPlayerPose(player) {
  const flash = player.invuln > 0;
  if (player.attackTimer > 0) {
    return { state: "attack", flash };
  }
  if (!player.grounded && player.jumpsUsed >= 2) {
    return { state: "double-jump", flash };
  }
  if (!player.grounded) {
    return { state: "jump", flash };
  }
  if (Math.abs(player.vx) > 0) {
    return { state: "run", flash };
  }
  return { state: "idle", flash };
}

export function getEnemyPose(enemy) {
  return {
    facing: enemy.vx < 0 ? -1 : 1,
    flash: enemy.invuln > 0
  };
}

export function getBossPose(boss) {
  return {
    state: boss.phase,
    facing: boss.chargeDirection < 0 ? -1 : 1,
    warning: boss.phase === "windup"
  };
}

function drawPlayer(ctx, player) {
  const { x, y, facing } = player;
  const flip = facing === -1;
  const pose = getPlayerPose(player);
  const runStep = Math.floor(player.x / 12) % 2;
  const bodyY = pose.state === "idle" ? y + 8 : y + 6;
  const armSwing = pose.state === "run" ? (runStep === 0 ? -4 : 4) : 0;
  const legSwing = pose.state === "run" ? (runStep === 0 ? 4 : -4) : 0;
  const bodyColor = pose.flash ? "#d7ecff" : "#1f5fbf";
  const trimColor = pose.state === "double-jump" ? "#f7d94a" : "#53a7ff";

  ctx.fillStyle = "#18324f";
  ctx.fillRect(x + 7, bodyY + 5, 18, 24);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 8, bodyY, 16, 28);
  ctx.fillStyle = trimColor;
  ctx.fillRect(x + (flip ? 6 : 20), bodyY + 6, 8, 6);

  ctx.fillStyle = "#ffd4a8";
  ctx.fillRect(x + 10, y, 12, 12);
  ctx.fillStyle = "#3d2817";
  ctx.fillRect(x + 8, y - 2, 16, 6);
  ctx.fillRect(x + (flip ? 20 : 6), y + 2, 6, 6);
  ctx.fillStyle = "#263238";
  ctx.fillRect(flip ? x + 10 : x + 18, y + 4, 4, 4);

  ctx.fillStyle = "#3d2817";
  ctx.fillRect(x + 6, y + 40 + Math.max(0, legSwing), 8, 16 - Math.max(0, legSwing));
  ctx.fillRect(x + 18, y + 40 + Math.max(0, -legSwing), 8, 16 - Math.max(0, -legSwing));

  ctx.fillStyle = "#ffd4a8";
  ctx.fillRect(x + (flip ? 2 : 24), bodyY + 12 + armSwing, 7, 14);

  if (pose.state === "jump" || pose.state === "double-jump") {
    ctx.fillStyle = pose.state === "double-jump" ? "#f7d94a" : "#ffffff";
    ctx.fillRect(x + 4, y + 54, 6, 4);
    ctx.fillRect(x + 22, y + 54, 6, 4);
  }

  const sword = getSwordHitbox(player);
  if (sword) {
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(sword.x, sword.y + 4, sword.w, 8);
    ctx.fillStyle = "#8b6914";
    ctx.fillRect(flip ? sword.x + sword.w - 8 : sword.x, sword.y + 8, 8, 8);
  }
}

function drawSlime(ctx, enemy) {
  const { x, y, w, h } = enemy;
  const pose = getEnemyPose(enemy);
  const bounce = Math.floor(enemy.x / 18) % 2 === 0 ? 0 : 3;
  const eyeOffset = pose.facing === -1 ? -2 : 2;
  const bodyColor = pose.flash ? "#dfffd6" : "#7ed957";

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 4, y + 6 + bounce, w - 8, h - 10 - bounce);
  ctx.fillRect(x, y + 16 + bounce, w, h - 16 - bounce);
  ctx.fillStyle = "#4ba53f";
  ctx.fillRect(x + 4, y + h - 7, w - 8, 5);

  ctx.fillStyle = "#263238";
  ctx.fillRect(x + 8 + eyeOffset, y + 12 + bounce, 6, 6);
  ctx.fillRect(x + 20 + eyeOffset, y + 12 + bounce, 6, 6);
  ctx.fillStyle = "#eaffd8";
  ctx.fillRect(x + 7, y + 7 + bounce, 8, 3);
}

function drawBoss(ctx, boss) {
  const { x, y, w, h } = boss;
  const pose = getBossPose(boss);
  const bodyColor = pose.state === "windup" ? "#d65f5f" : "#8d3bb8";
  const chargeStretch = pose.state === "charge" ? 10 : 0;
  const crouch = pose.state === "windup" ? 8 : 0;
  const drawX = pose.facing === -1 ? x - chargeStretch : x;
  const drawW = w + chargeStretch;
  const drawY = y + crouch;
  const drawH = h - crouch;

  ctx.fillStyle = bodyColor;
  ctx.fillRect(drawX + 6, drawY + 20, drawW - 12, drawH - 24);
  ctx.fillRect(drawX + 12, drawY + 8, drawW - 24, 24);

  ctx.fillStyle = "#ffd4a8";
  ctx.fillRect(drawX + 16, drawY + 16, 10, 10);
  ctx.fillRect(drawX + drawW - 26, drawY + 16, 10, 10);

  ctx.fillStyle = "#263238";
  ctx.fillRect(drawX + 19 + pose.facing * 2, drawY + 19, 4, 4);
  ctx.fillRect(drawX + drawW - 23 + pose.facing * 2, drawY + 19, 4, 4);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(drawX + 2, drawY, 10, 16);
  ctx.fillRect(drawX + drawW - 12, drawY, 10, 16);

  ctx.fillStyle = "#4c1f67";
  ctx.fillRect(drawX + 10, drawY + drawH - 8, drawW - 20, 8);
  if (pose.state === "charge") {
    ctx.fillStyle = "rgb(247 217 74 / 0.55)";
    ctx.fillRect(pose.facing === -1 ? drawX + drawW : drawX - 26, drawY + 26, 26, 8);
  }
}

function drawBossWarning(ctx, boss) {
  if (boss.phase !== "windup") {
    return;
  }

  const laneX = boss.chargeDirection === -1 ? 0 : boss.x;
  const laneW = boss.chargeDirection === -1 ? boss.x + boss.w : WIDTH - boss.x;

  ctx.fillStyle = "rgb(214 95 95 / 0.35)";
  ctx.fillRect(laneX, GROUND_Y - 18, laneW, 18);
  ctx.fillStyle = "#d65f5f";
  for (let x = laneX + 16; x < laneX + laneW; x += 42) {
    ctx.fillRect(x, GROUND_Y - 34, 22, 8);
    ctx.fillRect(x + (boss.chargeDirection === -1 ? -8 : 8), GROUND_Y - 42, 8, 24);
  }
}

function drawCheckpoint(ctx, checkpoint, active) {
  const poleColor = active ? "#f7d94a" : "#d7d0b8";
  ctx.fillStyle = "#5d3f24";
  ctx.fillRect(checkpoint.x + 8, checkpoint.y + 4, 6, checkpoint.h - 4);
  ctx.fillStyle = poleColor;
  ctx.fillRect(checkpoint.x + 14, checkpoint.y + 4, 18, 12);
  ctx.fillRect(checkpoint.x + 14, checkpoint.y + 16, 12, 8);
  ctx.fillStyle = "#263238";
  ctx.fillRect(checkpoint.x + 4, checkpoint.y + checkpoint.h - 6, 24, 6);
}

function drawSpikes(ctx, spike) {
  ctx.fillStyle = "#616b75";
  ctx.fillRect(spike.x, spike.y + spike.h - 5, spike.w, 5);
  ctx.fillStyle = "#d65f5f";
  for (let x = spike.x; x < spike.x + spike.w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, spike.y + spike.h);
    ctx.lineTo(x + 8, spike.y);
    ctx.lineTo(x + 16, spike.y + spike.h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#f7d94a";
  for (let x = spike.x + 6; x < spike.x + spike.w; x += 32) {
    ctx.fillRect(x, spike.y + 8, 4, 6);
  }
}

export function renderGame(ctx, game) {
  const screen = game.level.screens[game.currentScreen];

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#8fd2ff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#5d3f24";
  for (const platform of screen.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#3f8f45";
    ctx.fillRect(platform.x, platform.y, platform.w, 8);
    ctx.fillStyle = "#5d3f24";
  }

  for (const spike of screen.spikes) {
    drawSpikes(ctx, spike);
  }

  for (const checkpoint of screen.checkpoints) {
    const active =
      game.checkpoint?.screen === game.currentScreen &&
      game.checkpoint?.x === checkpoint.spawnX &&
      game.checkpoint?.y === checkpoint.spawnY;
    drawCheckpoint(ctx, checkpoint, active);
  }

  drawPlayer(ctx, game.player);

  for (const enemy of game.enemies) {
    if (enemy.dead || enemy.screen !== game.currentScreen) continue;
    drawSlime(ctx, enemy);
  }

  if (game.currentScreen === game.boss.screen) {
    drawBossWarning(ctx, game.boss);
    drawBoss(ctx, game.boss);
  }

  if (game.currentScreen === 0) {
    ctx.fillStyle = "#263238";
    ctx.fillRect(936, 96, 4, GROUND_Y - 96);
  } else {
    ctx.fillStyle = "#263238";
    ctx.fillRect(20, 96, 4, GROUND_Y - 96);
  }

  ctx.fillStyle = "#17202a";
  ctx.font = "20px monospace";
  ctx.fillText(`HP: ${game.player.hp}`, 24, 32);
  ctx.fillText(`Screen: ${game.currentScreen + 1}/${game.level.screens.length}`, 408, 32);
  if (game.currentScreen === game.boss.screen) {
    ctx.fillText(`Boss HP: ${game.boss.hp}`, 760, 32);
  }

  if (game.state === "lost") {
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f7f2df";
    ctx.font = "40px monospace";
    ctx.fillText("失败 - 按 R 或 Start 重开", 230, 270);
  }

  if (game.state === "won") {
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f7f2df";
    ctx.font = "40px monospace";
    ctx.fillText("胜利 - 按 R 或 Start 重开", 230, 270);
  }
}
