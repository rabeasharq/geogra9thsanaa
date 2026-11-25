import React, { useMemo, useRef, useState } from 'react';
import { ATLAS_LOCATIONS, getLessonById, getUnitById, projectYemen, projectArabWorld } from '../data/bookIndex';
import { AtlasLayer, AtlasLocation, AtlasScope } from '../types/textbook';
import Atlas3DCanvas, { Atlas3DMode } from './Atlas3DCanvas';
import {
  Compass,
  Layers,
  Box,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  CheckSquare,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool
} from 'lucide-react';

interface AtlasPortalProps {
  initialLocationId?: string;
  onSelectLocationChange: (locId: string) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToStudyGuide: (unitId: string) => void;
  onGoToTraining: (unitId: string, lessonId: string) => void;
  onGoToMapLab?: (scope: AtlasScope) => void;
}

const LAYER_LABELS: { id: AtlasLayer | 'all'; label: string }[] = [
  { id: 'all', label: 'جميع الطبقات' },
  { id: 'topography', label: 'التضاريس' },
  { id: 'water', label: 'المياه والأودية' },
  { id: 'climate', label: 'المناخ' },
  { id: 'reserves', label: 'المحميات' },
  { id: 'population', label: 'السكان' },
  { id: 'economy', label: 'الموارد والموانئ' },
  { id: 'tourism', label: 'المعالم السياحية' }
];

const LAYER_COLORS: Record<AtlasLayer, string> = {
  topography: '#b45309',
  water: '#0284c7',
  climate: '#0d9488',
  reserves: '#059669',
  population: '#7c3aed',
  economy: '#e11d48',
  tourism: '#4338ca'
};

