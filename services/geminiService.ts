
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ReferenceDescription } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const analyzeReferenceImage = async (base64Image: string, mimeType: string): Promise<ReferenceDescription> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const prompt = "You are an expert film and photography analyst. Analyze the provided image and describe it in detail. Your output must be a single, valid JSON object following this exact schema: {\"scene\": \"...\", \"lighting\": \"...\", \"camera\": \"...\", \"character\": \"...\", \"color_palette\": \"...\", \"composition\": \"...\", \"style\": \"...\"}. Do not include any text or markdown formatting before or after the JSON object. Fill in each field with a detailed, descriptive string.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                scene: { type: Type.STRING },
                lighting: { type: Type.STRING },
                camera: { type: Type.STRING },
                character: { type: Type.STRING },
                color_palette: { type: Type.STRING },
                composition: { type: Type.STRING },
                style: { type: Type.STRING },
            },
            required: ["scene", "lighting", "camera", "character", "color_palette", "composition", "style"]
        }
    }
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as ReferenceDescription;
};

export const generateFinalImage = async (
  base64UserFace: string,
  userFaceMimeType: string,
  jsonDescription: ReferenceDescription
): Promise<string> => {
  const userFacePart = fileToGenerativePart(base64UserFace, userFaceMimeType);

  const promptText = `Your task is to perform a high-end, cinematic photo transformation. You will receive a user's face image and a detailed description of a target style.
  Goal: Seamlessly integrate the user's face into a new image that perfectly matches the target style description. The final result should look like a professional, ultra-realistic cinematic portrait.
  User Face: The provided image contains the face to use.
  Target Style Description:
  - Scene: ${jsonDescription.scene}
  - Lighting: ${jsonDescription.lighting}
  - Camera: ${jsonDescription.camera}
  - Character: ${jsonDescription.character} (replace the face of this character)
  - Color Palette: ${jsonDescription.color_palette}
  - Composition: ${jsonDescription.composition}
  - Style: ${jsonDescription.style}
  Instructions:
  1. Recreate the scene, lighting, mood, and composition from the target description.
  2. Place the user's face onto the character described.
  3. Ensure the lighting, shadows, and color grading on the user's face perfectly match the new environment.
  4. Maintain a natural skin texture and realistic appearance. The result should NOT look like a collage or a simple face swap. It must be a cohesive, single photograph.
  5. The final image must be ultra-realistic and of cinematic quality.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [userFacePart, { text: promptText }],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image was generated.");
};
