export type TTSEngine = 'gemini' | 'native';

export interface AudioPlayOptions {
  engine?: TTSEngine;
  voiceName?: string; // Gemini voice: 'Kore', 'Puck', 'Fenrir', etc. Or native voice URI
  rate?: number; // 0.7 to 1.3
  onLoading?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Convert base64 string to ArrayBuffer for Web Audio API
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = typeof window !== 'undefined' ? window.atob(base64) : '';
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

class AudioService {
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private nativeVoices: SpeechSynthesisVoice[] = [];
  private audioCache = new Map<string, string>(); // base64 cached audio
  private audioContext: AudioContext | null = null;
  private currentObjectUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('speechSynthesis' in window && window.speechSynthesis) {
          this.initVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            this.initVoices();
          };
        }
      } catch (e) {
        console.warn('SpeechSynthesis initialization guarded:', e);
      }

      // Proactively unlock AudioContext on first user interaction
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  /**
   * Lazily initializes and unlocks the Web Audio API AudioContext
   */
  public unlockAudio(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext && AudioCtxClass) {
        this.audioContext = new AudioCtxClass();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext unlock guarded:', e);
    }
  }

  private initVoices() {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.nativeVoices = voices;
      }
    } catch (e) {
      console.warn('getVoices guarded:', e);
    }
  }

  public getAvailableNativeVoices(): SpeechSynthesisVoice[] {
    if (this.nativeVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.nativeVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        // ignore
      }
    }
    return this.nativeVoices;
  }

  public getJapaneseNativeVoices(): SpeechSynthesisVoice[] {
    const all = this.getAvailableNativeVoices();
    const jaVoices = all.filter(v => v.lang.toLowerCase().startsWith('ja') || v.lang.includes('JP'));

    // Deduplicate voices with identical voiceURI or name to prevent duplicate keys in UI
    const seen = new Set<string>();
    const uniqueVoices: SpeechSynthesisVoice[] = [];
    for (const v of jaVoices) {
      const id = v.voiceURI || `${v.name}-${v.lang}`;
      if (!seen.has(id)) {
        seen.add(id);
        uniqueVoices.push(v);
      }
    }
    return uniqueVoices;
  }

  public stop() {
    // 1. Stop Web Audio API source node
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
        this.currentAudioSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.currentAudioSource = null;
    }

    // 2. Stop HTML5 Audio Element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudioElement = null;
    }

    // Revoke previous Blob URL if any
    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch (e) {
        // ignore
      }
      this.currentObjectUrl = null;
    }

    // 3. Stop SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
    }
  }

  /**
   * Main play method with automatic fallback and user-gesture resilience
   */
  public async playJapanese(text: string, options: AudioPlayOptions = {}): Promise<void> {
    this.stop();
    this.unlockAudio();

    const {
      engine = 'gemini', // Default to Gemini Cloud TTS for authentic pronunciation
      voiceName,
      rate = 1.0,
      onLoading,
      onStart,
      onEnd,
      onError
    } = options;

    if (!text || text.trim().length === 0) {
      onEnd?.();
      return;
    }

    const trimmedText = text.trim();
    const jaNativeVoices = this.getJapaneseNativeVoices();

    // If native engine requested but device has NO Japanese voice installed:
    // Seamlessly route to Gemini TTS rather than failing silently or speaking with English accent!
    if (engine === 'native' && jaNativeVoices.length === 0) {
      console.info('[AudioService] No ja-JP voice pack found on this system. Auto-routing to Google Gemini TTS.');
      try {
        onLoading?.();
        await this.playViaGeminiTTS(trimmedText, voiceName || 'Kore', rate, onStart, onEnd);
        return;
      } catch (geminiErr) {
        console.warn('[AudioService] Gemini TTS fallback failed, attempting native browser speak:', geminiErr);
        this.playViaNativeSpeech(trimmedText, rate, voiceName, onStart, onEnd, onError);
        return;
      }
    }

    if (engine === 'gemini') {
      try {
        onLoading?.();
        await this.playViaGeminiTTS(trimmedText, voiceName || 'Kore', rate, onStart, onEnd);
      } catch (err: any) {
        console.warn('[AudioService] Gemini TTS playback failed. Falling back seamlessly to Native speech:', err?.message || err);
        // Fall back to native
        this.playViaNativeSpeech(trimmedText, rate, voiceName, onStart, onEnd, (nativeErr) => {
          console.error('[AudioService] Both Gemini TTS and Native speech failed:', nativeErr);
          onError?.(err || nativeErr);
        });
      }
    } else {
      // User explicitly selected native AND has Japanese voice installed
      this.playViaNativeSpeech(trimmedText, rate, voiceName, onStart, onEnd, async (nativeErr) => {
        console.warn('[AudioService] Native speech error, trying Gemini TTS as fallback:', nativeErr);
        try {
          onLoading?.();
          await this.playViaGeminiTTS(trimmedText, 'Kore', rate, onStart, onEnd);
        } catch (fallbackErr) {
          onError?.(nativeErr);
        }
      });
    }
  }

  /**
   * Synthesizes and plays audio via Gemini 3.8 Flash Lite TTS
   * Uses Web Audio API with Blob HTML5 Audio fallback
   */
  private async playViaGeminiTTS(
    text: string,
    voiceName: string = 'Kore',
    rate: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    const cacheKey = `${voiceName}:${text}`;
    let base64Audio = this.audioCache.get(cacheKey);

    if (!base64Audio) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: voiceName || 'Kore',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS server HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 'FALLBACK_NATIVE' || data.error) {
        throw new Error(data.error || 'Server requested fallback to native');
      }

      if (!data.audioData) {
        throw new Error('No audio data in response');
      }

      base64Audio = data.audioData;
      this.audioCache.set(cacheKey, base64Audio!);
    }

    const arrayBuffer = base64ToArrayBuffer(base64Audio!);

    // Strategy A: Web Audio API (Best for bypassing mobile autoplay delays & sandboxed iframes)
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtxClass();
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // Clone arrayBuffer because decodeAudioData detaches the buffer in some implementations
        const bufferCopy = arrayBuffer.slice(0);
        const audioBuffer = await this.audioContext.decodeAudioData(bufferCopy);

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = Math.min(Math.max(rate, 0.5), 2.0);
        source.connect(this.audioContext.destination);

        this.currentAudioSource = source;

        return new Promise<void>((resolve) => {
          source.onended = () => {
            this.currentAudioSource = null;
            onEnd?.();
            resolve();
          };

          try {
            source.start(0);
            onStart?.();
          } catch (startErr) {
            this.currentAudioSource = null;
            throw startErr;
          }
        });
      }
    } catch (webAudioErr) {
      console.warn('[AudioService] Web Audio API playback failed, trying Blob HTML5 Audio element:', webAudioErr);
    }

    // Strategy B: Blob URL with HTMLAudioElement
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);
    this.currentObjectUrl = audioUrl;

    const audio = new Audio(audioUrl);
    this.currentAudioElement = audio;
    audio.playbackRate = Math.min(Math.max(rate, 0.5), 2.0);

    return new Promise<void>((resolve, reject) => {
      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        this.currentAudioElement = null;
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
          this.currentObjectUrl = null;
        }
        onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        this.currentAudioElement = null;
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
          this.currentObjectUrl = null;
        }
        reject(e);
      };

      audio.play().catch((playErr) => {
        this.currentAudioElement = null;
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
          this.currentObjectUrl = null;
        }
        reject(playErr);
      });
    });
  }

  /**
   * Native browser SpeechSynthesis (Web Speech API)
   */
  private playViaNativeSpeech(
    text: string,
    rate: number = 1.0,
    voiceName?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
      const msg = 'Speech Synthesis is not supported in this browser environment.';
      console.warn(msg);
      onError?.(new Error(msg));
      onEnd?.();
      return;
    }

    // Cancel any stuck utterances
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = Math.min(Math.max(rate, 0.6), 1.5);
    utterance.pitch = 1.0;

    // Try to find Japanese voice
    const jaVoices = this.getJapaneseNativeVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (voiceName) {
      selectedVoice = this.getAvailableNativeVoices().find(v => v.name === voiceName || v.voiceURI === voiceName);
    }
    if (!selectedVoice && jaVoices.length > 0) {
      selectedVoice = jaVoices[0];
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      // 'interrupted' and 'canceled' are standard when stopping intentionally
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onError?.(e);
      }
      onEnd?.();
    };

    this.currentUtterance = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.currentUtterance = null;
      onError?.(e);
      onEnd?.();
    }
  }
}

export const audioService = new AudioService();
