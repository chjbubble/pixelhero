import test from "node:test";
import assert from "node:assert/strict";
import { createActionState, readGamepadActions } from "../src/input.js";

test("createActionState returns all actions as false", () => {
  assert.deepEqual(createActionState(), {
    left: false,
    right: false,
    jump: false,
    attack: false,
    restart: false
  });
});

test("readGamepadActions maps standard buttons and dpad", () => {
  const gamepad = {
    axes: [0, 0],
    buttons: [
      { pressed: true },
      { pressed: false },
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
    restart: true
  });
});
