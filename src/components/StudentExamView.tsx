import React, { useState, useEffect, useRef } from 'react';
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
  const [total, setTotal] = useState(0);

  // Use ref to avoid stale closure during auto-submit
  const answersRef = useRef<number[]>([]);
  const examRef = useRef<any>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    cfD1.getExamSet(examId)
      .then(data => {
        setExam(data);
        examRef.current = data;
        const initial = new Array(data.questions.length).fill(-1);
        setAnswers(initial);
        answersRef.current = initial;
        setTimeLeft(data.timeLimit * 60);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load exam.');
        setLoading(false);
      });
  }, [examId]);

  const doSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitted(true);

    const result = await cfD1.submitExamResult({
      examSetId: examRef.current.id,
      studentId: currentUser?.id,
      studentName: currentUser?.fullName,
      answers: answersRef.current,
    });

    if (result) {
      setScore(result.score);
      setTotal(result.total);
    } else {
      setScore(0);
      setTotal(examRef.current.questions.length);
    }
  };

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitted]);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Are you sure you want to submit the exam?')) return;
    await doSubmit();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-dvh bg-slate-50 flex items-center justify-center text-white">Loading Exam...</div>;

  if (error) return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-rose-50 border border-rose-500/50 p-6 rounded-2xl text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-rose-700 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Exam Unavailable</h2>
        <p className="text-sm text-rose-700">{error}</p>
        <button onClick={onFinish} className="mt-4 px-4 py-2 bg-slate-100 text-white rounded-lg text-sm">Go Home</button>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-blue-200 p-8 rounded-3xl max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-700 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-sm text-slate-500">Created by {exam.teacherName}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <span className="text-slate-500 block text-xs">Questions</span>
              <span className="font-bold text-white text-lg">{exam.questions.length}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <span className="text-slate-500 block text-xs">Time Limit</span>
              <span className="font-bold text-amber-700 text-lg">{exam.timeLimit} mins</span>
            </div>
          </div>
          <button onClick={() => setIsStarted(true)} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-emerald-500/50 p-8 rounded-3xl max-w-lg w-full text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-emerald-700 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Exam Completed!</h1>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Your Score</p>
            <p className="text-4xl font-black text-emerald-700">
              {score} <span className="text-xl text-slate-500">/ {total || exam.questions.length}</span>
            </p>
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
    <div className="min-h-dvh bg-slate-50 flex flex-col p-4">
      <header className="mx-auto mb-4 flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-blue-200 bg-white p-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <h2 className="max-w-full truncate text-sm font-bold text-white sm:max-w-xs">{exam.title}</h2>
          <p className="text-xs text-slate-500">Question {currentQuestionIdx + 1} of {exam.questions.length}</p>
        </div>
        <div className={`flex min-h-10 items-center gap-2 self-start rounded-xl px-3 py-2 font-mono text-lg font-bold sm:self-auto sm:px-4 ${timeLeft < 60 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-slate-100 text-amber-700'}`}>
          <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex flex-1 flex-col rounded-3xl border border-blue-200 bg-white p-4 sm:p-6">
          <h3 className="mb-6 break-words text-base font-semibold leading-relaxed text-white sm:text-lg">{currentQ.questionText}</h3>

          <div className="space-y-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <label key={idx} className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all sm:p-4 ${answers[currentQuestionIdx] === idx ? 'bg-blue-50 border-blue-500 text-white' : 'bg-white border-blue-200 text-slate-600 hover:border-blue-200'}`}>
                <input type="radio" name={`q_${currentQ.id}`} checked={answers[currentQuestionIdx] === idx} onChange={() => {
                  const newAns = [...answers];
                  newAns[currentQuestionIdx] = idx;
                  setAnswers(newAns);
                  answersRef.current = newAns;
                }} className="w-4 h-4 accent-blue-500" />
                <span className="min-w-0 break-words text-sm font-medium">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-6">
          <button disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(prev => prev - 1)} className="min-h-11 px-4 py-2.5 bg-slate-100 text-white rounded-xl text-sm font-semibold disabled:opacity-50 sm:px-5">Previous</button>

          {currentQuestionIdx === exam.questions.length - 1 ? (
            <button onClick={() => handleSubmit(false)} className="min-h-11 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg sm:px-6">Submit Exam</button>
          ) : (
            <button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} className="min-h-11 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold sm:px-5">Next Question</button>
          )}
        </div>
      </main>
    </div>
  );
};