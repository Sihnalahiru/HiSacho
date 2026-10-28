import React from 'react';
import { INTERVIEW_QUESTIONS, CandidateProfile } from '../data/interviewData.ts';
import { UserSettings } from '../services/storageService.ts';
import {
  Play,
  RotateCcw,
  Sparkles,
  Bookmark,
  CheckCircle2,
  FileText,
  Volume2,
  Award,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  completedIds: string[];
  favoriteIds: string[];
  revisionIds: string[];
  profile: CandidateProfile;
  settings: UserSettings;
  onNavigate: (view: string, categoryFilter?: string) => void;
  onStartSimulation: () => void;
  onStartPractice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  completedIds,
  favoriteIds,
  revisionIds,
  profile,
  settings,
  onNavigate,
  onStartSimulation,
  onStartPractice,
}) => {
  const totalQuestions = INTERVIEW_QUESTIONS.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalQuestions) * 100);

  // CV questions count
  const cvQuestionsCount = INTERVIEW_QUESTIONS.filter(q => q.isCvSpecific).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 backdrop-blur-xs text-xs font-semibold text-emerald-100 mb-3 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>ජපන් SSW කෘෂිකාර්මික සම්මුඛ පරීක්ෂණ පුහුණුව (Specified Skilled Worker)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 font-sinhala leading-snug">
            සම්මුඛ පරීක්ෂණයෙන් ජය ගැනීමට පූර්ණ පුහුණුවක්
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 font-sinhala leading-relaxed mb-6">
            සියලුම සම්මත ප්‍රශ්න 35, සිංහල උච්චාරණය, තේරුම සහ සත්‍ය ජපන් හඬ (Japanese Speech Audio) සමඟින් නිවැරදිව ප්‍රගුණ කරන්න.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartPractice}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition font-sinhala"
            >
              <Play className="w-4 h-4 fill-emerald-800 text-emerald-800" />
              <span>ප්‍රශ්නාවලිය ආරම්භ කරන්න (Start)</span>
            </button>

            <button
              onClick={onStartSimulation}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600/70 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-400/40 backdrop-blur-xs active:scale-95 transition font-sinhala"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>සජීවී විභාග අනුකරණය (Simulation)</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Artwork */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <svg width="320" height="320" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40 160 C 20 100, 80 40, 140 30 C 140 90, 80 150, 40 160 Z" />
            <path d="M120 140 C 90 90, 130 50, 170 40 C 170 80, 140 120, 120 140 Z" />
          </svg>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('practice')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">ප්‍රගතිය</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{progressPercent}%</span>
            <span className="text-xs text-slate-400 font-medium">({completedCount}/35)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div
          onClick={() => onNavigate('favorites')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-rose-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">ප්‍රියතම</span>
            <Bookmark className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{favoriteIds.length}</span>
            <span className="text-xs text-slate-400 font-medium">ප්‍රශ්න</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate font-sinhala">ප්‍රියතම ලැයිස්තුව</p>
        </div>

        <div
          onClick={() => onNavigate('revision')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-orange-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">නැවත බැලීම</span>
            <RotateCcw className="w-4 h-4 text-orange-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{revisionIds.length}</span>
            <span className="text-xs text-slate-400 font-medium">ප්‍රශ්න</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate font-sinhala">පුහුණු විය යුතු දේ</p>
        </div>

        <div
          onClick={() => onNavigate('cv-focus')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CV විශේෂිත</span>
            <FileText className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{cvQuestionsCount}</span>
            <span className="text-xs text-slate-400 font-medium">ප්‍රශ්න</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate font-sinhala">මූල්‍ය → කෘෂිකර්ම</p>
        </div>
      </div>

      {/* Candidate Profile Spotlight */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              අයදුම්කරුගේ පැතිකඩ (Candidate Profile)
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sinhala mt-0.5">
              {profile.fullName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ජපන් උච්චාරණය: <span className="font-medium text-slate-700 dark:text-slate-300 font-sans">{profile.pronunciationKana}</span> | ගම: {profile.hometown}
            </p>
          </div>

          <button
            onClick={() => onNavigate('cv-focus')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition font-sinhala"
          >
            <span>CV ප්‍රශ්න වෙත යන්න</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sinhala leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium block mb-1">දැනට කරන රැකියාව (Current Role):</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{profile.currentRole}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium block mb-1">කෘෂිකාර්මික අත්දැකීම් (Farming Background):</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{profile.agriculturalBackground}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-sinhala">ඉලක්කගත ක්ෂේත්‍රය: {profile.targetSector}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-sinhala">ප්‍රශ්න 35ම සූදානම්</span>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Practice All 35 */}
        <div
          onClick={() => onNavigate('practice')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              ප්‍රශ්න 35ම කාඩ්පත් ආකාරයෙන් පුහුණුව
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              සෑම ප්‍රශ්නයකම සිංහල උච්චාරණය, තේරුම සහ ආදර්ශ පිළිතුර ශ්‍රවණය කරමින් පියවරෙන් පියවර පුහුණු වන්න.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-sinhala">
            <span>පුහුණුවට යන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 2: Interview Simulation */}
        <div
          onClick={onStartSimulation}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-3 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              සජීවී සම්මුඛ පරීක්ෂණ අනුකරණය (Simulation)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              ජපන් පරීක්ෂකවරයා ප්‍රශ්න අසයි. පිළිතුර සඟවා ඇති අතර ඔබ හඬින් පිළිතුරු දුන් පසු ආදර්ශ පිළිතුර විවර වේ.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 font-sinhala">
            <span>අනුකරණය ආරම්භ කරන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 3: Voice Lab & Audio Speed */}
        <div
          onClick={() => onNavigate('voicelab')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-400 mb-3 group-hover:scale-105 transition">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              ජපන් කටහඬ විද්‍යාගාරය (Voice Lab)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              Native ජපන් කටහඬවල් සහ Gemini AI TTS හඬවල් සංසන්දනය කරන්න. කථන වේගය සකසන්න.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 font-sinhala">
            <span>විද්‍යාගාරයට යන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 4: Microphone Practice */}
        <div
          onClick={() => onNavigate('speech-practice')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-3 group-hover:scale-105 transition">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              මයික්‍රෆෝන කථන පුහුණුව
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              මයික්‍රෆෝනය මඟින් ජපන් පිළිතුර කථා කර පරීක්ෂා කරගන්න. නිශ්ශබ්දතා හඳුනාගැනීම සහ ප්‍රතිඵල ඇගයීම.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 font-sinhala">
            <span>කථන පුහුණුවට යන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 5: Category Library */}
        <div
          onClick={() => onNavigate('library')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 mb-3 group-hover:scale-105 transition">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              කෘෂිකාර්මික වර්ගීකරණ පුස්තකාලය
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              පස සකස් කිරීම, බීජ වැපිරීම, පළිබෝධ පාලනය, අස්වැන්න නෙළීම, ආරක්ෂාව සහ විනය වර්ග අනුව අධ්‍යයනය කරන්න.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 font-sinhala">
            <span>පුස්තකාලය බලන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 6: Integrity & Diagnostics */}
        <div
          onClick={() => onNavigate('tests')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs cursor-pointer transition flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-3 group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
              දත්ත හා යුනිකෝඩ් පරීක්ෂාව (Diagnostics)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
              ප්‍රශ්න 35ම නිවැරදි බව, සිංහල යුනිකෝඩ් අකුරු නොකැඩී පවතින බව සජීවීව පරීක්ෂා කර බැලීම.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 font-sinhala">
            <span>පරීක්ෂණ වාර්තාව බලන්න</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};
