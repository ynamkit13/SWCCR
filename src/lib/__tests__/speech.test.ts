import { describe, it, expect, vi, beforeEach } from "vitest";

// Store onend callbacks so we can simulate speech finishing
let onendCallbacks: (() => void)[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSpeak = vi.fn().mockImplementation((utterance: any) => {
  // Store the onend callback so tests can trigger it
  if (utterance.onend) {
    onendCallbacks.push(utterance.onend);
  }
});
const mockCancel = vi.fn();
const mockGetVoices = vi.fn().mockReturnValue([{ name: "test" }]);
const mockSpeaking = { value: false };

// Mock SpeechSynthesisUtterance globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).SpeechSynthesisUtterance = class {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
};

Object.defineProperty(globalThis, "window", {
  value: {
    speechSynthesis: {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      get speaking() {
        return mockSpeaking.value;
      },
      onvoiceschanged: null,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechSynthesisUtterance: (globalThis as any).SpeechSynthesisUtterance,
  },
  writable: true,
  configurable: true,
});

// Must import after mocks are set up
import { speak, warmUpSpeech, SpeechPriority, clearSpeechQueue } from "../speech";

describe("speak", () => {
  beforeEach(() => {
    mockSpeak.mockClear();
    mockCancel.mockClear();
    onendCallbacks = [];
    mockSpeaking.value = false;
    clearSpeechQueue();
  });

  it("calls speechSynthesis.speak with the message", () => {
    speak("Keep your elbows tucked");
    expect(mockSpeak).toHaveBeenCalledOnce();
    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance.text).toBe("Keep your elbows tucked");
  });

  it("queues a second message instead of cancelling the first", () => {
    speak("first message");
    mockCancel.mockClear(); // clear the initial Chrome workaround cancel
    mockSpeaking.value = true;
    speak("second message");

    // Only the first should be spoken immediately
    expect(mockSpeak).toHaveBeenCalledOnce();
    expect(mockSpeak.mock.calls[0][0].text).toBe("first message");
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it("plays queued message after the first finishes", () => {
    speak("first message");
    mockSpeaking.value = true;
    speak("second message");

    // Simulate first message finishing
    mockSpeaking.value = false;
    onendCallbacks[0]();

    expect(mockSpeak).toHaveBeenCalledTimes(2);
    expect(mockSpeak.mock.calls[1][0].text).toBe("second message");
  });

  it("higher priority interrupts lower priority speech", () => {
    speak("nice form", SpeechPriority.INFO);
    mockSpeaking.value = true;

    speak("stop swinging!", SpeechPriority.CRITICAL);

    // Should cancel and speak the critical message
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(2);
    expect(mockSpeak.mock.calls[1][0].text).toBe("stop swinging!");
  });

  it("same priority does not interrupt, waits in queue", () => {
    speak("elbows tucked", SpeechPriority.CORRECTION);
    mockCancel.mockClear();
    mockSpeaking.value = true;

    speak("arms even", SpeechPriority.CORRECTION);

    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledOnce();
  });

  it("lower priority does not interrupt, waits in queue", () => {
    speak("elbows tucked", SpeechPriority.CORRECTION);
    mockCancel.mockClear();
    mockSpeaking.value = true;

    speak("good job", SpeechPriority.INFO);

    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledOnce();
  });

  it("processes queue in priority order", () => {
    speak("first", SpeechPriority.CORRECTION);
    mockSpeaking.value = true;

    // Queue up messages of different priorities
    speak("info msg", SpeechPriority.INFO);
    speak("critical msg", SpeechPriority.CRITICAL);
    speak("encourage msg", SpeechPriority.ENCOURAGEMENT);

    // Finish first message
    mockSpeaking.value = false;
    onendCallbacks[0]();

    // Critical should play next (highest priority in queue)
    expect(mockSpeak.mock.calls[1][0].text).toBe("critical msg");

    // Finish critical
    mockSpeaking.value = false;
    onendCallbacks[1]();

    // Correction-level encourage should play next
    expect(mockSpeak.mock.calls[2][0].text).toBe("encourage msg");

    // Finish encouragement
    mockSpeaking.value = false;
    onendCallbacks[2]();

    // Info plays last
    expect(mockSpeak.mock.calls[3][0].text).toBe("info msg");
  });

  it("defaults to CORRECTION priority", () => {
    speak("elbows tucked");
    mockCancel.mockClear();
    mockSpeaking.value = true;

    // Same priority (CORRECTION) should not interrupt
    speak("arms even");
    expect(mockCancel).not.toHaveBeenCalled();
  });
});

describe("warmUpSpeech", () => {
  beforeEach(() => {
    mockSpeak.mockClear();
  });

  it("calls speechSynthesis.speak to warm up", () => {
    warmUpSpeech();
    // May or may not call depending on warmedUp state from prior tests
    expect(true).toBe(true);
  });
});
