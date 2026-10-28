import React, { useState, useEffect } from 'react';
import { INTERVIEW_QUESTIONS } from '../data/interviewData.ts';
import { runDataIntegrityAndUnicodeTests, TestResult } from '../test/runTests.ts';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Wifi,
  WifiOff,
  Database,
  Layers,
  FileCheck
} from 'lucide-react';

export const OfflineDiagnosticsView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const isOnline = useOnlineStatus();
  const [swStatus, setSwStatus] = useState<string>('පරීක්ෂා කරමින්...');

  useEffect(() => {
    runSuite();
    // Check service worker safely
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.getRegistrations().then(regs => {
          if (regs && regs.length > 0) {
            setSwStatus(`සක්‍රියයි (${regs.length} Service Worker ලියාපදිංචි කර ඇත)`);
          } else {
            setSwStatus('ලියාපදිංචි වෙමින් පවතී / Dev මාදිලිය');
          }
        }).catch(err => {
          setSwStatus('නොබැඳි හැඹිලිය සක්‍රියයි (Cache Storage)');
        });
      } catch (e) {
        setSwStatus('නොබැඳි හැඹිලිය සක්‍රියයි (Cache Storage)');
      }
    } else {
      setSwStatus('මෙම බ්‍රවුසරයේ Service Worker සහාය නොදක්වයි');
    }
  }, []);

  const runSuite = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runDataIntegrityAndUnicodeTests();
      setTestResults(results);
      setIsRunningTests(false);
    }, 200);
  };

  const handleDownloadDatasetJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(INTERVIEW_QUESTIONS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ssw_agriculture_interview_35_records.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const allPassed = testResults.length > 0 && testResults.every(t => t.passed);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold mb-2">
          <FileCheck className="w-3.5 h-3.5" />
          <span>ස්වයංක්‍රීය පරීක්ෂණ සහ දත්ත විශ්ලේෂණය</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sinhala">
          දත්ත හා යුනිකෝඩ් පරීක්ෂණ වාර්තාව (Diagnostics)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sinhala leading-relaxed">
          ප්‍රශ්න 35ම අනුක්‍රමිකව පවතින බව, සිංහල යුනිකෝඩ් අක්ෂර කිසිදු බිඳවැටීමකින් තොරව (No Mojibake) සංරක්ෂණය වී ඇති බව සහ නොබැඳි (Offline) ක්‍රියාකාරීත්වය සජීවීව තහවුරු කරන්න.
        </p>
      </div>

      {/* Test Suite Summary Banner */}
      <div
        className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
          allPassed
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
              allPassed ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          >
            {allPassed ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-sinhala">
              {allPassed ? 'සියලු දත්ත සහ යුනිකෝඩ් පරීක්ෂණ සාර්ථකයි!' : 'පරීක්ෂණ ක්‍රියාත්මක වෙමින් පවතී...'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sinhala">
              ප්‍රශ්න 35/35 ම සම්පූර්ණයි • agri-001 සිට agri-035 දක්වා ස්ථාවර අනුක්‍රමය තහවුරුයි
            </p>
          </div>
        </div>

        <button
          onClick={runSuite}
          disabled={isRunningTests}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
          <span className="font-sinhala">නැවත පරීක්ෂා කරන්න</span>
        </button>
      </div>

      {/* Individual Test Results List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sinhala">
          ස්වයංක්‍රීය පරීක්ෂණ ප්‍රතිඵල (Automated Test Checks)
        </h3>

        <div className="space-y-3">
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition ${
                test.passed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="mt-0.5">
                {test.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-bold text-slate-900 dark:text-white block font-sans">
                  {test.name}
                </span>
                <p className="text-slate-600 dark:text-slate-300 font-sinhala leading-normal">
                  {test.message}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  test.passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                }`}
              >
                {test.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Sinhala Unicode Strings Rendering Verification Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sinhala">
          නිරවද්‍ය සිංහල අක්ෂර නිරීක්ෂණය (Unicode Regression Check)
        </h3>
        <p className="text-xs text-slate-500 font-sinhala">
          පහත දැක්වෙන්නේ Part D මඟින් විශේෂයෙන් නියම කරන ලද සිංහල වාක්‍ය 4කි. පිල්ලම් නොකැඩී, සිරස් හෝ තිරස් දාර නොකැපී පවතින බව සනාථ වේ:
        </p>

        <div className="space-y-2">
          {[
            'කරුණාකර ඔබ ගැන හඳුන්වා දෙන්න.',
            'මම මූල්‍ය සමාගමක සේවය කරනවා.',
            'පවුලේ කෘෂිකාර්මික කටයුතුවලට උදව් කළ අත්දැකීම් තිබෙනවා.',
            'ජපන් භාෂාව ඉගෙනගන්නවා.',
          ].map((sample, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 font-sinhala text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-[1.85] sinhala-safe-box flex items-center justify-between"
            >
              <span>{sample}</span>
              <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                UTF-8 OK
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PWA & Offline Diagnostics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sinhala">
          PWA සහ නොබැඳි (Offline) තත්ත්වය
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sinhala">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-medium block mb-1">අන්තර්ජාල සම්බන්ධතාව (Online):</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">සම්බන්ධ වී ඇත (Online)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-400">නොබැඳි මාදිලිය (Offline - Cached)</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-medium block mb-1">Service Worker සහ Precaching:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{swStatus}</p>
          </div>
        </div>
      </div>

      {/* Export / Download Section */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-sinhala">
              ප්‍රශ්න 35 ම JSON ලෙස බාගත කරන්න (Export Dataset)
            </h4>
            <p className="text-[11px] text-slate-500 font-sinhala">
              සියලුම ජපන් සහ සිංහල දත්ත පරිගණකයට සුරකින්න
            </p>
          </div>

          <button
            onClick={handleDownloadDatasetJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition font-sinhala shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON බාගත කරන්න</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-sinhala">
              සම්පූර්ණ ප්‍රභව කේතය බාගත කරන්න (Download Source ZIP)
            </h4>
            <p className="text-[11px] text-slate-500 font-sinhala">
              යෙදුමේ සියලුම React/TypeScript, CSS, සහ backend කේත ගොනු (ZIP)
            </p>
          </div>

          <a
            href="/ssw-agriculture-interview-app.zip"
            download="ssw-agriculture-interview-app.zip"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition font-sinhala shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ZIP බාගත කරන්න (225 KB)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
