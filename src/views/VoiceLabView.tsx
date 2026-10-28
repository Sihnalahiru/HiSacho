import React, { useState, useEffect } from 'react';
import { audioService, TTSEngine } from '../services/audioService.ts';
import { UserSettings } from '../services/storageService.ts';
import {
  Volume2,
  Square,
  Sparkles,
  Settings,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface VoiceLabViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const PRESET_PHRASES = [
  {
    titleSinhala: 'ස්වයං හැඳින්වීම (Self Intro)',
    japanese: 'はじめまして。ラヒル・マドゥサンカと申します。よろしくお願いいたします。',
    sinhalaPronunciation: 'හජිමෙමෂිතෙ. රහිරු මදුසන්කා තො මෝෂිමස්. යොරොෂිකු ඔනෙගයි ඉතාෂිමස්.',
  },
  {
    titleSinhala: 'කෘෂිකාර්මික තාක්ෂණය ඉගෙනීම',
    japanese: '日本の農業技術や仕事の進め方を学びたいからです。',
    sinhalaPronunciation: 'නිහොන් නො නොග්යෝ ගිජුත්සු යා ෂිගොතො නො සුසුමෙකාතා ඔ මනබිතයි කරා දෙස්.',
  },
  {
    titleSinhala: 'හදිසි අවස්ථාවකදී වාර්තා කිරීම (HORENSO)',
    japanese: 'すぐに責任者に報告します。自分で判断せず、指示に従って安全に対応します。',
    sinhalaPronunciation: 'සුගු නි සේකිනින්ෂා නි හෝකොකු ෂිමස්. ජිබුන් දෙ හන්දාන් සෙසු, ෂිජි නි ෂිතගත්තෙ අන්සෙන් නි තයිඕ ෂිමස්.',
  },
  {
    titleSinhala: 'උපදෙස් නැවත පැහැදිලි කරගැනීම',
    japanese: '分からないまま作業をせず、もう一度説明してもらいます。',
    sinhalaPronunciation: 'වකරානයි මමා සග්යෝ ඔ සෙසු, මෝ ඉචිදෝ සෙත්සුමෙයි ෂිතෙ මොරයිමස්.',
  },
  {
    titleSinhala: 'ආරක්ෂක නීති පිළිපැදීම',
    japanese: '作業の手順と安全ルールを守ります。時間に遅れないようにします。',
    sinhalaPronunciation: 'සග්යෝ නො තෙජුන් තො අන්සෙන් රූරු ඔ මාමරිමස්. ජිකන් නි ඔකුරෙනයි යෝනි ෂිමස්.',
  },
  {
    titleSinhala: 'සම්මුඛ පරීක්ෂණ අවසානයේ කෘතඥතාව',
    japanese: '面接の機会をいただき、ありがとうございます。一生懸命働きたいです。',
    sinhalaPronunciation: 'මෙන්සෙත්සු නො කිකායි ඔ ඉතාදකි, අරිගතෝ ගොසයිමස්. ඉෂ්ෂෝකෙන්මෙයි හතාරකි තයි දෙස්.',
  },
];

export const VoiceLabView: React.FC<VoiceLabViewProps> = ({ settings, onUpdateSettings }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [customText, setCustomText] = useState('はじめまして。ラヒル・マドゥサンカと申します。');
  const [nativeVoices, setNativeVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [serverHealth, setServerHealth] = useState<{ hasGeminiKey: boolean } | null>(null);

  useEffect(() => {
    // Fetch native voices
    const voices = audioService.getJapaneseNativeVoices();
    setNativeVoices(voices);

    // Check server status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(() => setServerHealth({ hasGeminiKey: false }));
  }, []);

  const handlePlay = async (text: string) => {
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
      setPlayingText(null);
      return;
    }

    setIsPlaying(true);
    setPlayingText(text);

    await audioService.playJapanese(text, {
      engine: settings.ttsEngine,
      voiceName: settings.ttsVoice,
      rate: settings.ttsSpeed,
      onEnd: () => {
        setIsPlaying(false);
        setPlayingText(null);
      },
      onError: () => {
        setIsPlaying(false);
        setPlayingText(null);
      },
    });
  };

  const handleEngineChange = (engine: TTSEngine) => {
    onUpdateSettings({
      ...settings,
      ttsEngine: engine,
      ttsVoice: engine === 'gemini' ? 'Kore' : (nativeVoices[0]?.name || ''),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-semibold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>කටහඬ පරීක්ෂණ විද්‍යාගාරය</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          ජපන් කටහඬ විද්‍යාගාරය (Japanese Voice Lab)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          බ්‍රවුසරයේ ඇති Native ජපන් කටහඬ සහ Google Gemini Cloud TTS කටහඬවල් සජීවීව සංසන්දනය කරන්න. ඔබේ රුචිකත්වයට අනුව කථන වේගය සකසා ගන්න.
        </p>
      </div>

      {/* Voice Engine Configuration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" />
          <span>කටහඬ එන්ජිම තෝරන්න (Select Voice Engine)</span>
        </h2>

        {/* Engine Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleEngineChange('native')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              settings.ttsEngine === 'native'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Native Web Speech API
              </span>
              {settings.ttsEngine === 'native' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala">
              ඔබේ දුරකථනයේ හෝ පරිගණකයේ සවි කර ඇති ජපන් කටහඬ. අන්තර්ජාලය නොමැතිව (Offline) ක්‍රියා කරයි.
            </p>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-2 block">
              නොමිලේ • ක්ෂණිකයි
            </span>
          </div>

          <div
            onClick={() => handleEngineChange('gemini')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              settings.ttsEngine === 'gemini'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Google Gemini Cloud TTS
              </span>
              {settings.ttsEngine === 'gemini' && (
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala">
              අති නවීන AI කටහඬ (gemini-3.8-flash-lite-tts). ස්වභාවික ජපන් මිනිස් උච්චාරණයට ඉතා සමීපයි.
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                AI Powered • Cloud
              </span>
              {serverHealth?.hasGeminiKey ? (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API සක්‍රියයි
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Native වෙත ස්වයංක්‍රීයව මාරුවේ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Voice Selection Dropdown */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-sinhala">
            කටහඬ මාදිලිය (Voice Model):
          </label>

          {settings.ttsEngine === 'gemini' ? (
            <select
              value={settings.ttsVoice || 'Kore'}
              onChange={e => onUpdateSettings({ ...settings, ttsVoice: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            >
              <option value="Kore">Kore (ස්වභාවික ජපන් කාන්තා හඬ - නිර්දේශිතයි)</option>
              <option value="Puck">Puck (පැහැදිලි ජපන් පිරිමි හඬ)</option>
              <option value="Fenrir">Fenrir (ගැඹුරු ජපන් පිරිමි හඬ)</option>
              <option value="Zephyr">Zephyr (සන්සුන් උච්චාරණය)</option>
            </select>
          ) : (
            <select
              value={settings.ttsVoice}
              onChange={e => onUpdateSettings({ ...settings, ttsVoice: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            >
              {nativeVoices.length > 0 ? (
                nativeVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value="">පෙරනිමි ජපන් හඬ (Default ja-JP Voice)</option>
              )}
            </select>
          )}
        </div>

        {/* Speed Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 font-sinhala">
              කථන වේගය (Speech Speed):
            </label>
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

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-sinhala pt-1">
            <button
              onClick={() => onUpdateSettings({ ...settings, ttsSpeed: 0.75 })}
              className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              සෙමින් (0.75x)
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, ttsSpeed: 0.9 })}
              className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-emerald-600"
            >
              සම්මුඛ පරීක්ෂණ වේගය (0.9x)
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, ttsSpeed: 1.0 })}
              className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              සාමාන්‍ය (1.0x)
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, ttsSpeed: 1.2 })}
              className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              වේගවත් (1.2x)
            </button>
          </div>
        </div>
      </div>

      {/* Custom Text Playground */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sinhala">
          කැමති ඕනෑම ජපන් වාක්‍යයක් ශ්‍රවණය කරන්න (Custom Text Playground)
        </h3>

        <div className="space-y-2">
          <textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-sans"
            placeholder="ජපන් අකුරු මෙහි ඇතුළත් කරන්න..."
          />

          <button
            onClick={() => handlePlay(customText)}
            className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition flex items-center justify-center gap-2 ${
              isPlaying && playingText === customText
                ? 'bg-rose-600 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isPlaying && playingText === customText ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>නවතන්න (Stop Audio)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>ශ්‍රවණය කරන්න (Play Audio)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Agriculture Phrases */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
          මූලික SSW කෘෂිකාර්මික වාක්‍ය පෙරහුරුව
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {PRESET_PHRASES.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-sinhala">
                  {item.titleSinhala}
                </span>
                <p className="text-xs text-slate-500 font-sinhala">
                  "{item.sinhalaPronunciation}"
                </p>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-sans">
                  {item.japanese}
                </p>
              </div>

              <button
                onClick={() => handlePlay(item.japanese)}
                className={`p-3 rounded-xl transition shrink-0 ${
                  isPlaying && playingText === item.japanese
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
                title="ශ්‍රවණය කරන්න"
              >
                {isPlaying && playingText === item.japanese ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
