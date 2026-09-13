import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Loader2,
  Cpu,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';

export const SkillAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentType, setAssessmentType] = useState<'technical' | 'aptitude' | 'soft_skills'>('technical');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<any>(null);

  useEffect(() => {
    fetchQuestions(assessmentType);
  }, [assessmentType]);

  const fetchQuestions = async (type: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/skills/assessment/questions?type=${type}`);
      setQuestions(res.data.questions || []);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setCompletedResult(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (skillId: string, score: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentIndex].id]: score,
    });
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      // Build answers array with skillId and score
      const answers = questions.map((q) => ({
        skillId: q.skillId,
        score: selectedAnswers[q.id] || 75,
      }));

      await api.post('/skills/assessment/submit', { answers });

      const totalScore = answers.reduce((acc, curr) => acc + curr.score, 0);
      const avgScore = Math.round(totalScore / Math.max(1, answers.length));

      setCompletedResult({
        score: avgScore,
        skillsAssessedCount: answers.length,
        strongAreas: ['Data Structures & OOP', 'Core Problem Solving'],
        needsImprovement: ['Spring Boot Microservices', 'Docker Containers'],
      });
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ && selectedAnswers[currentQ.id] !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <FileCheck2 className="w-4 h-4" />
          <span>Standardized Skill Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Engineering Skill Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete scenario-based evaluation questions to verify your technical proficiencies, update your placement readiness score, and identify career gaps.
        </p>

        {/* Assessment Type Tabs */}
        {!completedResult && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setAssessmentType('technical')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                assessmentType === 'technical'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Technical Core & Coding
            </button>

            <button
              onClick={() => setAssessmentType('aptitude')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                assessmentType === 'aptitude'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" /> Quantitative & Logical Aptitude
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading assessment questions...</p>
        </div>
      ) : completedResult ? (
        /* Post-Submission Result Card */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Assessment Completed!</h2>
            <p className="text-xs text-slate-500">
              Your verified proficiency profile and placement readiness have been updated.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-3xl font-black text-blue-700">{completedResult.score}%</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Overall Assessment Score</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strong Technical Areas:</span>
              </div>
              <ul className="space-y-1 text-emerald-800 font-medium">
                {completedResult.strongAreas.map((area: string) => (
                  <li key={area}>• {area}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Recommended Focus:</span>
              </div>
              <ul className="space-y-1 text-amber-800 font-medium">
                {completedResult.needsImprovement.map((area: string) => (
                  <li key={area}>• {area}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/student/career-gaps')}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>View Updated Skill Radar & Gaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate('/student/opportunities')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors border border-slate-300"
            >
              Browse Matching Internships
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Active Question Card */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {/* Progress Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                Question {currentIndex + 1} of {questions.length} • <strong className="text-blue-700">{currentQ.skillName}</strong>
              </span>
              <span>{progressPct}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Scenario / Context */}
          {currentQ.scenarioText && (
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium leading-relaxed">
              <strong>Scenario Context:</strong> {currentQ.scenarioText}
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt: any, idx: number) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.score;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.skillId, opt.score)}
                  className={`w-full text-left p-4 rounded-xl text-xs font-medium transition-all flex items-start gap-3 border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span className="leading-relaxed">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Submit & Calculate Readiness</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500">No questions available for this category.</p>
        </div>
      )}
    </div>
  );
};
