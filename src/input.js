const pressedKeys = new Set();

export function createActionState() {
  return {
    left: false,
    right: false,
    jump: false,
    attack: false,
    restart: false
  };
}

export function installKeyboardListeners(target = window) {
  target.addEventListener("keydown", (event) => {
    pressedKeys.add(event.code);
  });
  target.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.code);
  });
}

export function readKeyboardActions() {
  return {
    left: pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft"),
    right: pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight"),
    jump: pressedKeys.has("KeyW") || pressedKeys.has("Space"),
    attack: pressedKeys.has("KeyJ"),
    restart: pressedKeys.has("KeyR")
  };
}

export function readGamepadActions(gamepad) {
  if (!gamepad) {
    return createActionState();
  }

  const axisX = gamepad.axes[0] ?? 0;
  const button = (index) => Boolean(gamepad.buttons[index]?.pressed);

  return {
    left: axisX < -0.35 || button(14),
    right: axisX > 0.35 || button(15),
    jump: button(0),
    attack: button(1) || button(2),
    restart: button(9)
  };
}

export function readActions() {
  const keyboard = readKeyboardActions();
  const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  const gamepad = Array.from(pads).find(Boolean);
  const pad = readGamepadActions(gamepad);

  return {
    left: keyboard.left || pad.left,
    right: keyboard.right || pad.right,
    jump: keyboard.jump || pad.jump,
    attack: keyboard.attack || pad.attack,
    restart: keyboard.restart || pad.restart
  };
}
