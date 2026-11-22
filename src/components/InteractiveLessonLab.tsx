import React, { useEffect, useState } from 'react';
import { InteractiveLabConfig } from '../types/textbook';
import { Sliders, Calculator, BarChart3, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface InteractiveLessonLabProps {
  lab: InteractiveLabConfig;
}

export const InteractiveLessonLab: React.FC<InteractiveLessonLabProps> = ({ lab }) => {
  const [expanded, setExpanded] = useState(false);

  // Reset to collapsed (hidden) whenever navigating to a different lesson/lab
  useEffect(() => {
    setExpanded(false);
  }, [lab.id]);

  return (
    <section
      aria-label={lab.title}
      className="my-6 rounded-xl border border-amber-200/90 bg-amber-50/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            {lab.id === 'elevation-climate' ? (
              <Sliders className="h-4 w-4" />
            ) : lab.id === 'population-calc' || lab.id === 'food-gap-calc' ? (
              <Calculator className="h-4 w-4" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                <Sparkles className="h-3 w-3" />
                إثراء تفاعلي (خارج النص الرسمي للكتاب)
              </span>
              <span className="text-[11px] text-slate-500">· مستند إلى {lab.sourcePageRef}</span>
            </div>
            <h4 className="font-display mt-0.5 text-sm font-bold text-slate-900 sm:text-base">
              {lab.title}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-xs transition-colors hover:bg-amber-50"
        >
          <span>{expanded ? 'إخفاء الإثراء التفاعلي' : 'إظهار الإثراء التفاعلي'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-amber-200/70 pt-4">
          <p className="mb-4 text-xs leading-relaxed text-slate-700 sm:text-sm">
            {lab.description}{' '}
            <span className="font-semibold text-amber-900">
              (أداة إثرائية للفهم التطبيقي ولا تُعد نصاً مقرراً في الكتاب).
            </span>
          </p>

          {lab.id === 'elevation-climate' && <ElevationClimateSimulator />}
          {lab.id === 'population-calc' && <PopulationCalculatorLab />}
          {lab.id === 'workforce-chart' && <WorkforceChartLab />}
          {lab.id === 'desalination-chart' && <DesalinationChartLab />}
          {lab.id === 'food-gap-calc' && <FoodGapCalculatorLab />}
        </div>
      )}
    </section>
  );
};

