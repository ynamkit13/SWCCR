let warmedUp = false;

/**
 * Warm up the speech engine with a silent utterance.
 * Must be called from a user gesture (click handler) to unlock
 * speechSynthesis in browsers that require user activation.
 */
export function warmUpSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis || warmedUp) return;

  const utterance = new SpeechSynthesisUtterance("");
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
  warmedUp = true;
}

/**
 * Speak a message using Web Speech API.
 * Respects mute state — caller should check before calling.
 */
export function speak(message: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}
