export type TTSEngine = 'gemini' | 'native';

export interface AudioPlayOptions {
  engine?: TTSEngine;
  voiceName?: string; // Gemini voice: 'Kore', 'Puck', etc. Or native voice URI/name
  rate?: number; // 0.6 to 1.5
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

// Silent 1-frame WAV base64 data URI to unlock mobile HTML5 audio engine
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

class AudioService {
  private currentAudioElement: HTMLAudioElement | null = null;
  private sharedAudioElement: HTMLAudioElement | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private activeUtterances: SpeechSynthesisUtterance[] = [];
  private nativeVoices: SpeechSynthesisVoice[] = [];
  private audioCache = new Map<string, string>(); // base64 cached audio
  private preloadingSet = new Set<string>(); // currently fetching keys
  private audioContext: AudioContext | null = null;
  private currentObjectUrl: string | null = null;
  private isAudioUnlocked = false;
  // If static hosting (GitHub Pages, etc) or 429 quota exhausted, avoid failing fetch calls
  private backendAvailable: boolean | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if static hosting like GitHub Pages
      if (
        window.location.hostname.endsWith('github.io') ||
        window.location.protocol === 'file:'
      ) {
        this.backendAvailable = false;
      }

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

      // Proactively unlock audio session on any early user tap
      const unlockGesture = () => {
        this.prepareForPlayback();
        window.removeEventListener('click', unlockGesture);
        window.removeEventListener('touchstart', unlockGesture);
        window.removeEventListener('keydown', unlockGesture);
      };
      window.addEventListener('click', unlockGesture, { passive: true });
      window.addEventListener('touchstart', unlockGesture, { passive: true });
      window.addEventListener('keydown', unlockGesture, { passive: true });
    }
  }

  /**
   * Synchronously pre-warms the Web Audio API Context, Media subsystem, and SpeechSynthesis.
   * CRITICAL for iOS Safari and iframe environments to bypass autoplay restrictions.
   */
  public prepareForPlayback(): void {
    if (typeof window === 'undefined') return;

    // 1. Web Audio API Context synchronous resume & 1-sample tick
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtxClass();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
        // Play an ultra-short silent buffer synchronously to unlock WebKit audio gate
        try {
          const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
          const source = this.audioContext.createBufferSource();
          source.buffer = silentBuffer;
          source.connect(this.audioContext.destination);
          source.start(0);
        } catch (bufErr) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('[AudioService] Web Audio context unlock guarded:', e);
    }

    // 2. Prime shared HTMLAudioElement for iOS Safari fallback
    try {
      if (!this.sharedAudioElement) {
        this.sharedAudioElement = new Audio();
        (this.sharedAudioElement as any).playsInline = true;
        (this.sharedAudioElement as any).webkitPlaysInline = true;
        this.sharedAudioElement.src = SILENT_WAV_DATA_URI;
      }
      const playPromise = this.sharedAudioElement.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            this.sharedAudioElement?.pause();
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('[AudioService] HTMLAudioElement prime guarded:', e);
    }

    // 3. Prime Web Speech Synthesis on iOS WebKit
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        // iOS WebKit quirk: activating an utterance inside a touch token primes the synthesizer
        const dummy = new SpeechSynthesisUtterance(' ');
        dummy.volume = 0.01;
        dummy.rate = 10;
        window.speechSynthesis.speak(dummy);
      }
    } catch (e) {
      // ignore
    }

    this.isAudioUnlocked = true;
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
    const jaVoices = all.filter(
      v =>
        v.lang.toLowerCase().startsWith('ja') ||
        v.lang.includes('JP') ||
        v.name.includes('Japanese') ||
        v.name.includes('Kyoko') ||
        v.name.includes('Otoya') ||
        v.name.includes('Hattori')
    );

    // Deduplicate voices with identical voiceURI or name
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

    if (this.sharedAudioElement) {
      try {
        this.sharedAudioElement.pause();
      } catch (e) {
        // ignore
      }
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
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        // ignore
      }
      this.activeUtterances = [];
    }
  }

  /**
   * Pre-fetches and caches Japanese audio in the background so that click-to-play is instantaneous
   */
  public async preloadAudio(text: string, voiceName: string = 'Kore'): Promise<void> {
    if (!text || typeof window === 'undefined' || this.backendAvailable === false) return;
    const trimmed = text.trim();
    const cacheKey = `${voiceName}:${trimmed}`;
    if (this.audioCache.has(cacheKey) || this.preloadingSet.has(cacheKey)) return;

    this.preloadingSet.add(cacheKey);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, voiceName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioData) {
          this.audioCache.set(cacheKey, data.audioData);
        } else if (data.code === 'FALLBACK_NATIVE') {
          this.backendAvailable = false;
        }
      } else {
        if (res.status === 404) this.backendAvailable = false;
      }
    } catch (e) {
      // Preload fail is non-fatal
    } finally {
      this.preloadingSet.delete(cacheKey);
    }
  }

  /**
   * Main play method with immediate gesture-unlock, instant native fallback for zero-latency,
   * Web Audio primary execution, and Web Speech API recovery.
   */
  public async playJapanese(text: string, options: AudioPlayOptions = {}): Promise<void> {
    // Synchronously prepare audio pipeline within user gesture!
    this.prepareForPlayback();
    this.stop();

    const {
      engine = 'native',
      voiceName = 'Kore',
      rate = 1.0,
      onLoading,
      onStart,
      onEnd,
      onError,
    } = options;

    if (!text || text.trim().length === 0) {
      onEnd?.();
      return;
    }

    const trimmedText = text.trim();

    // IF engine is native OR backend is known to be unavailable (e.g. GitHub Pages or quota exceeded):
    // Execute Native Japanese Speech SYNCHRONOUSLY right now within the user gesture!
    if (engine === 'native' || this.backendAvailable === false) {
      this.playViaNativeSpeech(trimmedText, rate, voiceName, onStart, onEnd, onError);
      return;
    }

    // Otherwise, try Gemini Cloud TTS
    try {
      onLoading?.();
      await this.playViaGeminiTTS(trimmedText, voiceName || 'Kore', rate, onStart, onEnd);
    } catch (err: any) {
      console.warn('[AudioService] Gemini TTS unavailable, routing immediately to Native speech:', err?.message || err);
      this.backendAvailable = false;
      // Fall back to native
      this.playViaNativeSpeech(trimmedText, rate, voiceName, onStart, onEnd, (nativeErr) => {
        console.error('[AudioService] Both Gemini TTS and Native speech failed:', nativeErr);
        onError?.(err || nativeErr);
      });
    }
  }

  /**
   * Synthesizes and plays audio via Gemini 3.8 Flash Lite TTS
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
        if (response.status === 404) this.backendAvailable = false;
        throw new Error(`TTS server HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 'FALLBACK_NATIVE' || data.error) {
        this.backendAvailable = false;
        throw new Error(data.error || 'Server requested fallback to native');
      }

      if (!data.audioData) {
        throw new Error('No audio data in response');
      }

      base64Audio = data.audioData;
      this.audioCache.set(cacheKey, base64Audio!);
    }

    const arrayBuffer = base64ToArrayBuffer(base64Audio!);

    // Strategy 1: Web Audio API
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtxClass();
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        const bufferCopy = arrayBuffer.slice(0);
        const audioBuffer = await this.decodeAudioDataPolyfill(this.audioContext, bufferCopy);

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

    // Strategy 2: Blob URL with HTMLAudioElement
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);
    this.currentObjectUrl = audioUrl;

    const audio = this.sharedAudioElement || new Audio();
    this.currentAudioElement = audio;
    audio.src = audioUrl;
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

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((playErr) => {
          this.currentAudioElement = null;
          if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
            this.currentObjectUrl = null;
          }
          reject(playErr);
        });
      }
    });
  }

  /**
   * Dual-mode decodeAudioData that works across modern browsers and older WebKit
   */
  private decodeAudioDataPolyfill(ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      let isSettled = false;
      const successCb = (decoded: AudioBuffer) => {
        if (!isSettled) {
          isSettled = true;
          resolve(decoded);
        }
      };
      const errorCb = (err: any) => {
        if (!isSettled) {
          isSettled = true;
          reject(err);
        }
      };

      try {
        const promise = ctx.decodeAudioData(buffer, successCb, errorCb);
        if (promise && typeof promise.then === 'function') {
          promise.then(successCb).catch(errorCb);
        }
      } catch (e) {
        errorCb(e);
      }
    });
  }

  /**
   * Native browser SpeechSynthesis (Web Speech API).
   * Robust implementation avoiding iOS WebKit garbage collection and gesture loss.
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

    try {
      // Only cancel if actively speaking
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = Math.min(Math.max(rate, 0.7), 1.3);
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

    // Keep utterance in instance array to avoid garbage collection bug on iOS Safari
    this.activeUtterances.push(utterance);

    utterance.onstart = () => {
      onStart?.();
    };

    const cleanup = () => {
      const idx = this.activeUtterances.indexOf(utterance);
      if (idx !== -1) {
        this.activeUtterances.splice(idx, 1);
      }
    };

    utterance.onend = () => {
      cleanup();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      cleanup();
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onError?.(e);
      }
      onEnd?.();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      cleanup();
      onError?.(e);
      onEnd?.();
    }
  }
}

export const audioService = new AudioService();
