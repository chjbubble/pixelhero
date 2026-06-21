import { GROUND_Y } from "./constants.js";

export function createLevel() {
  const screens = [
    {
      platforms: [
        { x: 0, y: GROUND_Y, w: 960, h: 84 },
        { x: 184, y: 356, w: 128, h: 24 },
        { x: 430, y: 320, w: 128, h: 24 }
      ],
      enemies: [],
      spikes: [],
      checkpoints: []
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
      ]
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
      checkpoints: []
    },
    {
      platforms: [
        { x: 0, y: GROUND_Y, w: 960, h: 84 },
        { x: 230, y: 360, w: 128, h: 24 },
        { x: 530, y: 338, w: 136, h: 24 }
      ],
      enemies: [
        { x: 604, y: 308, patrolMin: 548, patrolMax: 650 }
      ],
      spikes: [
        { x: 390, y: GROUND_Y - 18, w: 80, h: 18 }
      ],
      checkpoints: [
        { x: 96, y: GROUND_Y - 42, w: 22, h: 42, spawnX: 112, spawnY: GROUND_Y - 56 }
      ]
    },
    {
      platforms: [
        { x: 0, y: GROUND_Y, w: 960, h: 84 },
        { x: 148, y: 360, w: 132, h: 24 },
        { x: 456, y: 320, w: 128, h: 24 }
      ],
      enemies: [],
      spikes: [],
      checkpoints: []
    }
  ];

  return {
    spawn: { x: 72, y: GROUND_Y - 56 },
    screens,
    platforms: screens[0].platforms,
    enemies: screens[0].enemies,
    boss: { x: 806, y: GROUND_Y - 58, screen: 4 }
  };
}
