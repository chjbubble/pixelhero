import { BOSS_CHARGE_MAX_X, BOSS_CHARGE_MIN_X, HEIGHT, WIDTH, GROUND_Y } from "./constants.js";
import { getSwordHitbox } from "./entities.js";

const ASSET_PATHS = {
  characters: "./assets/kenney/Tilemap/tilemap-characters.png",
  terrain: "./assets/kenney_pixel-platformer/Tilemap/tilemap.png",
  backgrounds: "./assets/kenney_pixel-platformer/Tilemap/tilemap-backgrounds_packed.png",
  knight: "./assets/brackeys_platformer_assets/sprites/knight.png",
  zombieSlime: "./assets/brackeys_platformer_assets/sprites/slime_green.png",
  purpleSlimeBoss: "./assets/brackeys_platformer_assets/sprites/slime_purple.png",
  ground: "./assets/kenney/Tiles/tile_0000.png",
  groundFill: "./assets/kenney/Tiles/tile_0006.png",
  crate: "./assets/kenney_pixel-platformer/Tiles/tile_0010.png",
  tombstone: "./assets/kenney/Tiles/tile_0145.png",
  medkit: "./assets/kenney/Tiles/tile_0044.png",
  arrows: "./assets/kenney/Tiles/tile_0064.png",
  armor: "./assets/kenney/Tiles/tile_0067.png",
  pitTop: "./assets/kenney_pixel-platformer/Tiles/tile_0033.png",
  pitFill: "./assets/kenney_pixel-platformer/Tiles/tile_0073.png",
  checkpoint: "./assets/kenney/Tiles/tile_0084.png"
};

const assets = loadAssets(ASSET_PATHS);

export function getAssetPaths() {
  return { ...ASSET_PATHS };
}

function loadAssets(paths) {
  if (typeof Image === "undefined") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(paths).map(([name, path]) => {
      const image = new Image();
      image.src = path;
      return [name, image];
    })
  );
}

function imageReady(image) {
  return image?.complete && image.naturalWidth > 0;
}

function drawAsset(ctx, name, x, y, w, h, flip = false) {
  const image = assets[name];
  if (!imageReady(image)) {
    return false;
  }

  if (flip) {
    ctx.save();
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(image, x, y, w, h);
  }
  return true;
}

function drawAssetRegion(ctx, tile, x = tile.x, y = tile.y, w = tile.w, h = tile.h) {
  const image = assets[tile.asset];
  if (!imageReady(image)) {
    return false;
  }

  ctx.drawImage(image, tile.sx, tile.sy, tile.sw, tile.sh, x, y, w, h);
  return true;
}

function drawTiledAsset(ctx, name, x, y, w, h, tileSize = 18) {
  const image = assets[name];
  if (!imageReady(image)) {
    return false;
  }

  for (let tileX = x; tileX < x + w; tileX += tileSize) {
    for (let tileY = y; tileY < y + h; tileY += tileSize) {
      ctx.drawImage(image, tileX, tileY, Math.min(tileSize, x + w - tileX), Math.min(tileSize, y + h - tileY));
    }
  }
  return true;
}

export function getGroundTiles(platform, tileSize = 18) {
  const tiles = [];
  for (let tileY = platform.y; tileY < platform.y + platform.h; tileY += tileSize) {
    for (let tileX = platform.x; tileX < platform.x + platform.w; tileX += tileSize) {
      tiles.push({
        x: tileX,
        y: tileY,
        w: Math.min(tileSize, platform.x + platform.w - tileX),
        h: Math.min(tileSize, platform.y + platform.h - tileY),
        layer: Math.floor((tileY - platform.y) / tileSize)
      });
    }
  }
  return tiles;
}

function tileSource(index, cols) {
  const sourceTile = 18;
  const gap = 1;
  return {
    sx: (index % cols) * (sourceTile + gap),
    sy: Math.floor(index / cols) * (sourceTile + gap),
    sw: sourceTile,
    sh: sourceTile
  };
}

