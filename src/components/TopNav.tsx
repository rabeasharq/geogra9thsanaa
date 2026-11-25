import React, { useEffect, useRef, useState } from 'react';
import { PortalId, StudyFocusScope } from '../types/textbook';
import { FONT_SCALE_STEPS, ReadingThemeMode } from '../hooks/useReadingPreferences';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  activePortal: PortalId;
  onSelectPortal: (portal: PortalId) => void;
  onOpenSearch: () => void;
  studyFocus: StudyFocusScope;
  onChangeStudyFocus: (focus: StudyFocusScope) => void;
  activeUnitNumber: number;
  themeMode: ReadingThemeMode;
  fontScale: number;
  onChangeThemeMode: (mode: ReadingThemeMode) => void;
  onChangeFontScale: (scale: number) => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onResetDisplayPrefs: () => void;
}

const NAV_ITEMS: { id: PortalId; label: string }[] = [
  { id: 'units', label: 'الدروس' },
  { id: 'atlas', label: 'الأطلس' },
  { id: 'map-lab', label: 'رسم الخرائط' },
  { id: 'study-guide', label: 'الملزمة' },
  { id: 'training', label: 'التدريبات' }
];

const THEME_OPTIONS: {
  id: ReadingThemeMode;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'light',
    label: 'الوضع النهاري',
    shortLabel: 'نهاري',
    desc: 'خلفية بيضاء واضحة للاستخدام اليومي',
    icon: Sun
  },
  {
    id: 'reading',
    label: 'وضع القراءة',
    shortLabel: 'قراءة',
    desc: 'لون ورقي دافئ مريح للعين عند المذاكرة الطويلة',
    icon: BookOpen
  },
  {
    id: 'night',
    label: 'الوضع الليلي',
    shortLabel: 'ليلي',
    desc: 'خلفية داكنة هادئة لتقليل إجهاد الإضاءة ليلاً',
    icon: Moon
  }
];

