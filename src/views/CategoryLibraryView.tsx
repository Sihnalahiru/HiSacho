import React from 'react';
import { CATEGORIES, INTERVIEW_QUESTIONS } from '../data/interviewData.ts';
import {
  Sprout,
  ShieldCheck,
  Users,
  CheckCircle2,
  HeartHandshake,
  ArrowRightLeft,
  UserCheck,
  FileText,
  ChevronRight,
  Layers
} from 'lucide-react';

interface CategoryLibraryViewProps {
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_DETAILS: { [id: string]: { descriptionSinhala: string; icon: any; color: string } } = {
  'self-intro': {
    descriptionSinhala: 'ජිකෝ ෂෝකායි සහ සම්මුඛ පරීක්ෂණයේ අවසාන කෘතඥතා ප්‍රකාශ (agri-001, agri-035).',
    icon: UserCheck,
    color: 'emerald',
  },
  'career-change': {
    descriptionSinhala: 'මූල්‍ය හා ණය අයකර ගැනීමේ රැකියාවේ සිට කෘෂිකර්මයට මාරුවීමට හේතු (agri-004, agri-005).',
    icon: ArrowRightLeft,
    color: 'blue',
  },
  'field-skills': {
    descriptionSinhala: 'පස සකස් කිරීම, බීජ වැපිරීම, පැළ සිටුවීම, ජල සම්පාදනය, පොහොර, පළිබෝධ පාලනය, අස්වැන්න නෙළීම, ඇසුරුම් කිරීම සහ යන්ත්‍ර භාවිතය (ප්‍රශ්න 9ක්).',
    icon: Sprout,
    color: 'teal',
  },
  'physical-safety': {
    descriptionSinhala: 'ශාරීරික ශක්තිය, උණුසුම්/සීතල දිනවල වැඩ කිරීම සහ වැඩබිම් ආරක්ෂක නීති (agri-015, agri-016, agri-023).',
    icon: ShieldCheck,
    color: 'amber',
  },
  'teamwork-communication': {
    descriptionSinhala: 'කණ්ඩායම් සහයෝගීතාව, ජපන් භාෂාව, අපැහැදිලි උපදෙස් විමසීම, වැරදි වාර්තා කිරීම (HORENSO) සහ අදහස් ගැටුම් (ප්‍රශ්න 6ක්).',
    icon: Users,
    color: 'indigo',
  },
  'work-ethic': {
    descriptionSinhala: 'පෞද්ගලික ශක්තීන්, දුර්වලතා, සේවා වේලාවන්, ආතතිය පාලනය කිරීම සහ ඔබව බඳවා ගැනීමේ වාසිය (ප්‍රශ්න 7ක්).',
    icon: CheckCircle2,
    color: 'purple',
  },
  'adaptation': {
    descriptionSinhala: 'පවුලෙන් ඈත්ව ජපානයේ දිවි ගෙවීම, පවුලේ එකඟතාව සහ අනාගත දිගුකාලීන ඉලක්ක (agri-026, agri-027, agri-030).',
    icon: HeartHandshake,
    color: 'rose',
  },
  'cv-focus': {
    descriptionSinhala: 'ලහිරු මදුසන්ක මහතාගේ මූල්‍ය රැකියාව සහ මාතර පවුලේ වගාබිම් අත්දැකීම් ඉස්මතු කෙරෙන ප්‍රශ්න 8.',
    icon: FileText,
    color: 'sky',
  },
};

export const CategoryLibraryView: React.FC<CategoryLibraryViewProps> = ({ onSelectCategory }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>වර්ගීකරණය කරන ලද ප්‍රශ්නාවලිය</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          කෘෂිකාර්මික වර්ගීකරණ පුස්තකාලය (Category Library)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          ජපන් SSW කෘෂිකාර්මික සම්මුඛ පරීක්ෂණයේදී විමසන සියලුම ප්‍රධාන ක්ෂේත්‍ර 7 සහ විශේෂිත CV ප්‍රශ්න කාණ්ඩ වශයෙන් අධ්‍යයනය කරන්න.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
          const detail = CATEGORY_DETAILS[cat.id] || {
            descriptionSinhala: 'විශේෂ ප්‍රශ්න කාණ්ඩය',
            icon: Sprout,
            color: 'emerald',
          };
          const Icon = detail.icon;

          // Count questions in this category
          const count =
            cat.id === 'cv-focus'
              ? INTERVIEW_QUESTIONS.filter(q => q.isCvSpecific).length
              : INTERVIEW_QUESTIONS.filter(q => q.category === cat.id).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/70 shadow-xs cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-100 group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ප්‍රශ්න {count}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sinhala mb-1">
                  {cat.label}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-sinhala leading-relaxed">
                  {detail.descriptionSinhala}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-sinhala">
                <span>ප්‍රශ්න බලන්න සහ පුහුණු වන්න</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