function packedTileSource(index, cols) {
  const sourceTile = 18;
  return {
    sx: (index % cols) * sourceTile,
    sy: Math.floor(index / cols) * sourceTile,
    sw: sourceTile,
    sh: sourceTile
  };
}

export function getTerrainTile(theme, layer) {
  const topTile = theme === "graveyard" ? 62 : 22;
  return { asset: "terrain", ...tileSource(layer === 0 ? topTile : 122, 20) };
}

function drawGround(ctx, platform, theme) {
  for (const tile of getGroundTiles(platform)) {
    if (!drawAssetRegion(ctx, getTerrainTile(theme, tile.layer), tile.x, tile.y, tile.w, tile.h)) {
      return false;
    }
  }
  return true;
}

function drawPits(ctx, platforms) {
  for (const tile of getPitTiles(platforms)) {
    if (!drawAsset(ctx, tile.asset, tile.x, tile.y, tile.w, tile.h)) {
      return false;
    }
  }
  return true;
}

export function getBackgroundTiles(theme, width = WIDTH, height = HEIGHT, groundY = GROUND_Y, tileSize = 90) {
  const cols = theme === "graveyard" ? [6, 7] : [8, 9];
  const tiles = [];
  const rowOneY = groundY - tileSize * 2;
  const rowTwoY = groundY - tileSize;
  const pickColumn = (x, y) => {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    const seed = theme === "graveyard" ? 1 : 0;
    return cols[(col * 7 + Math.floor(col / 2) + row * 3 + seed) % cols.length];
  };
  for (let y = 0; y < rowOneY; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
        tiles.push({
          asset: "backgrounds",
          ...packedTileSource(pickColumn(x, y), 10),
        x,
        y,
        w: Math.min(tileSize, width - x),
        h: Math.min(tileSize, rowOneY - y)
      });
    }
  }

  for (const [sourceRow, startY, endY] of [
    [1, rowOneY, rowTwoY],
    [2, rowTwoY, groundY]
  ]) {
    for (let x = 0; x < width; x += tileSize) {
      tiles.push({
        asset: "backgrounds",
        ...packedTileSource(sourceRow * 10 + pickColumn(x, startY), 10),
        x,
        y: startY,
        w: Math.min(tileSize, width - x),
        h: Math.min(tileSize, endY - startY)
      });
    }
  }
  return tiles;
}

function drawBackground(ctx, theme) {
  ctx.imageSmoothingEnabled = false;
  for (const tile of getBackgroundTiles(theme)) {
    if (!drawAssetRegion(ctx, tile)) {
      return false;
    }
  }
  return true;
}

function drawCharacterTile(ctx, index, x, y, w, h, flip = false, flash = false) {
  const image = assets.characters;
  if (!imageReady(image)) {
    return false;
  }

  const tileSize = 24;
  const gap = 1;
  const sx = (index % 9) * (tileSize + gap);
  const sy = Math.floor(index / 9) * (tileSize + gap);

  ctx.save();
  ctx.globalAlpha = flash ? 0.55 : 1;
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, sx, sy, tileSize, tileSize, 0, 0, w, h);
  } else {
    ctx.drawImage(image, sx, sy, tileSize, tileSize, x, y, w, h);
  }
  ctx.restore();
  return true;
}
export function getPlayerSprite(player) {
  const pose = getPlayerPose(player);
  const runStep = Math.floor(player.x / 12) % 3;
  const frame = pose.state === "run" ? runStep + 1 : 0;

  return { asset: "knight", frame, cols: 8, frameW: 32, frameH: 32, cropBottom: 4 };
}

export function getPlayerDrawBox(player) {
  const h = player.h * 1.5;
  const w = Math.round(player.w * 1.5 * 1.3);
  return {
    x: player.x - (w - player.w) / 2,
    y: player.y + player.h - h,
    w,
    h
  };
}

