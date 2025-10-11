import { geminiService } from './geminiService';

// Module-level state
let currentAudio: HTMLAudioElement | null = null;

// Cache to store generated audio to avoid repeated API calls
// Key: language:text, Value: Blob URL string
const audioCache = new Map<string, string>();

function base64ToBlobUrl(base64: string, mimeType: string): string {
    try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("Error converting base64 to Blob URL:", e);
        throw e;
    }
}

// Clean up old blob URLs to prevent memory leaks
const cleanupCache = () => {
    const MAX_CACHE_SIZE = 50;
    if (audioCache.size > MAX_CACHE_SIZE) {
        const oldestKey = audioCache.keys().next().value;
        const oldUrl = audioCache.get(oldestKey);
        if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
        }
        audioCache.delete(oldestKey);
    }
};

export const ttsService = {
  speak: async (text: string, language: string, callbacks: { onStart: () => void; onEnd: () => void; onError: (e: any) => void; onBoundary?: (e: SpeechSynthesisEvent) => void; }) => {
    
    ttsService.stop(); // Stop any currently playing audio
    callbacks.onStart();
    const cacheKey = `${language}:${text}`;

    try {
        let blobUrl = audioCache.get(cacheKey);

        if (!blobUrl) {
            const result = await geminiService.generateSpeech(text, language);
            if (!result) {
                throw new Error("No audio data received from API.");
            }
            blobUrl = base64ToBlobUrl(result.audioBase64, result.mimeType);
            audioCache.set(cacheKey, blobUrl);
            cleanupCache();
        }

        currentAudio = new Audio(blobUrl);
        
        currentAudio.onended = () => {
            callbacks.onEnd();
            currentAudio = null;
        };
        currentAudio.onerror = (e) => {
            callbacks.onError(e);
            currentAudio = null;
        };
        
        // Note: The onBoundary callback for word-by-word highlighting is not supported
        // with this audio playback method, as it was with the SpeechSynthesis API.

        await currentAudio.play();

    } catch (error) {
        callbacks.onError(error);
        currentAudio = null;
    }
  },

  stop: () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = ''; // Detach the source to stop download
      currentAudio = null;
    }
  },

  pause: () => {
    if (currentAudio) {
      currentAudio.pause();
    }
  },

  resume: () => {
    if (currentAudio) {
      currentAudio.play();
    }
  }
};
