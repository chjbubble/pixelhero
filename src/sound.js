export const SOUND_PATHS = {
  jump: "./assets/brackeys_platformer_assets/sounds/jump.wav",
  hurt: "./assets/brackeys_platformer_assets/sounds/hurt.wav",
  explosion: "./assets/brackeys_platformer_assets/sounds/explosion.wav",
  tap: "./assets/brackeys_platformer_assets/sounds/tap.wav"
};

const audioByCtor = new WeakMap();

function getAudio(event, AudioCtor) {
  let audioByEvent = audioByCtor.get(AudioCtor);
  if (!audioByEvent) {
    audioByEvent = new Map();
    audioByCtor.set(AudioCtor, audioByEvent);
  }
  if (!audioByEvent.has(event)) {
    const audio = new AudioCtor(SOUND_PATHS[event]);
    audio.loop = false;
    audio.preload = "auto";
    audio.load?.();
    audioByEvent.set(event, audio);
  }
  return audioByEvent.get(event);
}

export function preloadSounds(AudioCtor = Audio) {
  for (const event of Object.keys(SOUND_PATHS)) getAudio(event, AudioCtor);
}

export function playSoundEvents(events, AudioCtor = Audio) {
  for (const event of events.splice(0)) {
    if (!SOUND_PATHS[event]) continue;
    const audio = getAudio(event, AudioCtor);
    audio.currentTime = 0;
    audio.play()?.catch?.(() => {});
  }
}
