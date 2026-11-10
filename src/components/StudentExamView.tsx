import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Play } from 'lucide-react';
import { cfD1 } from '../lib/cloudflareD1';
import { User } from '../lib/types';

interface StudentExamViewProps {
  examId: string;
  currentUser: User | null;
  onFinish: () => void;
}

export const StudentExamView: React.FC<StudentExamViewProps> = ({ examId, currentUser, onFinish }) => {
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    cfD1.getExamSet(examId)
      .then(data => {
        setExam(data);
        setAnswers(new Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60); // convert minutes to seconds
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load exam.');
        setLoading(false);
      });
  }, [examId]);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitted]);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Are you sure you want to submit the exam?')) return;
    
    setIsSubmitted(true);
    let correctCount = 0;
    exam.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctIndex) correctCount++;
    });
    
    setScore(correctCount);
    
    if (currentUser) {
      await cfD1.submitExamResult({
        id: `res_${Date.now()}`,
        examSetId: exam.id,
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        score: correctCount,
        total: exam.questions.length
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white">Loading Exam...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-[#070A12] flex items-center justify-center p-4">
      <div className="bg-rose-950/40 border border-rose-500/50 p-6 rounded-2xl text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Exam Unavailable</h2>
        <p className="text-sm text-rose-300">{error}</p>
        <button onClick={onFinish} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Go Home</button>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-blue-900/50 p-8 rounded-3xl max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-sm text-slate-400">Created by {exam.teacherName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-blue-950">
              <span className="text-slate-500 block text-xs">Questions</span>
              <span className="font-bold text-white text-lg">{exam.questions.length}</span>
            </div>
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-blue-950">
              <span className="text-slate-500 block text-xs">Time Limit</span>
              <span className="font-bold text-amber-400 text-lg">{exam.timeLimit} mins</span>
            </div>
          </div>
          <button onClick={() => setIsStarted(true)} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-emerald-500/50 p-8 rounded-3xl max-w-lg w-full text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Exam Completed!</h1>
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1">Your Score</p>
            <p className="text-4xl font-black text-emerald-400">{score} <span className="text-xl text-slate-500">/ {exam.questions.length}</span></p>
          </div>
          <button onClick={onFinish} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-[#070A12] flex flex-col p-4">
      <header className="max-w-3xl w-full mx-auto bg-[#111827] border border-blue-900/50 p-4 rounded-2xl flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{exam.title}</h2>
          <p className="text-xs text-slate-400">Question {currentQuestionIdx + 1} of {exam.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-rose-950/40 text-rose-400 animate-pulse' : 'bg-slate-800 text-amber-400'}`}>
          <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <div className="bg-[#111827] border border-blue-900/50 p-6 rounded-3xl flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 leading-relaxed">{currentQ.questionText}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <label key={idx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[currentQuestionIdx] === idx ? 'bg-blue-950/40 border-blue-500 text-white' : 'bg-[#0B0F19] border-blue-950 text-slate-300 hover:border-blue-800'}`}>
                <input type="radio" name={`q_${currentQ.id}`} checked={answers[currentQuestionIdx] === idx} onChange={() => {
                  const newAns = [...answers];
                  newAns[currentQuestionIdx] = idx;
                  setAnswers(newAns);
                }} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(prev => prev - 1)} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Previous</button>
          
          {currentQuestionIdx === exam.questions.length - 1 ? (
            <button onClick={() => handleSubmit(false)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg">Submit Exam</button>
          ) : (
            <button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold">Next Question</button>
          )}
        </div>
      </main>
    </div>
  );
};