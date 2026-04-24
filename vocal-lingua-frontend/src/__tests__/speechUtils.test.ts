import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasSpeechRecognition,
  hasSpeechSynthesis,
  initSpeechSynthesis,
  speak,
  stopSpeaking,
  getVoicesForLanguage,
} from '../lib/speechUtils';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset synthesis state
  (window.speechSynthesis.cancel as ReturnType<typeof vi.fn>).mockClear();
  (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mockClear();
  (window.speechSynthesis.resume as ReturnType<typeof vi.fn>).mockClear();
});

// ── Feature detection ─────────────────────────────────────────────────────────

describe('hasSpeechRecognition', () => {
  it('returns true when webkitSpeechRecognition is present', () => {
    expect(hasSpeechRecognition()).toBe(true);
  });

  it('returns false when neither API is present', () => {
    const orig = (window as any).webkitSpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    delete (window as any).SpeechRecognition;
    expect(hasSpeechRecognition()).toBe(false);
    (window as any).webkitSpeechRecognition = orig;
  });
});

describe('hasSpeechSynthesis', () => {
  it('returns true when speechSynthesis is present', () => {
    expect(hasSpeechSynthesis()).toBe(true);
  });
});

// ── initSpeechSynthesis ───────────────────────────────────────────────────────

describe('initSpeechSynthesis', () => {
  it('queues a silent unlock utterance (does NOT cancel immediately)', () => {
    initSpeechSynthesis();
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    // Must NOT call cancel() — that would kill the unlock utterance before onend
    expect(window.speechSynthesis.cancel).not.toHaveBeenCalled();
  });

  it('uses volume 0 so the user hears nothing', () => {
    initSpeechSynthesis();
    const utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(utterance.volume).toBe(0);
  });

  it('uses a fast rate so the utterance completes before the mic starts', () => {
    initSpeechSynthesis();
    const utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(utterance.rate).toBeGreaterThanOrEqual(5);
  });
});

// ── speak ─────────────────────────────────────────────────────────────────────

describe('speak', () => {
  it('calls cancel() then resume() then speak() with the text', async () => {
    const promise = speak('Bonjour', { language: 'fr-FR' });
    // Let the 150ms timeout run
    await vi.waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    }, { timeout: 500 });
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.resume).toHaveBeenCalled();
    const utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(utterance.lang).toBe('fr-FR');
    await promise;
  });

  it('resolves when onend fires', async () => {
    const result = speak('Salut');
    await expect(result).resolves.toBeUndefined();
  });

  it('resolves (not rejects) when onerror fires with "interrupted"', async () => {
    (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mockImplementationOnce((u) => {
      setTimeout(() => u.onerror?.({ error: 'interrupted' }), 10);
    });
    await expect(speak('test')).resolves.toBeUndefined();
  });

  it('resolves (not rejects) when onerror fires with "canceled"', async () => {
    (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mockImplementationOnce((u) => {
      setTimeout(() => u.onerror?.({ error: 'canceled' }), 10);
    });
    await expect(speak('test')).resolves.toBeUndefined();
  });

  it('rejects when onerror fires with an unexpected error', async () => {
    (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mockImplementationOnce((u) => {
      setTimeout(() => u.onerror?.({ error: 'synthesis-failed' }), 10);
    });
    await expect(speak('test')).rejects.toThrow('synthesis-failed');
  });
});

// ── stopSpeaking ──────────────────────────────────────────────────────────────

describe('stopSpeaking', () => {
  it('calls speechSynthesis.cancel()', () => {
    stopSpeaking();
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });
});

// ── getVoicesForLanguage ──────────────────────────────────────────────────────

describe('getVoicesForLanguage', () => {
  it('returns voices matching the language prefix', () => {
    const voices = getVoicesForLanguage('fr');
    expect(voices).toHaveLength(1);
    expect(voices[0].lang).toBe('fr-FR');
  });

  it('returns empty array for unsupported language', () => {
    const voices = getVoicesForLanguage('ja');
    expect(voices).toHaveLength(0);
  });
});
