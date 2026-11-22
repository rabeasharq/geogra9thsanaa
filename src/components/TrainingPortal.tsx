import React, { useMemo, useState } from 'react';
import {
  CORE_TEXTBOOK_QUESTIONS,
  GENERATED_QUESTIONS,
  MINISTERIAL_BATCH_STATS,
  MINISTERIAL_QUESTIONS,
  MINISTERIAL_TOPIC_FREQUENCY,
  QUIZ_QUESTIONS,
  TEXTBOOK_UNITS,
  getLessonById,
  getUnitById,
  projectYemen
} from '../data/bookIndex';
import {
  CognitiveLevel,
  QuestionSourceCategory,
  QuestionType,
  QuizMapVisual,
  QuizQuestion,
  StudentProgress
} from '../types/textbook';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Compass,
  BarChart2,
  Filter,
  Info,
  RotateCcw,
  Award,
  Sparkles,
  FileCheck2,
  Shuffle,
  MapPin
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

const SOURCE_LABELS: Record<QuestionSourceCategory | 'all', string> = {
  all: 'كل المصادر',
  ministerial: 'الوزاري الرسمي 2025–2026',
  generated: 'توليد تدريبي (نمط وزاري)',
  textbook: 'الكتاب المقرر'
};

const LEVEL_LABELS: (CognitiveLevel | 'all')[] = ['all', 'تذكر', 'فهم', 'تطبيق', 'تحليل'];

const MINISTERIAL_MODEL_CODES = [
  'P.66',
  'P.63',
  'P.3',
  'P.84',
  'P.10',
  'P.46',
  'P.69',
  'P.41',
  'P.77',
  'P.26',
  'P.17',
  'P.8',
  'P.93',
  'P.4',
  'P.23',
  'P.55',
  'P.25',
  'P.65',
  'P.57',
  'P.11',
  'P.14',
  'P.6',
  'P.108'
];

