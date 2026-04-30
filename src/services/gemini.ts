import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getMoodPlaylist(mood: string) {
  const prompt = `Você é um curador de música brasileira. O usuário está se sentindo "${mood}". 
  Sugira um nome criativo para uma playlist em português brasileiro e uma descrição poética que combine com esse estado de espírito e com a cultura brasileira.
  Retorne apenas um JSON no formato: {"name": "nome aqui", "description": "descrição aqui"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) return { name: "Energia Brasileira", description: "Uma mistura de ritmos para animar o seu dia." };

    // Basic JSON extraction
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { name: "Energia Brasileira", description: "Uma mistura de ritmos para animar o seu dia." };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { name: "Sons do Brasil", description: "O melhor da música brasileira em um só lugar." };
  }
}
