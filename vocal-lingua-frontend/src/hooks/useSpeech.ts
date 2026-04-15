'use client';

/**
 * Gabsther — useSpeech hook
 * Manages speech recognition state for the voice chat screen.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SpeechRecognizer,
  speak,
  stopSpeaking,
  hasSpeechRecognition,
  hasSpeechSynthesis,
  initSpeechSynthesis,
} from '@/lib/speechUtils';

interface UseSpeechOptions {
  language?: string;          // BCP-47, e.g. 'fr-FR'
  /**
   * How long to wait (ms) after the last recognised word before submitting.
   * Keeps recognition running in continuous mode so the user can keep talking.
   * Default: 2500 ms
   */
  pauseDelay?: number;
  onFinalTranscript?: (text: string) => void;
}

interface UseSpeechReturn {
  isListening: boolean;
  isSpeaking: boolean;
  interimText: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeakingNow: () => void;
}

export function useSpeech({
  language = 'fr-FR',
  pauseDelay = 2500,
  onFinalTranscript,
}: UseSpeechOptions = {}): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // Accumulate words across multiple final results within one utterance
  const accumulatedRef = useRef('');
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = hasSpeechRecognition() && hasSpeechSynthesis();

  useEffect(() => {
    initSpeechSynthesis();
  }, []);

  /** Clear the pending submit timer */
  const clearSubmitTimer = useCallback(() => {
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
  }, []);

  /** Flush whatever has accumulated and fire the callback */
  const flushAccumulated = useCallback((stopAfter = true) => {
    clearSubmitTimer();
    const text = accumulatedRef.current.trim();
    accumulatedRef.current = '';
    if (text) onFinalTranscript?.(text);
    if (stopAfter) {
      recognizerRef.current?.stop();
      setIsListening(false);
      setInterimText('');
    }
  }, [clearSubmitTimer, onFinalTranscript]);

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition() || isListening) return;

    // Re-init TTS inside this user-gesture handler — required to unlock audio
    // on iOS Safari before the async speak() call fires after the API responds.
    initSpeechSynthesis();
    stopSpeaking();
    setIsSpeaking(false);
    accumulatedRef.current = '';
    clearSubmitTimer();

    const recognizer = new SpeechRecognizer({
      language,
      continuous: true,       // keep mic open between sentences
      interimResults: true,
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          // Replace (not append) — the recognizer already gives us the full
          // running transcript including any mid-sentence corrections.
          accumulatedRef.current = transcript;
          setInterimText('');

          // (Re-)start the pause timer — submits when user stops talking
          clearSubmitTimer();
          submitTimerRef.current = setTimeout(() => {
            flushAccumulated(true);
          }, pauseDelay);
        } else {
          // Show the full live transcript (final segments + current interim)
          setInterimText(transcript);
        }
      },
      onError: (error) => {
        if (error !== 'no-speech') {
          console.warn('Speech recognition error:', error);
        }
        // On no-speech with accumulated text, flush it
        if (error === 'no-speech' && accumulatedRef.current.trim()) {
          flushAccumulated(true);
        } else {
          clearSubmitTimer();
          accumulatedRef.current = '';
          setIsListening(false);
          setInterimText('');
        }
      },
      onEnd: () => {
        // Recognition ended (browser cut it off) — flush any accumulated text
        if (accumulatedRef.current.trim()) {
          flushAccumulated(false);
        }
        setIsListening(false);
        setInterimText('');
      },
    });

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsListening(true);
  }, [language, isListening, pauseDelay, clearSubmitTimer, flushAccumulated]);

  const stopListening = useCallback(() => {
    // If there's accumulated text, submit it before stopping
    if (accumulatedRef.current.trim()) {
      flushAccumulated(true);
    } else {
      clearSubmitTimer();
      recognizerRef.current?.stop();
      setIsListening(false);
      setInterimText('');
    }
  }, [clearSubmitTimer, flushAccumulated]);

  const speakText = useCallback(
    async (text: string) => {
      if (!hasSpeechSynthesis()) return;
      if (isListening) stopListening();

      setIsSpeaking(true);
      try {
        await speak(text, { language, rate: 0.85 });
      } finally {
        setIsSpeaking(false);
      }
    },
    [language, isListening, stopListening]
  );

  const stopSpeakingNow = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSubmitTimer();
      recognizerRef.current?.abort();
      stopSpeaking();
    };
  }, [clearSubmitTimer]);

  return {
    isListening,
    isSpeaking,
    interimText,
    isSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeakingNow,
  };
}
