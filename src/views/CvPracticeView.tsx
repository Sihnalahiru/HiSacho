import React, { useState } from 'react';
import { INTERVIEW_QUESTIONS, CandidateProfile, InterviewQuestion } from '../data/interviewData.ts';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { UserSettings } from '../services/storageService.ts';
import {
  FileText,
  UserCheck,
  Edit3,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface CvPracticeViewProps {
  settings: UserSettings;
  profile: CandidateProfile;
  favoriteIds: string[];
  completedIds: string[];
  revisionIds: string[];
  onUpdateProfile: (profile: CandidateProfile) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onOpenMicPractice: (question: InterviewQuestion) => void;
}

export const CvPracticeView: React.FC<CvPracticeViewProps> = ({
  settings,
  profile,
  favoriteIds,
  completedIds,
  revisionIds,
  onUpdateProfile,
  onToggleFavorite,
  onToggleCompleted,
  onToggleRevision,
  onOpenMicPractice,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CandidateProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter CV-specific questions
  const cvQuestions = INTERVIEW_QUESTIONS.filter(q => q.isCvSpecific);

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>CV සහ පසුබිම මත පදනම් වූ විශේෂ ප්‍රශ්නාවලිය</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          මූල්‍ය රැකියාවේ සිට කෘෂිකර්මයට මාරුවීම (Career Transition)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          ලහිරු මදුසන්ක මහතාගේ මූල්‍ය හා ණය අයකර ගැනීමේ අත්දැකීම් සහ මාතර පවුලේ කෘෂිකාර්මික පසුබිම ජපන් සම්මුඛ පරීක්ෂකවරයාට විශ්වාසදායී ලෙස පැහැදිලි කිරීමට මෙම ප්‍රශ්න විශේෂයෙන් සකසා ඇත.
        </p>
      </div>

      {/* Candidate Profile Editor Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
                අයදුම්කරුගේ සැබෑ තොරතුරු (Candidate Facts)
              </h2>
              <span className="text-xs text-slate-400 font-sinhala">
                සම්මුඛ පරීක්ෂණයේදී පිළිතුරු සඳහා භාවිත වේ
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>සුරකින්න (Save)</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>වෙනස් කරන්න (Edit)</span>
              </>
            )}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-sinhala flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>පැතිකඩ සාර්ථකව යාවත්කාලීන විය.</span>
          </div>
        )}

        {/* Profile Content / Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-sinhala text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">සම්පූර්ණ නම (Full Name):</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.fullName}
                onChange={e => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {profile.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">ජපන් කටකනා නම (Katakana):</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.pronunciationKana}
                onChange={e => setEditedProfile({ ...editedProfile, pronunciationKana: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {profile.pronunciationKana}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">ගම සහ ප්‍රදේශය (Hometown):</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.hometown}
                onChange={e => setEditedProfile({ ...editedProfile, hometown: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {profile.hometown}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">දැනට කරන රැකියාව (Current Role):</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.currentRole}
                onChange={e => setEditedProfile({ ...editedProfile, currentRole: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {profile.currentRole}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-slate-400 font-semibold block mb-1">කෘෂිකාර්මික අත්දැකීම් (Agricultural Background):</label>
            {isEditing ? (
              <textarea
                value={editedProfile.agriculturalBackground}
                onChange={e => setEditedProfile({ ...editedProfile, agriculturalBackground: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {profile.agriculturalBackground}
              </p>
            )}
          </div>
        </div>

        {/* Tactical Interview Strategy Notice */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs font-sinhala leading-relaxed text-blue-950 dark:text-blue-200">
          <h4 className="font-bold flex items-center gap-1.5 mb-1.5 text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>සම්මුඛ පරීක්ෂකවරයාට දිය යුතු වැදගත්ම පැහැදිලි කිරීම (Key Interview Strategy):</span>
          </h4>
          <p>
            මූල්‍ය හා ණය අයකර ගැනීමේ රැකියාව තුළින් ඔබ ලබාගත් <strong>ඉහළ වගකීම (Responsibility)</strong>, <strong>ආචාරශීලී සන්නිවේදනය (Polite Communication)</strong> සහ <strong>ආතතිය පාලනය කිරීම (Stress Management)</strong> කෘෂිකාර්මික ක්ෂේත්‍රයේදී කණ්ඩායම් සහයෝගීතාවයට බෙහෙවින් ප්‍රයෝජනවත් වන බව අවධාරණය කරන්න. තවද මාතර පවුලේ වගාව නිසා ඔබ කෘෂිකර්මයට ආධුනිකයෙකු නොවන බව පෙන්වා දෙන්න.
          </p>
        </div>
      </div>

      {/* Filtered CV Questions Deck */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala flex items-center justify-between">
          <span>CV විශේෂිත ප්‍රශ්න {cvQuestions.length}</span>
          <span className="text-xs text-slate-400 font-normal">අවශ්‍ය සියලු ප්‍රශ්න අන්තර්ගතයි</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {cvQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              total={cvQuestions.length}
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
    </div>
  );
};
