/**
 * Offline High-Resolution Geographic Coastlines, Wadis/Rivers, and Digital Elevation Models (DEM)
 * Calibrated to the Republic of Yemen & Arab World textbook geography (Grade 9, 2023/2026).
 */

export type LatLng = [number, number]; // [lat, lng]

// Detailed Yemen Mainland Coast & Border Polygon (~60 vertices)
export const YEMEN_MAINLAND_POLY: LatLng[] = [
  [16.38, 42.78], // Midi / Saudi Red Sea border
  [16.65, 43.05],
  [17.15, 43.22], // Sa'dah west
  [17.48, 43.45],
  [17.42, 44.15],
  [17.32, 44.65], // Najran / Al-Buqa border
  [17.65, 45.45],
  [18.25, 46.55],
  [18.88, 47.45], // Rub' al-Khali northern salient
  [19.0, 52.0],   // Yemen-Saudi-Oman tripoint
  [18.1, 52.38],
  [17.25, 52.72],
  [16.64, 53.08], // Hawf / Oman border on Arabian Sea
  [16.45, 52.68],
  [16.21, 52.18], // Al-Ghaydah
  [15.82, 52.2],  // Nishtun
  [15.42, 51.68], // Qishn
  [15.18, 51.12], // Sayhut / Wadi Masilah mouth
  [14.95, 50.35],
  [14.82, 49.98], // Sharma
  [14.72, 49.55], // Shihr
  [14.54, 49.12], // Mukalla
  [14.01, 48.32], // Bir Ali
  [13.52, 47.18], // Ahwar
  [13.38, 46.32], // Shuqrah
  [13.12, 45.38], // Abyan coast
  [12.78, 45.02], // Aden peninsula
  [12.68, 44.25], // Ras Imran / Khor Umaira
  [12.68, 43.42], // Bab el-Mandeb (Sheikh Said)
  [13.0, 43.36],
  [13.32, 43.25], // Mokha
  [13.85, 43.21], // Khawkhah
  [14.35, 43.04],
  [14.8, 42.95],  // Hodeidah
  [15.3, 42.67],  // Salif / Ras Isa peninsula
  [15.72, 42.82], // Luhayyah
  [16.1, 42.81]
];

export const SOCOTRA_POLY: LatLng[] = [
  [12.69, 53.38],
  [12.68, 53.85],
  [12.56, 54.45],
  [12.41, 54.49],
  [12.31, 54.08],
  [12.34, 53.52],
  [12.48, 53.31]
];

export const KAMARAN_POLY: LatLng[] = [
  [15.44, 42.54],
  [15.42, 42.62],
  [15.29, 42.61],
  [15.31, 42.53]
];

// Djibouti / Eritrea / Horn of Africa context across Bab el-Mandeb in Yemen viewport
export const AFRICA_HORN_CONTEXT_POLY: LatLng[] = [
  [15.0, 41.5],
  [14.2, 41.8],
  [13.4, 42.45],
  [12.7, 43.1],
  [12.45, 43.32], // Ras Siyan / Djibouti side of Bab el-Mandeb
  [11.75, 43.18],
  [11.5, 43.8],
  [11.5, 41.5]
];

