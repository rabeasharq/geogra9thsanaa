import React from 'react';
import { TextbookMapTemplate } from '../data/mapTemplatesData';
import { projectYemen, projectArabWorld } from '../data/bookIndex';

export const YEMEN_OUTLINE_PTS = [
  [16.4, 42.8], [17.5, 43.2], [17.4, 44.5], [18.9, 47.0], [19.0, 52.0],
  [16.6, 53.1], [15.6, 52.1], [14.5, 49.2], [13.5, 46.8], [12.8, 45.0],
  [12.68, 43.42], [13.3, 43.25], [14.8, 42.95], [15.8, 42.8]
]
  .map(([la, ln]) => {
    const p = projectYemen(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

export const SOCOTRA_OUTLINE_PTS = [
  [12.7, 53.3], [12.65, 54.45], [12.35, 54.35], [12.32, 53.4]
]
  .map(([la, ln]) => {
    const p = projectYemen(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

export const ARAB_AFRICA_PTS = [
  [35.8, -5.5], [36.8, 3], [37.2, 10], [32.8, 13], [31.5, 25], [31.3, 32.5],
  [22, 36.8], [15, 39], [11.5, 43.2], [11.5, 51.2], [2, 45.3], [-1.5, 41.5],
  [4, 34], [10, 24], [19, 24], [22, 12], [16, -4], [15, -16], [21, -17], [28, -13]
]
  .map(([la, ln]) => {
    const p = projectArabWorld(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

export const ARAB_ASIA_PTS = [
  [37, 36], [37, 42.3], [33, 46.5], [30, 48.5], [26, 50.2], [25, 56.2],
  [22.5, 59.8], [16.5, 53], [12.7, 45], [12.68, 43.42], [17, 42],
  [22, 39], [28, 35], [31.2, 34.2], [34, 35.8]
]
  .map(([la, ln]) => {
    const p = projectArabWorld(la, ln);
    return `${p.x},${p.y}`;
  })
  .join(' ');

interface DetailedTextbookMapSvgProps {
  template: TextbookMapTemplate;
  selectedFeatureId?: string;
  onSelectFeature?: (id: string) => void;
  idPrefix?: string;
  printFriendly?: boolean;
}

export const DetailedTextbookMapSvg: React.FC<DetailedTextbookMapSvgProps> = ({
  template,
  selectedFeatureId,
  onSelectFeature,
  idPrefix = 'ref',
  printFriendly = false
}) => {
  const safePrefix = `${idPrefix}-${template.id}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const oceanGradId = `${safePrefix}-ocean`;
  const yemenGradId = `${safePrefix}-yemen`;
  const arabGradId = `${safePrefix}-arab`;

  return (
    <svg
      viewBox="0 0 1000 600"
      role="img"
      aria-label={template.title}
      className="h-auto w-full select-none rounded-lg"
    >
      <defs>
        <linearGradient id={oceanGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={printFriendly ? '#e0f2fe' : '#bae6fd'} />
          <stop offset="50%" stopColor={printFriendly ? '#bae6fd' : '#7dd3fc'} />
          <stop offset="100%" stopColor={printFriendly ? '#7dd3fc' : '#0284c7'} />
        </linearGradient>
        <linearGradient id={yemenGradId} x1="0%" y1="40%" x2="100%" y2="25%">
          <stop offset="0%" stopColor={printFriendly ? '#bbf7d0' : '#86efac'} />
          <stop offset="45%" stopColor={printFriendly ? '#ecfccb' : '#d9f99d'} />
          <stop offset="100%" stopColor={printFriendly ? '#f5ebd6' : '#e7d7bd'} />
        </linearGradient>
        <linearGradient id={arabGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={printFriendly ? '#bbf7d0' : '#86efac'} />
          <stop offset="55%" stopColor={printFriendly ? '#ecfccb' : '#d9f99d'} />
          <stop offset="100%" stopColor="#ecfccb" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1000" height="600" fill={`url(#${oceanGradId})`} />

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
                <line
                  x1="50"
                  y1={p.y}
                  x2="950"
                  y2={p.y}
                  stroke="#0369a1"
                  strokeOpacity="0.22"
                  strokeDasharray="4 4"
                />
                <text x="16" y={p.y + 4} fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
                  {lat}°N
                </text>
              </g>
            );
          })}
          {[42, 46, 50, 54].map((lng) => {
            const p = projectYemen(12, lng);
            return (
              <g key={lng}>
                <line
                  x1={p.x}
                  y1="40"
                  x2={p.x}
                  y2="560"
                  stroke="#0369a1"
                  strokeOpacity="0.22"
                  strokeDasharray="4 4"
                />
                <text x={p.x - 14} y="582" fill="#0c4a6e" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
                  {lng}°E
                </text>
              </g>
            );
          })}
          <polygon points={YEMEN_OUTLINE_PTS} fill={`url(#${yemenGradId})`} stroke="#065f46" strokeWidth="2.2" />
          <polygon points={SOCOTRA_OUTLINE_PTS} fill="#86efac" stroke="#065f46" strokeWidth="1.8" />
        </>
      ) : (
        <>
          {(() => {
            const eq = projectArabWorld(0, 0);
            const cancer = projectArabWorld(23.5, 0);
            return (
              <>
                <line
                  x1="40"
                  y1={eq.y}
                  x2="960"
                  y2={eq.y}
                  stroke={printFriendly ? '#0369a1' : '#ffffff'}
                  strokeDasharray="5 5"
                  opacity="0.7"
                />
                <text x="50" y={eq.y - 6} fill={printFriendly ? '#0c4a6e' : '#ffffff'} fontSize="10.5" fontWeight="700">
                  خط الاستواء 0°
                </text>
                <line
                  x1="40"
                  y1={cancer.y}
                  x2="960"
                  y2={cancer.y}
                  stroke={printFriendly ? '#b45309' : '#fef3c7'}
                  strokeDasharray="5 5"
                  opacity="0.75"
                />
                <text
                  x="50"
                  y={cancer.y - 6}
                  fill={printFriendly ? '#92400e' : '#fef3c7'}
                  fontSize="10.5"
                  fontWeight="700"
                >
                  مدار السرطان 23.5°N
                </text>
              </>
            );
          })()}
          <polygon points={ARAB_AFRICA_PTS} fill={`url(#${arabGradId})`} stroke="#065f46" strokeWidth="1.8" />
          <polygon points={ARAB_ASIA_PTS} fill="#bbf7d0" stroke="#065f46" strokeWidth="1.8" />
          <g transform="translate(795, 442)">
            <rect width="155" height="96" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#0369a1" />
            <text x="12" y="21" fill="#0f172a" fontSize="10" fontWeight="700">
              إطار جزر القمر (11°–13°S)
            </text>
            <circle cx="62" cy="46" r="6" fill="#059669" />
            <circle cx="84" cy="54" r="4.5" fill="#059669" />
          </g>
        </>
      )}

      {template.zones.map((z) => (
        <path key={z.id} d={z.d} fill={z.color} fillOpacity="0.48" stroke={z.color} strokeWidth="1.2" />
      ))}

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
        <circle r="20" fill="#ffffff" fillOpacity="0.94" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="0,-14 3.5,0 0,-2.5 -3.5,0" fill="#dc2626" />
        <polygon points="0,14 3.5,0 0,2.5 -3.5,0" fill="#334155" />
        <text x="0" y="-22" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">
          ش
        </text>
      </g>

      {template.features.map((feat) => {
        const active = feat.id === selectedFeatureId;
        const dx = feat.labelDx ?? 0;
        const dy = feat.labelDy ?? -16;
        const dist = Math.hypot(dx, dy);

        return (
          <g
            key={feat.id}
            transform={`translate(${feat.x}, ${feat.y})`}
            onClick={onSelectFeature ? () => onSelectFeature(feat.id) : undefined}
            className={onSelectFeature ? 'cursor-pointer' : undefined}
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
            <circle r={active ? 8 : 5.5} fill={feat.color} stroke="#ffffff" strokeWidth="2" />
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

interface BlankPracticeMapSvgProps {
  template: TextbookMapTemplate;
}

export const BlankPracticeMapSvg: React.FC<BlankPracticeMapSvgProps> = ({ template }) => {
  return (
    <svg
      viewBox="0 0 1000 600"
      role="img"
      aria-label={`خريطة صماء للتدريب: ${template.title}`}
      className="h-auto w-full select-none rounded-lg border border-slate-300"
    >
      <rect x="0" y="0" width="1000" height="600" fill="#e0f2fe" />

      {template.scope === 'yemen' ? (
        <>
          <path
            d="M 50,40 L 950,40 L 950,164 L 879,203 L 796,229 L 725,73 L 404,79 L 243,177 L 159,170 L 134,242 L 75,110 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line x1="725" y1="73" x2="757" y2="40" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
          <polygon points={YEMEN_OUTLINE_PTS} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
          <polygon points={SOCOTRA_OUTLINE_PTS} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
        </>
      ) : (
        <>
          <polygon points={ARAB_AFRICA_PTS} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
          <polygon points={ARAB_ASIA_PTS} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
          <g transform="translate(795, 442)">
            <rect width="155" height="96" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="1.2" />
            <text x="14" y="22" fill="#334155" fontSize="10" fontWeight="700">
              جزر القمر
            </text>
          </g>
        </>
      )}

      {template.paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="#64748b"
          strokeWidth={p.width ?? 1.8}
          strokeDasharray={p.dashed ? '5 4' : undefined}
          fill="none"
          opacity="0.7"
        />
      ))}

      {/* Compass Rose */}
      <g transform="translate(932, 74)">
        <circle r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="0,-12 3,0 0,-2 -3,0" fill="#0f172a" />
        <text x="0" y="-20" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">
          ش
        </text>
      </g>

      {template.features.map((feat, idx) => (
        <g key={feat.id} transform={`translate(${feat.x}, ${feat.y})`}>
          <circle r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#0f172a"
            fontSize="10.5"
            fontWeight="800"
            fontFamily="IBM Plex Mono, monospace"
          >
            {idx + 1}
          </text>
        </g>
      ))}
    </svg>
  );
};
