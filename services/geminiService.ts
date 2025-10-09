import { GoogleGenAI, Type } from "@google/genai";
import type { Word } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// The definition now includes the original word's text, as the normalized form might lose casing.
export interface WordDefinition {
    definition: string;
    exampleSentence: string;
    exampleTranslation: string;
}


export const geminiService = {
  getWordDefinition: async (word: string, language: string): Promise<WordDefinition> => {
    if (!API_KEY) {
        return Promise.resolve({
            definition: "API key is not configured.",
            exampleSentence: "",
            exampleTranslation: ""
        });
    }
    
    const prompt = `Provide a concise English definition for the word "${word}" from the ${language} language. Also, provide a simple example sentence in ${language} and its English translation.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              definition: {
                type: Type.STRING,
                description: 'A concise English definition of the word.'
              },
              exampleSentence: {
                type: Type.STRING,
                description: `An example sentence using the word in its original language (${language}).`
              },
              exampleTranslation: {
                type: Type.STRING,
                description: 'The English translation of the example sentence.'
              }
            }
          }
        }
      });

      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText);
      
      // Basic validation of the parsed object
      if (parsed && typeof parsed.definition === 'string' && typeof parsed.exampleSentence === 'string' && typeof parsed.exampleTranslation === 'string') {
        return parsed;
      } else {
        throw new Error("Parsed JSON does not match the expected format.");
      }

    } catch (error) {
      console.error("Error fetching or parsing definition from Gemini API:", error);
      // Fallback to a plain text response if JSON fails.
      return {
          definition: "Could not fetch a structured definition. Please try again.",
          exampleSentence: "",
          exampleTranslation: ""
      };
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

  getTextFromUrl: async (url: string): Promise<string> => {
    if (!API_KEY) {
      return Promise.reject("API key is not configured.");
    }

    const prompt = `Please act as a web content extractor. Your task is to extract the main article text from the content found at the URL: ${url}. 

    Instructions:
    1. Focus ONLY on the primary content of the article.
    2. Exclude all navigation menus, headers, footers, sidebars, advertisements, and user comment sections.
    3. Return only the clean, unformatted text of the article. Do not add any commentary, summaries, or introductions like "Here is the text from the URL:". Just provide the raw article text.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const extractedText = response.text;
      if (!extractedText || extractedText.trim().length < 50) { // Basic check for empty or junk response
        throw new Error("Model returned little or no content.");
      }
      return extractedText;
    } catch (error) {
      console.error("Error fetching text from URL via Gemini API:", error);
      throw new Error("Failed to extract text from the provided URL. The site may be inaccessible or the content too complex.");
    }
  },
};