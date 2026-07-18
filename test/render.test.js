import test from "node:test";
import assert from "node:assert/strict";
import {
  getAssetPaths,
  getBossPose,
  getBossSprite,
  getBossTrapStyle,
  getBossDrawBox,
  getBossWarningLine,
  getWorldViewTransform,
  getCheckpointSprite,
  getEnemyPose,
  getGroundTiles,
  getHealthBar,
  getMeterCells,
  getBackgroundTiles,
  getCrateSprite,
  getPitTiles,
  getPlayerDrawBox,
  getPlayerSprite,
  getTerrainTile,
  getZombieDrawBox,
  getZombieSprite,
  getPlayerPose,
  getThemePalette
} from "../src/render.js";

test("Kenney asset paths are stable browser-relative files", () => {
  assert.equal(getAssetPaths().characters, "./assets/kenney/Tilemap/tilemap-characters.png");
  assert.equal(getAssetPaths().terrain, "./assets/kenney_pixel-platformer/Tilemap/tilemap.png");
  assert.equal(getAssetPaths().backgrounds, "./assets/kenney_pixel-platformer/Tilemap/tilemap-backgrounds_packed.png");
  assert.equal(getAssetPaths().knight, "./assets/brackeys_platformer_assets/sprites/knight.png");
  assert.equal(getAssetPaths().zombieSlime, "./assets/brackeys_platformer_assets/sprites/slime_green.png");
  assert.equal(getAssetPaths().purpleSlimeBoss, "./assets/brackeys_platformer_assets/sprites/slime_purple.png");
  assert.equal(getAssetPaths().crate, "./assets/kenney_pixel-platformer/Tiles/tile_0010.png");
  assert.equal(getAssetPaths().chest, "./assets/kenney_pixel-platformer/Tiles/tile_0145.png");
  assert.equal(getAssetPaths().ruinsGroundTop, "./assets/kenney_pixel-platformer/Tiles/tile_0082.png");
  assert.equal(getAssetPaths().ruinsEnemyA, "./assets/kenney_pixel-platformer/Tiles/Characters/tile_0002.png");
  assert.equal(getAssetPaths().ruinsEnemyB, "./assets/kenney_pixel-platformer/Tiles/Characters/tile_0003.png");
  assert.equal(getAssetPaths().groundFill, "./assets/kenney/Tiles/tile_0006.png");
  assert.equal(getAssetPaths().armor, "./assets/kenney/Tiles/tile_0067.png");
  assert.equal(getAssetPaths().pitTop, "./assets/kenney_pixel-platformer/Tiles/tile_0033.png");
  assert.equal(getAssetPaths().pitFill, "./assets/kenney_pixel-platformer/Tiles/tile_0073.png");
  assert.equal(getAssetPaths().sciFiTiles, "./assets/scifi_asset_pack/tileset.png");
  assert.equal(getAssetPaths().spaceAlien, "./assets/scifi_asset_pack/idle.png");
  assert.equal(getAssetPaths().spaceBoss, "./assets/scifi_asset_pack/we_r_mush_anim.png");
  assert.equal(getAssetPaths().mushMinion, "./assets/scifi_asset_pack/mush_anim.png");
  assert.equal(getAssetPaths().spaceBackground, "./assets/scifi_asset_pack/space_background.png");
});

test("ruins use requested top ground and background tiles", () => {
  assert.deepEqual(getTerrainTile("ruins", 0), { asset: "ruinsGroundTop" });
  assert.deepEqual(getTerrainTile("ruins", 1), { asset: "terrain", sx: 38, sy: 114, sw: 18, sh: 18 });

  const tiles = getBackgroundTiles("ruins", 180, 450, 360);
  assert.equal(tiles[0].asset, "ruinsBgFill");
  assert.equal(tiles.at(-2).asset, "ruinsBgGroundB");
  assert.equal(tiles.at(-1).asset, "ruinsBgGroundTop");
});

test("ground tiles use unscaled atlas cells without bordered source tiles", () => {
  const tiles = getGroundTiles({ x: 0, y: 432, w: 80, h: 84 });

  assert.deepEqual(tiles[0], { x: 0, y: 432, w: 18, h: 18, layer: 0 });
  assert.deepEqual(tiles[5], { x: 0, y: 450, w: 18, h: 18, layer: 1 });
  assert.deepEqual(tiles.at(-1), { x: 72, y: 504, w: 8, h: 12, layer: 4 });
  assert.deepEqual(getTerrainTile("forest", 0), { asset: "terrain", sx: 38, sy: 19, sw: 18, sh: 18 });
  assert.deepEqual(getTerrainTile("graveyard", 0), { asset: "terrain", sx: 38, sy: 57, sw: 18, sh: 18 });
  assert.deepEqual(getTerrainTile("forest", 1), { asset: "terrain", sx: 38, sy: 114, sw: 18, sh: 18 });
  assert.deepEqual(getTerrainTile("spaceship", 0), { asset: "sciFiTiles", sx: 160, sy: 32, sw: 96, sh: 64 });
});

