import React, { useEffect, useRef, useState } from 'react';
import { TEXTBOOK_MAP_TEMPLATES, TextbookMapTemplate, MapFeaturePoint } from '../data/mapTemplatesData';
import { projectYemen, projectArabWorld } from '../data/bookIndex';
import { AtlasScope } from '../types/textbook';
import {
  PenTool,
  Type as TypeIcon,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Map as MapIcon,
  Target,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  Grid
} from 'lucide-react';

interface MapDrawingLabProps {
  initialScope?: AtlasScope;
  onGoToLesson: (unitId: string, lessonId: string) => void;
}

type LabMode = 'reference' | 'studio' | 'quiz';
type DrawTool = 'pen' | 'eraser' | 'text';

const YEMEN_OUTLINE_PTS = [
  [16.4, 42.8], [17.5, 43.2], [17.4, 44.5], [18.9, 47.0], [19.0, 52.0],
  [16.6, 53.1], [15.6, 52.1], [14.5, 49.2], [13.5, 46.8], [12.8, 45.0],
  [12.68, 43.42], [13.3, 43.25], [14.8, 42.95], [15.8, 42.8]
]
  .map(([la, ln]) => {
    const p = projectYemen(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

const SOCOTRA_OUTLINE_PTS = [
  [12.7, 53.3], [12.65, 54.45], [12.35, 54.35], [12.32, 53.4]
]
  .map(([la, ln]) => {
    const p = projectYemen(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

const ARAB_AFRICA_PTS = [
  [35.8, -5.5], [36.8, 3], [37.2, 10], [32.8, 13], [31.5, 25], [31.3, 32.5],
  [22, 36.8], [15, 39], [11.5, 43.2], [11.5, 51.2], [2, 45.3], [-1.5, 41.5],
  [4, 34], [10, 24], [19, 24], [22, 12], [16, -4], [15, -16], [21, -17], [28, -13]
]
  .map(([la, ln]) => {
    const p = projectArabWorld(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

const ARAB_ASIA_PTS = [
  [37, 36], [37, 42.3], [33, 46.5], [30, 48.5], [26, 50.2], [25, 56.2],
  [22.5, 59.8], [16.5, 53], [12.7, 45], [12.68, 43.42], [17, 42],
  [22, 39], [28, 35], [31.2, 34.2], [34, 35.8]
]
  .map(([la, ln]) => {
    const p = projectArabWorld(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

export const MapDrawingLab: React.FC<MapDrawingLabProps> = ({ initialScope, onGoToLesson }) => {
  const defaultTemplate =
    (initialScope && TEXTBOOK_MAP_TEMPLATES.find((t) => t.scope === initialScope)) ??
    TEXTBOOK_MAP_TEMPLATES[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplate.id);
  const [labMode, setLabMode] = useState<LabMode>('reference');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(defaultTemplate.features[0]?.id ?? '');

  // Studio canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgOverlayRef = useRef<SVGSVGElement | null>(null);
  const [drawTool, setDrawTool] = useState<DrawTool>('pen');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [labelTextInput, setLabelTextInput] = useState<string>('مضيق باب المندب');
  const [showOutlineGuide, setShowOutlineGuide] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const isDrawingRef = useRef<boolean>(false);
  const undoStackRef = useRef<ImageData[]>([]);

  // Blank Map Labeling Challenge state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizMatches, setQuizMatches] = useState<Record<string, boolean>>({});
  const [quizFeedback, setQuizFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const template: TextbookMapTemplate =
    TEXTBOOK_MAP_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? TEXTBOOK_MAP_TEMPLATES[0];

  const selectedFeature: MapFeaturePoint | undefined =
    template.features.find((f) => f.id === selectedFeatureId) ?? template.features[0];

  const handleSelectTemplate = (id: string) => {
    const next = TEXTBOOK_MAP_TEMPLATES.find((t) => t.id === id) ?? TEXTBOOK_MAP_TEMPLATES[0];
    setSelectedTemplateId(id);
    setSelectedFeatureId(next.features[0]?.id ?? '');
    setLabelTextInput(next.features[0]?.label.split('(')[0].trim() ?? '');
    setCheckedSteps({});
    setQuizIndex(0);
    setQuizMatches({});
    setQuizFeedback(null);
    clearCanvas();
  };

  const pushUndoSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prev = undoStackRef.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
  };

  useEffect(() => {
    if (labMode === 'studio') {
      undoStackRef.current = [];
    }
  }, [labMode]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = getCanvasPoint(e);

    pushUndoSnapshot();

    if (drawTool === 'text') {
      const txt = labelTextInput.trim();
      if (!txt) return;
      ctx.save();
      ctx.font = 'bold 16px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(txt, pt.x, pt.y);
      ctx.fillStyle = penColor;
      ctx.fillText(txt, pt.x, pt.y);
      ctx.restore();
      return;
    }

    isDrawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || drawTool === 'text') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = getCanvasPoint(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = brushSize;
    }
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const onCanvasPointerUp = () => {
    isDrawingRef.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.closePath();
    }
  };

  const handleExportPng = () => {
    const drawingCanvas = canvasRef.current;
    const svgEl = svgOverlayRef.current;
    if (!drawingCanvas || !svgEl) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1000;
    exportCanvas.height = 600;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 600);

    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1000, 600);
      ctx.drawImage(drawingCanvas, 0, 0, 1000, 600);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `${template.id}-رسم-الطالب.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  // Quiz handlers
  const targetFeature = template.features[quizIndex];
  const quizSolvedCount = Object.values(quizMatches).filter(Boolean).length;

  const handleQuizPinClick = (clickedFeature: MapFeaturePoint) => {
    if (!targetFeature) return;
    if (clickedFeature.id === targetFeature.id) {
      const updated = { ...quizMatches, [targetFeature.id]: true };
      setQuizMatches(updated);
      setQuizFeedback({
        ok: true,
        msg: `أحسنت! موقع «${targetFeature.label}» صحيح — ${targetFeature.detail}`
      });
      const nextUnanswered = template.features.findIndex((f, i) => i > quizIndex && !updated[f.id]);
      if (nextUnanswered !== -1) {
        setQuizIndex(nextUnanswered);
      } else {
        const firstRemaining = template.features.findIndex((f) => !updated[f.id]);
        if (firstRemaining !== -1) setQuizIndex(firstRemaining);
      }
    } else {
      setQuizFeedback({
        ok: false,
        msg: `هذا الموضع يمثل «${clickedFeature.label}». حاول تحديد موقع «${targetFeature.label}».`
      });
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Mode Switcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              قسم تعلم رسم الخرائط وكتابة البيانات
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              خرائط تفصيلية مطابقة لخرائط الكتاب الرسمي للصف التاسع مع مرسم تفاعلي للخريطة الصماء وتحدي تعيين البيانات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setLabMode('reference')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                labMode === 'reference'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-sky-600" />
              <span>1. الخريطة التفصيلية المطابقة للكتاب</span>
            </button>
            <button
              type="button"
              onClick={() => setLabMode('studio')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                labMode === 'studio'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="h-3.5 w-3.5 text-emerald-600" />
              <span>2. مرسم الخريطة الصماء والكتابة</span>
            </button>
            <button
              type="button"
              onClick={() => setLabMode('quiz')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                labMode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="h-3.5 w-3.5 text-rose-600" />
              <span>3. تحدي تعيين البيانات</span>
            </button>
          </div>
        </div>

        {/* 6 Official Textbook Templates Strip */}
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEXTBOOK_MAP_TEMPLATES.map((t) => {
            const active = t.id === template.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTemplate(t.id)}
                className={`flex flex-col items-start justify-between rounded-lg border p-3 text-right transition-colors ${
                  active
                    ? 'border-sky-600 bg-sky-50/70 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-[11px] font-semibold text-sky-700">{t.bookMapRef}</span>
                <span className="mt-1 text-xs font-bold leading-snug">{t.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left/Main Map Canvas Area */}
        <div className="space-y-4 lg:col-span-8">
          {labMode === 'reference' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
              <DetailedTextbookMapSvg
                template={template}
                selectedFeatureId={selectedFeatureId}
                onSelectFeature={setSelectedFeatureId}
              />
            </div>
          )}

          {labMode === 'studio' && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              {/* Drawing & Labeling Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDrawTool('pen')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      drawTool === 'pen' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700'
                    }`}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>قلم الرسم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawTool('text')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      drawTool === 'text' ? 'bg-sky-600 text-white' : 'border border-slate-200 text-slate-700'
                    }`}
                  >
                    <TypeIcon className="h-3.5 w-3.5" />
                    <span>كتابة بيان على الخريطة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawTool('eraser')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      drawTool === 'eraser' ? 'bg-amber-600 text-white' : 'border border-slate-200 text-slate-700'
                    }`}
                  >
                    <Eraser className="h-3.5 w-3.5" />
                    <span>ممحاة</span>
                  </button>
                </div>

                {/* Colors & Size */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { c: '#0f172a', label: 'حدود' },
                    { c: '#0284c7', label: 'مياه' },
                    { c: '#059669', label: 'سهول/محميات' },
                    { c: '#b45309', label: 'تضاريس' },
                    { c: '#dc2626', label: 'معلم' }
                  ].map((item) => (
                    <button
                      key={item.c}
                      type="button"
                      onClick={() => setPenColor(item.c)}
                      title={item.label}
                      style={{ backgroundColor: item.c }}
                      className={`h-6 w-6 rounded-full border-2 ${
                        penColor === item.c ? 'border-slate-900 ring-2 ring-sky-400' : 'border-white'
                      }`}
                    />
                  ))}
                  <select
                    aria-label="سُمك الخط"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                  >
                    <option value={2}>رفيع</option>
                    <option value={3}>متوسط</option>
                    <option value={6}>سميك</option>
                  </select>
                </div>
              </div>

              {/* Text Label Stamp Input + Quick Fill */}
              {drawTool === 'text' && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-semibold text-sky-950">النص المراد كتابته بالنقر على الخريطة:</label>
                    <input
                      type="text"
                      value={labelTextInput}
                      onChange={(e) => setLabelTextInput(e.target.value)}
                      placeholder="اكتب اسم الظاهرة أو المدينة..."
                      className="min-w-[200px] flex-1 rounded-md border border-sky-200 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-slate-500">تعبئة سريعة من الكتاب:</span>
                    {template.features.map((f) => {
                      const short = f.label.split('(')[0].trim();
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setLabelTextInput(short)}
                          className="rounded border border-sky-200 bg-white px-2 py-0.5 text-[11px] text-sky-900 hover:bg-sky-100"
                        >
                          {short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guide & Export Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOutlineGuide((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    {showOutlineGuide ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{showOutlineGuide ? 'إخفاء حدود التتبع الصماء' : 'إظهار حدود التتبع الصماء'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGrid((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>{showGrid ? 'إخفاء الشبكة' : 'إظهار الشبكة'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>تراجع</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>مسح</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPng}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>حفظ الرسم PNG</span>
                  </button>
                </div>
              </div>

              {/* Layered Tracing Base + Interactive HTML5 Canvas */}
              <div className="relative aspect-[1000/600] w-full overflow-hidden rounded-lg border border-slate-300 bg-sky-50/40">
                <svg
                  ref={svgOverlayRef}
                  viewBox="0 0 1000 600"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <rect x="0" y="0" width="1000" height="600" fill="#f8fafc" />
                  {showGrid && (
                    <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4">
                      {[100, 200, 300, 400, 500].map((y) => (
                        <line key={`hy-${y}`} x1="0" y1={y} x2="1000" y2={y} />
                      ))}
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                        <line key={`vx-${x}`} x1={x} y1="0" x2={x} y2="600" />
                      ))}
                    </g>
                  )}
                  {showOutlineGuide && (
                    <g opacity="0.55">
                      {template.scope === 'yemen' ? (
                        <>
                          <polygon
                            points={YEMEN_OUTLINE_PTS}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                          />
                          <polygon
                            points={SOCOTRA_OUTLINE_PTS}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                        </>
                      ) : (
                        <>
                          <polygon
                            points={ARAB_AFRICA_PTS}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="1.8"
                            strokeDasharray="6 4"
                          />
                          <polygon
                            points={ARAB_ASIA_PTS}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="1.8"
                            strokeDasharray="6 4"
                          />
                        </>
                      )}
                    </g>
                  )}
                </svg>

                <canvas
                  ref={canvasRef}
                  width={1000}
                  height={600}
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onCanvasPointerMove}
                  onPointerUp={onCanvasPointerUp}
                  onPointerLeave={onCanvasPointerUp}
                  className={`relative z-10 h-full w-full touch-none ${
                    drawTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
                  }`}
                />
              </div>
            </div>
          )}

          {labMode === 'quiz' && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900 p-4 text-white">
                <div>
                  <div className="text-xs text-slate-300">
                    سؤال تعيين البيانات (<span className="font-mono tabular-nums">{quizSolvedCount}</span> /{' '}
                    <span className="font-mono tabular-nums">{template.features.length}</span> مكتمل)
                  </div>
                  <div className="font-display mt-1 text-base font-bold">
                    {targetFeature
                      ? `عيّن على الخريطة الصماء: «${targetFeature.label}»`
                      : 'اكتمل تعيين جميع بيانات هذه الخريطة!'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuizMatches({});
                    setQuizIndex(0);
                    setQuizFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إعادة التحدي</span>
                </button>
              </div>

              {quizFeedback && (
                <div
                  className={`rounded-lg border p-3 text-xs font-medium ${
                    quizFeedback.ok
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  {quizFeedback.msg}
                </div>
              )}

              {template.id === 'map-yemen-location' && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-xs text-sky-950">
                  تنبيه منهجي: هذه الخريطة تمثل <strong>حدود الجمهورية اليمنية (ص 9)</strong>؛ وتظهر أراضي الجوار شمالاً (السعودية) وشرقاً (عُمان) باللون الرمادي المحايد فقط لتحديد حدود اليمن البرية، وليست اختباراً خارجياً منفصلاً.
                </div>
              )}

              {/* Blank Map with Clickable Target Circles */}
              <svg viewBox="0 0 1000 600" className="h-auto w-full rounded-lg border border-slate-200 bg-sky-50">
                <rect x="0" y="0" width="1000" height="600" fill="#bae6fd" />
                {template.scope === 'yemen' ? (
                  <>
                    {/* Neighboring Arabian Peninsula Landmass (North & East borders of Yemen) */}
                    <path
                      d="M 50,40 L 950,40 L 950,164 L 879,203 L 796,229 L 725,73 L 404,79 L 243,177 L 159,170 L 134,242 L 75,110 Z"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                    <line x1="725" y1="73" x2="757" y2="40" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
                    <polygon points={YEMEN_OUTLINE_PTS} fill="#ecfdf5" stroke="#065f46" strokeWidth="2" />
                    <polygon points={SOCOTRA_OUTLINE_PTS} fill="#ecfdf5" stroke="#065f46" strokeWidth="1.8" />
                  </>
                ) : (
                  <>
                    <polygon points={ARAB_AFRICA_PTS} fill="#ecfdf5" stroke="#065f46" strokeWidth="1.8" />
                    <polygon points={ARAB_ASIA_PTS} fill="#f0fdf4" stroke="#065f46" strokeWidth="1.8" />
                    <g transform="translate(795, 442)">
                      <rect width="155" height="96" rx="8" fill="#ffffff" stroke="#0369a1" strokeWidth="1.2" />
                    </g>
                  </>
                )}

                {template.paths.map((path) => (
                  <path
                    key={path.id}
                    d={path.d}
                    stroke={path.color}
                    strokeWidth={path.width ?? 2}
                    strokeDasharray={path.dashed ? '6 4' : undefined}
                    fill="none"
                    opacity="0.65"
                  />
                ))}

                {template.features.map((feat, idx) => {
                  const solved = quizMatches[feat.id];
                  const dx = feat.labelDx ?? 0;
                  const dy = feat.labelDy ?? -16;
                  return (
                    <g
                      key={feat.id}
                      transform={`translate(${feat.x}, ${feat.y})`}
                      onClick={() => handleQuizPinClick(feat)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={solved ? 9 : 11}
                        fill={solved ? '#059669' : '#ffffff'}
                        stroke={solved ? '#ffffff' : '#0f172a'}
                        strokeWidth="2.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={solved ? '#ffffff' : '#0f172a'}
                        fontSize="10"
                        fontWeight="800"
                      >
                        {solved ? '✓' : idx + 1}
                      </text>
                      {solved && (
                        <text
                          x={dx}
                          y={dy}
                          textAnchor="middle"
                          fill="#064e3b"
                          fontSize="10.5"
                          fontWeight="700"
                          paintOrder="stroke"
                          stroke="#ffffff"
                          strokeWidth="3"
                        >
                          {feat.label.split('(')[0].trim()}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Right Guidance, Legend & Textbook Steps Sidebar */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-sky-700">{template.bookMapRef}</div>
            <h2 className="font-display mt-1 text-lg font-bold text-slate-900">{template.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{template.description}</p>

            {/* Official Map Legend */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="text-xs font-bold text-slate-800">مفتاح الخريطة الرسمي:</div>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                {template.legend.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {item.shape === 'dot' && (
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    )}
                    {item.shape === 'line' && (
                      <span className="h-0.5 w-4 shrink-0" style={{ backgroundColor: item.color }} />
                    )}
                    {item.shape === 'area' && (
                      <span className="h-3 w-3 shrink-0 rounded-sm border border-slate-300" style={{ backgroundColor: item.color }} />
                    )}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selected Feature Detail in Reference Mode */}
            {labMode === 'reference' && selectedFeature && (
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/70 p-3">
                <div className="text-[11px] font-semibold text-sky-700">{selectedFeature.category}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-900">{selectedFeature.label}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{selectedFeature.detail}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => onGoToLesson(template.unitId, template.lessonId)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4" />
              <span>الانتقال إلى الدرس المرتبط في الكتاب</span>
            </button>
          </div>

          {/* Step-by-step Drawing Guide */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold text-slate-900">
              خطوات تعلم رسم الخريطة وكتابة بياناتها
            </h3>
            <ol className="mt-3 space-y-2">
              {template.drawingSteps.map((step, i) => {
                const done = !!checkedSteps[i];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setCheckedSteps((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-right text-xs transition-colors ${
                        done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${done ? 'text-emerald-600' : 'text-slate-400'}`}
                      />
                      <span className="leading-relaxed">
                        <strong className="font-mono">{i + 1}. </strong>
                        {step}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ================= DETAILED REFERENCE SVG RENDERER =================

const DetailedTextbookMapSvg: React.FC<{
  template: TextbookMapTemplate;
  selectedFeatureId: string;
  onSelectFeature: (id: string) => void;
}> = ({ template, selectedFeatureId, onSelectFeature }) => {
  return (
    <svg
      viewBox="0 0 1000 600"
      role="img"
      aria-label={template.title}
      className="h-auto w-full select-none rounded-lg"
    >
      <defs>
        <linearGradient id="refOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="refYemenLand" x1="0%" y1="40%" x2="100%" y2="25%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="45%" stopColor="#d9f99d" />
          <stop offset="100%" stopColor="#e7d7bd" />
        </linearGradient>
        <linearGradient id="refArabLand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="55%" stopColor="#d9f99d" />
          <stop offset="100%" stopColor="#ecfccb" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1000" height="600" fill="url(#refOceanGrad)" />

      {/* Base Geography */}
      {template.scope === 'yemen' ? (
        <>
          <path
            d="M 50,40 L 950,40 L 950,164 L 879,203 L 796,229 L 725,73 L 404,79 L 243,177 L 159,170 L 134,242 L 75,110 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
          />
          <line x1="725" y1="73" x2="757" y2="40" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
          {[12, 14, 16, 18].map((lat) => {
            const p = projectYemen(lat, 42);
            return (
              <g key={lat}>
                <line x1="50" y1={p.y} x2="950" y2={p.y} stroke="#0369a1" strokeOpacity="0.22" strokeDasharray="4 4" />
                <text x="16" y={p.y + 4} fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono">
                  {lat}°N
                </text>
              </g>
            );
          })}
          {[42, 46, 50, 54].map((lng) => {
            const p = projectYemen(12, lng);
            return (
              <g key={lng}>
                <line x1={p.x} y1="40" x2={p.x} y2="560" stroke="#0369a1" strokeOpacity="0.22" strokeDasharray="4 4" />
                <text x={p.x - 14} y="582" fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono">
                  {lng}°E
                </text>
              </g>
            );
          })}
          <polygon points={YEMEN_OUTLINE_PTS} fill="url(#refYemenLand)" stroke="#065f46" strokeWidth="2.2" />
          <polygon points={SOCOTRA_OUTLINE_PTS} fill="#4ade80" stroke="#065f46" strokeWidth="1.8" />
        </>
      ) : (
        <>
          {(() => {
            const eq = projectArabWorld(0, 0);
            const cancer = projectArabWorld(23.5, 0);
            return (
              <>
                <line x1="40" y1={eq.y} x2="960" y2={eq.y} stroke="#ffffff" strokeDasharray="5 5" opacity="0.7" />
                <text x="50" y={eq.y - 6} fill="#ffffff" fontSize="10.5">خط الاستواء 0°</text>
                <line x1="40" y1={cancer.y} x2="960" y2={cancer.y} stroke="#fef3c7" strokeDasharray="5 5" opacity="0.75" />
                <text x="50" y={cancer.y - 6} fill="#fef3c7" fontSize="10.5">مدار السرطان 23.5°N</text>
              </>
            );
          })()}
          <polygon points={ARAB_AFRICA_PTS} fill="url(#refArabLand)" stroke="#065f46" strokeWidth="1.8" />
          <polygon points={ARAB_ASIA_PTS} fill="#bbf7d0" stroke="#065f46" strokeWidth="1.8" />
          <g transform="translate(795, 442)">
            <rect width="155" height="96" rx="8" fill="#ffffff" fillOpacity="0.94" stroke="#0369a1" />
            <text x="12" y="21" fill="#0f172a" fontSize="10" fontWeight="700">إطار جزر القمر (11°–13°S)</text>
            <circle cx="62" cy="46" r="6" fill="#059669" />
            <circle cx="84" cy="54" r="4.5" fill="#059669" />
          </g>
        </>
      )}

      {/* Template Specific Zones */}
      {template.zones.map((z) => (
        <path key={z.id} d={z.d} fill={z.color} fillOpacity="0.48" stroke={z.color} strokeWidth="1.2" />
      ))}

      {/* Template Specific Paths (Wadis, Rivers, Roads, Shipping Lanes) */}
      {template.paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke={p.color}
          strokeWidth={p.width ?? 2.2}
          strokeDasharray={p.dashed ? '6 4' : undefined}
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {/* Compass Rose */}
      <g transform="translate(932, 82)">
        <circle r="20" fill="#ffffff" fillOpacity="0.92" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="0,-14 3.5,0 0,-2.5 -3.5,0" fill="#dc2626" />
        <polygon points="0,14 3.5,0 0,2.5 -3.5,0" fill="#334155" />
        <text x="0" y="-22" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">ش</text>
      </g>

      {/* Template Features with Non-Overlapping Leader Labels */}
      {template.features.map((feat) => {
        const active = feat.id === selectedFeatureId;
        const dx = feat.labelDx ?? 0;
        const dy = feat.labelDy ?? -16;
        const dist = Math.hypot(dx, dy);

        return (
          <g
            key={feat.id}
            transform={`translate(${feat.x}, ${feat.y})`}
            onClick={() => onSelectFeature(feat.id)}
            className="cursor-pointer"
          >
            {dist > 16 && (
              <line
                x1="0"
                y1="0"
                x2={dx}
                y2={dy > 0 ? dy - 8 : dy + 4}
                stroke={active ? '#be123c' : '#475569'}
                strokeWidth={active ? '1.4' : '1'}
                strokeDasharray={active ? undefined : '2.5 2'}
              />
            )}
            {active && <circle r="14" fill={feat.color} opacity="0.25" />}
            <circle
              r={active ? 8 : 5.5}
              fill={feat.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={dx}
              y={dy}
              textAnchor="middle"
              fill={active ? '#0f172a' : '#1e293b'}
              fontSize={active ? '11.5' : '10.5'}
              fontWeight={active ? '800' : '700'}
              paintOrder="stroke"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
            >
              {feat.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
