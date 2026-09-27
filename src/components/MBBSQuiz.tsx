import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Trophy,
  Flame,
  Search,
  Loader2,
  ChevronRight,
  Globe,
  SlidersHorizontal,
  X,
  RefreshCw,
  BarChart3,
  AlertCircle,
  ThumbsUp,
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
} from 'lucide-react';
import { MBBS_100_QUESTIONS, MBBSQuestion, shuffleQuestionOptions } from '../data/mbbsQuestions';

interface MBBSQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

type YearFilter = 'all' | 1 | 2 | 3 | 4;

export const MBBSQuiz: React.FC<MBBSQuizProps> = ({ isOpen, onClose }) => {
  const [selectedYear, setSelectedYear] = useState<YearFilter>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const yr = params.get('year');
      if (yr === '1') return 1;
      if (yr === '2') return 2;
      if (yr === '3') return 3;
      if (yr === '4') return 4;
    } catch {
      // ignore
    }
    return 'all';
  });
  const [searchTopic, setSearchTopic] = useState('');
  const [activeQuestionList, setActiveQuestionList] = useState<MBBSQuestion[]>(MBBS_100_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredHistory, setAnsweredHistory] = useState<{
    question: MBBSQuestion;
    userChoice: number;
    isCorrect: boolean;
  }[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync URL when selectedYear changes while quiz is open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const url = new URL(window.location.href);
      if (!url.pathname.includes('/quiz')) {
        url.pathname = '/quiz';
      }
      if (selectedYear !== 'all') {
        url.searchParams.set('year', String(selectedYear));
      } else {
        url.searchParams.delete('year');
      }
      window.history.replaceState({ quiz: true, year: selectedYear }, '', url.toString());
    } catch {
      // ignore
    }
  }, [selectedYear, isOpen]);

  // Handle Share / Copy Quiz URL
  const handleShareQuiz = async () => {
    const origin = window.location.origin;
    const url = `${origin}/quiz${selectedYear !== 'all' ? `?year=${selectedYear}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MBBS QUIZ — IGNOU School of Health Sciences',
          text: `Practice 100 high-yield MBBS questions for Year ${selectedYear === 'all' ? '1 to 4' : selectedYear}!`,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // fallback
      prompt('Copy this MBBS Quiz URL:', url);
    }
  };

  // Filter local questions based on selected year with options shuffled across A, B, C, D
  const filteredLocalQuestions = useMemo(() => {
    let list = MBBS_100_QUESTIONS;
    if (selectedYear !== 'all') {
      list = list.filter((q) => q.year === selectedYear);
    }
    if (searchTopic.trim()) {
      const q = searchTopic.toLowerCase();
      list = list.filter(
        (item) =>
          item.subject.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          item.question.toLowerCase().includes(q)
      );
    }
    // Randomize options for each question so correct choices are evenly spread over A, B, C, D
    return list.map(shuffleQuestionOptions);
  }, [selectedYear, searchTopic]);

  // Reset quiz state when year filter changes
  useEffect(() => {
    setActiveQuestionList(filteredLocalQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setAnsweredHistory([]);
    setIsQuizComplete(false);
  }, [selectedYear, searchTopic, filteredLocalQuestions]);

  const currentQ: MBBSQuestion | undefined = activeQuestionList[currentIndex];
  const totalQuestions = activeQuestionList.length;

  // Handle option select
  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || !currentQ) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const isCorrect = index === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setAnsweredHistory((prev) => [
      ...prev,
      {
        question: currentQ,
        userChoice: index,
        isCorrect,
      },
    ]);
  };

  // Next question or complete
  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  // Restart from Question 1 with freshly shuffled options
  const handleRestart = () => {
    setActiveQuestionList(filteredLocalQuestions.map(shuffleQuestionOptions));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setAnsweredHistory([]);
    setIsQuizComplete(false);
    setIsReviewOpen(false);
  };

  // Continuous Dynamic Search for Post-100 or fresh questions via Google Search Grounding
  const handleContinuousSearch = async () => {
    setIsLoadingMore(true);
    setApiNotice(null);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          count: 10,
          topicFilter: searchTopic || 'High-yield IGNOU School of Health Sciences MBBS topics',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate from server');
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        // Map dynamic questions to our MBBSQuestion structure and randomize option positions
        const formatted: MBBSQuestion[] = data.questions.map((q: any, idx: number) => {
          const rawQ: MBBSQuestion = {
            id: 1000 + (cycleCount * 100) + idx,
            year: q.year || (selectedYear === 'all' ? ((idx % 4) + 1) : selectedYear),
            subject: q.subject || 'Clinical Medicine',
            topic: q.topic || 'General Medical Concepts',
            question: q.question,
            options: q.options as [string, string, string, string],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || 'Verified answer from curriculum guidelines.',
            whyWrong: q.whyWrong || {},
          };
          return shuffleQuestionOptions(rawQ);
        });

        setActiveQuestionList(formatted);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setCycleCount((c) => c + 1);
        setIsQuizComplete(false);
        setIsReviewOpen(false);
        setApiNotice(`Loaded fresh questions grounded in Google Search for cycle ${cycleCount + 1}!`);
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      // Fallback: cycle local questions shuffled with options randomized
      const shuffled = [...MBBS_100_QUESTIONS]
        .sort(() => Math.random() - 0.5)
        .map(shuffleQuestionOptions);
      setActiveQuestionList(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCycleCount((c) => c + 1);
      setIsQuizComplete(false);
      setIsReviewOpen(false);
      setApiNotice('Restarted with freshly randomized questions from the comprehensive 100-question MBBS bank.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!isOpen) return null;

  // Grade calculation
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  let gradeBadge = {
    title: 'Needs Revision',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    desc: 'Review the high-yield explanations below to strengthen weak areas.',
  };
  if (percentage >= 85) {
    gradeBadge = {
      title: 'Distinction (Honors)',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      desc: 'Outstanding performance! Deep understanding of IGNOU MBBS competencies.',
    };
  } else if (percentage >= 70) {
    gradeBadge = {
      title: 'First Class Pass',
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      desc: 'Solid clinical and theoretical grasp across medical subjects.',
    };
  } else if (percentage >= 50) {
    gradeBadge = {
      title: 'Passing Grade',
      color: 'text-stone-700 dark:text-stone-300 bg-stone-200/50 dark:bg-stone-800 border-stone-300 dark:border-stone-700',
      desc: 'Satisfactory, but revision in specialized topics is advised.',
    };
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  MBBS QUIZ
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  100 Questions
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-stone-500 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-full font-medium">
                  <Globe className="w-3 h-3 text-amber-500" /> IGNOU Health Sciences
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Covers Years 1–4 · Instant Feedback · Thumbs Up & Result Count · Explanations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareQuiz}
              title="Copy or share direct MBBS Quiz URL"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied URL!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span className="hidden sm:inline">Share Quiz URL</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Close Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Year Selectors & Topic Search Filter Bar */}
        <div className="px-4 py-2.5 bg-stone-100/70 dark:bg-stone-900/90 border-b border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Year Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              All Years (100 Qs)
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === 1
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Year 1 (Pre-Clinical)
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === 2
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Year 2 (Para-Clinical)
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === 3
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Year 3 (Clinical 1)
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(4)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === 4
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Year 4 (Clinical 2)
            </button>
          </div>

          {/* Quick topic keyword search */}
          <div className="relative flex items-center min-w-[170px] max-w-[240px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Search topic or subject..."
              className="w-full pl-8 pr-6 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500"
            />
            {searchTopic && (
              <button
                type="button"
                onClick={() => setSearchTopic('')}
                className="absolute right-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Live Status: Progress Bar & Running Score */}
        {!isQuizComplete && totalQuestions > 0 && (
          <div className="px-5 py-2.5 bg-stone-50/50 dark:bg-stone-950/40 border-b border-stone-200/80 dark:border-stone-800/80 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-stone-900 dark:text-stone-100">
                  Question <span className="text-emerald-600 dark:text-emerald-400">{currentIndex + 1}</span> of{' '}
                  {totalQuestions}
                </span>
                {cycleCount > 1 && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    Cycle {cycleCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {streak > 1 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{streak} Streak!</span>
                  </span>
                )}
                <div className="text-stone-600 dark:text-stone-300">
                  Score:{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {score}
                  </span>{' '}
                  <span className="text-stone-400">
                    ({Math.round((score / Math.max(1, currentIndex + (isAnswerSubmitted ? 1 : 0))) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.round(((currentIndex + (isAnswerSubmitted ? 1 : 0)) / totalQuestions) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Main Quiz Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {apiNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
              <span>{apiNotice}</span>
              <button
                type="button"
                onClick={() => setApiNotice(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {totalQuestions === 0 ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                No questions found matching your filter "{searchTopic}" in Year {selectedYear}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTopic('');
                  setSelectedYear('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : isQuizComplete ? (
            /* Results Screen */
            <div className="py-6 space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Quiz Completed!
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  MBBS Curricular Assessment — IGNOU School of Health Sciences
                </p>
              </div>

              {/* Score Card */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="text-4xl font-extrabold text-stone-900 dark:text-stone-100">
                  {score}{' '}
                  <span className="text-lg text-stone-400 font-normal">
                    / {totalQuestions}
                  </span>
                </div>

                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${gradeBadge.color}`}
                >
                  {gradeBadge.title} ({percentage}%)
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {gradeBadge.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Best Streak</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                      🔥 {bestStreak} in a row
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Accuracy</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart from Question 1</span>
                </button>

                <button
                  type="button"
                  onClick={handleContinuousSearch}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching Google for Fresh Topics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Continuous Search (Next Cycle)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareQuiz}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Quiz URL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-stone-500" />
                      <span>Share Quiz Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isReviewOpen ? 'Hide Full Review' : 'Review All Questions & Explanations'}</span>
                </button>
              </div>

              {/* Review Accordion List */}
              {isReviewOpen && (
                <div className="text-left mt-6 space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">
                    Detailed Answers Breakdown
                  </h3>
                  {answeredHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 font-semibold text-stone-900 dark:text-stone-100">
                        <span>
                          Q{idx + 1}. {item.question.question}
                        </span>
                        {item.isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1 shrink-0">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-600 dark:text-stone-300">
                        <strong>Correct Answer:</strong>{' '}
                        {item.question.options[item.question.correctAnswer]}
                      </div>

                      {!item.isCorrect && (
                        <div className="text-[11px] text-rose-700 dark:text-rose-300">
                          <strong>Your Pick:</strong> {item.question.options[item.userChoice]}
                        </div>
                      )}

                      <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-900/80 p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800">
                        <strong className="text-stone-700 dark:text-stone-300">Explanation:</strong>{' '}
                        {item.question.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentQ ? (
            /* Active Question Screen (One at a time) */
            <div className="space-y-4 animate-in fade-in">
              {/* Question metadata badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                  Year {currentQ.year}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {currentQ.subject}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {currentQ.topic}
                </span>
              </div>

              {/* Question Stem */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 text-stone-900 dark:text-stone-100 text-sm sm:text-base font-semibold leading-relaxed shadow-2xs">
                {currentQ.question}
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQ.correctAnswer;
                  const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  let buttonStyles =
                    'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:border-emerald-500/60 hover:bg-stone-50 dark:hover:bg-stone-800/60';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      buttonStyles =
                        'border-emerald-500 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs';
                    } else if (isSelected && !isCorrect) {
                      buttonStyles =
                        'border-rose-500 bg-rose-500/15 text-rose-950 dark:text-rose-200 font-bold';
                    } else {
                      buttonStyles =
                        'border-stone-200 dark:border-stone-800/50 bg-stone-100/50 dark:bg-stone-900/30 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${buttonStyles}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isAnswerSubmitted && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : isAnswerSubmitted && isSelected && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {isAnswerSubmitted && isCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isAnswerSubmitted && isSelected && !isCorrect ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          optionLabel
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5 leading-snug">
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Detailed Explanation Box upon answering */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 animate-in fade-in duration-200 ${
                    selectedOption === currentQ.correctAnswer
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                      : 'bg-amber-500/10 border-amber-500/30 text-stone-900 dark:text-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full flex-wrap gap-2">
                    {selectedOption === currentQ.correctAnswer ? (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 animate-bounce">
                            <ThumbsUp className="w-4 h-4 fill-white" />
                          </div>
                          <div>
                            <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                              <span>Thumbs Up! Correct Answer</span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                                +1 Point
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">
                              Result Count: <span className="font-bold">{score}</span> / {totalQuestions} correct ({Math.round((score / totalQuestions) * 100)}%)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          <ThumbsUp className="w-3.5 h-3.5 fill-emerald-500" />
                          <span>{score} Correct Answers</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span className="text-rose-700 dark:text-rose-400">
                          Incorrect Choice
                        </span>
                        <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                          · Result Count: {score} / {totalQuestions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Why your choice was off */}
                  {selectedOption !== currentQ.correctAnswer &&
                    selectedOption !== null &&
                    currentQ.whyWrong &&
                    currentQ.whyWrong[selectedOption] && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200">
                        <strong className="block text-[11px] uppercase font-bold text-rose-700 dark:text-rose-400 mb-0.5">
                          Why your pick was off:
                        </strong>
                        <p className="leading-relaxed text-[11.5px]">
                          {currentQ.whyWrong[selectedOption]}
                        </p>
                      </div>
                    )}

                  {/* Rationale for the correct answer */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300">
                    <strong className="block text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                      Clinical & Academic Rationale:
                    </strong>
                    <p className="leading-relaxed text-[11.5px]">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom Footer Controls */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors"
              title="Restart Quiz"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={handleContinuousSearch}
              disabled={isLoadingMore}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 border border-amber-500/30 transition-colors"
              title="Query Google for fresh medical topics"
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Google Search Grounding</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isQuizComplete && isAnswerSubmitted && (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>
                  {currentIndex + 1 < totalQuestions ? 'Next Question' : 'View Results'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