export const AtlasPortal: React.FC<AtlasPortalProps> = ({
  initialLocationId,
  onSelectLocationChange,
  onGoToLesson,
  onGoToStudyGuide,
  onGoToTraining,
  onGoToMapLab
}) => {
  const initialLoc =
    ATLAS_LOCATIONS.find((l) => l.id === initialLocationId) ?? ATLAS_LOCATIONS[0];

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [threeDMode, setThreeDMode] = useState<Atlas3DMode>(
    initialLoc.scope === 'yemen' ? 'yemen-relief' : 'arab-world-relief'
  );
  const [scope, setScope] = useState<AtlasScope>(initialLoc.scope);
  const [activeLayer, setActiveLayer] = useState<AtlasLayer | 'all'>('all');
  const [selectedLocId, setSelectedLocId] = useState<string>(initialLoc.id);

  // 2D Map Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null);

  React.useEffect(() => {
    if (initialLocationId) {
      const found = ATLAS_LOCATIONS.find((l) => l.id === initialLocationId);
      if (found) {
        setSelectedLocId(found.id);
        setScope(found.scope);
        setViewMode('2d');
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setActiveLayer((prev) => (prev !== 'all' && found.layer !== prev ? 'all' : prev));
      }
    }
  }, [initialLocationId]);

  const filteredLocations = useMemo(() => {
    return ATLAS_LOCATIONS.filter(
      (loc) => loc.scope === scope && (activeLayer === 'all' || loc.layer === activeLayer)
    );
  }, [scope, activeLayer]);

  const selectedLocation =
    ATLAS_LOCATIONS.find((l) => l.id === selectedLocId) ?? filteredLocations[0] ?? ATLAS_LOCATIONS[0];

  const handleSelectLoc = (id: string) => {
    setSelectedLocId(id);
    onSelectLocationChange(id);
    const found = ATLAS_LOCATIONS.find((l) => l.id === id);
    if (found && viewMode === '2d' && found.scope !== scope) {
      setScope(found.scope);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const resetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Journey stepper across all textbook-ordered locations
  const journeyIndex = ATLAS_LOCATIONS.findIndex((l) => l.id === selectedLocation.id);
  const goPrevStop = () => {
    const prevIdx = (journeyIndex - 1 + ATLAS_LOCATIONS.length) % ATLAS_LOCATIONS.length;
    handleSelectLoc(ATLAS_LOCATIONS[prevIdx].id);
  };
  const goNextStop = () => {
    const nextIdx = (journeyIndex + 1) % ATLAS_LOCATIONS.length;
    handleSelectLoc(ATLAS_LOCATIONS[nextIdx].id);
  };

  const linkedLesson = getLessonById(selectedLocation.lessonId);
  const linkedUnit = getUnitById(selectedLocation.unitId);

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-3 py-5 sm:px-6 sm:py-6">
      {/* Atlas Control Toolbar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              أطلس الرحلة الجغرافية التفاعلي
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              أطلس هجين (ثنائي وثلاثي الأبعاد مُضمّن أوفلاين بالكامل) مرتب وفق وحدات الكتاب ودروسه — جميع المواقع موثقة من الكتاب الرسمي.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {onGoToMapLab && (
              <button
                type="button"
                onClick={() => onGoToMapLab(scope)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>تعلّم رسم هذه الخريطة</span>
              </button>
            )}

            {/* 2D vs 3D View Toggle */}
            <div className="flex w-full flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-initial ${
                  viewMode === '2d'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5 shrink-0" />
                <span>خريطة الطبقات (2D)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('3d');
                  setThreeDMode(scope === 'yemen' ? 'yemen-relief' : 'arab-world-relief');
                }}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-initial ${
                  viewMode === '3d'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Box className="h-3.5 w-3.5 shrink-0" />
                <span>تصور ثلاثي الأبعاد (3D)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scope & Layer Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {viewMode === '2d' ? (
            <>
              <div className="flex w-full flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setScope('yemen');
                    resetZoomPan();
                    const first = ATLAS_LOCATIONS.find((l) => l.scope === 'yemen');
                    if (first) handleSelectLoc(first.id);
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors sm:flex-initial ${
                    scope === 'yemen' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  نطاق الجمهورية اليمنية (الوحدتان 1 و2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScope('arab-world');
                    resetZoomPan();
                    const first = ATLAS_LOCATIONS.find((l) => l.scope === 'arab-world');
                    if (first) handleSelectLoc(first.id);
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors sm:flex-initial ${
                    scope === 'arab-world' ? 'bg-sky-700 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  نطاق الوطن العربي (الوحدتان 3 و4)
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Layers className="ml-1 h-4 w-4 text-slate-400" />
                {LAYER_LABELS.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayer(layer.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeLayer === layer.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">نموذج التصور ثلاثي الأبعاد (مُضمّن أوفلاين):</span>
              <button
                type="button"
                onClick={() => {
                  setThreeDMode('yemen-relief');
                  setScope('yemen');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  threeDMode === 'yemen-relief'
                    ? 'bg-emerald-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                تضاريس اليمن الحقيقية 3D (الجبال والأودية)
              </button>
              <button
                type="button"
                onClick={() => {
                  setThreeDMode('arab-world-relief');
                  setScope('arab-world');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  threeDMode === 'arab-world-relief'
                    ? 'bg-sky-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                تضاريس الوطن العربي 3D (الأطلس والأنهار)
              </button>
              <button
                type="button"
                onClick={() => setThreeDMode('globe')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  threeDMode === 'globe'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                الكرة الأرضية المرجعية
              </button>
              <button
                type="button"
                onClick={() => setThreeDMode('mountains-3d')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  threeDMode === 'mountains-3d'
                    ? 'bg-amber-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                تكوين الجبال 3D (ص 67)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Split: Interactive Map/3D Stage + Location Inspector */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Stage */}
        <div className="min-w-0 space-y-4 lg:col-span-7 xl:col-span-8">
          {viewMode === '2d' ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5">
              {/* Zoom & Pan Floating Toolbar */}
              <div className="no-print absolute top-4 left-4 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.3).toFixed(2))))}
                  title="تكبير الخريطة"
                  className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <span className="px-1 font-mono text-[11px] font-semibold tabular-nums text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => {
                      const next = Math.max(1, Number((z - 0.3).toFixed(2)));
                      if (next === 1) setPan({ x: 0, y: 0 });
                      return next;
                    })
                  }
                  title="تصغير الخريطة"
                  className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                {zoom > 1 && (
                  <button
                    type="button"
                    onClick={resetZoomPan}
                    title="إعادة الضبط"
                    className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Pan-enabled viewport */}
              <div
                className={`overflow-hidden rounded-lg ${zoom > 1 ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
                onPointerDown={(e) => {
                  if (zoom <= 1) return;
                  dragStartRef.current = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    panX: pan.x,
                    panY: pan.y
                  };
                }}
                onPointerMove={(e) => {
                  if (!dragStartRef.current || zoom <= 1) return;
                  const dx = e.clientX - dragStartRef.current.clientX;
                  const dy = e.clientY - dragStartRef.current.clientY;
                  setPan({
                    x: Math.max(-280, Math.min(280, dragStartRef.current.panX + dx)),
                    y: Math.max(-180, Math.min(180, dragStartRef.current.panY + dy))
                  });
                }}
                onPointerUp={() => {
                  dragStartRef.current = null;
                }}
                onPointerLeave={() => {
                  dragStartRef.current = null;
                }}
              >
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: dragStartRef.current ? 'none' : 'transform 160ms ease-out'
                  }}
                >
                  {scope === 'yemen' ? (
                    <YemenSvgMap
                      locations={filteredLocations}
                      selectedId={selectedLocation.id}
                      activeLayer={activeLayer}
                      onSelect={handleSelectLoc}
                    />
                  ) : (
                    <ArabWorldSvgMap
                      locations={filteredLocations}
                      selectedId={selectedLocation.id}
                      activeLayer={activeLayer}
                      onSelect={handleSelectLoc}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Atlas3DCanvas
              mode={threeDMode}
              locations={ATLAS_LOCATIONS}
              selectedLocationId={selectedLocation.id}
              onSelectLocation={handleSelectLoc}
            />
          )}

          {/* Ordered Journey Stepper */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={goPrevStop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
              <span>المحطة السابقة</span>
            </button>

            <div className="text-center text-xs">
              <div className="font-bold text-slate-900">
                محطة الرحلة الجغرافية <span className="font-mono tabular-nums">{journeyIndex + 1}</span> من{' '}
                <span className="font-mono tabular-nums">{ATLAS_LOCATIONS.length}</span>
              </div>
              <div className="mt-0.5 text-slate-500">مرتبة تسلسلياً حسب دروس الكتاب</div>
            </div>

            <button
              type="button"
              onClick={goNextStop}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <span>المحطة التالية</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Location Details & Cross-Links */}
        <aside className="min-w-0 space-y-4 lg:col-span-5 xl:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <Compass className="h-3.5 w-3.5" />
                <span>{selectedLocation.scope === 'yemen' ? 'الجمهورية اليمنية' : 'الوطن العربي'}</span>
              </span>
              <span className="font-mono tabular-nums">{selectedLocation.pageRef}</span>
            </div>

            <h2 className="font-display mt-2 text-lg font-bold text-slate-900">
              {selectedLocation.name}
            </h2>

            <div className="mt-2 flex flex-wrap gap-3 text-xs font-mono tabular-nums text-slate-500">
              <span>عرض: {selectedLocation.lat.toFixed(2)}°</span>
              <span>طول: {selectedLocation.lng.toFixed(2)}°</span>
              {selectedLocation.elevationMeters && <span>ارتفاع: {selectedLocation.elevationMeters}م</span>}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">{selectedLocation.summary}</p>

            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-700">
              {selectedLocation.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              {linkedLesson && linkedUnit && (
                <button
                  type="button"
                  onClick={() => onGoToLesson(linkedUnit.id, linkedLesson.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg bg-sky-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  <span className="flex min-w-0 items-center gap-2 text-right">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">فتح الدرس المرتبط: {linkedLesson.title}</span>
                  </span>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onGoToStudyGuide(selectedLocation.unitId)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  <span>في الملزمة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onGoToTraining(selectedLocation.unitId, selectedLocation.lessonId)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                  <span>تدرّب عليه</span>
                </button>
              </div>
            </div>
          </div>

          {/* Locations Directory */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>قائمة المواقع الموثقة ({filteredLocations.length})</span>
            </div>
            <div className="max-h-[250px] space-y-1 overflow-y-auto pl-1">
              {filteredLocations.map((loc) => {
                const active = loc.id === selectedLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLoc(loc.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-right text-xs transition-colors ${
                      active
                        ? 'bg-emerald-700 font-semibold text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </span>
                    <span className={`font-mono shrink-0 text-[11px] ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {loc.pageRef}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ================= SHARED NON-OVERLAPPING PIN RENDERER =================

const SmartPinLayer: React.FC<{
  locations: AtlasLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ locations, selectedId, onSelect }) => {
  // Draw unselected pins first, then selected pin on top so active label stays crisp
  const sorted = [...locations].sort((a, b) =>
    a.id === selectedId ? 1 : b.id === selectedId ? -1 : 0
  );

  return (
    <g>
      {sorted.map((loc) => {
        const isSelected = loc.id === selectedId;
        const dx = loc.labelDx ?? 0;
        const dy = loc.labelDy ?? -16;
        const dist = Math.hypot(dx, dy);
        const pinColor = isSelected ? '#e11d48' : LAYER_COLORS[loc.layer] ?? '#0284c7';
        const label = loc.shortLabel ?? loc.name.split('(')[0].trim();

        return (
          <g
            key={loc.id}
            transform={`translate(${loc.svgX}, ${loc.svgY})`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(loc.id);
            }}
            className="cursor-pointer"
          >
            {/* Leader line when offset is substantial */}
            {dist > 18 && (
              <line
                x1="0"
                y1="0"
                x2={dx}
                y2={dy > 0 ? dy - 8 : dy + 4}
                stroke={isSelected ? '#be123c' : '#475569'}
                strokeWidth={isSelected ? '1.3' : '0.9'}
                strokeDasharray={isSelected ? undefined : '2.5 2'}
                opacity={isSelected ? 0.9 : 0.65}
              />
            )}

            {isSelected && <circle r="15" fill="#f43f5e" opacity="0.22" />}
            <circle
              r={isSelected ? 7.5 : 5}
              fill={pinColor}
              stroke="#ffffff"
              strokeWidth="2"
            />

            <text
              x={dx}
              y={dy}
              textAnchor="middle"
              fill={isSelected ? '#881337' : '#0f172a'}
              fontSize={isSelected ? '11.5' : '10'}
              fontWeight={isSelected ? '800' : '600'}
              paintOrder="stroke"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ================= VIBRANT 2D CARTOGRAPHIC SVG MAPS =================

export const YemenSvgMap: React.FC<{
  locations: AtlasLocation[];
  selectedId: string;
  activeLayer: AtlasLayer | 'all';
  onSelect: (id: string) => void;
}> = ({ locations, selectedId, activeLayer, onSelect }) => {
  const yemenPolygonPoints = [
    [16.4, 42.8], [17.5, 43.2], [17.4, 44.5], [18.9, 47.0], [19.0, 52.0],
    [16.6, 53.1], [15.6, 52.1], [14.5, 49.2], [13.5, 46.8], [12.8, 45.0],
    [12.68, 43.42], [13.3, 43.25], [14.8, 42.95], [15.8, 42.8]
  ]
    .map(([la, ln]) => {
      const p = projectYemen(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const socotraPoly = [
    [12.7, 53.3], [12.65, 54.45], [12.35, 54.35], [12.32, 53.4]
  ]
    .map(([la, ln]) => {
      const p = projectYemen(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const showTopo = activeLayer === 'all' || activeLayer === 'topography';
  const showClimate = activeLayer === 'climate';
  const showPopulation = activeLayer === 'population';
  const showWater = activeLayer === 'all' || activeLayer === 'water';

  return (
    <svg
      viewBox="0 0 1000 600"
      role="img"
      aria-label="خريطة الجمهورية اليمنية التفاعلية متعددة الطبقات"
      className="block h-auto w-full select-none overflow-hidden rounded-lg"
    >
      <defs>
        {/* Vibrant Deep-to-Coastal Ocean Bathymetry Gradient */}
        <linearGradient id="yemenOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Vibrant Natural Terrain Base: Emerald Highlands -> Warm Sandstone East */}
        <linearGradient id="yemenLandGrad" x1="0%" y1="40%" x2="100%" y2="30%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="22%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#d9f99d" />
          <stop offset="78%" stopColor="#ecfccb" />
          <stop offset="100%" stopColor="#e7d7bd" />
        </linearGradient>

        <linearGradient id="highlandRidgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#b45309" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.25" />
        </linearGradient>

        <filter id="yemenLandShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0c4a6e" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ocean Base */}
      <rect x="0" y="0" width="1000" height="600" fill="url(#yemenOceanGrad)" />

      {/* Neighboring Landmass (Saudi Arabia & Oman) aligned to Yemen's borders */}
      <path
        d="M 50,40 L 950,40 L 950,164 L 879,203 L 796,229 L 725,73 L 404,79 L 243,177 L 159,170 L 134,242 L 75,110 Z"
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <line x1="725" y1="73" x2="757" y2="40" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />

      {/* Graticule Lines */}
      {[12, 14, 16, 18].map((lat) => {
        const p = projectYemen(lat, 42);
        return (
          <g key={lat}>
            <line x1="50" y1={p.y} x2="950" y2={p.y} stroke="#0369a1" strokeOpacity="0.22" strokeDasharray="4 4" strokeWidth="1" />
            <text x="16" y={p.y + 4} fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="600">
              {lat}°N
            </text>
          </g>
        );
      })}
      {[42, 46, 50, 54].map((lng) => {
        const p = projectYemen(12, lng);
        return (
          <g key={lng}>
            <line x1={p.x} y1="40" x2={p.x} y2="560" stroke="#0369a1" strokeOpacity="0.22" strokeDasharray="4 4" strokeWidth="1" />
            <text x={p.x - 14} y="582" fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="600">
              {lng}°E
            </text>
          </g>
        );
      })}

      {/* Coastal Reef Glow */}
      <polygon points={yemenPolygonPoints} fill="none" stroke="#e0f2fe" strokeWidth="9" strokeOpacity="0.55" />

      {/* Main Yemen Landmass */}
      <polygon
        points={yemenPolygonPoints}
        fill="url(#yemenLandGrad)"
        stroke="#065f46"
        strokeWidth="2.2"
        filter="url(#yemenLandShadow)"
      />

      {/* Socotra Archipelago */}
      <polygon
        points={socotraPoly}
        fill="#4ade80"
        stroke="#065f46"
        strokeWidth="1.8"
        filter="url(#yemenLandShadow)"
      />

      {/* Natural Relief Shading */}
      {showTopo && (
        <g>
          {/* Tihamah fertile emerald coastal belt */}
          <path
            d="M 134,242 L 164,242 L 178,472 L 146,472 Z"
            fill="#10b981"
            opacity="0.34"
          />
          {/* Western Highlands spine */}
          <ellipse cx="218" cy="316" rx="50" ry="122" fill="url(#highlandRidgeGrad)" />
          {/* Hadramout & Eastern Plateaus terraced warmth */}
          <ellipse cx="528" cy="276" rx="165" ry="56" fill="#d97706" opacity="0.16" />
        </g>
      )}

      {/* 4 Yemeni Climate Zones Overlay */}
      {showClimate && (
        <g>
          {/* الساحلي (تهامة والساحل الجنوبي) */}
          <path d="M 134,242 L 168,242 L 182,482 L 146,472 Z" fill="#f59e0b" opacity="0.42" />
          <path d="M 155,482 Q 360,445 640,340 L 660,362 Q 370,475 162,504 Z" fill="#f59e0b" opacity="0.36" />
          {/* متوسط الارتفاع (400–1500م) */}
          <ellipse cx="235" cy="350" rx="68" ry="118" fill="#84cc16" opacity="0.32" />
          {/* المرتفع (>1500م - أبرد صيفاً وشتاءً) */}
          <ellipse cx="212" cy="312" rx="42" ry="96" fill="#059669" opacity="0.48" />
          {/* الداخلي والصحراوي الجاف */}
          <ellipse cx="525" cy="240" rx="195" ry="78" fill="#ea580c" opacity="0.28" />
        </g>
      )}

      {/* Population Density Choropleth Overlay (Textbook Map p. 38–39) */}
      {showPopulation && (
        <g>
          {/* منخفضة (1–49 نسمة/كم²) في الصحراء والهضبة الشرقية */}
          <ellipse cx="555" cy="255" rx="220" ry="92" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.72" />
          {/* متوسطة (50–219 نسمة/كم²) في الأطراف الوسطى والسواحل */}
          <ellipse cx="242" cy="340" rx="88" ry="135" fill="#fb923c" stroke="#c2410c" strokeWidth="1.2" opacity="0.52" />
          {/* عالية وعالية جداً (>220 نسمة/كم²): تعز، إب، أمانة العاصمة، والحديدة */}
          <ellipse cx="206" cy="322" rx="44" ry="94" fill="#be123c" stroke="#881337" strokeWidth="1.5" opacity="0.62" />
          <ellipse cx="162" cy="342" rx="24" ry="52" fill="#be123c" opacity="0.54" />
          <circle cx="224" cy="422" r="26" fill="#9f1239" opacity="0.68" />
        </g>
      )}

      {/* Wadis & Surface Water Vectors */}
      {showWater && (
        <g stroke="#0369a1" strokeWidth="2.3" fill="none" strokeLinecap="round">
          <path d="M 205,288 Q 170,304 138,314" />
          <path d="M 212,358 Q 175,374 150,384" />
          <path d="M 480,275 Q 542,282 595,318" />
          <path d="M 248,300 Q 285,302 315,295" />
        </g>
      )}

      {/* Thematic SVG Legend Card (Population or Climate) */}
      {showPopulation && (
        <g transform="translate(22, 438)">
          <rect width="230" height="106" rx="8" fill="#ffffff" fillOpacity="0.94" stroke="#9f1239" strokeWidth="1.4" />
          <text x="216" y="21" textAnchor="end" fill="#0f172a" fontSize="11" fontWeight="800">
            مفتاح الكثافة السكانية (ص 38–39)
          </text>
          <rect x="196" y="34" width="16" height="12" rx="2" fill="#9f1239" opacity="0.82" />
          <text x="188" y="44" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
            عالية جداً (&gt;220 نسمة/كم²): تعز، صنعاء، إب، الحديدة
          </text>
          <rect x="196" y="56" width="16" height="12" rx="2" fill="#fb923c" opacity="0.75" />
          <text x="188" y="66" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
            متوسطة (50–219 نسمة/كم²): الوسط والسواحل
          </text>
          <rect x="196" y="78" width="16" height="12" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <text x="188" y="88" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
            منخفضة (1–49 نسمة/كم²): حضرموت، المهرة، مأرب
          </text>
        </g>
      )}
      {showClimate && (
        <g transform="translate(22, 438)">
          <rect width="222" height="108" rx="8" fill="#ffffff" fillOpacity="0.94" stroke="#065f46" strokeWidth="1.4" />
          <text x="208" y="20" textAnchor="end" fill="#0f172a" fontSize="11" fontWeight="800">
            الأقاليم المناخية في اليمن (ص 19)
          </text>
          <rect x="190" y="31" width="14" height="11" rx="2" fill="#f59e0b" opacity="0.75" />
          <text x="182" y="40" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">الإقليم الساحلي (حار رطب صيفاً)</text>
          <rect x="190" y="50" width="14" height="11" rx="2" fill="#84cc16" opacity="0.7" />
          <text x="182" y="59" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">متوسط الارتفاع (400–1500م)</text>
          <rect x="190" y="69" width="14" height="11" rx="2" fill="#059669" opacity="0.78" />
          <text x="182" y="78" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">المرتفع (&gt;1500م: أمطار صيفية غزيرة)</text>
          <rect x="190" y="88" width="14" height="11" rx="2" fill="#ea580c" opacity="0.6" />
          <text x="182" y="97" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">الداخلي الصحراوي (جاف قاري)</text>
        </g>
      )}

      {/* Maritime & Neighboring Country Labels */}
      <text x="415" y="102" fill="#475569" fontSize="13.5" fontWeight="700">
        المملكة العربية السعودية (شمالاً)
      </text>
      <text x="858" y="138" fill="#475569" fontSize="13" fontWeight="700">
        سلطنة عُمان
      </text>
      <text x="64" y="218" fill="#075985" fontSize="13" fontWeight="800" transform="rotate(-70 64,218)">
        البحر الأحمر
      </text>
      <text x="455" y="545" fill="#f0f9ff" fontSize="14.5" fontWeight="800">
        خليج عدن والبحر العربي
      </text>

      {/* Compass Rose */}
      <g transform="translate(925, 86)">
        <circle r="22" fill="#ffffff" fillOpacity="0.9" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="0,-16 4,0 0,-3 -4,0" fill="#dc2626" />
        <polygon points="0,16 4,0 0,3 -4,0" fill="#334155" />
        <text x="0" y="-25" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">ش</text>
      </g>

      {/* Scale Bar */}
      <g transform="translate(690, 560)">
        <rect x="0" y="0" width="120" height="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
        <rect x="0" y="0" width="60" height="5" fill="#0f172a" />
        <text x="60" y="-5" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
          0 — 150 كم
        </text>
      </g>

      {/* Yemen Astronomical & Geographic Location Highlight when loc-yemen-center is selected */}
      {selectedId === 'loc-yemen-center' && (() => {
        const sw = projectYemen(12, 41.5);
        const ne = projectYemen(19, 55);
        return (
          <g>
            <rect
              x={sw.x}
              y={ne.y}
              width={ne.x - sw.x}
              height={sw.y - ne.y}
              fill="none"
              stroke="#be123c"
              strokeWidth="2.2"
              strokeDasharray="7 5"
              opacity="0.85"
            />
            <g transform="translate(22, 444)">
              <rect width="236" height="84" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#be123c" strokeWidth="1.4" />
              <text x="222" y="21" textAnchor="end" fill="#881337" fontSize="11" fontWeight="800">
                خريطة الموقع الفلكي والجغرافي لليمن
              </text>
              <text x="222" y="42" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
                فلكياً: 12°–19° شمالاً | 41°–55° شرقاً
              </text>
              <text x="222" y="60" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
                المساحة: 555 ألف كم² · الساحل &gt; 2200 كم
              </text>
              <text x="222" y="76" textAnchor="end" fill="#475569" fontSize="9.5" fontWeight="600">
                أكثر من 154 جزيرة في البحر الأحمر والعربي
              </text>
            </g>
          </g>
        );
      })()}

      {/* Non-Overlapping Pins */}
      <SmartPinLayer locations={locations} selectedId={selectedId} onSelect={onSelect} />
    </svg>
  );
};

export const ArabWorldSvgMap: React.FC<{
  locations: AtlasLocation[];
  selectedId: string;
  activeLayer: AtlasLayer | 'all';
  onSelect: (id: string) => void;
}> = ({ locations, selectedId, activeLayer, onSelect }) => {
  const northAfricaPts = [
    [35.8, -5.5], [36.8, 3], [37.2, 10], [32.8, 13], [31.5, 25], [31.3, 32.5],
    [22, 36.8], [15, 39], [11.5, 43.2], [11.5, 51.2], [2, 45.3], [-1.5, 41.5],
    [4, 34], [10, 24], [19, 24], [22, 12], [16, -4], [15, -16], [21, -17], [28, -13]
  ]
    .map(([la, ln]) => {
      const p = projectArabWorld(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const westAsiaPts = [
    [37, 36], [37, 42.3], [33, 46.5], [30, 48.5], [26, 50.2], [25, 56.2],
    [22.5, 59.8], [16.5, 53], [12.7, 45], [12.68, 43.42], [17, 42],
    [22, 39], [28, 35], [31.2, 34.2], [34, 35.8]
  ]
    .map(([la, ln]) => {
      const p = projectArabWorld(la, ln);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const showWater = activeLayer === 'all' || activeLayer === 'water';
  const showPopulation = activeLayer === 'population';
  const showClimate = activeLayer === 'climate';

  return (
    <svg
      viewBox="0 0 1000 600"
      role="img"
      aria-label="خريطة الوطن العربي التفاعلية"
      className="block h-auto w-full select-none overflow-hidden rounded-lg"
    >
      <defs>
        <linearGradient id="arabOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="arabAfricaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="40%" stopColor="#d9f99d" />
          <stop offset="100%" stopColor="#e7d7bd" />
        </linearGradient>

        <linearGradient id="arabAsiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="55%" stopColor="#d9f99d" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>

        <filter id="arabLandShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#082f49" floodOpacity="0.25" />
        </filter>
      </defs>

      <rect x="0" y="0" width="1000" height="600" fill="url(#arabOceanGrad)" />

      {/* Equator & Tropic of Cancer */}
      {(() => {
        const eq = projectArabWorld(0, 0);
        const cancer = projectArabWorld(23.5, 0);
        return (
          <>
            <line x1="40" y1={eq.y} x2="960" y2={eq.y} stroke="#f0f9ff" strokeDasharray="5 5" strokeWidth="1.2" opacity="0.7" />
            <text x="145" y={eq.y - 7} fill="#f0f9ff" fontSize="10.5" fontWeight="700">خط الاستواء 0°</text>
            <line x1="40" y1={cancer.y} x2="960" y2={cancer.y} stroke="#fef3c7" strokeDasharray="5 5" strokeWidth="1.2" opacity="0.75" />
            <text x="175" y={cancer.y - 7} fill="#fef3c7" fontSize="10.5" fontWeight="700">مدار السرطان 23.5°N</text>
          </>
        );
      })()}

      {/* Coastal Shelf Glow + Landmasses */}
      <polygon points={northAfricaPts} fill="none" stroke="#e0f2fe" strokeWidth="8" strokeOpacity="0.45" />
      <polygon points={westAsiaPts} fill="none" stroke="#e0f2fe" strokeWidth="8" strokeOpacity="0.45" />

      <polygon
        points={northAfricaPts}
        fill="url(#arabAfricaGrad)"
        stroke="#065f46"
        strokeWidth="1.8"
        filter="url(#arabLandShadow)"
      />
      <polygon
        points={westAsiaPts}
        fill="url(#arabAsiaGrad)"
        stroke="#065f46"
        strokeWidth="1.8"
        filter="url(#arabLandShadow)"
      />

      {/* Mediterranean fertile coastal band & Atlas range tint */}
      <path d="M 160,115 Q 250,95 360,105" stroke="#15803d" strokeWidth="10" strokeLinecap="round" opacity="0.28" fill="none" />

      {/* Arab World Climate Belts Overlay (Textbook p. 73) */}
      {showClimate && (
        <g>
          {/* البحر المتوسط شمالاً */}
          <path d="M 145,100 Q 290,78 440,108 L 620,108 L 645,78" stroke="#15803d" strokeWidth="20" strokeLinecap="round" opacity="0.45" fill="none" />
          {/* الصحراوي وشبه الصحراوي */}
          <ellipse cx="385" cy="235" rx="195" ry="68" fill="#f59e0b" opacity="0.32" />
          <ellipse cx="735" cy="215" rx="75" ry="52" fill="#f59e0b" opacity="0.32" />
          {/* المداري جنوباً (السودان، الصومال، موريتانيا، اليمن) */}
          <ellipse cx="565" cy="365" rx="115" ry="44" fill="#10b981" opacity="0.38" />
          <circle cx="712" cy="322" r="24" fill="#10b981" opacity="0.42" />
        </g>
      )}

      {/* Arab World Population Density Choropleth (Textbook Map p. 90) */}
      {showPopulation && (
        <g>
          {/* منخفضة/نادرة: الصحراء الكبرى والربع الخالي وبادية الشام */}
          <ellipse cx="365" cy="240" rx="185" ry="62" fill="#fef3c7" opacity="0.55" />
          <ellipse cx="755" cy="230" rx="68" ry="46" fill="#fef3c7" opacity="0.55" />
          {/* عالية جداً: وادي النيل والدلتا */}
          <path d="M 604,132 L 614,225 L 618,310" stroke="#9f1239" strokeWidth="18" strokeLinecap="round" opacity="0.65" fill="none" />
          {/* عالية: دجلة والفرات + سواحل الشام + سواحل المغرب + المرتفعات اليمنية */}
          <path d="M 718,68 L 765,120 L 790,146" stroke="#be1239" strokeWidth="16" strokeLinecap="round" opacity="0.58" fill="none" />
          <path d="M 642,92 L 640,136" stroke="#be1239" strokeWidth="14" strokeLinecap="round" opacity="0.58" fill="none" />
          <path d="M 155,104 Q 250,84 355,100" stroke="#be1239" strokeWidth="14" strokeLinecap="round" opacity="0.56" fill="none" />
          <circle cx="712" cy="316" r="18" fill="#be1239" opacity="0.62" />
        </g>
      )}

      {/* Major Rivers (Nile, Tigris, Euphrates) */}
      {showWater && (
        <g stroke="#0284c7" strokeWidth="2.8" fill="none" strokeLinecap="round">
          <path d="M 606,144 L 610,200 L 616,280 L 618,380" />
          <path d="M 720,65 L 758,105 L 785,140" />
          <path d="M 738,65 L 765,105 L 785,140" />
        </g>
      )}

      {/* Thematic Map Legends for Arab World */}
      {showPopulation && (
        <g transform="translate(36, 442)">
          <rect width="265" height="106" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#9f1239" strokeWidth="1.4" />
          <text x="252" y="21" textAnchor="end" fill="#0f172a" fontSize="11" fontWeight="800">
            خريطة الكثافة السكانية العربية (ص 90)
          </text>
          <rect x="234" y="34" width="16" height="12" rx="2" fill="#9f1239" opacity="0.82" />
          <text x="226" y="44" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">
            عالية جداً وعالية: النيل، دجلة والفرات، سواحل الشام والمغرب، اليمن
          </text>
          <rect x="234" y="56" width="16" height="12" rx="2" fill="#d9f99d" stroke="#65a30d" strokeWidth="1" />
          <text x="226" y="66" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">
            متوسطة: الهضاب الساحلية وسفوح الجبال ومناطق الرعي
          </text>
          <rect x="234" y="78" width="16" height="12" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <text x="226" y="88" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">
            منخفضة ونادرة: الصحراء الكبرى والربع الخالي وبادية الشام
          </text>
        </g>
      )}
      {showClimate && (
        <g transform="translate(36, 442)">
          <rect width="250" height="106" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#065f46" strokeWidth="1.4" />
          <text x="236" y="21" textAnchor="end" fill="#0f172a" fontSize="11" fontWeight="800">
            الأقاليم المناخية والنباتية (ص 73–75)
          </text>
          <rect x="218" y="34" width="16" height="12" rx="2" fill="#15803d" opacity="0.7" />
          <text x="210" y="44" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">البحر المتوسط (شمالاً · ممطر شتاءً · الأرز والإستبس)</text>
          <rect x="218" y="56" width="16" height="12" rx="2" fill="#f59e0b" opacity="0.6" />
          <text x="210" y="66" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">الصحراوي وشبه الصحراوي (الأوسع مساحةً · شوكية)</text>
          <rect x="218" y="78" width="16" height="12" rx="2" fill="#10b981" opacity="0.72" />
          <text x="210" y="88" textAnchor="end" fill="#1e293b" fontSize="9.8" fontWeight="700">المداري والاستوائي (جنوباً · ممطر صيفاً · السافانا)</text>
        </g>
      )}

      {/* Neighboring Continental Context & Geographic Boundaries (ص 62) */}
      <path
        d="M 150,0 L 660,0 L 660,36 L 560,34 L 460,36 L 340,34 L 220,38 L 150,30 Z"
        fill="#f1f5f9"
        fillOpacity="0.62"
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <text x="415" y="24" textAnchor="middle" fill="#475569" fontSize="11.5" fontWeight="700">
        قارة أوروبا (عبر البحر المتوسط شمالاً)
      </text>
      <text x="720" y="34" textAnchor="middle" fill="#475569" fontSize="10.5" fontWeight="700">
        جبال طوروس (شمالاً)
      </text>
      <text x="868" y="138" textAnchor="middle" fill="#f0f9ff" fontSize="10.5" fontWeight="700">
        جبال زاجروس والخليج العربي (شرقاً)
      </text>
      <text x="430" y="398" textAnchor="middle" fill="#f0f9ff" fontSize="10.5" fontWeight="700">
        الصحراء الكبرى وأفريقيا (جنوباً)
      </text>

      {/* Astronomical & Geographic Location Map Overlay when loc-arab-world-center is selected */}
      {selectedId === 'loc-arab-world-center' && (() => {
        const nw = projectArabWorld(37.5, -17);
        const se = projectArabWorld(-2, 60);
        return (
          <g>
            {/* Bounding Astronomical Graticule Frame: 17°W – 60°E | 2°S – 37°30′N */}
            <rect
              x={nw.x}
              y={nw.y}
              width={se.x - nw.x}
              height={se.y - nw.y}
              fill="none"
              stroke="#be123c"
              strokeWidth="2.2"
              strokeDasharray="7 5"
              opacity="0.88"
            />
            <text x={nw.x + 8} y={nw.y + 15} fill="#881337" fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="800">
              17°W · 37°30′N
            </text>
            <text x={se.x - 8} y={nw.y + 15} textAnchor="end" fill="#881337" fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="800">
              60°E
            </text>
            <text x={nw.x + 8} y={se.y - 7} fill="#881337" fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="800">
              2°S
            </text>

            {/* Geographic & Astronomical Location Legend Card */}
            <g transform="translate(36, 444)">
              <rect width="292" height="106" rx="8" fill="#ffffff" fillOpacity="0.96" stroke="#be123c" strokeWidth="1.5" />
              <text x="278" y="21" textAnchor="end" fill="#881337" fontSize="11.2" fontWeight="800">
                خريطة الموقع الفلكي والجغرافي للوطن العربي (ص 61–64)
              </text>
              <text x="278" y="42" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
                الفلكي: 60° شرقاً – 17° غرباً | 2° جنوباً – 37°30′ شمالاً
              </text>
              <text x="278" y="60" textAnchor="end" fill="#1e293b" fontSize="10" fontWeight="700">
                المساحة: 13.3 مليون كم² (22 دولة · 71% أفريقي · 29% آسيوي)
              </text>
              <text x="278" y="78" textAnchor="end" fill="#334155" fontSize="9.6" fontWeight="600">
                شمالاً: المتوسط وطوروس · جنوباً: الهندي والعربي والصحراء الكبرى
              </text>
              <text x="278" y="95" textAnchor="end" fill="#334155" fontSize="9.6" fontWeight="600">
                شرقاً: زاجروس والخليج العربي وعمان · غرباً: المحيط الأطلسي
              </text>
            </g>
          </g>
        );
      })()}

      {/* Comoros Inset Box */}
      <g transform="translate(795, 442)">
        <rect width="155" height="96" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#0369a1" strokeWidth="1.4" />
        <text x="12" y="21" fill="#0f172a" fontSize="10.5" fontWeight="700">إطار جزر القمر (11°–13°S)</text>
        <circle cx="62" cy="46" r="6" fill="#059669" />
        <circle cx="84" cy="54" r="4.5" fill="#059669" />
      </g>

      {/* Water & Wing Captions */}
      <text x="380" y="72" fill="#f0f9ff" fontSize="14" fontWeight="800">البحر المتوسط</text>
      <text x="115" y="340" fill="#f0f9ff" fontSize="13" fontWeight="800">المحيط الأطلسي</text>
      <text x="795" y="352" fill="#f0f9ff" fontSize="13" fontWeight="800">بحر العرب والمحيط الهندي</text>
      <text x="345" y="255" fill="#14532d" fontSize="12.5" fontWeight="700" paintOrder="stroke" stroke="#ffffff" strokeWidth="2.5">
        الجناح الأفريقي (71% مساحة · 61% سكان)
      </text>
      <text x="740" y="295" fill="#14532d" fontSize="11.5" fontWeight="700" paintOrder="stroke" stroke="#ffffff" strokeWidth="2.5">
        الجناح الآسيوي (29% مساحة)
      </text>

      {/* Compass Rose */}
      <g transform="translate(935, 76)">
        <circle r="20" fill="#ffffff" fillOpacity="0.92" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="0,-14 3.5,0 0,-2.5 -3.5,0" fill="#dc2626" />
        <polygon points="0,14 3.5,0 0,2.5 -3.5,0" fill="#334155" />
        <text x="0" y="-22" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">ش</text>
      </g>

      {/* Non-Overlapping Pins */}
      <SmartPinLayer locations={locations} selectedId={selectedId} onSelect={onSelect} />
    </svg>
  );
};
