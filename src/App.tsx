import React, { useState, useEffect } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion, CandidateProfile, DEFAULT_CANDIDATE_PROFILE } from './data/interviewData.ts';
import { storageService, UserSettings, DEFAULT_SETTINGS } from './services/storageService.ts';
import { audioService } from './services/audioService.ts';

// Views
import { DashboardView } from './views/DashboardView.tsx';
import { PracticeView } from './views/PracticeView.tsx';
import { SimulationView } from './views/SimulationView.tsx';
import { QuestionCardsView } from './views/QuestionCardsView.tsx';
import { AnswerCardsView } from './views/AnswerCardsView.tsx';
import { CategoryLibraryView } from './views/CategoryLibraryView.tsx';
import { CvPracticeView } from './views/CvPracticeView.tsx';
import { VoiceLabView } from './views/VoiceLabView.tsx';
import { MicrophonePracticeView } from './views/MicrophonePracticeView.tsx';
import { FilteredDeckView } from './views/FavoritesView.tsx';
import { StatsView } from './views/StatsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { OfflineDiagnosticsView } from './views/OfflineDiagnosticsView.tsx';

// Components
import { PWAInstallButton } from './components/PWAInstallButton.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';

// Icons
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  FileText,
  Volume2,
  Mic,
  Bookmark,
  RotateCcw,
  BarChart3,
  Settings,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
  Menu,
  X,
  HelpCircle,
  Award,
  MoreHorizontal
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [profile, setProfile] = useState<CandidateProfile>(storageService.getProfile());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(storageService.getFavorites());
  const [completedIds, setCompletedIds] = useState<string[]>(storageService.getCompletedIds());
  const [revisionIds, setRevisionIds] = useState<string[]>(storageService.getRevisionQueue());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [micModalQuestion, setMicModalQuestion] = useState<InterviewQuestion | null>(null);

  // Sync dark theme class on documentElement
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Audio cleanup on view change
  useEffect(() => {
    audioService.stop();
  }, [activeTab]);

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleUpdateProfile = (newProfile: CandidateProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = storageService.toggleFavorite(id);
    setFavoriteIds(updated);
  };

  const handleToggleCompleted = (id: string) => {
    const updated = storageService.toggleCompleted(id);
    setCompletedIds(updated);
  };

  const handleToggleRevision = (id: string) => {
    const updated = storageService.toggleRevision(id);
    setRevisionIds(updated);
  };

  const handleResetProgress = () => {
    storageService.resetAllProgress();
    setFavoriteIds([]);
    setCompletedIds([]);
    setRevisionIds([]);
  };

  const handleResetAllData = () => {
    storageService.resetAllProgress();
    setFavoriteIds([]);
    setCompletedIds([]);
    setRevisionIds([]);
    setSettings(DEFAULT_SETTINGS);
    setProfile(DEFAULT_CANDIDATE_PROFILE);
    storageService.saveSettings(DEFAULT_SETTINGS);
    storageService.saveProfile(DEFAULT_CANDIDATE_PROFILE);
  };

  const navigateTo = (tab: string, cat?: string) => {
    setActiveTab(tab);
    if (cat) setCategoryFilter(cat);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white font-sinhala">
                  SSW ජපන් කෘෂිකර්ම
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  35 Q&A
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sinhala truncate max-w-[200px] sm:max-w-xs">
                {profile.fullName} • මාතර
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop only) */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              මුල් පිටුව
            </button>
            <button
              onClick={() => navigateTo('practice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'practice'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              කාඩ්පත් පුහුණුව
            </button>
            <button
              onClick={() => navigateTo('simulation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'simulation'
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              සජීවී පෙරහුරුව
            </button>
            <button
              onClick={() => navigateTo('cv-focus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'cv-focus'
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              CV විශේෂිත
            </button>
            <button
              onClick={() => navigateTo('library')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'library'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              වර්ගීකරණය
            </button>
            <button
              onClick={() => navigateTo('voicelab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'voicelab'
                  ? 'bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              කටහඬ විද්‍යාගාරය
            </button>
            <button
              onClick={() => navigateTo('speech-practice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'speech-practice'
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              කථා පුහුණුව
            </button>
            <button
              onClick={() => navigateTo('tests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sinhala transition ${
                activeTab === 'tests'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              පරීක්ෂණ
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Japanese Script Toggle Quick Switch */}
            <button
              onClick={() =>
                handleUpdateSettings({
                  ...settings,
                  showJapaneseScript: !settings.showJapaneseScript,
                })
              }
              title={
                settings.showJapaneseScript
                  ? 'ජපන් අක්ෂර සඟවන්න (Hide Japanese Script)'
                  : 'ජපන් අක්ෂර පෙන්වන්න (Show Japanese Script)'
              }
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                settings.showJapaneseScript
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline font-sans text-[11px]">
                {settings.showJapaneseScript ? '日本語 ON' : '日本語 OFF'}
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() =>
                handleUpdateSettings({
                  ...settings,
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="වර්ණ තේමාව වෙනස් කරන්න"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => navigateTo('settings')}
              className={`p-2 rounded-xl transition ${
                activeTab === 'settings'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="සැකසුම්"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="මෙනුව"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg">
            <div className="grid grid-cols-2 gap-1.5 font-sinhala text-xs">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>මුල් පිටුව</span>
              </button>

              <button
                onClick={() => navigateTo('practice')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'practice'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>කාඩ්පත් පුහුණුව</span>
              </button>

              <button
                onClick={() => navigateTo('simulation')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'simulation'
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>සජීවී පෙරහුරුව</span>
              </button>

              <button
                onClick={() => navigateTo('cv-focus')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'cv-focus'
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>CV විශේෂිත</span>
              </button>

              <button
                onClick={() => navigateTo('questions-all')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'questions-all'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>ප්‍රශ්න 35 ම</span>
              </button>

              <button
                onClick={() => navigateTo('answers-all')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'answers-all'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>පිළිතුරු 35 ම</span>
              </button>

              <button
                onClick={() => navigateTo('library')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'library'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>වර්ගීකරණය</span>
              </button>

              <button
                onClick={() => navigateTo('voicelab')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'voicelab'
                    ? 'bg-purple-50 text-purple-800 dark:bg-purple-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>කටහඬ විද්‍යාගාරය</span>
              </button>

              <button
                onClick={() => navigateTo('speech-practice')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'speech-practice'
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>කථා පුහුණුව</span>
              </button>

              <button
                onClick={() => navigateTo('favorites')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'favorites'
                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>ප්‍රියතම ({favoriteIds.length})</span>
              </button>

              <button
                onClick={() => navigateTo('revision')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'revision'
                    ? 'bg-orange-50 text-orange-800 dark:bg-orange-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>නැවත බැලීමට ({revisionIds.length})</span>
              </button>

              <button
                onClick={() => navigateTo('stats')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'stats'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>ප්‍රගති වාර්තාව</span>
              </button>

              <button
                onClick={() => navigateTo('tests')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'tests'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>දත්ත පරීක්ෂණ</span>
              </button>

              <button
                onClick={() => navigateTo('settings')}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'bg-slate-200 dark:bg-slate-800 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>සැකසුම්</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            completedIds={completedIds}
            favoriteIds={favoriteIds}
            revisionIds={revisionIds}
            profile={profile}
            settings={settings}
            onNavigate={navigateTo}
            onStartSimulation={() => navigateTo('simulation')}
            onStartPractice={() => navigateTo('practice')}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            settings={settings}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            initialCategory={categoryFilter}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationView
            settings={settings}
            onFinish={() => navigateTo('stats')}
          />
        )}

        {activeTab === 'cv-focus' && (
          <CvPracticeView
            settings={settings}
            profile={profile}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            onUpdateProfile={handleUpdateProfile}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
          />
        )}

        {activeTab === 'questions-all' && (
          <QuestionCardsView
            settings={settings}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
          />
        )}

        {activeTab === 'answers-all' && (
          <AnswerCardsView
            settings={settings}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
          />
        )}

        {activeTab === 'library' && (
          <CategoryLibraryView
            onSelectCategory={catId => navigateTo('practice', catId)}
          />
        )}

        {activeTab === 'voicelab' && (
          <VoiceLabView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'speech-practice' && (
          <MicrophonePracticeView
            settings={settings}
            activeQuestion={micModalQuestion || INTERVIEW_QUESTIONS[0]}
            onSelectQuestion={q => setMicModalQuestion(q)}
          />
        )}

        {activeTab === 'favorites' && (
          <FilteredDeckView
            type="favorites"
            settings={settings}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
            onNavigateToPractice={() => navigateTo('practice')}
          />
        )}

        {activeTab === 'revision' && (
          <FilteredDeckView
            type="revision"
            settings={settings}
            favoriteIds={favoriteIds}
            completedIds={completedIds}
            revisionIds={revisionIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompleted={handleToggleCompleted}
            onToggleRevision={handleToggleRevision}
            onOpenMicPractice={q => setMicModalQuestion(q)}
            onNavigateToPractice={() => navigateTo('practice')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            completedIds={completedIds}
            favoriteIds={favoriteIds}
            revisionIds={revisionIds}
            onResetProgress={handleResetProgress}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
          />
        )}

        {activeTab === 'tests' && (
          <OfflineDiagnosticsView />
        )}
      </main>

      {/* Global Mic Practice Modal if requested from any card */}
      {micModalQuestion && activeTab !== 'speech-practice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8">
            <button
              onClick={() => setMicModalQuestion(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <MicrophonePracticeView
              settings={settings}
              activeQuestion={micModalQuestion}
              onSelectQuestion={q => setMicModalQuestion(q)}
            />
          </div>
        </div>
      )}

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16 px-1 safe-area-pb">
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-sinhala mt-0.5">මුල් පිටුව</span>
        </button>

        <button
          onClick={() => navigateTo('practice')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'practice'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-sinhala mt-0.5">පුහුණුව</span>
        </button>

        <button
          onClick={() => navigateTo('simulation')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'simulation'
              ? 'text-blue-700 dark:text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-sinhala mt-0.5">පෙරහුරුව</span>
        </button>

        <button
          onClick={() => navigateTo('cv-focus')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'cv-focus'
              ? 'text-blue-700 dark:text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-sinhala mt-0.5">CV ප්‍රශ්න</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            mobileMenuOpen
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-sinhala mt-0.5">තවත්</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
