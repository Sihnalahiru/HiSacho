import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory audio cache for Gemini TTS: key -> base64 WAV
const ttsCache = new Map<string, string>();

// Initialize Gemini client if API key is present
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey,
    cacheCount: ttsCache.size,
  });
});

// Gemini TTS Endpoint
app.post('/api/tts', async (req, res) => {
  const { text, voiceName = 'Kore' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  // Check cache
  const cacheKey = `${voiceName}:${text.trim()}`;
  if (ttsCache.has(cacheKey)) {
    return res.json({
      audioData: ttsCache.get(cacheKey),
      mimeType: 'audio/wav',
      cached: true,
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      error: 'GEMINI_API_KEY is not configured on the server. Falling back to native browser TTS.',
      code: 'FALLBACK_NATIVE',
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: 'Clear, polite Japanese interview tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Supported prebuilt voices: 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    // Cache the result (max 200 items in memory)
    if (ttsCache.size > 200) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, base64Audio);

    return res.json({
      audioData: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (error: any) {
    console.warn('Gemini TTS error, signaling native fallback:', error?.message || error);
    return res.json({
      error: error?.message || 'Gemini TTS generation failed',
      code: 'FALLBACK_NATIVE',
    });
  }
});

// Optional AI Coach Endpoint
app.post('/api/ai-coach/feedback', async (req, res) => {
  const { questionId, questionText, learnerResponse, expectedAnswer } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      feedbackSinhala: 'අන්තර්ජාල හෝ API යතුර නොමැති බැවින් ස්වයංක්‍රීය පිළිතුරු ආදර්ශය සමඟ සසඳා බලා පුහුණු වන්න.',
      score: 80,
      tips: ['කරුණාකර නිවැරදි ජපන් උච්චාරණය සහ ආචාරශීලී භාෂා විලාසය පවත්වා ගන්න.'],
    });
  }

  try {
    const prompt = `
You are a senior Japanese SSW Agriculture interview coach for a Sri Lankan candidate whose native language is Sinhala.
Candidate name: Lahiru Madusanka (background: Finance & debt recovery, family farm experience in Matara).

Question: ${questionText}
Model Answer: ${expectedAnswer}
Learner's Spoken/Written Answer: ${learnerResponse || '(No response captured)'}

Please provide constructive, encouraging feedback tailored for the candidate.
Respond in valid JSON format:
{
  "score": number (0-100),
  "strengthsSinhala": "string in natural Sinhala",
  "improvementsSinhala": "string in natural Sinhala",
  "keyJapanesePhrases": ["phrase 1", "phrase 2"],
  "encouragementSinhala": "string in natural Sinhala"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('AI coach error:', err);
    return res.status(500).json({ error: 'AI coaching feedback unavailable' });
  }
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
