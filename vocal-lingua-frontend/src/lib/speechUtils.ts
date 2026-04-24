/**
 * Gabsther — Speech Utilities
 * ───────────────────────────────
 * Browser Web Speech API wrappers:
 * - SpeechRecognition: mic → text (STT)
 * - SpeechSynthesis: text → voice (TTS)
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecognitionOptions {
  language?: string;       // BCP-47 locale, e.g. 'fr-FR'
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface SynthesisOptions {
  language?: string;       // BCP-47 locale, e.g. 'fr-FR'
  rate?: number;           // 0.1 - 10, default 1
  pitch?: number;          // 0 - 2, default 1
  volume?: number;         // 0 - 1, default 1
  preferredVoiceName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature detection
// ─────────────────────────────────────────────────────────────────────────────

export function hasSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function hasSpeechSynthesis(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice cache — loaded once via voiceschanged event
// ─────────────────────────────────────────────────────────────────────────────

let _voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!hasSpeechSynthesis()) return resolve([]);

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _voicesCache = voices;
      return resolve(voices);
    }

    // On mobile (especially iOS/Android) voices load asynchronously
    const handler = () => {
      _voicesCache = window.speechSynthesis.getVoices();
      resolve(_voicesCache);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true });

    // Fallback: resolve empty after 2 s so we don't hang indefinitely
    setTimeout(() => resolve(_voicesCache), 2000);
  });
}

// Pre-load voices as soon as the module is imported (no user gesture needed)
if (typeof window !== 'undefined' && hasSpeechSynthesis()) {
  loadVoices();
}

// ─────────────────────────────────────────────────────────────────────────────
// Speech Recognition (STT)
// ─────────────────────────────────────────────────────────────────────────────

export class SpeechRecognizer {
  private recognition: any = null;
  private isListening = false;

  constructor(options: RecognitionOptions) {
    if (!hasSpeechRecognition()) return;

    const SpeechRecognitionAPI =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = options.language || 'fr-FR';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;

    this.recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t;
        } else {
          interimText += t;
        }
      }

      if (interimText) {
        options.onResult(finalText + interimText, false);
      } else if (finalText) {
        options.onResult(finalText, true);
      }
    };

    this.recognition.onerror = (event: any) => {
      options.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };
  }

  start() {
    if (!this.recognition || this.isListening) return;
    this.isListening = true;
    this.recognition.start();
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }

  abort() {
    this.recognition?.abort();
    this.isListening = false;
  }

  get listening() {
    return this.isListening;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Speech Synthesis (TTS)
// ─────────────────────────────────────────────────────────────────────────────

let iosResumeTimer: ReturnType<typeof setInterval> | null = null;

function clearIosTimer() {
  if (iosResumeTimer) {
    clearInterval(iosResumeTimer);
    iosResumeTimer = null;
  }
}

export function speak(
  text: string,
  options: SynthesisOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasSpeechSynthesis()) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }

    clearIosTimer();
    window.speechSynthesis.cancel();

    // 150ms gives iOS time to switch the audio session from record → playback.
    setTimeout(() => {
      // resume() right before speak() — iOS sometimes leaves synthesizer paused
      // after mic use; calling resume() here (not outside the timeout) ensures
      // it fires as close to the speak() call as possible.
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || 'fr-FR';
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      // Voice selection — use cached voices, fall back to default (safe on mobile)
      const voices = _voicesCache.length > 0
        ? _voicesCache
        : window.speechSynthesis.getVoices();

      const langPrefix = utterance.lang.split('-')[0];
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(langPrefix) &&
          (options.preferredVoiceName
            ? v.name.includes(options.preferredVoiceName)
            : true)
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        clearIosTimer();
        resolve();
      };

      utterance.onerror = (e) => {
        clearIosTimer();
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(e.error));
        }
      };

      // (utterance tracked by speechSynthesis internally)
      window.speechSynthesis.speak(utterance);

      // iOS Safari pauses speechSynthesis after ~15 s of inactivity.
      // Calling resume() every 10 s keeps it alive for long responses.
      iosResumeTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearIosTimer();
        }
      }, 10_000);
    }, 150);
  });
}

export function stopSpeaking() {
  clearIosTimer();
  if (hasSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (!hasSpeechSynthesis()) return false;
  return window.speechSynthesis.speaking;
}

/** Get available voices for a given language */
export function getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
  if (!hasSpeechSynthesis()) return [];
  const voices = _voicesCache.length > 0
    ? _voicesCache
    : window.speechSynthesis.getVoices();
  return voices.filter((v) => v.lang.startsWith(langCode));
}

/**
 * Warm up TTS — call this inside a user-gesture handler (button click) to
 * unlock audio on iOS Safari and Chrome Android before the async speak() call.
 *
 * IMPORTANT: Do NOT call cancel() after speak() here. The utterance must
 * actually start playing so the browser records a real "play within user
 * gesture" event. Chrome Android blocks future async speak() calls
 * (error: 'not-allowed') if the unlock utterance is cancelled before it plays.
 * The utterance is a single space at max rate — it completes in < 50 ms.
 */
export function initSpeechSynthesis() {
  if (!hasSpeechSynthesis()) return;
  loadVoices();
  // Use a real word — iOS needs onstart to fire (not just onend) to register
  // that speech synthesis was "started" within a user gesture. A space or
  // zero-width space may skip onstart entirely; a short word guarantees it.
  const u = new SpeechSynthesisUtterance('ok');
  u.volume = 0;
  u.rate = 10;
  window.speechSynthesis.speak(u);
}

/**
 * Unlock the Web Audio context — required on Chrome Android to allow any
 * audio playback (including speechSynthesis) outside a user gesture.
 * Call this inside the same gesture handler as initSpeechSynthesis().
 */
let _audioCtx: AudioContext | null = null;
export function unlockAudioContext() {
  if (typeof window === 'undefined') return;
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!_audioCtx) _audioCtx = new AC() as AudioContext;
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    // Play a 1-frame silent buffer to mark this AudioContext as "user activated"
    const buf = _audioCtx.createBuffer(1, 1, 22050);
    const src = _audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(_audioCtx.destination);
    src.start(0);
  } catch { /* ignore — not all browsers support AudioContext */ }
}
