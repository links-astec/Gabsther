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

    // Small delay after cancel — required on some mobile browsers
    setTimeout(() => {
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
    }, 50);
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
 * unlock audio on iOS Safari before the first async speak() call.
 */
export function initSpeechSynthesis() {
  if (!hasSpeechSynthesis()) return;
  // Trigger voice loading
  loadVoices();
  // Play a silent utterance to unlock the audio context on iOS
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  window.speechSynthesis.cancel();
}
