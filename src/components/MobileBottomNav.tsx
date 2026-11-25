import React from 'react';
import { PortalId } from '../types/textbook';
import { Home, BookOpen, Compass, FileText, CheckSquare } from 'lucide-react';

interface MobileBottomNavProps {
  activePortal: PortalId;
  onSelectPortal: (portal: PortalId) => void;
}

const MOBILE_NAV_ITEMS: {
  id: PortalId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'units', label: 'الدروس', icon: BookOpen },
  { id: 'atlas', label: 'الأطلس', icon: Compass },
  { id: 'study-guide', label: 'الملزمة', icon: FileText },
  { id: 'training', label: 'التدريبات', icon: CheckSquare }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePortal,
  onSelectPortal
}) => {
  return (
    <nav
      aria-label="التنقل السريع للجوال"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-[56px] max-w-lg grid-cols-5 items-stretch">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePortal === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPortal(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-[2px] px-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-sky-600 ${
                isActive
                  ? 'font-bold text-sky-700'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-[2px] w-[32px] rounded-b-full bg-sky-600"
                />
              )}
              <Icon className={`h-[20px] w-[20px] shrink-0 ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
              <span className="truncate text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
