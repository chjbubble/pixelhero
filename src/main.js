import { HEIGHT, WIDTH } from "./constants.js";
import { createGame, restartGame, updateGame } from "./entities.js";
import { installKeyboardListeners, installTouchControls, readActions } from "./input.js";
import { installLevelSelect, showLevelSelect } from "./level-select.js";
import { getChapterList } from "./levels.js";
import { renderGame } from "./render.js";
import { playSoundEvents } from "./sound.js";

const canvas = document.querySelector("#game");
const restartPanel = document.querySelector("#restart-panel");
const levelSelectPanel = document.querySelector("#level-select-panel");
const levelSelectButton = document.querySelector("#level-select-button");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
ctx.imageSmoothingEnabled = false;

installKeyboardListeners();
installTouchControls();

let game = createGame();
let lastTime = performance.now();
let selectingLevel = true;

installLevelSelect(levelSelectPanel, getChapterList(), (chapterIndex) => {
  game = createGame(chapterIndex);
  selectingLevel = false;
});

levelSelectButton.addEventListener("click", () => {
  selectingLevel = true;
  restartPanel.hidden = true;
  showLevelSelect(levelSelectPanel);
});

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  const actions = readActions();

  if (!selectingLevel && actions.restart && game.state !== "playing") {
    game = restartGame(game);
  }

  if (!selectingLevel) {
    updateGame(game, actions, dt);
    playSoundEvents(game.soundEvents);
  }
  renderGame(ctx, game);
  restartPanel.hidden = selectingLevel || game.state === "playing";
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
