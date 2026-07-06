export const WIDTH = 960;
export const HEIGHT = 540;
export const GROUND_Y = 456;
export const WORLD_SCREENS = 4;
export const WORLD_WIDTH = WIDTH * WORLD_SCREENS;
export const BOSS_SCREEN = 4;
export const BOSS_CHARGE_MIN_X = 40;
export const BOSS_CHARGE_MAX_X = 880;

export const GameState = Object.freeze({
  PLAYING: "playing",
  WON: "won",
  LOST: "lost"
});
