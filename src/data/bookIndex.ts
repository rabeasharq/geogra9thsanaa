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
import { ConceptTerm, Lesson, Unit, AtlasLocation, QuizQuestion } from '../types/textbook';

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
  const idSet = new Set(lesson.atlasLocationIds);
  return ATLAS_LOCATIONS.filter((loc) => loc.lessonId === lessonId || idSet.has(loc.id));
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

export function searchBookContent(query: string): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const normalized = q.toLowerCase();
  const hits: SearchHit[] = [];

  for (const lesson of ALL_LESSONS) {
    const textBlob = [
      lesson.title,
      ...lesson.objectives,
      ...lesson.sections.flatMap((s) => [s.title, ...s.paragraphs, ...(s.bullets ?? [])]),
      ...lesson.keyFacts.map((f) => `${f.label} ${f.value}`)
    ].join(' ');
    if (textBlob.toLowerCase().includes(normalized)) {
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
      concept.term.toLowerCase().includes(normalized) ||
      concept.definition.toLowerCase().includes(normalized)
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
    if (locBlob.toLowerCase().includes(normalized)) {
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
      question.prompt.toLowerCase().includes(normalized) ||
      question.explanation.toLowerCase().includes(normalized)
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
