export type TTSEngine = 'gemini' | 'native';

export interface AudioPlayOptions {
  engine?: TTSEngine;
  voiceName?: string; // Gemini voice: 'Kore', 'Puck', 'Fenrir' etc. Or native voice URI
  rate?: number; // 0.7 to 1.3
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class AudioService {
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private nativeVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private audioCache = new Map<string, string>(); // base64 cached audio

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.nativeVoices = voices;
      this.voicesLoaded = true;
    }
  }

  public getAvailableNativeVoices(): SpeechSynthesisVoice[] {
    if (this.nativeVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.nativeVoices = window.speechSynthesis.getVoices();
    }
    return this.nativeVoices;
  }

  public getJapaneseNativeVoices(): SpeechSynthesisVoice[] {
    const all = this.getAvailableNativeVoices();
    return all.filter(v => v.lang.toLowerCase().startsWith('ja') || v.lang.includes('JP'));
  }

  public stop() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
    }
  }

  public async playJapanese(text: string, options: AudioPlayOptions = {}): Promise<void> {
    this.stop();

    const {
      engine = 'native',
      voiceName,
      rate = 1.0,
      onStart,
      onEnd,
      onError
    } = options;

    if (!text || text.trim().length === 0) {
      onEnd?.();
      return;
    }

    if (engine === 'gemini') {
      try {
        await this.playViaGeminiTTS(text, voiceName, rate, onStart, onEnd);
        return;
      } catch (err) {
        console.warn('Gemini TTS failed or unavailable, falling back seamlessly to Native speech:', err);
        // Fallback to native
        this.playViaNativeSpeech(text, rate, voiceName, onStart, onEnd, onError);
        return;
      }
    } else {
      this.playViaNativeSpeech(text, rate, voiceName, onStart, onEnd, onError);
    }
  }

  private async playViaGeminiTTS(
    text: string,
    voiceName?: string,
    rate: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    const cacheKey = `${voiceName || 'Kore'}:${text.trim()}`;
    let base64Audio = this.audioCache.get(cacheKey);

    if (!base64Audio) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
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

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;
    const audio = new Audio(audioUrl);
    this.currentAudioElement = audio;

    // Apply playback speed
    audio.playbackRate = Math.min(Math.max(rate, 0.5), 2.0);

    return new Promise((resolve, reject) => {
      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        this.currentAudioElement = null;
        onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        this.currentAudioElement = null;
        reject(e);
      };

      audio.play().catch(reject);
    });
  }

  private playViaNativeSpeech(
    text: string,
    rate: number = 1.0,
    voiceName?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const msg = 'Speech Synthesis is not supported in this browser environment.';
      console.warn(msg);
      onError?.(new Error(msg));
      onEnd?.();
      return;
    }

    // Cancel any previous utterances
    window.speechSynthesis.cancel();

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
      // 'interrupted' is expected if user pressed stop
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onError?.(e);
      }
      onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const audioService = new AudioService();
