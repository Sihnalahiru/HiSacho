import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface SpeechRecognitionHookResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setManualTranscript: (text: string) => void;
  isWaitingForSpeech: boolean;
}

export function useSpeechRecognition(targetLanguage: string = 'ja-JP'): SpeechRecognitionHookResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false);

  const recognitionRef = useRef<any>(null);
  const initialSpeechTimeoutRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = targetLanguage;

      recognitionRef.current = rec;
    } else {
      setIsSupported(false);
    }

    return () => {
      clearAllTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [targetLanguage]);

  const clearAllTimers = useCallback(() => {
    if (initialSpeechTimeoutRef.current) {
      clearTimeout(initialSpeechTimeoutRef.current);
      initialSpeechTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearAllTimers();
    setIsListening(false);
    setIsWaitingForSpeech(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  }, [clearAllTimers]);

  const startListening = useCallback(() => {
    setError(null);
    clearAllTimers();

    if (!recognitionRef.current) {
      setError('මෙම බ්‍රවුසරයේ හඬ හඳුනාගැනීම (Speech Recognition) සහාය නොදක්වයි. කරුණාකර පහත ඇති ලේඛන පෙට්ටිය (Text Input Fallback) භාවිත කරන්න.');
      return;
    }

    try {
      setTranscript('');
      setIsListening(true);
      setIsWaitingForSpeech(true);

      // 5-second initial timeout waiting for user to start speaking
      initialSpeechTimeoutRef.current = setTimeout(() => {
        setIsWaitingForSpeech(false);
        setError('තත්පර 5ක් තුළ කටහඬ හඳුනාගත නොහැකි විය. කරුණාකර මයික්‍රෆෝනය අසලින් නැවත උත්සාහ කරන්න.');
        stopListening();
      }, 5000);

      recognitionRef.current.onresult = (event: any) => {
        // Speech received! Cancel the 5s initial timeout
        if (initialSpeechTimeoutRef.current) {
          clearTimeout(initialSpeechTimeoutRef.current);
          initialSpeechTimeoutRef.current = null;
          setIsWaitingForSpeech(false);
        }

        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);

        // Reset approximately 4-second silence timer to detect end of speaking
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, 4000);
      };

      recognitionRef.current.onerror = (event: any) => {
        clearAllTimers();
        setIsListening(false);
        setIsWaitingForSpeech(false);

        const errType = event.error;
        if (errType === 'not-allowed') {
          setError('මයික්‍රෆෝනය සඳහා අවසර (Microphone Permission) ලබා දී නොමැත. කරුණාකර බ්‍රවුසර සැකසුම්වලින් අවසර ලබා දෙන්න.');
        } else if (errType === 'no-speech') {
          setError('කිසිදු කටහඬක් ඇසුණේ නැත. කරුණාකර මයික්‍රෆෝනය පරීක්ෂා කර නැවත උත්සාහ කරන්න.');
        } else if (errType === 'audio-capture') {
          setError('මයික්‍රෆෝනයක් සම්බන්ධ කර නොමැති බව පෙනේ.');
        } else if (errType === 'network') {
          setError('ජාල දෝෂයකි. අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කරන්න.');
        } else {
          setError(`හඬ හඳුනාගැනීමේ දෝෂයකි: ${errType || 'නොදන්නා දෝෂයක්'}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsWaitingForSpeech(false);
        clearAllTimers();
      };

      recognitionRef.current.start();
    } catch (e: any) {
      clearAllTimers();
      setIsListening(false);
      setIsWaitingForSpeech(false);
      setError('හඬ හඳුනාගැනීම ආරම්භ කිරීමට නොහැකි විය: ' + (e?.message || 'දෝෂයකි'));
    }
  }, [clearAllTimers, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    isWaitingForSpeech,
  };
}

/**
 * Calculates string match similarity percentage (0 - 100)
 */
export function calculateMatchScore(candidateText: string, targetText: string): number {
  if (!candidateText || !targetText) return 0;
  const cleanA = candidateText.replace(/\s+/g, '').toLowerCase();
  const cleanB = targetText.replace(/[\s、。！？,.!?]+/g, '').toLowerCase();

  if (cleanA === cleanB) return 100;
  if (cleanB.includes(cleanA) || cleanA.includes(cleanB)) {
    return Math.round((Math.min(cleanA.length, cleanB.length) / Math.max(cleanA.length, cleanB.length)) * 100);
  }

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= cleanA.length; i++) matrix[i] = [i];
  for (let j = 0; j <= cleanB.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= cleanA.length; i++) {
    for (let j = 1; j <= cleanB.length; j++) {
      const cost = cleanA[i - 1] === cleanB[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[cleanA.length][cleanB.length];
  const maxLen = Math.max(cleanA.length, cleanB.length);
  const similarity = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
  return similarity;
}
