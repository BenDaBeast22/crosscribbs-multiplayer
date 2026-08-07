let serverReady = false;

export async function ensureServerReady(maxAttempts = 15, delayMs = 2000) {
  if (serverReady) return;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch("/health");
      if (res.ok) {
        serverReady = true;
        return;
      }
    } catch {
      // network error / connection refused during cold start — retry
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Server did not become ready in time");
}