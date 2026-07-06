import { GROUND_Y } from "./constants.js";

const CHAPTERS = [
  {
    name: "史莱姆森林",
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
        enemies: [],
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
        enemies: [],
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
          { x: 300, y: GROUND_Y - 30, patrolMin: 260, patrolMax: 390 }
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
          { x: 604, y: 308, patrolMin: 548, patrolMax: 650 }
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
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 170, y: 368, w: 128, h: 24 },
          { x: 486, y: 318, w: 128, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 216, y: 334, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 132, y: 382, w: 112, h: 24 },
          { x: 380, y: 334, w: 116, h: 24 },
          { x: 660, y: 292, w: 116, h: 24 }
        ],
        enemies: [{ x: 420, y: GROUND_Y - 30, patrolMin: 360, patrolMax: 520 }],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 700, y: 258, type: "arrows" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 180, y: 350, w: 128, h: 24 },
          { x: 520, y: 326, w: 132, h: 24 }
        ],
        enemies: [{ x: 280, y: GROUND_Y - 30, patrolMin: 240, patrolMax: 410 }],
        spikes: [{ x: 704, y: GROUND_Y - 18, w: 96, h: 18 }],
        checkpoints: [],
        crates: [{ x: 560, y: 292, type: "armor" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 420, h: 84 },
          { x: 560, y: GROUND_Y, w: 400, h: 84 },
          { x: 220, y: 358, w: 128, h: 24 },
          { x: 600, y: 326, w: 136, h: 24 }
        ],
        enemies: [{ x: 640, y: 296, patrolMin: 602, patrolMax: 710 }],
        spikes: [{ x: 780, y: GROUND_Y - 18, w: 80, h: 18 }],
        checkpoints: [
          { x: 96, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 112, spawnY: GROUND_Y - 56 }
        ],
        crates: [{ x: 264, y: 324, type: "medkit" }]
      },
      {
        platforms: [
          { x: 0, y: GROUND_Y, w: 960, h: 84 },
          { x: 150, y: 360, w: 132, h: 24 },
          { x: 470, y: 314, w: 128, h: 24 }
        ],
        enemies: [],
        spikes: [],
        checkpoints: [],
        crates: [{ x: 512, y: 280, type: "arrows" }]
      }
    ]
  }
];

export function createLevel(chapterIndex = 0) {
  const chapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  return {
    ...chapter,
    chapter: chapterIndex,
    nextChapter: chapterIndex + 1 < CHAPTERS.length ? chapterIndex + 1 : null,
    platforms: chapter.screens[0].platforms,
    enemies: chapter.screens[0].enemies
  };
}
