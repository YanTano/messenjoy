import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get initialized GoogleGenAI instance safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Chat Endpoint for AI Bots in Messenger
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, systemPrompt, botName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        replyText: "Gemini API key is not configured on the server.",
      });
    }

    const defaultPrompt = systemPrompt || `You are ${botName || 'AI Assistant'} in a messenger app. Be conversational, direct, and helpful. Use friendly formatting when needed.`;

    // Construct conversation history for Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      history.slice(-8).forEach((msg: { isUser: boolean; text: string }) => {
        contents.push({
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message || "Hello" }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: defaultPrompt,
        temperature: 0.8,
      },
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response right now.";
    return res.json({ replyText });
  } catch (error: any) {
    const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isQuota) {
      return res.json({
        replyText: "I am currently receiving high request traffic. Please wait a few seconds and try again!",
      });
    }
    return res.json({
      replyText: "I'm temporarily unavailable. Please try sending your message again in a moment.",
    });
  }
});

// Smart Reply Generator Endpoint
app.post("/api/ai/smart-reply", async (req, res) => {
  try {
    const { lastMessageText, senderName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        suggestions: ["Sounds good!", "Sure, let's do it.", "Thanks!"],
      });
    }

    const prompt = `Given this incoming message from ${senderName || 'a contact'}: "${lastMessageText}", generate 3 short, natural, context-aware quick reply options (1 to 5 words each) that a person might tap to respond instantly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 concise reply suggestions",
            },
          },
          required: ["suggestions"],
        },
      },
    });

    let suggestions: string[] = [];
    try {
      const data = JSON.parse(response.text || "{}");
      if (Array.isArray(data.suggestions)) {
        suggestions = data.suggestions.slice(0, 3);
      }
    } catch (e) {
      suggestions = ["Sounds good!", "I'll check it out.", "Thanks!"];
    }

    if (suggestions.length === 0) {
      suggestions = ["Sounds good!", "Great!", "Let's catch up later."];
    }

    return res.json({ suggestions });
  } catch (error: any) {
    // Return instant contextual default suggestions without dumping raw error objects
    return res.json({
      suggestions: ["Sounds good!", "Got it!", "Thanks!"],
    });
  }
});

// Translation Endpoint
app.post("/api/ai/translate", async (req, res) => {
  const text = req.body?.text || "";
  const targetLanguage = req.body?.targetLanguage || "English";
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    const prompt = `Translate the following text accurately into ${targetLanguage}:\n\n"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({ translatedText: response.text });
  } catch (error: any) {
    return res.json({ translatedText: text }); // Fallback to original text gracefully
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Messenger server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
