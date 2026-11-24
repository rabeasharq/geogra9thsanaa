import React, { useEffect, useState } from 'react';
import {
  AdminDownloadLogDetail,
  AdminPresenceDetail,
  AdminUserProfileDetail,
  BookletAdminBreakdown
} from '../hooks/useBookletTelemetry';
import { X, Shield, Users, Download, Smartphone, Monitor, Tablet, Lock, Printer } from 'lucide-react';

interface HiddenOwnerAnalyticsModalProps {
  open: boolean;
  breakdown: BookletAdminBreakdown;
  activeList: AdminPresenceDetail[];
  userProfiles: AdminUserProfileDetail[];
  downloadLogs: AdminDownloadLogDetail[];
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
  onClose
}) => {
  const [tab, setTab] = useState<'active' | 'users' | 'logs'>('active');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

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
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="font-display text-base font-extrabold">
                لوحة المتابعة السرية للمستخدمين والتحميلات (خاصة بالمالك)
              </h2>
              <p className="text-[11px] text-slate-300">
                هذه النافذة محمية ومخفية تماماً عن العامة — لا يظهر للطلاب سوى الرقمين الإجماليين فقط.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة المتابعة الخاصة"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
            <span>إغلاق</span>
          </button>
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
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
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
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'users'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>سجل المستخدمين التراكمي ({userProfiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('logs')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>تفاصيل عمليات التحميل ({downloadLogs.length})</span>
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
        </div>
      </div>
    </div>
  );
};
