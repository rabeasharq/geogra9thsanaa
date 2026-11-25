import React, { useEffect, useMemo, useState } from 'react';
import {
  ALL_CONCEPTS,
  TEXTBOOK_UNITS,
  getStudyScopeLabel,
  getUnitById,
  matchesUnitScopeFilter,
  normalizeArabicSearch,
  resolveUnitFilterFromStudyFocus
} from '../data/bookIndex';
import { StudyFocusScope } from '../types/textbook';
import {
  COMPARISON_CATEGORIES,
  ComparisonCategoryId,
  MINISTERIAL_COMPARATIVE_TABLES
} from '../data/ministerialComparisons';
import { MinisterialDisambiguationLab } from './MinisterialDisambiguationLab';
import { SideBySideComparator } from './SideBySideComparator';
import { BookletScope, PrintableStudyBooklet } from './PrintableStudyBooklet';
import { BookletReaderModal } from './BookletReaderModal';
import {
  deleteEncryptedBookletPackage,
  EncryptedVaultMetadata,
  listEncryptedBookletPackages,
  loadEncryptedBookletPackage,
  saveEncryptedBookletPackage
} from '../utils/encryptedOfflineVault';
import { BookletTelemetryHandle } from '../hooks/useBookletTelemetry';
import {
  Printer,
  BookOpen,
  Compass,
  CheckSquare,
  Search,
  GitBranch,
  ArrowLeftRight,
  MapPin,
  FileText,
  Lock,
  ShieldCheck,
  Download,
  Maximize2,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';

export type StudyTab =
  | 'summary'
  | 'glossary'
  | 'tables'
  | 'disambiguation'
  | 'formulas'
  | 'mindmaps'
  | 'booklet';

interface StudyGuidePortalProps {
  initialUnitId?: string;
  initialTab?: StudyTab;
  studyFocus?: StudyFocusScope;
  activeUnitId?: string;
  telemetry: BookletTelemetryHandle;
  bookletScope: BookletScope;
  onChangeBookletScope: (scope: BookletScope) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
  onGoToTraining: (unitId: string, lessonId?: string) => void;
}

export const StudyGuidePortal: React.FC<StudyGuidePortalProps> = ({
  initialUnitId,
  initialTab,
  studyFocus = 'active-unit',
  activeUnitId = 'unit-1',
  telemetry,
  bookletScope,
  onChangeBookletScope,
  onGoToLesson,
  onGoToAtlas,
  onGoToTraining
}) => {
  const defaultUnitScope = initialUnitId || resolveUnitFilterFromStudyFocus(studyFocus, activeUnitId);

  const [activeTab, setActiveTab] = useState<StudyTab>(initialTab || 'summary');
  const [unitFilter, setUnitFilter] = useState<string>(defaultUnitScope);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategory, setTableCategory] = useState<ComparisonCategoryId>('all');
  const [expandedTableNotes, setExpandedTableNotes] = useState<Record<string, boolean>>({});
  const [includeBlankMaps, setIncludeBlankMaps] = useState<boolean>(true);
  const [includeQuizKey, setIncludeQuizKey] = useState<boolean>(true);
  const [readerModalOpen, setReaderModalOpen] = useState<boolean>(false);
  const [vaultPackages, setVaultPackages] = useState<EncryptedVaultMetadata[]>([]);
  const [savingEncrypted, setSavingEncrypted] = useState<boolean>(false);
  const [vaultMessage, setVaultMessage] = useState<string | null>(null);
  const [showAdvancedOffline, setShowAdvancedOffline] = useState<boolean>(false);

  useEffect(() => {
    void listEncryptedBookletPackages().then(setVaultPackages);
  }, []);

  React.useEffect(() => {
    if (initialUnitId) {
      setUnitFilter(initialUnitId);
      if (
        initialUnitId === 'unit-1' ||
        initialUnitId === 'unit-2' ||
        initialUnitId === 'unit-3' ||
        initialUnitId === 'unit-4'
      ) {
        onChangeBookletScope(initialUnitId);
      }
    } else {
      setUnitFilter(resolveUnitFilterFromStudyFocus(studyFocus, activeUnitId));
    }
  }, [initialUnitId, studyFocus, activeUnitId, onChangeBookletScope]);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const filteredUnits = useMemo(() => {
    return TEXTBOOK_UNITS.filter((u) => matchesUnitScopeFilter(u.id, unitFilter));
  }, [unitFilter]);

  const filteredConcepts = useMemo(() => {
    const q = normalizeArabicSearch(searchTerm);
    return ALL_CONCEPTS.filter((c) => {
      const unitOk = matchesUnitScopeFilter(c.unitId, unitFilter);
      const textOk =
        !q ||
        normalizeArabicSearch(c.term).includes(q) ||
        normalizeArabicSearch(c.definition).includes(q);
      return unitOk && textOk;
    });
  }, [unitFilter, searchTerm]);

  const allTables = useMemo(() => {
    const q = normalizeArabicSearch(tableSearch);
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
          normalizeArabicSearch(t.title).includes(q) ||
          normalizeArabicSearch(t.lessonTitle).includes(q) ||
          t.rows.some((r) => r.some((cell) => normalizeArabicSearch(cell).includes(q)))
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

  const matchingTablesBeforeCategory = useMemo(() => {
    const q = normalizeArabicSearch(tableSearch);
    return MINISTERIAL_COMPARATIVE_TABLES.filter((t) => {
      const unitOk = matchesUnitScopeFilter(t.unitId, unitFilter);
      if (!unitOk) return false;
      if (!q) return true;
      return (
        normalizeArabicSearch(t.title).includes(q) ||
        normalizeArabicSearch(t.focusTip).includes(q) ||
        t.rows.some((r) => r.some((cell) => normalizeArabicSearch(cell).includes(q)))
      );
    });
  }, [unitFilter, tableSearch]);

  const tableCategoryCounts = useMemo(() => {
    const counts: Record<ComparisonCategoryId, number> = {
      all: matchingTablesBeforeCategory.length,
      minerals_energy: 0,
      factories_industry: 0,
      airports_ports: 0,
      terrain_wadis_dams: 0,
      agri_coffee_wealth: 0,
      tourism_landmarks: 0,
      population_density: 0
    };
    for (const t of matchingTablesBeforeCategory) {
      counts[t.category] += 1;
    }
    return counts;
  }, [matchingTablesBeforeCategory]);

  const filteredMinisterialTables = useMemo(() => {
    if (tableCategory === 'all') return matchingTablesBeforeCategory;
    return matchingTablesBeforeCategory.filter((t) => t.category === tableCategory);
  }, [matchingTablesBeforeCategory, tableCategory]);

  const currentVaultMeta = vaultPackages.find((v) => v.scope === bookletScope);

  const handlePrintPdf = () => {
    void telemetry.recordBookletAction(bookletScope, 'pdf_print');
    window.print();
  };

  const handleSaveEncryptedOffline = async () => {
    setSavingEncrypted(true);
    try {
      const meta = await saveEncryptedBookletPackage(bookletScope);
      const updated = await listEncryptedBookletPackages();
      setVaultPackages(updated);
      await telemetry.recordBookletAction(bookletScope, 'encrypted_offline');
      setVaultMessage(
        `تم تشفير وحفظ الملزمة محلياً داخل التطبيق (${meta.algorithm} · ${(meta.byteSize / 1024).toFixed(1)} ك.ب · بصمة ${meta.sha256.slice(0, 8)}).`
      );
      setTimeout(() => setVaultMessage(null), 6500);
    } catch (err) {
      setVaultMessage(err instanceof Error ? err.message : 'تعذر حفظ النسخة المشفرة.');
    } finally {
      setSavingEncrypted(false);
    }
  };

  const handleVerifyEncryptedPackage = async (targetScope: BookletScope): Promise<string | null> => {
    try {
      const res = await loadEncryptedBookletPackage(targetScope);
      if (!res) return 'لا توجد نسخة مشفرة محفوظة لهذا النطاق.';
      return `تم فك التشفير والتحقق بنجاح (${res.meta.algorithm}) — ${res.payload.unitIds.length} وحدات، ${res.payload.mapIds.length} خرائط، ${res.payload.tableIds.length} جداول، البصمة ${res.meta.sha256.slice(0, 10)} سليمة 100%.`;
    } catch (err) {
      return err instanceof Error ? err.message : 'فشل التحقق من سلامة الملف المشفر.';
    }
  };

  const handleDeleteEncryptedPackage = async (targetScope: BookletScope) => {
    await deleteEncryptedBookletPackage(targetScope);
    setVaultPackages(await listEncryptedBookletPackages());
  };

  const tabs: { id: StudyTab; label: string }[] = [
    { id: 'summary', label: 'الخلاصة الشاملة للدروس' },
    { id: 'glossary', label: 'قاموس المفاهيم والتعريفات' },
    { id: 'tables', label: 'الجداول والمقارنات الوزارية' },
    { id: 'disambiguation', label: 'التخيير والتمييز بين المتشابهات' },
    { id: 'formulas', label: 'القوانين والأرقام القياسية' },
    { id: 'mindmaps', label: 'الخرائط الذهنية السببية' },
    { id: 'booklet', label: 'كتيّب الملزمة والطباعة (مع الخرائط)' }
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
              ملزمة منظمة تستوعب كافة تفاصيل الوحدات الأربع والدروس الـ 18 مدعّمة بالخرائط المدمجة والصماء والجداول المستقلة، إعداد أ. إبراهيم أحمد متاش ومراجعة أ. مجدي محمد النوفاني.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReaderModalOpen(true)}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-900 transition-colors hover:bg-sky-100"
            >
              <Maximize2 className="h-4 w-4" />
              <span>قراءة الملزمة في نافذة</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة / تصدير PDF</span>
            </button>
          </div>
        </div>

        {/* Unit Filter + View Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`min-h-[36px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
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
              aria-label="تصفية حسب النطاق أو الوحدة"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">جميع الوحدات (1 – 4)</option>
              <option value="semester-1">الفصل الأول (الوحدتان 1 و2)</option>
              <option value="semester-2">الفصل الثاني (الوحدتان 3 و4)</option>
              {TEXTBOOK_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  الوحدة {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scope Focus Reminder when filtered to a single unit/semester */}
        {unitFilter !== 'all' && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-700" />
              <span>
                تعرض الآن محتوى <strong>{getStudyScopeLabel(unitFilter)}</strong> فقط حتى لا تتشتت بدروس أخرى.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUnitFilter('all')}
              className="font-semibold text-sky-800 hover:underline"
            >
              عرض كل المنهج (1–4)
            </button>
          </div>
        )}
      </section>

      <div className="no-print space-y-6">
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
          {/* Interactive Side-by-Side Entity Comparator */}
          <SideBySideComparator
            unitFilter={unitFilter}
            onShowAllUnits={() => setUnitFilter('all')}
            onGoToLesson={onGoToLesson}
            onGoToAtlas={onGoToAtlas}
          />

          {/* High-Focus Standalone Ministerial Comparative Tables */}
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">
                    جداول المقارنات المستقلة والربط بالمحافظات والدول ({filteredMinisterialTables.length} جدولاً)
                  </h2>
                  <p className="mt-1 text-xs text-slate-700">
                    كل مجال مستقل بذاته (المعادن، المصانع، المطارات، النفط والغاز، السدود، الجزر، البن، المحميات، المعالم، الكثافة السكانية) ومربوط بمحافظته أو دولته لمنع الخلط الامتحاني.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('disambiguation')}
                  className="no-print inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>تدريب التخيير بين المتشابهات</span>
                </button>
              </div>

              {/* Standalone Category Filter Buttons */}
              <div className="no-print flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setTableCategory('all')}
                  className={`min-h-[36px] whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors ${
                    tableCategory === 'all'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-amber-200 bg-white text-slate-700 hover:bg-amber-100/70'
                  }`}
                >
                  الكل ({tableCategoryCounts.all})
                </button>
                {COMPARISON_CATEGORIES.map((cat) => {
                  const active = tableCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTableCategory(cat.id)}
                      className={`min-h-[36px] whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors ${
                        active
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-amber-200 bg-white text-slate-700 hover:bg-amber-100/70'
                      }`}
                    >
                      {cat.label} ({tableCategoryCounts[cat.id]})
                    </button>
                  );
                })}
              </div>

              <div className="no-print relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="ابحث في الجداول باسم المعدن أو المصنع أو المطار أو حقل النفط أو المحافظة (مثال: صافر، باجل، الريان، الملح، الغدير)..."
                  className="w-full rounded-lg border border-amber-200 bg-white py-2 pl-3 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {filteredMinisterialTables.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-600">
                <p>لا توجد جداول مطابقة للتصفية الحالية.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTableCategory('all');
                    setTableSearch('');
                    setUnitFilter('all');
                  }}
                  className="mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100"
                >
                  إعادة تعيين التصفية
                </button>
              </div>
            ) : (
              filteredMinisterialTables.map((ct) => {
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
                      <div className="no-print flex flex-wrap items-center gap-3">
                        {ct.atlasLocationId && (
                          <button
                            type="button"
                            onClick={() => onGoToAtlas(ct.atlasLocationId!)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-emerald-700 hover:underline"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            <span>عرض في الأطلس</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onGoToLesson(ct.unitId, ct.lessonId)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-sky-700 hover:underline"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>فتح الدرس</span>
                        </button>
                      </div>
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
              })
            )}
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
      </div>

      {/* PRINTABLE / OFFLINE BOOKLET PREVIEW & A4 PRINT HOST */}
      <div className={activeTab === 'booklet' ? 'space-y-5' : 'print-booklet-only'}>
        {activeTab === 'booklet' && (
          <section className="no-print space-y-4 rounded-xl border border-sky-200 bg-sky-50/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <FileText className="h-4 w-4 text-sky-700" />
                  <span>مُجهّز كتيّب الملزمة والنافذة الداخلية والحفظ المشفّر</span>
                </h2>
                <p className="mt-1 text-xs text-slate-700">
                  اختر نطاق الملزمة لقراءتها في نافذة مستقلة داخل التطبيق، أو حفظها مشفّرة داخل المخزن المحلي (AES-GCM-256) للعمل بدون إنترنت، أو طباعتها على ورق A4.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReaderModalOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-sky-300 bg-white px-3.5 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-sky-700" />
                  <span>نافذة قراءة داخل التطبيق</span>
                </button>
                <button
                  type="button"
                  disabled={savingEncrypted}
                  onClick={() => void handleSaveEncryptedOffline()}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
                >
                  <Lock className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{savingEncrypted ? 'جارٍ التشفير...' : 'حفظ مشفّر أوفلاين'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>طباعة / حفظ PDF (A4)</span>
                </button>
              </div>
            </div>

            {vaultMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-900">
                {vaultMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'full', label: 'الملزمة الشاملة الكاملة (الوحدات 1–4)' },
                  { id: 'unit-1', label: 'الوحدة 1: البيئة الطبيعية لليمن' },
                  { id: 'unit-2', label: 'الوحدة 2: السكان والاقتصاد في اليمن' },
                  { id: 'unit-3', label: 'الوحدة 3: البيئة الطبيعية للوطن العربي' },
                  { id: 'unit-4', label: 'الوحدة 4: السكان والاقتصاد في الوطن العربي' },
                  { id: 'maps-tables', label: 'كتيّب الخرائط والجداول المستقلة فقط' }
                ] as { id: BookletScope; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeBookletScope(opt.id)}
                  className={`min-h-[36px] whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    bookletScope === opt.id
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-sky-200/70 pt-3 text-xs text-slate-800">
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={includeBlankMaps}
                  onChange={(e) => setIncludeBlankMaps(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                <span>تضمين نسخ الخرائط الصماء للتدريب الورقي بالقلم ومفاتيحها</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={includeQuizKey}
                  onChange={(e) => setIncludeQuizKey(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                <span>تضمين الأسئلة الوزارية الختامية وملحق الإجابات</span>
              </label>
            </div>

            {/* Collapsible Advanced Offline Vault & Stats */}
            <div className="border-t border-sky-200/70 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-sky-700" />
                    <span>مرات التحميل:</span>
                    <strong className="font-mono tabular-nums text-slate-900">
                      {telemetry.publicStats.totalDownloads}
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                    <span>الحزم المشفرة على جهازك:</span>
                    <strong className="font-mono tabular-nums text-slate-900">
                      {vaultPackages.length}
                    </strong>
                  </span>
                </div>

                {vaultPackages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOffline((v) => !v)}
                    className="font-semibold text-sky-800 hover:underline"
                  >
                    {showAdvancedOffline
                      ? 'إخفاء خزنة الحفظ المشفّر'
                      : 'إدارة خزنة الحفظ المشفّر أوفلاين (متقدم)'}
                  </button>
                )}
              </div>

              {showAdvancedOffline && vaultPackages.length > 0 && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3 text-xs">
                  <div className="mb-2 flex items-center gap-1.5 font-bold text-emerald-900">
                    <Lock className="h-3.5 w-3.5" />
                    <span>خزنة الملفات المشفرة على جهازك ({vaultPackages.length}):</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vaultPackages.map((pkg) => (
                      <div
                        key={pkg.scope}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{pkg.title}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {pkg.algorithm} · {(pkg.byteSize / 1024).toFixed(1)} KB · SHA {pkg.sha256.slice(0, 8)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              const msg = await handleVerifyEncryptedPackage(pkg.scope);
                              if (msg) setVaultMessage(msg);
                            }}
                            className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-100"
                          >
                            فحص
                          </button>
                          <button
                            type="button"
                            aria-label={`حذف الحزمة المشفرة ${pkg.title}`}
                            onClick={() => void handleDeleteEncryptedPackage(pkg.scope)}
                            className="rounded border border-rose-200 bg-rose-50 p-1 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <PrintableStudyBooklet
          scope={bookletScope}
          includeBlankMaps={includeBlankMaps}
          includeQuizKey={includeQuizKey}
        />
      </div>

      {/* Dedicated In-App Booklet Reader Window */}
      <BookletReaderModal
        open={readerModalOpen}
        scope={bookletScope}
        includeBlankMaps={includeBlankMaps}
        includeQuizKey={includeQuizKey}
        savedVaultMeta={currentVaultMeta}
        stats={telemetry.publicStats}
        savingEncrypted={savingEncrypted}
        onChangeScope={onChangeBookletScope}
        onSaveEncrypted={handleSaveEncryptedOffline}
        onVerifyDecryption={() => handleVerifyEncryptedPackage(bookletScope)}
        onPrintPdf={handlePrintPdf}
        onClose={() => setReaderModalOpen(false)}
      />
    </main>
  );
};
