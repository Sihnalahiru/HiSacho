import React, { useState, useEffect } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '../data/interviewData.ts';
import { audioService } from '../services/audioService.ts';
import { storageService, UserSettings } from '../services/storageService.ts';
import { useSpeechRecognition, calculateMatchScore } from '../hooks/useSpeechRecognition.ts';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Square,
  Mic,
  MicOff,
  Eye,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  X
} from 'lucide-react';

interface SimulationViewProps {
  settings: UserSettings;
  onFinish?: () => void;
}

type SimulationMode = 'quick10' | 'full35' | 'cv8';

export const SimulationView: React.FC<SimulationViewProps> = ({ settings, onFinish }) => {
  const [selectedMode, setSelectedMode] = useState<SimulationMode>('quick10');
  const [isRunning, setIsRunning] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);
  const [showQuestionPronunciation, setShowQuestionPronunciation] = useState(true);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Scores and responses
  const [scores, setScores] = useState<{ [qId: string]: number }>({});
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Speech recognition hook
  const {
    isSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    isWaitingForSpeech,
  } = useSpeechRecognition('ja-JP');

  const currentQ = questions[currentIndex];

  const startSimulation = (mode: SimulationMode) => {
    setSelectedMode(mode);
    let qList: InterviewQuestion[] = [];

    if (mode === 'cv8') {
      qList = INTERVIEW_QUESTIONS.filter(q => q.isCvSpecific);
    } else if (mode === 'full35') {
      qList = [...INTERVIEW_QUESTIONS];
    } else {
      // quick 10 random
      qList = [...INTERVIEW_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    setQuestions(qList);
    setCurrentIndex(0);
    setScores({});
    setAnswerRevealed(false);
    setIsExamCompleted(false);
    resetTranscript();
    setManualText('');
    setIsRunning(true);
  };

  // Play question automatically or when question changes
  useEffect(() => {
    if (isRunning && currentQ) {
      setAnswerRevealed(false);
      resetTranscript();
      setManualText('');

      // Auto play question voice if user enabled setting or by default on entering question
      const timer = setTimeout(() => {
        handlePlayQuestionVoice();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isRunning]);

  const handlePlayQuestionVoice = async () => {
    if (!currentQ) return;
    if (isPlayingQuestion) {
      audioService.stop();
      setIsPlayingQuestion(false);
      return;
    }
    audioService.stop();
    setIsPlayingAnswer(false);
    setIsPlayingQuestion(true);
    await audioService.playJapanese(currentQ.questionJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onStart: () => setIsPlayingQuestion(true),
      onEnd: () => setIsPlayingQuestion(false),
      onError: () => setIsPlayingQuestion(false),
    });
  };

  const handlePlayAnswerVoice = async () => {
    if (!currentQ) return;
    if (isPlayingAnswer) {
      audioService.stop();
      setIsPlayingAnswer(false);
      return;
    }
    audioService.stop();
    setIsPlayingQuestion(false);
    setIsPlayingAnswer(true);
    await audioService.playJapanese(currentQ.answerJapanese, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onStart: () => setIsPlayingAnswer(true),
      onEnd: () => setIsPlayingAnswer(false),
      onError: () => setIsPlayingAnswer(false),
    });
  };

  const handleEvaluateAndReveal = () => {
    if (!currentQ) return;
    const spoken = transcript.trim() || manualText.trim();
    // Calculate textual similarity percentage
    const match = calculateMatchScore(spoken, currentQ.answerJapanese);
    setScores(prev => ({ ...prev, [currentQ.id]: match }));
    setAnswerRevealed(true);

    // Log attempt to storage
    storageService.logAttempt({
      questionId: currentQ.id,
      mode: 'simulation',
      audioRecognized: spoken || undefined,
      notes: `Match similarity: ${match}%`,
    });
  };

  const handleNextQuestion = () => {
    audioService.stop();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finish exam
      setIsExamCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Pre-start Setup Screen
  if (!isRunning) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 pb-20">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sinhala">
            සජීවී සම්මුඛ පරීක්ෂණ අනුකරණය (Simulation)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala max-w-lg mx-auto leading-relaxed">
            ජපන් ජාතික පරීක්ෂකවරයෙකු ඉදිරියේ සිටින්නාක් මෙන් සැබෑ සම්මුඛ පරීක්ෂණයකට මුහුණ දෙන්න. ප්‍රශ්නය ශ්‍රවණය කර හඬින් හෝ අකුරෙන් පිළිතුරු සපයන්න.
          </p>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div
            onClick={() => setSelectedMode('quick10')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              selectedMode === 'quick10'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                කෙටි පෙරහුරුව
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">ප්‍රශ්න 10 ක්</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala mt-1">
                අහඹු ලෙස තෝරාගත් ප්‍රශ්න 10 ක ඉක්මන් පෙරහුරුවක්.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-4 block font-medium">මිනිත්තු 10-15</span>
          </div>

          <div
            onClick={() => setSelectedMode('cv8')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              selectedMode === 'cv8'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">
                CV මූල්‍ය → කෘෂිකර්ම
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">CV ප්‍රශ්න 8</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala mt-1">
                මූල්‍ය රැකියාවේ සිට කෘෂිකර්මයට මාරුවීම හා පවුලේ අත්දැකීම්.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-4 block font-medium">අතිශය වැදගත්</span>
          </div>

          <div
            onClick={() => setSelectedMode('full35')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              selectedMode === 'full35'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block mb-1">
                සම්පූර්ණ විභාගය
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">ප්‍රශ්න 35 ම</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala mt-1">
                සම්පූර්ණ ප්‍රශ්නාවලියම ආවරණය වන පූර්ණ විභාග පෙරහුරුව.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-4 block font-medium">මිනිත්තු 35-45</span>
          </div>
        </div>

        {/* Candidate Context Reminder */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs font-sinhala leading-relaxed text-amber-900 dark:text-amber-200">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>සම්මුඛ පරීක්ෂණ උපදෙස් (Candidate Context):</span>
          </p>
          <p>
            ඔබේ නම <strong>ලහිරු මදුසන්ක (Lahiru Madusanka)</strong>. ගම <strong>මාතර</strong>. ඔබ මූල්‍ය හා ණය අයකර ගැනීමේ සේවය කරන අතර මාතර පවුලේ වගාවේ එළවළු හා මිරිස් වගා කළ අත්දැකීම් ඇත. ජපානයේ කෘෂිකාර්මික තාක්ෂණය ඉගෙනගැනීමට හා වගකීමෙන් සේවය කිරීමට කැපවී සිටින බව ප්‍රකාශ කරන්න.
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={() => startSimulation(selectedMode)}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 font-sinhala"
        >
          <Sparkles className="w-4 h-4" />
          <span>අනුකරණය ආරම්භ කරන්න (Start Simulation)</span>
        </button>
      </div>
    );
  }

  // Completion Screen
  if (isExamCompleted) {
    const scoredList = Object.values(scores);
    const avgScore = scoredList.length > 0 ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length) : 85;

    return (
      <div className="max-w-md mx-auto text-center py-8 space-y-6 pb-20">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
            සම්මුඛ පරීක්ෂණ පෙරහුරුව සාර්ථකයි!
          </h2>
          <p className="text-xs text-slate-500 font-sinhala">
            ඔබ ප්‍රශ්න {questions.length} ම සාර්ථකව අවසන් කළා.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">සාමාන්‍ය අනුරූපතා ලකුණ</span>
            <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {avgScore}%
            </div>
            <p className="text-[11px] text-slate-400 font-sinhala mt-1">
              (ආදර්ශ පිළිතුර සමඟ වචන හා වාක්‍ය ගැළපීමේ ප්‍රතිශතය)
            </p>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 font-sinhala border-t border-slate-100 dark:border-slate-800 pt-3">
            නොකඩවා පුහුණු වීමෙන් ඔබට සැබෑ ජපන් කෘෂිකාර්මික සම්මුඛ පරීක්ෂණයේදී බියෙන් තොරව, චතුර ලෙස පිළිතුරු දීමට හැකියාව ලැබේ.
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => startSimulation(selectedMode)}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition font-sinhala flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>නැවත පෙරහුරුවක් කරන්න (Retry)</span>
          </button>

          <button
            onClick={() => setIsRunning(false)}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition font-sinhala"
          >
            පෙරහුරු තේරීමට ආපසු යන්න
          </button>
        </div>
      </div>
    );
  }

  // Active Simulation Screen
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20">
      {/* Top Bar with Progress and Exit */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            ප්‍රශ්නය {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">({currentQ?.id.toUpperCase()})</span>
        </div>

        <button
          onClick={() => {
            audioService.stop();
            setIsRunning(false);
          }}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-sinhala"
        >
          <X className="w-3.5 h-3.5" />
          <span>ඉවත්වන්න</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Interviewer Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              面接
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sinhala">
                ජපන් සම්මුඛ පරීක්ෂක (Interviewer)
              </h3>
              <p className="text-[11px] text-slate-400 font-sinhala">ප්‍රශ්නය අසනු ලබයි</p>
            </div>
          </div>

          <button
            onClick={handlePlayQuestionVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isPlayingQuestion
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {isPlayingQuestion ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>නවත්වන්න</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>නැවත අසන්න</span>
              </>
            )}
          </button>
        </div>

        {/* Question Text in Sinhala Pronunciation */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="sinhala-safe-box">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block mb-1">
              ප්‍රශ්නයේ සිංහල උච්චාරණය:
            </span>
            <p className="font-sinhala text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-[1.85]">
              "{currentQ?.questionSinhalaPronunciation}"
            </p>
          </div>

          <div className="sinhala-safe-box mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">සිංහල තේරුම:</span>
            <p className="font-sinhala text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQ?.questionSinhalaMeaning}
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Response Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            ඔබගේ පිළිතුර (Your Response)
          </span>

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-sinhala"
          >
            {showManualInput ? 'මයික්‍රෆෝනයට මාරුවන්න' : 'යතුරු ලියනයෙන් ඇතුළත් කරන්න'}
          </button>
        </div>

        {/* Mic Control or Manual Input */}
        {!showManualInput ? (
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center">
              {isListening ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto animate-pulse shadow-lg">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-sinhala block">
                      {isWaitingForSpeech ? 'කටහඬ බලාපොරොත්තුවෙන්...' : 'සවන් දෙමින් පවතී...'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sinhala">
                      ජපන් බසින් ඔබේ පිළිතුර පවසන්න
                    </span>
                  </div>
                  <button
                    onClick={stopListening}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold font-sinhala"
                  >
                    කථා කර අවසන් (Stop)
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startListening}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md hover:scale-105 active:scale-95 transition"
                    title="මයික්‍රෆෝනය ආරම්භ කරන්න"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sinhala block">
                      පිළිතුරු දීමට මයික්‍රෆෝනය ඔබන්න
                    </span>
                    <span className="text-[11px] text-slate-400 font-sinhala">
                      වෙබ් හඬ හඳුනාගැනීම (Web Speech Recognition)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error notice if mic failed */}
            {speechError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 font-sinhala flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Live Transcript Display */}
            {transcript && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
                  හඳුනාගත් කථනය (Recognized Speech):
                </span>
                <p className="font-mono text-sm">{transcript}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="ඔබේ පිළිතුර මෙහි යතුරු ලියනය කරන්න (ජපන් හෝ රෝමාජි)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-sinhala"
            />
          </div>
        )}

        {/* Submit or Reveal Answer Button */}
        {!answerRevealed ? (
          <button
            onClick={handleEvaluateAndReveal}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-98 transition flex items-center justify-center gap-2 font-sinhala"
          >
            <Eye className="w-4 h-4" />
            <span>පිළිතුර ඉදිරිපත් කර ආදර්ශ පිළිතුර බලන්න</span>
          </button>
        ) : (
          /* Answer Revealed Box */
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ආදර්ශ පිළිතුර (Model Answer)
              </span>

              <button
                onClick={handlePlayAnswerVoice}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>ජපන් හඬින් අසන්න</span>
              </button>
            </div>

            {/* Sinhala-Script Pronunciation */}
            <div className="sinhala-safe-box">
              <span className="text-[11px] font-bold text-emerald-800/80 block mb-0.5">සිංහල උච්චාරණය:</span>
              <p className="font-sinhala text-base font-bold text-slate-900 dark:text-white leading-[1.85]">
                "{currentQ?.answerSinhalaPronunciation}"
              </p>
            </div>

            {/* Sinhala Meaning */}
            <div className="sinhala-safe-box pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">සිංහල තේරුම:</span>
              <p className="font-sinhala text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQ?.answerSinhalaMeaning}
              </p>
            </div>

            {/* Match Score */}
            {scores[currentQ.id] !== undefined && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
                <span className="font-sinhala text-slate-600 dark:text-slate-400">
                  පාඨ අනුරූපතා ප්‍රතිශතය (Text Similarity):
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {scores[currentQ.id]}%
                </span>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNextQuestion}
              className="w-full mt-3 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-sinhala"
            >
              <span>ඊළඟ ප්‍රශ්නය වෙත යන්න</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