export function getZombieSprite(enemy) {
  return {
    asset: "zombieSlime",
    frame: Math.floor(enemy.x / 12) % 4,
    cols: 4,
    frameW: 24,
    frameH: 24
  };
}

export function getZombieDrawBox(enemy) {
  const scale = 1.5;
  const w = enemy.w * scale;
  const h = enemy.h * scale;
  return {
    x: enemy.x - (w - enemy.w) / 2,
    y: enemy.y + enemy.h - h,
    w,
    h
  };
}

function drawSpriteFrame(ctx, sprite, x, y, w, h, flip = false, flash = false) {
  const image = assets[sprite.asset];
  if (!imageReady(image)) {
    return false;
  }

  const sx = (sprite.frame % sprite.cols) * sprite.frameW;
  const sy = Math.floor(sprite.frame / sprite.cols) * sprite.frameH;
  const sourceH = sprite.frameH - (sprite.cropBottom ?? 0);

  ctx.save();
  ctx.globalAlpha = flash ? 0.55 : 1;
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, sx, sy, sprite.frameW, sourceH, 0, 0, w, h);
  } else {
    ctx.drawImage(image, sx, sy, sprite.frameW, sourceH, x, y, w, h);
  }
  ctx.restore();
  return true;
}

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

export function getBossSprite(boss) {
  if (boss.kind === "zombieBoss") {
    return {
      asset: "purpleSlimeBoss",
      frame: Math.floor(boss.x / 12) % 4,
      cols: 4,
      frameW: 24,
      frameH: 24
    };
  }
  return null;
}

export function getBossDrawBox(boss) {
  if (boss.kind === "zombieBoss") {
    const scale = 1.5;
    const w = boss.w * scale;
    const h = boss.h * scale;
    return {
      x: boss.x - (w - boss.w) / 2,
      y: boss.y + boss.h - h,
      w,
      h
    };
  }
  return { x: boss.x, y: boss.y, w: boss.w, h: boss.h };
}

export function getCheckpointSprite() {
  return { asset: "checkpoint", flip: true };
}

export function getCrateSprite() {
  return { asset: "crate" };
}

export function getPitTiles(platforms, width = WIDTH, height = HEIGHT, groundY = GROUND_Y, tileSize = 18) {
  const ground = platforms
    .filter((platform) => platform.y === groundY)
    .map((platform) => ({ start: platform.x, end: platform.x + platform.w }))
    .sort((a, b) => a.start - b.start);
  const tiles = [];

  for (let index = 0; index < ground.length - 1; index++) {
    const startX = ground[index].end;
    const endX = ground[index + 1].start;
    if (endX <= startX) continue;

    for (let tileY = groundY; tileY < height; tileY += tileSize) {
      const layer = Math.floor((tileY - groundY) / tileSize);
      for (let tileX = startX; tileX < endX; tileX += tileSize) {
        tiles.push({
          asset: layer === 0 ? "pitTop" : "pitFill",
          x: tileX,
          y: tileY,
          w: Math.min(tileSize, endX - tileX),
          h: Math.min(tileSize, height - tileY),
          layer
        });
      }
    }
  }
  return tiles;
}

export function getBossWarningLine(boss) {
  const direction = boss.chargeDirection < 0 ? -1 : 1;
  return {
    startX: boss.x,
    endX: direction === -1 ? BOSS_CHARGE_MIN_X : BOSS_CHARGE_MAX_X,
    y: GROUND_Y - 24,
    direction
  };
}

export function getHealthBar(hp, maxHp, w) {
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  return { w, fillW: Math.round(w * ratio) };
}

export function getMeterCells(value, maxValue) {
  const filled = Math.max(0, Math.min(maxValue, value));
  return Array.from({ length: maxValue }, (_, index) => index < filled);
}

