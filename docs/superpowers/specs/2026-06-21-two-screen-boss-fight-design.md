# Two-Screen Boss Fight Design

## Goal

Split the game into two connected screens and make the boss fight more readable and avoidable.

## Design

The game keeps a single `game` object but changes `level` from one flat map into `screens`. `game.currentScreen` selects the active screen. Screen 0 contains the player spawn, platforms, and normal enemies. Screen 1 contains the boss arena. When the player exits screen 0 on the right edge, the game switches to screen 1 and places the player near the left edge. When the player exits screen 1 on the left edge, the game switches back to screen 0 and places the player near the right edge.

Enemies only update and render on their own screen. The boss only updates, damages, and renders on screen 1. Boss state persists when leaving and returning.

The boss height is reduced from 112 to 72 pixels while remaining grounded. The attack loop becomes predictable: the boss idles for 3 seconds, enters a 0.9 second windup with a strong visual warning, then charges for 0.55 seconds. After the charge, it returns to the 3 second idle interval. The warning is rendered as a red boss body plus a red ground lane in the charge direction so the player can jump over the lower boss body.

## Tests

Automated tests cover screen transitions, screen-scoped boss presence, boss height, and the idle-to-windup-to-charge timing. Existing combat, damage, victory, input, math, and text tests must keep passing.
