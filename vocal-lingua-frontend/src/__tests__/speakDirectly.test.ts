import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the speakDirectly pattern used in voice/page.tsx.
 *
 * speakDirectly must call speechSynthesis.speak() synchronously (no setTimeout)
 * so it runs inside the iOS user-gesture context. These tests verify the contract:
 *   1. cancel() called first (clears any queued utterance)
 *   2. speak() called synchronously with correct lang + rate
 *   3. onDone callback fires after onend
 *   4. onerror with 'interrupted'/'canceled' is swallowed (not thrown)
 *   5. onerror with real error logs but doesn't crash
 */

// Inline the speakDirectly logic (mirrors voice/page.tsx implementation)
function speakDirectly(
  text: string,
  synthesis: Pick<SpeechSynthesis, 'cancel' | 'speak'>,
  MakeUtterance: (t: string) => SpeechSynthesisUtterance,
  onDone?: () => void,
  onStateChange?: (s: 'speaking' | 'idle') => void
) {
  synthesis.cancel();
  const utterance = MakeUtterance(text);
  (utterance as any).lang = 'fr-FR';
  (utterance as any).rate = 0.9;
  utterance.onend = () => {
    onStateChange?.('idle');
    onDone?.();
  };
  utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
    onStateChange?.('idle');
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      console.error('TTS error:', e.error);
    }
  };
  onStateChange?.('speaking');
  synthesis.speak(utterance);
}

describe('speakDirectly', () => {
  let cancelMock: ReturnType<typeof vi.fn>;
  let speakMock: ReturnType<typeof vi.fn>;
  let utteranceRef: any;
  let synthesis: Pick<SpeechSynthesis, 'cancel' | 'speak'>;
  let MakeUtterance: (t: string) => SpeechSynthesisUtterance;

  beforeEach(() => {
    cancelMock = vi.fn();
    speakMock = vi.fn();
    synthesis = { cancel: cancelMock, speak: speakMock };
    MakeUtterance = (t: string) => {
      utteranceRef = { text: t, lang: '', rate: 1, onend: null, onerror: null };
      return utteranceRef as unknown as SpeechSynthesisUtterance;
    };
  });

  it('calls cancel() before speak() — always clears queue first', () => {
    const callOrder: string[] = [];
    cancelMock.mockImplementation(() => callOrder.push('cancel'));
    speakMock.mockImplementation(() => callOrder.push('speak'));

    speakDirectly('Bonjour', synthesis, MakeUtterance);

    expect(callOrder).toEqual(['cancel', 'speak']);
  });

  it('sets utterance lang to fr-FR', () => {
    speakDirectly('Bonjour', synthesis, MakeUtterance);
    expect(utteranceRef.lang).toBe('fr-FR');
  });

  it('sets utterance rate to 0.9', () => {
    speakDirectly('Bonjour', synthesis, MakeUtterance);
    expect(utteranceRef.rate).toBe(0.9);
  });

  it('transitions state to speaking synchronously', () => {
    const stateChanges: string[] = [];
    speakDirectly('Bonjour', synthesis, MakeUtterance, undefined, (s) => stateChanges.push(s));
    expect(stateChanges).toContain('speaking');
  });

  it('calls onDone and sets state to idle when onend fires', () => {
    const onDone = vi.fn();
    const stateChanges: string[] = [];
    speakDirectly('Bonjour', synthesis, MakeUtterance, onDone, (s) => stateChanges.push(s));

    utteranceRef.onend?.();

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(stateChanges).toContain('idle');
  });

  it('swallows "interrupted" error silently', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const stateChanges: string[] = [];
    speakDirectly('test', synthesis, MakeUtterance, undefined, (s) => stateChanges.push(s));

    utteranceRef.onerror?.({ error: 'interrupted' });

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(stateChanges).toContain('idle');
    consoleSpy.mockRestore();
  });

  it('swallows "canceled" error silently', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    speakDirectly('test', synthesis, MakeUtterance);
    utteranceRef.onerror?.({ error: 'canceled' });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('logs unexpected errors but does not throw', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    speakDirectly('test', synthesis, MakeUtterance);
    expect(() => utteranceRef.onerror?.({ error: 'synthesis-failed' })).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('TTS error:', 'synthesis-failed');
    consoleSpy.mockRestore();
  });

  it('speak() is called exactly once per invocation (no double-queue)', () => {
    speakDirectly('Bonjour', synthesis, MakeUtterance);
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('passes the provided text to the utterance', () => {
    speakDirectly('Au revoir', synthesis, MakeUtterance);
    expect(utteranceRef.text).toBe('Au revoir');
  });
});
