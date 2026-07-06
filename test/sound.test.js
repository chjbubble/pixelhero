import test from "node:test";
import assert from "node:assert/strict";
import { SOUND_PATHS, playSoundEvents } from "../src/sound.js";

test("sound paths point at requested wav files", () => {
  assert.equal(SOUND_PATHS.jump, "./assets/brackeys_platformer_assets/sounds/jump.wav");
  assert.equal(SOUND_PATHS.hurt, "./assets/brackeys_platformer_assets/sounds/hurt.wav");
  assert.equal(SOUND_PATHS.explosion, "./assets/brackeys_platformer_assets/sounds/explosion.wav");
  assert.equal(SOUND_PATHS.tap, "./assets/brackeys_platformer_assets/sounds/tap.wav");
});

test("playSoundEvents plays each queued event once and clears the queue", () => {
  const played = [];
  class FakeAudio {
    constructor(src) {
      this.src = src;
    }
    play() {
      played.push(this.src);
    }
  }
  const events = ["jump", "tap", "hurt"];

  playSoundEvents(events, FakeAudio);

  assert.deepEqual(played, [SOUND_PATHS.jump, SOUND_PATHS.tap, SOUND_PATHS.hurt]);
  assert.deepEqual(events, []);
});