// Wadis of Yemen (p. 25–26): [lat, lng][]
export const YEMEN_WADIS: { name: string; pts: LatLng[] }[] = [
  {
    name: 'وادي مور',
    pts: [
      [15.95, 44.05],
      [15.82, 43.62],
      [15.71, 43.22],
      [15.65, 42.85]
    ]
  },
  {
    name: 'وادي سردد وسهام',
    pts: [
      [15.22, 43.95],
      [15.08, 43.55],
      [14.92, 43.22],
      [14.84, 42.96]
    ]
  },
  {
    name: 'وادي زبيد ورماع',
    pts: [
      [14.42, 44.15],
      [14.28, 43.75],
      [14.16, 43.38],
      [14.1, 43.12]
    ]
  },
  {
    name: 'وادي تبن وبنا',
    pts: [
      [14.18, 44.58],
      [13.78, 44.82],
      [13.38, 45.12],
      [13.08, 45.32]
    ]
  },
  {
    name: 'وادي أذنة (سد مأرب)',
    pts: [
      [14.85, 44.45],
      [15.18, 44.85],
      [15.4, 45.25],
      [15.55, 45.75]
    ]
  },
  {
    name: 'وادي الجوف والخارد',
    pts: [
      [15.68, 44.28],
      [16.05, 44.75],
      [16.18, 45.35],
      [16.08, 45.95]
    ]
  },
  {
    name: 'وادي حضرموت والمسيلة',
    pts: [
      [15.65, 47.65],
      [15.92, 48.62], // Shibam
      [15.98, 49.45], // Tarim
      [15.78, 50.25],
      [15.45, 50.75],
      [15.18, 51.12]  // Arabian Sea mouth
    ]
  }
];

// Detailed Arab World Landmasses for Arab 3D Relief & Globe
export const ARAB_NORTH_AFRICA_POLY: LatLng[] = [
  [35.9, -5.45], // Tangier / Gibraltar
  [35.2, -2.9],
  [36.75, 3.05], // Algiers
  [37.25, 9.85], // Bizerte
  [35.8, 10.65],
  [33.8, 10.1],  // Gulf of Gabes
  [32.9, 13.18], // Tripoli
  [31.2, 16.5],  // Sirte
  [32.1, 20.06], // Benghazi
  [31.55, 25.15],
  [31.2, 29.9],  // Alexandria
  [31.4, 32.3],  // Suez north
  [29.9, 32.55], // Suez
  [27.2, 33.85], // Hurghada
  [22.0, 36.85], // Egypt-Sudan Red Sea
  [19.6, 37.22], // Port Sudan
  [15.5, 39.45],
  [12.5, 43.3],  // Bab el-Mandeb west
  [11.55, 43.15],
  [10.45, 45.0],
  [11.85, 51.25], // Cape Guardafui
  [5.0, 48.2],
  [2.0, 45.3],   // Mogadishu
  [-1.2, 41.6],
  [3.6, 34.0],
  [9.5, 24.5],
  [15.5, 22.8],
  [19.8, 24.0],
  [21.8, 15.0],
  [18.2, 11.5],
  [15.8, -4.2],
  [14.7, -12.0],
  [16.0, -16.5], // Senegal river border
  [20.8, -17.05], // Mauritania coast
  [27.6, -13.15],
  [30.4, -9.6],
  [33.6, -7.6],  // Casablanca
  [35.75, -5.85]
];

export const ARAB_WEST_ASIA_POLY: LatLng[] = [
  [36.8, 36.1],  // Syria NW
  [37.2, 40.5],
  [37.1, 44.3],  // Iraq NE
  [34.5, 45.5],
  [32.8, 46.9],
  [30.0, 48.5],  // Shatt al-Arab
  [29.2, 48.1],  // Kuwait
  [26.3, 50.2],  // Bahrain/Dammam
  [25.2, 51.55], // Qatar
  [24.4, 54.4],  // UAE
  [26.2, 56.35], // Hormuz / Musandam
  [23.6, 58.6],  // Muscat
  [22.5, 59.8],  // Ras al-Hadd
  [19.2, 57.7],
  [17.0, 54.1],  // Salalah
  [16.64, 53.08], // Hawf
  [15.18, 51.12],
  [14.54, 49.12],
  [12.78, 45.02],
  [12.68, 43.42], // Bab el-Mandeb
  [14.8, 42.95],
  [16.38, 42.78],
  [21.5, 39.15], // Jeddah
  [28.0, 34.7],
  [29.5, 34.95], // Aqaba
  [29.9, 32.55], // Sinai / Suez
  [31.25, 34.22], // Gaza
  [33.88, 35.48], // Beirut
  [35.5, 35.78]
];

