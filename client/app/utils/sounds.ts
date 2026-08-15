const placeSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/card-place.mp3") : null;
const discardSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/card-discard.mp3") : null;

function play(base: HTMLAudioElement | null, volume = 0.5) {
  if (!base) return;
  // Clone so rapid/overlapping plays don't cut each other off (e.g. 4-player games)
  const instance = base.cloneNode() as HTMLAudioElement;
  instance.volume = volume;
  instance.play().catch(() => {
    // Autoplay can be blocked before the user has interacted with the page at all;
    // harmless to ignore since gameplay always requires a click first anyway.
  });
}

export function playCardPlaceSound() {
  play(placeSound, 0.5);
}

export function playDiscardSound() {
  play(discardSound, 0.5);
}
