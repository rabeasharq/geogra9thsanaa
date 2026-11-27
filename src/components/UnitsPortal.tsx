import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_CONCEPTS,
  TEXTBOOK_UNITS,
  getAdjacentLessons,
  getLessonById,
  getLocationsForLesson,
  getQuestionsForLesson,
  getUnitById
} from '../data/bookIndex';
import { WORD_ENRICHMENTS, MatchedEnrichmentData } from '../data/wordEnrichments';
import { BookmarkItem, Lesson, StudentProgress } from '../types/textbook';
import { InteractiveLessonLab } from './InteractiveLessonLab';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  Compass,
  FileText,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  List,
  Sparkles,
  Image as ImageIcon,
  X,
  Target
} from 'lucide-react';
import { diagnoseStudentProgress } from '../utils/studentDiagnosis';

interface UnitsPortalProps {
  activeUnitId: string;
  activeLessonId: string;
  progress: StudentProgress;
  onSelectLesson: (unitId: string, lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onToggleBookmark: (item: Omit<BookmarkItem, 'createdAt'>) => void;
  isBookmarked: (id: string) => boolean;
  onGoToAtlas: (locationId: string) => void;
  onGoToStudyGuide: (unitId: string) => void;
  onGoToTraining: (unitId: string, lessonId: string) => void;
}

interface ActivePopoverState {
  data: MatchedEnrichmentData;
  rect: { top: number; bottom: number; left: number; right: number; width: number };
}

type LessonTab = 'explain' | 'facts' | 'maps' | 'activities' | 'all';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isArabicLetterOrDigit(ch: string | undefined): boolean {
  if (!ch) return false;
  return /[\u0600-\u06FF0-9A-Za-z]/.test(ch);
}

function buildLessonTermIndex(lesson: Lesson): {
  lookup: Map<string, MatchedEnrichmentData>;
  sortedPhrases: string[];
} {
  const lookup = new Map<string, MatchedEnrichmentData>();

  const registerPhrase = (phrase: string, entry: MatchedEnrichmentData) => {
    const clean = phrase.trim();
    if (!clean || clean.length < 3) return;
    if (!lookup.has(clean)) {
      lookup.set(clean, entry);
    }
  };

  // Register lesson concepts first (official textbook definitions)
  for (const concept of lesson.concepts) {
    const matchingExternal = WORD_ENRICHMENTS.find(
      (w) =>
        w.term === concept.term ||
        w.aliases.includes(concept.term) ||
        concept.term.includes(w.term)
    );
    const data: MatchedEnrichmentData = {
      term: concept.term,
      bookDefinition: concept.definition,
      bookPageRef: concept.pageRef,
      externalEnrichment: matchingExternal?.externalEnrichment,
      whyItMatters: matchingExternal?.whyItMatters,
      atlasLocationId: matchingExternal?.atlasLocationId ?? concept.relatedLocationIds?.[0]
    };
    registerPhrase(concept.term, data);
  }

  // Register all external enrichment aliases & link back to official book concept if available
  for (const w of WORD_ENRICHMENTS) {
    const matchingBookConcept =
      lesson.concepts.find((c) => c.term === w.term || w.aliases.includes(c.term)) ??
      ALL_CONCEPTS.find((c) => c.term === w.term || w.aliases.includes(c.term));

    const data: MatchedEnrichmentData = {
      term: w.term,
      bookDefinition: matchingBookConcept?.definition,
      bookPageRef: matchingBookConcept?.pageRef,
      externalEnrichment: w.externalEnrichment,
      whyItMatters: w.whyItMatters,
      atlasLocationId: w.atlasLocationId ?? matchingBookConcept?.relatedLocationIds?.[0]
    };

    registerPhrase(w.term, data);
    for (const alias of w.aliases) {
      registerPhrase(alias, data);
    }
  }

  // Longest phrases first to avoid partial shadowing
  const sortedPhrases = Array.from(lookup.keys()).sort((a, b) => b.length - a.length);
  return { lookup, sortedPhrases };
}

interface RichTextbookTextProps {
  text: string;
  enabled: boolean;
  termIndex: {
    lookup: Map<string, MatchedEnrichmentData>;
    sortedPhrases: string[];
  };
  activeTerm?: string;
  onWordClick: (data: MatchedEnrichmentData, targetEl: HTMLElement) => void;
}

const RichTextbookText: React.FC<RichTextbookTextProps> = ({
  text,
  enabled,
  termIndex,
  activeTerm,
  onWordClick
}) => {
  const segments = useMemo(() => {
    if (!enabled || termIndex.sortedPhrases.length === 0) {
      return [{ type: 'text' as const, value: text }];
    }

    const pattern = new RegExp(
      `(${termIndex.sortedPhrases.map(escapeRegExp).join('|')})`,
      'g'
    );

    const result: Array<
      | { type: 'text'; value: string }
      | { type: 'term'; value: string; data: MatchedEnrichmentData }
    > = [];

    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const matchedStr = match[0];
      const startIdx = match.index;
      const endIdx = startIdx + matchedStr.length;

      // Ensure whole-word / non-partial prefix-suffix match on Arabic letters unless prefixed by "و" or "ب" or "ل"
      const prevChar = startIdx > 0 ? text[startIdx - 1] : undefined;
      const nextChar = endIdx < text.length ? text[endIdx] : undefined;
      const validStart =
        !isArabicLetterOrDigit(prevChar) ||
        prevChar === 'و' ||
        prevChar === 'ب' ||
        prevChar === 'ل' ||
        prevChar === 'ف' ||
        prevChar === 'ك';
      const validEnd = !isArabicLetterOrDigit(nextChar);

      const entry = termIndex.lookup.get(matchedStr);
      if (entry && validStart && validEnd) {
        if (startIdx > lastIdx) {
          result.push({ type: 'text', value: text.slice(lastIdx, startIdx) });
        }
        result.push({ type: 'term', value: matchedStr, data: entry });
        lastIdx = endIdx;
      }
    }

    if (lastIdx < text.length) {
      result.push({ type: 'text', value: text.slice(lastIdx) });
    }

    return result.length > 0 ? result : [{ type: 'text' as const, value: text }];
  }, [text, enabled, termIndex]);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <React.Fragment key={i}>{seg.value}</React.Fragment>;
        }
        const isCurrent = activeTerm === seg.data.term;
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(seg.data, e.currentTarget);
            }}
            title="اضغط لعرض التوضيح أو الإثراء العائم"
            className={`inline cursor-pointer rounded-xs border-b-2 border-dotted px-0.5 text-right font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
              isCurrent
                ? 'border-amber-700 bg-amber-100 text-amber-950'
                : 'border-amber-500/80 text-slate-900 hover:bg-amber-50'
            }`}
          >
            {seg.value}
          </button>
        );
      })}
    </>
  );
};

