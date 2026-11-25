import {
  ALL_LESSONS,
  QUIZ_QUESTIONS,
  TEXTBOOK_UNITS,
  getLessonById,
  getUnitById
} from '../data/bookIndex';
import {
  CognitiveLevel,
  Lesson,
  QuestionType,
  QuizQuestion,
  StudentProgress,
  Unit
} from '../types/textbook';

export interface WrongAttemptDetail {
  question: QuizQuestion;
  selectedAnswer: string;
  answeredAt: number;
}

export type ReviewPriority = 'urgent' | 'moderate' | 'mastered';

export interface LessonDiagnosis {
  unit: Unit;
  lesson: Lesson;
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  accuracyPct: number;
  priority: ReviewPriority;
  ministerialMistakes: number;
  mapMistakes: number;
  trueFalseMistakes: number;
  dominantMistakeLevel: CognitiveLevel | null;
  focusPages: string[];
  matchedSections: string[];
  matchedConcepts: string[];
  relatedLocationIds: string[];
  suggestions: string[];
  wrongAttempts: WrongAttemptDetail[];
}

export interface CognitiveBreakdownItem {
  level: CognitiveLevel;
  total: number;
  wrong: number;
  accuracyPct: number;
}

export interface TypeBreakdownItem {
  type: QuestionType;
  label: string;
  total: number;
  wrong: number;
}

export interface UnitDiagnosisSummary {
  unit: Unit;
  totalAnswered: number;
  wrongCount: number;
  accuracyPct: number;
  lessonsToReviewCount: number;
}

export interface StudentDiagnosisReport {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPct: number;
  lessonsNeedingReview: LessonDiagnosis[];
  masteredLessons: LessonDiagnosis[];
  unattemptedLessons: { unit: Unit; lesson: Lesson }[];
  cognitiveBreakdown: CognitiveBreakdownItem[];
  weakestCognitiveLevel: CognitiveBreakdownItem | null;
  typeBreakdown: TypeBreakdownItem[];
  unitSummaries: UnitDiagnosisSummary[];
  globalRecommendations: string[];
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'اختيار من متعدد',
  true_false: 'صواب أو خطأ',
  fill_blank: 'إكمال الفراغ',
  matching: 'توصيل ومطابقة',
  guided_essay: 'مقالي وتفكير ناقد',
  map_identify: 'تحديد على الخريطة الصماء'
};

const COGNITIVE_LEVELS: CognitiveLevel[] = ['تذكر', 'فهم', 'تطبيق', 'تحليل'];