export function getThemePalette(theme) {
  if (theme === "graveyard") {
    return {
      sky: "#FFE957",
      ground: "#2d2a27",
      grass: "#5c6f48",
      platform: "#40352f",
      hud: "#17202a",
      boss: "#7f9174"
    };
  }

  return {
    sky: "#8fd2ff",
    ground: "#5d3f24",
    grass: "#3f8f45",
    platform: "#5d3f24",
    hud: "#17202a",
    boss: "#8d3bb8"
  };
}

function drawHealthBar(ctx, x, y, hp, maxHp, w, color = "#d65f5f") {
  const bar = getHealthBar(hp, maxHp, w);
  ctx.fillStyle = "#263238";
  ctx.fillRect(x, y, bar.w, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, Math.max(0, bar.fillW - 2), 6);
}

function drawMeter(ctx, label, value, maxValue, x, y, color) {
  ctx.fillStyle = "#17202a";
  ctx.font = "16px monospace";
  ctx.fillText(label, x, y + 12);

  const cellSize = 12;
  const gap = 4;
  const startX = x + 64;
  for (const [index, filled] of getMeterCells(value, maxValue).entries()) {
    const cellX = startX + index * (cellSize + gap);
    ctx.fillStyle = "#263238";
    ctx.fillRect(cellX, y, cellSize, cellSize);
    if (filled) {
      ctx.fillStyle = color;
      ctx.fillRect(cellX + 2, y + 2, cellSize - 4, cellSize - 4);
    }
  }
}

function drawPlayer(ctx, player) {
  const { x, y, facing } = player;
  const flip = facing === -1;
  const pose = getPlayerPose(player);
  const box = getPlayerDrawBox(player);
  if (drawSpriteFrame(ctx, getPlayerSprite(player), box.x, box.y, box.w, box.h, flip, pose.flash)) {
    const sword = getSwordHitbox(player);
    if (sword) {
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(sword.x, sword.y + 4, sword.w, 8);
      ctx.fillStyle = "#8b6914";
      ctx.fillRect(flip ? sword.x + sword.w - 8 : sword.x, sword.y + 8, 8, 8);
    }
    return;
  }
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

function drawZombie(ctx, enemy) {
  const { x, y, w, h } = enemy;
  const pose = getEnemyPose(enemy);
  const box = getZombieDrawBox(enemy);
  if (drawSpriteFrame(ctx, getZombieSprite(enemy), box.x, box.y, box.w, box.h, pose.facing === -1, pose.flash)) {
    if (enemy.invuln > 0) {
      drawHealthBar(ctx, x, y - 10, enemy.hp, 2, w, "#6f8f63");
    }
    return;
  }
  const armX = pose.facing === -1 ? x - 4 : x + w - 2;
  const bodyColor = pose.flash ? "#dfffd6" : "#6f8f63";

  ctx.fillStyle = "#314233";
  ctx.fillRect(x + 9, y + 11, w - 16, h - 6);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 8, y + 2, w - 14, 12);
  ctx.fillRect(x + 7, y + 13, w - 12, 13);
  ctx.fillStyle = "#596273";
  ctx.fillRect(x + 9, y + h - 6, 7, 6);
  ctx.fillRect(x + w - 15, y + h - 6, 7, 6);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(armX, y + 14, 8, 5);
  ctx.fillStyle = "#151827";
  ctx.fillRect(x + 12 + pose.facing * 2, y + 6, 4, 4);
  ctx.fillRect(x + 22 + pose.facing * 2, y + 6, 4, 4);
  ctx.fillStyle = "#29332c";
  ctx.fillRect(x + 14, y + 17, 12, 3);

  if (enemy.invuln > 0) {
    drawHealthBar(ctx, x, y - 10, enemy.hp, 2, w, "#6f8f63");
  }
}

