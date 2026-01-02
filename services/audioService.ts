
import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Implement manual base64 decoding as per guideline
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Fix: Implement manual PCM decoding for AudioBuffer as per guideline
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const audioService = {
  audioContext: null as AudioContext | null,
  // Add reference to track current playing source for interruption
  currentSource: null as AudioBufferSourceNode | null,

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioContext;
  },

  // Add stop method to interrupt audio playback
  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      this.currentSource = null;
    }
  },

  /**
   * تحويل النص إلى صوت وتشغيله
   */
  async speak(text: string, onEnded?: () => void) {
    // Stop any existing audio before starting a new one
    this.stop();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = this.getAudioContext();
        
        // Fix: Use the compliant decode functions
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        this.currentSource = source;
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          if (this.currentSource === source) {
            this.currentSource = null;
          }
          if (onEnded) onEnded();
        };
        
        source.start();
        return source;
      }
    } catch (e) {
      console.error("Audio Service Error:", e);
    }
    return null;
  }
};
