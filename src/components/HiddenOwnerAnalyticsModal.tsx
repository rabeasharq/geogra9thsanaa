import React, { useEffect, useState } from 'react';
import {
  AdminDownloadLogDetail,
  AdminPresenceDetail,
  AdminUserProfileDetail,
  BookletAdminBreakdown
} from '../hooks/useBookletTelemetry';
import {
  fetchOwnerVaultPinRecord,
  OwnerVaultRecord,
  setupOrUpdateOwnerVaultPin,
  verifyOwnerVaultPin
} from '../utils/ownerPinVault';
import type { BookletScope } from './PrintableStudyBooklet';
import {
  X,
  Shield,
  Users,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Lock,
  Printer,
  ShieldCheck,
  FileText,
  KeyRound,
  Unlock
} from 'lucide-react';

interface HiddenOwnerAnalyticsModalProps {
  open: boolean;
  breakdown: BookletAdminBreakdown;
  activeList: AdminPresenceDetail[];
  userProfiles: AdminUserProfileDetail[];
  downloadLogs: AdminDownloadLogDetail[];
  onOpenAuditReport?: () => void;
  onClose: () => void;
}

const SCOPE_LABELS: Record<string, string> = {
  full: 'الملزمة الشاملة',
  'unit-1': 'الوحدة 1',
  'unit-2': 'الوحدة 2',
  'unit-3': 'الوحدة 3',
  'unit-4': 'الوحدة 4',
  'maps-tables': 'الخرائط والجداول'
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'هاتف',
  tablet: 'جهاز لوحي',
  desktop: 'حاسوب'
};

