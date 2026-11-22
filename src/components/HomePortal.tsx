import React from 'react';
import {
  ALL_LESSONS,
  ATLAS_LOCATIONS,
  BOOK_FRONT_MATTER,
  QUIZ_QUESTIONS,
  TEXTBOOK_UNITS,
  getLessonById,
  getUnitById
} from '../data/bookIndex';
import { PortalId, StudentProgress } from '../types/textbook';
import {
  BookOpen,
  Compass,
  FileText,
  CheckSquare,
  ArrowLeft,
  Bookmark,
  ShieldCheck,
  Search,
  PenTool,
  Phone
} from 'lucide-react';

interface HomePortalProps {
  progress: StudentProgress;
  onNavigatePortal: (portal: PortalId) => void;
  onOpenLesson: (unitId: string, lessonId: string) => void;
  onOpenSearch: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  progress,
  onNavigatePortal,
  onOpenLesson,
  onOpenSearch
}) => {
  const lastLesson = getLessonById(progress.lastLocation.lessonId) ?? ALL_LESSONS[0];
  const lastUnit = getUnitById(progress.lastLocation.unitId) ?? TEXTBOOK_UNITS[0];

  const completedCount = progress.completedLessons.length;
  const totalLessons = ALL_LESSONS.length;
  const completionPct = Math.round((completedCount / totalLessons) * 100);

  const answeredCount = Object.keys(progress.quizAnswers).length;
  const correctCount = Object.values(progress.quizAnswers).filter((a) => a.isCorrect).length;

  const portals: {
    id: PortalId;
    num: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    accentClass: string;
  }[] = [
    {
      id: 'units',
      num: '01',
      title: 'مدخل الوحدات والدروس',
      subtitle: '4 وحدات · 18 درساً مرتباً حسب الكتاب',
      description:
        'استعرض نص الكتاب الرسمي كاملاً مع الأهداف والمفاهيم والخرائط والجداول والتقويم، وإثراءً اختيارياً مطوياً أو عائماً عند الضغط على الكلمة مع حفظ تقدمك.',
      icon: <BookOpen className="h-5 w-5 text-sky-700" />,
      accentClass: 'hover:border-sky-300'
    },
    {
      id: 'atlas',
      num: '02',
      title: 'أطلس الرحلة الجغرافية',
      subtitle: `${ATLAS_LOCATIONS.length} موقعاً موثقاً · ثنائي وثلاثي الأبعاد`,
      description:
        'رحلة بصرية متدرجة عبر خرائط الطبقات التفاعلية لليمن والوطن العربي مع تصور ثلاثي الأبعاد للكرة الأرضية والتضاريس والجبال.',
      icon: <Compass className="h-5 w-5 text-emerald-700" />,
      accentClass: 'hover:border-emerald-300'
    },
    {
      id: 'study-guide',
      num: '03',
      title: 'الملزمة الشاملة',
      subtitle: 'تلخيص كامل · جداول · قوانين · تصدير PDF',
      description:
        'تنظيم تعليمي شامل يستوعب كل تفاصيل الكتاب وجداوله ومصطلحاته وخرائطه الذهنية مع إحالات دقيقة للصفحات وإمكانية الطباعة.',
      icon: <FileText className="h-5 w-5 text-amber-700" />,
      accentClass: 'hover:border-amber-300'
    },
    {
      id: 'training',
      num: '04',
      title: 'التدريب والتقويم',
      subtitle: `${QUIZ_QUESTIONS.length} سؤالاً مصنفاً + تحليل الأنماط`,
      description:
        'تدريبات تفاعلية مصنفة حسب الدرس ومستوى التفكير ونوع السؤال، مرتبطة بالإجابات المقررة والمواقع على الأطلس.',
      icon: <CheckSquare className="h-5 w-5 text-indigo-700" />,
      accentClass: 'hover:border-indigo-300'
    },
    {
      id: 'map-lab',
      num: '05',
      title: 'قسم تعلم رسم الخرائط وكتابة البيانات',
      subtitle: '6 خرائط تفصيلية مطابقة للكتاب · مرسم حر وكتابة · تعيين صماء',
      description:
        'قسم مستقل يطابق خرائط الكتاب المدرسي لتعلم رسم الخرائط الصماء خطوة بخطوة، وكتابة البيانات عليها، وحفظ الرسم أو التدرب على تحديد المواقع.',
      icon: <PenTool className="h-5 w-5 text-rose-700" />,
      accentClass: 'hover:border-rose-300'
    }
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-10 px-4 py-8 sm:px-6 sm:py-10">
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
              والخرائط المقررة دون حذف أو إضافة خارجية، وتربط كل معلومة بالأطلس التفاعلي والملزمة الشاملة والتقويم.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenLesson(lastUnit.id, lastLesson.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <span>
                {completedCount > 0 ? 'متابعة من آخر موضع:' : 'ابدأ القراءة:'} {lastLesson.title}
              </span>
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span>ابحث في الكتاب</span>
            </button>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:col-span-5">
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
          <div className="text-xs text-slate-500">المرجعية والتدقيق</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">112 صفحة</div>
          <button
            type="button"
            onClick={() => onNavigatePortal('audit')}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>تقرير التدقيق والمطابقة</span>
          </button>
        </div>
      </section>

      {/* Four Main Portals */}
      <section aria-labelledby="portals-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="portals-heading" className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              المداخل التفاعلية للكتاب
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              جميع المداخل مترابطة بقاعدة محتوى واحدة؛ اختر المدخل المناسب لهدفك الدراسي.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => onNavigatePortal(portal.id)}
              className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-right transition-all hover:shadow-sm ${portal.accentClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    {portal.icon}
                  </span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                    {portal.num}
                  </span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900 group-hover:text-sky-700">
                  {portal.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{portal.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{portal.description}</p>
              </div>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700">
                <span>الدخول إلى المدخل</span>
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
            return (
              <div
                key={unit.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      الفصل الدراسي {unit.semester === 1 ? 'الأول (اليمن)' : 'الثاني (الوطن العربي)'} · ص{' '}
                      <span className="font-mono tabular-nums">{unit.pageRange}</span>
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
                              <span>{lesson.title}</span>
                              {done && <span className="text-xs text-emerald-700">· مكتمل</span>}
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

      {/* Author / Support Credit Strip */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <div className="text-xs font-semibold text-sky-700">التواصل والدعم التربوي والتقني</div>
          <div className="font-display mt-1 text-base font-bold text-slate-900">
            الأستاذ إبراهيم أحمد متاش
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            للتواصل والاستفسارات التربوية والدعم الفني الخاص بالكتاب التفاعلي للصف التاسع الأساسي
          </p>
        </div>
        <a
          href="tel:779424090"
          dir="ltr"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-mono text-sm font-bold tabular-nums text-white hover:bg-slate-800"
        >
          <Phone className="h-4 w-4 text-emerald-400" />
          <span>779424090</span>
        </a>
      </section>
    </main>
  );
};
