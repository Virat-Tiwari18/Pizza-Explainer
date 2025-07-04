import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = "gemini-2.5-flash-preview-04-17";
const imageModel = "imagen-3.0-generate-002";

// Define the structure for the comic data
interface ComicPanelScript {
  panel: number;
  description: string;
  dialogue: string;
}

export interface ComicPanelData extends ComicPanelScript {
  image: string; // base64 image data url
}


// Function to generate the text explanation
const generateTextExplanation = async (topic: string): Promise<string> => {
  const systemInstruction = `
You are "The Pizza Professor," a world-renowned expert who can explain any concept, no matter how complex, using only pizza analogies. 
Your tone is fun, enthusiastic, and a little cheesy (like extra mozzarella!). 
You should break down the topic into simple, digestible parts, relating each part to an aspect of pizza: ingredients, the making process, different types of pizzas, ordering, sharing, etc. 
Keep your explanation concise and to the point, aiming for just a few paragraphs.
Always be creative and make the connection clear and easy to understand. End with a fun pizza-related sign-off.
Never break character. Do not use markdown formatting.
`;
  const prompt = `Please explain the concept of "${topic}" for me.`;
  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    },
  });
  const text = response.text;
  if (!text) {
    throw new Error("The model returned an empty text response. The kitchen might be closed!");
  }
  return text;
};


// Function to generate the comic
const generateComic = async (topic: string): Promise<ComicPanelData[]> => {
  // Step 1: Generate the comic script (JSON)
  const comicScriptPrompt = `
    Create a 4-panel webcomic script explaining the concept of "${topic}" using a pizza analogy.
    The main character is "The Pizza Professor," a friendly expert with a chef hat.
    The style is fun, simple, and educational.
    The output MUST be a JSON array of exactly 4 objects. Each object must represent a panel and have three keys:
    - "panel": The panel number (1, 2, 3, 4).
    - "description": A detailed visual description of the scene, character actions, and expressions for the image generator. Be specific.
    - "dialogue": The text or dialogue for that panel, spoken by The Pizza Professor. Keep it concise.
    
    Example for "Photosynthesis":
    [
      {"panel": 1, "description": "The Pizza Professor standing in a sunny kitchen holding a basil leaf like it's a solar panel.", "dialogue": "Think of this basil leaf like a tiny solar-powered pizza oven!"},
      {"panel": 2, "description": "Close up on the basil leaf with arrows showing sunlight, water, and CO2 going in.", "dialogue": "It takes in sunlight, water, and air... our key ingredients!"},
      {"panel": 3, "description": "The Pizza Professor pointing to a diagram showing the leaf producing sugar (a tiny pizza slice) and oxygen.", "dialogue": "And bakes them into energy-packed 'sugar pizzas' to grow, releasing fresh air as a bonus!"},
      {"panel": 4, "description": "The Pizza Professor smiling, giving a thumbs up, with a whole pizza that has a sun decoration on it.", "dialogue": "That's photosynthesis! Nature's way of making its own delicious energy food!"}
    ]
  `;
  
  const scriptResponse = await ai.models.generateContent({
    model: textModel,
    contents: comicScriptPrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  let jsonStr = scriptResponse.text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  
  let script: ComicPanelScript[];
  try {
    script = JSON.parse(jsonStr);
    if (!Array.isArray(script) || script.length !== 4 || script.some(p => !p.panel || !p.description || !p.dialogue)) {
        throw new Error("Invalid comic script format received from model. Expected a 4-panel comic.");
    }
  } catch(e) {
      console.error("Failed to parse comic script JSON:", jsonStr);
      const originalError = e instanceof Error ? e.message : "Unknown error";
      throw new Error(`Sorry, I couldn't write the comic script. The recipe was wrong! (Details: ${originalError})`);
  }

  // Step 2: Generate an image for each panel in the script
  const imagePromises = script.map(panel => {
    const imagePrompt = `A simple and cute webcomic panel in a flat color style with clear outlines. The scene: ${panel.description}.`;
    return ai.models.generateImages({
        model: imageModel,
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
  });

  const imageResults = await Promise.all(imagePromises);

  const comicPanelsWithImages = imageResults.map((result, index) => {
    if (!result.generatedImages || result.generatedImages.length === 0) {
      throw new Error(`Image generation failed for panel ${index + 1}.`);
    }
    const base64ImageBytes = result.generatedImages[0].image.imageBytes;
    return {
      ...script[index],
      image: `data:image/jpeg;base64,${base64ImageBytes}`,
    };
  });

  return comicPanelsWithImages;
};


/**
 * Generates an explanation and a comic for a given topic using a pizza analogy.
 * @param topic The topic to explain.
 * @returns A promise that resolves to an object with the explanation text and comic data.
 */
export const explainWithPizza = async (topic: string): Promise<{ explanation: string, comic: ComicPanelData[] }> => {
  try {
    // Run both text and comic generation in parallel
    const [explanation, comic] = await Promise.all([
      generateTextExplanation(topic),
      generateComic(topic)
    ]);

    return { explanation, comic };

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error("There's an issue with the API key. Please check the server configuration.");
    }
    // Check for specific error messages from sub-functions or provide a general one
    if (error instanceof Error) {
        throw new Error(`Sorry, I burnt the pizza! The explanation couldn't be generated. Reason: ${error.message}`);
    }
    throw new Error("Sorry, I burnt the pizza! The explanation couldn't be generated right now. Please try again later.");
  }
};