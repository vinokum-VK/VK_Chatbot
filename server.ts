import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with server-side environment variable
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Real-time Chat Streaming Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, systemInstruction, temperature } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    // Transform messages to Gemini format
    const contents = messages.map((m: any) => {
      const parts: any[] = [];

      // Add image / file attachments if present
      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.data && att.mimeType) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.data,
              },
            });
          }
        }
      }

      if (m.content !== undefined && m.content !== null) {
        parts.push({ text: String(m.content) });
      }

      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts,
      };
    });

    const defaultSystemInstruction =
      'You are Echo, a versatile, articulate, and completely free AI chatbot powered by Google Gemini. ' +
      'Format responses cleanly using Markdown, including headings, bullet points, and syntax-highlighted code blocks where appropriate. ' +
      'Be helpful, direct, respectful, and thorough without unnecessary fluff.';

    // Primary and fallback models for high availability
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;
    let streamStarted = false;

    for (const model of candidateModels) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: systemInstruction || defaultSystemInstruction,
            temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.7,
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            streamStarted = true;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        // If we streamed or completed without error, finish
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next model if stream hasn't started:`, err?.message || err);
        if (streamStarted) {
          // If stream already started writing to client, don't restart with another model
          break;
        }
      }
    }

    // Extract human-friendly error if all candidate models failed
    let friendlyMessage = 'Unable to generate response at this moment. Please try again.';
    if (lastError) {
      try {
        const parsed = typeof lastError === 'string' ? JSON.parse(lastError) : lastError;
        if (parsed?.error?.message) {
          friendlyMessage = typeof parsed.error.message === 'string' ? parsed.error.message : JSON.stringify(parsed.error.message);
        } else if (parsed?.message) {
          friendlyMessage = parsed.message;
        }
      } catch {
        friendlyMessage = lastError?.message || String(lastError);
      }
    }

    if (friendlyMessage.includes('high demand') || friendlyMessage.includes('503')) {
      friendlyMessage = 'Google Gemini is currently experiencing high demand. Please try sending your message again in a few moments.';
    }

    res.write(`data: ${JSON.stringify({ error: friendlyMessage })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'An unexpected server error occurred. Please try again.' })}\n\n`);
    res.end();
  }
});

// In dev, attach Vite middleware. In production, serve built dist.
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
