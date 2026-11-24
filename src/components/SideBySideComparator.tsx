import React, { useMemo, useState } from 'react';
import {
  SIDE_BY_SIDE_ENTITIES,
  SIDE_BY_SIDE_GROUPS,
  SideBySideEntity
} from '../data/sideBySideComparisons';
import { ArrowLeftRight, MapPin, BookOpen } from 'lucide-react';

interface SideBySideComparatorProps {
  onGoToLesson: (unitId: string, lessonId: string) => void;
  onGoToAtlas: (locationId: string) => void;
}

export const SideBySideComparator: React.FC<SideBySideComparatorProps> = ({
  onGoToLesson,
  onGoToAtlas
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(SIDE_BY_SIDE_GROUPS[0].id);

  const groupEntities = useMemo(
    () => SIDE_BY_SIDE_ENTITIES.filter((e) => e.groupId === selectedGroupId),
    [selectedGroupId]
  );

  const activeGroup =
    SIDE_BY_SIDE_GROUPS.find((g) => g.id === selectedGroupId) ?? SIDE_BY_SIDE_GROUPS[0];

  const [leftId, setLeftId] = useState<string>(activeGroup.defaultPair[0]);
  const [rightId, setRightId] = useState<string>(activeGroup.defaultPair[1]);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    const g = SIDE_BY_SIDE_GROUPS.find((item) => item.id === groupId);
    if (g) {
      setLeftId(g.defaultPair[0]);
      setRightId(g.defaultPair[1]);
    }
  };

  const leftEntity: SideBySideEntity =
    groupEntities.find((e) => e.id === leftId) ?? groupEntities[0];
  const rightEntity: SideBySideEntity =
    groupEntities.find((e) => e.id === rightId) ?? groupEntities[1] ?? groupEntities[0];

  const handleSwap = () => {
    setLeftId(rightEntity.id);
    setRightId(leftEntity.id);
  };

  return (
    <section
      aria-label="مقارنة تفاعلية بين عنصرين جنباً إلى جنب"
      className="no-print space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-extrabold text-slate-900">
            مقارنة تفاعلية: عنصر مقابل عنصر
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            اختر مجال المقارنة ثم حدد أي عنصرين متشابهين لعرض المحافظة والدولة والسمات الفارقة جنباً إلى جنب.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 text-sky-700" />
          <span>تبديل الطرفين</span>
        </button>
      </div>

      {/* Group Selector Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {SIDE_BY_SIDE_GROUPS.map((grp) => {
          const active = grp.id === selectedGroupId;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => handleGroupSelect(grp.id)}
              className={`min-h-[38px] whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {grp.label}
            </button>
          );
        })}
      </div>

      {/* Selectors + Side-by-Side Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { side: 'أ', entity: leftEntity, selectedId: leftEntity.id, onChange: setLeftId },
          { side: 'ب', entity: rightEntity, selectedId: rightEntity.id, onChange: setRightId }
        ].map((slot) => (
          <div
            key={slot.side}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-3">
                <label className="text-xs font-bold text-slate-500">
                  الطرف ({slot.side})
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {slot.entity.pageRef}
                </span>
              </div>

              <select
                value={slot.selectedId}
                onChange={(e) => slot.onChange(e.target.value)}
                aria-label={`اختيار الطرف ${slot.side} للمقارنة`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              >
                {groupEntities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.governorateOrCountry}
                  </option>
                ))}
              </select>

              <div className="mt-3 border-b border-slate-100 pb-3">
                <div className="text-xs text-slate-500">
                  المحافظة / الدولة · <strong className="text-sky-800">{slot.entity.governorateOrCountry}</strong>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  التصنيف المنهجي: {slot.entity.categoryLabel}
                </div>
              </div>

              <dl className="mt-3 space-y-2.5 text-xs">
                {slot.entity.attributes.map((attr, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <dt className="font-semibold text-slate-500">{attr.label}</dt>
                    <dd className="leading-relaxed text-slate-800">{attr.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 rounded-lg bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-950">
                <strong>الفرق الوزاري الحاسم: </strong>
                {slot.entity.ministerialDistinction}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => onGoToLesson(slot.entity.unitId, slot.entity.lessonId)}
                className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>المرجع في الدرس</span>
              </button>
              {slot.entity.atlasLocationId && (
                <button
                  type="button"
                  onClick={() => onGoToAtlas(slot.entity.atlasLocationId!)}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>عرض في الأطلس</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