test("background tiles render double size without repeating lower rows", () => {
  const forest = getBackgroundTiles("forest", 360, 450, 360);
  const forestTopColumns = new Set(forest.filter((tile) => tile.y === 0).map((tile) => tile.sx));
  assert.deepEqual(forest[0], { asset: "backgrounds", sx: 144, sy: 0, sw: 18, sh: 18, x: 0, y: 0, w: 90, h: 90 });
  assert.deepEqual(forest.filter((tile) => tile.y === 0).slice(0, 4).map((tile) => tile.sx), [144, 162, 162, 144]);
  assert.deepEqual([...forestTopColumns].sort((a, b) => a - b), [144, 162]);
  assert.ok(forest.filter((tile) => tile.y === 180 && tile.sy === 18).every((tile) => [144, 162].includes(tile.sx)));
  assert.ok(forest.filter((tile) => tile.y === 270 && tile.sy === 36).every((tile) => [144, 162].includes(tile.sx)));
  assert.deepEqual([...new Set(forest.filter((tile) => tile.sy === 36).map((tile) => tile.y))], [270]);

  const graveyard = getBackgroundTiles("graveyard", 360, 450, 360);
  const graveyardTopColumns = new Set(graveyard.filter((tile) => tile.y === 0).map((tile) => tile.sx));
  assert.deepEqual(graveyard[0], { asset: "backgrounds", sx: 126, sy: 0, sw: 18, sh: 18, x: 0, y: 0, w: 90, h: 90 });
  assert.deepEqual(graveyard.filter((tile) => tile.y === 0).slice(0, 4).map((tile) => tile.sx), [126, 108, 108, 126]);
  assert.deepEqual([...graveyardTopColumns].sort((a, b) => a - b), [108, 126]);
});

test("portrait world view scales content by 50 percent without changing canvas size", () => {
  assert.deepEqual(
    getWorldViewTransform({
      scale: 1,
      cameraX: 120,
      mapWidth: 3840,
      player: { x: 600, w: 32 }
    }),
    { scale: 1, x: 120, y: 0 }
  );

  assert.deepEqual(
    getWorldViewTransform({
      scale: 1.5,
      cameraX: 120,
      mapWidth: 3840,
      player: { x: 600, w: 32 }
    }),
    { scale: 1.5, x: 296, y: 180 }
  );
});

test("checkpoint sign sprite points right", () => {
  assert.deepEqual(getCheckpointSprite(), { asset: "checkpoint", flip: true });
});

test("crates use requested Kenney pixel platformer tile", () => {
  assert.deepEqual(getCrateSprite(), { asset: "crate" });
});

test("pit gaps use water top tile and water fill below", () => {
  assert.deepEqual(
    getPitTiles(
      [
        { x: 0, y: 100, w: 40, h: 84 },
        { x: 80, y: 100, w: 40, h: 84 },
        { x: 10, y: 40, w: 20, h: 20 }
      ],
      120,
      142,
      100
    ),
    [
      { asset: "pitTop", x: 40, y: 100, w: 18, h: 18, layer: 0 },
      { asset: "pitTop", x: 58, y: 100, w: 18, h: 18, layer: 0 },
      { asset: "pitTop", x: 76, y: 100, w: 4, h: 18, layer: 0 },
      { asset: "pitFill", x: 40, y: 118, w: 18, h: 18, layer: 1 },
      { asset: "pitFill", x: 58, y: 118, w: 18, h: 18, layer: 1 },
      { asset: "pitFill", x: 76, y: 118, w: 4, h: 18, layer: 1 },
      { asset: "pitFill", x: 40, y: 136, w: 18, h: 6, layer: 2 },
      { asset: "pitFill", x: 58, y: 136, w: 18, h: 6, layer: 2 },
      { asset: "pitFill", x: 76, y: 136, w: 4, h: 6, layer: 2 }
    ]
  );
});

test("player pose reflects movement and airborne states", () => {
  assert.equal(getPlayerPose({ vx: 0, vy: 0, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }).state, "idle");
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }).state, "run");
  assert.equal(getPlayerPose({ vx: 0, vy: -120, grounded: false, attackTimer: 0, invuln: 0, jumpsUsed: 1 }).state, "jump");
  assert.equal(getPlayerPose({ vx: 0, vy: -120, grounded: false, attackTimer: 0, invuln: 0, jumpsUsed: 2 }).state, "double-jump");
});

test("player attack and hurt poses take priority", () => {
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0.1, invuln: 0, jumpsUsed: 0 }).state, "attack");
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0, invuln: 0.5, jumpsUsed: 0 }).flash, true);
});

