import React, { useState } from 'react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, CheckCircle2, WifiOff, X } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Hide install button if already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handlePress = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePress}
        className={
          compact
            ? 'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700'
            : 'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 sm:text-sm'
        }
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span>
          {isInstallable
            ? compact
              ? 'تثبيت التطبيق'
              : 'تثبيت التطبيق على الهاتف (يعمل بدون نت)'
            : isIOS
            ? compact
              ? 'تثبيت (آيفون)'
              : 'تثبيت التطبيق على آيفون / آيباد'
            : compact
            ? 'تثبيت على الهاتف'
            : 'تثبيت التطبيق على الهاتف'}
        </span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تثبيت التطبيق على الهاتف"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    تثبيت كتاب الجغرافيا على الهاتف
                  </h3>
                  <p className="text-xs text-slate-500">تثبيت لمرة واحدة ويعمل بعدها بدون إنترنت</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="إغلاق"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">1.</span>
                  <span>
                    اضغط على أيقونة <strong className="inline-flex items-center gap-1 text-slate-900">المشاركة <Share className="inline h-3.5 w-3.5" /></strong> في شريط متصفح Safari بالأسفل.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">2.</span>
                  <span>
                    مرّر للأسفل واختر <strong className="text-slate-900">«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">3.</span>
                  <span>
                    اضغط <strong className="text-slate-900">إضافة</strong>، وسيُحفظ الكتاب كاملاً للعمل بدون إنترنت.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <p className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-950">
                  إذا لم يظهر مربع التثبيت التلقائي في المتصفح حالياً (مثل فتح التطبيق داخل إطار معاينة)، يمكنك التثبيت يدوياً بخطوة واحدة:
                </p>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  <li>
                    <strong>على أندرويد (Chrome / Edge):</strong> افتح قائمة المتصفح (<strong>⋮</strong>) ثم اختر{' '}
                    <strong>«تثبيت التطبيق»</strong> أو <strong>«الإضافة إلى الشاشة الرئيسية»</strong>.
                  </li>
                  <li>
                    <strong>على آيفون وآيباد (Safari):</strong> اضغط زر <strong>المشاركة</strong> ثم{' '}
                    <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                  </li>
                  <li>
                    <strong>على الحاسوب:</strong> اضغط أيقونة التثبيت في شريط العنوان أعلى المتصفح.
                  </li>
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              فهمت، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAOfflineStatusCard: React.FC = () => {
  const { isInstalled, offlineReady } = usePWAInstall();
  const isOnline = useOnlineStatus();

  return (
    <section
      aria-label="حالة التثبيت والعمل بدون إنترنت"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
            {isInstalled
              ? 'التطبيق مثبت على جهازك ويعمل كتطبيق مستقل'
              : 'تطبيق ويب قابل للتثبيت على الهاتف ويعمل بدون إنترنت'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            {offlineReady
              ? 'اكتمل تخزين جميع الوحدات الـ 18 والأطلس ثنائي وثلاثي الأبعاد وقسم رسم الخرائط والتدريبات في الذاكرة المحلية — يعمل التطبيق الآن كاملاً بدون اتصال.'
              : 'يتم الآن تجهيز ملفات الكتاب والأطلس في الذاكرة المحلية ليعمل التطبيق بدون إنترنت بعد أول زيارة.'}
            {!isOnline && ' (أنت تتصفح الآن في وضع عدم الاتصال بالإنترنت).'}
          </p>
        </div>
      </div>

      {!isInstalled && <PWAInstallButton />}
    </section>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>وضع عدم الاتصال — جميع الدروس والأطلس تعمل بدون نت</span>
    </div>
  );
};
