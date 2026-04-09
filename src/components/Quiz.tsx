import React, { useState, useEffect } from 'react';
import { geminiService } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizProps {
  topic: string;
  level: string;
  onComplete: (score: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ topic, level, onComplete }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [topic, level]);

  const loadQuiz = async () => {
    setLoading(true);
    const data = await geminiService.generateQuizQuestions(topic, level);
    setQuestions(data);
    setLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    if (questions[currentIndex].options[optionIndex].isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-500 font-medium">Đang tạo câu hỏi bằng AI...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Không thể tải câu hỏi. Vui lòng thử lại.</p>
        <Button onClick={loadQuiz} variant="outline">
          <RefreshCw className="mr-2" size={16} /> Thử lại
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Câu hỏi {currentIndex + 1}/{questions.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Điểm: {score}</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((option: any, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                  isAnswered
                    ? option.isCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : selectedOption === index
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-100 opacity-50'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span className="font-medium">{option.text}</span>
                {isAnswered && option.isCorrect && <CheckCircle2 className="text-green-500" size={20} />}
                {isAnswered && selectedOption === index && !option.isCorrect && <XCircle className="text-red-500" size={20} />}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-gray-100"
              >
                <p className="text-sm text-gray-600 italic">
                  <span className="font-bold text-blue-600 not-italic">Giải thích: </span>
                  {currentQuestion.explanation}
                </p>
                <div className="flex justify-end mt-4">
                  <Button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700">
                    {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
