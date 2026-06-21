import { HEIGHT, WIDTH, GROUND_Y } from "./constants.js";
import { getSwordHitbox } from "./entities.js";

function drawPlayer(ctx, player) {
  const { x, y, facing } = player;
  const flip = facing === -1;

  ctx.fillStyle = "#1f5fbf";
  ctx.fillRect(x + 8, y + 8, 16, 24);
  ctx.fillStyle = "#ffd4a8";
  ctx.fillRect(x + 10, y, 12, 12);
  ctx.fillStyle = "#263238";
  ctx.fillRect(flip ? x + 10 : x + 18, y + 4, 4, 4);

  ctx.fillStyle = "#3d2817";
  ctx.fillRect(x + 6, y + 40, 8, 16);
  ctx.fillRect(x + 18, y + 40, 8, 16);

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
  const bodyColor = enemy.invuln > 0 ? "#dfffd6" : "#7ed957";

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 4, y + 8, w - 8, h - 12);
  ctx.fillRect(x, y + 16, w, h - 16);

  ctx.fillStyle = "#263238";
  ctx.fillRect(x + 8, y + 12, 6, 6);
  ctx.fillRect(x + 20, y + 12, 6, 6);
}

function drawBoss(ctx, boss) {
  const { x, y, w, h } = boss;
  const bodyColor = boss.phase === "windup" ? "#d65f5f" : "#8d3bb8";

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 8, y + 24, w - 16, h - 32);
  ctx.fillRect(x + 16, y + 8, w - 32, 24);

  ctx.fillStyle = "#ffd4a8";
  ctx.fillRect(x + 24, y + 16, 12, 12);
  ctx.fillRect(x + 42, y + 16, 12, 12);

  ctx.fillStyle = "#263238";
  ctx.fillRect(x + 28, y + 20, 4, 4);
  ctx.fillRect(x + 46, y + 20, 4, 4);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 4, y, 12, 16);
  ctx.fillRect(x + w - 16, y, 12, 16);
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
  ctx.fillText(`Screen: ${game.currentScreen + 1}/2`, 408, 32);
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
