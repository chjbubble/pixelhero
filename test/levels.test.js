import test from "node:test";
import assert from "node:assert/strict";
import { createLevel, getPitRanges, spikeOverlapsPit } from "../src/levels.js";

test("spikes never overlap generated pit gaps", () => {
  for (let chapterIndex = 0; chapterIndex < 4; chapterIndex += 1) {
    const level = createLevel(chapterIndex);
    const pits = getPitRanges(level.worldMap.platforms);

    for (const spike of level.worldMap.spikes) {
      assert.equal(
        spikeOverlapsPit(spike, pits),
        false,
        `chapter ${chapterIndex} spike ${spike.x}-${spike.x + spike.w} overlaps a pit`
      );
    }
  }
});

test("third chapter boss arena has no fixed spikes", () => {
  const level = createLevel(2);

  assert.deepEqual(level.bossScreen.spikes, []);
});

test("fourth chapter is the alien spaceship", () => {
  const level = createLevel(3);

  assert.equal(level.theme, "spaceship");
  assert.equal(level.enemyKind, "spaceAlien");
  assert.equal(level.boss.kind, "spaceBoss");
  assert.equal(level.boss.attack, "minions");
});