export const HiddenOwnerAnalyticsModal: React.FC<HiddenOwnerAnalyticsModalProps> = ({
  open,
  breakdown,
  activeList,
  userProfiles,
  downloadLogs,
  onOpenAuditReport,
  onClose
}) => {
  const [tab, setTab] = useState<'active' | 'users' | 'logs' | 'word'>('active');

  // PIN vault state for hidden Word (.docx) booklet export
  const [vaultLoading, setVaultLoading] = useState(false);
  const [pinRecord, setPinRecord] = useState<OwnerVaultRecord | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntilMs, setLockUntilMs] = useState(0);
  const [wordScope, setWordScope] = useState<BookletScope>('full');
  const [exportingWord, setExportingWord] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [changingPin, setChangingPin] = useState(false);

  useEffect(() => {
    if (!open) {
      setPinUnlocked(false);
      setPinInput('');
      setPinConfirm('');
      setPinError(null);
      setChangingPin(false);
      setExportNotice(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || tab !== 'word') return;
    let cancelled = false;
    setVaultLoading(true);
    setPinError(null);
    void fetchOwnerVaultPinRecord()
      .then((rec) => {
        if (!cancelled) setPinRecord(rec);
      })
      .catch(() => {
        if (!cancelled) setPinError('تعذر الاتصال بخزنة الرقم السري السحابية.');
      })
      .finally(() => {
        if (!cancelled) setVaultLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, tab]);

  if (!open) return null;

  const handleCreateOrChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (pinInput.trim().length < 4) {
      setPinError('الرقم السري يجب أن لا يقل عن 4 خانات.');
      return;
    }
    if (pinInput.trim() !== pinConfirm.trim()) {
      setPinError('الرقم السري وتأكيده غير متطابقين.');
      return;
    }
    setPinBusy(true);
    try {
      const saved = await setupOrUpdateOwnerVaultPin(pinInput, Boolean(pinRecord));
      setPinRecord(saved);
      setPinUnlocked(true);
      setChangingPin(false);
      setPinInput('');
      setPinConfirm('');
      setFailedAttempts(0);
      setExportNotice('تم حفظ الرقم السري وتشفيره بنجاح.');
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'تعذر حفظ الرقم السري.');
    } finally {
      setPinBusy(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinRecord) return;
    const now = Date.now();
    if (lockUntilMs > now) {
      const secs = Math.ceil((lockUntilMs - now) / 1000);
      setPinError(`تم قفل المحاولات مؤقتاً، انتظر ${secs} ثانية.`);
      return;
    }
    setPinError(null);
    setPinBusy(true);
    try {
      const ok = await verifyOwnerVaultPin(pinInput, pinRecord);
      if (ok) {
        setPinUnlocked(true);
        setPinInput('');
        setFailedAttempts(0);
      } else {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        if (nextFails >= 5) {
          setLockUntilMs(Date.now() + 60_000);
          setPinError('تجاوزت الحد المسموح (5 محاولات). تم القفل لمدة 60 ثانية.');
        } else {
          setPinError(`الرقم السري غير صحيح (المحاولة ${nextFails} من 5).`);
        }
      }
    } finally {
      setPinBusy(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!pinUnlocked) return;
    setExportingWord(true);
    setExportNotice(null);
    try {
      const { exportBookletAsWordDocx } = await import('../utils/wordBookletExporter');
      await exportBookletAsWordDocx(wordScope);
      setExportNotice('تم توليد وتنزيل ملف الوورد (.docx) بنجاح مع العلامة المائية للمعد والمراجع.');
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'تعذر توليد ملف الوورد.');
    } finally {
      setExportingWord(false);
    }
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5 text-sky-700" />;
    if (type === 'tablet') return <Tablet className="h-3.5 w-3.5 text-indigo-700" />;
    return <Monitor className="h-3.5 w-3.5 text-slate-700" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="لوحة المتابعة الخاصة بمالك التطبيق"
      className="no-print fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="flex h-[94vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3.5 text-white sm:px-5 sm:py-4">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <h2 className="font-display text-sm font-extrabold sm:text-base">
                لوحة المتابعة السرية للمستخدمين والتحميلات (خاصة بالمالك)
              </h2>
              <p className="text-[11px] text-slate-300">
                من الهاتف: اضغط مطوّلاً على «النشطون الآن» أو انقر 5 لمسات سريعة أو عبر أيقونة الإحصائيات السفلية.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAuditReport && (
              <button
                type="button"
                onClick={onOpenAuditReport}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/70"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>تقرير التدقيق</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق لوحة المتابعة الخاصة"
              className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
              <span>إغلاق</span>
            </button>
          </div>
        </div>

        {/* Detailed Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-500">إجمالي التحميلات</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-slate-900">
              {breakdown.totalDownloads}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="text-[11px] text-emerald-700">الحفظ المشفر (AES-256)</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-emerald-800">
              {breakdown.encryptedSaves}
            </div>
          </div>
          <div className="rounded-lg border border-sky-200 bg-white p-3">
            <div className="text-[11px] text-sky-700">طباعة / PDF</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-sky-800">
              {breakdown.pdfPrints}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-3">
            <div className="text-[11px] text-amber-700">النشطون الآن</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-amber-800">
              {activeList.length}
            </div>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-white p-3">
            <div className="text-[11px] text-indigo-700">إجمالي المستخدمين المسجلين</div>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-indigo-800">
              {userProfiles.length}
            </div>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 sm:px-5 sm:py-3">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'active'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>النشطون الآن ({activeList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('users')}
            className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'users'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>سجل المستخدمين ({userProfiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('logs')}
            className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>التحميلات ({downloadLogs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('word')}
            className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'word'
                ? 'bg-emerald-800 text-white'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>ملف الوورد (برقم سري)</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {tab === 'active' && (
            <div className="overflow-x-auto">
              {activeList.length === 0 ? (
                <p className="py-8 text-center text-slate-500">لا توجد جلسات نشطة متزامنة حالياً.</p>
              ) : (
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2">المستخدم</th>
                      <th className="border-b border-slate-200 px-3 py-2">البريد الإلكتروني</th>
                      <th className="border-b border-slate-200 px-3 py-2">الجهاز وبيئة التشغيل</th>
                      <th className="border-b border-slate-200 px-3 py-2">القسم المفتوح</th>
                      <th className="border-b border-slate-200 px-3 py-2">آخر نبضة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeList.map((item) => (
                      <tr key={item.sessionId}>
                        <td className="px-3 py-2 font-bold text-slate-900">{item.displayName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600" dir="ltr">
                          {item.email || item.ownerUid.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <DeviceIcon type={item.deviceType} />
                            <span>{DEVICE_LABELS[item.deviceType] || item.deviceType}</span>
                            <span className="text-slate-400">·</span>
                            <span>{item.appMode === 'pwa' ? 'تطبيق مثبت (PWA)' : 'متصفح'}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-sky-800">
                          {SCOPE_LABELS[item.scope] || item.scope}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-500">
                          {new Date(item.lastSeenMs).toLocaleTimeString('ar-YE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="overflow-x-auto">
              {userProfiles.length === 0 ? (
                <p className="py-8 text-center text-slate-500">لا توجد ملفات مستخدمين مسجلة بعد.</p>
              ) : (
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2">الاسم</th>
                      <th className="border-b border-slate-200 px-3 py-2">البريد</th>
                      <th className="border-b border-slate-200 px-3 py-2">الجهاز / الوضع</th>
                      <th className="border-b border-slate-200 px-3 py-2">مشفّر</th>
                      <th className="border-b border-slate-200 px-3 py-2">PDF</th>
                      <th className="border-b border-slate-200 px-3 py-2">الإجمالي</th>
                      <th className="border-b border-slate-200 px-3 py-2">آخر نطاق / آخر نشاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userProfiles.map((u) => (
                      <tr key={u.uid}>
                        <td className="px-3 py-2 font-bold text-slate-900">{u.displayName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600" dir="ltr">
                          {u.email || u.uid.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {DEVICE_LABELS[u.deviceType] || u.deviceType} ·{' '}
                          {u.appMode === 'pwa' ? 'PWA' : 'Web'}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold tabular-nums text-emerald-800">
                          {u.encryptedSavesCount}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold tabular-nums text-sky-800">
                          {u.pdfPrintsCount}
                        </td>
                        <td className="px-3 py-2 font-mono font-extrabold tabular-nums text-slate-900">
                          {u.downloadsCount}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {SCOPE_LABELS[u.lastScope] || u.lastScope} ·{' '}
                          <span className="font-mono text-slate-500">
                            {new Date(u.lastActiveAtMs).toLocaleDateString('ar-YE')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'logs' && (
            <div className="overflow-x-auto">
              {downloadLogs.length === 0 ? (
                <p className="py-8 text-center text-slate-500">لا توجد عمليات تحميل مسجلة بعد.</p>
              ) : (
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2">الوقت</th>
                      <th className="border-b border-slate-200 px-3 py-2">المستخدم</th>
                      <th className="border-b border-slate-200 px-3 py-2">البريد</th>
                      <th className="border-b border-slate-200 px-3 py-2">النوع</th>
                      <th className="border-b border-slate-200 px-3 py-2">النطاق</th>
                      <th className="border-b border-slate-200 px-3 py-2">الجهاز</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {downloadLogs.map((lg) => (
                      <tr key={lg.id}>
                        <td className="px-3 py-2 font-mono text-slate-500">
                          {new Date(lg.createdAtMs).toLocaleString('ar-YE')}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900">{lg.displayName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600" dir="ltr">
                          {lg.email || lg.ownerUid.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2">
                          {lg.mode === 'encrypted_offline' ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                              <Lock className="h-3 w-3" />
                              حفظ مشفر
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-sky-800">
                              <Printer className="h-3 w-3" />
                              PDF
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {SCOPE_LABELS[lg.scope] || lg.scope}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {DEVICE_LABELS[lg.deviceType] || lg.deviceType} ({lg.appMode === 'pwa' ? 'PWA' : 'Web'})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'word' && (
            <div className="mx-auto max-w-xl space-y-4 py-2">
              {vaultLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                  جارٍ التحقق من خزنة الرقم السري السحابية...
                </div>
              ) : !pinRecord || changingPin ? (
                <form
                  onSubmit={(e) => void handleCreateOrChangePin(e)}
                  className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <KeyRound className="h-4 w-4 text-emerald-700" />
                    <span>
                      {changingPin
                        ? 'تغيير الرقم السري الخاص بملف الوورد'
                        : 'تعيين الرقم السري الخاص بملف الوورد (لأول مرة)'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    يُشفّر هذا الرقم السري بخوارزمية PBKDF2-SHA256 ويُحفظ بصيغة مشفّرة في حساب المالك فقط لقفل تنزيل ملف الوورد (.docx).
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-800">
                        الرقم السري الجديد (4 خانات فأكثر)
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="new-password"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="أدخل الرقم السري..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-800">
                        تأكيد الرقم السري
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="new-password"
                        value={pinConfirm}
                        onChange={(e) => setPinConfirm(e.target.value)}
                        placeholder="أعد إدخال الرقم السري..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {pinError && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                      {pinError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="submit"
                      disabled={pinBusy}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>{pinBusy ? 'جارٍ الحفظ...' : 'حفظ الرقم السري وفتح القسم'}</span>
                    </button>
                    {changingPin && (
                      <button
                        type="button"
                        onClick={() => {
                          setChangingPin(false);
                          setPinInput('');
                          setPinConfirm('');
                          setPinError(null);
                        }}
                        className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                </form>
              ) : !pinUnlocked ? (
                <form
                  onSubmit={(e) => void handleVerifyPin(e)}
                  className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Lock className="h-4 w-4 text-sky-700" />
                    <span>قسم محمي برقم سري — تنزيل الملزمة بصيغة Word (.docx)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    أدخل الرقم السري الخاص بمالك التطبيق لفتح خيار تنزيل الملزمة كملف وورد.
                  </p>
                  <div>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="current-password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="أدخل الرقم السري..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-600"
                    />
                  </div>
                  {pinError && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                      {pinError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={pinBusy}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>{pinBusy ? 'جارٍ التحقق...' : 'فتح التنزيل'}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                      <FileText className="h-4 w-4 text-emerald-700" />
                      <span>تصدير الملزمة بصيغة Word (.docx) للمالك</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setChangingPin(true);
                          setPinInput('');
                          setPinConfirm('');
                          setPinError(null);
                        }}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        تغيير الرقم السري
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPinUnlocked(false);
                          setExportNotice(null);
                        }}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        قفل
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600">
                    يُنشئ ملف وورد (.docx) منسّق بالكامل بالاتجاه من اليمين إلى اليسار مع العلامة المائية لاسم المعد والمراجع (أ. إبراهيم أحمد متاش / أ. مجدي محمد النوفاني) في كل صفحة.
                  </p>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                      نطاق الملزمة للتصدير:
                    </label>
                    <select
                      value={wordScope}
                      onChange={(e) => setWordScope(e.target.value as BookletScope)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="full">الملزمة الشاملة الكاملة (الوحدات 1–4)</option>
                      <option value="unit-1">الوحدة 1: البيئة الطبيعية لليمن</option>
                      <option value="unit-2">الوحدة 2: السكان والاقتصاد في اليمن</option>
                      <option value="unit-3">الوحدة 3: البيئة الطبيعية للوطن العربي</option>
                      <option value="unit-4">الوحدة 4: السكان والاقتصاد في الوطن العربي</option>
                      <option value="maps-tables">كتيّب الخرائط والجداول المستقلة فقط</option>
                    </select>
                  </div>

                  {exportNotice && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                      {exportNotice}
                    </div>
                  )}
                  {pinError && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                      {pinError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={exportingWord}
                    onClick={() => void handleDownloadWord()}
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    <span>{exportingWord ? 'جارٍ تجهيز ملف الوورد (.docx)...' : 'تنزيل الملزمة ملف وورد (.docx)'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
