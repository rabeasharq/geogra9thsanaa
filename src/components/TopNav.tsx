import React, { useState } from 'react';
import { PortalId } from '../types/textbook';
import { Search, Menu, X } from 'lucide-react';

interface TopNavProps {
  activePortal: PortalId;
  onSelectPortal: (portal: PortalId) => void;
  onOpenSearch: () => void;
}

const NAV_ITEMS: { id: PortalId; label: string }[] = [
  { id: 'units', label: 'الوحدات' },
  { id: 'atlas', label: 'الأطلس' },
  { id: 'map-lab', label: 'رسم الخرائط' },
  { id: 'study-guide', label: 'الملزمة' },
  { id: 'training', label: 'التدريبات' }
];

export const TopNav: React.FC<TopNavProps> = ({
  activePortal,
  onSelectPortal,
  onOpenSearch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (portal: PortalId) => {
    onSelectPortal(portal);
    setMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-display shrink-0 whitespace-nowrap text-base font-bold tracking-tight text-slate-900 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 sm:text-lg"
        >
          الجغرافيا التفاعلية
        </button>

        {/* Zone 2: Clean text navigation links (desktop) */}
        <nav aria-label="التنقل الرئيس" className="hidden items-center gap-6 md:flex">
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

        {/* Zone 3: Single primary action + mobile menu button */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <Search className="h-3.5 w-3.5" />
            <span>البحث والمفضلة</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile collapsible navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="قائمة الجوال"
          className="border-t border-slate-200 bg-white px-4 py-2 md:hidden"
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
        </nav>
      )}
    </header>
  );
};
