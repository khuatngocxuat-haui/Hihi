import React, { useState, useRef } from 'react';
import { geminiService } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2, Play, Award, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PronunciationPracticeProps {
  pinyin: string;
  hanzi: string;
}

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({ pinyin, hanzi }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64 for Gemini
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          setLoading(true);
          const result = await geminiService.getPronunciationFeedback(pinyin, base64data);
          setFeedback(result);
          setLoading(false);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playRecordedAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <div className="text-center">
            <h3 className="text-5xl font-bold text-gray-900 mb-2">{hanzi}</h3>
            <p className="text-xl font-mono text-blue-600 font-semibold">{pinyin}</p>
          </div>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                <Mic size={32} />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200"
              >
                <Square size={32} />
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-500 font-medium">
            {isRecording ? "Đang ghi âm... Nhấn nút đỏ để dừng" : "Nhấn nút xanh để bắt đầu ghi âm phát âm của bạn"}
          </p>

          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium">AI đang phân tích...</span>
            </div>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4 pt-4 border-t border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="text-yellow-500" size={24} />
                    <span className="text-2xl font-bold">{feedback.score}/100</span>
                  </div>
                  {audioUrl && (
                    <Button variant="outline" size="sm" onClick={playRecordedAudio}>
                      <Play size={16} className="mr-2" /> Nghe lại
                    </Button>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {feedback.feedback}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lời khuyên</p>
                  <ul className="space-y-1">
                    {feedback.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
