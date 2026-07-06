import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("portrait layout places touch controls below the game canvas", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /@media\s*\(orientation:\s*portrait\)/);
  assert.match(css, /body\s*{[^}]*place-items:\s*center/s);
  assert.match(css, /\.game-shell\s*{[^}]*width:\s*min\(100vw,\s*430px\)/s);
  assert.match(css, /\.game-shell\s*{[^}]*grid-template-rows:\s*auto\s+220px/s);
  assert.match(css, /\.touch-controls\s*{[^}]*position:\s*relative/s);
  assert.match(css, /\.touch-controls\s*{[^}]*height:\s*220px/s);
});
