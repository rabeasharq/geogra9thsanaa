import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileCheck2,
  Lightbulb,
  Sparkles,
  Target
} from 'lucide-react';
import { LessonDiagnosis, StudentDiagnosisReport } from '../utils/studentDiagnosis';

interface StudentDiagnosisPanelProps {
  diagnosis: StudentDiagnosisReport;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
  onGoToComparisons?: (tab: 'tables' | 'disambiguation', unitId?: string) => void;
  onPracticeLessonMistakes: (unitId: string, lessonId: string) => void;
  onSwitchToPractice: () => void;
  onSwitchToSimulator: () => void;
}

export const StudentDiagnosisPanel: React.FC<StudentDiagnosisPanelProps> = ({
  diagnosis,
  onGoToLesson,
  onGoToAtlas,
  onGoToComparisons,
  onPracticeLessonMistakes,
  onSwitchToPractice,
  onSwitchToSimulator
}) => {
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>(() => {
    const firstId = diagnosis.lessonsNeedingReview[0]?.lesson.id;
    return firstId ? { [firstId]: true } : {};
  });

  const toggleLessonDetails = (lessonId: string) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  if (diagnosis.totalAnswered === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <Target className="h-6 w-6" />
        </div>
        <h2 className="font-display mt-4 text-lg font-extrabold text-slate-900">
          لم تجب عن أي تدريبات بعد لتشخيص مستواك
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
          أجب عن عدد من الأسئلة في بنك التدريبات أو خُض نموذج محاكاة الامتحان الوزاري، وسيقوم النظام تلقائياً بدراسة إجاباتك، واكتشاف الدروس التي أخطأت فيها، واقتراح خطة مراجعة موجّهة لك بالصفحات والمفاهيم.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSwitchToPractice}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <BookOpen className="h-4 w-4" />
            <span>البدء من بنك التدريبات</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToSimulator}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-50 px-5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>خوض محاكي الامتحان الوزاري</span>
          </button>
        </div>
      </section>
    );
  }

  if (diagnosis.totalWrong === 0) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  أداء ممتاز — لا توجد أخطاء مسجلة حتى الآن
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  أجبت عن{' '}
                  <strong className="font-mono tabular-nums text-emerald-900">
                    {diagnosis.totalAnswered}
                  </strong>{' '}
                  سؤالاً بنسبة دقة{' '}
                  <strong className="font-mono tabular-nums text-emerald-900">100%</strong> عبر{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {diagnosis.masteredLessons.length}
                  </strong>{' '}
                  دروس.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSwitchToSimulator}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>اختبر نفسك في نموذج وزاري كامل</span>
            </button>
          </div>
        </div>

        {diagnosis.unattemptedLessons.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-base font-bold text-slate-900">
              اقتراح التوسع: دروس لم تختبر نفسك في تدريباتها بعد ({diagnosis.unattemptedLessons.length})
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              لضمان تغطية المنهج كاملاً، يُنصح بالانتقال إلى الدروس التالية ومراجعة مفاهيمها وحل تدريباتها:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {diagnosis.unattemptedLessons.slice(0, 6).map(({ unit, lesson }) => (
                <div
                  key={lesson.id}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      الوحدة {unit.unitNumber} · الدرس {lesson.lessonNumber} · ص {lesson.pageRange}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{lesson.title}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 border-t border-slate-200/80 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => onGoToLesson(unit.id, lesson.id)}
                      className="font-semibold text-sky-700 hover:underline"
                    >
                      قراءة الدرس
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  const topLesson = diagnosis.lessonsNeedingReview[0];

  return (
    <section className="space-y-6">
      {/* Executive Diagnostic Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-rose-700">
              تقرير التشخيص التربوي وخطة المراجعة الشخصية
            </div>
            <h2 className="font-display mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
              لديك {diagnosis.lessonsNeedingReview.length}{' '}
              {diagnosis.lessonsNeedingReview.length === 1 ? 'درس يحتاج إلى مراجعة' : 'دروس تحتاج إلى مراجعة'}{' '}
              بناءً على أخطائك ({diagnosis.totalWrong} {diagnosis.totalWrong === 1 ? 'خطأ' : 'أخطاء'})
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              تم ترتيب الدروس أدناه حسب الأولوية (الأكثر أخطاءً والأقرب للأسئلة الوزارية أولاً) مع تحديد الصفحات والمفاهيم التي تستحق التركيز.
            </p>
          </div>

          {topLesson && (
            <button
              type="button"
              onClick={() => onGoToLesson(topLesson.unit.id, topLesson.lesson.id)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4" />
              <span>ابدأ بمراجعة: {topLesson.lesson.title}</span>
              <ArrowUpLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Clean Metrics Row */}
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="text-[11px] font-medium text-slate-500">إجمالي الأسئلة المجاب عنها</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-slate-900">
              {diagnosis.totalAnswered}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5">
            <div className="text-[11px] font-medium text-emerald-800">الإجابات الصحيحة</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-emerald-900">
              {diagnosis.totalCorrect}
            </div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3.5">
            <div className="text-[11px] font-medium text-rose-800">الأخطاء المرصودة</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-rose-900">
              {diagnosis.totalWrong}
            </div>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-3.5">
            <div className="text-[11px] font-medium text-sky-800">نسبة الإتقان الحالية</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-sky-900">
              {diagnosis.accuracyPct}%
            </div>
          </div>
        </div>

        {/* Global Recommendations + Cognitive Breakdown */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Lightbulb className="h-4 w-4 text-amber-700" />
              <span>خلاصة الاقتراحات التوجيهية لمذاكرتك</span>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-800">
              {diagnosis.globalRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="text-xs font-bold text-slate-900">
              توزيع دقتك حسب مستويات التفكير
            </div>
            <div className="mt-3 space-y-2.5">
              {diagnosis.cognitiveBreakdown.map((item) => (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">مستوى {item.level}</span>
                    <span className="font-mono text-[11px] tabular-nums text-slate-600">
                      أخطاء: {item.wrong} من {item.total} ({item.accuracyPct}% دقة)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        item.accuracyPct >= 80
                          ? 'bg-emerald-600'
                          : item.accuracyPct >= 55
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                      }`}
                      style={{ width: `${item.accuracyPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Lessons Needing Review */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
            الدروس المطلوب مراجعتها مرتبة حسب الأولوية
          </h3>
          <span className="text-xs text-slate-500">
            بعد مراجعة أي درس وأداء تدريباته بنجاح سيزول تلقائياً من قائمة الأولوية
          </span>
        </div>

        {diagnosis.lessonsNeedingReview.map((item, idx) => (
          <LessonReviewCard
            key={item.lesson.id}
            rank={idx + 1}
            item={item}
            expanded={Boolean(expandedLessons[item.lesson.id])}
            onToggleExpand={() => toggleLessonDetails(item.lesson.id)}
            onGoToLesson={onGoToLesson}
            onGoToAtlas={onGoToAtlas}
            onGoToComparisons={onGoToComparisons}
            onPracticeLessonMistakes={onPracticeLessonMistakes}
          />
        ))}
      </div>

      {/* Mastered Lessons */}
      {diagnosis.masteredLessons.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display text-base font-bold text-slate-900">
              دروس أتقنت تدريباتها حتى الآن ({diagnosis.masteredLessons.length})
            </h3>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {diagnosis.masteredLessons.map((m) => (
              <div
                key={m.lesson.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3.5 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-900">{m.lesson.title}</div>
                  <div className="text-[11px] text-slate-500">
                    الوحدة {m.unit.unitNumber} · {m.correctCount}/{m.totalAnswered} إجابة صحيحة
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onGoToLesson(m.unit.id, m.lesson.id)}
                  className="shrink-0 font-semibold text-emerald-800 hover:underline"
                >
                  فتح الدرس
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

interface LessonReviewCardProps {
  rank: number;
  item: LessonDiagnosis;
  expanded: boolean;
  onToggleExpand: () => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
  onGoToComparisons?: (tab: 'tables' | 'disambiguation', unitId?: string) => void;
  onPracticeLessonMistakes: (unitId: string, lessonId: string) => void;
}

const LessonReviewCard: React.FC<LessonReviewCardProps> = ({
  rank,
  item,
  expanded,
  onToggleExpand,
  onGoToLesson,
  onGoToAtlas,
  onGoToComparisons,
  onPracticeLessonMistakes
}) => {
  const isUrgent = item.priority === 'urgent';

  return (
    <article
      className={`rounded-xl border bg-white p-5 sm:p-6 ${
        isUrgent ? 'border-rose-300' : 'border-amber-200'
      }`}
    >
      {/* Quiet Unboxed Priority & Metadata Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-500">
          <span className={`font-bold ${isUrgent ? 'text-rose-700' : 'text-amber-800'}`}>
            {rank}. {isUrgent ? 'أولوية عاجلة للمراجعة' : 'يُستحسن مراجعته'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            الوحدة {item.unit.unitNumber}: {item.unit.title}
          </span>
          <span aria-hidden="true">·</span>
          <span>الدرس {item.lesson.lessonNumber}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">ص {item.lesson.pageRange}</span>
        </div>

        <div className="font-mono text-xs font-bold tabular-nums text-rose-800">
          أخطاء: {item.wrongCount} من {item.totalAnswered} (الدقة {item.accuracyPct}%)
        </div>
      </div>

      {/* Title & Primary Navigation */}
      <div className="mt-2.5 flex flex-wrap items-start justify-between gap-4">
        <h4 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
          {item.lesson.title}
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onGoToLesson(item.unit.id, item.lesson.id)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>الانتقال لمراجعة الدرس</span>
          </button>

          <button
            type="button"
            onClick={() => onPracticeLessonMistakes(item.unit.id, item.lesson.id)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Target className="h-3.5 w-3.5 text-rose-600" />
            <span>التدرب على أخطاء الدرس</span>
          </button>

          {item.relatedLocationIds.length > 0 && (
            <button
              type="button"
              onClick={() => onGoToAtlas(item.relatedLocationIds[0])}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-700" />
              <span>مراجعة الموقع في الأطلس</span>
            </button>
          )}

          {onGoToComparisons && (item.trueFalseMistakes > 0 || item.wrongCount >= 2) && (
            <button
              type="button"
              onClick={() => onGoToComparisons('disambiguation', item.unit.id)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>تمييز متشابهات الوحدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Tailored Study Suggestions */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <AlertTriangle className={`h-3.5 w-3.5 ${isUrgent ? 'text-rose-600' : 'text-amber-600'}`} />
          <span>اقتراحات المراجعة الموجّهة لك في هذا الدرس:</span>
        </div>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700">
          {item.suggestions.map((sug, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Specific Mistakes Details */}
      <div className="mt-3">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-800"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>
            {expanded
              ? 'إخفاء تفاصيل الأسئلة التي أخطأت فيها'
              : `عرض تفاصيل الأسئلة التي أخطأت فيها (${item.wrongAttempts.length})`}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
            {item.wrongAttempts.map(({ question, selectedAnswer }) => (
              <div
                key={question.id}
                className="rounded-lg border border-rose-200/80 bg-rose-50/40 p-3.5 text-xs leading-relaxed"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    {question.sourceLabel} · مستوى: {question.cognitiveLevel} ·{' '}
                    <span className="font-mono">{question.pageRef}</span>
                  </span>
                  {question.relatedLocationId && (
                    <button
                      type="button"
                      onClick={() => onGoToAtlas(question.relatedLocationId!)}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      عرض في الأطلس
                    </button>
                  )}
                </div>

                <div className="mt-1.5 font-bold text-slate-900">{question.prompt}</div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-rose-200 bg-white px-3 py-2 text-rose-800">
                    <span className="font-semibold">إجابتك السابقة: </span>
                    <span>{selectedAnswer || 'غير محددة'}</span>
                  </div>
                  <div className="rounded border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-emerald-900">
                    <span className="font-semibold">الصواب المقرر: </span>
                    <span>{question.correctAnswer}</span>
                  </div>
                </div>

                <p className="mt-2 text-slate-700">
                  <strong className="text-slate-900">التفسير من الكتاب: </strong>
                  {question.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
