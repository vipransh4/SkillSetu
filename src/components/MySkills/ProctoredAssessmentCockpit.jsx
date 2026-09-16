import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Code2, 
  Sparkles, 
  Zap, 
  RefreshCw,
  Lock,
  Eye,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../api/client';

const ProctoredAssessmentCockpit = ({ 
  session, 
  candidateId, 
  onComplete, 
  onExit,
  onError 
}) => {
  const questions = useMemo(() => session?.questions || [], [session]);
  const totalQuestions = questions.length;

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState({});
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [infractionCount, setInfractionCount] = useState(0);
  const [infractionLogs, setInfractionLogs] = useState([]);
  const [showFocusLostModal, setShowFocusLostModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cadenceWarning, setCadenceWarning] = useState(null);
  const [pasteWarning, setPasteWarning] = useState(null);

  const activeQuestion = questions[activeQuestionIdx] || null;

  const getTimingConfig = (question) => {
    if (!question) {
      return { allocatedSeconds: 60, weight: 1.0, categoryLabel: 'Technical Assessment' };
    }
    const isViva = (question.type || '').toUpperCase() === 'VIVA';
    const difficulty = (question.difficulty || '').toUpperCase();

    if (isViva) {
      if (difficulty === 'HARD') {
        return { allocatedSeconds: 300, weight: 2.5, categoryLabel: 'Architectural Scenario & Synthesis' };
      }
      return { allocatedSeconds: 180, weight: 1.5, categoryLabel: 'Technical Reasoning & Viva' };
    }

    if (difficulty === 'HARD') {
      return { allocatedSeconds: 120, weight: 2.5, categoryLabel: 'Advanced Technical Problem' };
    }
    if (difficulty === 'EASY') {
      return { allocatedSeconds: 45, weight: 1.0, categoryLabel: 'Fundamentals & Syntax Recall' };
    }
    return { allocatedSeconds: 90, weight: 1.5, categoryLabel: 'Systems & Algorithmic Code Trace' };
  };

  const currentTiming = useMemo(() => getTimingConfig(activeQuestion), [activeQuestion]);

  const [questionSecondsRemaining, setQuestionSecondsRemaining] = useState(currentTiming.allocatedSeconds);

  useEffect(() => {
    const allocated = currentTiming.allocatedSeconds;
    const spent = (activeQuestion && timeSpentPerQuestion[activeQuestion.id]) || 0;
    setQuestionSecondsRemaining(Math.max(0, allocated - spent));
  }, [activeQuestionIdx, activeQuestion, currentTiming]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const calculateTelemetry = (question, spentSeconds) => {
    const { allocatedSeconds, weight } = getTimingConfig(question);
    const validSpent = Math.max(0, spentSeconds);
    const decayRatio = Math.min(1.0, validSpent / allocatedSeconds);
    const confidenceDecay = Math.max(0.85, 1.0 - (0.15 * decayRatio));
    const scoreEfficiency = weight * confidenceDecay;

    return {
      weight,
      allocatedSeconds,
      spentSeconds: validSpent,
      confidenceDecay: Number(confidenceDecay.toFixed(4)),
      scoreEfficiency: Number(scoreEfficiency.toFixed(4))
    };
  };

  const activeTelemetry = useMemo(() => {
    if (!activeQuestion) return { weight: 1.0, confidenceDecay: 1.0, scoreEfficiency: 1.0 };
    const spent = (timeSpentPerQuestion[activeQuestion.id] || 0);
    return calculateTelemetry(activeQuestion, spent);
  }, [activeQuestion, timeSpentPerQuestion]);

  const autoAdvanceOrSubmit = useRef(null);

  autoAdvanceOrSubmit.current = () => {
    if (activeQuestionIdx < totalQuestions - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      executeSubmission();
    }
  };

  useEffect(() => {
    if (isSubmitting || totalQuestions === 0) return;

    const timer = setInterval(() => {
      setTotalTimeSeconds((prev) => prev + 1);

      if (activeQuestion) {
        setTimeSpentPerQuestion((prev) => {
          const currentSpent = prev[activeQuestion.id] || 0;
          return { ...prev, [activeQuestion.id]: currentSpent + 1 };
        });
      }

      setQuestionSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (autoAdvanceOrSubmit.current) {
            autoAdvanceOrSubmit.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuestionIdx, activeQuestion, isSubmitting, totalQuestions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setInfractionCount((prev) => prev + 1);
        setShowFocusLostModal(true);
        setInfractionLogs((prev) => [
          ...prev,
          {
            type: 'WINDOW_BLUR',
            timestamp: new Date().toISOString(),
            questionIndex: activeQuestionIdx + 1
          }
        ]);
      }
    };

    const handleWindowBlur = () => {
      setInfractionCount((prev) => prev + 1);
      setShowFocusLostModal(true);
      setInfractionLogs((prev) => [
        ...prev,
        {
          type: 'TAB_SWITCH',
          timestamp: new Date().toISOString(),
          questionIndex: activeQuestionIdx + 1
        }
      ]);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeQuestionIdx]);

  const handleBlockedPaste = () => {
    setPasteWarning('External clipboard operations are locked under assessment proctoring protocol.');
    setTimeout(() => setPasteWarning(null), 3500);
  };

  const handleDescriptiveChange = (questionId, newText) => {
    const previous = answers[questionId] || '';
    const deltaLength = newText.length - previous.length;

    if (deltaLength > 30) {
      setCadenceWarning('Instantaneous text injection detected. Programmatic paste dumps are prohibited.');
      setTimeout(() => setCadenceWarning(null), 4000);
      return;
    }

    setCadenceWarning(null);
    setAnswers((prev) => ({ ...prev, [questionId]: newText }));
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const executeSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersPayload = questions.map((q) => {
        const spent = timeSpentPerQuestion[q.id] || 15;
        const telemetry = calculateTelemetry(q, spent);
        const textAnswer = answers[q.id] || '';

        return {
          id: q.id,
          questionId: q.id,
          answer_text: textAnswer,
          selectedOption: textAnswer,
          time_taken_seconds: spent,
          timeSpent: spent,
          confidenceDecay: telemetry.confidenceDecay,
          scoreEfficiency: telemetry.scoreEfficiency
        };
      });

      const submissionPayload = {
        target_role: session?.role_title || '',
        session_id: session?.session_id,
        clusterId: session?.session_id,
        candidateId: candidateId || 'candidate',
        infractionCount: infractionCount,
        totalTimeSeconds: totalTimeSeconds,
        answers: answersPayload
      };

      const res = await apiClient.post('/students/submit-test', submissionPayload);

      let updatedProfile = null;
      try {
        const profileRes = await apiClient.get('/students/me');
        updatedProfile = profileRes.data;
      } catch (e) {}

      if (onComplete) {
        onComplete(res.data, updatedProfile);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Assessment submission failed.';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatClock = (totalSeconds) => {
    const safeSec = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentRemaining = useMemo(() => {
    if (!currentTiming.allocatedSeconds) return 100;
    return Math.max(0, Math.min(100, (questionSecondsRemaining / currentTiming.allocatedSeconds) * 100));
  }, [questionSecondsRemaining, currentTiming]);

  const isTimerWarning = percentRemaining <= 20;
  const isTimerCritical = percentRemaining <= 10;

  const parsedPrompt = useMemo(() => {
    if (!activeQuestion?.question_text) return { textPrompt: '', codeSnippet: null };
    const raw = activeQuestion.question_text;
    const match = raw.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);
    if (match) {
      const textPrompt = raw.replace(match[0], '').trim();
      const codeSnippet = match[1].trim();
      return { textPrompt, codeSnippet };
    }
    return { textPrompt: raw, codeSnippet: null };
  }, [activeQuestion]);

  const descriptiveWordCount = useMemo(() => {
    if (!activeQuestion) return 0;
    const text = (answers[activeQuestion.id] || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [activeQuestion, answers]);

  const descriptiveCharCount = useMemo(() => {
    if (!activeQuestion) return 0;
    return (answers[activeQuestion.id] || '').length;
  }, [activeQuestion, answers]);

  const answeredCount = useMemo(() => {
    return questions.filter((q) => !!answers[q.id]).length;
  }, [questions, answers]);

  return (
    <div 
      className="fixed inset-0 z-[100] min-h-screen bg-[#F8F9FA] overflow-y-auto select-none font-sans text-slate-900"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => {
        e.preventDefault();
        handleBlockedPaste();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                {session?.role_title || 'Core Systems & Algorithmic Logic'}
              </h1>
              {activeQuestion && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border tabular-nums shrink-0 ${
                  activeQuestion.difficulty === 'HARD'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : activeQuestion.difficulty === 'MEDIUM'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}>
                  {activeQuestion.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Proctored Environment
              </span>
              <span>·</span>
              <span className="tabular-nums tracking-tight">
                {currentTiming.categoryLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 tabular-nums tracking-tight">
            <span>Question {activeQuestionIdx + 1} of {totalQuestions}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 font-normal">{answeredCount} of {totalQuestions} answered</span>
          </div>

          <div className="h-1.5 bg-slate-100 rounded-full w-56 sm:w-64 overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((activeQuestionIdx + 1) / Math.max(1, totalQuestions)) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs font-medium text-slate-600 tabular-nums tracking-tight">
            <Clock size={13} className="text-slate-400" />
            <span>Total: {formatClock(totalTimeSeconds)}</span>
          </div>

          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
            isTimerCritical 
              ? 'bg-rose-50 border-rose-300 shadow-xs ring-2 ring-rose-500/15 animate-pulse'
              : isTimerWarning 
              ? 'bg-amber-50 border-amber-300 shadow-xs ring-2 ring-amber-500/15'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  className="stroke-slate-100"
                  strokeWidth="3.2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - percentRemaining}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  className={`transition-all duration-500 ease-linear ${
                    isTimerCritical
                      ? 'stroke-rose-600'
                      : isTimerWarning
                      ? 'stroke-amber-500'
                      : 'stroke-slate-900'
                  }`}
                />
              </svg>
            </div>

            <div className="text-left">
              <span className={`block font-mono text-sm font-bold tabular-nums tracking-tight leading-none ${
                isTimerCritical
                  ? 'text-rose-600'
                  : isTimerWarning
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}>
                {formatClock(questionSecondsRemaining)}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block mt-0.5 leading-none">
                Question Time
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-all cursor-pointer"
          >
            <X size={15} />
            <span className="hidden sm:inline">Exit Assessment</span>
          </button>
        </div>
      </header>

      {(pasteWarning || cadenceWarning) && (
        <div className="sticky top-[57px] z-20 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>{pasteWarning || cadenceWarning}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isActive = idx === activeQuestionIdx;
            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setActiveQuestionIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tabular-nums tracking-tight transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isAnswered
                    ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50/50'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                {isAnswered && !isActive && <CheckCircle2 size={12} className="text-emerald-600" />}
                <span>Q{idx + 1}</span>
                <span className={`text-[10px] px-1 rounded-md font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {q.difficulty?.[0] || 'M'}
                </span>
              </button>
            );
          })}
        </div>

        {activeQuestion && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 relative">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider tabular-nums">
                  Question {activeQuestionIdx + 1} of {totalQuestions}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                  {activeQuestion.type === 'MCQ' ? 'Multiple Choice Assessment' : 'Descriptive Technical Reasoning'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="text-slate-400">Baseline Weight:</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums tracking-tight">
                    {activeTelemetry.weight.toFixed(1)}x
                  </span>
                </div>

                <span className="text-slate-200">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Score Telemetry S(q):</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md tabular-nums tracking-tight">
                    {activeTelemetry.scoreEfficiency.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-relaxed select-none">
                {parsedPrompt.textPrompt}
              </h2>

              {parsedPrompt.codeSnippet && (
                <div className="my-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl p-4 overflow-x-auto select-none border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 size={13} />
                      Executable Context / Code Trace
                    </span>
                    <span className="text-slate-500 font-sans text-[10px]">Read-Only Assessment Sandbox</span>
                  </div>
                  <pre className="leading-relaxed whitespace-pre font-mono">
                    <code>{parsedPrompt.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            <div className="my-6">
              {activeQuestion.type === 'MCQ' && Array.isArray(activeQuestion.options) ? (
                <div className="space-y-3">
                  {activeQuestion.options.map((option, optIdx) => {
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    const isSelected = answers[activeQuestion.id] === option;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleOptionSelect(activeQuestion.id, option)}
                        className={`group border rounded-xl p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 select-none ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-900'
                          }`}>
                            {optionLetter}
                          </div>
                          <span className="text-sm font-medium leading-relaxed break-words">
                            {option}
                          </span>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Technical Explanation & Architectural Rationale
                    </label>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums tracking-tight">
                      <span>{descriptiveWordCount} words</span>
                      <span>·</span>
                      <span>{descriptiveCharCount} characters</span>
                    </div>
                  </div>

                  <textarea
                    rows={7}
                    placeholder="Provide your comprehensive technical solution, underlying mechanics, trade-offs, and design logic..."
                    value={answers[activeQuestion.id] || ''}
                    onChange={(e) => handleDescriptiveChange(activeQuestion.id, e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handleBlockedPaste();
                    }}
                    className="w-full p-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-normal transition-all leading-relaxed placeholder-slate-400"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <FileText size={12} />
                      Evaluated for technical depth, design constraints, and systems trade-offs
                    </span>
                    <span className="tabular-nums font-mono">
                      Target: 40–150 words
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeQuestionIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
              >
                <ChevronLeft size={16} />
                Previous Question
              </button>

              <div className="flex items-center gap-3">
                {activeQuestionIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <span>Commit & Next</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={executeSubmission}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-sm transition-all active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Grading & Verifying Assessment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Submit Assessment for Verification</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showFocusLostModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">
              Integrity Warning: Focus Lost
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Window blur and tab-switching events are tracked under the candidate verification protocol.
              All switches are recorded to the institutional audit ledger.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mb-5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Logged Infractions:</span>
              <span className="font-mono font-bold text-rose-600 tabular-nums text-sm">
                {infractionCount}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowFocusLostModal(false)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Acknowledge & Return to Assessment
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">
              Exit Assessment Cockpit?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Exiting will terminate this active proctored assessment. Unsubmitted responses will be discarded,
              and this attempt will not count towards your verified candidate rating.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Resume Assessment
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  if (onExit) onExit();
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Exit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoredAssessmentCockpit;
