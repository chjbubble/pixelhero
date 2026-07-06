import test from "node:test";
import assert from "node:assert/strict";
import { formatLevelName, installLevelSelect, showLevelSelect } from "../src/level-select.js";

function fakePanel() {
  const buttons = [];
  return {
    hidden: true,
    buttons,
    replaceChildren(...children) {
      buttons.splice(0, buttons.length, ...children);
    }
  };
}

globalThis.document = {
  createElement() {
    return {
      className: "",
      type: "",
      textContent: "",
      listeners: {},
      addEventListener(type, listener) {
        this.listeners[type] = listener;
      },
      click() {
        this.listeners.click();
      }
    };
  }
};

test("level names wrap every two Chinese characters", () => {
  assert.equal(formatLevelName("雪地遗迹"), "雪地\n遗迹");
});

test("level select creates square buttons that start the chosen chapter", () => {
  const panel = fakePanel();
  const selected = [];

  installLevelSelect(panel, [
    { index: 0, name: "森林关卡" },
    { index: 1, name: "墓园关卡" },
    { index: 2, name: "雪地遗迹" }
  ], (index) => selected.push(index));

  assert.equal(panel.hidden, false);
  assert.equal(panel.buttons.length, 3);
  assert.equal(panel.buttons[2].textContent, "雪地\n遗迹");

  panel.buttons[2].click();

  assert.deepEqual(selected, [2]);
  assert.equal(panel.hidden, true);
});

test("level select can be shown again after game over", () => {
  const panel = fakePanel();
  panel.hidden = true;

  showLevelSelect(panel);

  assert.equal(panel.hidden, false);
});
