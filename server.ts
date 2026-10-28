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

// Create standard 44-byte RIFF WAV header for 16-bit linear PCM
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write('WAVE', 8); // Format
  buffer.write('fmt ', 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write('data', 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

// Gemini TTS Endpoint with guaranteed WAV encapsulation
app.post('/api/tts', async (req, res) => {
  const { text, voiceName = 'Kore' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  const trimmedText = text.trim();
  // Check in-memory cache
  const cacheKey = `${voiceName}:${trimmedText}`;
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
              text: trimmedText,
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
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const rawBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!rawBase64) {
      throw new Error('No audio data received from Gemini TTS');
    }

    const rawBuffer = Buffer.from(rawBase64, 'base64');
    let finalBase64 = rawBase64;

    // Check if RIFF header is already present
    const isWav = rawBuffer.length > 12 && rawBuffer.toString('ascii', 0, 4) === 'RIFF' && rawBuffer.toString('ascii', 8, 12) === 'WAVE';
    if (!isWav) {
      // Prepend 44-byte WAV header
      const header = createWavHeader(rawBuffer.length, 24000, 1, 16);
      finalBase64 = Buffer.concat([header, rawBuffer]).toString('base64');
    }

    // Cache the result (max 250 items in memory)
    if (ttsCache.size > 250) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, finalBase64);

    return res.json({
      audioData: finalBase64,
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
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
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