function pickRandomSlice<T>(items: T[], count: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function buildSimulatedMinisterialPaper(poolSource: 'mixed' | 'ministerial-only'): QuizQuestion[] {
  const pool =
    poolSource === 'ministerial-only'
      ? MINISTERIAL_QUESTIONS
      : [...MINISTERIAL_QUESTIONS, ...GENERATED_QUESTIONS];

  const tfPool = pool.filter((q) => q.type === 'true_false');
  const mcqPool = pool.filter((q) => q.type === 'mcq' || q.type === 'fill_blank');
  const mapPool = pool.filter((q) => q.type === 'map_identify');

  return [
    ...pickRandomSlice(tfPool, 8),
    ...pickRandomSlice(mcqPool, 9),
    ...pickRandomSlice(mapPool, 2)
  ];
}

export const TrainingPortal: React.FC<TrainingPortalProps> = ({
  initialUnitId,
  initialLessonId,
  progress,
  onRecordAnswer,
  onGoToLesson,
  onGoToAtlas
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'simulator' | 'patterns'>('practice');
  const [sourceFilter, setSourceFilter] = useState<QuestionSourceCategory | 'all'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>(initialUnitId || 'all');
  const [lessonFilter, setLessonFilter] = useState<string>(initialLessonId || 'all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CognitiveLevel | 'all'>('all');

  // Simulator state (19 Geography items matching Ministerial structure: 8 T/F + 9 MCQ + 2 Map)
  const [simSource, setSimSource] = useState<'mixed' | 'ministerial-only'>('mixed');
  const [simPaper, setSimPaper] = useState<QuizQuestion[]>(() =>
    buildSimulatedMinisterialPaper('mixed')
  );
  const [simAnswers, setSimAnswers] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [simSubmitted, setSimSubmitted] = useState(false);

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
      const cat = q.sourceCategory ?? 'textbook';
      if (sourceFilter !== 'all' && cat !== sourceFilter) return false;
      if (sourceFilter === 'ministerial' && modelFilter !== 'all') {
        if (!q.examModels?.includes(modelFilter)) return false;
      }
      if (unitFilter !== 'all' && q.unitId !== unitFilter) return false;
      if (lessonFilter !== 'all' && q.lessonId !== lessonFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (levelFilter !== 'all' && q.cognitiveLevel !== levelFilter) return false;
      return true;
    });
  }, [sourceFilter, modelFilter, unitFilter, lessonFilter, typeFilter, levelFilter]);

  const answeredInFilter = filteredQuestions.filter((q) => progress.quizAnswers[q.id]);
  const correctInFilter = answeredInFilter.filter((q) => progress.quizAnswers[q.id]?.isCorrect);

  const generateNewSimPaper = (nextSource: 'mixed' | 'ministerial-only' = simSource) => {
    setSimSource(nextSource);
    setSimPaper(buildSimulatedMinisterialPaper(nextSource));
    setSimAnswers({});
    setSimSubmitted(false);
  };

  const simAnsweredCount = Object.keys(simAnswers).length;
  const simCorrectCount = Object.values(simAnswers).filter((a) => a.isCorrect).length;
  const simEstimatedMarks30 = ((simCorrectCount / Math.max(simPaper.length, 1)) * 30).toFixed(1);

  const hasActiveFilters =
    sourceFilter !== 'all' ||
    modelFilter !== 'all' ||
    unitFilter !== 'all' ||
    lessonFilter !== 'all' ||
    typeFilter !== 'all' ||
    levelFilter !== 'all';

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Mode Switcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              نظام التدريب والتقويم الجغرافي والنماذج الوزارية
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              يجمع بين تدريبات الكتاب المقرر ({CORE_TEXTBOOK_QUESTIONS.length})، والأسئلة الوزارية المستخرجة من نماذج 2025–2026م ({MINISTERIAL_QUESTIONS.length})، وأسئلة مولّدة على النمط الوزاري ({GENERATED_QUESTIONS.length}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
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
              onClick={() => setActiveTab('simulator')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>محاكي الامتحان الوزاري (19 سؤالاً)</span>
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
              <span>تحليل أنماط الوزاري</span>
            </button>
          </div>
        </div>

        {activeTab === 'practice' && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
            {/* Source Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(SOURCE_LABELS) as (QuestionSourceCategory | 'all')[]).map((src) => {
                const count =
                  src === 'all'
                    ? QUIZ_QUESTIONS.length
                    : src === 'ministerial'
                      ? MINISTERIAL_QUESTIONS.length
                      : src === 'generated'
                        ? GENERATED_QUESTIONS.length
                        : CORE_TEXTBOOK_QUESTIONS.length;
                const active = sourceFilter === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setSourceFilter(src);
                      if (src !== 'ministerial') setModelFilter('all');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {src === 'ministerial' && <Award className="h-3.5 w-3.5 text-amber-400" />}
                    {src === 'generated' && <Sparkles className="h-3.5 w-3.5 text-sky-500" />}
                    <span>{SOURCE_LABELS[src]}</span>
                    <span className={`font-mono text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {sourceFilter === 'ministerial' && (
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">رمز النموذج الوزاري</label>
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/40 px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="all">جميع النماذج (23 نموذجاً)</option>
                    {MINISTERIAL_MODEL_CODES.map((code) => (
                      <option key={code} value={code}>
                        النموذج {code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
          </div>
        )}
      </section>

      {activeTab === 'practice' && (
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
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSourceFilter('all');
                  setModelFilter('all');
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
              لا توجد أسئلة مطابقة للتصفية الحالية. جرّب تغيير المصدر أو نوع السؤال.
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
      )}

      {activeTab === 'simulator' && (
        <section className="space-y-5">
          {/* Simulator Controls & Paper Header */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  نموذج محاكاة الامتحان الوزاري في الجغرافيا (19 فقرة = 30 درجة)
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  مطابق لهيكلة القسم الجغرافي في ورقة الاجتماعيات الوزارية (2025–2026م):
                  <strong> 8 فقرات صواب/خطأ (س1–س8)</strong> + <strong>9 فقرات اختيار من متعدد (س21–س29)</strong> +{' '}
                  <strong>فقرتا الخريطة الصماء لليمن (س49–س50)</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={simSource}
                  onChange={(e) => generateNewSimPaper(e.target.value as 'mixed' | 'ministerial-only')}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="mixed">وزاري + أسئلة مولّدة متوقعة التدريب</option>
                  <option value="ministerial-only">الوزاري الرسمي 2025–2026 فقط</option>
                </select>

                <button
                  type="button"
                  onClick={() => generateNewSimPaper(simSource)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>توليد نموذج تجريبي جديد</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-700">
                <span>
                  أُجيب عن: <strong className="font-mono text-slate-900">{simAnsweredCount}</strong> / {simPaper.length}
                </span>
                {simSubmitted && (
                  <>
                    <span>
                      النتيجة:{' '}
                      <strong className="font-mono text-emerald-800">
                        {simCorrectCount} / {simPaper.length}
                      </strong>
                    </span>
                    <span>
                      التقدير النسبي من حصة الجغرافيا:{' '}
                      <strong className="font-mono text-sky-800">{simEstimatedMarks30} / 30</strong>
                    </span>
                  </>
                )}
              </div>

              {!simSubmitted ? (
                <button
                  type="button"
                  onClick={() => setSimSubmitted(true)}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  تصحيح النموذج وعرض الشرح
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => generateNewSimPaper(simSource)}
                  className="rounded-lg border border-emerald-600 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                >
                  ابدأ محاولة جديدة
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {simPaper.map((q, idx) => {
              const slotNum = idx < 8 ? `س${idx + 1}` : idx < 17 ? `س${21 + (idx - 8)}` : `س${49 + (idx - 17)}`;
              const simAns = simAnswers[q.id];
              return (
                <QuestionCard
                  key={`${q.id}-${idx}`}
                  index={idx + 1}
                  customSlotLabel={slotNum}
                  question={q}
                  savedAnswer={simSubmitted ? simAns : simAns ? { selected: simAns.selected, isCorrect: true } : undefined}
                  hideImmediateFeedback={!simSubmitted}
                  onRecordAnswer={(_id, selected, isCorrect) => {
                    if (simSubmitted) return;
                    setSimAnswers((prev) => ({ ...prev, [q.id]: { selected, isCorrect } }));
                    onRecordAnswer(q.id, selected, isCorrect);
                  }}
                  onGoToLesson={onGoToLesson}
                  onGoToAtlas={onGoToAtlas}
                />
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'patterns' && <ExamPatternAnalysis />}
    </main>
  );
};

// ================= MINI BLANK YEMEN SVG MAP FOR QUIZ QUESTIONS =================

const MiniYemenMapQuizVisual: React.FC<{ mapVisual: QuizMapVisual }> = ({ mapVisual }) => {
  const yemenPolygonPoints = [
    [16.4, 42.8],
    [17.5, 43.2],
    [17.4, 44.5],
    [18.9, 47.0],
    [19.0, 52.0],
    [16.6, 53.1],
    [15.6, 52.1],
    [14.5, 49.2],
    [13.5, 46.8],
    [12.8, 45.0],
    [12.68, 43.42],
    [13.3, 43.25],
    [14.8, 42.95],
    [15.8, 42.8]
  ]
    .map(([la, ln]) => {
      const p = projectYemen(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const socotraPoly = [
    [12.7, 53.3],
    [12.65, 54.45],
    [12.35, 54.35],
    [12.32, 53.4]
  ]
    .map(([la, ln]) => {
      const p = projectYemen(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const p1 = projectYemen(mapVisual.point1.lat, mapVisual.point1.lng);
  const p2 = mapVisual.point2 ? projectYemen(mapVisual.point2.lat, mapVisual.point2.lng) : null;
  const pipeEnd = mapVisual.pipelineEnd
    ? projectYemen(mapVisual.pipelineEnd.lat, mapVisual.pipelineEnd.lng)
    : null;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-sky-50/50 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
          <MapPin className="h-3.5 w-3.5 text-rose-600" />
          <span>خريطة صماء للجمهورية اليمنية — تأمل موضع النقطة المطلوبة</span>
        </span>
        <span className="font-mono text-slate-500">N ↑ الشمال</span>
      </div>

      <svg
        viewBox="0 0 1000 590"
        role="img"
        aria-label="خريطة صماء لليمن لتحديد المعالم الجغرافية"
        className="mx-auto h-auto max-h-[260px] w-full rounded-lg border border-sky-200 bg-sky-100/70"
      >
        <defs>
          <linearGradient id="quizOcean" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="590" fill="url(#quizOcean)" />

        {/* Neighboring Arabian Peninsula Landmass (North & East borders of Yemen) */}
        <path
          d="M 0,0 L 1000,0 L 1000,150 L 950,164 L 879,203 L 796,229 L 725,73 L 404,79 L 243,177 L 159,170 L 134,242 L 75,110 L 40,0 Z"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          opacity="0.82"
        />
        <line x1="725" y1="73" x2="757" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />

        {/* Yemen Mainland Blank Silhouette */}
        <polygon
          points={yemenPolygonPoints}
          fill="#fef9c3"
          stroke="#475569"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Socotra Archipelago Blank Silhouette */}
        <polygon
          points={socotraPoly}
          fill="#fef9c3"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Optional Pipeline Path (Safer -> Red Sea) */}
        {mapVisual.kind === 'yemen-pipeline' && p2 && pipeEnd && (
          <g>
            <line
              x1={p2.x}
              y1={p2.y}
              x2={pipeEnd.x}
              y2={pipeEnd.y}
              stroke={mapVisual.activePoint === 2 ? '#e11d48' : '#64748b'}
              strokeWidth={mapVisual.activePoint === 2 ? '5' : '3'}
              strokeDasharray="10 6"
            />
          </g>
        )}

        {/* Point 1 */}
        <g transform={`translate(${p1.x}, ${p1.y})`}>
          {mapVisual.activePoint === 1 && <circle r="24" fill="#e11d48" opacity="0.22" />}
          <circle
            r={mapVisual.activePoint === 1 ? '14' : '11'}
            fill={mapVisual.activePoint === 1 ? '#e11d48' : '#475569'}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            y="5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="14"
            fontWeight="800"
          >
            1
          </text>
        </g>

        {/* Point 2 */}
        {p2 && (
          <g transform={`translate(${p2.x}, ${p2.y})`}>
            {mapVisual.activePoint === 2 && <circle r="24" fill="#e11d48" opacity="0.22" />}
            <circle
              r={mapVisual.activePoint === 2 ? '14' : '11'}
              fill={mapVisual.activePoint === 2 ? '#e11d48' : '#475569'}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <text
              y="5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontWeight="800"
            >
              2
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ================= QUESTION CARD =================

interface QuestionCardProps {
  index: number;
  customSlotLabel?: string;
  question: QuizQuestion;
  savedAnswer?: { selected: string; isCorrect: boolean };
  hideImmediateFeedback?: boolean;
  onRecordAnswer: (questionId: string, selected: string, isCorrect: boolean) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  customSlotLabel,
  question,
  savedAnswer,
  hideImmediateFeedback = false,
  onRecordAnswer,
  onGoToLesson,
  onGoToAtlas
}) => {
  const [essayRevealed, setEssayRevealed] = useState(Boolean(savedAnswer));
  const [matchingState, setMatchingState] = useState<Record<string, string>>({});

  const lesson = question.lessonId ? getLessonById(question.lessonId) : undefined;
  const isAnswered = Boolean(savedAnswer);
  const showCorrection = isAnswered && !hideImmediateFeedback;
  const sourceCat = question.sourceCategory ?? 'textbook';

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
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-mono text-slate-900">
            {customSlotLabel ? `${customSlotLabel}` : `س${index}.`}
          </strong>
          {sourceCat === 'ministerial' && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
              <Award className="h-3 w-3" />
              <span>وزاري رسمي</span>
            </span>
          )}
          {sourceCat === 'generated' && (
            <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-900">
              <Sparkles className="h-3 w-3" />
              <span>توليد تدريبي</span>
            </span>
          )}
          <span>{question.sourceLabel}</span>
          <span>· {TYPE_LABELS[question.type]}</span>
          <span>
            · مستوى: <strong className="text-slate-800">{question.cognitiveLevel}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lesson && (
            <button
              type="button"
              onClick={() => onGoToLesson(question.unitId, lesson.id)}
              className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>الدرس ({question.pageRef})</span>
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

      {/* Blank Map Preview when applicable */}
      {question.mapVisual && <MiniYemenMapQuizVisual mapVisual={question.mapVisual} />}

      {/* MCQ / True-False / Fill-in-Blank / Map options */}
      {question.options && question.options.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((opt) => {
            const isSelected = savedAnswer?.selected === opt;
            const isRight = opt === question.correctAnswer;
            let btnStyle = 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';

            if (showCorrection) {
              if (isRight) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
              } else if (isSelected) {
                btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
              } else {
                btnStyle = 'border-slate-200 bg-white text-slate-500';
              }
            } else if (isSelected) {
              btnStyle = 'border-sky-600 bg-sky-50 text-sky-950 font-semibold';
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleOptionSelect(opt)}
                className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-right text-sm transition-colors ${btnStyle}`}
              >
                <span>{opt}</span>
                {showCorrection && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {showCorrection && isSelected && !isRight && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
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
            const isRightMatch = showCorrection && selectedRight === pair.right;
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
                    showCorrection
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
      {showCorrection && (
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

// ================= MINISTERIAL EXAM PATTERN ANALYSIS =================

const ExamPatternAnalysis: React.FC = () => {
  return (
    <section className="space-y-6">
      {/* Methodology Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-5 text-xs leading-relaxed text-slate-800">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <div>
          <div className="font-bold text-slate-900">
            منهجية استقراء النماذج الوزارية الرسمية ({MINISTERIAL_BATCH_STATS.academicYear})
          </div>
          <p className="mt-1">
            تم فحص <strong>{MINISTERIAL_BATCH_STATS.modelsAnalyzed} نموذجاً وزارياً</strong> رسمياً في مادة{' '}
            {MINISTERIAL_BATCH_STATS.subjectPaper} ({MINISTERIAL_BATCH_STATS.uniqueGeographyVariants} صيغة جغرافية مستقلة)،
            واستخراج جميع أسئلة الجغرافيا ومفاتيح تصحيحها الإلكتروني. يُستفاد من هذا التحليل في تنظيم المذاكرة ومعرفة الأوزان النسبية للوحدات،{' '}
            <strong>دون ادعاء التنبؤ المؤكد بأسئلة الامتحانات القادمة</strong>.
          </p>
        </div>
      </div>

      {/* Real Ministerial Paper Structure */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          هيكلة القسم الجغرافي في ورقة الامتحان الوزاري (30 درجة من أصل 80)
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MINISTERIAL_BATCH_STATS.geographySlotsBreakdown.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="font-mono text-xs font-bold text-emerald-800">{item.slot}</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{item.type}</div>
              <p className="mt-1 text-xs text-slate-600">{item.distribution}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          ملاحظة تدقيقية: {MINISTERIAL_BATCH_STATS.cancelledQuestionsNote}
        </p>
      </div>

      {/* Topic Recurrence Frequency Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          الموضوعات الأكثر تكراراً والفخاخ الشائعة عبر 21 نموذجاً وزارياً مختلفاً
        </h2>
        <div className="mt-4 space-y-4">
          {MINISTERIAL_TOPIC_FREQUENCY.map((item) => {
            const pct = Math.round((item.appearancesInModels / item.totalUniqueModels) * 100);
            const unit = getUnitById(item.unitId);
            return (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">{item.topic}</h3>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {unit ? `الوحدة ${unit.unitNumber}` : ''} · مواضعها في الورقة: {item.questionSlots}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {item.appearancesInModels} / {item.totalUniqueModels} ({pct}%)
                    </span>
                  </div>
                </div>

                {/* Frequency Progress Bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-700">
                  <strong className="text-slate-900">نمط السؤال المتكرر: </strong>
                  {item.patternSummary}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900">
                  <strong>أبرز الفخاخ والتمييز المطلوب: </strong>
                  {item.commonTraps}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
