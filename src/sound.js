export const SOUND_PATHS = {
  jump: "./assets/brackeys_platformer_assets/sounds/jump.wav",
  hurt: "./assets/brackeys_platformer_assets/sounds/hurt.wav",
  explosion: "./assets/brackeys_platformer_assets/sounds/explosion.wav",
  tap: "./assets/brackeys_platformer_assets/sounds/tap.wav"
};

export function playSoundEvents(events, AudioCtor = Audio) {
  for (const event of events.splice(0)) {
    const path = SOUND_PATHS[event];
    if (!path) continue;
    const audio = new AudioCtor(path);
    audio.loop = false;
    audio.play()?.catch?.(() => {});
  }
}
