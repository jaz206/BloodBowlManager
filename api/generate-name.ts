import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { verifyFirebaseIdToken } from './_lib/firebaseAdmin';
import { assertRateLimit, getClientIp, logApiEvent, setNoStore } from './_lib/security';

const requestSchema = z.object({
  rosterName: z.string().trim().min(2).max(80),
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
    assertRateLimit(`generate-name:${requesterUid}:${clientIp}`, { windowMs: 60_000, max: 10 });
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
    const { rosterName } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como generador de nombres para Blood Bowl. Necesito un nombre original y temático para una franquicia de la facción "${rosterName}". Devuelve solo el nombre final, sin comillas, sin numeraciones y sin texto introductorio.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 40,
        stopSequences: ['\n'],
      },
    });

    const generatedName = (result.text || '').trim().replace(/"/g, '').slice(0, 80);
    if (!generatedName) {
      throw new Error('Empty name generated');
    }

    logApiEvent('ai.generate_name.success', { requesterUid, rosterName, clientIp });
    return response.status(200).json({ name: generatedName });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    logApiEvent('ai.generate_name.error', {
      requesterUid,
      clientIp,
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    });
    return response.status(500).json({ error: 'Failed to generate name from AI' });
  }
}
