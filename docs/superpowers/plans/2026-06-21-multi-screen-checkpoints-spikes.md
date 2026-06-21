# Multi-Screen Checkpoints And Spikes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the game to a five-screen level with checkpoint respawning and spike hazards.

**Architecture:** Keep the existing ES module structure. Extend level screen data with `spikes` and `checkpoints`, generalize screen transitions in `entities.js`, add checkpoint-aware restart in `main.js`, and render hazards/checkpoints in `render.js`.

**Tech Stack:** HTML Canvas 2D, vanilla JavaScript ES modules, Node `node:test`.

---

## Task 1: Five-Screen Level

**Files:**
- Modify: `src/levels.js`
- Modify: `src/entities.js`
- Modify: `test/entities.test.js`

- [ ] Write failing tests for five screens and repeated right-edge transitions.
- [ ] Expand `level.screens` to five screen records.
- [ ] Generalize transition logic across all screens.
- [ ] Verify with `npm test -- test/entities.test.js`.

## Task 2: Checkpoints

**Files:**
- Modify: `src/entities.js`
- Modify: `src/main.js`
- Modify: `test/entities.test.js`

- [ ] Write failing tests for checkpoint activation and restart.
- [ ] Add checkpoint state to `game`.
- [ ] Add `restartGame(game)` that respawns at the last checkpoint.
- [ ] Wire restart in `main.js`.
- [ ] Verify with `npm test`.

## Task 3: Spikes And Rendering

**Files:**
- Modify: `src/levels.js`
- Modify: `src/entities.js`
- Modify: `src/render.js`
- Modify: `test/entities.test.js`

- [ ] Write failing tests for spike damage and invulnerability.
- [ ] Add spike data to screens.
- [ ] Apply spike damage through existing invulnerability.
- [ ] Draw checkpoints and spikes with pixel blocks.
- [ ] Verify with `npm test` and browser entry request.
