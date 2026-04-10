let warmedUp = false;

/**
 * Speech priority tiers (lower number = higher priority).
 * Higher priority messages interrupt lower priority ones.
 * Same or lower priority messages queue up and wait.
 */
export enum SpeechPriority {
  CRITICAL = 0, // Safety concerns — "stop swinging!"
  CORRECTION = 1, // Form corrections — "keep elbows tucked"
  ENCOURAGEMENT = 2, // Positive feedback — "great form!"
  INFO = 3, // General info — rep counts, transitions
}

type QueuedMessage = {
  text: string;
  priority: SpeechPriority;
};

let queue: QueuedMessage[] = [];
let currentPriority: SpeechPriority | null = null;

/**
 * Clear the speech queue and reset state.
 * Useful for test cleanup or when ending a workout.
 */
export function clearSpeechQueue(): void {
  queue = [];
  currentPriority = null;
}

/**
 * Warm up the speech engine.
 * Must be called from a user gesture (click handler) to unlock
 * speechSynthesis in browsers that require user activation.
 */
export function warmUpSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis || warmedUp) return;

  const utterance = new SpeechSynthesisUtterance(".");
  utterance.volume = 0.01;
  utterance.rate = 10;
  window.speechSynthesis.speak(utterance);
  warmedUp = true;
}

function processQueue(): void {
  if (queue.length === 0) {
    currentPriority = null;
    return;
  }

  // Sort by priority (lower number = higher priority)
  queue.sort((a, b) => a.priority - b.priority);
  const next = queue.shift()!;
  speakNow(next.text, next.priority);
}

function speakNow(message: string, priority: SpeechPriority): void {
  currentPriority = priority;

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => processQueue();
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
    };
  }
}

/**
 * Speak a message using Web Speech API with priority queuing.
 * - Higher priority messages interrupt lower priority speech.
 * - Same or lower priority messages wait in queue.
 * - Queue is processed in priority order (highest first).
 */
export function speak(
  message: string,
  priority: SpeechPriority = SpeechPriority.CORRECTION,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const isSpeaking = window.speechSynthesis.speaking;

  if (!isSpeaking) {
    // Nothing playing — speak immediately
    // Cancel first to work around Chrome's ~15s inactivity bug
    window.speechSynthesis.cancel();
    speakNow(message, priority);
    return;
  }

  // Something is currently playing
  if (currentPriority !== null && priority < currentPriority) {
    // Higher priority — interrupt current speech
    window.speechSynthesis.cancel();
    speakNow(message, priority);
  } else {
    // Same or lower priority — add to queue
    queue.push({ text: message, priority });
  }
}
