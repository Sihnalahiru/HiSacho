# Japanese SSW Agriculture Interview Coach (ජපන් SSW කෘෂිකාර්මික සම්මුඛ පරීක්ෂණ පුහුණු යෙදුම)

A full-stack, mobile-first Progressive Web App (PWA) built specifically for Sri Lankan candidates preparing for the Japanese Specified Skilled Worker (SSW - 特定技能) Agriculture interview.

Candidate Context: **Lahiru Madusanka** (Finance & debt recovery background, with family agricultural experience in Matara, Sri Lanka).

---

## 🌟 Key Features

1. **All 35 Mandatory Curated Interview Records Embedded**:
   - `agri-001` through `agri-035` fully embedded in initial source code (`src/data/interviewData.ts`).
   - Every record contains:
     - Question in Japanese
     - Question in Sinhala-script pronunciation
     - Question in Sinhala meaning
     - Model Answer in Japanese
     - Model Answer in Sinhala-script pronunciation
     - Model Answer in Sinhala meaning
     - Curated practice and review statuses
   - No placeholders, mock samples, or missing records.

2. **Zero Japanese Characters on Normal Learner Screens (Part A #5)**:
   - Normal learner views present Sinhala-script pronunciation and Sinhala meaning by default.
   - Japanese Kanji/Kana source text is retained internally to drive authentic Japanese speech synthesis.
   - An optional **Japanese-Script Learning Mode** can be toggled via the header or Settings for candidates who wish to inspect Japanese Kanji/Kana text.

3. **Sinhala Unicode Rendering Fixes (Part D)**:
   - Strict UTF-8 preservation across JSON, TypeScript, Express, and React nodes.
   - Typography font stack: `'Noto Sans Sinhala', 'Iskoola Pota', 'Noto Sans', sans-serif`.
   - Dedicated `line-height: 1.85` and `sinhala-safe-box` vertical padding to ensure vowel marks (ispilla, papilla, kombuwa, al-lakuna) are never clipped on iOS Safari or Android Chrome.
   - Responsive flex/grid containers tested across 320px, 375px, 390px, 430px, tablet, and desktop viewports.

4. **Dual-Engine Japanese TTS (Part E)**:
   - **Native Engine**: In-browser `SpeechSynthesisUtterance` requesting `ja-JP` voices (100% free, works offline).
   - **Gemini Cloud TTS**: Server-side proxy (`/api/tts`) using Google GenAI SDK (`gemini-3.8-flash-lite-tts`) with prebuilt voices (`Kore`, `Puck`, `Fenrir`, `Zephyr`).
   - In-memory caching for repeated playbacks and seamless automatic fallback to native voice on network failure, offline, or quota limits.

5. **Realistic Interview Simulation (Part G)**:
   - Examiner speaks Japanese question aloud.
   - Model answer is completely hidden until candidate speaks or submits.
   - Levenshtein-based textual match scoring comparing learner transcript to model answer with realistic disclaimers.

6. **Microphone Speaking Practice**:
   - Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with `lang: 'ja-JP'`.
   - 5-second initial timeout waiting for speech.
   - ~4-second silence detection to detect end of speech.
   - Permission-denied, no-speech, and network error handling.
   - Text input fallback for keyboard entry or unsupported browsers.

7. **CV Transition Focus (Finance → Agriculture)**:
   - Dedicated CV practice deck highlighting how communication, responsibility, and stress management from finance and debt recovery translate to teamwork and precision in Japanese agriculture, alongside family vegetable and chili farming in Matara.
   - Editable candidate profile.

8. **PWA Offline Support**:
   - Web App Manifest (`manifest.webmanifest`) with standalone display, theme color `#15803d`, maskable 512px icon, and 192px icon.
   - Service worker precaching static assets via `vite-plugin-pwa`.
   - In-app install button (`PWAInstallButton`) with guided instructions for iOS Safari users.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository or extract the ZIP
cd applet

# Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Define `GEMINI_API_KEY` (injected automatically in AI Studio environment):

```ini
GEMINI_API_KEY="your-gemini-api-key-here"
```

*Note: Native browser TTS functions fully without any API key.*

### Running the Application

```bash
# Start full-stack development server (Express + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm start
```

---

## 🧪 Automated Testing

Run the automated data integrity and Sinhala Unicode regression test suite:

```bash
npm test
```

The test suite automatically verifies:
- Exactly 35 records with IDs `agri-001` through `agri-035`.
- Completeness of Japanese text, Sinhala pronunciations, and Sinhala meanings.
- No cross-assignment between question and answer fields.
- JSON serialization roundtrip for critical Sinhala test strings without mojibake, replacement characters (`\uFFFD`), or escaped entities.
- Metadata flags (`sourceStatus: 'curated-practice'`, `reviewStatus: 'human-review-recommended'`).

---

## 📦 Project Structure

```
├── public/
│   ├── icon.svg                      # Agriculture sprout & rising sun vector
│   ├── pwa-192x192.png               # PWA standard launcher icon
│   ├── pwa-512x512.png               # PWA high-res icon
│   ├── pwa-maskable-512x512.png      # Android maskable icon (15% safe margin)
│   ├── apple-touch-icon.png          # iOS Safari touch icon
│   ├── favicon.ico                   # Browser tab favicon
│   └── ssw-agriculture-interview-app.zip # 1-click full source code archive
├── src/
│   ├── components/
│   │   ├── QuestionCard.tsx          # Card with dual audio, reveal, bookmark
│   │   ├── PWAInstallButton.tsx      # In-app install button & iOS guide modal
│   │   └── OfflineIndicator.tsx      # Connectivity toast
│   ├── data/
│   │   └── interviewData.ts          # All 35 curated Q&As & Candidate Profile
│   ├── hooks/
│   │   ├── usePWAInstall.ts          # PWA installation & online status hook
│   │   └── useSpeechRecognition.ts   # Web Speech API with 5s/4s timers & similarity
│   ├── services/
│   │   ├── audioService.ts           # Dual-engine TTS (Gemini + Native ja-JP)
│   │   └── storageService.ts         # LocalStorage persistence & settings
│   ├── test/
│   │   └── runTests.ts               # CLI & in-browser automated test runner
│   ├── views/
│   │   ├── DashboardView.tsx         # Dashboard & profile summary
│   │   ├── PracticeView.tsx          # Card carousel & grid practice
│   │   ├── SimulationView.tsx        # Mock interview simulation
│   │   ├── QuestionCardsView.tsx     # All 35 questions list
│   │   ├── AnswerCardsView.tsx       # All 35 model answers list
│   │   ├── CategoryLibraryView.tsx   # 7 SSW Agriculture categories
│   │   ├── CvPracticeView.tsx        # Finance -> Agri candidate transition
│   │   ├── VoiceLabView.tsx          # Dual TTS testing & speed sliders
│   │   ├── MicrophonePracticeView.tsx# Mic speech practice & similarity
│   │   ├── FavoritesView.tsx         # Bookmarks & revision queue
│   │   ├── StatsView.tsx             # Progress analytics & activity log
│   │   ├── SettingsView.tsx          # Settings & Japanese script toggle
│   │   └── OfflineDiagnosticsView.tsx# Live automated test runner & export
│   ├── App.tsx                       # Master layout & responsive navigation
│   ├── index.css                     # Tailwind v4, Noto Sans Sinhala rules
│   └── main.tsx                      # Vite React entry point & SW registration
├── server.ts                         # Express backend with /api/tts & /api/ai-coach
├── vite.config.ts                    # Vite + Tailwind v4 + VitePWA plugin
└── package.json                      # Project dependencies & scripts
```

---

## 📜 License

Created for Japanese SSW Agriculture training. All 35 curriculum records are curated practice material.
