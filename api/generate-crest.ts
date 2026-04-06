import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { verifyFirebaseIdToken } from './_lib/firebaseAdmin';
import { assertRateLimit, getClientIp, logApiEvent, setNoStore } from './_lib/security';

const requestSchema = z.object({
  rosterName: z.string().trim().min(2).max(80),
  teamName: z.string().trim().min(2).max(80),
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  setNoStore(response);

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  let requesterUid = 'anonymous';
  const clientIp = getClientIp(request);

  try {
    const decodedToken = await verifyFirebaseIdToken(request.headers.authorization);
    requesterUid = decodedToken.uid;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNAUTHORIZED';
    const status = message.includes('credentials') ? 500 : 401;
    return response.status(status).json({
      error: status === 500 ? 'Firebase Admin is not configured.' : 'Unauthorized',
    });
  }

  try {
    assertRateLimit(`generate-crest:${requesterUid}:${clientIp}`, { windowMs: 60_000, max: 5 });
  } catch {
    return response.status(429).json({ error: 'Rate limit exceeded. Try again in a moment.' });
  }

  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      error: 'Invalid request payload.',
      details: parsed.error.flatten(),
    });
  }

  try {
    const { rosterName, teamName } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Diseña un emblema épico para Blood Bowl. Equipo: "${teamName}". Facción: "${rosterName}". Composición centrada, estilo iconográfico limpio, fondo sencillo, formato escudo y lectura clara a tamaño pequeño.`;

    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error('The AI did not generate an image.');
    }

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
      throw new Error('Generated image payload is empty.');
    }

    logApiEvent('ai.generate_crest.success', { requesterUid, rosterName, teamName, clientIp });
    return response.status(200).json({ image: base64ImageBytes });
  } catch (error) {
    console.error('Error calling Gemini API for image generation:', error);
    logApiEvent('ai.generate_crest.error', {
      requesterUid,
      clientIp,
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    });
    return response.status(500).json({ error: 'Failed to generate crest from AI' });
  }
}
