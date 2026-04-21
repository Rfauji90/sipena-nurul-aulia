import { GoogleGenerativeAI } from "@google/generative-ai";

// Ideally this should be in .env.local as VITE_GEMINI_API_KEY
// For now using the same pattern as firebase.ts if provided, but leaving placeholder
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateSummary = async (content: string) => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Anda adalah asisten ahli pendidikan di sekolah Nurul Aulia. 
    Tugas Anda adalah memberikan ringkasan profesional dan saran perbaikan berdasarkan catatan supervisi guru berikut:
    
    "${content}"
    
    Berikan respons dalam Bahasa Indonesia yang formal (gaya kedinasan), yang mencakup:
    1. Ringkasan singkat kinerja guru.
    2. Poin-poin kekuatan (jika ada).
    3. Rekomendasi konkret untuk pengembangan profesional guru tersebut.
    
    Format respons dengan Markdown yang rapi.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI summary:", error);
    throw error;
  }
};
