import React from 'react';
import { UserSettings } from '../services/storageService.ts';
import {
  Settings,
  Languages,
  Type,
  Sun,
  Moon,
  Volume2,
  Trash2,
  Shield,
  Smartphone,
  Info,
  Cpu,
  Sparkles,
  Sliders
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>යෙදුම් සැකසුම්</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          සැකසුම් (Settings & Learning Mode)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          ජපන් අක්ෂර දර්ශනය වීම, සිංහල අකුරු ප්‍රමාණය, කටහඬ වේගය සහ අතුරුමුහුණතේ වර්ණ තේමාව ඔබේ රුචිකත්වයට අනුව වෙනස් කරගන්න.
        </p>
      </div>

      {/* Japanese Script Display Mode (Non-negotiable requirement Part A #5 & Part F #14) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Languages className="w-4 h-4" />
              <span>විකල්ප ජපන් අක්ෂර ඉගෙනුම් මාදිලිය (Japanese Script Mode)</span>
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
              කාඩ්පත්වල මුල් ජපන් අක්ෂර (Kanji / Kana) පෙන්වන්න
            </h2>
            <p className="text-xs text-slate-500 font-sinhala leading-relaxed">
              පෙරනිමියෙන් මෙම යෙදුම සිංහල උච්චාරණය සහ තේරුම පමණක් පෙන්වන අතර ජපන් අකුරු සඟවා ඇත. ඔබට මුල් ජපන් අක්ෂර (Kanji / Kana) බලාගැනීමට අවශ්‍ය නම් මෙම විකල්පය සක්‍රිය කරන්න.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={settings.showJapaneseScript}
              onChange={e => onUpdateSettings({ ...settings, showJapaneseScript: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {settings.showJapaneseScript && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-sinhala leading-normal flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>ජපන් අක්ෂර දර්ශනය සක්‍රියයි. සියලු ප්‍රශ්න හා පිළිතුරු කාඩ්පත්වල මුල් ජපන් පෙළ ද දිස්වනු ඇත.</span>
          </div>
        )}
      </div>

      {/* Voice & Audio Engine (Gemini Cloud TTS vs Native) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>ජපන් කටහඬ එන්ජිම (Speech Synthesis Engine)</span>
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
            කටහඬ ක්‍රමය තෝරන්න (Select Voice Engine)
          </h2>
          <p className="text-xs text-slate-500 font-sinhala leading-relaxed">
            ඔබේ දුරකථනයේ ජපන් කටහඬක් ස්ථාපනය කර නොමැති නම් Google Gemini Cloud TTS තෝරා තබන්න.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, ttsEngine: 'native' })}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              settings.ttsEngine === 'native'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 font-sans">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Native Web Speech API
              </span>
              {settings.ttsEngine === 'native' && (
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">සක්‍රියයි</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-sinhala">
              ඔබේ දුරකථනයේ සවි කර ඇති ජපන් කටහඬ. කිසිදු සීමාවක් නොමැතිව 100% නොමිලේ, Offline සහ GitHub Pages හි ක්ෂණිකව ක්‍රියා කරයි.
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">
              ක්ෂණිකයි • නොමිලේ (Offline & GitHub Pages)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, ttsEngine: 'gemini', ttsVoice: 'Kore' })}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              settings.ttsEngine === 'gemini'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Google Gemini Cloud TTS
              </span>
              {settings.ttsEngine === 'gemini' && (
                <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">සක්‍රියයි</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-sinhala">
              ස්වභාවික මිනිස් ජපන් උච්චාරණය (gemini-3.8-flash-lite-tts). Cloud API හරහා ශබ්දය සම්ප්‍රේෂණය වේ.
            </p>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-2 block">
              AI Powered Studio Voice
            </span>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 font-sinhala flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              කථන වේගය (Speech Speed):
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{settings.ttsSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.3"
            step="0.05"
            value={settings.ttsSpeed}
            onChange={e => onUpdateSettings({ ...settings, ttsSpeed: parseFloat(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Sinhala Typography & Font Size */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-sinhala">
          <Type className="w-4 h-4 text-emerald-600" />
          <span>සිංහල අකුරු ප්‍රමාණය (Sinhala Font Size)</span>
        </h2>

        <p className="text-xs text-slate-500 font-sinhala">
          ජංගම දුරකථන සහ ටැබ්ලට් තිරවල සිංහල පිල්ලම් සහ අකුරු නොකැඩී පහසුවෙන් කියවිය හැකි ප්‍රමාණය තෝරන්න.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {(['normal', 'large', 'huge'] as const).map(size => {
            const labels = {
              normal: 'සාමාන්‍ය (16px)',
              large: 'විශාල (18px)',
              huge: 'ඉතා විශාල (22px)',
            };

            return (
              <button
                key={size}
                onClick={() => onUpdateSettings({ ...settings, sinhalaFontSize: size })}
                className={`py-3 px-3 rounded-2xl border text-xs font-semibold transition font-sinhala ${
                  settings.sinhalaFontSize === size
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {labels[size]}
              </button>
            );
          })}
        </div>

        {/* Live Font Sample Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            සජීවී නියැදිය (Live Preview):
          </span>
          <p
            className={`font-sinhala font-semibold text-slate-900 dark:text-white leading-[1.85] ${
              settings.sinhalaFontSize === 'normal'
                ? 'text-base'
                : settings.sinhalaFontSize === 'large'
                ? 'text-lg'
                : 'text-xl'
            }`}
          >
            "හජිමෙමෂිතෙ. රහිරු මදුසන්කා තො මෝෂිමස්. සුරිරංකා නො මාතාරා ෂුෂින් දෙස්."
          </p>
        </div>
      </div>

      {/* Theme Preference (Dark / Light) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-sinhala">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>වර්ණ තේමාව (Color Theme)</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-semibold transition font-sinhala ${
              settings.theme === 'light'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>ආලෝකවත් මාදිලිය (Light Mode)</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-semibold transition font-sinhala ${
              settings.theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>අඳුරු මාදිලිය (Dark Mode)</span>
          </button>
        </div>
      </div>

      {/* App Information & Standards */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-sinhala leading-relaxed text-slate-600 dark:text-slate-400 space-y-2">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>යෙදුම් ප්‍රමිතීන් සහ දත්ත ආරක්ෂාව</span>
        </h3>
        <p>• සම්මත සම්මුඛ පරීක්ෂණ වාර්තා 35 ම පූර්ණ ලෙස අන්තර්ගත කර ඇත.</p>
        <p>• සිංහල යුනිකෝඩ් සංකේත (Noto Sans Sinhala) මඟින් පරිපූර්ණව විදහා දැක්වේ.</p>
        <p>• ඔබගේ ප්‍රගතිය ඔබගේ බ්‍රවුසරයේ (LocalStorage) සුරක්ෂිතව ගබඩා වන අතර පිටතට යවනු නොලැබේ.</p>
      </div>

      {/* Data Reset */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => {
            if (window.confirm('ඔබේ සියලු ප්‍රගතිය සහ සැකසුම් මුල් තත්ත්වයට පත් කිරීමට අවශ්‍යද?')) {
              onResetAllData();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition font-sinhala font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>සියලු දත්ත නැවත සකසන්න (Reset App Data)</span>
        </button>
      </div>
    </div>
  );
};