function extractFirstPageNumber(pageRef: string): number | null {
  const match = pageRef.match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveQuestionLesson(question: QuizQuestion): { unit: Unit; lesson: Lesson } | null {
  const unit = getUnitById(question.unitId) ?? TEXTBOOK_UNITS[0];
  if (!unit) return null;

  if (question.lessonId) {
    const direct = getLessonById(question.lessonId);
    if (direct) {
      return { unit: getUnitById(direct.unitId) ?? unit, lesson: direct };
    }
  }

  const pageNum = extractFirstPageNumber(question.pageRef);
  if (pageNum !== null) {
    const byPage =
      unit.lessons.find((l) => pageNum >= l.startPage && pageNum <= l.endPage) ??
      ALL_LESSONS.find((l) => pageNum >= l.startPage && pageNum <= l.endPage);
    if (byPage) {
      return { unit: getUnitById(byPage.unitId) ?? unit, lesson: byPage };
    }
  }

  const fallbackLesson = unit.lessons[0];
  return fallbackLesson ? { unit, lesson: fallbackLesson } : null;
}

function normalizeArabicForMatch(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}

function extractLessonMatches(
  lesson: Lesson,
  wrongAttempts: WrongAttemptDetail[]
): { matchedSections: string[]; matchedConcepts: string[] } {
  if (wrongAttempts.length === 0) {
    return { matchedSections: [], matchedConcepts: [] };
  }

  const wrongTextBlob = normalizeArabicForMatch(
    wrongAttempts
      .map((a) => `${a.question.prompt} ${a.question.correctAnswer} ${a.question.explanation}`)
      .join(' ')
  );

  const matchedConcepts = lesson.concepts
    .filter((c) => {
      const termNorm = normalizeArabicForMatch(c.term).trim();
      if (termNorm.length < 3) return false;
      const tokens = termNorm.split(/\s+/).filter((t) => t.length >= 3);
      return wrongTextBlob.includes(termNorm) || tokens.some((t) => wrongTextBlob.includes(t));
    })
    .map((c) => `${c.term} (${c.pageRef})`)
    .slice(0, 4);

  const matchedSections = lesson.sections
    .filter((sec) => {
      const secNorm = normalizeArabicForMatch(sec.title);
      const tokens = secNorm
        .split(/[\s،:()\-]+/)
        .filter((t) => t.length >= 4 && !['الدرس', 'الوطن', 'العربي', 'اليمن'].includes(t));
      return tokens.some((t) => wrongTextBlob.includes(t));
    })
    .map((sec) => `${sec.title} (${sec.pageRef})`)
    .slice(0, 3);

  return { matchedSections, matchedConcepts };
}

function buildLessonSuggestions(
  lesson: Lesson,
  wrongAttempts: WrongAttemptDetail[],
  focusPages: string[],
  matchedSections: string[],
  matchedConcepts: string[],
  ministerialMistakes: number,
  mapMistakes: number,
  trueFalseMistakes: number,
  dominantMistakeLevel: CognitiveLevel | null
): string[] {
  const suggestions: string[] = [];

  if (focusPages.length > 0) {
    suggestions.push(
      `أعد قراءة الصفحات المرتبطة بأخطائك في هذا الدرس: (${focusPages.join('، ')}).`
    );
  } else {
    suggestions.push(`راجع ملخص الدرس كاملاً في الصفحات (ص ${lesson.pageRange}).`);
  }

  if (matchedSections.length > 0) {
    suggestions.push(`ركّز بشكل خاص على الفقرات: ${matchedSections.join(' — ')}.`);
  }

  if (matchedConcepts.length > 0) {
    suggestions.push(`تأكد من ضبط المفاهيم والمصطلحات التالية: ${matchedConcepts.join('، ')}.`);
  }

  if (ministerialMistakes > 0) {
    suggestions.push(
      `تنبيه وزاري: ${ministerialMistakes === 1 ? 'أحد الأخطاء ورد في' : `${ministerialMistakes} من أخطائك وردت في`} نماذج الامتحانات الوزارية الرسمية 2025–2026؛ ثبّت المعلومة جيداً.`
    );
  }

  if (mapMistakes > 0) {
    suggestions.push(
      'أخطأت في تحديد موقع على الخريطة الصماء؛ افتح الأطلس التفاعلي أو معمل رسم الخرائط وثبّت المواقع بصرياً.'
    );
  }

  if (trueFalseMistakes > 0) {
    suggestions.push(
      'انتبه لفخاخ الصواب والخطأ (عكس الاتجاهات أو تغيير الأرقام أو تبديل الأسماء المتشابهة) واستعن بقسم التخيير والتمييز بين المتشابهات.'
    );
  }

  if (dominantMistakeLevel === 'تذكر') {
    suggestions.push('طبيعة أخطائك تعتمد على الحفظ الدقيق للأرقام والحدود والأسماء؛ استعمل بطاقات الحقائق في الدرس.');
  } else if (dominantMistakeLevel === 'فهم') {
    suggestions.push('أخطاؤك تتركز في الفهم والتعليل؛ اربط كل ظاهرة جغرافية بأسبابها ونتائجها داخل الدرس.');
  } else if (dominantMistakeLevel === 'تطبيق' || dominantMistakeLevel === 'تحليل') {
    suggestions.push(
      lesson.interactiveLab
        ? `أخطاؤك في أسئلة التطبيق والتحليل؛ جرّب المختبر التفاعلي داخل هذا الدرس (${lesson.interactiveLab.title}) لفهم القاعدة عملياً.`
        : 'أخطاؤك في أسئلة التطبيق والتحليل؛ تدرّب على استنتاج العلاقات والقوانين بدلاً من الحفظ المجرد.'
    );
  }

  return suggestions;
}

export function diagnoseAnswers(
  quizAnswers: Record<string, { selected: string; isCorrect: boolean; answeredAt?: number }>,
  questionPool: QuizQuestion[] = QUIZ_QUESTIONS
): StudentDiagnosisReport {
  const questionById = new Map<string, QuizQuestion>();
  for (const q of questionPool) {
    questionById.set(q.id, q);
  }

  const lessonBuckets = new Map<
    string,
    {
      unit: Unit;
      lesson: Lesson;
      totalAnswered: number;
      correctCount: number;
      wrongAttempts: WrongAttemptDetail[];
    }
  >();

  const cognitiveMap = new Map<CognitiveLevel, { total: number; wrong: number }>(
    COGNITIVE_LEVELS.map((lvl) => [lvl, { total: 0, wrong: 0 }])
  );

  const typeMap = new Map<QuestionType, { total: number; wrong: number }>();

  let totalAnswered = 0;
  let totalCorrect = 0;
  let totalWrong = 0;

  for (const [questionId, ans] of Object.entries(quizAnswers)) {
    const question = questionById.get(questionId);
    if (!question) continue;

    const resolved = resolveQuestionLesson(question);
    if (!resolved) continue;

    totalAnswered += 1;
    if (ans.isCorrect) totalCorrect += 1;
    else totalWrong += 1;

    const cog = cognitiveMap.get(question.cognitiveLevel) ?? { total: 0, wrong: 0 };
    cog.total += 1;
    if (!ans.isCorrect) cog.wrong += 1;
    cognitiveMap.set(question.cognitiveLevel, cog);

    const tStat = typeMap.get(question.type) ?? { total: 0, wrong: 0 };
    tStat.total += 1;
    if (!ans.isCorrect) tStat.wrong += 1;
    typeMap.set(question.type, tStat);

    const existing = lessonBuckets.get(resolved.lesson.id) ?? {
      unit: resolved.unit,
      lesson: resolved.lesson,
      totalAnswered: 0,
      correctCount: 0,
      wrongAttempts: []
    };

    existing.totalAnswered += 1;
    if (ans.isCorrect) {
      existing.correctCount += 1;
    } else {
      existing.wrongAttempts.push({
        question,
        selectedAnswer: ans.selected,
        answeredAt: ans.answeredAt ?? Date.now()
      });
    }

    lessonBuckets.set(resolved.lesson.id, existing);
  }

  const lessonsNeedingReview: LessonDiagnosis[] = [];
  const masteredLessons: LessonDiagnosis[] = [];

  for (const bucket of lessonBuckets.values()) {
    const wrongCount = bucket.wrongAttempts.length;
    const accuracyPct =
      bucket.totalAnswered > 0 ? Math.round((bucket.correctCount / bucket.totalAnswered) * 100) : 100;

    const ministerialMistakes = bucket.wrongAttempts.filter(
      (w) => w.question.sourceCategory === 'ministerial'
    ).length;
    const mapMistakes = bucket.wrongAttempts.filter(
      (w) => w.question.type === 'map_identify'
    ).length;
    const trueFalseMistakes = bucket.wrongAttempts.filter(
      (w) => w.question.type === 'true_false'
    ).length;

    const levelCounts = new Map<CognitiveLevel, number>();
    for (const w of bucket.wrongAttempts) {
      levelCounts.set(w.question.cognitiveLevel, (levelCounts.get(w.question.cognitiveLevel) ?? 0) + 1);
    }
    let dominantMistakeLevel: CognitiveLevel | null = null;
    let maxLvlCount = 0;
    for (const [lvl, count] of levelCounts.entries()) {
      if (count > maxLvlCount) {
        maxLvlCount = count;
        dominantMistakeLevel = lvl;
      }
    }

    const focusPages = Array.from(
      new Set(bucket.wrongAttempts.map((w) => w.question.pageRef).filter(Boolean))
    );

    const relatedLocationIds = Array.from(
      new Set(
        bucket.wrongAttempts
          .map((w) => w.question.relatedLocationId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const { matchedSections, matchedConcepts } = extractLessonMatches(
      bucket.lesson,
      bucket.wrongAttempts
    );

    const priority: ReviewPriority =
      wrongCount === 0
        ? 'mastered'
        : wrongCount >= 2 || accuracyPct < 55 || ministerialMistakes > 0
          ? 'urgent'
          : 'moderate';

    const suggestions =
      wrongCount > 0
        ? buildLessonSuggestions(
            bucket.lesson,
            bucket.wrongAttempts,
            focusPages,
            matchedSections,
            matchedConcepts,
            ministerialMistakes,
            mapMistakes,
            trueFalseMistakes,
            dominantMistakeLevel
          )
        : [];

    const item: LessonDiagnosis = {
      unit: bucket.unit,
      lesson: bucket.lesson,
      totalAnswered: bucket.totalAnswered,
      correctCount: bucket.correctCount,
      wrongCount,
      accuracyPct,
      priority,
      ministerialMistakes,
      mapMistakes,
      trueFalseMistakes,
      dominantMistakeLevel,
      focusPages,
      matchedSections,
      matchedConcepts,
      relatedLocationIds,
      suggestions,
      wrongAttempts: bucket.wrongAttempts
    };

    if (wrongCount > 0) {
      lessonsNeedingReview.push(item);
    } else {
      masteredLessons.push(item);
    }
  }

  lessonsNeedingReview.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'urgent' ? -1 : 1;
    }
    if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
    if (b.ministerialMistakes !== a.ministerialMistakes) {
      return b.ministerialMistakes - a.ministerialMistakes;
    }
    return a.accuracyPct - b.accuracyPct;
  });

  masteredLessons.sort((a, b) => {
    if (a.unit.unitNumber !== b.unit.unitNumber) return a.unit.unitNumber - b.unit.unitNumber;
    return a.lesson.lessonNumber - b.lesson.lessonNumber;
  });

  const unattemptedLessons: { unit: Unit; lesson: Lesson }[] = [];
  for (const unit of TEXTBOOK_UNITS) {
    for (const lesson of unit.lessons) {
      if (!lessonBuckets.has(lesson.id)) {
        unattemptedLessons.push({ unit, lesson });
      }
    }
  }

  const cognitiveBreakdown: CognitiveBreakdownItem[] = COGNITIVE_LEVELS.map((level) => {
    const stat = cognitiveMap.get(level) ?? { total: 0, wrong: 0 };
    return {
      level,
      total: stat.total,
      wrong: stat.wrong,
      accuracyPct: stat.total > 0 ? Math.round(((stat.total - stat.wrong) / stat.total) * 100) : 100
    };
  }).filter((c) => c.total > 0);

  const weakestCognitiveLevel =
    cognitiveBreakdown
      .filter((c) => c.wrong > 0)
      .sort((a, b) => a.accuracyPct - b.accuracyPct || b.wrong - a.wrong)[0] ?? null;

  const typeBreakdown: TypeBreakdownItem[] = Array.from(typeMap.entries())
    .map(([type, stat]) => ({
      type,
      label: QUESTION_TYPE_LABELS[type],
      total: stat.total,
      wrong: stat.wrong
    }))
    .sort((a, b) => b.wrong - a.wrong || b.total - a.total);

  const unitSummaries: UnitDiagnosisSummary[] = TEXTBOOK_UNITS.map((unit) => {
    const unitBuckets = Array.from(lessonBuckets.values()).filter((b) => b.unit.id === unit.id);
    const uTotal = unitBuckets.reduce((sum, b) => sum + b.totalAnswered, 0);
    const uCorrect = unitBuckets.reduce((sum, b) => sum + b.correctCount, 0);
    const uWrong = uTotal - uCorrect;
    const lessonsToReviewCount = lessonsNeedingReview.filter((l) => l.unit.id === unit.id).length;
    return {
      unit,
      totalAnswered: uTotal,
      wrongCount: uWrong,
      accuracyPct: uTotal > 0 ? Math.round((uCorrect / uTotal) * 100) : 100,
      lessonsToReviewCount
    };
  }).filter((u) => u.totalAnswered > 0);

  const globalRecommendations: string[] = [];
  if (lessonsNeedingReview.length > 0) {
    const top = lessonsNeedingReview[0];
    globalRecommendations.push(
      `ابدأ أولاً بمراجعة «الدرس ${top.lesson.lessonNumber}: ${top.lesson.title}» (${top.unit.title}) لأن به ${top.wrongCount} ${top.wrongCount === 1 ? 'خطأ يحتاج تثبيتاً' : 'أخطاء تحتاج مراجعة'}.`
    );
  }
  if (weakestCognitiveLevel) {
    globalRecommendations.push(
      `أكثر أخطائك تتركز في أسئلة مستوى «${weakestCognitiveLevel.level}» (نسبة الدقة ${weakestCognitiveLevel.accuracyPct}% من أصل ${weakestCognitiveLevel.total} سؤالاً).`
    );
  }
  const mapTypeStat = typeMap.get('map_identify');
  if (mapTypeStat && mapTypeStat.wrong > 0) {
    globalRecommendations.push(
      `لديك ${mapTypeStat.wrong} ${mapTypeStat.wrong === 1 ? 'خطأ' : 'أخطاء'} في أسئلة الخريطة الصماء؛ خصّص 10 دقائق للتدرب في الأطلس التفاعلي ومعمل رسم الخرائط.`
    );
  }
  const tfStat = typeMap.get('true_false');
  if (tfStat && tfStat.wrong >= 2) {
    globalRecommendations.push(
      'تكررت بعض الأخطاء في أسئلة (صواب أو خطأ)؛ استخدم قسم «التخيير والتمييز بين المتشابهات» لكشف التبديلات الوزارية الشائعة.'
    );
  }

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    accuracyPct: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    lessonsNeedingReview,
    masteredLessons,
    unattemptedLessons,
    cognitiveBreakdown,
    weakestCognitiveLevel,
    typeBreakdown,
    unitSummaries,
    globalRecommendations
  };
}

export function diagnoseStudentProgress(progress: StudentProgress): StudentDiagnosisReport {
  return diagnoseAnswers(progress.quizAnswers, QUIZ_QUESTIONS);
}
