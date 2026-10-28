import React, { useState } from 'react';
import { InterviewQuestion } from '../data/interviewData.ts';
import { audioService } from '../services/audioService.ts';
import { UserSettings } from '../services/storageService.ts';
import {
  Volume2,
  Square,
  Eye,
  EyeOff,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';

interface QuestionCardProps {
  question: InterviewQuestion;
  index?: number;
  total?: number;
  settings: UserSettings;
  isFavorite: boolean;
  isCompleted: boolean;
  isInRevision: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onOpenMicPractice?: (question: InterviewQuestion) => void;
  defaultAnswerRevealed?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  settings,
  isFavorite,
  isCompleted,
  isInRevision,
  onToggleFavorite,
  onToggleCompleted,
  onToggleRevision,
  onNext,
  onPrev,
  onOpenMicPractice,
  defaultAnswerRevealed = false,
}) => {
  const [answerRevealed, setAnswerRevealed] = useState(defaultAnswerRevealed);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Sinhala font size mapping
  const fontSizeClass = {
    normal: 'text-base sm:text-lg',
    large: 'text-lg sm:text-xl',
    huge: 'text-xl sm:text-2xl',
  }[settings.sinhalaFontSize] || 'text-base sm:text-lg';

  const pronunciationSizeClass = {
    normal: 'text-base sm:text-lg font-semibold',
    large: 'text-lg sm:text-xl font-semibold',
    huge: 'text-xl sm:text-2xl font-bold',
  }[settings.sinhalaFontSize] || 'text-base sm:text-lg font-semibold';

  const handlePlayQuestion = async () => {
    if (isPlayingQuestion || isLoadingQuestion) {
      audioService.stop();
      setIsPlayingQuestion(false);
      setIsLoadingQuestion(false);
      return;
    }
    audioService.stop();
    setIsPlayingAnswer(false);
    setIsLoadingAnswer(false);
    setIsLoadingQuestion(true);

    await audioService.playJapanese(question.questionJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onStart: () => {
        setIsLoadingQuestion(false);
        setIsPlayingQuestion(true);
      },
      onEnd: () => {
        setIsLoadingQuestion(false);
        setIsPlayingQuestion(false);
      },
      onError: () => {
        setIsLoadingQuestion(false);
        setIsPlayingQuestion(false);
      },
    });
  };

  const handlePlayAnswer = async () => {
    if (isPlayingAnswer || isLoadingAnswer) {
      audioService.stop();
      setIsPlayingAnswer(false);
      setIsLoadingAnswer(false);
      return;
    }
    audioService.stop();
    setIsPlayingQuestion(false);
    setIsLoadingQuestion(false);
    setIsLoadingAnswer(true);

    await audioService.playJapanese(question.answerJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onStart: () => {
        setIsLoadingAnswer(false);
        setIsPlayingAnswer(true);
      },
      onEnd: () => {
        setIsLoadingAnswer(false);
        setIsPlayingAnswer(false);
      },
      onError: () => {
        setIsLoadingAnswer(false);
        setIsPlayingAnswer(false);
      },
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Top Bar: Question Number & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {question.id.toUpperCase()}
            </span>
            {index !== undefined && total !== undefined && (
              <span className="text-xs text-slate-400 font-medium">
                {index + 1} / {total}
              </span>
            )}
            {question.isCvSpecific && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                CV Focus
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {question.notesSinhala && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                title="විශේෂ උපදෙස්"
                className={`p-2 rounded-xl transition ${
                  showNotes ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onToggleRevision(question.id)}
              title={isInRevision ? 'නැවත පුහුණු ලැයිස්තුවෙන් ඉවත් කරන්න' : 'නැවත පුහුණු වීමට ලකුණු කරන්න'}
              className={`p-2 rounded-xl transition ${
                isInRevision ? 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(question.id)}
              title={isFavorite ? 'ප්‍රියතම ලැයිස්තුවෙන් ඉවත් කරන්න' : 'ප්‍රියතම ලැයිස්තුවට එක් කරන්න'}
              className={`p-2 rounded-xl transition ${
                isFavorite ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onToggleCompleted(question.id)}
              title={isCompleted ? 'ප්‍රගුණ කළ ලැයිස්තුවෙන් ඉවත් කරන්න' : 'ප්‍රගුණ කළ බව සලකුණු කරන්න'}
              className={`p-2 rounded-xl transition ${
                isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-500 text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category & Title */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block font-sinhala leading-normal">
            {question.categorySinhala}
          </span>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
            {question.titleSinhala} ({question.titleEnglish})
          </h3>
        </div>

        {/* Notes alert if opened */}
        {showNotes && question.notesSinhala && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 font-sinhala leading-relaxed sinhala-safe-box flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>සම්මුඛ පරීක්ෂණ උපදෙස: </strong>
              {question.notesSinhala}
            </div>
          </div>
        )}

        {/* QUESTION SECTION */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 sm:p-5 mb-5 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              සම්මුඛ පරීක්ෂකගේ ප්‍රශ්නය (Question)
            </span>

            {/* Play Question Audio Button */}
            <button
              onClick={handlePlayQuestion}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isPlayingQuestion
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isLoadingQuestion
                  ? 'bg-emerald-700 text-white opacity-90 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
              }`}
              title="ජපන් හඬින් ප්‍රශ්නය අසන්න"
            >
              {isPlayingQuestion ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>නවත්වන්න</span>
                </>
              ) : isLoadingQuestion ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>සූදානම් වෙමින්...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ජපන් හඬින් අසන්න</span>
                </>
              )}
            </button>
          </div>

          {/* Sinhala-Script Pronunciation */}
          <div className="sinhala-safe-box my-1">
            <p className={`font-sinhala ${pronunciationSizeClass} text-slate-900 dark:text-white leading-[1.85]`}>
              "{question.questionSinhalaPronunciation}"
            </p>
          </div>

          {/* Sinhala Meaning */}
          <div className="sinhala-safe-box mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50">
            <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-400 mb-0.5">සිංහල තේරුම:</p>
            <p className={`font-sinhala ${fontSizeClass} text-slate-700 dark:text-slate-300 leading-[1.8]`}>
              {question.questionSinhalaMeaning}
            </p>
          </div>

          {/* Optional Japanese Script (Kanji/Kana) */}
          {settings.showJapaneseScript && (
            <div className="mt-3 pt-2.5 border-t border-dashed border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Japanese Source Script (日本語):
              </span>
              <p className="text-base font-medium text-slate-800 dark:text-slate-100 font-sans tracking-wide">
                {question.questionJapanese}
              </p>
            </div>
          )}
        </div>

        {/* MODEL ANSWER SECTION */}
        <div className="mb-4">
          {!answerRevealed ? (
            <button
              onClick={() => setAnswerRevealed(true)}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2 transition hover:bg-emerald-100/50 active:scale-[0.99] font-sinhala"
            >
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ආදර්ශ පිළිතුර බලන්න (Reveal Model Answer)</span>
            </button>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 rounded-2xl p-4 sm:p-5 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  ඔබේ ආදර්ශ පිළිතුර (Model Answer)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayAnswer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isPlayingAnswer
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isLoadingAnswer
                        ? 'bg-blue-750 text-white opacity-90 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                    }`}
                    title="ජපන් හඬින් පිළිතුර අසන්න"
                  >
                    {isPlayingAnswer ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>නවත්වන්න</span>
                      </>
                    ) : isLoadingAnswer ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>සූදානම් වෙමින්...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>පිළිතුර අසන්න</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setAnswerRevealed(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition"
                    title="පිළිතුර සඟවන්න"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sinhala-Script Pronunciation */}
              <div className="sinhala-safe-box my-1">
                <p className={`font-sinhala ${pronunciationSizeClass} text-slate-900 dark:text-white leading-[1.85]`}>
                  "{question.answerSinhalaPronunciation}"
                </p>
              </div>

              {/* Sinhala Meaning */}
              <div className="sinhala-safe-box mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">සිංහල තේරුම:</p>
                <p className={`font-sinhala ${fontSizeClass} text-slate-700 dark:text-slate-300 leading-[1.8]`}>
                  {question.answerSinhalaMeaning}
                </p>
              </div>

              {/* Optional Japanese Script (Kanji/Kana) */}
              {settings.showJapaneseScript && (
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Japanese Source Script (日本語):
                  </span>
                  <p className="text-base font-medium text-slate-800 dark:text-slate-100 font-sans tracking-wide">
                    {question.answerJapanese}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar Controls: Mic Practice, Prev, Next */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {onOpenMicPractice && (
          <button
            onClick={() => onOpenMicPractice(question)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-sinhala">මයික්‍රෆෝනයෙන් පුහුණු වන්න</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onPrev && (
            <button
              onClick={onPrev}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              කලින්
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition"
            >
              <span>ඊළඟ ප්‍රශ්නය</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