export const UnitsPortal: React.FC<UnitsPortalProps> = ({
  activeUnitId,
  activeLessonId,
  progress,
  onSelectLesson,
  onToggleComplete,
  onToggleBookmark,
  isBookmarked,
  onGoToAtlas,
  onGoToStudyGuide,
  onGoToTraining
}) => {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [lessonTab, setLessonTab] = useState<LessonTab>('explain');

  // Optional external enrichments MUST start collapsed/hidden by default
  const [showFeaturedImage, setShowFeaturedImage] = useState(false);
  const [expandedErrata, setExpandedErrata] = useState<Record<string, boolean>>({});
  const [expandedTableNotes, setExpandedTableNotes] = useState<Record<string, boolean>>({});
  const [expandedActivityNotes, setExpandedActivityNotes] = useState<Record<number, boolean>>({});

  // Click-word floating enrichment popover
  const [wordEnrichmentEnabled, setWordEnrichmentEnabled] = useState(true);
  const [activePopover, setActivePopover] = useState<ActivePopoverState | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const unit = getUnitById(activeUnitId) ?? TEXTBOOK_UNITS[0];
  const lesson = getLessonById(activeLessonId) ?? unit.lessons[0];
  const { prev, next } = getAdjacentLessons(lesson.id);
  const relatedLocations = getLocationsForLesson(lesson.id);
  const relatedQuestions = getQuestionsForLesson(lesson.id);
  const isDone = progress.completedLessons.includes(lesson.id);
  const lessonBookmarkId = `bm-lesson-${lesson.id}`;
  const bookmarked = isBookmarked(lessonBookmarkId);

  const activeLessonDiagnosis = useMemo(() => {
    const report = diagnoseStudentProgress(progress);
    return report.lessonsNeedingReview.find((item) => item.lesson.id === lesson.id) ?? null;
  }, [progress, lesson.id]);

  const termIndex = useMemo(() => buildLessonTermIndex(lesson), [lesson]);

  // Reset collapsed states, tab view, and close any floating popover whenever the lesson changes
  useEffect(() => {
    setLessonTab('explain');
    setShowFeaturedImage(false);
    setExpandedErrata({});
    setExpandedTableNotes({});
    setExpandedActivityNotes({});
    setActivePopover(null);
  }, [lesson.id]);

  // Close floating popover on Escape, scroll resize, or click outside
  useEffect(() => {
    if (!activePopover) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopover(null);
    };
    const handlePointerDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    const handleScroll = () => setActivePopover(null);

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activePopover]);

  const handleWordClick = (data: MatchedEnrichmentData, el: HTMLElement) => {
    // Toggle off if clicking the same active word
    if (activePopover && activePopover.data.term === data.term) {
      setActivePopover(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setActivePopover({
      data,
      rect: {
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        width: r.width
      }
    });
  };

  // Compute safe viewport position for the floating popover
  const popoverPositionStyle = useMemo<React.CSSProperties>(() => {
    if (!activePopover || typeof window === 'undefined') return {};
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(vw - 24, 380);
    const estimatedHeight = 250;

    // Center horizontally around the word, then clamp inside viewport
    const wordCenterX = activePopover.rect.left + activePopover.rect.width / 2;
    let left = wordCenterX - cardWidth / 2;
    left = Math.max(12, Math.min(vw - cardWidth - 12, left));

    // Prefer opening below the word; if too close to bottom edge, open above
    const spaceBelow = vh - activePopover.rect.bottom;
    let top: number;
    if (spaceBelow >= estimatedHeight || activePopover.rect.top < 200) {
      top = Math.min(vh - 200, activePopover.rect.bottom + 10);
    } else {
      top = Math.max(16, activePopover.rect.top - estimatedHeight - 10);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`
    };
  }, [activePopover]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Mobile 1-Row Quick Lesson Switcher + Index Toggle */}
      <div className="mb-4 flex items-center gap-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => prev && onSelectLesson(prev.unitId, prev.id)}
          disabled={!prev}
          aria-label="الدرس السابق"
          title={prev ? `السابق: ${prev.title}` : 'بداية المنهج'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="relative min-w-0 flex-1">
          <label htmlFor="mobile-lesson-switcher" className="sr-only">
            اختيار الدرس السريع
          </label>
          <select
            id="mobile-lesson-switcher"
            value={lesson.id}
            onChange={(e) => {
              const targetId = e.target.value;
              const targetUnit = TEXTBOOK_UNITS.find((u) =>
                u.lessons.some((l) => l.id === targetId)
              );
              if (targetUnit) {
                onSelectLesson(targetUnit.id, targetId);
                setSidebarOpenMobile(false);
              }
            }}
            className="h-10 w-full truncate rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 focus:border-sky-600 focus:outline-none"
          >
            {TEXTBOOK_UNITS.map((u) => (
              <optgroup key={u.id} label={`الوحدة ${u.unitNumber}: ${u.title}`}>
                {u.lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    د{l.lessonNumber}: {l.title} (ص {l.pageRange})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => next && onSelectLesson(next.unitId, next.id)}
          disabled={!next}
          aria-label="الدرس التالي"
          title={next ? `التالي: ${next.title}` : 'نهاية المنهج'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpenMobile((v) => !v)}
          aria-expanded={sidebarOpenMobile}
          title="فتح قائمة إنجاز الدروس"
          className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
            sidebarOpenMobile
              ? 'border-sky-600 bg-sky-600 text-white'
              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          <List className={`h-4 w-4 ${sidebarOpenMobile ? 'text-white' : 'text-sky-600'}`} />
          <span>فهرس</span>
          <span className="font-mono text-[10px] tabular-nums opacity-80">
            {progress.completedLessons.length}/18
          </span>
        </button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Units & Lessons Sidebar */}
        <aside
          aria-label="فهرس الوحدات والدروس"
          className={`${
            sidebarOpenMobile ? 'block' : 'hidden'
          } rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20 lg:col-span-4 lg:block xl:col-span-3`}
        >
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-sm font-bold text-slate-900">فهرس الكتاب المدرسي</h2>
            <span className="font-mono text-xs tabular-nums text-slate-500">
              {progress.completedLessons.length}/18
            </span>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto pl-1">
            {TEXTBOOK_UNITS.map((u) => (
              <div key={u.id} className="space-y-1.5">
                <div className="text-xs font-bold text-slate-500">
                  الوحدة {u.unitNumber} · ص {u.pageRange}
                </div>
                <div className="text-sm font-semibold text-slate-900">{u.title}</div>
                <ul className="space-y-1 pt-1">
                  {u.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    const completed = progress.completedLessons.includes(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectLesson(u.id, l.id);
                            setSidebarOpenMobile(false);
                          }}
                          className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-right text-xs transition-colors ${
                            active
                              ? 'bg-sky-600 font-semibold text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-start gap-2 leading-snug">
                            {completed ? (
                              <CheckCircle2
                                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                  active ? 'text-white' : 'text-emerald-600'
                                }`}
                              />
                            ) : (
                              <Circle
                                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                  active ? 'text-sky-200' : 'text-slate-300'
                                }`}
                              />
                            )}
                            <span>
                              {l.lessonNumber}. {l.title}
                            </span>
                          </span>
                          <span
                            className={`font-mono shrink-0 text-[11px] tabular-nums ${
                              active ? 'text-sky-100' : 'text-slate-400'
                            }`}
                          >
                            {l.pageRange}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Lesson Content Area */}
        <article className="space-y-6 lg:col-span-8 xl:col-span-9">
          {/* Lesson Header Card */}
          <header className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-500">
                الوحدة {unit.unitNumber}: {unit.title} · الدرس {lesson.lessonNumber} · المرجع الرسمي:{' '}
                <span className="font-mono font-semibold tabular-nums text-slate-700">
                  ص {lesson.pageRange}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onToggleBookmark({
                      id: lessonBookmarkId,
                      type: 'lesson',
                      title: `الدرس ${lesson.lessonNumber}: ${lesson.title}`,
                      subtitle: `الوحدة ${unit.unitNumber} · ص ${lesson.pageRange}`,
                      targetPortal: 'units',
                      unitId: unit.id,
                      lessonId: lesson.id
                    })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bookmarked
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
                  <span>{bookmarked ? 'في المفضلة' : 'إشارة مرجعية'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleComplete(lesson.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isDone
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isDone ? 'درس مكتمل' : 'تحديد كمكتمل'}</span>
                </button>
              </div>
            </div>

            <h1 className="font-display mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              الدرس {lesson.lessonNumber}: {lesson.title}
            </h1>

            {/* Focused Lesson Top Actions: Atlas Map Shortcut + Word Enrichment Toggle */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {relatedLocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onGoToAtlas(relatedLocations[0].id)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>خريطة هذا الدرس في الأطلس ({relatedLocations.length})</span>
                  </button>
                )}
              </div>

              {/* Word-level floating enrichment toggle */}
              <button
                type="button"
                onClick={() => {
                  setWordEnrichmentEnabled((v) => !v);
                  setActivePopover(null);
                }}
                aria-pressed={wordEnrichmentEnabled}
                className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  wordEnrichmentEnabled
                    ? 'border-amber-300 bg-amber-50/80 text-amber-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  {wordEnrichmentEnabled
                    ? 'الإثراء الفوري للكلمات: مفعّل'
                    : 'تفعيل الإثراء الفوري للكلمات'}
                </span>
              </button>
            </div>
          </header>

          {/* Clean Wrapping In-Lesson Tabs (Never clips on narrow mobile) */}
          <nav
            aria-label="أقسام الدرس التفاعلية"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
          >
            {(
              [
                { id: 'explain' as const, label: 'شرح الدرس' },
                {
                  id: 'facts' as const,
                  label: `المفاهيم والأرقام (${lesson.keyFacts.length + lesson.concepts.length})`
                },
                { id: 'maps' as const, label: `خرائط الدرس (${relatedLocations.length})` },
                {
                  id: 'activities' as const,
                  label: `الأنشطة والتقويم (${lesson.activities.length + lesson.evaluationPrompts.length})`
                },
                { id: 'all' as const, label: 'عرض الكل' }
              ] as const
            ).map((tab) => {
              const active = lessonTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLessonTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {(lessonTab === 'explain' || lessonTab === 'all') && (
            <>
              {/* Learning Objectives (Official Textbook) */}
              <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">أهداف الدرس المقررة</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              {lesson.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono mt-0.5 text-xs font-semibold tabular-nums text-sky-600">
                    0{idx + 1}.
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>

            {lesson.quranOrHadith && lesson.quranOrHadith.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-500">الشواهد القرآنية والنبوية في الدرس</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {lesson.quranOrHadith.map((q, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                      <div className="font-semibold text-slate-900">
                        {q.source} · <span className="font-mono text-slate-500">{q.pageRef}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{q.textSummary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Targeted Review Reminder when student navigated here from Training mistakes */}
          {activeLessonDiagnosis && (
            <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                  <div>
                    <div className="text-xs font-extrabold text-rose-900">
                      مقترحات المراجعة لهذا الدرس (بناءً على {activeLessonDiagnosis.wrongCount}{' '}
                      {activeLessonDiagnosis.wrongCount === 1 ? 'خطأ في التدريبات' : 'أخطاء في التدريبات'})
                    </div>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-800">
                      {activeLessonDiagnosis.suggestions.slice(0, 3).map((sug, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onGoToTraining(unit.id, lesson.id)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>إعادة اختبار الدرس بعد المراجعة</span>
                </button>
              </div>
            </section>
          )}

          {/* Featured Documentary Image: COLLAPSED BY DEFAULT & EXPLICITLY LABELED OUTSIDE TEXTBOOK */}
          {lesson.featuredImage && (
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-amber-800">
                      إثراء بصري توضيحي (خارج النص الرسمي للكتاب)
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                      صورة جغرافية مساندة للدرس ({lesson.featuredImage.pageRef}) — مطوية افتراضياً
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFeaturedImage((v) => !v)}
                  aria-expanded={showFeaturedImage}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
                >
                  <span>{showFeaturedImage ? 'إخفاء الصورة الإثرائية' : 'إظهار الصورة الإثرائية'}</span>
                  {showFeaturedImage ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {showFeaturedImage && (
                <figure className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="aspect-[16/7] w-full bg-slate-100">
                    <img
                      src={lesson.featuredImage.src}
                      alt={lesson.featuredImage.caption}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-amber-800">[إثراء بصري خارج الكتاب] </span>
                    {lesson.featuredImage.caption} ·{' '}
                    <span className="text-slate-400">{lesson.featuredImage.pageRef}</span>
                  </figcaption>
                </figure>
              )}
            </div>
          )}

          {/* Core Textbook Content Sections */}
          <section className="space-y-5">
            {lesson.sections.length >= 3 && (
              <nav
                aria-label="فهرس أقسام الدرس"
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs"
              >
                <span className="font-semibold text-slate-500">أقسام الدرس:</span>
                {lesson.sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() =>
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                  >
                    {idx + 1}. {sec.title}
                  </button>
                ))}
              </nav>
            )}

            {wordEnrichmentEnabled && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
                <span>
                  <strong className="text-slate-900">النص الرسمي للكتاب المقرر:</strong> الكلمات المسطّرة بخط منقّط تحتوي على توضيح أو إثراء عائم عند الضغط عليها، ثم يختفي بإغلاقه.
                </span>
              </div>
            )}

            {lesson.sections.map((sec) => {
              const errataOpen = Boolean(expandedErrata[sec.id]);

              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                    <h2 className="font-display text-lg font-bold text-slate-900">{sec.title}</h2>
                    <span className="font-mono text-xs tabular-nums text-slate-500">{sec.pageRef}</span>
                  </div>

                  <div className="mt-4 space-y-3 text-base leading-loose text-slate-800">
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx}>
                        <RichTextbookText
                          text={p}
                          enabled={wordEnrichmentEnabled}
                          termIndex={termIndex}
                          activeTerm={activePopover?.data.term}
                          onWordClick={handleWordClick}
                        />
                      </p>
                    ))}
                  </div>

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                          <span>
                            <RichTextbookText
                              text={b}
                              enabled={wordEnrichmentEnabled}
                              termIndex={termIndex}
                              activeTerm={activePopover?.data.term}
                              onWordClick={handleWordClick}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.formulas && sec.formulas.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {sec.formulas.map((f, i) => (
                        <div key={i} className="rounded-lg border border-sky-200 bg-sky-50/40 p-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{f.name}</span>
                            <span className="font-mono text-slate-500">{f.pageRef}</span>
                          </div>
                          <div className="mt-2 font-mono text-xs leading-relaxed font-semibold text-sky-900">
                            {f.expression}
                          </div>
                          {f.exampleValue && (
                            <div className="mt-2 text-xs text-slate-600">
                              القيمة المقررة:{' '}
                              <span className="font-semibold text-slate-900">{f.exampleValue}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.tables &&
                    sec.tables.map((tbl) => {
                      const tblNoteOpen = Boolean(expandedTableNotes[tbl.id]);
                      return (
                        <div key={tbl.id} className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
                            <span className="font-bold text-slate-900">{tbl.title}</span>
                            <span className="font-mono text-slate-500">{tbl.pageRef}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                              <thead className="bg-slate-50/70 text-xs text-slate-600">
                                <tr>
                                  {tbl.headers.map((h, i) => (
                                    <th
                                      key={i}
                                      className="border-b border-slate-200 px-4 py-2.5 font-semibold"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {tbl.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/60">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="px-4 py-2.5 text-slate-800">
                                        <RichTextbookText
                                          text={cell}
                                          enabled={wordEnrichmentEnabled}
                                          termIndex={termIndex}
                                          activeTerm={activePopover?.data.term}
                                          onWordClick={handleWordClick}
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {tbl.note && (
                            <div className="border-t border-slate-200 bg-amber-50/50 px-4 py-2 text-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedTableNotes((prevNotes) => ({
                                    ...prevNotes,
                                    [tbl.id]: !tblNoteOpen
                                  }))
                                }
                                className="inline-flex items-center gap-1.5 font-semibold text-amber-900 hover:underline"
                              >
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                                <span>
                                  {tblNoteOpen
                                    ? 'إخفاء ملاحظة التدقيق (خارج نص الكتاب)'
                                    : 'ملاحظة تدقيق خارج نص الكتاب — اضغط للإظهار'}
                                </span>
                              </button>
                              {tblNoteOpen && (
                                <p className="mt-1.5 leading-relaxed text-amber-950">{tbl.note}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Errata Alert: COLLAPSED BY DEFAULT & MARKED AS OUTSIDE TEXTBOOK */}
                  {sec.errataAlert && (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-amber-900">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                          <span>
                            ملاحظة تدقيق علمي (خارج النص الرسمي للكتاب · ص {sec.errataAlert.page}) — مطوية افتراضياً
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedErrata((prevMap) => ({
                              ...prevMap,
                              [sec.id]: !errataOpen
                            }))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-50"
                        >
                          <span>{errataOpen ? 'إخفاء الملاحظة' : 'إظهار التوضيح'}</span>
                          {errataOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {errataOpen && (
                        <div className="mt-2.5 border-t border-amber-200/80 pt-2.5 leading-relaxed text-amber-950">
                          <div className="text-amber-900">{sec.errataAlert.originalText}</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {sec.errataAlert.clarification}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Optional Interactive Simulation/Calculator (Already collapsed by default inside InteractiveLessonLab) */}
          {lesson.interactiveLab && <InteractiveLessonLab lab={lesson.interactiveLab} />}
            </>
          )}

          {/* Key Facts & Concepts Grid (Official Textbook) */}
          {(lessonTab === 'facts' || lessonTab === 'all') && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                المعلومات والأرقام المقررة
              </h3>
              <dl className="mt-4 divide-y divide-slate-100">
                {lesson.keyFacts.map((kf, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                    <dt className="text-slate-600">{kf.label}</dt>
                    <dd className="text-left font-semibold tabular-nums text-slate-900">
                      {kf.value}{' '}
                      <span className="font-mono text-[11px] font-normal text-slate-400">
                        ({kf.pageRef})
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-base font-bold text-slate-900">المفاهيم والمصطلحات</h3>
              <div className="mt-4 space-y-3">
                {lesson.concepts.map((c) => {
                  const cBmId = `bm-concept-${c.id}`;
                  const cSaved = isBookmarked(cBmId);
                  return (
                    <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{c.term}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-500">{c.pageRef}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onToggleBookmark({
                                id: cBmId,
                                type: 'concept',
                                title: c.term,
                                subtitle: `${c.definition.slice(0, 70)}...`,
                                targetPortal: 'units',
                                unitId: c.unitId,
                                lessonId: c.lessonId
                              })
                            }
                            aria-label={`حفظ مفهوم ${c.term}`}
                            className="text-slate-400 hover:text-amber-600"
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${cSaved ? 'fill-amber-500 text-amber-600' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{c.definition}</p>
                      {c.enrichmentNote && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50/90 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-950">
                          <span className="ml-1.5 inline-block rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                            إثراء
                          </span>
                          <span>{c.enrichmentNote}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          )}

          {/* Linked Atlas Locations */}
          {((lessonTab === 'maps' && relatedLocations.length > 0) ||
            (lessonTab === 'all' && relatedLocations.length > 0)) && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-slate-900">
                  المواقع والظواهر المرتبطة في أطلس الرحلة الجغرافية
                </h3>
                <span className="text-xs text-slate-500">انقر على أي موقع لفتحه على الخريطة</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLocations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onGoToAtlas(loc.id)}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-right transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Compass className="h-4 w-4 text-emerald-700" />
                        <span className="font-mono text-[11px] text-slate-500">{loc.pageRef}</span>
                      </div>
                      <div className="mt-2 text-sm font-bold text-slate-900">{loc.name}</div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{loc.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {lessonTab === 'maps' && relatedLocations.length === 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <Compass className="mx-auto h-7 w-7 text-emerald-600" />
              <h3 className="font-display mt-2 text-base font-bold text-slate-900">
                لا توجد نقاط أطلس منفردة مسجلة لهذا الدرس
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                يركز هذا الدرس على المفاهيم التحليلية أو الإحصائية، ويمكنك استعراض خرائط اليمن والوطن العربي الشاملة في الأطلس.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onGoToAtlas('loc-yemen-sanaa')}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>فتح الأطلس التفاعلي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLessonTab('explain')}
                  className="inline-flex min-h-[38px] items-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                >
                  العودة إلى شرح الدرس
                </button>
              </div>
            </section>
          )}

          {/* Activities & Thinking Card & Lesson Evaluation */}
          {(lessonTab === 'activities' || lessonTab === 'all') && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-base font-bold text-slate-900">
              الأنشطة وبطاقة التفكير وتقويم الدرس
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {lesson.activities.map((act, idx) => {
                const actNoteOpen = Boolean(expandedActivityNotes[idx]);
                return (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{act.title}</span>
                      <span className="font-mono text-slate-500">{act.pageRef}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{act.prompt}</p>
                    {act.editorialNote && (
                      <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedActivityNotes((prevNotes) => ({
                              ...prevNotes,
                              [idx]: !actNoteOpen
                            }))
                          }
                          className="text-[11px] font-semibold text-amber-800 hover:underline"
                        >
                          {actNoteOpen
                            ? 'إخفاء الملاحظة الإثرائية (خارج الكتاب)'
                            : 'توضيح منهجي خارج الكتاب — اضغط للإظهار'}
                        </button>
                        {actNoteOpen && (
                          <p className="mt-1 text-[11px] leading-relaxed text-amber-900">
                            {act.editorialNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span>تقويم الدرس ({lesson.pageRange})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onGoToTraining(unit.id, lesson.id)}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  حل تدريبات الدرس التفاعلية ({relatedQuestions.length})
                </button>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-700">
                {lesson.evaluationPrompts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {unit.unitEvaluationSummary.length > 0 && (
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-900">
                  <span>خلاصة تقويم الوحدة {unit.unitNumber}</span>
                  <span className="font-mono font-normal text-slate-500">
                    {unit.unitEvaluationPage}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-700">
                  {unit.unitEvaluationSummary.map((summaryItem, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                      <span>{summaryItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          )}

          {/* Guided Next Step Progression Card after finishing the lesson */}
          <section
            aria-label="الخطوة التالية بعد قراءة الدرس"
            className="rounded-xl border border-sky-200 bg-sky-50/50 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-extrabold text-slate-900">
                  خطوتك التالية بعد قراءة «{lesson.title}»
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  ثبّت ما قرأته بالاختبار أو راجع ملخص الوحدة قبل الانتقال للدرس التالي.
                </p>
              </div>
              {!isDone && (
                <button
                  type="button"
                  onClick={() => onToggleComplete(lesson.id)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>تحديد الدرس كمكتمل</span>
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onGoToTraining(unit.id, lesson.id)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <CheckSquare className="h-4 w-4" />
                <span>اختبر نفسك في تدريبات هذا الدرس ({relatedQuestions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => onGoToStudyGuide(unit.id)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50"
              >
                <FileText className="h-4 w-4 text-amber-700" />
                <span>ملخص ومقارنات الوحدة {unit.unitNumber}</span>
              </button>

              {relatedLocations.length > 0 && (
                <button
                  type="button"
                  onClick={() => onGoToAtlas(relatedLocations[0].id)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50"
                >
                  <Compass className="h-4 w-4 text-emerald-700" />
                  <span>خرائط الدرس في الأطلس ({relatedLocations.length})</span>
                </button>
              )}
            </div>
          </section>

          {/* Previous / Next Lesson Navigation */}
          <nav
            aria-label="التنقل بين الدروس"
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            {prev ? (
              <button
                type="button"
                onClick={() => onSelectLesson(prev.unitId, prev.id)}
                className="flex items-center gap-2 text-right text-sm font-medium text-slate-700 hover:text-sky-700"
              >
                <ChevronRight className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">الدرس السابق</div>
                  <div className="font-semibold">{prev.title}</div>
                </div>
              </button>
            ) : (
              <div />
            )}

            {next ? (
              <button
                type="button"
                onClick={() => onSelectLesson(next.unitId, next.id)}
                className="flex items-center gap-2 text-left text-sm font-medium text-slate-700 hover:text-sky-700"
              >
                <div>
                  <div className="text-[11px] text-slate-400">الدرس التالي</div>
                  <div className="font-semibold">{next.title}</div>
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <div className="text-xs font-medium text-emerald-700">نهاية دروس المنهج المقرر</div>
            )}
          </nav>
        </article>
      </div>

      {/* Floating Word/Topic Enrichment Popover (appears on click and dismisses cleanly) */}
      {activePopover && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`توضيح وإثراء: ${activePopover.data.term}`}
          style={popoverPositionStyle}
          className="fixed z-50 rounded-xl border border-slate-300 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h4 className="font-display text-sm font-extrabold text-slate-900">
                {activePopover.data.term}
              </h4>
              <p className="text-[11px] text-slate-500">نافذة توضيحية عائمة — اضغط خارجها أو × للإغلاق</p>
            </div>
            <button
              type="button"
              onClick={() => setActivePopover(null)}
              aria-label="إغلاق النافذة العائمة"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs leading-relaxed">
            {activePopover.data.bookDefinition && (
              <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-2.5">
                <div className="font-bold text-sky-900">
                  مقرر في الكتاب الرسمي ({activePopover.data.bookPageRef})
                </div>
                <p className="mt-1 text-slate-800">{activePopover.data.bookDefinition}</p>
              </div>
            )}

            {activePopover.data.externalEnrichment && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">
                <div className="flex items-center gap-1 font-bold text-amber-900">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                  <span>إثراء علمي خارج الكتاب المقرر (للفهم فقط – غير مطلوب في الامتحان)</span>
                </div>
                <p className="mt-1 text-slate-800">{activePopover.data.externalEnrichment}</p>
                {activePopover.data.whyItMatters && (
                  <p className="mt-1.5 font-medium text-amber-950">
                    الربط المنهجي: {activePopover.data.whyItMatters}
                  </p>
                )}
              </div>
            )}
          </div>

          {activePopover.data.atlasLocationId && (
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetId = activePopover.data.atlasLocationId!;
                  setActivePopover(null);
                  onGoToAtlas(targetId);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>عرض الموقع في الأطلس</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
