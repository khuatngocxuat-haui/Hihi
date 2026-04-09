import React from 'react';
import { Vocabulary } from '../data';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface VocabularyCardProps {
  vocab: Vocabulary;
  onSpeak: (text: string) => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ vocab, onSpeak }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={vocab.image || `https://picsum.photos/seed/${vocab.hanzi}/400/300`}
            alt={vocab.hanzi}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-3xl font-bold text-white">{vocab.hanzi}</h3>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-mono text-blue-600 font-semibold">{vocab.pinyin}</p>
              <p className="text-lg font-medium text-gray-800">{vocab.vietnamese}</p>
            </div>
            <button
              onClick={() => onSpeak(vocab.hanzi)}
              className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
            <Info size={14} />
            <span>Tiếng Anh: {vocab.english}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