export const ARAB_RIVERS: { name: string; pts: LatLng[] }[] = [
  {
    name: 'نهر النيل',
    pts: [
      [31.4, 31.1],
      [30.0, 31.2],
      [27.2, 31.1],
      [24.1, 32.9], // Aswan / Nasser
      [21.8, 31.4],
      [18.5, 31.8],
      [15.6, 32.5], // Khartoum
      [10.0, 32.2],
      [5.0, 31.6]
    ]
  },
  {
    name: 'نهر دجلة',
    pts: [
      [37.2, 42.3],
      [36.3, 43.1],
      [33.3, 44.4],
      [31.0, 47.4],
      [30.0, 48.5]
    ]
  },
  {
    name: 'نهر الفرات',
    pts: [
      [36.8, 38.0],
      [35.3, 40.2],
      [33.4, 43.8],
      [31.0, 46.6],
      [30.0, 48.5]
    ]
  }
];

export function pointInPolygon(lat: number, lng: number, poly: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][0];
    const xi = poly[i][1];
    const yj = poly[j][0];
    const xj = poly[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegmentSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return (px - cx) * (px - cx) + (py - cy) * (py - cy);
}

export function distToPolylineDeg(lat: number, lng: number, pts: LatLng[]): number {
  let minSq = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const sq = distToSegmentSq(lng, lat, pts[i][1], pts[i][0], pts[i + 1][1], pts[i + 1][0]);
    if (sq < minSq) minSq = sq;
  }
  return Math.sqrt(minSq);
}

export function distToPolygonEdgeDeg(lat: number, lng: number, poly: LatLng[]): number {
  let minSq = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const sq = distToSegmentSq(lng, lat, poly[j][1], poly[j][0], poly[i][1], poly[i][0]);
    if (sq < minSq) minSq = sq;
  }
  return Math.sqrt(minSq);
}

function gaussianPeak(lat: number, lng: number, pLat: number, pLng: number, sLat: number, sLng: number, amp: number): number {
  const dLat = (lat - pLat) / sLat;
  const dLng = (lng - pLng) / sLng;
  return amp * Math.exp(-(dLat * dLat + dLng * dLng));
}

function fbm(x: number, y: number): number {
  const v1 = Math.sin(x * 1.7 + y * 1.3) * Math.cos(x * 1.1 - y * 1.9);
  const v2 = 0.5 * Math.sin(x * 3.8 - y * 2.7) * Math.cos(x * 2.9 + y * 3.1);
  const v3 = 0.25 * Math.sin(x * 7.5 + y * 6.9);
  return v1 + v2 + v3;
}

/**
 * Calibrated Digital Elevation Model (DEM) for Yemen viewport:
 * lat in [11.6, 19.3], lng in [41.6, 54.8]
 * Returns elevation in meters (-900m seabed to +3670m Jabal An-Nabi Shu'ayb).
 */