export const TopNav: React.FC<TopNavProps> = ({
  activePortal,
  onSelectPortal,
  onOpenSearch,
  studyFocus,
  onChangeStudyFocus,
  activeUnitNumber,
  themeMode,
  fontScale,
  onChangeThemeMode,
  onChangeFontScale,
  onIncreaseFont,
  onDecreaseFont,
  onResetDisplayPrefs
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayPopoverOpen, setDisplayPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!displayPopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setDisplayPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [displayPopoverOpen]);

  const handleNavClick = (portal: PortalId) => {
    onSelectPortal(portal);
    setMobileMenuOpen(false);
  };

  const ActiveThemeIcon =
    THEME_OPTIONS.find((t) => t.id === themeMode)?.icon ?? Sun;
  const activeThemeShort =
    THEME_OPTIONS.find((t) => t.id === themeMode)?.shortLabel ?? 'نهاري';

  const scopeTabs: { id: StudyFocusScope; short: string; label: string }[] = [
    { id: 'active-unit', short: `و${activeUnitNumber}`, label: `الوحدة الحالية (${activeUnitNumber})` },
    { id: 'semester-1', short: 'ف1', label: 'الفصل الأول (الوحدتان 1 و2)' },
    { id: 'semester-2', short: 'ف2', label: 'الفصل الثاني (الوحدتان 3 و4)' },
    { id: 'all', short: 'الكل', label: 'الكتاب كاملاً (1-4)' }
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[56px] max-w-[1400px] items-center justify-between gap-[6px] px-[10px] sm:gap-3 sm:px-6">
        {/* Zone 1: Brand Icon (Real Arab World Map) & Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex min-w-0 shrink items-center gap-[6px] whitespace-nowrap rounded-[8px] py-[4px] text-slate-900 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 sm:shrink-0 sm:gap-2.5"
        >
          <img
            src="/icon.svg"
            alt="أيقونة خارطة الوطن العربي"
            className="h-[28px] w-[28px] shrink-0 rounded-[8px] border border-sky-200/80 shadow-xs sm:h-[32px] sm:w-[32px]"
          />
          <span className="font-display max-w-[110px] truncate text-[14px] font-bold tracking-tight min-[400px]:max-w-none sm:text-[18px]">
            الجغرافيا التفاعلية
          </span>
        </button>

        {/* Zone 2: Primary navigation links (desktop) */}
        <nav aria-label="التنقل الرئيس" className="hidden items-center gap-4 lg:flex xl:gap-5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePortal === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 py-[16px] text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sky-600 ${
                  isActive
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Study Scope + Display Controls + PWA + Search + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-[4px] sm:gap-2">
          {/* Quick 1-Tap Study Scope Switcher (و1 | ف1 | ف2 | الكل) */}
          <div
            role="group"
            aria-label="نطاق المذاكرة السريع"
            className="flex items-center rounded-[8px] border border-slate-200 bg-slate-50 p-[2px]"
          >
            {scopeTabs.map((tab) => {
              const active = studyFocus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeStudyFocus(tab.id)}
                  title={tab.label}
                  aria-pressed={active}
                  className={`min-h-[30px] shrink-0 whitespace-nowrap rounded-[6px] px-[6px] py-[4px] text-[11px] font-bold transition-colors sm:px-[8px] ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.short}
                </button>
              );
            })}
          </div>

          {/* Quick 1-Tap Font Enlargement Controls (Desktop/Tablet) */}
          <div
            className="hidden items-center rounded-[8px] border border-slate-200 bg-slate-50 p-[2px] sm:flex"
            aria-label="التحكم في حجم الخط"
          >
            <button
              type="button"
              onClick={onDecreaseFont}
              disabled={fontScale <= 100}
              title="تصغير الخط"
              aria-label="تصغير حجم الخط"
              className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[12px] font-bold text-slate-700 transition-colors hover:bg-white disabled:opacity-40"
            >
              <ZoomOut className="h-[14px] w-[14px]" />
            </button>
            <span
              className="hidden px-[6px] font-mono text-[11px] font-bold tabular-nums text-slate-700 md:inline"
              title="حجم الخط الحالي"
            >
              {fontScale}%
            </span>
            <button
              type="button"
              onClick={onIncreaseFont}
              disabled={fontScale >= 160}
              title="تكبير الخط لمن يجد صعوبة في القراءة"
              aria-label="تكبير حجم الخط"
              className="inline-flex h-[32px] items-center justify-center gap-[4px] rounded-[6px] px-[8px] text-[12px] font-bold text-slate-800 transition-colors hover:bg-white disabled:opacity-40"
            >
              <ZoomIn className="h-[14px] w-[14px] text-sky-700" />
              <span className="hidden xl:inline">تكبير</span>
            </button>
          </div>

          {/* Reading / Night Mode & Font Size Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setDisplayPopoverOpen((v) => !v)}
              aria-expanded={displayPopoverOpen}
              aria-label="إعدادات وضع القراءة والوضع الليلي وحجم الخط"
              title="تبديل الوضع الليلي ووضع القراءة وتكبير الخط"
              className="inline-flex h-[32px] items-center gap-[4px] rounded-[8px] border border-slate-200 bg-slate-50 px-[8px] text-[12px] font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:h-[36px] sm:gap-[6px] sm:px-[10px]"
            >
              <ActiveThemeIcon className="h-[14px] w-[14px] text-amber-600" />
              <span className="font-mono text-[11px] font-bold text-slate-700 sm:hidden">A±</span>
              <span className="hidden sm:inline">{activeThemeShort}</span>
              <SlidersHorizontal className="hidden h-[12px] w-[12px] text-slate-400 sm:inline" />
            </button>

            {displayPopoverOpen && (
              <div
                role="dialog"
                aria-label="خيارات القراءة وتكبير الخط"
                className="fixed left-3 right-3 top-16 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:left-0 sm:right-auto sm:top-11 sm:w-80"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-display text-sm font-bold text-slate-900">
                    خيارات العرض والخط المريح
                  </span>
                  {(themeMode !== 'light' || fontScale !== 100) && (
                    <button
                      type="button"
                      onClick={onResetDisplayPrefs}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>إعادة الضبط</span>
                    </button>
                  )}
                </div>

                {/* Font Size Presets */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>حجم الخط ({fontScale}%)</span>
                    <span className="text-[11px] font-normal text-slate-500">لتسهيل القراءة</span>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {FONT_SCALE_STEPS.map((step) => {
                      const active = fontScale === step;
                      return (
                        <button
                          key={step}
                          type="button"
                          onClick={() => onChangeFontScale(step)}
                          className={`rounded-lg border py-1.5 font-mono text-xs font-bold transition-colors ${
                            active
                              ? 'border-sky-600 bg-sky-600 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {step}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Mode Selector */}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700">وضع القراءة والإضاءة</div>
                  <div className="mt-2 space-y-1.5">
                    {THEME_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = themeMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onChangeThemeMode(opt.id)}
                          className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-right transition-colors ${
                            active
                              ? 'border-sky-600 bg-sky-50 text-slate-900'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-sky-700' : 'text-slate-500'}`} />
                          <div>
                            <div className="text-xs font-bold">{opt.label}</div>
                            <div className="text-[11px] text-slate-500">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="البحث والمفضلة"
            className="inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center gap-[6px] whitespace-nowrap rounded-[8px] bg-slate-900 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:h-[36px] sm:w-auto sm:px-[14px]"
          >
            <Search className="h-[14px] w-[14px]" />
            <span className="hidden md:inline">البحث والمفضلة</span>
            <span className="hidden sm:inline md:hidden">بحث</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-slate-200 text-slate-700 hover:bg-slate-50 sm:h-[36px] sm:w-[36px] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet collapsible navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="قائمة الجوال"
          className="space-y-3 border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
        >
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`min-h-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activePortal === 'home'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              الرئيسية
            </button>
            {NAV_ITEMS.map((item) => {
              const isActive = activePortal === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`min-h-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Study Scope Selector */}
          <div className="border-t border-slate-100 pt-2.5">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-500">نطاق المذاكرة في الملزمة والتدريبات</div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {scopeTabs.map((tab) => {
                const active = studyFocus === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeStudyFocus(tab.id)}
                    className={`min-h-[36px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      active
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Quick Reading Modes & Font Zoom & PWA Install */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeThemeMode(opt.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      active
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.shortLabel}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onDecreaseFont}
                disabled={fontScale <= 100}
                aria-label="تصغير الخط"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-xs font-bold tabular-nums text-slate-700">{fontScale}%</span>
              <button
                type="button"
                onClick={onIncreaseFont}
                disabled={fontScale >= 160}
                aria-label="تكبير الخط"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2.5 sm:hidden">
            <PWAInstallButton />
          </div>
        </nav>
      )}
    </header>
  );
};
