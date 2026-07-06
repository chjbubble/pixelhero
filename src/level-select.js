export function formatLevelName(name) {
  return Array.from(name).reduce((text, char, index) => text + (index > 0 && index % 2 === 0 ? "\n" : "") + char, "");
}

export function showLevelSelect(panel) {
  panel.hidden = false;
}

export function installLevelSelect(panel, levels, onSelect) {
  const buttons = levels.map((level) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-select-button";
    button.textContent = formatLevelName(level.name);
    button.addEventListener("click", () => {
      panel.hidden = true;
      onSelect(level.index);
    });
    return button;
  });

  panel.replaceChildren(...buttons);
  showLevelSelect(panel);
}
