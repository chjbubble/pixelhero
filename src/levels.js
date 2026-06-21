import { GROUND_Y } from "./constants.js";

export function createLevel() {
  const screens = [
    {
      platforms: [
        { x: 0, y: GROUND_Y, w: 960, h: 84 },
        { x: 176, y: 350, w: 128, h: 24 },
        { x: 372, y: 292, w: 136, h: 24 },
        { x: 572, y: 372, w: 144, h: 24 }
      ],
      enemies: [
        { x: 300, y: GROUND_Y - 30, patrolMin: 260, patrolMax: 390 },
        { x: 604, y: 342, patrolMin: 580, patrolMax: 704 }
      ]
    },
    {
      platforms: [
        { x: 0, y: GROUND_Y, w: 960, h: 84 },
        { x: 148, y: 360, w: 132, h: 24 },
        { x: 456, y: 320, w: 128, h: 24 }
      ],
      enemies: []
    }
  ];

  return {
    spawn: { x: 72, y: GROUND_Y - 56 },
    screens,
    platforms: screens[0].platforms,
    enemies: screens[0].enemies,
    boss: { x: 806, y: GROUND_Y - 72, screen: 1 }
  };
}
