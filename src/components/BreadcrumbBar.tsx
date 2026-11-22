import React from 'react';
import { PortalId } from '../types/textbook';
import { ChevronLeft, BookOpen, Compass, FileText, CheckSquare, PenTool } from 'lucide-react';

interface BreadcrumbBarProps {
  portal: PortalId;
  unitTitle?: string;
  lessonTitle?: string;
  pageRef?: string;
  onNavigate: (portal: PortalId) => void;
}

const PORTAL_NAMES: Record<PortalId, string> = {
  home: 'الرئيسية',
  units: 'مدخل الوحدات والدروس',
  atlas: 'أطلس الرحلة الجغرافية',
  'map-lab': 'قسم تعلم رسم الخرائط وكتابة البيانات',
  'study-guide': 'الملزمة الشاملة',
  training: 'التدريب والتقويم',
  audit: 'تقرير التدقيق المنهجي'
};

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  portal,
  unitTitle,
  lessonTitle,
  pageRef,
  onNavigate
}) => {
  if (portal === 'home') return null;

  return (
    <div className="no-print border-b border-slate-200 bg-slate-50/90">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-medium text-slate-700 hover:text-sky-700"
          >
            الرئيسية
          </button>
          <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{PORTAL_NAMES[portal]}</span>
          {unitTitle && (
            <>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
              <span className="max-w-[200px] truncate text-slate-700 sm:max-w-none">{unitTitle}</span>
            </>
          )}
          {lessonTitle && (
            <>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-sky-700">{lessonTitle}</span>
            </>
          )}
          {pageRef && (
            <span className="text-slate-400">
              · <span className="font-mono tabular-nums text-slate-600">{pageRef}</span>
            </span>
          )}
        </nav>

        {/* Quick cross-portal links */}
        <div className="hidden items-center gap-2 text-xs lg:flex">
          <span className="text-slate-400">انتقال سريع:</span>
          {portal !== 'units' && (
            <button
              type="button"
              onClick={() => onNavigate('units')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/70"
            >
              <BookOpen className="h-3.5 w-3.5 text-sky-600" />
              <span>الوحدات</span>
            </button>
          )}
          {portal !== 'atlas' && (
            <button
              type="button"
              onClick={() => onNavigate('atlas')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/70"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>الأطلس</span>
            </button>
          )}
          {portal !== 'map-lab' && (
            <button
              type="button"
              onClick={() => onNavigate('map-lab')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/70"
            >
              <PenTool className="h-3.5 w-3.5 text-rose-600" />
              <span>رسم الخرائط</span>
            </button>
          )}
          {portal !== 'study-guide' && (
            <button
              type="button"
              onClick={() => onNavigate('study-guide')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/70"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>الملزمة</span>
            </button>
          )}
          {portal !== 'training' && (
            <button
              type="button"
              onClick={() => onNavigate('training')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/70"
            >
              <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
              <span>التدريبات</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
