import test from "node:test";
import assert from "node:assert/strict";
import { clamp, rectsOverlap } from "../src/math.js";

test("rectsOverlap returns true for intersecting rectangles", () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 10, y: 10, w: 20, h: 20 }), true);
});

test("rectsOverlap returns false when rectangles only touch edges", () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 20, y: 0, w: 20, h: 20 }), false);
});

test("clamp keeps values inside bounds", () => {
  assert.equal(clamp(12, 0, 10), 10);
  assert.equal(clamp(-2, 0, 10), 0);
  assert.equal(clamp(6, 0, 10), 6);
});
