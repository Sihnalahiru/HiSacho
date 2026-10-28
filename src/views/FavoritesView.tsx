import React from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '../data/interviewData.ts';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { UserSettings } from '../services/storageService.ts';
import { Bookmark, RotateCcw, Sparkles } from 'lucide-react';

interface FilteredDeckViewProps {
  type: 'favorites' | 'revision';
  settings: UserSettings;
  favoriteIds: string[];
  completedIds: string[];
  revisionIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onOpenMicPractice: (question: InterviewQuestion) => void;
  onNavigateToPractice: () => void;
}

export const FilteredDeckView: React.FC<FilteredDeckViewProps> = ({
  type,
  settings,
  favoriteIds,
  completedIds,
  revisionIds,
  onToggleFavorite,
  onToggleCompleted,
  onToggleRevision,
  onOpenMicPractice,
  onNavigateToPractice,
}) => {
  const isFavorites = type === 'favorites';
  const targetIds = isFavorites ? favoriteIds : revisionIds;
  const questions = INTERVIEW_QUESTIONS.filter(q => targetIds.includes(q.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
            isFavorites
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
          }`}
        >
          {isFavorites ? <Bookmark className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
          <span>{isFavorites ? 'ප්‍රියතම ප්‍රශ්න එකතුව' : 'නැවත පුහුණු විය යුතු ප්‍රශ්න'}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          {isFavorites ? 'ප්‍රියතම ප්‍රශ්න (Favorite Questions)' : 'නැවත පුහුණු වීමේ පෝලිම (Revision Queue)'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          {isFavorites
            ? 'ඔබ විසින් ප්‍රියතම (Star) ලෙස ලකුණු කළ සියලු ප්‍රශ්න මෙහි පහසුවෙන් අධ්‍යයනය කළ හැක.'
            : 'වැඩි අවධානයක් අවශ්‍ය යැයි ඔබ ලකුණු කළ ප්‍රශ්න මෙහි ඇතුළත් වේ.'}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div
            className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
              isFavorites
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950'
                : 'bg-orange-100 text-orange-600 dark:bg-orange-950'
            }`}
          >
            {isFavorites ? <Bookmark className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
            {isFavorites ? 'ප්‍රියතම ලැයිස්තුව හිස්ව පවතී' : 'නැවත පුහුණු වීමේ පෝලිම හිස්ව පවතී'}
          </h3>
          <p className="text-xs text-slate-500 font-sinhala max-w-sm mx-auto">
            {isFavorites
              ? 'ප්‍රශ්නාවලිය පුහුණු වන විට ඕනෑම කාඩ්පතක ඇති Bookmark අයිකනය තට්ටු කර මෙහි සුරකින්න.'
              : 'ඕනෑම කාඩ්පතක ඇති Rotate අයිකනය ඔබා නැවත පුහුණු වීමට මෙහි ලකුණු කරගන්න.'}
          </p>
          <button
            onClick={onNavigateToPractice}
            className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold font-sinhala hover:bg-emerald-700 transition"
          >
            ප්‍රශ්නාවලිය වෙත යන්න
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-500 font-sinhala block">
            එකතුව: ප්‍රශ්න {questions.length} ක්
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                settings={settings}
                isFavorite={favoriteIds.includes(q.id)}
                isCompleted={completedIds.includes(q.id)}
                isInRevision={revisionIds.includes(q.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleCompleted={onToggleCompleted}
                onToggleRevision={onToggleRevision}
                onOpenMicPractice={onOpenMicPractice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
