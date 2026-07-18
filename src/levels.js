import { BOSS_SCREEN, GROUND_Y, WIDTH, WORLD_SCREENS } from "./constants.js";

function offsetEnemies(items, offsetX) {
  return items.map((item) => ({
    ...item,
    x: item.x + offsetX,
    patrolMin: item.patrolMin + offsetX,
    patrolMax: item.patrolMax + offsetX
  }));
}

function offsetEntities(items, offsetX) {
  return items.map((item) => ({ ...item, x: item.x + offsetX }));
}

function offsetCheckpoints(items, offsetX) {
  return items.map((item) => ({
    ...item,
    x: item.x + offsetX,
    spawnX: item.spawnX + offsetX
  }));
}

export function getGroundSegments(platforms, groundY = GROUND_Y) {
  return platforms
    .filter((platform) => platform.y === groundY)
    .map((platform) => ({ start: platform.x, end: platform.x + platform.w }))
    .sort((a, b) => a.start - b.start);
}

export function getPitRanges(platforms, groundY = GROUND_Y) {
  const ground = getGroundSegments(platforms, groundY);
  const pits = [];

  for (let index = 0; index < ground.length - 1; index += 1) {
    const start = ground[index].end;
    const end = ground[index + 1].start;
    if (end > start) {
      pits.push({ start, end });
    }
  }

  return pits;
}

export function spikeOverlapsPit(spike, pits) {
  const spikeEnd = spike.x + spike.w;
  return pits.some((pit) => spike.x < pit.end && spikeEnd > pit.start);
}

export function mergeWorldScreens(screens, screenCount = WORLD_SCREENS, screenWidth = WIDTH) {
  const world = {
    platforms: [],
    enemies: [],
    spikes: [],
    checkpoints: [],
    crates: [],
    width: screenCount * screenWidth
  };

  for (let screenIndex = 0; screenIndex < screenCount && screenIndex < screens.length; screenIndex += 1) {
    const offsetX = screenIndex * screenWidth;
    const screen = screens[screenIndex];

    world.platforms.push(...offsetEntities(screen.platforms, offsetX));
    world.enemies.push(...offsetEnemies(screen.enemies, offsetX));
    world.spikes.push(...offsetEntities(screen.spikes, offsetX));
    world.checkpoints.push(...offsetCheckpoints(screen.checkpoints, offsetX));
    world.crates.push(...offsetEntities(screen.crates, offsetX));
  }

  return world;
}

