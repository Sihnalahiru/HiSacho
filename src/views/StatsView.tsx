import React, { useState } from 'react';
import { INTERVIEW_QUESTIONS, CATEGORIES } from '../data/interviewData.ts';
import { storageService, PracticeAttempt } from '../services/storageService.ts';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Bookmark,
  RotateCcw,
  Trash2,
  Calendar,
  Share2,
  Check
} from 'lucide-react';

interface StatsViewProps {
  completedIds: string[];
  favoriteIds: string[];
  revisionIds: string[];
  onResetProgress: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  completedIds,
  favoriteIds,
  revisionIds,
  onResetProgress,
}) => {
  const attempts = storageService.getAttempts();
  const totalQ = INTERVIEW_QUESTIONS.length;
  const completedCount = completedIds.length;
  const percent = Math.round((completedCount / totalQ) * 100);
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const summary = `🇯🇵 Japanese SSW Agriculture Interview Coach - Progress Report
Candidate: Lahiru Madusanka (Finance -> Agriculture)
Completed: ${completedCount}/${totalQ} (${percent}%)
Favorites: ${favoriteIds.length} questions
Revision Queue: ${revisionIds.length} questions
Total Practice Sessions: ${attempts.length}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ඉගෙනුම් ප්‍රගතිය සහ වාර්තා</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
            පුහුණු ප්‍රගති සංඛ්‍යාලේඛන (Progress Statistics)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala">
            ඔබේ සම්මුඛ පරීක්ෂණ සූදානම පිළිබඳ සවිස්තරාත්මක වාර්තාව.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto font-sinhala"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'පිටපත් විය!' : 'වාර්තාව පිටපත් කරන්න'}</span>
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            මුළු ප්‍රගතිය
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{percent}%</div>
          <p className="text-xs text-slate-500 font-sinhala mt-1">
            ප්‍රශ්න {completedCount} / {totalQ}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            ප්‍රියතම ප්‍රශ්න
          </span>
          <div className="text-3xl font-black text-rose-500">{favoriteIds.length}</div>
          <p className="text-xs text-slate-500 font-sinhala mt-1">සුරැකි ප්‍රශ්න</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            නැවත බැලීමට
          </span>
          <div className="text-3xl font-black text-orange-500">{revisionIds.length}</div>
          <p className="text-xs text-slate-500 font-sinhala mt-1">නැවත පුහුණු වීමට</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            වාර්තා වූ වාර
          </span>
          <div className="text-3xl font-black text-blue-500">{attempts.length}</div>
          <p className="text-xs text-slate-500 font-sinhala mt-1">පුහුණු වාර ගණන</p>
        </div>
      </div>

      {/* Category-by-Category Progress Bar List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
          කාණ්ඩ අනුව ප්‍රගතිය (Category Mastery)
        </h2>

        <div className="space-y-4">
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const inCat =
              cat.id === 'cv-focus'
                ? INTERVIEW_QUESTIONS.filter(q => q.isCvSpecific)
                : INTERVIEW_QUESTIONS.filter(q => q.category === cat.id);
            const doneInCat = inCat.filter(q => completedIds.includes(q.id)).length;
            const catPercent = inCat.length > 0 ? Math.round((doneInCat / inCat.length) * 100) : 0;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-sinhala">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.label}</span>
                  <span className="text-slate-400">
                    {doneInCat} / {inCat.length} ({catPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Practice Attempts Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
          මෑත පුහුණු ඉතිහාසය (Practice History)
        </h2>

        {attempts.length === 0 ? (
          <p className="text-xs text-slate-400 font-sinhala py-2">
            තවමත් පුහුණු වාර වාර්තා වී නැත. ප්‍රශ්නාවලිය හෝ විභාග අනුකරණය ආරම්භ කළ පසු මෙහි සටහන් වේ.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {attempts.slice(0, 8).map(att => {
              const q = INTERVIEW_QUESTIONS.find(item => item.id === att.questionId);
              const dateStr = new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={att.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {att.questionId.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {att.mode}
                      </span>
                    </div>
                    {q && (
                      <p className="text-slate-500 font-sinhala text-[11px] truncate max-w-sm">
                        {q.titleSinhala}
                      </p>
                    )}
                    {att.notes && (
                      <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-mono">
                        {att.notes}
                      </p>
                    )}
                  </div>

                  <span className="text-slate-400 text-[10px] shrink-0">{dateStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Progress Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={() => {
            if (window.confirm('ඔබේ සියලු ප්‍රගති ලකුණු නැවත මුල සිට සැකසීමට අවශ්‍යද?')) {
              onResetProgress();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-sinhala font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ප්‍රගතිය නැවත සකසන්න (Reset Progress)</span>
        </button>
      </div>
    </div>
  );
};
