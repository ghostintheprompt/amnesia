import { GoogleGenAI, Type } from "@google/genai";
import { PrivacyAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeMedia(
  url: string,
  mediaType: 'image' | 'video'
): Promise<PrivacyAnalysis> {
  const prompt = `
    Analyze this ${mediaType} from a fashion website for privacy risks related to location tracking and personal information.
    Specifically look for:
    - Street signs, shop names, or recognizable landmarks.
    - License plates or specific car models.
    - Reflections in windows or mirrors that show the surrounding area.
    - Visible text on packages, mail, or documents.
    - Specific seasonal foliage or weather patterns that might narrow down location.
    - Clothing labels or accessories that indicate a specific boutique or region.

    Return a JSON response with the following structure:
    {
      "riskLevel": "low" | "medium" | "high",
      "detectedMarkers": ["list of specific things found"],
      "recommendations": ["list of steps to mitigate the privacy risk"],
      "summary": "a brief 1-2 sentence overview of the findings"
    }
  `;

  try {
    // Fetch image through our proxy to avoid CORS and get data
    const proxyUrl = `/api/proxy-resource?url=${encodeURIComponent(url)}`;
    const imageRes = await fetch(proxyUrl);
    const blob = await imageRes.blob();
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: blob.type || "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            detectedMarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["riskLevel", "detectedMarkers", "recommendations", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as PrivacyAnalysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw new Error('Analysis failed');
  }
}
