let warmedUp = false;

/**
 * Warm up the speech engine.
 * Must be called from a user gesture (click handler) to unlock
 * speechSynthesis in browsers that require user activation.
 */
export function warmUpSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis || warmedUp) return;

  // Some browsers need a non-empty utterance to actually unlock
  const utterance = new SpeechSynthesisUtterance(".");
  utterance.volume = 0.01;
  utterance.rate = 10; // speak fast so it's imperceptible
  window.speechSynthesis.speak(utterance);
  warmedUp = true;
}

/**
 * Speak a message using Web Speech API.
 * Respects mute state — caller should check before calling.
 */
export function speak(message: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Chrome has a bug where speechSynthesis stops working after ~15s of inactivity.
  // Calling cancel() before speak() works around it.
  window.speechSynthesis.cancel();

  // Wait for voices to load if needed
  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    // Voices not loaded yet — wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
    };
  }
}
