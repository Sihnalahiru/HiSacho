import React, { useState } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '../data/interviewData.ts';
import { audioService } from '../services/audioService.ts';
import { storageService, UserSettings } from '../services/storageService.ts';
import { useSpeechRecognition, calculateMatchScore } from '../hooks/useSpeechRecognition.ts';
import {
  Mic,
  Square,
  Volume2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sliders,
  Send
} from 'lucide-react';

interface MicrophonePracticeViewProps {
  settings: UserSettings;
  activeQuestion?: InterviewQuestion;
  onSelectQuestion: (question: InterviewQuestion) => void;
}

export const MicrophonePracticeView: React.FC<MicrophonePracticeViewProps> = ({
  settings,
  activeQuestion = INTERVIEW_QUESTIONS[0],
  onSelectQuestion,
}) => {
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const {
    isSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    isWaitingForSpeech,
  } = useSpeechRecognition('ja-JP');

  const handlePlayQuestion = async () => {
    setIsPlayingQuestion(true);
    await audioService.playJapanese(activeQuestion.questionJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onEnd: () => setIsPlayingQuestion(false),
      onError: () => setIsPlayingQuestion(false),
    });
  };

  const handlePlayAnswer = async () => {
    setIsPlayingAnswer(true);
    await audioService.playJapanese(activeQuestion.answerJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onEnd: () => setIsPlayingAnswer(false),
      onError: () => setIsPlayingAnswer(false),
    });
  };

  const handleCalculateScore = () => {
    const spoken = transcript.trim() || manualText.trim();
    if (!spoken) return;
    const score = calculateMatchScore(spoken, activeQuestion.answerJapanese);
    setMatchScore(score);

    storageService.logAttempt({
      questionId: activeQuestion.id,
      mode: 'speech',
      audioRecognized: spoken,
      notes: `Speech score: ${score}%`,
    });
  };

  const handleRequestAiFeedback = async () => {
    const spoken = transcript.trim() || manualText.trim();
    if (!spoken) return;

    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai-coach/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          questionText: activeQuestion.questionJapanese,
          learnerResponse: spoken,
          expectedAnswer: activeQuestion.answerJapanese,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiFeedback(data);
      } else {
        setAiFeedback({
          strengthsSinhala: 'ඔබේ උත්සාහය ඉතා ප්‍රශංසනීයයි.',
          improvementsSinhala: 'ජපන් වාක්‍යයේ අවසාන ආචාරශීලී වචන (දෙස් / මස්) පැහැදිලිව උච්චාරණය කරන්න.',
          encouragementSinhala: 'නොකඩවා පුහුණු වන්න. ඔබට සාර්ථක විය හැකියි!',
        });
      }
    } catch (e) {
      setAiFeedback({
        strengthsSinhala: 'හොඳ උත්සාහයක්.',
        improvementsSinhala: 'කථන වේගය මඳක් සෙමින් තබාගෙන පැහැදිලිව වචන උච්චාරණය කරන්න.',
        encouragementSinhala: 'තව කිහිප වරක් ආදර්ශ පිළිතුරට සවන් දී උත්සාහ කරන්න.',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleReset = () => {
    resetTranscript();
    setManualText('');
    setMatchScore(null);
    setAiFeedback(null);
  };

  const handleNext = () => {
    const currIdx = INTERVIEW_QUESTIONS.findIndex(q => q.id === activeQuestion.id);
    const nextIdx = (currIdx + 1) % INTERVIEW_QUESTIONS.length;
    onSelectQuestion(INTERVIEW_QUESTIONS[nextIdx]);
    handleReset();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold mb-2">
          <Mic className="w-3.5 h-3.5" />
          <span>සජීවී කථන පුහුණුව (Microphone Speaking)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          මයික්‍රෆෝන කථන පුහුණුව
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          මයික්‍රෆෝනය මඟින් ඔබේ ජපන් පිළිතුර කථා කරන්න. බ්‍රවුසරයේ Speech Recognition මඟින් ඔබේ කටහඬ හඳුනාගෙන ආදර්ශ පිළිතුර සමඟ සසඳනු ලබයි.
        </p>
      </div>

      {/* Target Question Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-500 font-sinhala">පුහුණු වන ප්‍රශ්නය තෝරන්න:</label>
        <select
          value={activeQuestion.id}
          onChange={e => {
            const found = INTERVIEW_QUESTIONS.find(q => q.id === e.target.value);
            if (found) {
              onSelectQuestion(found);
              handleReset();
            }
          }}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-sinhala max-w-sm truncate"
        >
          {INTERVIEW_QUESTIONS.map(q => (
            <option key={q.id} value={q.id}>
              {q.id.toUpperCase()}: {q.titleSinhala}
            </option>
          ))}
        </select>
      </div>

      {/* Question Card Display */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
            සම්මුඛ පරීක්ෂකගේ ප්‍රශ්නය ({activeQuestion.id.toUpperCase()})
          </span>

          <button
            onClick={handlePlayQuestion}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition ${
              isPlayingQuestion ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isPlayingQuestion ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>ප්‍රශ්නය අසන්න</span>
          </button>
        </div>

        <div className="sinhala-safe-box">
          <p className="font-sinhala text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-[1.85]">
            "{activeQuestion.questionSinhalaPronunciation}"
          </p>
        </div>

        <div className="sinhala-safe-box pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-slate-500 block mb-0.5">සිංහල තේරුම:</span>
          <p className="font-sinhala text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {activeQuestion.questionSinhalaMeaning}
          </p>
        </div>
      </div>

      {/* Target Model Answer Preview (for reference while practicing) */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
            ඔබ පැවසිය යුතු ආදර්ශ පිළිතුර
          </span>

          <button
            onClick={handlePlayAnswer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition ${
              isPlayingAnswer ? 'bg-rose-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPlayingAnswer ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>පිළිතුර අසන්න</span>
          </button>
        </div>

        <div className="sinhala-safe-box">
          <p className="font-sinhala text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-[1.85]">
            "{activeQuestion.answerSinhalaPronunciation}"
          </p>
        </div>

        <div className="sinhala-safe-box pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-400 block mb-0.5">සිංහල තේරුම:</span>
          <p className="font-sinhala text-xs text-slate-600 dark:text-slate-300">
            {activeQuestion.answerSinhalaMeaning}
          </p>
        </div>
      </div>

      {/* Microphone Speaking Action Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sinhala">
            මයික්‍රෆෝනයෙන් කථා කරන්න
          </h3>

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-sinhala"
          >
            {showManualInput ? 'මයික්‍රෆෝනය භාවිත කරන්න' : 'යතුරු ලියනය (Keyboard Fallback)'}
          </button>
        </div>

        {!showManualInput ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
              {isListening ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto animate-pulse shadow-xl">
                    <Mic className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-sinhala block">
                      {isWaitingForSpeech ? 'කටහඬ බලාපොරොත්තුවෙන්...' : 'සවන් දෙමින් පවතී...'}
                    </span>
                    <p className="text-xs text-slate-500 font-sinhala mt-1">
                      තත්පර 4ක් නිහඬ වූ විට ස්වයංක්‍රීයව පටිගත වීම අවසන් වේ.
                    </p>
                  </div>
                  <button
                    onClick={stopListening}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold font-sinhala"
                  >
                    කථා කර අවසන් (Stop)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={startListening}
                    className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-lg hover:scale-105 active:scale-95 transition"
                    title="කථා කිරීම ආරම්භ කරන්න"
                  >
                    <Mic className="w-10 h-10" />
                  </button>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sinhala block">
                      මයික්‍රෆෝනය ඔබා ජපන් පිළිතුර පවසන්න
                    </span>
                    <span className="text-xs text-slate-400 font-sinhala">
                      ja-JP භාෂා හඳුනාගැනීම සක්‍රියයි
                    </span>
                  </div>
                </div>
              )}
            </div>

            {speechError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 font-sinhala flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            {transcript && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 space-y-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block font-sinhala">
                  ඔබ පැවසූ ජපන් වාක්‍යය (Recognized Transcript):
                </span>
                <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                  {transcript}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="ඔබේ පිළිතුර මෙහි ඇතුළත් කරන්න (ජපන් අකුරෙන් හෝ රෝමාජි)..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Action Buttons: Evaluate, AI Feedback, Reset */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={handleCalculateScore}
            disabled={!transcript && !manualText}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-sinhala"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ගැළපීම පරීක්ෂා කරන්න (Calculate Score)</span>
          </button>

          <button
            onClick={handleRequestAiFeedback}
            disabled={(!transcript && !manualText) || isLoadingAi}
            className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-sinhala"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoadingAi ? 'විශ්ලේෂණය කරමින්...' : 'AI උපදෙස්'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition"
            title="නැවත සකසන්න"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Match Score Display */}
        {matchScore !== null && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-sinhala">
                පාඨමය ගැළපීමේ ප්‍රතිශතය (Text Match Score):
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {matchScore}%
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-sinhala leading-normal">
              * සටහන: මෙම ලකුණ ගණනය කෙරෙන්නේ හඬින් හඳුනාගත් පාඨය සහ ආදර්ශ පිළිතුර අතර ඇති ලෙවෙන්ස්ටයින් අනුරූපතාව අනුව වන අතර එය නිරපේක්ෂ උච්චාරණ ලකුණක් නොවේ.
            </p>
          </div>
        )}

        {/* AI Feedback Card */}
        {aiFeedback && (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 text-xs font-sinhala leading-relaxed">
            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI සම්මුඛ පරීක්ෂණ පුහුණුකරුගේ උපදෙස්:</span>
            </span>

            {aiFeedback.strengthsSinhala && (
              <p>
                <strong>ශක්තිමත් කරුණු:</strong> {aiFeedback.strengthsSinhala}
              </p>
            )}

            {aiFeedback.improvementsSinhala && (
              <p>
                <strong>වැඩිදියුණු කළ යුතු දේ:</strong> {aiFeedback.improvementsSinhala}
              </p>
            )}

            {aiFeedback.encouragementSinhala && (
              <p className="text-purple-700 dark:text-purple-300 font-medium">
                {aiFeedback.encouragementSinhala}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next Question Navigation */}
      <button
        onClick={handleNext}
        className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition flex items-center justify-center gap-2 font-sinhala"
      >
        <span>ඊළඟ ප්‍රශ්නය වෙත යන්න</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
