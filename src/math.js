export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getCameraX(playerX, playerW, mapWidth, viewWidth) {
  const target = playerX + playerW / 2 - viewWidth / 2;
  return clamp(target, 0, Math.max(0, mapWidth - viewWidth));
}
