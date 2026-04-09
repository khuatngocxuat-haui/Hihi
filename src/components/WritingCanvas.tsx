import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface WritingCanvasProps {
  character: string;
  onComplete?: () => void;
  size?: number;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({ character, onComplete, size = 200 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (containerRef.current && character) {
      containerRef.current.innerHTML = '';
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        strokeColor: '#ef4444', // red-500
        outlineColor: '#e5e7eb', // gray-200
      });

      writerRef.current.quiz({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }
  }, [character, size, onComplete]);

  const handleAnimate = () => {
    writerRef.current?.animateCharacter();
  };

  const handleReset = () => {
    writerRef.current?.quiz();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div ref={containerRef} className="border-2 border-dashed border-gray-200 rounded-lg p-2 bg-slate-50" />
      <div className="flex gap-2">
        <button
          onClick={handleAnimate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Xem mẫu
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Viết lại
        </button>
      </div>
    </div>
  );
};
