import React, { useState } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '../data/interviewData.ts';
import { audioService } from '../services/audioService.ts';
import { UserSettings } from '../services/storageService.ts';
import {
  Volume2,
  Square,
  Search,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';

interface QuestionCardsViewProps {
  settings: UserSettings;
  favoriteIds: string[];
  completedIds: string[];
  revisionIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onOpenMicPractice: (question: InterviewQuestion) => void;
}

export const QuestionCardsView: React.FC<QuestionCardsViewProps> = ({
  settings,
  favoriteIds,
  completedIds,
  revisionIds,
  onToggleFavorite,
  onToggleCompleted,
  onToggleRevision,
  onOpenMicPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = INTERVIEW_QUESTIONS.filter(q => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase().trim();
    return (
      q.id.toLowerCase().includes(s) ||
      q.questionSinhalaPronunciation.toLowerCase().includes(s) ||
      q.questionSinhalaMeaning.toLowerCase().includes(s) ||
      q.titleSinhala.toLowerCase().includes(s) ||
      q.titleEnglish.toLowerCase().includes(s)
    );
  });

  const handlePlayQuestion = async (q: InterviewQuestion) => {
    if (playingId === q.id) {
      audioService.stop();
      setPlayingId(null);
      return;
    }

    setPlayingId(q.id);
    await audioService.playJapanese(q.questionJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ප්‍රශ්න 35 ම එකම තිරයක</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          සම්මුඛ පරීක්ෂකගේ ප්‍රශ්නාවලිය (All 35 Questions)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          ජපන් සම්මුඛ පරීක්ෂකවරයා අසන සෑම ප්‍රශ්නයකම සිංහල උච්චාරණය, තේරුම සහ සත්‍ය ජපන් හඬට සවන් දෙන්න.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ප්‍රශ්නය, සිංහල තේරුම හෝ අංකය සොයන්න..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-sinhala"
        />
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map(q => {
          const isFav = favoriteIds.includes(q.id);
          const isComp = completedIds.includes(q.id);
          const isRev = revisionIds.includes(q.id);
          const isPlaying = playingId === q.id;

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      {q.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {q.titleSinhala} ({q.titleEnglish})
                    </span>
                    {q.isCvSpecific && (
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        CV Focus
                      </span>
                    )}
                  </div>

                  {/* Sinhala-Script Pronunciation */}
                  <div className="sinhala-safe-box my-1">
                    <p className="font-sinhala text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-[1.85]">
                      "{q.questionSinhalaPronunciation}"
                    </p>
                  </div>

                  {/* Sinhala Meaning */}
                  <div className="sinhala-safe-box">
                    <p className="font-sinhala text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>තේරුම:</strong> {q.questionSinhalaMeaning}
                    </p>
                  </div>

                  {/* Optional Japanese */}
                  {settings.showJapaneseScript && (
                    <p className="text-xs text-slate-400 font-sans mt-1">
                      日本語: {q.questionJapanese}
                    </p>
                  )}
                </div>

                {/* Audio Button */}
                <button
                  onClick={() => handlePlayQuestion(q)}
                  className={`p-3 rounded-2xl shrink-0 transition ${
                    isPlaying
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                  title="ජපන් හඬින් ප්‍රශ්නය අසන්න"
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Bottom Card Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-sinhala text-[11px]">
                  කාණ්ඩය: {q.categorySinhala}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleRevision(q.id)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      isRev ? 'text-orange-600 bg-orange-50 dark:bg-orange-950' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="නැවත බැලීමට"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleFavorite(q.id)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      isFav ? 'text-rose-600 bg-rose-50 dark:bg-rose-950' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="ප්‍රියතම"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onToggleCompleted(q.id)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      isComp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="ප්‍රගුණ කළ බවට"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isComp ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onOpenMicPractice(q)}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold font-sinhala flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>පුහුණුව</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