test("player and graveyard zombie use Brackeys sprite sheets", () => {
  assert.deepEqual(getPlayerSprite({ x: 0, vx: 0, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }), {
    asset: "knight",
    frame: 0,
    cols: 8,
    frameW: 32,
    frameH: 32,
    cropBottom: 4
  });
  assert.equal(getPlayerSprite({ x: 12, vx: 120, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }).frame, 2);
  assert.equal(getPlayerSprite({ x: 120, vx: 0, grounded: false, attackTimer: 0.1, invuln: 0, jumpsUsed: 1 }).frame, 0);
  assert.deepEqual(getZombieSprite({ x: 0 }), { asset: "zombieSlime", frame: 0, cols: 4, frameW: 24, frameH: 24 });
});

test("player sprite is 50 percent taller and 30 percent wider while keeping feet aligned", () => {
  assert.deepEqual(getPlayerDrawBox({ x: 100, y: 200, w: 32, h: 56 }), {
    x: 85,
    y: 172,
    w: 62,
    h: 84
  });
});

test("graveyard zombie sprite is drawn 50 percent larger with feet aligned", () => {
  assert.deepEqual(getZombieDrawBox({ x: 100, y: 300, w: 34, h: 30 }), {
    x: 91.5,
    y: 285,
    w: 51,
    h: 45
  });
});

test("enemy pose reflects patrol direction and hit flash", () => {
  assert.deepEqual(getEnemyPose({ vx: -70, invuln: 0 }), { facing: -1, flash: false });
  assert.deepEqual(getEnemyPose({ vx: 70, invuln: 0.1 }), { facing: 1, flash: true });
});

test("boss pose reflects attack phase", () => {
  assert.deepEqual(getBossPose({ phase: "idle", chargeDirection: -1 }), { state: "idle", facing: -1, warning: false });
  assert.deepEqual(getBossPose({ phase: "windup", chargeDirection: 1 }), { state: "windup", facing: 1, warning: true });
  assert.deepEqual(getBossPose({ phase: "charge", chargeDirection: -1 }), { state: "charge", facing: -1, warning: false });
});

test("graveyard boss uses purple slime sheet at current boss size", () => {
  assert.deepEqual(getBossSprite({ kind: "zombieBoss", x: 120, phase: "idle" }), {
    asset: "purpleSlimeBoss",
    frame: 2,
    cols: 4,
    frameW: 24,
    frameH: 24
  });
  assert.deepEqual(getBossDrawBox({ kind: "zombieBoss", x: 700, y: 398, w: 55, h: 58 }), {
    x: 686.25,
    y: 369,
    w: 82.5,
    h: 87
  });
  assert.deepEqual(getBossDrawBox({ kind: "forestBoss", x: 700, y: 398, w: 55, h: 58 }), { x: 700, y: 398, w: 55, h: 58 });
});

test("third chapter boss uses requested character tiles as action frames", () => {
  assert.deepEqual(getBossSprite({ kind: "spikeBoss", phase: "idle" }), { asset: "ruinsBossA" });
  assert.deepEqual(getBossSprite({ kind: "spikeBoss", phase: "windup" }), { asset: "ruinsBossB" });
  assert.deepEqual(getBossSprite({ kind: "spikeBoss", phase: "charge" }), { asset: "ruinsBossC" });
});

test("spaceship boss animation advances with its movement", () => {
  assert.deepEqual(getBossSprite({ kind: "spaceBoss", x: 36 }), {
    asset: "spaceBoss",
    frame: 4,
    cols: 7,
    frameW: 35,
    frameH: 32
  });
});

test("boss trap warning and spikes use red hazard colors", () => {
  assert.deepEqual(getBossTrapStyle(false), { base: "rgb(214 95 95 / 0.45)", spike: "#d65f5f" });
  assert.deepEqual(getBossTrapStyle(true), { base: "#616b75", spike: "#d65f5f" });
});

test("boss warning line matches charge distance", () => {
  assert.deepEqual(getBossWarningLine({ x: 806, y: 398, w: 55, chargeDirection: -1 }), {
    startX: 806,
    endX: 40,
    y: 432,
    direction: -1
  });
  assert.deepEqual(getBossWarningLine({ x: 806, y: 398, w: 55, chargeDirection: 1 }), {
    startX: 806,
    endX: 880,
    y: 432,
    direction: 1
  });
});

test("health bar clamps fill width", () => {
  assert.deepEqual(getHealthBar(3, 5, 50), { w: 50, fillW: 30 });
  assert.deepEqual(getHealthBar(9, 8, 80), { w: 80, fillW: 80 });
  assert.deepEqual(getHealthBar(-1, 5, 50), { w: 50, fillW: 0 });
});

test("meter cells clamp current value", () => {
  assert.deepEqual(getMeterCells(3, 5), [true, true, true, false, false]);
  assert.deepEqual(getMeterCells(9, 4), [true, true, true, true]);
  assert.deepEqual(getMeterCells(-1, 3), [false, false, false]);
});

test("graveyard theme uses a dark palette", () => {
  assert.equal(getThemePalette("graveyard").sky, "#FFE957");
  assert.equal(getThemePalette("graveyard").hud, "#17202a");
  assert.equal(getThemePalette("forest").sky, "#8fd2ff");
});
