/**
 * Builds a complete, self-contained, offline-ready RTL HTML5 booklet
 * from the rendered PrintableStudyBooklet container (including inline SVG maps)
 * so students without internet or with any phone/computer/print shop can open and print it.
 */
export function downloadStandaloneOfflineBookletHtml(
  sourceElement: HTMLElement,
  filename = 'الملزمة-الشاملة-جغرافيا-تاسع-2026.html'
): boolean {
  if (!sourceElement) return false;

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());

  const htmlDoc = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>الملزمة الشاملة – جغرافيا الصف التاسع الأساسي (إعداد: أ. إبراهيم متاش · مراجعة: أ. مجدي النوفاني)</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html {
      direction: rtl;
      font-family: 'Cairo', 'IBM Plex Sans Arabic', 'Tahoma', 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      line-height: 1.75;
    }
    body {
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #f1f5f9;
    }
    .offline-topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      background: #0f172a;
      color: #ffffff;
      border-bottom: 2px solid #0284c7;
      font-size: 13px;
    }
    .offline-topbar strong { font-size: 14px; }
    .offline-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .offline-btn:hover { background: #0369a1; }
    .booklet-shell {
      max-width: 960px;
      margin: 24px auto;
      background: #ffffff;
      padding: 28px 32px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
    }
    .print-break-before { margin-top: 32px; padding-top: 24px; border-top: 2px dashed #cbd5e1; }
    .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    h1, h2, h3, h4 { margin: 0 0 8px 0; color: #0f172a; line-height: 1.35; }
    p { margin: 6px 0; }
    ul, ol { margin: 6px 0; padding-right: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: right; vertical-align: top; }
    thead { background: #f8fafc; font-weight: 700; }
    svg { max-width: 100%; height: auto; display: block; border-radius: 8px; }

    /* Minimal utility styles mirroring Tailwind classes used inside PrintableStudyBooklet */
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-3 > * + * { margin-top: 12px; }
    .space-y-4 > * + * { margin-top: 16px; }
    .space-y-5 > * + * { margin-top: 20px; }
    .space-y-6 > * + * { margin-top: 24px; }
    .grid { display: grid; gap: 12px; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .rounded-lg { border-radius: 8px; }
    .rounded-xl { border-radius: 12px; }
    .border { border: 1px solid #cbd5e1; }
    .border-2 { border: 2px solid #0f172a; }
    .border-amber-200 { border-color: #fde68a; }
    .border-sky-200 { border-color: #bae6fd; }
    .border-emerald-200 { border-color: #a7f3d0; }
    .border-indigo-200 { border-color: #c7d2fe; }
    .border-slate-200 { border-color: #e2e8f0; }
    .border-slate-300 { border-color: #cbd5e1; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-50 { background-color: #f8fafc; }
    .bg-slate-900 { background-color: #0f172a; color: #ffffff; }
    .bg-sky-50 { background-color: #f0f9ff; }
    .bg-amber-50 { background-color: #fffbeb; }
    .bg-emerald-50 { background-color: #ecfdf5; }
    .bg-indigo-50 { background-color: #eef2ff; }
    .text-white { color: #ffffff; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-700 { color: #334155; }
    .text-slate-600 { color: #475569; }
    .text-slate-500 { color: #64748b; }
    .text-sky-800, .text-sky-900 { color: #075985; }
    .text-emerald-800, .text-emerald-900 { color: #065f46; }
    .text-amber-800, .text-amber-900, .text-amber-950 { color: #92400e; }
    .text-center { text-align: center; }
    .text-xs { font-size: 12px; }
    .text-sm { font-size: 13.5px; }
    .text-base { font-size: 15px; }
    .text-lg { font-size: 17px; }
    .text-xl { font-size: 20px; }
    .text-2xl { font-size: 24px; }
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .border-t { border-top: 1px solid #e2e8f0; }
    .border-b { border-bottom: 1px solid #e2e8f0; }
    .border-b-2 { border-bottom: 2px solid #cbd5e1; }
    .border-l { border-left: 1px solid #e2e8f0; }
    .border-dashed { border-style: dashed; }
    .divide-y > * + * { border-top: 1px solid #f1f5f9; }
    .overflow-hidden { overflow: hidden; }
    .leading-relaxed { line-height: 1.75; }
    .p-2 { padding: 8px; }
    .p-2\.5 { padding: 10px; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 16px; }
    .p-5 { padding: 20px; }
    .p-6 { padding: 24px; }
    .px-2\.5 { padding-left: 10px; padding-right: 10px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-2\.5 { padding-top: 10px; padding-bottom: 10px; }
    .pl-3 { padding-left: 12px; }
    .pr-3 { padding-right: 12px; }
    .pb-1 { padding-bottom: 4px; }
    .pb-2 { padding-bottom: 8px; }
    .pb-2\.5 { padding-bottom: 10px; }
    .pb-4 { padding-bottom: 16px; }
    .pt-1 { padding-top: 4px; }
    .pt-1\.5 { padding-top: 6px; }
    .pt-2\.5 { padding-top: 10px; }
    .mt-0\.5 { margin-top: 2px; }
    .mt-1 { margin-top: 4px; }
    .mt-1\.5 { margin-top: 6px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }
    .mt-5 { margin-top: 20px; }
    .mb-1\.5 { margin-bottom: 6px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }

    @media (max-width: 720px) {
      .booklet-shell { margin: 0; border-radius: 0; padding: 16px; border: none; }
      .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; }
    }

    @media print {
      @page { size: A4 portrait; margin: 13mm 12mm 15mm 12mm; }
      html, body { background: #ffffff !important; font-size: 10.5pt !important; }
      .offline-topbar { display: none !important; }
      .booklet-shell { max-width: none; margin: 0; padding: 0; border: none; border-radius: 0; }
      .print-break-before { break-before: page; page-break-before: always; margin-top: 0; padding-top: 0; border-top: none; }
      .print-break-after { break-after: page; page-break-after: always; }
      .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="offline-topbar">
    <div>
      <strong>الملزمة الشاملة – جغرافية الصف التاسع الأساسي (طبعة 2026)</strong>
      <span style="margin-right:10px;opacity:0.85;">إعداد: أ. إبراهيم أحمد متاش (779424090) · مراجعة: أ. مجدي محمد النوفاني</span>
    </div>
    <button type="button" class="offline-btn" onclick="window.print()">طباعة / حفظ كملف PDF</button>
  </div>
  <div class="booklet-shell">
    ${clone.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
