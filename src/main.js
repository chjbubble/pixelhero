import { HEIGHT, WIDTH } from "./constants.js";
import { createGame, restartGame, updateGame } from "./entities.js";
import { installKeyboardListeners, installTouchControls, readActions } from "./input.js";
import { renderGame } from "./render.js";

const canvas = document.querySelector("#game");
const restartPanel = document.querySelector("#restart-panel");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
ctx.imageSmoothingEnabled = false;

installKeyboardListeners();
installTouchControls();

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
  restartPanel.hidden = game.state === "playing";
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
