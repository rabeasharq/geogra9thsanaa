/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PortalId, BookmarkItem, AtlasScope } from './types/textbook';
import { getLessonById, getUnitById, SearchHit } from './data/bookIndex';
import { useStudentProgress } from './hooks/useStudentProgress';
import { useReadingPreferences } from './hooks/useReadingPreferences';
import { TopNav } from './components/TopNav';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { HomePortal } from './components/HomePortal';
import { UnitsPortal } from './components/UnitsPortal';
import { AtlasPortal } from './components/AtlasPortal';
import { MapDrawingLab } from './components/MapDrawingLab';
import { StudyGuidePortal, StudyTab } from './components/StudyGuidePortal';
import { TrainingPortal } from './components/TrainingPortal';
import { SearchAndBookmarksModal } from './components/SearchAndBookmarksModal';
import { AuditReportView } from './components/AuditReportView';
import { OfflineIndicator } from './components/PWAInstallButton';

class PortalErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-12 max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <h2 className="font-display text-lg font-bold text-rose-900">
            تعذر عرض هذا الجزء مؤقتاً
          </h2>
          <p className="mt-2 text-sm text-rose-800">
            حدث خطأ غير متوقع أثناء التحميل. يمكنك العودة إلى الصفحة الرئيسية والمتابعة.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            العودة إلى الرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const {
    progress,
    updateLastLocation,
    setPortal,
    toggleLessonComplete,
    toggleBookmark,
    isBookmarked,
    recordQuizAnswer,
    resetProgress
  } = useStudentProgress();

  const {
    themeMode,
    fontScale,
    setThemeMode,
    setFontScale,
    increaseFont,
    decreaseFont,
    resetPrefs
  } = useReadingPreferences();

  const [searchOpen, setSearchOpen] = useState(false);
  const [trainingFilter, setTrainingFilter] = useState<{ unitId?: string; lessonId?: string }>({});
  const [studyUnitFilter, setStudyUnitFilter] = useState<string | undefined>(undefined);
  const [studyTabFilter, setStudyTabFilter] = useState<StudyTab | undefined>(undefined);
  const [mapLabScope, setMapLabScope] = useState<AtlasScope | undefined>(undefined);

  const activePortal = progress.lastLocation.portal;
  const activeUnit = getUnitById(progress.lastLocation.unitId);
  const activeLesson = getLessonById(progress.lastLocation.lessonId);

  const openLesson = (unitId: string, lessonId: string) => {
    updateLastLocation({ portal: 'units', unitId, lessonId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAtlasLocation = (locationId: string) => {
    updateLastLocation({ portal: 'atlas', atlasLocationId: locationId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMapLab = (scope?: AtlasScope) => {
    setMapLabScope(scope);
    setPortal('map-lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStudyGuide = (unitId?: string, tab?: StudyTab) => {
    setStudyUnitFilter(unitId);
    setStudyTabFilter(tab);
    setPortal('study-guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTraining = (unitId?: string, lessonId?: string) => {
    setTrainingFilter({ unitId, lessonId });
    setPortal('training');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPortal = (portal: PortalId) => {
    if (portal === 'training') {
      setTrainingFilter({});
    }
    if (portal === 'study-guide') {
      setStudyUnitFilter(undefined);
      setStudyTabFilter(undefined);
    }
    if (portal === 'map-lab') {
      setMapLabScope(undefined);
    }
    setPortal(portal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchHit = (hit: SearchHit) => {
    if (hit.kind === 'location' && hit.locationId) {
      openAtlasLocation(hit.locationId);
    } else if (hit.kind === 'question') {
      openTraining(hit.unitId, hit.lessonId);
    } else if (hit.lessonId) {
      openLesson(hit.unitId, hit.lessonId);
    }
  };

  const handleSelectBookmark = (bm: BookmarkItem) => {
    if (bm.locationId) {
      openAtlasLocation(bm.locationId);
    } else if (bm.lessonId) {
      openLesson(bm.unitId, bm.lessonId);
    } else {
      handleSelectPortal(bm.targetPortal);
    }
  };

  const breadcrumbUnit =
    activePortal === 'units' && activeUnit
      ? `الوحدة ${activeUnit.unitNumber}: ${activeUnit.title}`
      : undefined;
  const breadcrumbLesson =
    activePortal === 'units' && activeLesson
      ? `الدرس ${activeLesson.lessonNumber}: ${activeLesson.title}`
      : undefined;
  const breadcrumbPage =
    activePortal === 'units' && activeLesson ? `ص ${activeLesson.pageRange}` : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <TopNav
        activePortal={activePortal}
        onSelectPortal={handleSelectPortal}
        onOpenSearch={() => setSearchOpen(true)}
        themeMode={themeMode}
        fontScale={fontScale}
        onChangeThemeMode={setThemeMode}
        onChangeFontScale={setFontScale}
        onIncreaseFont={increaseFont}
        onDecreaseFont={decreaseFont}
        onResetDisplayPrefs={resetPrefs}
      />

      <BreadcrumbBar
        portal={activePortal}
        unitTitle={breadcrumbUnit}
        lessonTitle={breadcrumbLesson}
        pageRef={breadcrumbPage}
        onNavigate={handleSelectPortal}
      />

      <div className="flex-1">
        <PortalErrorBoundary onReset={() => handleSelectPortal('home')}>
          {activePortal === 'home' && (
            <HomePortal
              progress={progress}
              onNavigatePortal={handleSelectPortal}
              onOpenLesson={openLesson}
              onOpenSearch={() => setSearchOpen(true)}
            />
          )}

          {activePortal === 'units' && (
            <UnitsPortal
              activeUnitId={progress.lastLocation.unitId}
              activeLessonId={progress.lastLocation.lessonId}
              progress={progress}
              onSelectLesson={openLesson}
              onToggleComplete={toggleLessonComplete}
              onToggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
              onGoToAtlas={openAtlasLocation}
              onGoToStudyGuide={(unitId) => openStudyGuide(unitId)}
              onGoToTraining={(unitId, lessonId) => openTraining(unitId, lessonId)}
            />
          )}

          {activePortal === 'atlas' && (
            <AtlasPortal
              initialLocationId={progress.lastLocation.atlasLocationId}
              onSelectLocationChange={(locId) => updateLastLocation({ atlasLocationId: locId })}
              onGoToLesson={openLesson}
              onGoToStudyGuide={(unitId) => openStudyGuide(unitId)}
              onGoToTraining={(unitId, lessonId) => openTraining(unitId, lessonId)}
              onGoToMapLab={(scope) => openMapLab(scope)}
            />
          )}

          {activePortal === 'map-lab' && (
            <MapDrawingLab initialScope={mapLabScope} onGoToLesson={openLesson} />
          )}

          {activePortal === 'study-guide' && (
            <StudyGuidePortal
              initialUnitId={studyUnitFilter}
              initialTab={studyTabFilter}
              onGoToLesson={openLesson}
              onGoToAtlas={openAtlasLocation}
              onGoToTraining={(unitId, lessonId) => openTraining(unitId, lessonId)}
            />
          )}

          {activePortal === 'training' && (
            <TrainingPortal
              initialUnitId={trainingFilter.unitId}
              initialLessonId={trainingFilter.lessonId}
              progress={progress}
              onRecordAnswer={recordQuizAnswer}
              onGoToLesson={openLesson}
              onGoToAtlas={openAtlasLocation}
              onGoToComparisons={(tab, unitId) => openStudyGuide(unitId, tab)}
            />
          )}

          {activePortal === 'audit' && (
            <AuditReportView
              onBackHome={() => handleSelectPortal('home')}
              onGoToLesson={openLesson}
            />
          )}
        </PortalErrorBoundary>
      </div>

      {/* Quiet Editorial Footer with Support Credit */}
      <footer className="no-print mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-600 sm:px-6">
          <div className="space-y-1">
            <div>
              كتاب الجغرافيا التفاعلي للصف التاسع الأساسي – الجمهورية اليمنية – طبعة 2026 (مستند إلى الكتاب المدرسي الرسمي 1444هـ / 2023م)
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-slate-800">
              <span>
                للتواصل والدعم: <span className="font-bold">الأستاذ إبراهيم أحمد متاش</span> ·{' '}
                <a
                  href="tel:779424090"
                  dir="ltr"
                  className="font-mono font-bold tabular-nums text-sky-700 hover:underline"
                >
                  779424090
                </a>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                المراجع: <span className="font-bold">الأستاذ مجدي عبدالله النوفاني</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSelectPortal('map-lab')}
              className="font-medium text-slate-700 hover:text-sky-700 hover:underline"
            >
              قسم رسم الخرائط
            </button>
            <button
              type="button"
              onClick={() => handleSelectPortal('audit')}
              className="font-medium text-slate-700 hover:text-sky-700 hover:underline"
            >
              تقرير التدقيق والمطابقة
            </button>
            <button
              type="button"
              onClick={() => handleSelectPortal('study-guide')}
              className="font-medium text-slate-700 hover:text-sky-700 hover:underline"
            >
              طباعة الملزمة
            </button>
          </div>
        </div>
      </footer>

      <SearchAndBookmarksModal
        open={searchOpen}
        bookmarks={progress.bookmarks}
        onClose={() => setSearchOpen(false)}
        onSelectSearchHit={handleSearchHit}
        onSelectBookmark={handleSelectBookmark}
        onRemoveBookmark={(bm) => toggleBookmark(bm)}
        onOpenAudit={() => handleSelectPortal('audit')}
        onResetProgress={resetProgress}
      />

      <OfflineIndicator />
    </div>
  );
}
