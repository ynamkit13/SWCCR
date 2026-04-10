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
