
// api/generate-name.ts

// Importamos los tipos necesarios para la respuesta
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Solo permitimos peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Obtenemos el nombre de la facción desde la petición del frontend
  const { rosterName } = request.body;
  if (!rosterName) {
    return response.status(400).json({ error: 'rosterName is required' });
  }

  try {
    // 2. Usamos la clave de API de forma segura desde las variables de entorno de Vercel
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    // 3. Creamos el prompt y llamamos a la IA (igual que antes, pero en el servidor)
    const prompt = `Por favor, actúa como un generador de nombres para un juego de mesa de fútbol fantástico llamado 'Blood Bowl'. Necesito un nombre para un equipo de la facción '${rosterName}'. El nombre debe ser creativo y temático, pero no debe contener lenguaje ofensivo. Devuelve únicamente el nombre del equipo, sin comillas ni texto introductorio.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const generatedName = result.text.trim().replace(/"/g, '');

    // 4. Devolvemos el nombre generado al frontend
    return response.status(200).json({ name: generatedName });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Devolvemos un error genérico para no exponer detalles internos
    return response.status(500).json({ error: 'Failed to generate name from AI' });
  }
}
