let serverReady = false;

export async function ensureServerReady() {
  if (serverReady) return;
  await fetch("/health"); // hits your own /health route, same-origin
  serverReady = true;
}