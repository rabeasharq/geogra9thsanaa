import React, { useMemo, useState } from 'react';
import {
  ALL_LESSONS,
  ATLAS_LOCATIONS,
  BOOK_FRONT_MATTER,
  QUIZ_QUESTIONS,
  TEXTBOOK_UNITS,
  getLessonById,
  getLocationsForLesson,
  getUnitById
} from '../data/bookIndex';
import { PortalId, StudentProgress, StudyFocusScope } from '../types/textbook';
import { diagnoseStudentProgress } from '../utils/studentDiagnosis';
import {
  BookOpen,
  Compass,
  FileText,
  CheckSquare,
  ArrowLeft,
  Bookmark,
  Search,
  PenTool,
  Phone,
  Target,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { PWAOfflineStatusCard } from './PWAInstallButton';

const VERCEL_APP_URL = 'https://geogra9thsanaa.vercel.app';
const MAJDI_TELEGRAM_URL = 'https://t.me/majdinofani';

interface HomePortalProps {
  progress: StudentProgress;
  studyFocus: StudyFocusScope;
  onChangeStudyFocus: (scope: StudyFocusScope) => void;
  onNavigatePortal: (portal: PortalId) => void;
  onOpenLesson: (unitId: string, lessonId: string) => void;
  onOpenAtlasLocation: (locationId: string) => void;
  onOpenStudyGuide: (unitId?: string) => void;
  onOpenTraining: (unitId?: string, lessonId?: string, initialTab?: 'practice' | 'diagnosis' | 'simulator' | 'patterns') => void;
  onOpenSearch: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  progress,
  studyFocus,
  onChangeStudyFocus,
  onNavigatePortal,
  onOpenLesson,
  onOpenAtlasLocation,
  onOpenStudyGuide,
  onOpenTraining,
  onOpenSearch
}) => {
  const [copiedAppLink, setCopiedAppLink] = useState(false);

  const appShareUrl = VERCEL_APP_URL;

  const handleCopyAppLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(appShareUrl).then(() => {
        setCopiedAppLink(true);
        window.setTimeout(() => setCopiedAppLink(false), 2000);
      }).catch(() => undefined);
    }
  };

  const lastLesson = getLessonById(progress.lastLocation.lessonId) ?? ALL_LESSONS[0];
  const lastUnit = getUnitById(progress.lastLocation.unitId) ?? TEXTBOOK_UNITS[0];
  const lessonLocations = useMemo(() => getLocationsForLesson(lastLesson.id), [lastLesson.id]);

  const completedCount = progress.completedLessons.length;
  const totalLessons = ALL_LESSONS.length;
  const completionPct = Math.round((completedCount / totalLessons) * 100);

  const answeredCount = Object.keys(progress.quizAnswers).length;
  const correctCount = Object.values(progress.quizAnswers).filter((a) => a.isCorrect).length;
  const isFirstTimeStudent = completedCount === 0 && answeredCount === 0;

  const diagnosis = useMemo(() => diagnoseStudentProgress(progress), [progress]);

  const scopeOptions: { id: StudyFocusScope; label: string; hint: string }[] = [
    {
      id: 'active-unit',
      label: `الوحدة الحالية (الوحدة ${lastUnit.unitNumber})`,
      hint: `تركّز الملزمة والمقارنات والتدريبات على «${lastUnit.title}» فقط`
    },
    {
      id: 'semester-1',
      label: 'الفصل الأول (اليمن 1–2)',
      hint: 'تركيز على الوحدتين الأولى والثانية'
    },
    {
      id: 'semester-2',
      label: 'الفصل الثاني (الوطن العربي 3–4)',
      hint: 'تركيز على الوحدتين الثالثة والرابعة'
    },
    {
      id: 'all',
      label: 'كل المنهج (المراجعة الشاملة)',
      hint: 'عرض جميع الوحدات والمقارنات والاختبار الوزاري الكامل'
    }
  ];

  const activeScopeHint = scopeOptions.find((s) => s.id === studyFocus)?.hint ?? '';

  const portals: {
    id: PortalId;
    num: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    accentClass: string;
    recommendedStart?: boolean;
  }[] = [
    {
      id: 'units',
      num: '01',
      title: 'مدخل الوحدات والدروس',
      subtitle: '4 وحدات · 18 درساً مرتباً حسب الكتاب',
      description:
        'نقطة البداية الأولى: اقرأ نص الكتاب الرسمي كاملاً مع الأهداف والمفاهيم والجداول والتقويم، وإثراءً اختيارياً عند الضغط على الكلمة.',
      icon: <BookOpen className="h-5 w-5 text-sky-700" />,
      accentClass: 'hover:border-sky-300',
      recommendedStart: true
    },
    {
      id: 'atlas',
      num: '02',
      title: 'أطلس الرحلة الجغرافية',
      subtitle: `${ATLAS_LOCATIONS.length} موقعاً موثقاً · ثنائي وثلاثي الأبعاد`,
      description:
        'شاهد مواقع الدرس التي قرأتها على خرائط الطبقات التفاعلية لليمن والوطن العربي مع تصور ثلاثي الأبعاد للارتفاعات.',
      icon: <Compass className="h-5 w-5 text-emerald-700" />,
      accentClass: 'hover:border-emerald-300'
    },
    {
      id: 'map-lab',
      num: '03',
      title: 'قسم رسم الخرائط وكتابة البيانات',
      subtitle: '6 خرائط تفصيلية مطابقة للكتاب · مرسم حر · تعيين صماء',
      description:
        'تدرّب عملياً على رسم الخرائط الصماء خطوة بخطوة وكتابة البيانات عليها، وتحديد المواقع المطلوبة في الامتحان.',
      icon: <PenTool className="h-5 w-5 text-rose-700" />,
      accentClass: 'hover:border-rose-300'
    },
    {
      id: 'study-guide',
      num: '04',
      title: 'الملزمة والمقارنات',
      subtitle: 'تلخيص · مقارنات متكيفة مع نطاقك · طباعة PDF',
      description:
        'راجع خلاصة وحدتك الحالية وجداولها وقوانينها ومختبر التمييز بين المتشابهات دون تشتت بدروس لم تصلها بعد.',
      icon: <FileText className="h-5 w-5 text-amber-700" />,
      accentClass: 'hover:border-amber-300'
    },
    {
      id: 'training',
      num: '05',
      title: 'التدريب والتقويم الوزاري',
      subtitle: `${QUIZ_QUESTIONS.length} سؤالاً · خطة مراجعة الأخطاء · محاكي الامتحان`,
      description:
        'اختبر فهمك في الدرس أو الوحدة الحالية، واكتشف أخطاءك مع توجيه مباشر للدرس المناسب، أو خُض محاكي الامتحان.',
      icon: <CheckSquare className="h-5 w-5 text-indigo-700" />,
      accentClass: 'hover:border-indigo-300'
    }
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8">
      {/* Fast-Scan Top Credit & Notes Strip */}
      <section
        aria-label="إعداد ومراجعة التطبيق والملاحظات"
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-sky-700">
              <span>إعداد التطبيق والملاحظات والتواصل:</span>
              <a
                href="tel:779424090"
                dir="ltr"
                className="inline-flex items-center gap-1 font-mono font-bold tabular-nums text-slate-800 hover:text-sky-700 hover:underline"
              >
                <Phone className="h-3 w-3 text-emerald-600" />
                <span>779424090</span>
              </a>
            </div>
            <div className="text-xs font-extrabold text-slate-900 sm:text-sm">
              الأستاذ إبراهيم أحمد متاش
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
              <span className="shrink-0 font-medium text-slate-500">رابط التطبيق:</span>
              <a
                href={appShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="min-w-0 flex-1 truncate font-mono text-[11px] text-sky-700 hover:underline"
                title={appShareUrl}
              >
                {appShareUrl}
              </a>
              <button
                type="button"
                onClick={handleCopyAppLink}
                className="inline-flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                {copiedAppLink ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="min-w-0 space-y-1 border-t border-slate-100 pt-2.5 sm:border-t-0 sm:border-r sm:pt-0 sm:pr-5">
            <div className="text-[11px] font-semibold text-emerald-700">
              مراجع التطبيق والمحتوى والملاحظات العلمية:
            </div>
            <div className="text-xs font-extrabold text-slate-900 sm:text-sm">
              الأستاذ مجدي محمد النوفاني
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
              <span className="shrink-0 font-medium text-slate-500">قناة التليجرام:</span>
              <a
                href={MAJDI_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="inline-flex min-w-0 items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                <span className="truncate">{MAJDI_TELEGRAM_URL}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Split Section */}
      <section className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7">
          <div>
            <p className="text-xs font-medium text-slate-500">
              الجمهورية اليمنية · الصف التاسع الأساسي · المرجع الرسمي {BOOK_FRONT_MATTER.sourceEdition}
            </p>
            <h1 className="font-display mt-3 text-2xl leading-snug font-extrabold text-slate-900 sm:text-4xl">
              كتاب الجغرافيا التفاعلي للصف التاسع الأساسي – طبعة 2026
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              منظومة تعليمية مترابطة لكتاب «{BOOK_FRONT_MATTER.officialTitle}» تحافظ على النص الرسمي والأرقام
              والخرائط المقررة دون حذف أو إضافة خارجية، وترشدك خطوة بخطوة من الدرس إلى الأطلس فالتدريب.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenLesson(lastUnit.id, lastLesson.id)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <span>
                {isFirstTimeStudent
                  ? `ابدأ من الوحدة ${lastUnit.unitNumber} – الدرس ${lastLesson.lessonNumber}: ${lastLesson.title}`
                  : `واصل مذاكرة الدرس ${lastLesson.lessonNumber}: ${lastLesson.title}`}
              </span>
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span>ابحث في الكتاب</span>
            </button>
          </div>
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:col-span-5">
          <img
            src="/src/assets/images/yemen_highlands_terraces_1795370729559.jpg"
            alt="المدرجات الزراعية في المرتفعات الغربية بالجمهورية اليمنية"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute right-5 bottom-5 left-5 text-white">
            <p className="text-xs text-slate-200">الوحدة الأولى · الدرس الثاني · ص 14–15</p>
            <p className="font-display mt-1 text-lg font-bold">
              المرتفعات الجبلية الغربية والمدرجات الزراعية في اليمن
            </p>
          </div>
        </div>
      </section>

      {/* Study Focus Scope Selector + 4-Step Student Journey */}
      <section
        aria-label="تحديد نطاق المذاكرة ومسار البداية"
        className="space-y-5 rounded-2xl border border-sky-200/80 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
              <SlidersHorizontal className="h-4 w-4" />
              <span>نطاق المذاكرة الحالي (حتى لا تتشتت بدروس لم تصلها بعد)</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {activeScopeHint} — ويمكنك التبديل إلى المراجعة الشاملة في أي وقت.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="نطاق المذاكرة الحالي">
            {scopeOptions.map((opt) => {
              const active = studyFocus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeStudyFocus(opt.id)}
                  className={`min-h-[38px] whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Step Clear Learning Sequence */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm font-extrabold text-slate-900">
              من أين تبدأ؟ خطوات المذاكرة المرتبة للدرس الحالي ({lastLesson.title})
            </h2>
            <span className="text-xs text-slate-500">
              الوحدة {lastUnit.unitNumber} · ص {lastLesson.pageRange}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => onOpenLesson(lastUnit.id, lastLesson.id)}
              className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 text-right transition-colors hover:bg-sky-50"
            >
              <span className="font-mono text-sm font-extrabold text-sky-700">01</span>
              <div>
                <div className="text-xs font-bold text-slate-900">اقرأ الدرس الرسمي</div>
                <div className="mt-0.5 text-[11px] text-slate-600">افهم النص والأرقام والمصطلحات</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (lessonLocations[0]) {
                  onOpenAtlasLocation(lessonLocations[0].id);
                } else {
                  onNavigatePortal('atlas');
                }
              }}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-right transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <span className="font-mono text-sm font-extrabold text-emerald-700">02</span>
              <div>
                <div className="text-xs font-bold text-slate-900">شاهده في الأطلس</div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  {lessonLocations.length > 0
                    ? `تثبيت ${lessonLocations.length} مواقع لهذا الدرس على الخريطة`
                    : 'استعرض خريطة الدرس والمواقع'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenStudyGuide(lastUnit.id)}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-right transition-colors hover:border-amber-300 hover:bg-amber-50/40"
            >
              <span className="font-mono text-sm font-extrabold text-amber-700">03</span>
              <div>
                <div className="text-xs font-bold text-slate-900">راجع الملخص والمقارنة</div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  ملخص الوحدة {lastUnit.unitNumber} فقط دون دروس لاحقة
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenTraining(lastUnit.id, lastLesson.id, 'practice')}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-right transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <span className="font-mono text-sm font-extrabold text-indigo-700">04</span>
              <div>
                <div className="text-xs font-bold text-slate-900">اختبر نفسك في الدرس</div>
                <div className="mt-0.5 text-[11px] text-slate-600">تحقق من إجاباتك وصحح الأخطاء فوراً</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Conditional Smart Mistake Alert Banner */}
      {diagnosis.totalWrong > 0 && diagnosis.lessonsNeedingReview.length > 0 && (
        <section
          aria-label="تنبيه مراجعة الأخطاء"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/70 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
            <div className="text-xs leading-relaxed text-slate-800">
              <div className="font-bold text-rose-950">
                توجيه مراجعة من إجاباتك ({diagnosis.totalWrong}{' '}
                {diagnosis.totalWrong === 1 ? 'خطأ' : 'أخطاء'} في {diagnosis.lessonsNeedingReview.length}{' '}
                {diagnosis.lessonsNeedingReview.length === 1 ? 'درس' : 'دروس'})
              </div>
              <p className="mt-0.5">
                أهم درس يحتاج مراجعة الآن: <strong>{diagnosis.lessonsNeedingReview[0].lesson.title}</strong> (ص{' '}
                {diagnosis.lessonsNeedingReview[0].lesson.pageRange})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenTraining(undefined, undefined, 'diagnosis')}
              className="min-h-[38px] rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-800"
            >
              عرض خطة المراجعة وأخطائي
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenLesson(
                  diagnosis.lessonsNeedingReview[0].unit.id,
                  diagnosis.lessonsNeedingReview[0].lesson.id
                )
              }
              className="min-h-[38px] rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-900 hover:bg-rose-50"
            >
              الانتقال للدرس
            </button>
          </div>
        </section>
      )}

      {/* Progress & Scope KPI Strip */}
      <section
        aria-label="ملخص التقدم وبنية الكتاب"
        className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4"
      >
        <div className="border-slate-100 sm:border-l sm:pl-4">
          <div className="text-xs text-slate-500">تقدم الدروس المكتملة</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {completedCount} / {totalLessons}
          </div>
          <div className="mt-1 text-xs text-sky-700">{completionPct}% من المنهج</div>
        </div>
        <div className="border-slate-100 sm:border-l sm:pl-4">
          <div className="text-xs text-slate-500">نتائج التدريب الذاتي</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {correctCount} / {answeredCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">من أصل {QUIZ_QUESTIONS.length} سؤالاً</div>
        </div>
        <div className="border-slate-100 sm:border-l sm:pl-4">
          <div className="text-xs text-slate-500">الإشارات المرجعية المحفوظة</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {progress.bookmarks.length}
          </div>
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
          >
            <Bookmark className="h-3 w-3" />
            <span>عرض المفضلة</span>
          </button>
        </div>
        <div>
          <div className="text-xs text-slate-500">نطاق الكتاب الرسمي</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">112 صفحة</div>
          <button
            type="button"
            onClick={() => onNavigatePortal('study-guide')}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>الملزمة الشاملة والملخصات</span>
          </button>
        </div>
      </section>

      {/* Installable PWA & Full Offline Readiness Banner */}
      <PWAOfflineStatusCard />

      {/* Sequential Portals */}
      <section aria-labelledby="portals-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="portals-heading" className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              أقسام الكتاب بالترتيب الدراسي
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              جميع الأقسام مترابطة بقاعدة محتوى واحدة؛ ننصحك بالبدء من (01) مدخل الوحدات والدروس.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => onNavigatePortal(portal.id)}
              className={`group flex flex-col justify-between rounded-xl border bg-white p-6 text-right transition-all hover:shadow-sm ${
                portal.recommendedStart && isFirstTimeStudent
                  ? 'border-sky-400 ring-1 ring-sky-200'
                  : 'border-slate-200'
              } ${portal.accentClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    {portal.icon}
                  </span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                    {portal.num}
                    {portal.recommendedStart && isFirstTimeStudent ? ' · ابدأ هنا' : ''}
                  </span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900 group-hover:text-sky-700">
                  {portal.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{portal.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{portal.description}</p>
              </div>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700">
                <span>الدخول إلى القسم</span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Units & Lessons Structure Preview */}
      <section aria-labelledby="units-map-heading" className="space-y-4">
        <div>
          <h2 id="units-map-heading" className="font-display text-xl font-bold text-slate-900">
            خريطة وحدات الكتاب ودروسه (الفصلان الأول والثاني)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            انتقل مباشرة إلى أي درس من الفهرس الرسمي للكتاب (ص 7 – 110).
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {TEXTBOOK_UNITS.map((unit) => {
            const unitCompleted = unit.lessons.filter((l) =>
              progress.completedLessons.includes(l.id)
            ).length;
            const isCurrentUnit = unit.id === lastUnit.id;
            return (
              <div
                key={unit.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-5 ${
                  isCurrentUnit ? 'border-sky-300' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      الفصل الدراسي {unit.semester === 1 ? 'الأول (اليمن)' : 'الثاني (الوطن العربي)'} · ص{' '}
                      <span className="font-mono tabular-nums">{unit.pageRange}</span>
                      {isCurrentUnit ? ' · وحدتك الحالية' : ''}
                    </span>
                    <span className="font-mono tabular-nums font-medium text-slate-700">
                      مكتمل {unitCompleted}/{unit.lessons.length}
                    </span>
                  </div>
                  <h3 className="font-display mt-2 text-lg font-bold text-slate-900">
                    الوحدة {unit.unitNumber}: {unit.title}
                  </h3>

                  <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                    {unit.lessons.map((lesson) => {
                      const done = progress.completedLessons.includes(lesson.id);
                      const isCurrentLesson = lesson.id === lastLesson.id;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => onOpenLesson(unit.id, lesson.id)}
                            className="flex w-full items-center justify-between gap-3 py-2.5 text-right text-sm transition-colors hover:text-sky-700"
                          >
                            <span className="flex items-center gap-2 font-medium text-slate-800">
                              <span className="font-mono text-xs tabular-nums text-slate-400">
                                {lesson.lessonNumber}.
                              </span>
                              <span className={isCurrentLesson ? 'font-bold text-sky-800' : ''}>
                                {lesson.title}
                              </span>
                              {done && <span className="text-xs text-emerald-700">· مكتمل</span>}
                              {!done && isCurrentLesson && (
                                <span className="text-xs text-sky-700">· موضعك الحالي</span>
                              )}
                            </span>
                            <span className="font-mono shrink-0 text-xs tabular-nums text-slate-400">
                              ص {lesson.pageRange}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
