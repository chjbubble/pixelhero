import test from "node:test";
import assert from "node:assert/strict";
import { createActionState, installTouchControls, readGamepadActions, readTouchActions } from "../src/input.js";

test("createActionState returns all actions as false", () => {
  assert.deepEqual(createActionState(), {
    left: false,
    right: false,
    jump: false,
    attack: false,
    shoot: false,
    restart: false
  });
});

test("readGamepadActions maps standard buttons and dpad", () => {
  const gamepad = {
    axes: [0, 0],
    buttons: [
      { pressed: true },
      { pressed: true },
      { pressed: true },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: true },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: true },
      { pressed: false }
    ]
  };

  assert.deepEqual(readGamepadActions(gamepad), {
    left: true,
    right: false,
    jump: true,
    attack: true,
    shoot: true,
    restart: true
  });
});

test("readGamepadActions accepts alternate left face button for arrows", () => {
  const gamepad = {
    axes: [0, 0],
    buttons: [
      { pressed: false },
      { pressed: false },
      { pressed: false },
      { pressed: true }
    ]
  };

  assert.equal(readGamepadActions(gamepad).shoot, true);
});

test("touch controls map joystick and action buttons", () => {
  const makeElement = (rect) => ({
    listeners: {},
    style: {},
    dataset: {},
    getBoundingClientRect: () => rect,
    setPointerCapture: () => {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    }
  });
  const stick = makeElement({ left: 0, top: 0, width: 100, height: 100 });
  const action = makeElement({});
  action.dataset.touchAction = "jump";
  const root = {
    querySelector: () => stick,
    querySelectorAll: () => [action]
  };

  installTouchControls(root);
  stick.listeners.pointerdown({ pointerId: 1, clientX: 90, clientY: 50 });
  assert.equal(readTouchActions().right, true);

  stick.listeners.pointerup();
  assert.equal(readTouchActions().right, false);

  action.listeners.pointerdown({ pointerId: 1, clientX: 0, clientY: 0 });
  assert.equal(readTouchActions().jump, true);
});
