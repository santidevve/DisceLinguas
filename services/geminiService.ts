import { GoogleGenAI, Type, Modality } from "@google/genai";
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

export interface PronunciationFeedback {
    score: number;
    feedback: string;
    isCorrect: boolean;
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

  generateSpeech: async (text: string, language: string): Promise<{audioBase64: string, mimeType: string} | null> => {
    if (!API_KEY) {
        console.warn("API key is not configured.");
        return null;
    }
    
    const prompt = `Please act as a text-to-speech engine. Your only task is to read the following text aloud in a natural-sounding, clear ${language} voice. Do not add any commentary, introduction, or extra words. Just speak the provided text. The text is: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            contents: prompt,
            config: {
                responseModalities: [Modality.AUDIO],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                    return {
                        audioBase64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType
                    };
                }
            }
        }
        console.warn("No audio data found in Gemini response.");
        return null;

    } catch (error) {
        console.error("Error generating speech from Gemini API:", error);
        return null;
    }
  },

  evaluatePronunciation: async (word: string, language: string, audioBase64: string, mimeType: string): Promise<PronunciationFeedback> => {
    if (!API_KEY) {
        return Promise.resolve({
            score: 0,
            feedback: "API key is not configured.",
            isCorrect: false,
        });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const prompt = `You are an expert language pronunciation tutor. A student is practicing the pronunciation of the word "${word}" in the ${language} language. 
    Analyze the provided audio recording. 
    1. Determine if the pronunciation is correct or incorrect.
    2. Provide a score from 0 to 100, where 100 is a perfect native-like pronunciation.
    3. Give one single, concise, and actionable tip for improvement if needed. If the pronunciation is excellent, the feedback can be a simple compliment.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, {text: prompt}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: {
                            type: Type.BOOLEAN,
                            description: 'Whether the pronunciation is fundamentally correct or not.'
                        },
                        score: {
                            type: Type.INTEGER,
                            description: 'A score from 0 to 100 for the pronunciation accuracy.'
                        },
                        feedback: {
                            type: Type.STRING,
                            description: 'A concise, actionable tip for improvement or a compliment.'
                        }
                    },
                    required: ['isCorrect', 'score', 'feedback']
                }
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);

        if (parsed && typeof parsed.score === 'number' && typeof parsed.feedback === 'string' && typeof parsed.isCorrect === 'boolean') {
            return parsed;
        } else {
            throw new Error("Parsed JSON does not match the expected PronunciationFeedback format.");
        }

    } catch (error) {
        console.error("Error fetching or parsing pronunciation feedback from Gemini API:", error);
        return {
            score: 0,
            feedback: "Could not get feedback. The model may have had an issue processing the audio.",
            isCorrect: false,
        };
    }
  },
};