export function getYemenElevationMeters(lat: number, lng: number): number {
  const inMainland = pointInPolygon(lat, lng, YEMEN_MAINLAND_POLY);
  const inSocotra = pointInPolygon(lat, lng, SOCOTRA_POLY);
  const inKamaran = pointInPolygon(lat, lng, KAMARAN_POLY);
  const inAfrica = pointInPolygon(lat, lng, AFRICA_HORN_CONTEXT_POLY);
  const inSaudiNorth = lat > 17.45 && lng > 43.1 && lng < 52.0 && !inMainland;
  const inOmanEast = lng >= 52.0 && lat > 16.64 && !inMainland;

  const isLand = inMainland || inSocotra || inKamaran || inAfrica || inSaudiNorth || inOmanEast;

  if (!isLand) {
    // Sea bathymetry shelf
    const edgeDist = Math.min(
      distToPolygonEdgeDeg(lat, lng, YEMEN_MAINLAND_POLY),
      distToPolygonEdgeDeg(lat, lng, SOCOTRA_POLY),
      distToPolygonEdgeDeg(lat, lng, AFRICA_HORN_CONTEXT_POLY)
    );
    return -Math.min(850, 40 + edgeDist * 620);
  }

  if (inSocotra) {
    const haggier = gaussianPeak(lat, lng, 12.56, 54.02, 0.12, 0.24, 1480);
    const plateau = gaussianPeak(lat, lng, 12.5, 53.78, 0.16, 0.42, 480);
    return Math.max(20, plateau + haggier + fbm(lat * 4, lng * 4) * 60);
  }

  if (inKamaran) return 35;

  if (inAfrica) {
    return 180 + gaussianPeak(lat, lng, 12.2, 42.3, 1.4, 1.0, 950) + fbm(lat * 2, lng * 2) * 80;
  }

  if (inSaudiNorth) {
    // Asir continuation west + Rub' al-Khali sands east
    const asir = gaussianPeak(lat, lng, 18.2, 43.2, 1.3, 0.7, 2100);
    const rub = 420 + fbm(lat * 1.4, lng * 1.4) * 55;
    return Math.max(240, rub + asir);
  }

  if (inOmanEast) {
    const dhofar = gaussianPeak(lat, lng, 17.1, 54.0, 0.45, 1.1, 1150);
    return 350 + dhofar + fbm(lat * 1.6, lng * 1.6) * 55;
  }

  // Yemen Mainland
  const coastDist = distToPolygonEdgeDeg(lat, lng, YEMEN_MAINLAND_POLY);
  let elev = 65 + Math.min(450, coastDist * 380);

  // Tihamah coastal strip (flat 0–200m along Red Sea)
  const isTihamah = lng < 43.45 && lat > 12.75 && lat < 16.5;

  // Western & Central Mountain Belt (fault-block & volcanic ridge)
  elev += gaussianPeak(lat, lng, 15.28, 43.97, 0.65, 0.48, 2250); // Nabi Shu'ayb massif
  elev += gaussianPeak(lat, lng, 15.28, 43.97, 0.16, 0.16, 980);  // Summit 3670m
  elev += gaussianPeak(lat, lng, 14.65, 44.52, 0.42, 0.45, 1950); // Dhamar / Jabal Isbil 3190m
  elev += gaussianPeak(lat, lng, 16.85, 43.72, 0.75, 0.52, 2050); // Sa'dah highlands
  elev += gaussianPeak(lat, lng, 13.85, 44.18, 0.62, 0.55, 2050); // Ibb / Taiz / Sabir
  elev += gaussianPeak(lat, lng, 13.75, 45.45, 0.58, 0.9, 1350);  // Abyan / Al-Bayda highlands

  // Intermontane Basins (Qiaan: Sa'dah, Bawn, Sana'a, Jahran)
  elev -= gaussianPeak(lat, lng, 14.72, 44.34, 0.14, 0.16, 420); // Qa' Jahran
  elev -= gaussianPeak(lat, lng, 15.36, 44.2, 0.15, 0.15, 450);  // Sana'a basin
  elev -= gaussianPeak(lat, lng, 16.94, 43.76, 0.15, 0.18, 360); // Qa' Sa'dah

  // Eastern Plateaus (Hadramout North & South + Mahrah)
  elev += gaussianPeak(lat, lng, 16.45, 48.9, 0.85, 2.35, 620);  // Northern Hadramout plateau
  elev += gaussianPeak(lat, lng, 15.15, 48.8, 0.65, 2.15, 660);  // Southern Hadramout plateau
  elev += gaussianPeak(lat, lng, 16.64, 52.85, 0.45, 0.65, 920); // Hawf / Mahrah escarpment

  // Natural micro-relief noise (reduced on Tihamah)
  elev += fbm(lat * 3.1, lng * 3.1) * (isTihamah ? 22 : 120);

  // Carve Real Major Wadis into the Terrain (p. 25–26)
  for (const wadi of YEMEN_WADIS) {
    const d = distToPolylineDeg(lat, lng, wadi.pts);
    const isHadramout = wadi.name.includes('حضرموت');
    const width = isHadramout ? 0.24 : 0.14;
    const depth = isHadramout ? 580 : 420;
    if (d < width * 2.2) {
      elev -= depth * Math.exp(-(d * d) / (width * width));
    }
  }

  // Smooth coastal shelf taper so coastline sits naturally near sea level
  if (coastDist < 0.22) {
    const factor = Math.min(1, coastDist / 0.22);
    elev = elev * (0.15 + 0.85 * factor);
  }

  if (isTihamah && lng < 43.18) {
    elev = Math.min(elev, 180);
  }

  return Math.max(15, Math.min(3670, elev));
}

