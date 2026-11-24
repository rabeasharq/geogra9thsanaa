import React, { useEffect, useState } from 'react';
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
  CheckCircle2
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleVerify = async () => {
    const msg = await onVerifyDecryption();
    setVerifyMessage(msg);
    setTimeout(() => setVerifyMessage(null), 5000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نافذة القارئ الداخلي للملزمة الشاملة"
      className="no-print fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm"
    >
      {/* Reader Window Header Toolbar */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900">
                نافذة قراءة الملزمة داخل التطبيق
              </h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  النشطون الآن: <strong className="text-slate-900">{stats.activeReaders}</strong>
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Download className="h-3.5 w-3.5 text-sky-600" />
                  التحميلات: <strong className="text-slate-900">{stats.totalDownloads}</strong>
                </span>
                {savedVaultMeta && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <Lock className="h-3 w-3" />
                    <span>مشفّرة محلياً ({savedVaultMeta.algorithm})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="نطاق الملزمة في النافذة"
              value={scope}
              onChange={(e) => onChangeScope(e.target.value as BookletScope)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                aria-label="تصغير الخط"
                onClick={() => setReaderScale((s) => Math.max(85, s - 10))}
                className="rounded p-1.5 text-slate-700 hover:bg-white"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-bold tabular-nums text-slate-700">
                {readerScale}%
              </span>
              <button
                type="button"
                aria-label="تكبير الخط"
                onClick={() => setReaderScale((s) => Math.min(130, s + 10))}
                className="rounded p-1.5 text-slate-700 hover:bg-white"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={savingEncrypted}
              onClick={() => void onSaveEncrypted()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{savingEncrypted ? 'جارٍ التشفير...' : 'حفظ مشفّر أوفلاين'}</span>
            </button>

            {savedVaultMeta && (
              <button
                type="button"
                onClick={() => void handleVerify()}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>فحص التشفير</span>
              </button>
            )}

            <button
              type="button"
              onClick={onPrintPdf}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة الملزمة"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              <span>إغلاق</span>
            </button>
          </div>
        </div>

        {verifyMessage && (
          <div className="mx-auto mt-2 flex max-w-[1200px] items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{verifyMessage}</span>
          </div>
        )}
      </header>

      {/* Scrollable In-App Booklet Reader Viewport */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
        <div
          className="mx-auto max-w-[1000px]"
          style={{ fontSize: `${readerScale}%` }}
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