const ElevationClimateSimulator: React.FC = () => {
  const [elevation, setElevation] = useState<number>(2250);

  // Official rule (p. 17): temperature drops 1°C per 150m elevation from sea-level baseline (~32°C in Tihamah)
  const seaLevelTemp = 32;
  const calculatedTemp = Math.max(4, +(seaLevelTemp - elevation / 150).toFixed(1));

  const zoneInfo =
    elevation <= 200
      ? {
          region: 'إقليم السهول الساحلية (تهامة)',
          climate: 'شبه مداري حار رطب، مدى حراري صغير (ص 18)',
          vegetation: 'المانجروف والشورى، النخيل، الأثل، السنط، السدر، السافانا (ص 20)'
        }
      : elevation <= 1500
      ? {
          region: 'إقليم المناطق متوسطة الارتفاع',
          climate: 'معتدل دافئ صيفاً وشتاءً مع أمطار موسمية تضاريسية (ص 19)',
          vegetation: 'الطلح، السدر، التين، الجميز، البن، الإستبس، الخروب (ص 21)'
        }
      : {
          region: 'إقليم المناطق المرتفعة والعالية (>1500م)',
          climate: 'معتدل صيفاً وبارد شتاءً، مدى حراري كبير (صقيع محتمل في القيعان) (ص 19)',
          vegetation: 'السرو، الطلح الزنجي، وشجيرات وأعشاب الجبال (ص 21)'
        };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="elevation-slider" className="text-sm font-semibold text-slate-800">
          الارتفاع عن سطح البحر: <span className="font-mono tabular-nums text-sky-700">{elevation} متر</span>
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setElevation(50)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:bg-slate-100"
          >
            ساحل تهامة (50م)
          </button>
          <button
            type="button"
            onClick={() => setElevation(1400)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:bg-slate-100"
          >
            المرتفعات الوسطى (1400م)
          </button>
          <button
            type="button"
            onClick={() => setElevation(3670)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 hover:bg-slate-100"
          >
            قمة النبي شعيب (3670م)
          </button>
        </div>
      </div>

      <input
        id="elevation-slider"
        type="range"
        min={0}
        max={3670}
        step={50}
        value={elevation}
        onChange={(e) => setElevation(Number(e.target.value))}
        className="w-full accent-sky-600"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">درجة الحرارة التقديرية (قاعدة 1°م / 150م)</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {calculatedTemp}°م
          </div>
          <div className="mt-1 text-xs text-slate-600">انخفاض {(elevation / 150).toFixed(1)}°م عن الساحل</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الإقليم المناخي المطابق</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{zoneInfo.region}</div>
          <div className="mt-1 text-xs text-slate-600">{zoneInfo.climate}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">النبات الطبيعي المميز</div>
          <div className="mt-1 text-xs leading-relaxed font-medium text-slate-800">{zoneInfo.vegetation}</div>
        </div>
      </div>
    </div>
  );
};

const PopulationCalculatorLab: React.FC = () => {
  const [population, setPopulation] = useState(28000000);
  const [births, setBirths] = useState(840000);
  const [deaths, setDeaths] = useState(196000);
  const [area, setArea] = useState(555000);
  const [males, setMales] = useState(14250000);
  const [females, setFemales] = useState(13750000);

  const birthRate = population > 0 ? ((births / population) * 1000).toFixed(1) : '0';
  const deathRate = population > 0 ? ((deaths / population) * 1000).toFixed(1) : '0';
  const density = area > 0 ? (population / area).toFixed(1) : '0';
  const sexRatio = females > 0 ? ((males / females) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-medium text-slate-700">
          إجمالي السكان (نسمة)
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          المواليد الأحياء بالسنة
          <input
            type="number"
            value={births}
            onChange={(e) => setBirths(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          الوفيات بالسنة
          <input
            type="number"
            value={deaths}
            onChange={(e) => setDeaths(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          المساحة الكلية (كم²)
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          عدد الذكور
          <input
            type="number"
            value={males}
            onChange={(e) => setMales(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          عدد الإناث
          <input
            type="number"
            value={females}
            onChange={(e) => setFemales(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums"
          />
        </label>
      </div>

      <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">معدل المواليد الخام</div>
          <div className="font-mono text-lg font-bold tabular-nums text-sky-700">{birthRate} ‰</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">معدل الوفيات الخام</div>
          <div className="font-mono text-lg font-bold tabular-nums text-slate-900">{deathRate} ‰</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الكثافة السكانية</div>
          <div className="font-mono text-lg font-bold tabular-nums text-emerald-700">{density} نسمة/كم²</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">نسبة النوع</div>
          <div className="font-mono text-lg font-bold tabular-nums text-slate-900">{sexRatio} ذكر/100 أنثى</div>
        </div>
      </div>
    </div>
  );
};

const WorkforceChartLab: React.FC = () => {
  const [showNote, setShowNote] = useState(false);
  const sectors = [
    { label: 'الزراعة', value: 53, color: 'bg-emerald-600' },
    { label: 'التجارة', value: 19, color: 'bg-sky-600' },
    { label: 'الجهاز الإداري', value: 8, color: 'bg-amber-600' },
    { label: 'الصناعة', value: 6, color: 'bg-indigo-600' },
    { label: 'المواصلات', value: 5, color: 'bg-teal-600' },
    { label: 'قطاعات أخرى', value: 3, color: 'bg-slate-500' }
  ];

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-700">
        التوزيع النسبي للقوى العاملة في اليمن (عام 2004م — ص 41)
      </div>
      <div className="space-y-2.5">
        {sectors.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">{s.label}</span>
              <span className="font-mono font-bold tabular-nums text-slate-900">{s.value}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            {showNote
              ? 'إخفاء ملاحظة التدقيق المنهجي (خارج نص الكتاب)'
              : 'ملاحظة تدقيق منهجي خارج نص الكتاب (ص 41) — اضغط للإظهار'}
          </span>
        </button>
        {showNote && (
          <p className="mt-1.5 leading-relaxed">
            مجموع النسب المطبوعة في الرسم الدائري للكتاب يساوي 94% فقط (بفارق 6% عن 100%)، والبيانات تعود لتعداد عام 2004م.
          </p>
        )}
      </div>
    </div>
  );
};

const DesalinationChartLab: React.FC = () => {
  const [showNote, setShowNote] = useState(false);
  // Exact scale-corrected visualization for p. 81–82 figures
  const bars = [
    { label: 'إجمالي الطاقة التحلية العربية (ص 82)', value: 7.09, max: 8 },
    { label: 'إجمالي المياه المعالجة والمكررة (ص 82)', value: 6.4, max: 8 },
    { label: 'قيمة السعودية في رسم ص 81 المطبوعة', value: 2.23, max: 8 }
  ];

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-700">
        مقارنة بيانية مضبوطة المقياس لمصادر المياه الصناعية (مليار م³ — ص 81–82)
      </div>
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">{b.label}</span>
              <span className="font-mono font-bold tabular-nums text-sky-700">{b.value} مليار م³</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-600"
                style={{ width: `${(b.value / b.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            {showNote
              ? 'إخفاء ملاحظة تصحيح المقياس (خارج نص الكتاب)'
              : 'ملاحظة تدقيق مقياس الرسم خارج نص الكتاب (ص 81) — اضغط للإظهار'}
          </span>
        </button>
        {showNote && (
          <p className="mt-1.5 leading-relaxed">
            في شكل (2) المطبوع يرتفع عمود السعودية (2.23) فوق تدريج 30.00، وهنا تم ضبط التمثيل النسبي الدقيق وفق القيم الرقمية الرسمية.
          </p>
        )}
      </div>
    </div>
  );
};

const FoodGapCalculatorLab: React.FC = () => {
  const commodities = [
    { name: 'القمح', prod: 25.5, demand: 61.5, printedRatio: '41.5%' },
    { name: 'السكر', prod: 3.3, demand: 11.4, printedRatio: '28.9%' },
    { name: 'الزيوت النباتية', prod: 1.8, demand: 5.3, printedRatio: '34.0%' },
    { name: 'اللحوم', prod: 4.1, demand: 5.8, printedRatio: '81.2% (صوابها 70.7%)' },
    { name: 'الألبان', prod: 1.0, demand: 12.8, printedRatio: '70.9% (صوابها 7.8%)' }
  ];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const item = commodities[selectedIdx];
  const exactGap = (item.demand - item.prod).toFixed(1);
  const exactRatio = ((item.prod / item.demand) * 100).toFixed(1);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-1.5">
        {commodities.map((c, idx) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedIdx === idx
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الإنتاج العربي</div>
          <div className="font-mono text-lg font-bold tabular-nums text-emerald-700">
            {item.prod} مليون طن
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الطلب/الاستهلاك</div>
          <div className="font-mono text-lg font-bold tabular-nums text-slate-900">
            {item.demand} مليون طن
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الفجوة الغذائية الدقيقة</div>
          <div className="font-mono text-lg font-bold tabular-nums text-rose-700">
            {exactGap} مليون طن
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الاكتفاء الذاتي (الحسابي)</div>
          <div className="font-mono text-lg font-bold tabular-nums text-sky-700">{exactRatio}%</div>
          <div className="mt-0.5 text-[11px] text-slate-500">بالكتاب: {item.printedRatio}</div>
        </div>
      </div>
    </div>
  );
};
