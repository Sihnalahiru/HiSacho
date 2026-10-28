import { CandidateProfile, DEFAULT_CANDIDATE_PROFILE } from '../data/interviewData.ts';

export interface UserSettings {
  theme: 'light' | 'dark';
  ttsEngine: 'native' | 'gemini';
  ttsVoice: string;
  ttsSpeed: number;
  showJapaneseScript: boolean;
  sinhalaFontSize: 'normal' | 'large' | 'huge';
  autoPlayQuestion: boolean;
}

export interface PracticeAttempt {
  id: string;
  questionId: string;
  timestamp: number;
  mode: 'practice' | 'simulation' | 'speech';
  audioRecognized?: string;
  notes?: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  ttsEngine: 'gemini', // Default to high-fidelity Gemini Japanese TTS for authentic pronunciation
  ttsVoice: 'Kore',
  ttsSpeed: 0.95,
  showJapaneseScript: false, // Default hidden per user requirements
  sinhalaFontSize: 'normal',
  autoPlayQuestion: false,
};

const STORAGE_KEYS = {
  FAVORITES: 'ssw_agri_favorites_v1',
  COMPLETED: 'ssw_agri_completed_v1',
  REVISION: 'ssw_agri_revision_v1',
  PROFILE: 'ssw_agri_profile_v1',
  SETTINGS: 'ssw_agri_settings_v1',
  ATTEMPTS: 'ssw_agri_attempts_v1',
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Storage reading failed for key "${key}":`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Storage saving failed for key "${key}":`, e);
    }
  }

  public getFavorites(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.FAVORITES, []);
  }

  public toggleFavorite(id: string): string[] {
    const list = this.getFavorites();
    const updated = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    this.setItem(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  }

  public isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  }

  public getCompletedIds(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.COMPLETED, []);
  }

  public toggleCompleted(id: string): string[] {
    const list = this.getCompletedIds();
    const updated = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    this.setItem(STORAGE_KEYS.COMPLETED, updated);
    return updated;
  }

  public isCompleted(id: string): boolean {
    return this.getCompletedIds().includes(id);
  }

  public getRevisionQueue(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.REVISION, []);
  }

  public toggleRevision(id: string): string[] {
    const list = this.getRevisionQueue();
    const updated = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    this.setItem(STORAGE_KEYS.REVISION, updated);
    return updated;
  }

  public isInRevision(id: string): boolean {
    return this.getRevisionQueue().includes(id);
  }

  public getProfile(): CandidateProfile {
    return this.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEFAULT_CANDIDATE_PROFILE);
  }

  public saveProfile(profile: CandidateProfile): void {
    this.setItem(STORAGE_KEYS.PROFILE, profile);
  }

  public getSettings(): UserSettings {
    const saved = this.getItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      ttsEngine: saved.ttsEngine || 'gemini',
      ttsVoice: saved.ttsVoice || (saved.ttsEngine === 'native' ? '' : 'Kore'),
    };
  }

  public saveSettings(settings: UserSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  public getAttempts(): PracticeAttempt[] {
    return this.getItem<PracticeAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
  }

  public logAttempt(attempt: Omit<PracticeAttempt, 'id' | 'timestamp'>): void {
    const list = this.getAttempts();
    const newAttempt: PracticeAttempt = {
      ...attempt,
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    // Keep max 100 recent attempts
    const updated = [newAttempt, ...list].slice(0, 100);
    this.setItem(STORAGE_KEYS.ATTEMPTS, updated);
  }

  public resetAllProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.REVISION);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  }
}

export const storageService = new StorageService();