/**
 * Calibrated DEM for the Arab World viewport:
 * lat in [-2, 38], lng in [-18, 61]
 */
export function getArabWorldElevationMeters(lat: number, lng: number): number {
  const inAfrica = pointInPolygon(lat, lng, ARAB_NORTH_AFRICA_POLY);
  const inAsia = pointInPolygon(lat, lng, ARAB_WEST_ASIA_POLY);
  if (!inAfrica && !inAsia) {
    const edge = Math.min(
      distToPolygonEdgeDeg(lat, lng, ARAB_NORTH_AFRICA_POLY),
      distToPolygonEdgeDeg(lat, lng, ARAB_WEST_ASIA_POLY)
    );
    return -Math.min(1200, 50 + edge * 350);
  }

  let elev = 280;

  if (inAfrica) {
    // Atlas Folded Mountains (up to 4,165m at Toubkal)
    elev += gaussianPeak(lat, lng, 31.1, -7.8, 1.8, 2.8, 3750);
    elev += gaussianPeak(lat, lng, 34.5, 1.5, 2.0, 6.0, 1750);
    // Hoggar & Tibesti Sahara highlands
    elev += gaussianPeak(lat, lng, 23.0, 5.5, 2.8, 3.2, 1650);
    elev += gaussianPeak(lat, lng, 20.8, 17.5, 2.5, 2.8, 1950);
    // Red Sea Hills (Egypt / Sudan fault-block mountains)
    elev += gaussianPeak(lat, lng, 25.5, 34.2, 4.5, 1.2, 1450);
  }

  if (inAsia) {
    // Yemen & Asir & Hijaz fault/volcanic highlands
    elev += gaussianPeak(lat, lng, 15.2, 44.2, 2.2, 1.8, 3300);
    elev += gaussianPeak(lat, lng, 19.5, 42.0, 3.2, 1.4, 2100);
    // Oman Hajar Mountains
    elev += gaussianPeak(lat, lng, 23.2, 57.3, 1.4, 1.6, 2550);
    // Levant Mountains (Lebanon / Anti-Lebanon / Palestine / Jordan)
    elev += gaussianPeak(lat, lng, 33.8, 36.1, 2.4, 1.2, 2200);
    // Northern Iraq Zagros border peaks
    elev += gaussianPeak(lat, lng, 36.5, 44.5, 1.4, 2.2, 2150);
    // Najd Plateau
    elev += gaussianPeak(lat, lng, 24.5, 45.5, 3.5, 4.5, 650);
  }

  elev += fbm(lat * 0.45, lng * 0.45) * 180;

  // Carve Nile, Tigris, Euphrates Alluvial Valleys
  for (const river of ARAB_RIVERS) {
    const d = distToPolylineDeg(lat, lng, river.pts);
    if (d < 1.8) {
      elev -= 420 * Math.exp(-(d * d) / 0.85);
    }
  }

  const edgeDist = Math.min(
    distToPolygonEdgeDeg(lat, lng, ARAB_NORTH_AFRICA_POLY),
    distToPolygonEdgeDeg(lat, lng, ARAB_WEST_ASIA_POLY)
  );
  if (edgeDist < 0.8) {
    elev *= 0.25 + 0.75 * (edgeDist / 0.8);
  }

  return Math.max(15, Math.min(4165, elev));
}
