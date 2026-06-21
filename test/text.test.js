import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const userFacingFiles = ["README.md", "index.html", "src/render.js"];
const mojibakePatterns = ["鍍", "涓", "绋", "澶", "鑳", "鎸?", "€"];

test("user-facing Chinese text is readable", () => {
  const combinedText = userFacingFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  for (const pattern of mojibakePatterns) {
    assert.equal(combinedText.includes(pattern), false, `Found mojibake pattern: ${pattern}`);
  }

  assert.match(combinedText, /像素勇者/);
  assert.match(combinedText, /失败 - 按 R 或 Start 重开/);
  assert.match(combinedText, /胜利 - 按 R 或 Start 重开/);
});
