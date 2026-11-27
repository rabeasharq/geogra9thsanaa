import React, { useEffect, useRef, useState } from 'react';
import { BookletScope, PrintableStudyBooklet } from './PrintableStudyBooklet';
import { EncryptedVaultMetadata } from '../utils/encryptedOfflineVault';
import { BookletPublicStats } from '../hooks/useBookletTelemetry';
import {
  X,
  Lock,
  Printer,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Users,
  Download,
  CheckCircle2,
  MoreVertical,
  BookOpen
} from 'lucide-react';

interface BookletReaderModalProps {
  open: boolean;
  scope: BookletScope;
  includeBlankMaps: boolean;
  includeQuizKey: boolean;
  savedVaultMeta?: EncryptedVaultMetadata;
  stats: BookletPublicStats;
  savingEncrypted: boolean;
  onChangeScope: (scope: BookletScope) => void;
  onSaveEncrypted: () => Promise<void>;
  onVerifyDecryption: () => Promise<string | null>;
  onPrintPdf: () => void;
  onClose: () => void;
}

const SCOPE_OPTIONS: { id: BookletScope; label: string }[] = [
  { id: 'full', label: 'الملزمة الشاملة (1–4)' },
  { id: 'unit-1', label: 'الوحدة 1' },
  { id: 'unit-2', label: 'الوحدة 2' },
  { id: 'unit-3', label: 'الوحدة 3' },
  { id: 'unit-4', label: 'الوحدة 4' },
  { id: 'maps-tables', label: 'الخرائط والجداول' }
];

export const BookletReaderModal: React.FC<BookletReaderModalProps> = ({
  open,
  scope,
  includeBlankMaps,
  includeQuizKey,
  savedVaultMeta,
  stats,
  savingEncrypted,
  onChangeScope,
  onSaveEncrypted,
  onVerifyDecryption,
  onPrintPdf,
  onClose
}) => {
  const [readerScale, setReaderScale] = useState<number>(100);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Lock background document scroll and support Escape key while reader is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) {
          setMenuOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, menuOpen, onClose]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  if (!open) return null;

  const handleVerify = async () => {
    setMenuOpen(false);
    const msg = await onVerifyDecryption();
    setVerifyMessage(msg);
    setTimeout(() => setVerifyMessage(null), 5000);
  };

  const handleSave = async () => {
    setMenuOpen(false);
    await onSaveEncrypted();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نافذة القارئ الداخلي للملزمة الشاملة"
      className="no-print fixed inset-0 z-[60] flex h-[100dvh] flex-col bg-slate-900/75 backdrop-blur-sm"
    >
      {/* Compact Single-Row Reader Toolbar (iPad, Tablet, Mobile & Desktop consistent) */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-5 sm:py-2.5">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-2 sm:gap-3">
          {/* Start Zone: Compact Title + Scope Selector */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 sm:inline-flex">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="font-display hidden shrink-0 whitespace-nowrap text-sm font-extrabold text-slate-900 lg:block">
              قارئ الملزمة
            </h2>
            <select
              aria-label="نطاق الملزمة في النافذة"
              value={scope}
              onChange={(e) => onChangeScope(e.target.value as BookletScope)}
              className="h-9 min-w-0 max-w-[165px] truncate rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 sm:max-w-[230px]"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* End Zone: Zoom Controls + Secondary Overflow Menu + Print + Close */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Proportional Zoom Controls */}
            <div className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                aria-label="تصغير النص"
                disabled={readerScale <= 85}
                onClick={() => setReaderScale((s) => Math.max(85, s - 10))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-white disabled:opacity-40"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="hidden px-2 font-mono text-[11px] font-bold tabular-nums text-slate-700 sm:inline">
                {readerScale}%
              </span>
              <button
                type="button"
                aria-label="تكبير النص"
                disabled={readerScale >= 145}
                onClick={() => setReaderScale((s) => Math.min(145, s + 10))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-white disabled:opacity-40"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Overflow Menu for Offline Vault & Stats */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-label="خيارات إضافية والحفظ المشفّر"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="hidden md:inline">خيارات</span>
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-11 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="space-y-2 border-b border-slate-100 pb-2.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        <span>النشطون الآن</span>
                      </span>
                      <strong className="font-mono tabular-nums text-slate-900">
                        {stats.activeReaders}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5 text-sky-600" />
                        <span>التحميلات</span>
                      </span>
                      <strong className="font-mono tabular-nums text-slate-900">
                        {stats.totalDownloads}
                      </strong>
                    </div>
                    {savedVaultMeta && (
                      <div className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Lock className="h-3 w-3 shrink-0" />
                        <span>مشفّرة محلياً ({savedVaultMeta.algorithm})</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <button
                      type="button"
                      disabled={savingEncrypted}
                      onClick={() => void handleSave()}
                      className="flex w-full items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span>{savingEncrypted ? 'جارٍ التشفير...' : 'حفظ مشفّر أوفلاين'}</span>
                    </button>

                    {savedVaultMeta && (
                      <button
                        type="button"
                        onClick={() => void handleVerify()}
                        className="flex w-full items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>فحص سلامة التشفير</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setReaderScale(100);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <span>إعادة حجم النص (100%)</span>
                      <span className="font-mono text-[11px] text-slate-500">{readerScale}%</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onPrintPdf}
              aria-label="طباعة أو حفظ PDF"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">طباعة PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة الملزمة"
              className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 sm:px-3"
            >
              <X className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">إغلاق</span>
            </button>
          </div>
        </div>

        {verifyMessage && (
          <div className="mx-auto mt-2 flex max-w-[1160px] items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{verifyMessage}</span>
          </div>
        )}
      </header>

      {/* Scrollable In-App Booklet Reader Viewport */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-100 px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
        <div
          className="booklet-reader-sheet mx-auto max-w-[980px]"
          style={{ '--booklet-scale': readerScale / 100 } as React.CSSProperties}
        >
          <PrintableStudyBooklet
            scope={scope}
            includeBlankMaps={includeBlankMaps}
            includeQuizKey={includeQuizKey}
          />
        </div>
      </div>
    </div>
  );
};
