import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Link as LinkIcon, Clock, BookOpen, AlertTriangle, PlayCircle } from 'lucide-react';
import { User } from '../lib/types';
import { cfD1 } from '../lib/cloudflareD1';

interface QuizDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allQuizzes: any[];
  onRefresh: () => void;
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({ isOpen, onClose, currentUser, allQuizzes, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'exams'>('create');
  
  // Create Quiz state
  const [subject, setSubject] = useState('Mathematics');
  const [gradeLevel, setGradeLevel] = useState('Class 9-10');
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [suggestion, setSuggestion] = useState<any>(null);
  
  // Create Exam state
  const [examTitle, setExamTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  useEffect(() => {
    // Check for duplicate question as teacher types
    if (questionText.length > 10) {
      const duplicate = allQuizzes.find(q => 
        q.questionText.toLowerCase().trim() === questionText.toLowerCase().trim()
      );
      setSuggestion(duplicate || null);
    } else {
      setSuggestion(null);
    }
  }, [questionText, allQuizzes]);

  if (!isOpen) return null;

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.trim())) return alert('All 4 options are required.');
    
    const newQuiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      subject,
      gradeLevel,
      topic,
      questionText,
      options,
      correctIndex
    };

    const success = await cfD1.saveQuiz(newQuiz);
    if (success) {
      alert('Quiz added successfully! You earned 1 point.');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      onRefresh();
    } else {
      alert('Failed to add quiz.');
    }
  };

  const handleCreateExam = async () => {
    if (!examTitle.trim()) return alert('Exam title is required.');
    if (selectedQuizzes.length === 0) return alert('Please select at least 1 question.');

    setIsCreatingExam(true);
    const newExam = {
      id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      title: examTitle,
      questionIds: selectedQuizzes,
      timeLimit
    };

    const res = await cfD1.createExamSet(newExam);
    if (res.success && res.examId) {
      const link = `${window.location.origin}/#/exam/${res.examId}`;
      setGeneratedLink(link);
    } else {
      alert('Failed to create exam.');
    }
    setIsCreatingExam(false);
  };

  const toggleQuizSelection = (id: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#111827] border border-blue-600/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-blue-950/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Quiz & Exam Center</h2>
            <p className="text-xs text-slate-400">Add quizzes to earn points and rank higher in applicant lists.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 bg-[#0B0F19] p-1 rounded-xl">
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Add New Quiz</button>
          <button onClick={() => setActiveTab('exams')} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${activeTab === 'exams' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Create Exam Set</button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Subject</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Class/Level</label>
                  <input type="text" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Topic</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Question Text</label>
                <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={2} className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" required />
                {suggestion && (
                  <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>A similar question already exists: "{suggestion.questionText}". Please avoid duplicates.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${correctIndex === idx ? 'border-emerald-500 bg-emerald-950/20' : 'border-blue-950 bg-[#0B0F19]'}`}>
                    <label className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                      <input type="radio" name="correct" checked={correctIndex === idx} onChange={() => setCorrectIndex(idx)} className="accent-emerald-500" />
                      Option {idx + 1} {correctIndex === idx && '(Correct)'}
                    </label>
                    <input type="text" value={opt} onChange={e => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }} className="w-full bg-[#111827] border border-blue-950 rounded-lg px-3 py-1.5 text-sm text-white" required />
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg">
                Add Quiz to Database (+1 Point)
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {!generatedLink ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Exam Title</label>
                      <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Mid-term Math Test" className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Time Limit (Minutes)</label>
                      <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                      <span>Select Questions ({selectedQuizzes.length} selected)</span>
                      <span className="text-xs text-slate-400 font-normal">Link expires in 24 hours</span>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {allQuizzes.map(quiz => (
                        <div key={quiz.id} onClick={() => toggleQuizSelection(quiz.id)} className={`p-3 rounded-xl border cursor-pointer flex gap-3 items-start ${selectedQuizzes.includes(quiz.id) ? 'bg-blue-950/40 border-blue-500' : 'bg-[#0B0F19] border-blue-950'}`}>
                          <input type="checkbox" checked={selectedQuizzes.includes(quiz.id)} readOnly className="mt-1 accent-blue-500" />
                          <div>
                            <p className="text-sm text-white font-medium">{quiz.questionText}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{quiz.subject} • {quiz.gradeLevel} • By {quiz.teacherName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleCreateExam} disabled={isCreatingExam} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg">
                    {isCreatingExam ? 'Generating...' : 'Generate Student Exam Link'}
                  </button>
                </>
              ) : (
                <div className="p-6 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl text-center space-y-4">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Exam Link Generated!</h3>
                  <p className="text-xs text-slate-300">Share this link with your students. It will automatically expire and delete after 24 hours.</p>
                  <div className="flex items-center gap-2 bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                    <input type="text" readOnly value={generatedLink} className="flex-1 bg-transparent text-sm text-cyan-300 outline-none" />
                    <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Copied!'); }} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold">Copy</button>
                  </div>
                  <button onClick={() => { setGeneratedLink(''); setSelectedQuizzes([]); setExamTitle(''); }} className="text-xs text-slate-400 hover:text-white underline">Create another exam</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};