import React, { useEffect, useRef, useState } from 'react';
import { PortalId } from '../types/textbook';
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
  themeMode: ReadingThemeMode;
  fontScale: number;
  onChangeThemeMode: (mode: ReadingThemeMode) => void;
  onChangeFontScale: (scale: number) => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onResetDisplayPrefs: () => void;
}

const NAV_ITEMS: { id: PortalId; label: string }[] = [
  { id: 'units', label: 'الوحدات' },
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

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        {/* Zone 1: Brand Icon (Real Arab World Map) & Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg py-1 text-slate-900 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600"
        >
          <img
            src="/icon.svg"
            alt="أيقونة خارطة الوطن العربي"
            className="h-8 w-8 shrink-0 rounded-lg border border-sky-200/80 shadow-xs"
          />
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">
            الجغرافيا التفاعلية
          </span>
        </button>

        {/* Zone 2: Primary navigation links (desktop) */}
        <nav aria-label="التنقل الرئيس" className="hidden items-center gap-4 lg:flex xl:gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activePortal === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sky-600 ${
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

        {/* Zone 3: Font Zoom + Theme Mode + PWA + Search + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Quick 1-Tap Font Enlargement Controls */}
          <div
            className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            aria-label="التحكم في حجم الخط"
          >
            <button
              type="button"
              onClick={onDecreaseFont}
              disabled={fontScale <= 100}
              title="تصغير الخط"
              aria-label="تصغير حجم الخط"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-slate-700 transition-colors hover:bg-white disabled:opacity-40"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span
              className="hidden px-1.5 font-mono text-[11px] font-bold tabular-nums text-slate-700 sm:inline"
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
              className="inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-bold text-slate-800 transition-colors hover:bg-white disabled:opacity-40"
            >
              <ZoomIn className="h-3.5 w-3.5 text-sky-700" />
              <span className="hidden xl:inline">تكبير</span>
            </button>
          </div>

          {/* Reading / Night Mode Selector Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setDisplayPopoverOpen((v) => !v)}
              aria-expanded={displayPopoverOpen}
              aria-label="إعدادات وضع القراءة والوضع الليلي وحجم الخط"
              title="تبديل الوضع الليلي ووضع القراءة وتكبير الخط"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              <ActiveThemeIcon className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">{activeThemeShort}</span>
              <SlidersHorizontal className="h-3 w-3 text-slate-400" />
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

          <PWAInstallButton compact />

          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:gap-2 sm:px-3.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">البحث والمفضلة</span>
            <span className="md:hidden">بحث</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

          {/* Mobile Quick Reading Modes */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5">
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
            <span className="font-mono text-xs font-bold text-slate-600">الخط: {fontScale}%</span>
          </div>
        </nav>
      )}
    </header>
  );
};
