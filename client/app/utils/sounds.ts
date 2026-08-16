const placeSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/card-place.mp3") : null;
const discardSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/card-discard.mp3") : null;

const tickSound = typeof Audio !== "undefined" ? new Audio("/sounds/reveal-tick.mp3") : null;
const cribRevealSound = typeof Audio !== "undefined" ? new Audio("/sounds/crib-reveal.mp3") : null;
const winnerSound = typeof Audio !== "undefined" ? new Audio("/sounds/winner-fanfare.mp3") : null;
const raceLoopSound = typeof Audio !== "undefined" ? new Audio("/sounds/race-loop.mp3") : null;
if (raceLoopSound) raceLoopSound.loop = true;


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

export function playRevealTickSound() {
  play(tickSound, 0.5);
}

export function playCribRevealSound() {
  play(cribRevealSound, 0.5);
}

export function playWinnerSound() {
  play(winnerSound, 0.6);
}

export function startRaceLoopSound() {
  if (!raceLoopSound) return;
  raceLoopSound.currentTime = 0;
  raceLoopSound.volume = 0.3;
  raceLoopSound.play().catch(() => {});
}

export function stopRaceLoopSound() {
  if (!raceLoopSound) return;
  raceLoopSound.pause();
  raceLoopSound.currentTime = 0;
}