import React, { useId, useMemo } from 'react';
import {
  BOOK_FRONT_MATTER,
  CORE_TEXTBOOK_QUESTIONS,
  MINISTERIAL_QUESTIONS,
  TEXTBOOK_UNITS
} from '../data/bookIndex';
import { TEXTBOOK_MAP_TEMPLATES } from '../data/mapTemplatesData';
import {
  DISAMBIGUATION_ITEMS,
  MINISTERIAL_COMPARATIVE_TABLES
} from '../data/ministerialComparisons';
import { BlankPracticeMapSvg, DetailedTextbookMapSvg } from './TextbookMapSvg';
import { QuizQuestion, Unit } from '../types/textbook';

export type BookletScope = 'full' | 'unit-1' | 'unit-2' | 'unit-3' | 'unit-4' | 'maps-tables';

interface PrintableStudyBookletProps {
  scope: BookletScope;
  includeBlankMaps: boolean;
  includeQuizKey: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const UNIT_MINDMAPS: Record<
  string,
  { title: string; steps: { step: string; ref: string; detail: string }[] }
> = {
  'unit-1': {
    title: 'المخطط السببي للوحدة الأولى: البيئة الطبيعية لليمن (ص 8 – 32)',
    steps: [
      { step: '1. الموقع الاستراتيجي', ref: 'ص 8–11', detail: '12°–19°N على باب المندب والبحر الأحمر وبحر العرب · 154+ جزيرة (سقطرى، ميون، كمران).' },
      { step: '2. التضاريس الخمسة', ref: 'ص 13–15', detail: 'سهل تهامة والسهل الجنوبي ← المرتفعات الغربية (النبي شعيب 3670م) ← القيعان ← الهضاب ← الربع الخالي.' },
      { step: '3. المناخ والرياح', ref: 'ص 17–19', detail: 'مدار حار بالسهول ومعتدل بالمرتفعات (-1°م لكل 150م) · أمطار موسمية صيفية جنوبية غربية.' },
      { step: '4. الأودية والمياه', ref: 'ص 20–24', detail: 'أودية بأربعة اتجاهات (حرض، مور، رمع، زبيد، تبن، بنا، حضرموت، مأرب) + السدود (مأرب، كمران، مختان).' },
      { step: '5. النبات والمحميات الست', ref: 'ص 26–32', detail: 'تنوع نباتي حسب الارتفاع + 6 محميات طبيعية: سقطرى، حوف، عتمة، برع، شرمة، بلحاف.' }
    ]
  },
  'unit-2': {
    title: 'المخطط السببي للوحدة الثانية: السكان والاقتصاد في اليمن (ص 36 – 56)',
    steps: [
      { step: '1. السكان والتركيب', ref: 'ص 36–40', detail: 'تركز بالمرتفعات المطيرة (تعز وإب) · مجتمع فتي (15–64 عاماً 50.9%، أقل من 15 عاماً 45.6%) · إعالة مرتفعة.' },
      { step: '2. الزراعة والبن والأسماك', ref: 'ص 41–45', detail: '4 أقاليم زراعية + 8 أصناف بن يمني مشهورة + ثروة سمكية بـ 102 ألف طن و94 ألف طن للماشية.' },
      { step: '3. المعادن والطاقة والصناعة', ref: 'ص 46–49', detail: 'نفط مأرب (صافر→رأس عيسى) والمسيلة (→الضبة) + ملح الصليف + 3 مصانع أسمنت (باجل، عمران، البرح).' },
      { step: '4. النقل والمطارات والموانئ', ref: 'ص 50–52', detail: '6 موانئ بحرية (عدن، الحديدة، المخا، الصليف، المكلا، نشطون) + 7 مطارات دولية (صنعاء، عدن، تعز، الحديدة، الريان، سيئون، الغيضة).' },
      { step: '5. السياحة والمعالم الـ 19', ref: 'ص 53–56', detail: 'سياحة أثرية وتاريخية (صهاريج عدن، قلعة صيرة، براقش، شهارة) وساحلية (الغدير، أبين، الخوخة) وعلاجية (دمت، علي).' }
    ]
  },
  'unit-3': {
    title: 'المخطط السببي للوحدة الثالثة: البيئة الطبيعية للوطن العربي (ص 60 – 84)',
    steps: [
      { step: '1. الموقع والمضائق الأربعة', ref: 'ص 60–64', detail: '22 دولة · 13.3 مليون كم² (71% أفريقيا، 29% آسيا) · جبل طارق، السويس، باب المندب، هرمز.' },
      { step: '2. التضاريس والأجنحة', ref: 'ص 66–70', detail: 'جبال التوائية (أطلس 4165م، عمان، كردستان) وانكسارية (الشام، البحر الأحمر) + هضبة أفريقيا وآسيا.' },
      { step: '3. المناخ والأقاليم الأربعة', ref: 'ص 72–76', detail: 'الإقليم الصحراوي (80%) + البحر المتوسط + المداري السافانا + الاستوائي جنوب السودان والصومال.' },
      { step: '4. الأنهار والبحيرات والسدود', ref: 'ص 77–81', detail: 'الأنهار (النيل، دجلة والفرات، شبيلي وجوبا) + بحيرات (ناصر، طبريا، طبرق، منزلة) + السد العالي وسد الفرات.' },
      { step: '5. الأمن المائي العربي', ref: 'ص 82–84', detail: 'أقل من 5% من المياه المتجددة عالمياً ← التوسع في تحلية المياه وترشيد الري.' }
    ]
  },
  'unit-4': {
    title: 'المخطط السببي للوحدة الرابعة: السكان والاقتصاد في الوطن العربي (ص 88 – 110)',
    steps: [
      { step: '1. السكان والكثافة', ref: 'ص 88–92', detail: '419.78 مليون نسمة (61% أفريقيا، 39% آسيا) · نمو 24‰ · تركز بوادي النيل ودلتاه والسهول الساحلية.' },
      { step: '2. الزراعة والفجوة الغذائية', ref: 'ص 93–96', detail: 'فجوة غذائية رغم توفر الأراضي ← علاجها بالتوسع الأفقي (استصلاح) والرأسي (تحسين السلالات).' },
      { step: '3. الثروة المعدنية والنفط', ref: 'ص 98–102', detail: '>26% من إنتاج النفط العالمي و86% للتصدير · >13% غاز طبيعي · 50% فوسفات المغرب · حديد موريتانيا والجزائر.' },
      { step: '4. الصناعة والتجارة والموانئ', ref: 'ص 103–106', detail: 'صناعة استخراجية مقابل تحويلية · 7 مقومات و7 مشكلات صناعية · موانئ كبرى (جدة، الدار البيضاء، الإسكندرية، عدن).' },
      { step: '5. السياحة العربية الـ 16', ref: 'ص 107–110', detail: 'سياحة دينية (مكة، القدس) وتاريخية (الأهرامات، البتراء، تدمر، بابل، قرطاج) ومصايف وترفيه.' }
    ]
  }
};

function selectUnitPaperQuestions(unitId: string): QuizQuestion[] {
  const ministerial = MINISTERIAL_QUESTIONS.filter((q) => q.unitId === unitId);
  const textbook = CORE_TEXTBOOK_QUESTIONS.filter((q) => q.unitId === unitId);
  const pool = [...ministerial, ...textbook].filter((q) => q.type !== 'map_identify');
  // Deduplicate by prompt and select up to 6 rich items per unit
  const seen = new Set<string>();
  const picked: QuizQuestion[] = [];
  for (const q of pool) {
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    picked.push(q);
    if (picked.length >= 6) break;
  }
  return picked;
}

export const PrintableStudyBooklet: React.FC<PrintableStudyBookletProps> = ({
  scope,
  includeBlankMaps,
  includeQuizKey,
  containerRef
}) => {
  const unitsToRender: Unit[] = useMemo(() => {
    if (scope === 'full' || scope === 'maps-tables') return TEXTBOOK_UNITS;
    return TEXTBOOK_UNITS.filter((u) => u.id === scope);
  }, [scope]);

  const mapsTablesOnly = scope === 'maps-tables';

  const allPaperQuestions = useMemo(() => {
    if (!includeQuizKey || mapsTablesOnly) return [];
    let counter = 1;
    return unitsToRender.flatMap((u) =>
      selectUnitPaperQuestions(u.id).map((q) => ({
        number: counter++,
        unitNumber: u.unitNumber,
        unitTitle: u.title,
        question: q
      }))
    );
  }, [unitsToRender, includeQuizKey, mapsTablesOnly]);

  const includedMaps = useMemo(() => {
    const unitSet = new Set(unitsToRender.map((u) => u.id));
    return TEXTBOOK_MAP_TEMPLATES.filter((m) => unitSet.has(m.unitId));
  }, [unitsToRender]);

  const includedTablesCount = useMemo(() => {
    const unitSet = new Set(unitsToRender.map((u) => u.id));
    return MINISTERIAL_COMPARATIVE_TABLES.filter((t) => unitSet.has(t.unitId)).length;
  }, [unitsToRender]);

  const includedDisambigCount = useMemo(() => {
    const unitSet = new Set(unitsToRender.map((u) => u.id));
    return DISAMBIGUATION_ITEMS.filter((d) => unitSet.has(d.unitId)).length;
  }, [unitsToRender]);

  const scopeHeadline = useMemo(() => {
    if (scope === 'full') return 'الملزمة الشاملة الكاملة (الوحدات الأربع: ص 7 – 110)';
    if (scope === 'maps-tables') return 'كتيّب الخرائط والمقارنات المستقلة ومحاور التخيير الوزاري';
    const found = TEXTBOOK_UNITS.find((u) => u.id === scope);
    return found ? `ملزمة الوحدة ${found.unitNumber}: ${found.title} (ص ${found.pageRange})` : 'الملزمة الشاملة';
  }, [scope]);

  const rawWatermarkId = useId().replace(/:/g, '_');
  const screenPatternId = `booklet_wm_screen_${rawWatermarkId}`;
  const printPatternId = `booklet_wm_print_${rawWatermarkId}`;

  return (
    <div
      ref={containerRef}
      id="printable-study-booklet"
      className="relative space-y-6 overflow-hidden text-slate-900"
    >
      {/* Screen Watermark Layer (confined to booklet sheets, unobtrusive) */}
      <div
        aria-hidden="true"
        className="no-print pointer-events-none absolute inset-0 z-10 overflow-hidden"
      >
        <svg className="h-full w-full text-slate-900 opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={screenPatternId}
              width="360"
              height="220"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-26)"
            >
              <text
                x="180"
                y="96"
                textAnchor="middle"
                fill="currentColor"
                fontFamily="'Cairo', 'IBM Plex Sans Arabic', sans-serif"
                fontSize="14"
                fontWeight="700"
              >
                إعداد: أ. إبراهيم أحمد متاش
              </text>
              <text
                x="180"
                y="120"
                textAnchor="middle"
                fill="currentColor"
                fontFamily="'Cairo', 'IBM Plex Sans Arabic', sans-serif"
                fontSize="13.5"
                fontWeight="700"
              >
                مراجعة: أ. مجدي محمد النوفاني
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${screenPatternId})`} />
        </svg>
      </div>

      {/* Print / PDF A4 Fixed Watermark Layer (repeats on every printed page) */}
      <div
        aria-hidden="true"
        className="print-only pointer-events-none fixed inset-0 z-50 overflow-hidden"
      >
        <svg className="h-full w-full text-slate-900 opacity-[0.075]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={printPatternId}
              width="360"
              height="220"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-26)"
            >
              <text
                x="180"
                y="96"
                textAnchor="middle"
                fill="currentColor"
                fontFamily="'Cairo', 'IBM Plex Sans Arabic', sans-serif"
                fontSize="14"
                fontWeight="700"
              >
                إعداد: أ. إبراهيم أحمد متاش
              </text>
              <text
                x="180"
                y="120"
                textAnchor="middle"
                fill="currentColor"
                fontFamily="'Cairo', 'IBM Plex Sans Arabic', sans-serif"
                fontSize="13.5"
                fontWeight="700"
              >
                مراجعة: أ. مجدي محمد النوفاني
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${printPatternId})`} />
        </svg>
      </div>

      {/* ==================== PAGE 1: OFFICIAL COVER & TABLE OF CONTENTS ==================== */}
      <section className="print-break-after rounded-xl border-2 border-slate-300 bg-white p-6">
        <div className="border-b border-slate-200 pb-4 text-center">
          <div className="text-xs font-bold text-sky-800">
            الجمهورية اليمنية · الصف التاسع الأساسي · المرجع الرسمي: {BOOK_FRONT_MATTER.sourceEdition}
          </div>
          <h1 className="font-display mt-2 text-2xl font-extrabold text-slate-900">
            الملزمة الشاملة الميسّرة في جغرافية الجمهورية اليمنية والوطن العربي
          </h1>
          <p className="mt-1 text-sm font-semibold text-amber-800">{scopeHeadline}</p>
          <p className="mt-2 text-xs text-slate-600">
            نسخة مُفككة ومركّزة مدعّمة بالخرائط المدمجة والصماء وجداول المقارنات المستقلة وأسئلة الوزارة — مصممة للقراءة المريحة والدراسة الورقية الكاملة دون الحاجة إلى إنترنت أو هاتف.
          </p>
        </div>

        {/* Author & Reviewer Official Attribution Box */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="border-l border-slate-200 pl-3">
            <div className="text-xs font-semibold text-sky-800">إعداد وتصميم المحتوى</div>
            <div className="font-display mt-1 text-base font-extrabold text-slate-900">
              الأستاذ إبراهيم أحمد متاش
            </div>
            <div className="mt-1 text-xs text-slate-600">
              التواصل والدعم التربوي والتقني:{' '}
              <span dir="ltr" className="font-mono font-bold text-slate-900">
                779424090
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-800">المراجعة والتدقيق العلمي والمنهجي</div>
            <div className="font-display mt-1 text-base font-extrabold text-slate-900">
              الأستاذ مجدي محمد النوفاني
            </div>
            <div className="mt-1 text-xs text-slate-600">
              مراجع المحتوى التعليمي والجغرافي للكتاب التفاعلي والملزمة
            </div>
          </div>
        </div>

        {/* Booklet Scope Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">الوحدات والدروس</div>
            <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-slate-900">
              {unitsToRender.length} وحدات ·{' '}
              {unitsToRender.reduce((acc, u) => acc + u.lessons.length, 0)} درساً
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">الخرائط المدمجة</div>
            <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-sky-800">
              {includedMaps.length} خرائط {includeBlankMaps ? `+ ${includedMaps.length} صماء` : ''}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">المقارنات والتخيير</div>
            <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-amber-800">
              {includedTablesCount} جدولاً · {includedDisambigCount} محاور
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mt-5">
          <h2 className="font-display border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            فهرس محتويات الملزمة وخريطة المذاكرة
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {unitsToRender.map((u) => {
              const uMaps = TEXTBOOK_MAP_TEMPLATES.filter((m) => m.unitId === u.id);
              const uTables = MINISTERIAL_COMPARATIVE_TABLES.filter((t) => t.unitId === u.id);
              return (
                <div key={u.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="font-display font-extrabold text-slate-900">
                    الوحدة {u.unitNumber}: {u.title}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                    الفصل {u.semester === 1 ? 'الأول' : 'الثاني'} · الكتاب ص {u.pageRange}
                  </div>
                  {!mapsTablesOnly && (
                    <ul className="mt-2 space-y-0.5 text-slate-700">
                      {u.lessons.map((l) => (
                        <li key={l.id}>
                          • الدرس {l.lessonNumber}: {l.title}{' '}
                          <span className="font-mono text-[10px] text-slate-500">(ص {l.pageRange})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 border-t border-slate-200 pt-1.5 font-semibold text-sky-800">
                    تضم: {uMaps.length} خرائط مدمجة · {uTables.length} جداول مقارنة مستقلة
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Roadmap Tip for Offline Students */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          <strong>كيف تذاكر بهذه الملزمة ورقياً دون الحاجة لأي جهاز؟ </strong>
          (1) اقرأ بطاقات الدرس المركّزة والأرقام القياسية، (2) تأمل الخريطة التوضيحية ثم اختبر نفسك في الخريطة الصماء المرفقة بالقلم، (3) راجع الجداول المستقلة ومحاور «احذر الخلط الوزاري»، (4) أجب عن أسئلة نهاية الوحدة ثم راجع حلك في ملحق الإجابات نهاية الملزمة.
        </div>
      </section>

      {/* ==================== UNIT-BY-UNIT DECONSTRUCTED BOOKLET SECTIONS ==================== */}
      {unitsToRender.map((unit) => {
        const unitMaps = TEXTBOOK_MAP_TEMPLATES.filter((m) => m.unitId === unit.id);
        const unitTables = MINISTERIAL_COMPARATIVE_TABLES.filter((t) => t.unitId === unit.id);
        const unitDisambigs = DISAMBIGUATION_ITEMS.filter((d) => d.unitId === unit.id);
        const unitMindmap = UNIT_MINDMAPS[unit.id];
        const unitQuestions = allPaperQuestions.filter((item) => item.unitNumber === unit.unitNumber);

        return (
          <section key={unit.id} className="print-break-before space-y-5">
            {/* Unit Divider Header */}
            <div className="print-break-inside-avoid rounded-xl border-2 border-slate-300 bg-slate-900 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-sky-300">
                  الفصل الدراسي {unit.semester === 1 ? 'الأول (الجمهورية اليمنية)' : 'الثاني (الوطن العربي)'}
                </span>
                <span className="font-mono text-slate-300">صفحات الكتاب: ص {unit.pageRange}</span>
              </div>
              <h2 className="font-display mt-1 text-xl font-extrabold text-white">
                الوحدة {unit.unitNumber}: {unit.title}
              </h2>
              {unit.objectives.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-700 pt-2.5 text-xs text-slate-200">
                  {unit.objectives.slice(0, 4).map((obj, idx) => (
                    <li key={idx}>• {obj}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Part A: Deconstructed Lessons (if not maps-tables-only mode) */}
            {!mapsTablesOnly && (
              <div className="space-y-4">
                {unit.lessons.map((lesson) => {
                  const lessonFormulas = lesson.sections.flatMap((s) => s.formulas ?? []);
                  const lessonTables = lesson.sections.flatMap((s) =>
                    (s.tables ?? []).map((tbl) => ({ ...tbl, sectionTitle: s.title }))
                  );

                  return (
                    <article
                      key={lesson.id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      {/* Lesson Title Strip */}
                      <div className="print-break-inside-avoid flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <h3 className="font-display text-base font-extrabold text-slate-900">
                          الدرس {lesson.lessonNumber}: {lesson.title}
                        </h3>
                        <span className="font-mono text-xs font-semibold text-sky-800">
                          الكتاب ص {lesson.pageRange}
                        </span>
                      </div>

                      {/* Key Figures Strip */}
                      {lesson.keyFacts.length > 0 && (
                        <div className="print-break-inside-avoid rounded-lg border border-sky-200 bg-sky-50 p-3">
                          <div className="mb-1.5 text-xs font-bold text-sky-900">
                            الأرقام والمؤشرات القياسية للدرس:
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {lesson.keyFacts.map((kf, idx) => (
                              <div key={idx}>
                                <span className="text-slate-600">• {kf.label}: </span>
                                <strong className="tabular-nums text-slate-900">{kf.value}</strong>{' '}
                                <span className="font-mono text-[10px] text-slate-500">({kf.pageRef})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deconstructed Lesson Sections */}
                      <div className="space-y-3">
                        {lesson.sections.map((sec) => (
                          <div
                            key={sec.id}
                            className="print-break-inside-avoid rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-display text-sm font-bold text-slate-900">
                                ▸ {sec.title}
                              </h4>
                              <span className="font-mono text-[11px] text-slate-500">{sec.pageRef}</span>
                            </div>
                            {sec.paragraphs.map((p, idx) => (
                              <p key={idx} className="mt-1.5 text-xs leading-relaxed text-slate-800">
                                {p}
                              </p>
                            ))}
                            {sec.bullets && sec.bullets.length > 0 && (
                              <ul className="mt-2 space-y-1 pr-3 text-xs leading-relaxed text-slate-800">
                                {sec.bullets.map((b, i) => (
                                  <li key={i}>– {b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Concepts & Definitions Grid */}
                      {lesson.concepts.length > 0 && (
                        <div className="print-break-inside-avoid">
                          <div className="mb-1.5 text-xs font-bold text-emerald-900">
                            المفاهيم والمصطلحات المقررة:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {lesson.concepts.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between gap-1 font-bold text-emerald-950">
                                  <span>{c.term}</span>
                                  <span className="font-mono text-[10px] text-emerald-800">{c.pageRef}</span>
                                </div>
                                <p className="mt-1 leading-relaxed text-slate-800">{c.definition}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Formulas Box */}
                      {lessonFormulas.length > 0 && (
                        <div className="print-break-inside-avoid rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs">
                          <div className="font-bold text-indigo-900">القوانين والمعادلات الحسابية:</div>
                          <div className="mt-1.5 space-y-1.5">
                            {lessonFormulas.map((fm, idx) => (
                              <div key={idx}>
                                <strong>{fm.name}: </strong>
                                <span className="font-mono font-semibold text-slate-900">{fm.expression}</span>
                                {fm.exampleValue && (
                                  <span className="text-slate-700"> — المؤشر الرسمي: {fm.exampleValue}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Official Lesson Data Tables */}
                      {lessonTables.map((tbl) => (
                        <div
                          key={tbl.id}
                          className="print-break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white"
                        >
                          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900">
                            {tbl.title}{' '}
                            <span className="font-mono font-normal text-slate-500">({tbl.pageRef})</span>
                          </div>
                          <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 text-slate-700">
                              <tr>
                                {tbl.headers.map((h, i) => (
                                  <th key={i} className="border-b border-slate-200 px-3 py-2 font-semibold">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {tbl.rows.map((r, rIdx) => (
                                <tr key={rIdx}>
                                  {r.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-3 py-1.5 text-slate-800">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </article>
                  );
                })}
              </div>
            )}

            {/* Part B: Integrated Unit Maps (Detailed + Blank Practice Sheet) */}
            {unitMaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display border-b-2 border-sky-200 pb-2 text-base font-extrabold text-sky-900">
                  خرائط الوحدة {unit.unitNumber} المدمجة ({unitMaps.length}{' '}
                  {includeBlankMaps ? 'توضيحية + صماء للتدريب' : 'خرائط توضيحية'})
                </h3>

                {unitMaps.map((mapTpl) => (
                  <div
                    key={mapTpl.id}
                    className="print-break-inside-avoid space-y-3 rounded-xl border border-sky-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <div className="font-display text-sm font-extrabold text-slate-900">
                          {mapTpl.title}
                        </div>
                        <p className="text-xs text-slate-600">{mapTpl.description}</p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-sky-800">
                        {mapTpl.bookMapRef}
                      </span>
                    </div>

                    {/* Reference Detailed Vector Map */}
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <DetailedTextbookMapSvg
                        template={mapTpl}
                        idPrefix={`booklet-${unit.id}`}
                        printFriendly
                      />
                    </div>

                    {/* Official Legend */}
                    <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <strong className="text-slate-800">مفتاح الخريطة:</strong>
                      {mapTpl.legend.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 text-slate-700">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-sm border border-slate-400"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.label}</span>
                        </span>
                      ))}
                    </div>

                    {/* Crisp Landmark Index Table so text never crowds the map */}
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="border-b border-slate-200 px-2.5 py-1.5 font-semibold">#</th>
                          <th className="border-b border-slate-200 px-2.5 py-1.5 font-semibold">المعلم على الخريطة</th>
                          <th className="border-b border-slate-200 px-2.5 py-1.5 font-semibold">التصنيف</th>
                          <th className="border-b border-slate-200 px-2.5 py-1.5 font-semibold">الدلالة المنهجية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mapTpl.features.map((feat, idx) => (
                          <tr key={feat.id}>
                            <td className="px-2.5 py-1.5 font-mono font-bold tabular-nums">{idx + 1}</td>
                            <td className="px-2.5 py-1.5 font-bold text-slate-900">{feat.label}</td>
                            <td className="px-2.5 py-1.5 text-slate-600">{feat.category}</td>
                            <td className="px-2.5 py-1.5 text-slate-800">{feat.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Blank Practice Map for Pen-and-Paper Offline Revision */}
                    {includeBlankMaps && (
                      <div className="print-break-inside-avoid mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-900">
                          <span>تمرين خريطة صماء (اكتب اسم كل رقم بالقلم ثم راجع الملحق الختامي):</span>
                          <span className="font-mono text-slate-500">{mapTpl.features.length} مواضع</span>
                        </div>
                        <div className="grid grid-cols-2 items-start gap-3">
                          <div>
                            <BlankPracticeMapSvg template={mapTpl} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 text-xs">
                            {mapTpl.features.map((feat, idx) => (
                              <div key={feat.id} className="border-b border-dashed border-slate-400 pb-1">
                                <span className="font-mono font-bold tabular-nums text-slate-900">
                                  {idx + 1}.{' '}
                                </span>
                                <span className="text-slate-400">__________________</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Part C: Unit Standalone Ministerial Comparative Tables */}
            {unitTables.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display border-b-2 border-amber-200 pb-2 text-base font-extrabold text-amber-900">
                  جداول المقارنات المستقلة للوحدة {unit.unitNumber} ({unitTables.length} جداول مربوطة بالمحافظات والدول)
                </h3>

                {unitTables.map((ct) => (
                  <div
                    key={ct.id}
                    className="print-break-inside-avoid overflow-hidden rounded-xl border border-amber-200 bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
                      <div className="font-display text-sm font-bold text-slate-900">{ct.title}</div>
                      <div className="font-mono text-[11px] text-amber-900">
                        {ct.pageRef} · وزاري: {ct.ministerialSlots}
                      </div>
                    </div>
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          {ct.headers.map((h, i) => (
                            <th key={i} className="border-b border-slate-200 px-3 py-2 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ct.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 text-slate-800">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800">
                      <strong>مفتاح التركيز الوزاري: </strong>
                      {ct.focusTip}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Part D: Unit Disambiguation Drills (Lookalike Pairs) */}
            {unitDisambigs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display border-b-2 border-indigo-200 pb-2 text-base font-extrabold text-indigo-900">
                  احذر الخلط الوزاري: التخيير والتمييز بين المتشابهات ({unitDisambigs.length} محاور)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {unitDisambigs.map((d) => (
                    <div
                      key={d.id}
                      className="print-break-inside-avoid rounded-lg border border-indigo-200 bg-white p-3 text-xs"
                    >
                      <div className="font-display font-bold text-slate-900">{d.title}</div>
                      <p className="mt-1 text-slate-600">
                        <strong>سبب التشابه: </strong>
                        {d.similarityReason}
                      </p>
                      <p className="mt-1 rounded bg-amber-50 p-2 text-amber-950">
                        <strong>الفرق الفاصل: </strong>
                        {d.decisiveDifference}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part E: Unit Causal Mind Map */}
            {!mapsTablesOnly && unitMindmap && (
              <div className="print-break-inside-avoid rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-display text-sm font-extrabold text-slate-900">
                  {unitMindmap.title}
                </h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {unitMindmap.steps.map((node, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                      <div className="font-bold text-sky-800">
                        {node.step}{' '}
                        <span className="font-mono text-[10px] font-normal text-slate-500">
                          ({node.ref})
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-700">{node.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part F: Unit Paper Self-Test Questions */}
            {includeQuizKey && !mapsTablesOnly && unitQuestions.length > 0 && (
              <div className="print-break-inside-avoid space-y-2.5 rounded-xl border border-slate-300 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-display text-sm font-extrabold text-slate-900">
                    اختبر نفسك ورقياً: أسئلة وزارية وتقويمية للوحدة {unit.unitNumber}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    (الإجابات في الملحق الختامي)
                  </span>
                </div>
                <ol className="space-y-2.5 text-xs">
                  {unitQuestions.map((item) => (
                    <li key={item.question.id} className="border-b border-slate-100 pb-2">
                      <div className="font-bold text-slate-900">
                        س{item.number}: {item.question.prompt}{' '}
                        <span className="font-mono text-[10px] font-normal text-slate-500">
                          [{item.question.sourceLabel} · {item.question.pageRef}]
                        </span>
                      </div>
                      {item.question.options && item.question.options.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 pr-3 text-slate-700">
                          {item.question.options.map((opt, idx) => (
                            <span key={idx}>○ {opt}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        );
      })}

      {/* ==================== APPENDIX: ANSWER KEY & BLANK MAP KEYS ==================== */}
      {(allPaperQuestions.length > 0 || (includeBlankMaps && includedMaps.length > 0)) && (
        <section className="print-break-before space-y-5">
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4">
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              ملحق التحقق الذاتي: مفاتيح إجابات الأسئلة والخرائط الصماء
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              للتصحيح الورقي الذاتي بعد إتمام الحل دون الحاجة للاتصال بالإنترنت.
            </p>
          </div>

          {allPaperQuestions.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-900">
                أولاً: مفاتيح إجابات الأسئلة التدريبية ({allPaperQuestions.length} سؤالاً)
              </div>
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">السؤال</th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">الوحدة</th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">الإجابة الصحيحة</th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">التعليل والصفحة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allPaperQuestions.map((item) => (
                    <tr key={item.question.id}>
                      <td className="px-3 py-1.5 font-mono font-bold tabular-nums">س{item.number}</td>
                      <td className="px-3 py-1.5 font-mono">و{item.unitNumber}</td>
                      <td className="px-3 py-1.5 font-bold text-emerald-900">
                        {item.question.correctAnswer}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700">
                        {item.question.explanation} ({item.question.pageRef})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {includeBlankMaps && includedMaps.length > 0 && (
            <div className="space-y-3">
              <div className="font-display text-sm font-bold text-slate-900">
                ثانياً: مفاتيح أرقام الخرائط الصماء ({includedMaps.length} خرائط)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {includedMaps.map((m) => (
                  <div
                    key={m.id}
                    className="print-break-inside-avoid rounded-lg border border-slate-200 bg-white p-3 text-xs"
                  >
                    <div className="font-bold text-sky-900">{m.title}</div>
                    <ol className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-800">
                      {m.features.map((feat, idx) => (
                        <li key={feat.id}>
                          <strong className="font-mono tabular-nums">{idx + 1}.</strong>{' '}
                          {feat.label.split('(')[0].trim()}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== FINAL COLOPHON ==================== */}
      <footer className="print-break-inside-avoid rounded-xl border border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-700">
        <div className="font-display font-bold text-slate-900">
          تمت بحمد الله الملزمة الشاملة الميسّرة — جغرافية الصف التاسع الأساسي (طبعة 2026)
        </div>
        <div className="mt-1">
          إعداد: <strong>الأستاذ إبراهيم أحمد متاش</strong> (هاتف:{' '}
          <span dir="ltr" className="font-mono font-bold">
            779424090
          </span>
          ) · مراجعة وتدقيق: <strong>الأستاذ مجدي محمد النوفاني</strong>
        </div>
      </footer>
    </div>
  );
};
