# Two-Screen Boss Fight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two connected screens and make the boss fight slower, shorter, and clearly telegraphed.

**Architecture:** Extend `src/levels.js` to expose screen data. Keep world state in `src/entities.js`, with `currentScreen` selecting active platforms and enemies. Render only the active screen and draw a clear boss windup warning.

**Tech Stack:** Vanilla JavaScript ES modules, Canvas 2D, Node built-in `node:test`.

---

## Task 1: Two-Screen Level State

**Files:**
- Modify: `src/levels.js`
- Modify: `src/entities.js`
- Modify: `test/entities.test.js`

- [ ] Write failing tests for right-edge and left-edge screen transitions.
- [ ] Add `screens` to level data.
- [ ] Add `currentScreen`, screen-scoped enemies, and transition handling.
- [ ] Run `npm test`.

## Task 2: Boss Arena Timing

**Files:**
- Modify: `src/entities.js`
- Modify: `test/entities.test.js`

- [ ] Write failing tests for boss height and 3 second idle before windup.
- [ ] Move boss to screen 1 only.
- [ ] Reduce boss height to 72 and anchor it to the ground.
- [ ] Replace proximity-triggered boss attack with idle, windup, charge timing.
- [ ] Run `npm test`.

## Task 3: Rendering Polish

**Files:**
- Modify: `src/render.js`

- [ ] Render active screen platforms and enemies only.
- [ ] Render boss only on screen 1.
- [ ] Draw a strong windup lane warning during boss windup.
- [ ] Run `npm test`.
- [ ] Start or reuse local server and verify the page loads.
