let serverReady = false;

export async function ensureServerReady() {
  if (serverReady) return;
  await fetch(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");
  serverReady = true;
}
