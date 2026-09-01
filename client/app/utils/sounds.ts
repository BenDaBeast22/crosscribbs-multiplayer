const placeSound = typeof Audio !== "undefined" ? new Audio("/sounds/card-place.mp3") : null;
const discardSound = typeof Audio !== "undefined" ? new Audio("/sounds/card-discard.mp3") : null;

const tickSound = typeof Audio !== "undefined" ? new Audio("/sounds/reveal-tick.mp3") : null;
const cribRevealSound = typeof Audio !== "undefined" ? new Audio("/sounds/crib-reveal.mp3") : null;
const winnerSound = typeof Audio !== "undefined" ? new Audio("/sounds/winner-fanfare.mp3") : null;
const raceLoopSound = typeof Audio !== "undefined" ? new Audio("/sounds/race-loop.mp3") : null;
const messageSent = typeof Audio !== "undefined" ? new Audio("/sounds/message-sent.m4a") : null;
const messageNotification = typeof Audio !== "undefined" ? new Audio("/sounds/message-notification.mp3") : null;

// emote sound effects
const thumbsUpSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/noice.m4a") : null;
const niceJobTeamSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/nice-job-team.mp3") : null;
const laughEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/laugh.m4a") : null;
const naniEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/nani.mp3") : null;
const angryEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/wryyy.mp3") : null;
const hmmmEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/hmmm.mp3") : null;
const hmmmFullEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/hmmm-full.mp3") : null;
const rollEyesEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/muda.mp3") : null;
const shushEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/shhh.mp3") : null;
const partyEmoteSound = typeof Audio !== "undefined" ? new Audio("/sounds/emotes/party.mp3") : null;

let discoActive = false;

const triggerDisco = () => {
  if (discoActive) return;
  discoActive = true;
  play(partyEmoteSound, 0.5);

  // Step 1: Wait 3 seconds, then enable disco mode for 5 seconds
  setTimeout(() => {
    document.body.classList.add("disco-mode");

    // Step 2: Keep disco active for 5 seconds, then remove it
    setTimeout(() => {
      document.body.classList.remove("disco-mode");
      discoActive = false;
    }, 7000);
  }, 1500);
};

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

export function playMessageSentSound() {
  play(messageSent, 1);
}

export function playMessageNotificationSound() {
  play(messageNotification, 0.5);
}

export function playEmoteSound(emote: string, randomNum: number) {
  switch (emote) {
    case "👍":
      if (randomNum < 0.5) {
        play(thumbsUpSound, 1);
      } else {
        play(niceJobTeamSound, 0.5);
      }
      break;
    case "😂":
      play(laughEmoteSound, 1);
      break;
    case "😮":
      play(naniEmoteSound, 0.5);
      break;
    case "😡":
      play(angryEmoteSound, 1);
      break;
    case "🤔":
      if (randomNum < 0.3) {
        play(hmmmFullEmoteSound, 0.6);
      } else {
        play(hmmmEmoteSound, 0.4);
      }
      break;
    case "🙄":
      play(rollEyesEmoteSound, 1);
      break;
    case "🤫":
      play(shushEmoteSound, 1);
      break;
    case "🎉":
      triggerDisco();
      // play(partyEmoteSound, 1);
      break;
  }
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
