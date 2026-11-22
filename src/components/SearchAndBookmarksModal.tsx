import React, { useMemo, useState } from 'react';
import { searchBookContent, SearchHit } from '../data/bookIndex';
import { BookmarkItem } from '../types/textbook';
import { Search, X, Bookmark, Trash2, BookOpen, Compass, CheckSquare, ShieldCheck } from 'lucide-react';

interface SearchAndBookmarksModalProps {
  open: boolean;
  bookmarks: BookmarkItem[];
  onClose: () => void;
  onSelectSearchHit: (hit: SearchHit) => void;
  onSelectBookmark: (item: BookmarkItem) => void;
  onRemoveBookmark: (item: BookmarkItem) => void;
  onOpenAudit: () => void;
  onResetProgress: () => void;
}

export const SearchAndBookmarksModal: React.FC<SearchAndBookmarksModalProps> = ({
  open,
  bookmarks,
  onClose,
  onSelectSearchHit,
  onSelectBookmark,
  onRemoveBookmark,
  onOpenAudit,
  onResetProgress
}) => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'search' | 'bookmarks'>('search');

  const hits = useMemo(() => searchBookContent(query), [query]);

  if (!open) return null;

  const kindLabel: Record<SearchHit['kind'], string> = {
    lesson: 'درس',
    concept: 'مفهوم',
    location: 'موقع أطلس',
    question: 'تدريب'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث الشامل والمفضلة"
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-12 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab('search')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>البحث الشامل</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('bookmarks')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'bookmarks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>المفضلة ({bookmarks.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'search' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute top-3 right-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في نصوص الكتاب، المصطلحات، المحميات، الأودية، المدن..."
                  className="w-full rounded-xl border border-slate-300 py-2.5 pr-10 pl-4 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>

              {!query.trim() ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">أمثلة بحث مقترحة:</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['باب المندب', 'سقطرى', 'النبي شعيب', 'الإعالة', 'الفجوة الغذائية', 'طوبقال'].map(
                      (sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => setQuery(sample)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100"
                        >
                          {sample}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : hits.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  لم يتم العثور على نتائج مطابقة لعبارة «{query}».
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {hits.map((hit) => (
                    <li key={`${hit.kind}-${hit.id}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSearchHit(hit);
                          onClose();
                        }}
                        className="flex w-full items-start gap-3 py-3 text-right transition-colors hover:bg-slate-50"
                      >
                        <span className="mt-1 shrink-0 text-slate-400">
                          {hit.kind === 'location' ? (
                            <Compass className="h-4 w-4 text-emerald-600" />
                          ) : hit.kind === 'question' ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-sky-600" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-slate-500">{kindLabel[hit.kind]}</span>
                            <span className="font-mono text-slate-400">{hit.pageRef}</span>
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900">{hit.title}</div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{hit.snippet}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  لا توجد إشارات مرجعية محفوظة بعد. يمكنك حفظ أي درس أو مفهوم من صفحات الوحدات.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBookmark(bm);
                        onClose();
                      }}
                      className="min-w-0 flex-1 text-right"
                    >
                      <div className="text-sm font-bold text-slate-900 hover:text-sky-700">
                        {bm.title}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{bm.subtitle}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(bm)}
                      aria-label={`حذف ${bm.title}`}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs">
          <button
            type="button"
            onClick={() => {
              onOpenAudit();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:underline"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>فتح تقرير التدقيق والمطابقة</span>
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="text-slate-500 hover:text-rose-600"
          >
            إعادة تعيين التقدم المحلي
          </button>
        </div>
      </div>
    </div>
  );
};
