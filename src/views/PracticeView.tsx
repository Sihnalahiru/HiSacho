import React, { useState, useMemo } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion, CATEGORIES } from '../data/interviewData.ts';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { UserSettings } from '../services/storageService.ts';
import {
  Search,
  Filter,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Grid,
  CreditCard,
  RotateCcw
} from 'lucide-react';

interface PracticeViewProps {
  settings: UserSettings;
  favoriteIds: string[];
  completedIds: string[];
  revisionIds: string[];
  initialCategory?: string;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onOpenMicPractice: (question: InterviewQuestion) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  settings,
  favoriteIds,
  completedIds,
  revisionIds,
  initialCategory = 'all',
  onToggleFavorite,
  onToggleCompleted,
  onToggleRevision,
  onOpenMicPractice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [isShuffled, setIsShuffled] = useState(false);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let list = [...INTERVIEW_QUESTIONS];

    if (selectedCategory === 'cv-focus') {
      list = list.filter(q => q.isCvSpecific);
    } else if (selectedCategory !== 'all') {
      list = list.filter(q => q.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        item =>
          item.id.toLowerCase().includes(q) ||
          item.questionSinhalaPronunciation.toLowerCase().includes(q) ||
          item.questionSinhalaMeaning.toLowerCase().includes(q) ||
          item.answerSinhalaPronunciation.toLowerCase().includes(q) ||
          item.answerSinhalaMeaning.toLowerCase().includes(q) ||
          item.titleEnglish.toLowerCase().includes(q) ||
          item.titleSinhala.toLowerCase().includes(q)
      );
    }

    if (isShuffled) {
      list = [...list].sort(() => Math.sin(list.length) - 0.5);
    }

    return list;
  }, [selectedCategory, searchQuery, isShuffled]);

  const total = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(total - 1);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* View Header with Title and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
            සම්මුඛ පරීක්ෂණ පුහුණුව (Practice Mode)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sinhala">
            ප්‍රශ්නයට සවන් දෙන්න, සිංහල උච්චාරණය කියවන්න සහ ආදර්ශ පිළිතුර ප්‍රගුණ කරන්න.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Card or Grid Mode */}
          <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="තනි කාඩ්පතක් ලෙස"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline font-sinhala">කාඩ්පත</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="සියලු කාඩ්පත් ලැයිස්තුව"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline font-sinhala">ලැයිස්තුව</span>
            </button>
          </div>

          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              isShuffled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="අහඹු පිළිවෙළට පෙරළන්න (Shuffle)"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline font-sinhala">{isShuffled ? 'අහඹුයි' : 'Shuffle'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="ප්‍රශ්නය, සිංහල තේරුම හෝ උච්චාරණය සොයන්න..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sinhala"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              මකන්න
            </button>
          )}
        </div>

        {/* Category Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
            }}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sinhala cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition font-sinhala ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {total === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sinhala">
            සෙවුමට ගැළපෙන ප්‍රශ්න හමු නොවීය
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-sinhala">
            කරුණාකර වෙනත් සෙවුම් පදයක් හෝ සියලු ප්‍රශ්න කාණ්ඩය තෝරන්න.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold font-sinhala"
          >
            සියලු ප්‍රශ්න පෙන්වන්න
          </button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Quick Jump Dropdown & Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-sinhala">
              ප්‍රශ්න {currentIndex + 1} / {total} (මුළු එකතුව: 35)
            </span>

            {/* Jump dropdown */}
            <select
              value={currentIndex}
              onChange={e => setCurrentIndex(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              {filteredQuestions.map((q, idx) => (
                <option key={q.id} value={idx}>
                  #{idx + 1} {q.id.toUpperCase()} - {q.titleSinhala}
                </option>
              ))}
            </select>
          </div>

          {/* Active Card */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={total}
              settings={settings}
              isFavorite={favoriteIds.includes(currentQuestion.id)}
              isCompleted={completedIds.includes(currentQuestion.id)}
              isInRevision={revisionIds.includes(currentQuestion.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleCompleted={onToggleCompleted}
              onToggleRevision={onToggleRevision}
              onNext={handleNext}
              onPrev={handlePrev}
              onOpenMicPractice={onOpenMicPractice}
            />
          )}

          {/* Bottom Navigation Chevrons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-sinhala">කලින් ප්‍රශ්නය</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              යතුරු පුවරුවේ ← / → භාවිත කළ හැක
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
            >
              <span className="font-sinhala">ඊළඟ ප්‍රශ්නය</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Grid Mode: Shows all cards in responsive grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              total={total}
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
      )}
    </div>
  );
};
