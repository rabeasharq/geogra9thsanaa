import { useState, useEffect, useCallback } from 'react';
import { BookmarkItem, PortalId, StudentProgress, StudyFocusScope } from '../types/textbook';

const STORAGE_KEY = 'yemen_geo_grade9_2026_progress_v1';

const VALID_STUDY_FOCUS: StudyFocusScope[] = ['active-unit', 'semester-1', 'semester-2', 'all'];

const DEFAULT_PROGRESS: StudentProgress = {
  lastLocation: {
    portal: 'home',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    atlasLocationId: 'loc-yemen-center',
    studyTab: 'summary'
  },
  studyFocus: 'active-unit',
  completedLessons: [],
  bookmarks: [],
  quizAnswers: {}
};

function loadInitialProgress(): StudentProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    const studyFocus =
      parsed.studyFocus && VALID_STUDY_FOCUS.includes(parsed.studyFocus)
        ? parsed.studyFocus
        : 'active-unit';
    return {
      lastLocation: { ...DEFAULT_PROGRESS.lastLocation, ...(parsed.lastLocation ?? {}) },
      studyFocus,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      quizAnswers: parsed.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {}
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function useStudentProgress() {
  const [progress, setProgress] = useState<StudentProgress>(loadInitialProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [progress]);

  const updateLastLocation = useCallback(
    (patch: Partial<StudentProgress['lastLocation']>) => {
      setProgress((prev) => ({
        ...prev,
        lastLocation: { ...prev.lastLocation, ...patch }
      }));
    },
    []
  );

  const setStudyFocus = useCallback((studyFocus: StudyFocusScope) => {
    setProgress((prev) => ({
      ...prev,
      studyFocus
    }));
  }, []);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(lessonId);
      return {
        ...prev,
        completedLessons: exists
          ? prev.completedLessons.filter((id) => id !== lessonId)
          : [...prev.completedLessons, lessonId]
      };
    });
  }, []);

  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'createdAt'>) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.some((b) => b.id === item.id);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((b) => b.id !== item.id)
          : [{ ...item, createdAt: Date.now() }, ...prev.bookmarks]
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (id: string) => progress.bookmarks.some((b) => b.id === id),
    [progress.bookmarks]
  );

  const recordQuizAnswer = useCallback((questionId: string, selected: string, isCorrect: boolean) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [questionId]: { selected, isCorrect, answeredAt: Date.now() }
      }
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const setPortal = useCallback(
    (portal: PortalId) => {
      updateLastLocation({ portal });
    },
    [updateLastLocation]
  );

  return {
    progress,
    updateLastLocation,
    setStudyFocus,
    setPortal,
    toggleLessonComplete,
    toggleBookmark,
    isBookmarked,
    recordQuizAnswer,
    resetProgress
  };
}