function drawEnemy(ctx, enemy) {
  if (enemy.kind === "zombie") {
    drawZombie(ctx, enemy);
    return;
  }

  const { x, y, w, h } = enemy;
  const pose = getEnemyPose(enemy);
  const bounce = Math.floor(enemy.x / 18) % 2 === 0 ? 0 : 3;
  if (drawCharacterTile(ctx, bounce ? 1 : 0, x, y - 8, w, h + 8, pose.facing === -1, pose.flash)) {
    if (enemy.invuln > 0) {
      drawHealthBar(ctx, x, y - 10, enemy.hp, 2, w, "#7ed957");
    }
    return;
  }
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

  if (enemy.invuln > 0) {
    drawHealthBar(ctx, x, y - 10, enemy.hp, 2, w, "#7ed957");
  }
}

function drawBoss(ctx, boss) {
  const { x, y, w, h } = boss;
  const pose = getBossPose(boss);
  if (boss.kind === "zombieBoss") {
    const box = getBossDrawBox(boss);
    if (drawSpriteFrame(ctx, getBossSprite(boss), box.x, box.y, box.w, box.h, pose.facing === -1, false)) {
      return;
    }
    if (drawCharacterTile(ctx, pose.state === "charge" ? 23 : 21, x, y, w, h, pose.facing === -1, false)) {
      return;
    }
    const bodyColor = pose.state === "windup" ? "#9aa56d" : "#6f8f63";
    const eyeGlow = pose.state === "windup" ? "#f05f6f" : "#d7e8a8";

    ctx.fillStyle = "#3b4352";
    ctx.fillRect(x + 7, y + 22, w - 14, h - 24);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 13, y + 7, w - 26, 25);
    ctx.fillRect(x + 5, y + 29, 12, 8);
    ctx.fillRect(x + w - 17, y + 29, 12, 8);
    ctx.fillStyle = "#262b35";
    ctx.fillRect(x + 11, y + h - 8, w - 22, 8);
    ctx.fillStyle = eyeGlow;
    ctx.fillRect(x + 19 + pose.facing * 2, y + 17, 5, 5);
    ctx.fillRect(x + w - 24 + pose.facing * 2, y + 17, 5, 5);
    ctx.fillStyle = "#d7ddc4";
    ctx.fillRect(x + 22, y + 28, 12, 3);
    if (pose.state === "charge") {
      ctx.fillStyle = "rgb(215 232 168 / 0.65)";
      ctx.fillRect(pose.facing === -1 ? x - 18 : x + w, y + 30, 18, 8);
    }
    return;
  }

  const bodyColor = pose.state === "windup" ? "#d65f5f" : "#8d3bb8";
  if (drawCharacterTile(ctx, pose.state === "charge" ? 26 : 24, x, y, w, h, pose.facing === -1, false)) {
    return;
  }
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

  const line = getBossWarningLine(boss);
  const arrowBack = line.endX - line.direction * 16;

  ctx.save();
  ctx.strokeStyle = "rgb(214 95 95 / 0.85)";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(line.startX, line.y);
  ctx.lineTo(arrowBack, line.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#d65f5f";
  ctx.beginPath();
  ctx.moveTo(line.endX, line.y);
  ctx.lineTo(arrowBack, line.y - 10);
  ctx.lineTo(arrowBack, line.y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrate(ctx, crate) {
  const sprite = getCrateSprite();
  if (drawAsset(ctx, sprite.asset, crate.x, crate.y, crate.w, crate.h)) {
    return;
  }

  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(crate.x, crate.y, crate.w, crate.h);
  ctx.fillStyle = "#c28a43";
  ctx.fillRect(crate.x + 4, crate.y + 4, crate.w - 8, crate.h - 8);
  ctx.fillStyle = "#5d3f24";
  ctx.fillRect(crate.x + 14, crate.y, 6, crate.h);
  ctx.fillRect(crate.x, crate.y + 14, crate.w, 6);
}

function drawPickup(ctx, pickup) {
  if (drawAsset(ctx, pickup.type, pickup.x, pickup.y, pickup.w, pickup.h)) {
    return;
  }

  const colors = {
    medkit: "#f7f2df",
    arrows: "#f7d94a",
    armor: "#9fb3c8"
  };
  ctx.fillStyle = colors[pickup.type];
  ctx.fillRect(pickup.x, pickup.y, pickup.w, pickup.h);
  ctx.fillStyle = pickup.type === "medkit" ? "#d65f5f" : "#263238";
  if (pickup.type === "medkit") {
    ctx.fillRect(pickup.x + 11, pickup.y + 5, 4, 16);
    ctx.fillRect(pickup.x + 5, pickup.y + 11, 16, 4);
  } else if (pickup.type === "arrows") {
    ctx.fillRect(pickup.x + 5, pickup.y + 12, 16, 3);
    ctx.fillRect(pickup.x + 16, pickup.y + 8, 6, 11);
  } else {
    ctx.fillRect(pickup.x + 6, pickup.y + 5, 14, 16);
  }
}

function drawArrow(ctx, arrow) {
  ctx.fillStyle = "#5d3f24";
  ctx.fillRect(arrow.x, arrow.y, arrow.w, arrow.h);
  ctx.fillStyle = "#263238";
  ctx.fillRect(arrow.vx > 0 ? arrow.x + arrow.w : arrow.x - 4, arrow.y - 2, 4, 8);
}

function drawBossShot(ctx, shot) {
  ctx.fillStyle = "#d7e8a8";
  ctx.fillRect(shot.x, shot.y, shot.w, shot.h);
  ctx.fillStyle = "#6f8f63";
  ctx.fillRect(shot.vx > 0 ? shot.x - 6 : shot.x + shot.w, shot.y + 2, 6, 4);
}

function drawCheckpoint(ctx, checkpoint, active) {
  const sprite = getCheckpointSprite();
  if (drawAsset(ctx, sprite.asset, checkpoint.x, checkpoint.y, checkpoint.w + 10, checkpoint.h, sprite.flip)) {
    return;
  }

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
  const palette = getThemePalette(game.level.theme);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBackground(ctx, game.level.theme);
  drawPits(ctx, screen.platforms);

  ctx.fillStyle = palette.platform;
  for (const platform of screen.platforms) {
    if (!drawGround(ctx, platform, game.level.theme)) {
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      ctx.fillStyle = palette.grass;
      ctx.fillRect(platform.x, platform.y, platform.w, 8);
      ctx.fillStyle = palette.platform;
    }
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

  for (const crate of game.crates) {
    if (!crate.dead && crate.screen === game.currentScreen) {
      drawCrate(ctx, crate);
    }
  }

  for (const pickup of game.pickups) {
    if (!pickup.dead && pickup.screen === game.currentScreen) {
      drawPickup(ctx, pickup);
    }
  }

  for (const arrow of game.projectiles) {
    if (!arrow.dead && arrow.screen === game.currentScreen) {
      drawArrow(ctx, arrow);
    }
  }

  for (const shot of game.bossShots) {
    if (!shot.dead && shot.screen === game.currentScreen) {
      drawBossShot(ctx, shot);
    }
  }

  drawPlayer(ctx, game.player);

  for (const enemy of game.enemies) {
    if (enemy.dead || enemy.screen !== game.currentScreen) continue;
    drawEnemy(ctx, enemy);
  }

  if (!game.boss.dead && game.currentScreen === game.boss.screen) {
    drawBossWarning(ctx, game.boss);
    drawBoss(ctx, game.boss);
  }

  ctx.fillStyle = palette.hud;
  ctx.font = "20px monospace";
  drawMeter(ctx, "HP", game.player.hp, 5, 24, 16, "#d65f5f");
  drawMeter(ctx, "Armor", game.player.armor, 4, 24, 36, "#9fb3c8");
  drawMeter(ctx, "Arrow", game.player.arrows, 5, 24, 56, "#f7d94a");
  ctx.fillStyle = palette.hud;
  ctx.font = "20px monospace";
  ctx.fillText(game.level.name, 420, 32);
  if (!game.boss.dead && game.currentScreen === game.boss.screen) {
    drawHealthBar(ctx, 760, 18, game.boss.hp, 8, 160, palette.boss);
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
