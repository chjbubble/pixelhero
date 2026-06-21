import { HEIGHT, WIDTH } from "./constants.js";
import { createGame, restartGame, updateGame } from "./entities.js";
import { installKeyboardListeners, readActions } from "./input.js";
import { renderGame } from "./render.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

installKeyboardListeners();

let game = createGame();
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  const actions = readActions();

  if (actions.restart && game.state !== "playing") {
    game = restartGame(game);
  }

  updateGame(game, actions, dt);
  renderGame(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
