import express, { Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for audio/image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to choose model
function resolveChatModel(mode?: string): string {
  switch (mode) {
    case 'fast':
      return 'gemini-3.1-flash-lite';
    case 'maximum':
      return 'gemini-3.1-pro-preview';
    case 'balanced':
    default:
      return 'gemini-3.8-flash';
  }
}

// 1. General Chat & Reasoning Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      conversationHistory = [],
      systemInstruction,
      modelMode = 'balanced',
      useSearch = false,
      userLocation,
    } = req.body;

    let targetModel = resolveChatModel(modelMode);
    
    // Build contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Append prior history if available
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: String(msg.text || msg.content || '') }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt || 'Hello Lyra' }],
    });

    const config: any = {
      systemInstruction:
        systemInstruction ||
        `You are LYRA, an ultra-intelligent, calm, elegant, fast, and respectful Android personal AI assistant.
Your voice and personality are ethereal, confident, empathetic, and clear.
You speak fluently in English, Hindi, and natural mixed Hinglish (e.g., 'हाँ, मैंने आपके लिए रिमाइंडर तैयार कर दिया है').
When asked to perform phone actions, state clearly what action is being executed or prepared.
Be concise when the user asks quick questions, and provide deep structured details when explaining complex topics.
Always be truthful: never pretend an action happened if it couldn't be completed.`,
    };

    if (modelMode === 'maximum') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    } catch (primaryErr: any) {
      // Graceful fallback to gemini-3.8-flash if pro or lite model encounters key limitations
      console.warn(`Primary model ${targetModel} error, falling back to gemini-3.8-flash:`, primaryErr?.message);
      targetModel = 'gemini-3.8-flash';
      delete config.thinkingConfig;
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    }

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      success: true,
      text,
      modelUsed: targetModel,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process chat query with Lyra',
    });
  }
});

// 2. Google Search Grounding Endpoint
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search for real-time and up-to-date information for: "${query}". Provide a clear, factual, and verified summary with sources.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are LYRA Search Intelligence. Deliver accurate, grounded facts citing web information.',
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      success: true,
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Search failed' });
  }
});

// 3. Google Maps Grounding Endpoint
app.post('/api/maps', async (req: Request, res: Response) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Location query is required' });
    }

    const config: any = {
      tools: [{ googleMaps: {} }],
      systemInstruction: 'You are LYRA Navigation & Place Intelligence. Return clear location details, addresses, and directions.',
    };

    if (latitude !== undefined && longitude !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Find places, directions or address info for: "${query}"`,
      config,
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      success: true,
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Maps query failed' });
  }
});

// 4. TTS (Text to Speech) Endpoint using gemini-3.8-flash-lite-tts or gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', flagship = false } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required for TTS' });
    }

    // Allowed prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Kore';

    const ttsModel = flagship ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    let response;
    try {
      response = await ai.models.generateContent({
        model: ttsModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 800), // optimal length for voice playback
                speechMetadata: {
                  style: 'Soft, cute, sweet, cheerful, gentle and delicate anime fairy voice, high-pitched, clear, friendly and delightful',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });
    } catch (primaryTtsErr: any) {
      // Fallback to flash-lite-tts if flagship tts failed
      if (ttsModel !== 'gemini-3.8-flash-lite-tts') {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [{ role: 'user', parts: [{ text: text.slice(0, 800) }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: chosenVoice } },
            },
          },
        });
      } else {
        throw primaryTtsErr;
      }
    }

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data returned from model');
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: chosenVoice,
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'TTS generation failed',
    });
  }
});

// 5. Audio Transcription Endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Audio data is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken audio accurately. It may be in English, Hindi, or mixed Hinglish. Output only the exact transcribed text.',
          },
        ],
      },
    });

    const transcription = response.text || '';

    res.json({
      success: true,
      text: transcription.trim(),
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Transcription failed',
    });
  }
});

// 6. Vision and Document Intelligence Endpoint using gemini-3.1-pro-preview
app.post('/api/vision', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image or document data required' });
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };

    let targetModel = 'gemini-3.1-pro-preview';
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [
            imagePart,
            {
              text:
                prompt ||
                'Analyze this image or document thoroughly. Extract key information, topics, tasks, dates, and provide a clear structured breakdown.',
            },
          ],
        },
      });
    } catch (e: any) {
      console.warn('Vision primary model fallback to gemini-3.8-flash:', e?.message);
      targetModel = 'gemini-3.8-flash';
      response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [
            imagePart,
            {
              text:
                prompt ||
                'Analyze this image or document thoroughly. Extract key information, topics, tasks, dates, and provide a clear structured breakdown.',
            },
          ],
        },
      });
    }

    res.json({
      success: true,
      text: response.text || '',
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Vision analysis failed',
    });
  }
});

// 7. Image Generation with Aspect Ratio using gemini-3.1-flash-image
app.post('/api/image-gen', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // Supported aspect ratios
    const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio as any,
          },
        },
      });
    } catch (genErr: any) {
      // Fallback attempt with lite image
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });
    }

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('Image could not be generated from response parts');
    }

    res.json({
      success: true,
      imageUrl,
      prompt,
      aspectRatio: chosenRatio,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Image generation failed',
    });
  }
});

// 8. Multi-AI Council Endpoint
app.post('/api/council', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Query is required for AI Council' });
    }

    // Orchestrate multi-perspective simulation + ultimate synthesis
    const councilPrompt = `The user asked: "${prompt}"

Conduct a rigorous multi-AI Council deliberation simulating 3 distinct frontier AI reasoning models:
1. Model A: Gemini Pro (Deep logical breakdown, multi-step chain-of-thought, mathematical and factual precision)
2. Model B: OpenAI GPT-4o style (Crisp, pragmatic, conversational, real-world actionability)
3. Model C: Claude 3.7 style (Nuanced, cautious, ethical considerations, counter-perspectives)

Produce:
### 1. Model A (Gemini Pro Perspective)
[Deep technical/logical answer]

### 2. Model B (GPT Perspective)
[Pragmatic practical answer]

### 3. Model C (Claude Perspective)
[Balanced nuanced perspective]

### 4. Council Synthesis & Consensus
- Consensus Points: What all 3 agree on
- Key Disagreements or Divergent Nuances
- Final Authoritative Recommendation`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: councilPrompt,
      config: {
        systemInstruction: 'You are the Lyra AI Council Orchestrator. Deliver an objective, high-rigor multi-model deliberation.',
      },
    });

    res.json({
      success: true,
      deliberation: response.text || '',
    });
  } catch (error: any) {
    console.error('AI Council error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'AI Council deliberation failed',
    });
  }
});

// 9. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    assistant: 'LYRA',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LYRA] Assistant backend active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
