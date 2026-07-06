const pressedKeys = new Set();
const touchActions = createActionState();

export function createActionState() {
  return {
    left: false,
    right: false,
    jump: false,
    attack: false,
    shoot: false,
    restart: false
  };
}

export function installTouchControls(root = document) {
  const stick = root.querySelector("[data-touch-stick]");
  const knob = root.querySelector("[data-touch-knob]");

  root.querySelectorAll("[data-touch-action]").forEach((button) => {
    const action = button.dataset.touchAction;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault?.();
      button.setPointerCapture?.(event.pointerId);
      touchActions[action] = true;
    });
    button.addEventListener("pointerup", () => {
      touchActions[action] = false;
    });
    button.addEventListener("pointercancel", () => {
      touchActions[action] = false;
    });
  });

  if (!stick) {
    return;
  }

  const move = (event) => {
    event.preventDefault?.();
    const box = stick.getBoundingClientRect();
    const dx = event.clientX - box.left - box.width / 2;
    const dy = event.clientY - box.top - box.height / 2;
    const length = Math.hypot(dx, dy) || 1;
    const radius = box.width * 0.28;
    const scale = Math.min(radius, length) / length;
    touchActions.left = dx < -box.width * 0.18;
    touchActions.right = dx > box.width * 0.18;
    if (knob) {
      knob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
    }
  };

  const reset = () => {
    touchActions.left = false;
    touchActions.right = false;
    if (knob) {
      knob.style.transform = "";
    }
  };

  stick.addEventListener("pointerdown", (event) => {
    stick.setPointerCapture?.(event.pointerId);
    move(event);
  });
  stick.addEventListener("pointermove", move);
  stick.addEventListener("pointerup", reset);
  stick.addEventListener("pointercancel", reset);
}

export function readTouchActions() {
  return { ...touchActions };
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
    shoot: pressedKeys.has("KeyK"),
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
    attack: button(1),
    shoot: button(2) || button(3),
    restart: button(9)
  };
}

export function readActions() {
  const keyboard = readKeyboardActions();
  const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  const gamepad = Array.from(pads).find(Boolean);
  const pad = readGamepadActions(gamepad);
  const touch = readTouchActions();

  return {
    left: keyboard.left || pad.left || touch.left,
    right: keyboard.right || pad.right || touch.right,
    jump: keyboard.jump || pad.jump || touch.jump,
    attack: keyboard.attack || pad.attack || touch.attack,
    shoot: keyboard.shoot || pad.shoot || touch.shoot,
    restart: keyboard.restart || pad.restart || touch.restart
  };
}
