
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const geminiService = {
  getWordDefinition: async (word: string, language: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("API key is not configured. Please set the API_KEY environment variable.");
    }
    
    const prompt = `Provide a concise English definition for the word "${word}" from the ${language} language. Include a simple example sentence in ${language} with its English translation. Format it as: "Definition: [Your definition].\nExample: [Example sentence in ${language}] ([English translation])"`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error fetching definition from Gemini API:", error);
      return "Could not fetch definition. Please check the console for errors.";
    }
  },

  getRandomQuote: async (): Promise<string> => {
    if (!API_KEY) {
      return "Reading is to the mind what exercise is to the body. - Joseph Addison";
    }

    const prompt = "Give me one short, inspirational quote about reading or language learning. Just the quote and the author, like 'Quote. - Author'.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error fetching quote from Gemini API:", error);
      return "The more that you read, the more things you will know. The more that you learn, the more places you'll go. - Dr. Seuss";
    }
  },
};
