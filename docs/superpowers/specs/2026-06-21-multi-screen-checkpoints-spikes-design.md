# Multi-Screen Checkpoints And Spikes Design

## Goal

Turn the current short two-screen game into a five-screen level with checkpoints and spike hazards.

## Design

The level remains data-driven through `src/levels.js`. `level.screens` expands to five screens. Screens 0-3 are traversal and combat rooms, while screen 4 is the boss arena. Each screen owns `platforms`, `enemies`, `spikes`, and `checkpoints`.

The existing left/right screen transition behavior continues, generalized for all screens. Moving past the right edge advances one screen and places the player near the left edge. Moving past the left edge returns one screen and places the player near the right edge. The first and last screens clamp at the outside edges.

Checkpoints are small world rectangles. Touching one stores `{ screen, x, y }` in `game.checkpoint` and marks it active. When the player loses and presses restart, the game resets world state but respawns the player at the last checkpoint with full HP. If no checkpoint has been touched, restart uses the original spawn.

Spikes are hazards on the active screen. Touching spikes damages the player for 1 HP, applies the existing invulnerability window, and knocks the player upward. Spikes never drain HP every frame because they reuse the player invulnerability gate.

Rendering adds simple pixel flags for checkpoints and triangular/zigzag spike blocks.

## Tests

Automated tests cover five-screen data, repeated screen transitions, checkpoint activation, checkpoint restart, spike damage, and spike invulnerability behavior.
