// Fix: Implement the full functionality of the geminiService to handle image generation.
import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { ClothingSelection, UploadedFile } from '../types';

// Fix: Correctly initialize GoogleGenAI with the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const imageToPart = (file: UploadedFile): Part => {
    return {
        inlineData: {
            mimeType: file.mimeType,
            data: file.base64,
        },
    };
};

const buildPromptParts = (personFile: UploadedFile, clothing: ClothingSelection, sceneDescription: string): Part[] => {
    const parts: Part[] = [];

    // 1. Person image
    parts.push(imageToPart(personFile));

    // 2. Clothing images
    const clothingPieces: string[] = [];
    if (clothing.top) {
        parts.push(imageToPart(clothing.top));
        // Distinguish between a top (part of a set) and a single garment (like a dress)
        clothingPieces.push(clothing.bottom ? 'top' : 'garment');
    }
    if (clothing.bottom) {
        parts.push(imageToPart(clothing.bottom));
        clothingPieces.push('bottom');
    }
    if (clothing.accessory) {
        parts.push(imageToPart(clothing.accessory));
        clothingPieces.push('accessory');
    }

    const clothingDescription = clothingPieces.length > 0 ? `the provided ${clothingPieces.join(', ')}` : "the provided clothes";

    // 3. Text prompt instructing the model
    const textPrompt = `You are an expert virtual stylist. Your task is to edit the first image of a person to show them realistically wearing ${clothingDescription} from the subsequent images.
Place the person in the following scene: "${sceneDescription}".
The final image should be high quality and photorealistic. It is crucial to maintain the person's original facial features, body shape, and pose as closely as possible.
The output must be only the final, edited image. Do not output any text.`;

    parts.push({ text: textPrompt });

    return parts;
};

export const generateStyledImages = async (
    personFile: UploadedFile,
    clothing: ClothingSelection,
    updateLoadingMessage: (message: string) => void
): Promise<string[]> => {
    
    // As per ImageGrid.tsx, we need 4 images for 4 different scenes.
    const scenes = [
        'Full body shot in a photography studio with a neutral, clean background.',
        'Close-up shot from the waist up, focusing on the clothing details, in a well-lit indoor setting.',
        'A candid lifestyle shot in a cozy, modern living room.',
        'Walking down a stylish city street during the day.'
    ];

    const generatedImages: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const sceneTitle = scene.split(',')[0];
        updateLoadingMessage(`Generando look ${i + 1} de ${scenes.length}: ${sceneTitle}...`);

        try {
            const parts = buildPromptParts(personFile, clothing, scene);

            // Fix: Use the correct model and parameters for image editing as per guidelines.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            
            // Fix: Correctly extract the generated image from the response.
            let imageFound = false;
            if (response.candidates && response.candidates.length > 0) {
                // The model can output multiple parts, we need to find the image part.
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                        generatedImages.push(imageUrl);
                        imageFound = true;
                        break; // Found the image for this scene, move to the next.
                    }
                }
            }
            
            if (!imageFound) {
                 throw new Error(`La IA no devolvió una imagen para la escena: ${sceneTitle}`);
            }

        } catch (error) {
            console.error(`Error generating image for scene "${scene}":`, error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            throw new Error(`Error con la escena "${sceneTitle}": ${errorMessage}. Por favor, inténtelo de nuevo.`);
        }
    }

    if (generatedImages.length !== scenes.length) {
        // This case might be redundant due to the check inside the loop, but it's a good safeguard.
        throw new Error('No se pudieron generar todas las imágenes solicitadas. Por favor, inténtelo de nuevo.');
    }

    return generatedImages;
};
