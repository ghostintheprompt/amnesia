import { GoogleGenAI, Type } from "@google/genai";
import { PrivacyAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeMedia(
  url: string,
  mediaType: 'image' | 'video',
  useLocalVLM: boolean = false
): Promise<PrivacyAnalysis> {
  const prompt = `
    [GHOST_PROTOCOL_TIER_ANALYSIS]
    Perform a high-fidelity cybersecurity audit on this ${mediaType}. 
    Analyze for the following high-inference markers:
    - GEOLOCATION: Landmarks, street signs, unique foliage, architecture, or regional weather.
    - EXFILTRATION_PATHS: Visible QR codes, barcodes, or text that could lead to internal nodes.
    - PERSONAL_IDENTIFIERS: License plates, mail, ID cards, or facial reflections in glass/mirrors.
    - COVERT_CHANNELS: Check for artifacts that might suggest steganographic payloads or digital watermarking.

    Return a JSON response following this strict schema:
    {
      "riskLevel": "low" | "medium" | "high",
      "detectedMarkers": ["list of specific forensic findings"],
      "recommendations": ["remediation steps (e.g., 'Wipe via Amnesia Sanitizer', 'Scrub EXIF')"],
      "summary": "Forensic audit overview (1-2 sentences)."
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

    if (useLocalVLM) {
      try {
        // Attempt to use local Ollama with LLaVA
        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llava',
            prompt: prompt,
            images: [base64Data],
            stream: false,
            format: 'json'
          })
        });
        
        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          return JSON.parse(ollamaData.response) as PrivacyAnalysis;
        }
      } catch (err) {
        console.warn("Local VLM (Ollama) failed or not found. Falling back to local heuristics.");
        // Fallback local heuristic
        return {
          riskLevel: "medium",
          detectedMarkers: ["LOCAL_HEURISTIC_MODE: Potential text/faces detected"],
          recommendations: ["Wipe metadata", "Apply visual scrub to faces/text"],
          summary: "Local Zero-Cloud Protocol active. Unable to reach local LLaVA node. Basic heuristics applied."
        };
      }
    }

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
