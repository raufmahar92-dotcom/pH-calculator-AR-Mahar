import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in Vercel Environment Variables.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `You are Chemistry AI Tutor.

Rules:
- Answer ONLY chemistry-related questions.
- Explain concepts in simple language.
- Show step-by-step calculations.
- Explain formulas.
- Help students understand concepts.
- If the user asks a non-chemistry question politely reply:
'I am a Chemistry AI Assistant and can only answer chemistry-related questions.'
- Never generate false chemistry information.
- Keep answers educational.`;

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  // Support both GET for healthcheck and POST for chat requests
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", message: "Chemistry AI Tutor API is ready." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const client = getGeminiClient();

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item.text && (item.role === "user" || item.role === "model" || item.role === "assistant")) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "No response generated.";
    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error("Chemistry AI Assistant Error:", error);
    return res.status(500).json({
      error: error?.message || "An error occurred while connecting to Chemistry AI Tutor.",
    });
  }
}
