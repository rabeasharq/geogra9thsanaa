import React, { useMemo, useState } from 'react';
import { QUIZ_QUESTIONS, TEXTBOOK_UNITS, getLessonById, getUnitById } from '../data/bookIndex';
import { CognitiveLevel, QuestionType, QuizQuestion, StudentProgress } from '../types/textbook';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Compass,
  BarChart2,
  Filter,
  Info,
  RotateCcw
} from 'lucide-react';

interface TrainingPortalProps {
  initialUnitId?: string;
  initialLessonId?: string;
  progress: StudentProgress;
  onRecordAnswer: (questionId: string, selected: string, isCorrect: boolean) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}

const TYPE_LABELS: Record<QuestionType | 'all', string> = {
  all: 'كل أنواع الأسئلة',
  mcq: 'اختيار من متعدد',
  true_false: 'صواب أو خطأ',
  fill_blank: 'إكمال الفراغ',
  matching: 'توصيل ومطابقة',
  guided_essay: 'مقالي وتفكير ناقد',
  map_identify: 'تحديد على الخريطة'
};

const LEVEL_LABELS: (CognitiveLevel | 'all')[] = ['all', 'تذكر', 'فهم', 'تطبيق', 'تحليل'];

export const TrainingPortal: React.FC<TrainingPortalProps> = ({
  initialUnitId,
  initialLessonId,
  progress,
  onRecordAnswer,
  onGoToLesson,
  onGoToAtlas
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'patterns'>('practice');
  const [unitFilter, setUnitFilter] = useState<string>(initialUnitId || 'all');
  const [lessonFilter, setLessonFilter] = useState<string>(initialLessonId || 'all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CognitiveLevel | 'all'>('all');

  React.useEffect(() => {
    if (initialUnitId) setUnitFilter(initialUnitId);
    if (initialLessonId) setLessonFilter(initialLessonId);
    else if (initialUnitId) setLessonFilter('all');
  }, [initialUnitId, initialLessonId]);

  const availableLessons = useMemo(() => {
    if (unitFilter === 'all') return TEXTBOOK_UNITS.flatMap((u) => u.lessons);
    return getUnitById(unitFilter)?.lessons ?? [];
  }, [unitFilter]);

  const filteredQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      if (unitFilter !== 'all' && q.unitId !== unitFilter) return false;
      if (lessonFilter !== 'all' && q.lessonId !== lessonFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (levelFilter !== 'all' && q.cognitiveLevel !== levelFilter) return false;
      return true;
    });
  }, [unitFilter, lessonFilter, typeFilter, levelFilter]);

  const answeredInFilter = filteredQuestions.filter((q) => progress.quizAnswers[q.id]);
  const correctInFilter = answeredInFilter.filter((q) => progress.quizAnswers[q.id]?.isCorrect);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Mode Switcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              نظام التدريب والتقويم الجغرافي
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              تدريبات تفاعلية مصنفة حسب الدرس والوحدة ونوع السؤال ومستوى التفكير، مرتبطة حرفياً بالمحتوى الرسمي وإحالات الصفحات.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'practice'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بنك التدريبات ({filteredQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('patterns')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'patterns'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>تحليل أنماط الأسئلة</span>
            </button>
          </div>
        </div>

        {activeTab === 'practice' && (
          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">الوحدة</label>
              <select
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value);
                  setLessonFilter('all');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="all">كل الوحدات (1 – 4)</option>
                {TEXTBOOK_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    الوحدة {u.unitNumber}: {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">الدرس</label>
              <select
                value={lessonFilter}
                onChange={(e) => setLessonFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="all">جميع الدروس</option>
                {availableLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    الدرس {l.lessonNumber}: {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">نوع السؤال</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as QuestionType | 'all')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">مستوى التفكير</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as CognitiveLevel | 'all')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {LEVEL_LABELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl === 'all' ? 'كل مستويات التفكير' : `مستوى: ${lvl}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {activeTab === 'practice' ? (
        <>
          {/* Score Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter className="h-4 w-4 text-slate-400" />
              <span>
                الأسئلة المعروضة:{' '}
                <strong className="font-mono tabular-nums text-slate-900">{filteredQuestions.length}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                المُجاب عنها:{' '}
                <strong className="font-mono tabular-nums text-slate-900">{answeredInFilter.length}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                الإجابات الصحيحة:{' '}
                <strong className="font-mono tabular-nums text-emerald-700">{correctInFilter.length}</strong>
              </span>
            </div>
            {(unitFilter !== 'all' || lessonFilter !== 'all' || typeFilter !== 'all' || levelFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setUnitFilter('all');
                  setLessonFilter('all');
                  setTypeFilter('all');
                  setLevelFilter('all');
                }}
                className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>إظهار كل الأسئلة</span>
              </button>
            )}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              لا توجد أسئلة مطابقة للتصفية الحالية. جرّب تغيير نوع السؤال أو مستوى التفكير.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  index={idx + 1}
                  question={q}
                  savedAnswer={progress.quizAnswers[q.id]}
                  onRecordAnswer={onRecordAnswer}
                  onGoToLesson={onGoToLesson}
                  onGoToAtlas={onGoToAtlas}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <ExamPatternAnalysis />
      )}
    </main>
  );
};

interface QuestionCardProps {
  index: number;
  question: QuizQuestion;
  savedAnswer?: { selected: string; isCorrect: boolean };
  onRecordAnswer: (questionId: string, selected: string, isCorrect: boolean) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  question,
  savedAnswer,
  onRecordAnswer,
  onGoToLesson,
  onGoToAtlas
}) => {
  const [essayRevealed, setEssayRevealed] = useState(Boolean(savedAnswer));
  const [matchingState, setMatchingState] = useState<Record<string, string>>({});

  const lesson = question.lessonId ? getLessonById(question.lessonId) : undefined;
  const isAnswered = Boolean(savedAnswer);

  const handleOptionSelect = (opt: string) => {
    const ok = opt === question.correctAnswer;
    onRecordAnswer(question.id, opt, ok);
  };

  const handleCheckMatching = () => {
    if (!question.matchingPairs) return;
    const allCorrect = question.matchingPairs.every((p) => matchingState[p.left] === p.right);
    onRecordAnswer(question.id, 'مطابقة مكتملة', allCorrect);
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          <strong className="font-mono text-slate-800">س{index}.</strong> {question.sourceLabel} ·{' '}
          {TYPE_LABELS[question.type]} · مستوى: <strong className="text-slate-800">{question.cognitiveLevel}</strong>
        </span>

        <div className="flex items-center gap-3">
          {lesson && (
            <button
              type="button"
              onClick={() => onGoToLesson(question.unitId, lesson.id)}
              className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>الدرس</span>
            </button>
          )}
          {question.relatedLocationId && (
            <button
              type="button"
              onClick={() => onGoToAtlas(question.relatedLocationId!)}
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>الأطلس</span>
            </button>
          )}
        </div>
      </div>

      <h3 className="font-display mt-3 text-base font-bold leading-relaxed text-slate-900">
        {question.prompt}
      </h3>

      {/* MCQ / True-False / Fill-in-Blank options */}
      {question.options && question.options.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((opt) => {
            const isSelected = savedAnswer?.selected === opt;
            const isRight = opt === question.correctAnswer;
            let btnStyle = 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';
            if (isAnswered) {
              if (isRight) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
              } else if (isSelected) {
                btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
              } else {
                btnStyle = 'border-slate-200 bg-white text-slate-500';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleOptionSelect(opt)}
                className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-right text-sm transition-colors ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {isAnswered && isSelected && !isRight && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Matching Question */}
      {question.type === 'matching' && question.matchingPairs && (
        <div className="mt-4 space-y-3">
          {question.matchingPairs.map((pair) => {
            const allRights = question.matchingPairs!.map((p) => p.right);
            const selectedRight = matchingState[pair.left] ?? '';
            const isRightMatch = isAnswered && selectedRight === pair.right;
            return (
              <div
                key={pair.left}
                className="grid items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2"
              >
                <div className="text-sm font-semibold text-slate-800">{pair.left}</div>
                <select
                  value={selectedRight}
                  onChange={(e) =>
                    setMatchingState((prev) => ({ ...prev, [pair.left]: e.target.value }))
                  }
                  className={`rounded-md border px-3 py-2 text-xs ${
                    isAnswered
                      ? isRightMatch
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-rose-400 bg-rose-50'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  <option value="">اختر المطابق...</option>
                  {allRights.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleCheckMatching}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            تحقق من المطابقة
          </button>
        </div>
      )}

      {/* Guided Essay Question */}
      {question.type === 'guided_essay' && (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              setEssayRevealed((v) => !v);
              if (!isAnswered) {
                onRecordAnswer(question.id, 'مراجعة نموذجية', true);
              }
            }}
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
          >
            {essayRevealed ? 'إخفاء الإجابة النموذجية المقررة' : 'عرض الإجابة النموذجية المقررة'}
          </button>

          {essayRevealed && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-relaxed text-slate-800">
              <div className="text-xs font-bold text-emerald-800">الإجابة المستندة إلى الكتاب:</div>
              <p className="mt-1">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback & Source Explanation */}
      {isAnswered && (
        <div
          className={`mt-4 rounded-lg border p-3.5 text-xs leading-relaxed ${
            savedAnswer?.isCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-amber-200 bg-amber-50 text-amber-950'
          }`}
        >
          <div className="font-bold">
            {savedAnswer?.isCorrect ? 'إجابة موفقة ✓' : `الصواب المقرر: ${question.correctAnswer}`}
          </div>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </article>
  );
};

const ExamPatternAnalysis: React.FC = () => {
  const textbookEvaluationPatterns = [
    {
      pattern: 'تعريف المفاهيم والمصطلحات الجغرافية',
      frequency: 'مرتفع جداً (في 16 من أصل 18 تقويم درس + تقويمات الوحدات الأربع)',
      examples: 'الموقع الفلكي، التضاريس، الضغط الجوي، المحمية الطبيعية، الزيادة الطبيعية، تركيب السكان، الفجوة الغذائية، الأمن المائي.'
    },
    {
      pattern: 'الصواب والخطأ واختيار من متعدد وتصحيح الأرقام',
      frequency: 'مرتفع (ص 12، 23، 28، 34، 39، 53، 57، 65، 71، 84، 85، 110)',
      examples: 'أطوال السواحل، الارتفاعات (3670م و4165م)، سنوات النفط والإحصاء، نسب السكان والمساحة (71%/29% مقابل 61%/39%).'
    },
    {
      pattern: 'التعيين على الخريطة الصماء لليمن والوطن العربي',
      frequency: 'متكرر في جميع الوحدات الأربع (ص 12، 16، 28، 33، 34، 58، 63، 64، 71، 86)',
      examples: 'الحدود، الأودية، المحميات الست، الموانئ الستة، المضائق الأربعة، الجبال، والأنهار الكبرى.'
    },
    {
      pattern: 'التفسير والتعليل والمقارنة وحل المشكلات',
      frequency: 'مرتفع (في تقويمات الدروس وبطاقات التفكير)',
      examples: 'انخفاض الحرارة بالارتفاع، الرياح الصيفية والشتوية، السهول الفيضية والساحلية، مشكلات المياه، الأمن الغذائي.'
    },
    {
      pattern: 'تطبيق القوانين الديموغرافية وقراءة الجداول',
      frequency: 'مخصص للوحدتين الثانية والرابعة (ص 41–42، 58، 88، 94، 110)',
      examples: 'حساب معدل المواليد والوفيات، الكثافة السكانية، نسبة النوع، نسبة الإعالة، وحساب الفجوة الغذائية.'
    }
  ];

  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-xs leading-relaxed text-amber-950">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <div className="font-bold text-slate-900">بيان الشفافية المنهجية حول نماذج الامتحانات الوزارية</div>
          <p className="mt-1">
            لم تُرفق ضمن مصادر هذا المشروع أوراق امتحانات وزارية سابقة خارج الكتاب المدرسي؛ ولذلك يعتمد التحليل التالي حصرياً على استقراء{' '}
            <strong>تقويمات الدروس الـ 18 وتقويمات الوحدات الـ 4 وبطاقات التفكير</strong> داخل الكتاب المدرسي الرسمي نفسه، دون ادعاء التنبؤ المؤكد بأسئلة الامتحان الوزاري.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          أنماط الأسئلة والموضوعات المتكررة في تقويمات الكتاب الرسمي
        </h2>
        <div className="mt-4 space-y-4">
          {textbookEvaluationPatterns.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900">{item.pattern}</h3>
                <span className="text-xs font-semibold text-indigo-700">{item.frequency}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                <strong className="text-slate-900">أبرز الموضوعات المقررة: </strong>
                {item.examples}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
