import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/images/studio', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured in Settings > Secrets.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const body = req.body as {
      mode?: 'hq-generate' | 'create-edit';
      prompt?: string;
      imageSize?: '1K' | '2K' | '4K';
      aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
      sourceImageBase64?: string;
      sourceMimeType?: string;
    };

    const mode = body.mode === 'hq-generate' ? 'hq-generate' : 'create-edit';
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const imageSize = body.imageSize === '2K' || body.imageSize === '4K' ? body.imageSize : '1K';
    const allowedRatios = new Set(['1:1', '16:9', '4:3', '3:4', '9:16']);
    const aspectRatio = body.aspectRatio && allowedRatios.has(body.aspectRatio) ? body.aspectRatio : '16:9';

    if (!prompt || prompt.length < 3) {
      res.status(400).json({ error: 'Please enter a descriptive prompt (at least 3 characters).' });
      return;
    }

    const modelName = mode === 'hq-generate' ? 'gemini-3-pro-image-preview' : 'gemini-nano-banana-2.1';

    try {
      const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

      if (mode === 'create-edit' && body.sourceImageBase64 && body.sourceMimeType) {
        const cleanBase64 = body.sourceImageBase64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: body.sourceMimeType,
          },
        });
      }

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
      let imageDataUrl = '';
      let modelText = '';

      for (const part of candidateParts) {
        if (part.inlineData?.data && !imageDataUrl) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          modelText += part.text;
        }
      }

      if (!imageDataUrl) {
        res.status(502).json({
          error: modelText || 'The image model did not return an image. Please refine your prompt and try again.',
        });
        return;
      }

      res.json({
        imageDataUrl,
        caption: modelText.trim(),
        model: modelName,
        imageSize,
        aspectRatio,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const lower = message.toLowerCase();
      let statusCode = 500;
      let friendly = message;

      if (lower.includes('permission_denied') || lower.includes('403') || lower.includes('api key')) {
        statusCode = 403;
        friendly = 'This image model requires a billing-enabled Gemini API key in Settings > Secrets.';
      } else if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
        statusCode = 429;
        friendly = 'API quota reached or paid tier key required. Check your billing-enabled API key in Settings > Secrets.';
      } else if (lower.includes('not_found') || lower.includes('404')) {
        statusCode = 404;
        friendly = `Model ${modelName} returned not found. Please check model availability in your project.`;
      }

      res.status(statusCode).json({ error: friendly, detail: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GT Battle server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
