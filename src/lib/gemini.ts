import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async getPronunciationFeedback(pinyin: string, userAudioBase64: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            text: `Phân tích phát âm tiếng Trung cho từ có Pinyin: "${pinyin}". So sánh với đoạn âm thanh của người dùng và đưa ra nhận xét chi tiết bằng tiếng Việt. Trả về kết quả dưới dạng JSON.`,
          },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: userAudioBase64,
            },
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Điểm số từ 0-100" },
              feedback: { type: Type.STRING, description: "Nhận xét chi tiết" },
              tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lời khuyên cải thiện" },
            },
            required: ["score", "feedback", "tips"],
          },
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Error getting pronunciation feedback:", error);
      return null;
    }
  },

  async generateQuizQuestions(topic: string, level: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo 5 câu hỏi trắc nghiệm tiếng Trung cho chủ đề "${topic}" trình độ "${level}". Mỗi câu hỏi bao gồm: câu hỏi (Hán tự), các lựa chọn (Pinyin và nghĩa tiếng Việt), đáp án đúng. Trả về JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      isCorrect: { type: Type.BOOLEAN },
                    },
                  },
                },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "explanation"],
            },
          },
        },
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      return [];
    }
  }
};
