import React, { useMemo, useState } from 'react';
import {
  DISAMBIGUATION_ITEMS,
  DisambiguationChoiceDrill,
  DisambiguationItem
} from '../data/ministerialComparisons';
import { TEXTBOOK_UNITS, getUnitById } from '../data/bookIndex';
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  Compass,
  RotateCcw,
  Search,
  Sparkles,
  XCircle
} from 'lucide-react';

interface MinisterialDisambiguationLabProps {
  unitFilter: string;
  onChangeUnitFilter?: (unitId: string) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}

type LabMode = 'choice_drill' | 'compare_cards';

export const MinisterialDisambiguationLab: React.FC<MinisterialDisambiguationLabProps> = ({
  unitFilter,
  onChangeUnitFilter,
  onGoToLesson,
  onGoToAtlas
}) => {
  const [mode, setMode] = useState<LabMode>('choice_drill');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, { choice: string; isCorrect: boolean }>
  >({});

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DISAMBIGUATION_ITEMS.filter((item) => {
      const unitOk = unitFilter === 'all' || item.unitId === unitFilter;
      if (!unitOk) return false;
      if (!q) return true;
      const blob = [
        item.title,
        item.similarityReason,
        item.decisiveDifference,
        ...item.items.flatMap((it) => [it.name, ...it.keyTraits]),
        ...item.choiceDrills.map((d) => d.prompt)
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [unitFilter, searchQuery]);

  const allDrillsCount = useMemo(
    () => filteredItems.reduce((acc, item) => acc + item.choiceDrills.length, 0),
    [filteredItems]
  );

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const item of filteredItems) {
      for (const drill of item.choiceDrills) {
        if (selectedAnswers[drill.id]) count++;
      }
    }
    return count;
  }, [filteredItems, selectedAnswers]);

  const correctCount = useMemo(() => {
    let count = 0;
    for (const item of filteredItems) {
      for (const drill of item.choiceDrills) {
        if (selectedAnswers[drill.id]?.isCorrect) count++;
      }
    }
    return count;
  }, [filteredItems, selectedAnswers]);

  const handleChoose = (drill: DisambiguationChoiceDrill, choice: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [drill.id]: {
        choice,
        isCorrect: choice === drill.correctChoice
      }
    }));
  };

  return (
    <section className="space-y-6">
      {/* Intro & Controls Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <ArrowLeftRight className="h-4 w-4" />
              <span>مختبر التخيير والتمييز بين المواضع المتشابهة في الامتحان الوزاري</span>
            </div>
            <h2 className="font-display mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
              تخيّر الصواب وميّز الفرق الحاسم بين المتشابهات
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              يجمع هذا القسم المواضع الأكثر تداخلاً في الأسئلة الوزارية (مثل حافات اليمن، اتجاهات الأودية، المحميات، نسب المساحة والسكان، الأنهار والبحيرات، التوسع الأفقي والرأسي، ومعالم الشام والمغرب)، مع تدريب مباشر بنظام التخيير الثنائي وبطاقات الفروق الحاسمة.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('choice_drill')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'choice_drill'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>التخيير التفاعلي المباشر ({allDrillsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('compare_cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'compare_cards'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-sky-600" />
              <span>بطاقات الفروق الحاسمة ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Search, Quick Unit Chips, & Drill Score */}
        <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute top-2.5 right-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن موضعين متشابهين..."
                className="w-full rounded-lg border border-slate-300 py-1.5 pr-8 pl-3 text-xs text-slate-800"
              />
            </div>

            {onChangeUnitFilter && (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onChangeUnitFilter('all')}
                  className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                    unitFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  الكل
                </button>
                {TEXTBOOK_UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onChangeUnitFilter(u.id)}
                    className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                      unitFilter === u.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    و{u.unitNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          {mode === 'choice_drill' && (
            <div className="flex items-center gap-3 text-xs text-slate-700">
              <span>
                التقدم:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {answeredCount} / {allDrillsCount}
                </strong>
              </span>
              <span>
                الصحيح:{' '}
                <strong className="font-mono tabular-nums text-emerald-700">{correctCount}</strong>
              </span>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAnswers({})}
                  className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إعادة التدريب</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
          لا توجد مقارنات مطابقة لعبارة البحث أو الوحدة المختارة.
        </div>
      )}

      {/* MODE 1: INTERACTIVE DIRECT CHOICE DRILL */}
      {mode === 'choice_drill' && (
        <div className="space-y-4">
          {filteredItems.map((group) => (
            <DisambiguationDrillGroup
              key={group.id}
              group={group}
              selectedAnswers={selectedAnswers}
              onChoose={handleChoose}
              onGoToLesson={onGoToLesson}
              onGoToAtlas={onGoToAtlas}
            />
          ))}
        </div>
      )}

      {/* MODE 2: SIDE-BY-SIDE COMPARISON CARDS */}
      {mode === 'compare_cards' && (
        <div className="space-y-5">
          {filteredItems.map((item) => {
            const unit = getUnitById(item.unitId);
            return (
              <article
                key={item.id}
                className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {unit ? `الوحدة ${unit.unitNumber}: ${unit.title}` : ''} · مواضع الوزاري:{' '}
                      <span className="font-mono font-bold text-amber-800">{item.ministerialSlots}</span>
                    </div>
                    <h3 className="font-display mt-1 text-base font-extrabold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  <div className="no-print flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => onGoToLesson(item.unitId, item.lessonId)}
                      className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>الدرس</span>
                    </button>
                    {item.locationId && (
                      <button
                        type="button"
                        onClick={() => onGoToAtlas(item.locationId!)}
                        className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>الأطلس</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Why similar vs Decisive difference */}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-950">
                    <div className="font-bold">لماذا يقع الخلط (وجه الشبه):</div>
                    <p className="mt-1">{item.similarityReason}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-emerald-950">
                    <div className="font-bold">الفرق الحاسم الذي يحل السؤال:</div>
                    <p className="mt-1">{item.decisiveDifference}</p>
                  </div>
                </div>

                {/* Side-by-Side Comparison Panels */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {item.items.map((opt, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                        <h4 className="font-display text-sm font-bold text-slate-900">{opt.name}</h4>
                        <span className="font-mono text-[11px] text-slate-500">{opt.pageRef}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-700">
                        {opt.keyTraits.map((tr, tIdx) => (
                          <li key={tIdx} className="leading-relaxed">
                            • {tr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const DisambiguationDrillGroup: React.FC<{
  group: DisambiguationItem;
  selectedAnswers: Record<string, { choice: string; isCorrect: boolean }>;
  onChoose: (drill: DisambiguationChoiceDrill, choice: string) => void;
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}> = ({ group, selectedAnswers, onChoose, onGoToLesson, onGoToAtlas }) => {
  const [showCompareHint, setShowCompareHint] = useState(false);
  const unit = getUnitById(group.unitId);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="text-[11px] font-semibold text-slate-500">
            {unit ? `الوحدة ${unit.unitNumber}` : ''} · موضع الامتحان:{' '}
            <span className="font-mono font-bold text-amber-800">{group.ministerialSlots}</span>
          </div>
          <h3 className="font-display mt-0.5 text-base font-bold text-slate-900">{group.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowCompareHint((v) => !v)}
            className="font-medium text-amber-800 hover:underline"
          >
            {showCompareHint ? 'إخفاء قاعدة التمييز' : 'اعرض قاعدة التمييز'}
          </button>
          <button
            type="button"
            onClick={() => onGoToLesson(group.unitId, group.lessonId)}
            className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>الدرس</span>
          </button>
          {group.locationId && (
            <button
              type="button"
              onClick={() => onGoToAtlas(group.locationId!)}
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>الأطلس</span>
            </button>
          )}
        </div>
      </div>

      {showCompareHint && (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-xs leading-relaxed text-slate-800">
          <strong>الفرق الحاسم: </strong>
          {group.decisiveDifference}
        </div>
      )}

      <div className="mt-4 space-y-4">
        {group.choiceDrills.map((drill) => {
          const ans = selectedAnswers[drill.id];
          return (
            <div key={drill.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-sm font-bold leading-relaxed text-slate-900">{drill.prompt}</div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {drill.choices.map((ch) => {
                  const isPicked = ans?.choice === ch;
                  const isRight = ch === drill.correctChoice;
                  let cls = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100';
                  if (ans) {
                    if (isRight) {
                      cls = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                    } else if (isPicked) {
                      cls = 'border-rose-400 bg-rose-50 text-rose-950';
                    } else {
                      cls = 'border-slate-200 bg-white text-slate-500';
                    }
                  }
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => onChoose(drill, ch)}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-right text-xs transition-colors sm:text-sm ${cls}`}
                    >
                      <span>{ch}</span>
                      {ans && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                      {ans && isPicked && !isRight && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {ans && (
                <div
                  className={`mt-3 rounded-lg border p-3 text-xs leading-relaxed ${
                    ans.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                      : 'border-amber-200 bg-amber-50 text-amber-950'
                  }`}
                >
                  <div className="font-bold">
                    {ans.isCorrect
                      ? 'اختيار دقيق ومميَّز ✓'
                      : `الصواب هو: ${drill.correctChoice}`}
                  </div>
                  <p className="mt-1">{drill.whyNotOthers}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
};
