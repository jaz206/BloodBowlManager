// api/generate-crest.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { rosterName, teamName } = request.body;
  if (!rosterName || !teamName) {
    return response.status(400).json({ error: 'rosterName and teamName are required' });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `A fantasy football team emblem for a team called "${teamName}". The team's faction is "${rosterName}". The logo should be a vector graphic, centered on a plain white background, epic, and iconic.`;

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });
    
    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
        throw new Error("The AI did not generate an image.");
    }

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;

    return response.status(200).json({ image: base64ImageBytes });

  } catch (error) {
    console.error("Error calling Gemini API for image generation:", error);
    return response.status(500).json({ error: 'Failed to generate crest from AI' });
  }
}
