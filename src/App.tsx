import React, { useState, useEffect } from 'react';
import { LESSONS, VOCABULARY, Vocabulary, Lesson } from './data';
import { VocabularyCard } from './components/VocabularyCard';
import { WritingCanvas } from './components/WritingCanvas';
import { Quiz } from './components/Quiz';
import { PronunciationPractice } from './components/PronunciationPractice';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, Settings, ChevronRight, ChevronLeft, Home, BrainCircuit, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, onSnapshot, serverTimestamp, handleFirestoreError, OperationType, User, collection } from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'lesson' | 'progress' | 'quiz'>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [quizTopic, setQuizTopic] = useState<{ topic: string, level: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProgress({});
      return;
    }

    const path = `users/${user.uid}/progress`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const progressData: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        progressData[doc.id] = doc.data().progress;
      });
      setUserProgress(progressData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đăng nhập thất bại.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Đã đăng xuất.");
      setCurrentView('home');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentVocabIndex(0);
    setCurrentView('lesson');
  };

  const startQuiz = (topic: string, level: string) => {
    setQuizTopic({ topic, level });
    setCurrentView('quiz');
  };

  const updateProgressInFirestore = async (lessonId: string, progress: number) => {
    if (!user) return;
    const path = `users/${user.uid}/progress/${lessonId}`;
    try {
      await setDoc(doc(db, path), {
        uid: user.uid,
        lessonId,
        progress,
        updatedAt: serverTimestamp()
      });
      
      // Also update stats
      const statsPath = `users/${user.uid}/stats/main`;
      const masteredLessons = Object.values(userProgress).filter(p => p === 100).length;
      await setDoc(doc(db, statsPath), {
        uid: user.uid,
        totalWordsLearned: masteredLessons * 3,
        lastActive: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const nextVocab = () => {
    if (selectedLesson && currentVocabIndex < selectedLesson.vocabIds.length - 1) {
      setCurrentVocabIndex(prev => prev + 1);
    } else {
      toast.success("Chúc mừng! Bạn đã hoàn thành bài học này.");
      if (selectedLesson) {
        updateProgressInFirestore(selectedLesson.id, 100);
      }
      setCurrentView('home');
    }
  };

  const currentVocab = selectedLesson
    ? VOCABULARY.find(v => v.id === selectedLesson.vocabIds[currentVocabIndex])
    : null;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-gray-900 font-sans selection:bg-blue-100">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-16">
        <NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={20} />} label="Trang chủ" />
        <NavButton active={currentView === 'progress'} onClick={() => setCurrentView('progress')} icon={<Trophy size={20} />} label="Tiến độ" />
        {user ? (
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
            <span className="text-[10px] font-medium uppercase tracking-widest">Thoát</span>
          </button>
        ) : (
          <button onClick={handleLogin} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all">
            <LogIn size={20} />
            <span className="text-[10px] font-medium uppercase tracking-widest">Vào</span>
          </button>
        )}
      </nav>

      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto md:pt-24">
        {!user && currentView === 'home' && (
          <div className="mb-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
            <h2 className="text-2xl font-bold mb-2">Học tiếng Trung miễn phí!</h2>
            <p className="opacity-90 mb-6">Đăng nhập để lưu lại tiến độ học tập của bạn.</p>
            <Button onClick={handleLogin} className="bg-white text-blue-600 hover:bg-gray-100 w-full py-6 rounded-2xl font-bold">
              <LogIn className="mr-2" size={20} /> Đăng nhập ngay
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    {user ? `Chào, ${user.displayName?.split(' ')[0]}! 👋` : 'Chào bạn! 👋'}
                  </h1>
                  <p className="text-gray-500 mt-2">Hôm nay bạn muốn học gì nào?</p>
                </div>
                {user?.photoURL && (
                  <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                )}
              </header>

              <div className="grid gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="text-blue-500" size={24} />
                  Bài học cơ bản
                </h2>
                {LESSONS.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    progress={userProgress[lesson.id] || 0}
                    onClick={() => startLesson(lesson)}
                  />
                ))}
              </div>

              <div className="grid gap-4 pt-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BrainCircuit className="text-purple-500" size={24} />
                  Kiểm tra với AI
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <QuizCard title="Chào hỏi" level="HSK1" onClick={() => startQuiz("Chào hỏi", "HSK1")} />
                  <QuizCard title="Số đếm" level="HSK1" onClick={() => startQuiz("Số đếm", "HSK1")} />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'lesson' && selectedLesson && currentVocab && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
                  <ChevronLeft size={20} /> Quay lại
                </Button>
                <div className="flex-1 mx-4">
                  <Progress value={((currentVocabIndex + 1) / selectedLesson.vocabIds.length) * 100} className="h-2" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {currentVocabIndex + 1}/{selectedLesson.vocabIds.length}
                </span>
              </div>

              <Tabs defaultValue="learn" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="learn">Học từ</TabsTrigger>
                  <TabsTrigger value="write">Luyện viết</TabsTrigger>
                  <TabsTrigger value="speak">Phát âm</TabsTrigger>
                </TabsList>
                
                <TabsContent value="learn" className="mt-0">
                  <VocabularyCard vocab={currentVocab} onSpeak={handleSpeak} />
                </TabsContent>
                
                <TabsContent value="write" className="mt-0 flex justify-center">
                  <WritingCanvas character={currentVocab.hanzi[0]} onComplete={() => toast.success("Tuyệt vời!")} />
                </TabsContent>

                <TabsContent value="speak" className="mt-0">
                  <PronunciationPractice pinyin={currentVocab.pinyin} hanzi={currentVocab.hanzi} />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4">
                <Button onClick={nextVocab} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl text-lg shadow-lg shadow-blue-200 transition-all active:scale-95">
                  Tiếp theo <ChevronRight size={20} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentView === 'quiz' && quizTopic && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
                  <ChevronLeft size={20} /> Thoát
                </Button>
                <h2 className="text-xl font-bold">Kiểm tra: {quizTopic.topic}</h2>
              </div>
              <Quiz
                topic={quizTopic.topic}
                level={quizTopic.level}
                onComplete={(score) => {
                  toast.success(`Bạn đã hoàn thành bài kiểm tra với ${score} câu đúng!`);
                  setCurrentView('home');
                }}
              />
            </motion.div>
          )}

          {currentView === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-3xl font-bold">Tiến độ của bạn</h1>
                <p className="text-gray-500">Xem bạn đã đi được bao xa rồi.</p>
              </header>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Tổng số từ đã học</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {Object.values(userProgress).filter(p => p === 100).length * 3}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <Trophy className="text-blue-500" size={32} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Hoàn thành lộ trình HSK1</span>
                    <span>{Math.round((Object.values(userProgress).filter(p => p === 100).length / LESSONS.length) * 100)}%</span>
                  </div>
                  <Progress value={(Object.values(userProgress).filter(p => p === 100).length / LESSONS.length) * 100} className="h-3 bg-blue-50" />
                </div>
              </div>

              <div className="grid gap-4">
                <h3 className="font-semibold text-lg">Chi tiết bài học</h3>
                {LESSONS.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userProgress[lesson.id] === 100 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {userProgress[lesson.id] === 100 ? <Trophy size={18} /> : <BookOpen size={18} />}
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-400">{lesson.vocabIds.length} từ vựng</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${userProgress[lesson.id] === 100 ? 'text-green-600' : 'text-gray-400'}`}>
                      {userProgress[lesson.id] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
    </button>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  progress: number;
  onClick: () => void;
  key?: string | number;
}

function LessonItem({ lesson, progress, onClick }: LessonItemProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {lesson.order}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{lesson.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {progress === 100 ? (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <Trophy size={16} />
          </div>
        ) : (
          <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
            <ChevronRight size={24} />
          </div>
        )}
      </div>
    </button>
  );
}

function QuizCard({ title, level, onClick }: { title: string; level: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white text-left shadow-lg shadow-purple-100 hover:scale-[1.02] transition-transform"
    >
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
        <BrainCircuit size={20} />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-xs opacity-80 font-medium uppercase tracking-wider">{level}</p>
    </button>
  );
}
