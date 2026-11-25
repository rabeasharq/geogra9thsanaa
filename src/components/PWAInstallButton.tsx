import React, { useState } from 'react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Share,
  CheckCircle2,
  WifiOff,
  X,
  ExternalLink,
  Copy,
  Check,
  AppWindow
} from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    swRegistered,
    offlineReady,
    install
  } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Hide install button if already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handlePress = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'unavailable') {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback ignored if clipboard blocked
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
              ? 'تثبيت كتطبيق'
              : 'تثبيت التطبيق في قائمة التطبيقات (بدون نت)'
            : isIOS
            ? compact
              ? 'تثبيت (آيفون)'
              : 'تثبيت التطبيق على آيفون / آيباد'
            : compact
            ? 'تثبيت التطبيق'
            : 'تثبيت في قائمة التطبيقات'}
        </span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تثبيت التطبيق في قائمة التطبيقات"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.svg"
                  alt="أيقونة التطبيق"
                  className="h-10 w-10 shrink-0 rounded-xl border border-sky-200 shadow-xs"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    تثبيت «الجغرافيا 9» في قائمة التطبيقات
                  </h3>
                  <p className="text-xs text-slate-500">
                    يُثبّت كتطبيق مستقل (WebAPK) بأيقونة الوطن العربي ويعمل بدون إنترنت
                  </p>
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

            {/* Live PWA Readiness Status */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-[11px]">
              <div>
                <div className="font-bold text-emerald-700">مفعّل ✓</div>
                <div className="text-slate-600">بيان التطبيق</div>
              </div>
              <div>
                <div className={swRegistered ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>
                  {swRegistered ? 'نشط ✓' : 'قيد التسجيل'}
                </div>
                <div className="text-slate-600">العامل الخدمي</div>
              </div>
              <div>
                <div className={offlineReady ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>
                  {offlineReady ? 'جاهز ✓' : 'قيد التخزين'}
                </div>
                <div className="text-slate-600">العمل بدون نت</div>
              </div>
            </div>

            {/* Iframe blocker notice + 1-click escape to standalone browser tab */}
            {isInIframe && (
              <div className="mt-4 space-y-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950">
                <p className="font-bold">
                  تنبيه مهم: التطبيق مفتوح حالياً داخل إطار معاينة مضمّن، والمتصفحات تمنع التثبيت من داخل الإطارات المضمّنة.
                </p>
                <p className="leading-relaxed">
                  افتح التطبيق في نافذة متصفح مستقلة (Chrome أو Edge أو Safari) ليظهر زر التثبيت المباشر ويُضاف التطبيق إلى قائمة التطبيقات في هاتفك أو جهازك:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>فتح التطبيق في متصفح مستقل للتثبيت</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? 'تم نسخ الرابط' : 'نسخ رابط التطبيق'}</span>
                  </button>
                </div>
              </div>
            )}

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">1.</span>
                  <span>
                    تأكد من فتح الرابط في متصفح <strong>Safari</strong> (وليس متصفحاً داخل تطبيق آخر).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">2.</span>
                  <span>
                    اضغط على أيقونة <strong className="inline-flex items-center gap-1 text-slate-900">المشاركة <Share className="inline h-3.5 w-3.5" /></strong> في شريط Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-sky-700">3.</span>
                  <span>
                    اختر <strong className="text-slate-900">«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong> ثم اضغط <strong>إضافة</strong> ليظهر في قائمة التطبيقات.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-sky-950">
                  <strong>طريقة التثبيت في قائمة التطبيقات (وليس مجرد اختصار):</strong>
                </div>
                <ul className="space-y-2.5">
                  <li className={isAndroid ? 'rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5' : ''}>
                    <strong className="inline-flex items-center gap-1 text-slate-900">
                      <Smartphone className="h-3.5 w-3.5 text-sky-700" />
                      على أندرويد (Google Chrome / Edge / Samsung Internet):
                    </strong>{' '}
                    افتح الرابط مباشرة في متصفح Chrome، ثم اضغط قائمة (<strong>⋮</strong>) واختر{' '}
                    <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية» ← «تثبيت»</strong>. سيتم إنشاء حزمة تطبيق حقيقية تظهر داخل <strong>قائمة التطبيقات (App Drawer)</strong> مع أيقونة الوطن العربي.
                  </li>
                  <li>
                    <strong className="inline-flex items-center gap-1 text-slate-900">
                      <AppWindow className="h-3.5 w-3.5 text-sky-700" />
                      على الكمبيوتر (Windows / Mac / Linux):
                    </strong>{' '}
                    اضغط أيقونة التثبيت في شريط العنوان أعلى متصفح Chrome أو Edge ليُضاف إلى <strong>قائمة التطبيقات / ابدأ</strong> ويعمل بنافذة مستقلة.
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
  const { isInstalled, isInstallable, offlineReady, swRegistered } = usePWAInstall();
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
              ? 'التطبيق مثبّت في جهازك ويعمل كتطبيق مستقل بدون إنترنت'
              : isInstallable
              ? 'التطبيق جاهز للتثبيت المباشر في قائمة التطبيقات (يعمل بدون نت)'
              : 'تطبيق ويب مفعّل للتثبيت في قائمة التطبيقات والعمل بدون إنترنت'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            {offlineReady
              ? 'تم تفعيل بيان التطبيق (Manifest) والعامل الخدمي (Service Worker) وحفظ الوحدات الـ 18 والأطلس وقسم رسم الخرائط والتدريبات محلياً للعمل بدون نت.'
              : swRegistered
              ? 'تم تسجيل العامل الخدمي بنجاح وجارٍ استكمال حفظ جميع ملفات الكتاب والأطلس للعمل بدون اتصال.'
              : 'جارٍ تهيئة ملفات التطبيق والأطلس في الذاكرة المحلية ليعمل بدون إنترنت بعد التثبيت.'}
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
      className="no-print fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg lg:bottom-4"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>وضع عدم الاتصال — جميع الدروس والأطلس تعمل بدون نت</span>
    </div>
  );
};
