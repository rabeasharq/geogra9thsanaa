import React, { useMemo, useState } from 'react';
import { ALL_CONCEPTS, TEXTBOOK_UNITS, getUnitById } from '../data/bookIndex';
import { MINISTERIAL_COMPARATIVE_TABLES } from '../data/ministerialComparisons';
import { MinisterialDisambiguationLab } from './MinisterialDisambiguationLab';
import { Printer, BookOpen, Compass, CheckSquare, Search, GitBranch, ArrowLeftRight } from 'lucide-react';

export type StudyTab =
  | 'summary'
  | 'glossary'
  | 'tables'
  | 'disambiguation'
  | 'formulas'
  | 'mindmaps';

interface StudyGuidePortalProps {
  initialUnitId?: string;
  initialTab?: StudyTab;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
  onGoToTraining: (unitId: string, lessonId?: string) => void;
}

export const StudyGuidePortal: React.FC<StudyGuidePortalProps> = ({
  initialUnitId,
  initialTab,
  onGoToLesson,
  onGoToAtlas,
  onGoToTraining
}) => {
  const [activeTab, setActiveTab] = useState<StudyTab>(initialTab || 'summary');
  const [unitFilter, setUnitFilter] = useState<string>(initialUnitId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [expandedTableNotes, setExpandedTableNotes] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (initialUnitId) setUnitFilter(initialUnitId);
  }, [initialUnitId]);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const filteredUnits = useMemo(() => {
    return unitFilter === 'all'
      ? TEXTBOOK_UNITS
      : TEXTBOOK_UNITS.filter((u) => u.id === unitFilter);
  }, [unitFilter]);

  const filteredConcepts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ALL_CONCEPTS.filter((c) => {
      const unitOk = unitFilter === 'all' || c.unitId === unitFilter;
      const textOk =
        !q || c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q);
      return unitOk && textOk;
    });
  }, [unitFilter, searchTerm]);

  const allTables = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return filteredUnits
      .flatMap((u) =>
        u.lessons.flatMap((l) =>
          l.sections.flatMap((s) =>
            (s.tables ?? []).map((t) => ({
              ...t,
              unitId: u.id,
              unitNumber: u.unitNumber,
              lessonId: l.id,
              lessonTitle: l.title
            }))
          )
        )
      )
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.lessonTitle.toLowerCase().includes(q) ||
          t.rows.some((r) => r.some((cell) => cell.toLowerCase().includes(q)))
        );
      });
  }, [filteredUnits, tableSearch]);

  const allFormulas = useMemo(() => {
    return filteredUnits.flatMap((u) =>
      u.lessons.flatMap((l) =>
        l.sections.flatMap((s) =>
          (s.formulas ?? []).map((f) => ({
            ...f,
            unitId: u.id,
            unitNumber: u.unitNumber,
            lessonId: l.id,
            lessonTitle: l.title
          }))
        )
      )
    );
  }, [filteredUnits]);

  const filteredMinisterialTables = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return MINISTERIAL_COMPARATIVE_TABLES.filter((t) => {
      const unitOk = unitFilter === 'all' || t.unitId === unitFilter;
      if (!unitOk) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.focusTip.toLowerCase().includes(q) ||
        t.rows.some((r) => r.some((cell) => cell.toLowerCase().includes(q)))
      );
    });
  }, [unitFilter, tableSearch]);

  const handlePrintPdf = () => {
    window.print();
  };

  const tabs: { id: StudyTab; label: string }[] = [
    { id: 'summary', label: 'الخلاصة الشاملة للدروس' },
    { id: 'glossary', label: 'قاموس المفاهيم والتعريفات' },
    { id: 'tables', label: 'الجداول والمقارنات الوزارية' },
    { id: 'disambiguation', label: 'التخيير والتمييز بين المتشابهات' },
    { id: 'formulas', label: 'القوانين والأرقام القياسية' },
    { id: 'mindmaps', label: 'الخرائط الذهنية السببية' }
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Print Export Controls */}
      <section className="no-print rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              الملزمة الشاملة لكتاب الجغرافيا – الصف التاسع الأساسي
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              ملزمة منظمة تستوعب كافة تفاصيل الوحدات الأربع والدروس الـ 18 دون إسقاط، مع إحالات دقيقة للوحدة والدرس والصفحة وإمكانية الطباعة والتصدير إلى PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة / تصدير الملزمة PDF</span>
          </button>
        </div>

        {/* Unit Filter + View Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'bg-amber-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="تصفية حسب الوحدة"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">جميع الوحدات (1 – 4)</option>
              {TEXTBOOK_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  الوحدة {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Print-only Cover Header */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-800 pb-4 text-center">
        <h1 className="font-display text-2xl font-bold">
          الملزمة الشاملة – كتاب الجغرافيا للصف التاسع الأساسي (الجمهورية اليمنية – طبعة 2026)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          المرجع الرسمي: جغرافية الجمهورية اليمنية والوطن العربي (طبعة 1444هـ / 2023م)
        </p>
      </div>

      {/* TAB 1: FULL LESSON-BY-LESSON SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {filteredUnits.map((unit) => (
            <section
              key={unit.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    الفصل الدراسي {unit.semester === 1 ? 'الأول' : 'الثاني'} · ص {unit.pageRange}
                  </span>
                  <h2 className="font-display mt-1 text-xl font-extrabold text-slate-900">
                    الوحدة {unit.unitNumber}: {unit.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onGoToTraining(unit.id)}
                  className="no-print inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>تدريب شامل للوحدة {unit.unitNumber}</span>
                </button>
              </div>

              <div className="space-y-6">
                {unit.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="print-break-inside-avoid rounded-lg border border-slate-200 bg-slate-50/50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        الدرس {lesson.lessonNumber}: {lesson.title}{' '}
                        <span className="font-mono text-xs font-normal text-slate-500">
                          (ص {lesson.pageRange})
                        </span>
                      </h3>

                      <div className="no-print flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => onGoToLesson(unit.id, lesson.id)}
                          className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>صفحة الدرس</span>
                        </button>
                        {lesson.atlasLocationIds[0] && (
                          <button
                            type="button"
                            onClick={() => onGoToAtlas(lesson.atlasLocationIds[0])}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                          >
                            <Compass className="h-3.5 w-3.5" />
                            <span>الأطلس</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Structured Bullet Digest of All Lesson Sections */}
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-800">
                      {lesson.sections.map((sec) => (
                        <div key={sec.id}>
                          <div className="font-semibold text-slate-900">
                            • {sec.title}{' '}
                            <span className="font-mono text-[11px] font-normal text-slate-500">
                              [{sec.pageRef}]
                            </span>
                          </div>
                          {sec.paragraphs.map((p, idx) => (
                            <p key={idx} className="mt-1 pr-3 text-xs leading-relaxed text-slate-700">
                              {p}
                            </p>
                          ))}
                          {sec.bullets && (
                            <ul className="mt-1.5 space-y-1 pr-5 text-xs text-slate-700">
                              {sec.bullets.map((b, i) => (
                                <li key={i}>– {b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Key Figures Box inside Lesson Summary */}
                    {lesson.keyFacts.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-slate-200/80 pt-3 text-xs">
                        {lesson.keyFacts.map((kf, idx) => (
                          <div key={idx}>
                            <span className="text-slate-500">{kf.label}: </span>
                            <span className="font-semibold tabular-nums text-slate-900">{kf.value}</span>{' '}
                            <span className="font-mono text-[10px] text-slate-400">({kf.pageRef})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* TAB 2: GLOSSARY OF CONCEPTS & TERMS */}
      {activeTab === 'glossary' && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-slate-900">
              قاموس المفاهيم والمصطلحات المقررة ({filteredConcepts.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-2.5 right-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مصطلح أو تعريف..."
                className="w-full rounded-lg border border-slate-300 py-2 pr-9 pl-3 text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredConcepts.map((c) => (
              <div
                key={c.id}
                className="print-break-inside-avoid flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900">{c.term}</h3>
                    <span className="font-mono text-xs text-slate-500">{c.pageRef}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.definition}</p>
                </div>
                <div className="no-print mt-3 flex items-center gap-3 border-t border-slate-200/70 pt-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => onGoToLesson(c.unitId, c.lessonId)}
                    className="font-medium text-sky-700 hover:underline"
                  >
                    المرجع في الدرس
                  </button>
                  {c.relatedLocationIds && c.relatedLocationIds[0] && (
                    <button
                      type="button"
                      onClick={() => onGoToAtlas(c.relatedLocationIds![0])}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      عرض في الأطلس
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: COMPARATIVE TABLES & CLASSIFICATIONS */}
      {activeTab === 'tables' && (
        <div className="space-y-8">
          {/* High-Focus Ministerial Comparative Tables */}
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">
                    جداول المقارنات والربط بالمحافظات والدول ({filteredMinisterialTables.length} جدولاً)
                  </h2>
                  <p className="mt-1 text-xs text-slate-700">
                    كل معلم، جبل، وادٍ، ميناء، محمية، معدن، نهر وبحيرة مربوط 1-إلى-1 بمحافظته أو دولته لمنع الخلط الامتحاني.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('disambiguation')}
                  className="no-print inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>تدريب التخيير بين المتشابهات</span>
                </button>
              </div>
              <div className="no-print relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="ابحث في الجداول باسم المعلم أو المحافظة أو الدولة (مثال: عدن، شهارة، حضرموت، الغدير، تدمر، الفوسفات)..."
                  className="w-full rounded-lg border border-amber-200 bg-white py-2 pl-3 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {filteredMinisterialTables.map((ct) => {
              const unit = getUnitById(ct.unitId);
              return (
                <section
                  key={ct.id}
                  className="print-break-inside-avoid overflow-hidden rounded-xl border border-amber-200 bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 bg-amber-50/50 px-5 py-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">{ct.title}</h3>
                      <p className="text-xs text-slate-600">
                        {unit ? `الوحدة ${unit.unitNumber}: ${unit.title}` : ''} ·{' '}
                        <span className="font-mono">{ct.pageRef}</span> · مواضع الوزاري:{' '}
                        <strong className="font-mono text-amber-800">{ct.ministerialSlots}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onGoToLesson(ct.unitId, ct.lessonId)}
                      className="no-print text-xs font-medium text-sky-700 hover:underline"
                    >
                      فتح الدرس
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50/70 text-xs text-slate-600">
                        <tr>
                          {ct.headers.map((h, i) => (
                            <th key={i} className="border-b border-slate-200 px-4 py-2.5 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ct.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-slate-800">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-700">
                    <strong className="text-slate-900">مفتاح التركيز الوزاري: </strong>
                    {ct.focusTip}
                  </div>
                </section>
              );
            })}
          </div>

          {/* All Official Textbook Tables by Lesson */}
          <div className="space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900">
              جداول الدروس التفصيلية في الكتاب المدرسي ({allTables.length})
            </h2>
            {allTables.map((tbl) => (
              <section
                key={tbl.id}
                className="print-break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">{tbl.title}</h3>
                    <p className="text-xs text-slate-500">
                      الوحدة {tbl.unitNumber} · {tbl.lessonTitle} ·{' '}
                      <span className="font-mono">{tbl.pageRef}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onGoToLesson(tbl.unitId, tbl.lessonId)}
                    className="no-print text-xs font-medium text-sky-700 hover:underline"
                  >
                    فتح الدرس
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50/70 text-xs text-slate-600">
                      <tr>
                        {tbl.headers.map((h, i) => (
                          <th key={i} className="border-b border-slate-200 px-4 py-2.5 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tbl.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 text-slate-800">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tbl.note && (
                  <div className="border-t border-slate-200 bg-amber-50/50 px-5 py-2.5 text-xs text-amber-900">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTableNotes((prev) => ({
                          ...prev,
                          [tbl.id]: !prev[tbl.id]
                        }))
                      }
                      className="no-print font-semibold hover:underline"
                    >
                      {expandedTableNotes[tbl.id]
                        ? 'إخفاء ملاحظة التدقيق (خارج نص الكتاب)'
                        : 'ملاحظة تدقيق خارج نص الكتاب — اضغط للإظهار'}
                    </button>
                    {expandedTableNotes[tbl.id] && <p className="mt-1.5 leading-relaxed">{tbl.note}</p>}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3.5: MINISTERIAL LOOKALIKE CHOICE & DISAMBIGUATION LAB */}
      {activeTab === 'disambiguation' && (
        <MinisterialDisambiguationLab
          unitFilter={unitFilter}
          onChangeUnitFilter={setUnitFilter}
          onGoToLesson={onGoToLesson}
          onGoToAtlas={onGoToAtlas}
        />
      )}

      {/* TAB 4: FORMULAS & KEY METRICS */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              المعادلات والقوانين الرياضية والجغرافية المقررة
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {allFormulas.map((f, idx) => (
                <div
                  key={idx}
                  className="print-break-inside-avoid rounded-lg border border-sky-200 bg-sky-50/40 p-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{f.name}</span>
                    <span className="font-mono text-slate-500">
                      الوحدة {f.unitNumber} · {f.pageRef}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-xs leading-relaxed font-semibold text-sky-900">
                    {f.expression}
                  </div>
                  {f.exampleValue && (
                    <div className="mt-2 text-xs text-slate-700">
                      المؤشر الرسمي: <span className="font-bold">{f.exampleValue}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              سجل الأرقام والحقائق الإحصائية المقررة حسب الوحدة
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {filteredUnits.map((u) => (
                <div key={u.id} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    الوحدة {u.unitNumber}: {u.title}
                  </h3>
                  <dl className="mt-3 divide-y divide-slate-100 text-xs">
                    {u.lessons.flatMap((l) =>
                      l.keyFacts.map((kf, i) => (
                        <div key={`${l.id}-${i}`} className="flex justify-between gap-2 py-2">
                          <dt className="text-slate-600">{kf.label}</dt>
                          <dd className="text-left font-semibold tabular-nums text-slate-900">
                            {kf.value} <span className="font-mono text-slate-400">({kf.pageRef})</span>
                          </dd>
                        </div>
                      ))
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: CAUSE-EFFECT MIND MAPS */}
      {activeTab === 'mindmaps' && (
        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              الخرائط الذهنية والعلاقات السببية (ربط وحدات الكتاب)
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              توضح هذه المخططات التسلسل الجغرافي الذي بُني عليه المنهج: كيف تؤثر العوامل الطبيعية على السكان والنشاط الاقتصادي.
            </p>
          </div>

          {/* Mind Map 1: Yemen Physical -> Human -> Economic */}
          <div className="print-break-inside-avoid rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
              <GitBranch className="h-4 w-4 text-sky-600" />
              <span>الخريطة الذهنية (1): الترابط السببي في جغرافية الجمهورية اليمنية (الوحدتان 1 و2)</span>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {[
                {
                  step: '1. الموقع الاستراتيجي',
                  ref: 'ص 8–11',
                  detail: '12°–19°N على باب المندب والبحر الأحمر وبحر العرب · 154+ جزيرة.'
                },
                {
                  step: '2. التضاريس المتنوعة',
                  ref: 'ص 13–15',
                  detail: 'تهامة والسهل الجنوبي ← المرتفعات الغربية (3670م) ← الهضاب الشرقية.'
                },
                {
                  step: '3. المناخ والمطر',
                  ref: 'ص 17–19',
                  detail: 'رياح موسمية صيفية جنوبية غربية + انخفاض 1°م لكل 150م ارتفاعاً.'
                },
                {
                  step: '4. المياه والنبات والمحميات',
                  ref: 'ص 20–32',
                  detail: 'أودية بأربعة اتجاهات + غطاء نباتي متنوع + 6 محميات (سقطرى، حوف، عتمة...).'
                },
                {
                  step: '5. تركز السكان والاقتصاد',
                  ref: 'ص 36–55',
                  detail: 'تركز السكان في المرتفعات المطيرة (تعز وإب) والسهول · زراعة البن، موانئ، نفط، سياحة.'
                }
              ].map((node, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="text-xs font-bold text-sky-700">{node.step}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400">{node.ref}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mind Map 2: Arab World */}
          <div className="print-break-inside-avoid rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
              <GitBranch className="h-4 w-4 text-emerald-600" />
              <span>الخريطة الذهنية (2): الترابط المكاني والاقتصادي في الوطن العربي (الوحدتان 3 و4)</span>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {[
                {
                  step: '1. الموقع والممرات',
                  ref: 'ص 60–64',
                  detail: '22 دولة · 13.3 مليون كم² (71% أفريقي، 29% آسيوي) · هرمز، باب المندب، السويس، جبل طارق.'
                },
                {
                  step: '2. التضاريس الكبرى',
                  ref: 'ص 66–70',
                  detail: 'جبال التوائية (أطلس 4165م) وانكسارية وبركانية + هضبتان + سهول فيضية وساحلية.'
                },
                {
                  step: '3. المناخ والأمن المائي',
                  ref: 'ص 72–83',
                  detail: 'غلبة الإقليم الصحراوي + 5% فقط من المياه المتجددة عالمياً ← حاجة للتحلية والترشيد.'
                },
                {
                  step: '4. السكان والفجوة الغذائية',
                  ref: 'ص 88–96',
                  detail: '419.78 مليون نسمة (61% أفريقيا، 39% آسيا) · نمو 24‰ ← فجوة غذائية تتطلب توسعاً أفقياً ورأسياً.'
                },
                {
                  step: '5. التكامل الاقتصادي',
                  ref: 'ص 98–109',
                  detail: 'نفط (>26%) وغاز (>13%) ومعادن + شبكات نقل وموانئ + 4 أنماط سياحية.'
                }
              ].map((node, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="text-xs font-bold text-emerald-700">{node.step}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400">{node.ref}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