const CHAPTERS = [
  {
    name: "宁静森林",
    theme: "forest",
    enemyKind: "slime",
    enemySpeed: 70,
    crateStyle: "crate",
    spawn: { x: 72, y: GROUND_Y - 56 },
    boss: { x: 806, y: GROUND_Y - 58, screen: 4, kind: "forestBoss", attack: "charge" },
    screens: [
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 184, y: 356, w: 128, h: 24 },
          { x: 430, y: 320, w: 128, h: 24 }
        ],
        enemies: [
          { x: 520, y: GROUND_Y - 30, patrolMin: 460, patrolMax: 620 },
          { x: 780, y: GROUND_Y - 30, patrolMin: 700, patrolMax: 880 }
        ],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 230, y: 322, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 144, y: 384, w: 96, h: 24 },
          { x: 332, y: 330, w: 104, h: 24 },
          { x: 560, y: 278, w: 112, h: 24 }
        ],
        enemies: [
          { x: 180, y: GROUND_Y - 30, patrolMin: 120, patrolMax: 280 },
          { x: 420, y: GROUND_Y - 30, patrolMin: 340, patrolMax: 500 },
          { x: 360, y: 300, patrolMin: 340, patrolMax: 420 }
        ],
        spikes: [],
        checkpoints: [
          { x: 80, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 88, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 600, y: 244, type: "arrows" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 176, y: 350, w: 128, h: 24 },
          { x: 488, y: 330, w: 132, h: 24 }
        ],
        enemies: [
          { x: 140, y: GROUND_Y - 30, patrolMin: 80, patrolMax: 220 },
          { x: 300, y: GROUND_Y - 30, patrolMin: 260, patrolMax: 390 },
          { x: 620, y: GROUND_Y - 30, patrolMin: 540, patrolMax: 720 },
          { x: 520, y: 300, patrolMin: 500, patrolMax: 600 }
        ],
        spikes: [
          { x: 392, y: GROUND_Y - 18, w: 80, h: 18 },
          { x: 704, y: GROUND_Y - 18, w: 96, h: 18 }
        ],
        checkpoints: [],
        crates: [{ x: 540, y: 296, type: "armor" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 380, h: 84 },
          { x: 520, y: GROUND_Y, w: 440, h: 84 },
          { x: 230, y: 360, w: 128, h: 24 },
          { x: 530, y: 338, w: 136, h: 24 }
        ],
        enemies: [
          { x: 180, y: GROUND_Y - 30, patrolMin: 100, patrolMax: 280 },
          { x: 604, y: 308, patrolMin: 548, patrolMax: 650 },
          { x: 820, y: GROUND_Y - 30, patrolMin: 760, patrolMax: 900 }
        ],
        spikes: [
          { x: 760, y: GROUND_Y - 18, w: 80, h: 18 }
        ],
        checkpoints: [
          { x: 96, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 112, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 270, y: 326, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 148, y: 360, w: 132, h: 24 },
          { x: 456, y: 320, w: 128, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 500, y: 286, type: "arrows" }]
      }
    ]
  },
  {
    name: "腐败墓园",
    theme: "graveyard",
    enemyKind: "zombie",
    enemySpeed: 35,
    crateStyle: "tombstone",
    spawn: { x: 72, y: GROUND_Y - 56 },
    boss: {
      x: 792,
      y: GROUND_Y - 58,
      screen: 4,
      kind: "zombieBoss",
      attack: "ranged",
      aggroRange: 320,
      patrolMin: 620,
      patrolMax: 860,
      patrolSpeed: 45,
      idleSeconds: 6
    },
    screens: [
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 260, h: 84 },
          { x: 340, y: GROUND_Y, w: 620, h: 84 },
          { x: 120, y: 372, w: 96, h: 24 },
          { x: 560, y: 340, w: 112, h: 24 },
          { x: 780, y: 308, w: 96, h: 24 }
        ],
        enemies: [
          { x: 120, y: GROUND_Y - 30, patrolMin: 60, patrolMax: 200 },
          { x: 500, y: GROUND_Y - 30, patrolMin: 380, patrolMax: 560 }
        ],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 148, y: 338, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 180, h: 84 },
          { x: 260, y: GROUND_Y, w: 220, h: 84 },
          { x: 560, y: GROUND_Y, w: 400, h: 84 },
          { x: 200, y: 388, w: 88, h: 24 },
          { x: 360, y: 348, w: 96, h: 24 },
          { x: 520, y: 308, w: 104, h: 24 },
          { x: 700, y: 268, w: 112, h: 24 }
        ],
        enemies: [
          { x: 80, y: GROUND_Y - 30, patrolMin: 40, patrolMax: 140 },
          { x: 340, y: GROUND_Y - 30, patrolMin: 280, patrolMax: 440 },
          { x: 390, y: 318, patrolMin: 368, patrolMax: 444 }
        ],
        spikes: [{ x: 408, y: GROUND_Y - 18, w: 72, h: 18 }],
        checkpoints: [
          { x: 600, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 612, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 730, y: 234, type: "arrows" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 140, h: 84 },
          { x: 720, y: GROUND_Y, w: 240, h: 84 },
          { x: 220, y: 360, w: 88, h: 24 },
          { x: 380, y: 328, w: 96, h: 24 },
          { x: 540, y: 296, w: 104, h: 24 },
          { x: 700, y: 264, w: 112, h: 24 }
        ],
        enemies: [
          { x: 60, y: GROUND_Y - 30, patrolMin: 20, patrolMax: 100 },
          { x: 420, y: 298, patrolMin: 392, patrolMax: 520 },
          { x: 780, y: GROUND_Y - 30, patrolMin: 740, patrolMax: 900 }
        ],
        spikes: [{ x: 820, y: GROUND_Y - 18, w: 88, h: 18 }],
        checkpoints: [],
        crates: [{ x: 570, y: 262, type: "armor" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 220, h: 84 },
          { x: 320, y: GROUND_Y, w: 180, h: 84 },
          { x: 620, y: GROUND_Y, w: 340, h: 84 },
          { x: 160, y: 368, w: 96, h: 24 },
          { x: 420, y: 336, w: 104, h: 24 },
          { x: 700, y: 304, w: 112, h: 24 }
        ],
        enemies: [
          { x: 100, y: GROUND_Y - 30, patrolMin: 40, patrolMax: 180 },
          { x: 380, y: GROUND_Y - 30, patrolMin: 340, patrolMax: 460 },
          { x: 720, y: GROUND_Y - 30, patrolMin: 660, patrolMax: 860 }
        ],
        spikes: [
          { x: 168, y: GROUND_Y - 18, w: 52, h: 18 },
          { x: 448, y: GROUND_Y - 18, w: 52, h: 18 }
        ],
        checkpoints: [
          { x: 660, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 672, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 448, y: 302, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 280, h: 84 },
          { x: 680, y: GROUND_Y, w: 280, h: 84 },
          { x: 340, y: 352, w: 280, h: 24 },
          { x: 120, y: 320, w: 96, h: 24 },
          { x: 744, y: 320, w: 96, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 460, y: 318, type: "arrows" }]
      }
    ]
  },
  {
    name: "雪地遗迹",
    theme: "ruins",
    enemyKind: "ruinsBeast",
    enemySpeed: 50,
    crateStyle: "chest",
    spawn: { x: 72, y: GROUND_Y - 56 },
    boss: {
      x: 780,
      y: GROUND_Y - 58,
      screen: 4,
      kind: "spikeBoss",
      attack: "spikeTrap",
      idleSeconds: 2,
      trapWindupSeconds: 0.9,
      trapActiveSeconds: 0.5
    },
    screens: [
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 300, h: 84 },
          { x: 400, y: GROUND_Y, w: 560, h: 84 },
          { x: 170, y: 366, w: 104, h: 24 },
          { x: 460, y: 330, w: 128, h: 24 },
          { x: 720, y: 292, w: 112, h: 24 }
        ],
        enemies: [
          { x: 120, y: GROUND_Y - 30, patrolMin: 60, patrolMax: 240 },
          { x: 520, y: GROUND_Y - 30, patrolMin: 430, patrolMax: 650 },
          { x: 745, y: 262, patrolMin: 724, patrolMax: 815 }
        ],
        spikes: [{ x: 626, y: GROUND_Y - 18, w: 72, h: 18 }],
        checkpoints: [],
        crates: [{ x: 500, y: 296, type: "arrows" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 220, h: 84 },
          { x: 330, y: GROUND_Y, w: 250, h: 84 },
          { x: 700, y: GROUND_Y, w: 260, h: 84 },
          { x: 220, y: 382, w: 96, h: 24 },
          { x: 410, y: 340, w: 104, h: 24 },
          { x: 610, y: 300, w: 112, h: 24 }
        ],
        enemies: [
          { x: 100, y: GROUND_Y - 30, patrolMin: 44, patrolMax: 180 },
          { x: 430, y: 310, patrolMin: 414, patrolMax: 500 },
          { x: 780, y: GROUND_Y - 30, patrolMin: 730, patrolMax: 900 }
        ],
        spikes: [{ x: 476, y: GROUND_Y - 18, w: 72, h: 18 }],
        checkpoints: [
          { x: 740, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 752, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 250, y: 348, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 160, h: 84 },
          { x: 280, y: GROUND_Y, w: 180, h: 84 },
          { x: 600, y: GROUND_Y, w: 360, h: 84 },
          { x: 150, y: 372, w: 96, h: 24 },
          { x: 350, y: 328, w: 104, h: 24 },
          { x: 560, y: 284, w: 112, h: 24 },
          { x: 760, y: 340, w: 96, h: 24 }
        ],
        enemies: [
          { x: 70, y: GROUND_Y - 30, patrolMin: 30, patrolMax: 128 },
          { x: 378, y: 298, patrolMin: 356, patrolMax: 442 },
          { x: 700, y: GROUND_Y - 30, patrolMin: 635, patrolMax: 840 }
        ],
        spikes: [
          { x: 330, y: GROUND_Y - 18, w: 72, h: 18 },
          { x: 792, y: GROUND_Y - 18, w: 72, h: 18 }
        ],
        checkpoints: [],
        crates: [{ x: 588, y: 250, type: "armor" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 260, h: 84 },
          { x: 410, y: GROUND_Y, w: 550, h: 84 },
          { x: 230, y: 360, w: 112, h: 24 },
          { x: 520, y: 320, w: 128, h: 24 },
          { x: 760, y: 278, w: 112, h: 24 }
        ],
        enemies: [
          { x: 140, y: GROUND_Y - 30, patrolMin: 70, patrolMax: 230 },
          { x: 560, y: 290, patrolMin: 528, patrolMax: 635 },
          { x: 760, y: GROUND_Y - 30, patrolMin: 680, patrolMax: 900 }
        ],
        spikes: [{ x: 820, y: GROUND_Y - 18, w: 72, h: 18 }],
        checkpoints: [
          { x: 456, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 468, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 800, y: 244, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 150, y: 356, w: 120, h: 24 },
          { x: 410, y: 312, w: 140, h: 24 },
          { x: 690, y: 356, w: 120, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 456, y: 278, type: "arrows" }]
      }
    ]
  },
  {
    name: "\u5916\u661f\u98de\u8239",
    theme: "spaceship",
    enemyKind: "spaceAlien",
    enemySpeed: 52,
    crateStyle: "crate",
    spawn: { x: 72, y: GROUND_Y - 56 },
    boss: { x: 752, y: GROUND_Y - 96, w: 96, h: 96, screen: 4, kind: "spaceBoss", attack: "minions", patrolMin: 600, patrolMax: 820, patrolSpeed: 52 },
    screens: [
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 164, y: 356, w: 160, h: 24 },
          { x: 498, y: 312, w: 192, h: 24 }
        ],
        enemies: [
          { x: 270, y: GROUND_Y - 30, patrolMin: 160, patrolMax: 380 },
          { x: 570, y: 282, patrolMin: 520, patrolMax: 650 }
        ],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 220, y: 322, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 116, y: 382, w: 144, h: 24 },
          { x: 382, y: 328, w: 176, h: 24 },
          { x: 690, y: 274, w: 152, h: 24 }
        ],
        enemies: [
          { x: 180, y: GROUND_Y - 30, patrolMin: 90, patrolMax: 300 },
          { x: 440, y: 298, patrolMin: 400, patrolMax: 520 },
          { x: 760, y: GROUND_Y - 30, patrolMin: 650, patrolMax: 860 }
        ],
        spikes: [],
        checkpoints: [
          { x: 78, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 90, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 744, y: 240, type: "arrows" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 164, y: 350, w: 176, h: 24 },
          { x: 462, y: 300, w: 160, h: 24 },
          { x: 748, y: 360, w: 132, h: 24 }
        ],
        enemies: [
          { x: 110, y: GROUND_Y - 30, patrolMin: 50, patrolMax: 230 },
          { x: 518, y: 270, patrolMin: 478, patrolMax: 590 },
          { x: 790, y: GROUND_Y - 30, patrolMin: 700, patrolMax: 900 }
        ],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 516, y: 266, type: "armor" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 208, y: 366, w: 160, h: 24 },
          { x: 504, y: 318, w: 176, h: 24 },
          { x: 762, y: 272, w: 128, h: 24 }
        ],
        enemies: [
          { x: 170, y: GROUND_Y - 30, patrolMin: 80, patrolMax: 290 },
          { x: 580, y: 288, patrolMin: 530, patrolMax: 650 },
          { x: 820, y: GROUND_Y - 30, patrolMin: 720, patrolMax: 910 }
        ],
        spikes: [],
        checkpoints: [
          { x: 108, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 120, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 806, y: 238, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 164, y: 360, w: 160, h: 24 },
          { x: 462, y: 316, w: 176, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 520, y: 282, type: "arrows" }]
      }
    ]
  }
];

export function getChapterList() {
  return CHAPTERS.map((chapter, index) => ({ index, name: chapter.name }));
}

export function createLevel(chapterIndex = 0) {
  const chapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  return {
    ...chapter,
    chapter: chapterIndex,
    nextChapter: chapterIndex + 1 < CHAPTERS.length ? chapterIndex + 1 : null,
    worldMap: mergeWorldScreens(chapter.screens),
    bossScreen: chapter.screens[BOSS_SCREEN] ?? chapter.screens.at(-1),
    platforms: chapter.screens[0].platforms,
    enemies: chapter.screens[0].enemies
  };
}
