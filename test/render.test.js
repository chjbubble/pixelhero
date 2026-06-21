import test from "node:test";
import assert from "node:assert/strict";
import { getBossPose, getEnemyPose, getPlayerPose } from "../src/render.js";

test("player pose reflects movement and airborne states", () => {
  assert.equal(getPlayerPose({ vx: 0, vy: 0, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }).state, "idle");
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0, invuln: 0, jumpsUsed: 0 }).state, "run");
  assert.equal(getPlayerPose({ vx: 0, vy: -120, grounded: false, attackTimer: 0, invuln: 0, jumpsUsed: 1 }).state, "jump");
  assert.equal(getPlayerPose({ vx: 0, vy: -120, grounded: false, attackTimer: 0, invuln: 0, jumpsUsed: 2 }).state, "double-jump");
});

test("player attack and hurt poses take priority", () => {
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0.1, invuln: 0, jumpsUsed: 0 }).state, "attack");
  assert.equal(getPlayerPose({ vx: 120, vy: 0, grounded: true, attackTimer: 0, invuln: 0.5, jumpsUsed: 0 }).flash, true);
});

test("enemy pose reflects patrol direction and hit flash", () => {
  assert.deepEqual(getEnemyPose({ vx: -70, invuln: 0 }), { facing: -1, flash: false });
  assert.deepEqual(getEnemyPose({ vx: 70, invuln: 0.1 }), { facing: 1, flash: true });
});

test("boss pose reflects attack phase", () => {
  assert.deepEqual(getBossPose({ phase: "idle", chargeDirection: -1 }), { state: "idle", facing: -1, warning: false });
  assert.deepEqual(getBossPose({ phase: "windup", chargeDirection: 1 }), { state: "windup", facing: 1, warning: true });
  assert.deepEqual(getBossPose({ phase: "charge", chargeDirection: -1 }), { state: "charge", facing: -1, warning: false });
});
