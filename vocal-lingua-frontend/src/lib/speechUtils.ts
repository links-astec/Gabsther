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
// Speech Recognition (STT)
// ─────────────────────────────────────────────────────────────────────────────

export class SpeechRecognizer {
  private recognition: any = null;
  private isListening = false;

  constructor(private options: RecognitionOptions) {
    if (!hasSpeechRecognition()) return;

    const SpeechRecognitionAPI =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = options.language || 'fr-FR';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;

    this.recognition.onresult = (event: any) => {
      // Build the full running transcript from ALL results, not just the last one.
      // This means mid-sentence corrections are reflected in the live display.
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
        // Still in-progress — show the complete picture (final + current interim)
        options.onResult(finalText + interimText, false);
      } else if (finalText) {
        // Every segment is final — pass the whole thing
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

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(
  text: string,
  options: SynthesisOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasSpeechSynthesis()) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.language || 'fr-FR';
    utterance.rate = options.rate || 0.9;      // Slightly slower for learners
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Try to find a native French voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith(utterance.lang.split('-')[0]) &&
        (options.preferredVoiceName
          ? v.name.includes(options.preferredVoiceName)
          : true)
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // 'interrupted' means cancel() was called intentionally — treat as clean stop
      if (e.error === 'interrupted' || e.error === 'canceled') {
        resolve();
      } else {
        reject(new Error(e.error));
      }
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (hasSpeechSynthesis()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (!hasSpeechSynthesis()) return false;
  return window.speechSynthesis.speaking;
}

/** Get available voices for a given language */
export function getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
  if (!hasSpeechSynthesis()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith(langCode));
}

/** Warm up TTS (Chrome requires a user gesture to init voices) */
export function initSpeechSynthesis() {
  if (!hasSpeechSynthesis()) return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  window.speechSynthesis.cancel();
}
