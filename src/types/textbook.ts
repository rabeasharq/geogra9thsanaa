export type PortalId = 'home' | 'units' | 'atlas' | 'map-lab' | 'study-guide' | 'training' | 'audit';

export type AtlasScope = 'yemen' | 'arab-world';

export type AtlasLayer =
  | 'topography'
  | 'water'
  | 'climate'
  | 'reserves'
  | 'population'
  | 'economy'
  | 'tourism';

export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'guided_essay'
  | 'map_identify';

export type CognitiveLevel = 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل';

export interface DataTable {
  id: string;
  title: string;
  pageRef: string;
  headers: string[];
  rows: string[][];
  note?: string;
}

export interface KeyFact {
  label: string;
  value: string;
  pageRef: string;
  unit?: string;
}

export interface LessonSection {
  id: string;
  title: string;
  pageRef: string;
  paragraphs: string[];
  bullets?: string[];
  tables?: DataTable[];
  formulas?: {
    name: string;
    expression: string;
    exampleValue?: string;
    pageRef: string;
  }[];
  errataAlert?: {
    page: number;
    originalText: string;
    clarification: string;
  };
}

export interface ConceptTerm {
  id: string;
  term: string;
  definition: string;
  enrichmentNote?: string;
  unitId: string;
  lessonId: string;
  pageRef: string;
  relatedLocationIds?: string[];
}

export interface LessonActivity {
  kind: 'class_activity' | 'enrichment' | 'thinking_card';
  title: string;
  prompt: string;
  pageRef: string;
  editorialNote?: string;
}

export interface InteractiveLabConfig {
  id: 'elevation-climate' | 'population-calc' | 'workforce-chart' | 'desalination-chart' | 'food-gap-calc';
  title: string;
  description: string;
  sourcePageRef: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  lessonNumber: number;
  title: string;
  pageRange: string;
  startPage: number;
  endPage: number;
  objectives: string[];
  quranOrHadith?: {
    source: string;
    textSummary: string;
    pageRef: string;
  }[];
  sections: LessonSection[];
  keyFacts: KeyFact[];
  concepts: ConceptTerm[];
  activities: LessonActivity[];
  evaluationPrompts: string[];
  interactiveLab?: InteractiveLabConfig;
  featuredImage?: {
    src: string;
    caption: string;
    pageRef: string;
  };
  atlasLocationIds: string[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  semester: 1 | 2;
  title: string;
  pageRange: string;
  objectives: string[];
  lessons: Lesson[];
  unitEvaluationPage: string;
  unitEvaluationSummary: string[];
}

export interface AtlasLocation {
  id: string;
  name: string;
  shortLabel?: string;
  scope: AtlasScope;
  layer: AtlasLayer;
  unitId: string;
  lessonId: string;
  pageRef: string;
  /** Real geographic coordinates [lat, lng] */
  lat: number;
  lng: number;
  /** Normalized SVG coordinates on 0..1000 x 0..600 map viewport */
  svgX: number;
  svgY: number;
  /** Smart non-overlapping label offset */
  labelDx?: number;
  labelDy?: number;
  elevationMeters?: number;
  summary: string;
  facts: string[];
  conceptIds: string[];
}

export type QuestionSourceCategory = 'textbook' | 'ministerial' | 'generated';

export interface QuizMapVisual {
  kind: 'yemen-point' | 'yemen-pipeline';
  point1: { lat: number; lng: number };
  point2?: { lat: number; lng: number };
  activePoint: 1 | 2;
  /** Optional custom end point when drawing oil export pipeline (Safer -> Red Sea) */
  pipelineEnd?: { lat: number; lng: number };
}

export interface QuizQuestion {
  id: string;
  unitId: string;
  lessonId?: string;
  pageRef: string;
  sourceLabel: string;
  sourceCategory?: QuestionSourceCategory;
  examModels?: string[];
  type: QuestionType;
  cognitiveLevel: CognitiveLevel;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  matchingPairs?: { left: string; right: string }[];
  explanation: string;
  relatedLocationId?: string;
  mapVisual?: QuizMapVisual;
}

export interface ErrataRecord {
  id: string;
  page: number;
  unitId: string;
  lessonId?: string;
  category: string;
  originalInBook: string;
  scientificClarification: string;
}

export interface BookmarkItem {
  id: string;
  type: 'lesson' | 'concept' | 'location';
  title: string;
  subtitle: string;
  targetPortal: PortalId;
  unitId: string;
  lessonId?: string;
  locationId?: string;
  createdAt: number;
}

export type StudyFocusScope = 'active-unit' | 'semester-1' | 'semester-2' | 'all';

export interface StudentProgress {
  lastLocation: {
    portal: PortalId;
    unitId: string;
    lessonId: string;
    atlasLocationId?: string;
    studyTab?: string;
  };
  studyFocus?: StudyFocusScope;
  completedLessons: string[];
  bookmarks: BookmarkItem[];
  quizAnswers: Record<
    string,
    {
      selected: string;
      isCorrect: boolean;
      answeredAt: number;
    }
  >;
}
