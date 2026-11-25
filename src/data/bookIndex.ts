import { UNIT_1_AND_2 } from './units1And2';
import { UNIT_3_AND_4 } from './units3And4';
import { ATLAS_LOCATIONS } from './atlasData';
import {
  QUIZ_QUESTIONS,
  CORE_TEXTBOOK_QUESTIONS,
  MINISTERIAL_QUESTIONS,
  GENERATED_QUESTIONS,
  MINISTERIAL_BATCH_STATS,
  MINISTERIAL_TOPIC_FREQUENCY,
  ERRATA_LOG
} from './quizData';
import { ConceptTerm, Lesson, Unit, AtlasLocation, QuizQuestion, StudyFocusScope } from '../types/textbook';

export const TEXTBOOK_UNITS: Unit[] = [...UNIT_1_AND_2, ...UNIT_3_AND_4];

export const ALL_LESSONS: Lesson[] = TEXTBOOK_UNITS.flatMap((u) => u.lessons);

export const ALL_CONCEPTS: ConceptTerm[] = ALL_LESSONS.flatMap((l) => l.concepts);

export const BOOK_FRONT_MATTER = {
  officialTitle: 'جغرافية الجمهورية اليمنية والوطن العربي',
  interactiveEditionTitle: 'كتاب الجغرافيا التفاعلي للصف التاسع الأساسي – الجمهورية اليمنية – طبعة 2026',
  sourceEdition: 'الطبعة الرسمية 1444هـ / 2023م (أُقرت في 14 يوليو 2021م)',
  totalPages: 112,
  frontMatterPages: 'ص 1 – 6 (الغلاف، النشيد الوطني، التصدير، المقدمة، الفهرس)',
  backMatterPages: 'ص 111 – 112 (قائمة المراجع السبعة وبيانات الإدارة العامة للمناهج)'
};

export function getUnitById(unitId: string): Unit | undefined {
  return TEXTBOOK_UNITS.find((u) => u.id === unitId);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === lessonId);
}

export function getAdjacentLessons(lessonId: string): { prev?: Lesson; next?: Lesson } {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ALL_LESSONS[idx - 1] : undefined,
    next: idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : undefined
  };
}

export function getLocationsForLesson(lessonId: string): AtlasLocation[] {
  const lesson = getLessonById(lessonId);
  if (!lesson) return [];
  const ordered: AtlasLocation[] = [];
  const seen = new Set<string>();
  for (const locId of lesson.atlasLocationIds) {
    const loc = ATLAS_LOCATIONS.find((l) => l.id === locId);
    if (loc && !seen.has(loc.id)) {
      ordered.push(loc);
      seen.add(loc.id);
    }
  }
  for (const loc of ATLAS_LOCATIONS) {
    if (loc.lessonId === lessonId && !seen.has(loc.id)) {
      ordered.push(loc);
      seen.add(loc.id);
    }
  }
  return ordered;
}

export function getQuestionsForLesson(lessonId: string): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter((q) => q.lessonId === lessonId);
}

export interface SearchHit {
  kind: 'lesson' | 'concept' | 'location' | 'question';
  id: string;
  title: string;
  snippet: string;
  unitId: string;
  lessonId?: string;
  locationId?: string;
  pageRef: string;
}

export function normalizeArabicSearch(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function resolveUnitFilterFromStudyFocus(
  studyFocus: StudyFocusScope | undefined,
  activeUnitId: string
): string {
  if (!studyFocus || studyFocus === 'active-unit') return activeUnitId || 'unit-1';
  if (studyFocus === 'semester-1') return 'semester-1';
  if (studyFocus === 'semester-2') return 'semester-2';
  return 'all';
}

export function matchesUnitScopeFilter(unitId: string, scopeFilter: string): boolean {
  if (!scopeFilter || scopeFilter === 'all') return true;
  if (scopeFilter === 'semester-1') return unitId === 'unit-1' || unitId === 'unit-2';
  if (scopeFilter === 'semester-2') return unitId === 'unit-3' || unitId === 'unit-4';
  return unitId === scopeFilter;
}

export function getStudyScopeLabel(scopeFilter: string): string {
  if (!scopeFilter || scopeFilter === 'all') return 'كل المنهج (الوحدات 1–4)';
  if (scopeFilter === 'semester-1') return 'الفصل الأول (اليمن: الوحدتان 1 و2)';
  if (scopeFilter === 'semester-2') return 'الفصل الثاني (الوطن العربي: الوحدتان 3 و4)';
  const u = getUnitById(scopeFilter);
  return u ? `الوحدة ${u.unitNumber}: ${u.title}` : 'كل المنهج';
}

export function searchBookContent(query: string): SearchHit[] {
  const normalized = normalizeArabicSearch(query);
  if (!normalized) return [];
  const hits: SearchHit[] = [];

  for (const lesson of ALL_LESSONS) {
    const textBlob = [
      lesson.title,
      ...lesson.objectives,
      ...lesson.sections.flatMap((s) => [
        s.title,
        ...s.paragraphs,
        ...(s.bullets ?? []),
        ...(s.tables ?? []).flatMap((t) => [t.title, ...t.rows.flat()])
      ]),
      ...lesson.keyFacts.map((f) => `${f.label} ${f.value}`)
    ].join(' ');
    if (normalizeArabicSearch(textBlob).includes(normalized)) {
      hits.push({
        kind: 'lesson',
        id: lesson.id,
        title: `الدرس ${lesson.lessonNumber}: ${lesson.title}`,
        snippet: lesson.sections[0]?.paragraphs[0]?.slice(0, 120) + '...',
        unitId: lesson.unitId,
        lessonId: lesson.id,
        pageRef: `ص ${lesson.pageRange}`
      });
    }
  }

  for (const concept of ALL_CONCEPTS) {
    if (
      normalizeArabicSearch(concept.term).includes(normalized) ||
      normalizeArabicSearch(concept.definition).includes(normalized)
    ) {
      hits.push({
        kind: 'concept',
        id: concept.id,
        title: concept.term,
        snippet: concept.definition,
        unitId: concept.unitId,
        lessonId: concept.lessonId,
        pageRef: concept.pageRef
      });
    }
  }

  for (const loc of ATLAS_LOCATIONS) {
    const locBlob = `${loc.name} ${loc.summary} ${loc.facts.join(' ')}`;
    if (normalizeArabicSearch(locBlob).includes(normalized)) {
      hits.push({
        kind: 'location',
        id: loc.id,
        title: loc.name,
        snippet: loc.summary,
        unitId: loc.unitId,
        lessonId: loc.lessonId,
        locationId: loc.id,
        pageRef: loc.pageRef
      });
    }
  }

  for (const question of QUIZ_QUESTIONS) {
    if (
      normalizeArabicSearch(question.prompt).includes(normalized) ||
      normalizeArabicSearch(question.explanation).includes(normalized)
    ) {
      hits.push({
        kind: 'question',
        id: question.id,
        title: question.prompt,
        snippet: question.explanation,
        unitId: question.unitId,
        lessonId: question.lessonId,
        locationId: question.relatedLocationId,
        pageRef: question.pageRef
      });
    }
  }

  return hits.slice(0, 30);
}

export { ATLAS_LOCATIONS, projectYemen, projectArabWorld } from './atlasData';
export {
  QUIZ_QUESTIONS,
  CORE_TEXTBOOK_QUESTIONS,
  MINISTERIAL_QUESTIONS,
  GENERATED_QUESTIONS,
  MINISTERIAL_BATCH_STATS,
  MINISTERIAL_TOPIC_FREQUENCY,
  ERRATA_LOG
};
