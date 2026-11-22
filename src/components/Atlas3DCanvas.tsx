import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AtlasLocation } from '../types/textbook';
import {
  AFRICA_HORN_CONTEXT_POLY,
  ARAB_NORTH_AFRICA_POLY,
  ARAB_RIVERS,
  ARAB_WEST_ASIA_POLY,
  KAMARAN_POLY,
  LatLng,
  SOCOTRA_POLY,
  YEMEN_MAINLAND_POLY,
  YEMEN_WADIS,
  getArabWorldElevationMeters,
  getYemenElevationMeters,
  pointInPolygon
} from '../data/terrainGeoData';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export type Atlas3DMode = 'yemen-relief' | 'arab-world-relief' | 'globe' | 'mountains-3d';

interface Atlas3DCanvasProps {
  mode: Atlas3DMode;
  locations: AtlasLocation[];
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
}

// Bounds for Yemen 3D Relief plane (12 x 7 world units)
const YEMEN_BOUNDS = { minLat: 11.6, maxLat: 19.3, minLng: 41.6, maxLng: 54.8, w: 12.0, d: 7.0 };
// Bounds for Arab World 3D Relief plane (14 x 7.5 world units)
const ARAB_BOUNDS = { minLat: -2.0, maxLat: 38.0, minLng: -18.0, maxLng: 61.0, w: 14.0, d: 7.5 };

const ELEV_SCALE_YEMEN = 1.65 / 3670; // 3670m -> 1.65 units (clear relief without vertical distortion spike)
const ELEV_SCALE_ARAB = 1.35 / 4165;  // 4165m -> 1.35 units

function geoToPlaneXZ(
  lat: number,
  lng: number,
  b: { minLat: number; maxLat: number; minLng: number; maxLng: number; w: number; d: number }
): { x: number; z: number } {
  const u = (lng - b.minLng) / (b.maxLng - b.minLng);
  const v = (b.maxLat - lat) / (b.maxLat - b.minLat);
  return {
    x: (u - 0.5) * b.w,
    z: (v - 0.5) * b.d
  };
}

function latLngToVec3(lat: number, lng: number, radius: number, out: THREE.Vector3): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  out.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
  return out;
}

/**
 * Hypsometric + Bathymetric Color Ramp (Cartographic Standard)
 * Clear distinction between sea, green coastal plains, fertile highlands, rocky ridges, and desert plateaus.
 */
function elevationToRgb(elevM: number, isYemenFocus: boolean): [number, number, number] {
  if (elevM <= 0) {
    // Bathymetry: shallow coastal turquoise -> deep ocean blue
    const t = Math.min(1, Math.abs(elevM) / 850);
    return [
      Math.round(56 - t * 44),
      Math.round(189 - t * 115),
      Math.round(248 - t * 120)
    ];
  }
  if (!isYemenFocus) {
    // Subtle neutral stone for neighboring territory outside Yemen borders
    const shade = Math.min(1, elevM / 2000);
    return [
      Math.round(234 - shade * 32),
      Math.round(231 - shade * 34),
      Math.round(224 - shade * 36)
    ];
  }
  if (elevM < 220) {
    // Lowland coastal plains (Tihamah / Southern plains): warm olive-emerald
    const t = elevM / 220;
    return [
      Math.round(115 + t * 48),
      Math.round(188 + t * 20),
      Math.round(110 + t * 12)
    ];
  }
  if (elevM < 900) {
    // Foothills & Eastern Plateaus (Hadramout / Jawf): warm sage -> sandstone tan
    const t = (elevM - 220) / 680;
    return [
      Math.round(163 + t * 52),
      Math.round(208 - t * 24),
      Math.round(122 + t * 14)
    ];
  }
  if (elevM < 2000) {
    // Mid-Highlands & Terraces: ochre -> rich terracotta-brown
    const t = (elevM - 900) / 1100;
    return [
      Math.round(215 - t * 42),
      Math.round(184 - t * 62),
      Math.round(136 - t * 58)
    ];
  }
  if (elevM < 3000) {
    // High Mountain Ridges
    const t = (elevM - 2000) / 1000;
    return [
      Math.round(173 - t * 38),
      Math.round(122 - t * 34),
      Math.round(78 - t * 18)
    ];
  }
  // Highest Summits (3000m - 3670m+)
  const t = Math.min(1, (elevM - 3000) / 1100);
  return [
    Math.round(135 + t * 90),
    Math.round(88 + t * 130),
    Math.round(60 + t * 165)
  ];
}

function drawGeoPoly(
  ctx: CanvasRenderingContext2D,
  poly: LatLng[],
  toXY: (lat: number, lng: number) => [number, number],
  stroke?: string,
  lineWidth = 1.5,
  fill?: string
) {
  ctx.beginPath();
  poly.forEach(([lat, lng], idx) => {
    const [x, y] = toXY(lat, lng);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function createYemenTerrainTexture(): THREE.CanvasTexture {
  const W = 768;
  const H = 448;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let py = 0; py < H; py++) {
    const lat = YEMEN_BOUNDS.maxLat - (py / (H - 1)) * (YEMEN_BOUNDS.maxLat - YEMEN_BOUNDS.minLat);
    for (let px = 0; px < W; px++) {
      const lng = YEMEN_BOUNDS.minLng + (px / (W - 1)) * (YEMEN_BOUNDS.maxLng - YEMEN_BOUNDS.minLng);
      const elev = getYemenElevationMeters(lat, lng);
      const inYemen =
        pointInPolygon(lat, lng, YEMEN_MAINLAND_POLY) ||
        pointInPolygon(lat, lng, SOCOTRA_POLY) ||
        pointInPolygon(lat, lng, KAMARAN_POLY);
      const [r, g, b] = elevationToRgb(elev, elev <= 0 || inYemen);
      const idx = (py * W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const toXY = (lat: number, lng: number): [number, number] => [
    ((lng - YEMEN_BOUNDS.minLng) / (YEMEN_BOUNDS.maxLng - YEMEN_BOUNDS.minLng)) * W,
    ((YEMEN_BOUNDS.maxLat - lat) / (YEMEN_BOUNDS.maxLat - YEMEN_BOUNDS.minLat)) * H
  ];

  // Subtle 1-degree coordinate graticule
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.10)';
  ctx.lineWidth = 1;
  for (let lat = 12; lat <= 19; lat++) {
    const [, y] = toXY(lat, YEMEN_BOUNDS.minLng);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let lng = 42; lng <= 54; lng += 2) {
    const [x] = toXY(YEMEN_BOUNDS.minLat, lng);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Draw crisp wadi water ribbons along carved valleys
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const wadi of YEMEN_WADIS) {
    ctx.beginPath();
    wadi.pts.forEach(([lat, lng], i) => {
      const [x, y] = toXY(lat, lng);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.85)';
    ctx.lineWidth = wadi.name.includes('حضرموت') ? 2.8 : 2.0;
    ctx.stroke();
  }

  // Crisp Yemen coastline & political border outline
  drawGeoPoly(ctx, YEMEN_MAINLAND_POLY, toXY, '#064e3b', 2.2);
  drawGeoPoly(ctx, SOCOTRA_POLY, toXY, '#064e3b', 1.8);
  drawGeoPoly(ctx, KAMARAN_POLY, toXY, '#064e3b', 1.2);
  drawGeoPoly(ctx, AFRICA_HORN_CONTEXT_POLY, toXY, '#64748b', 1.4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createArabWorldTerrainTexture(): THREE.CanvasTexture {
  const W = 896;
  const H = 480;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let py = 0; py < H; py++) {
    const lat = ARAB_BOUNDS.maxLat - (py / (H - 1)) * (ARAB_BOUNDS.maxLat - ARAB_BOUNDS.minLat);
    for (let px = 0; px < W; px++) {
      const lng = ARAB_BOUNDS.minLng + (px / (W - 1)) * (ARAB_BOUNDS.maxLng - ARAB_BOUNDS.minLng);
      const elev = getArabWorldElevationMeters(lat, lng);
      const [r, g, b] = elevationToRgb(elev, true);
      const idx = (py * W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const toXY = (lat: number, lng: number): [number, number] => [
    ((lng - ARAB_BOUNDS.minLng) / (ARAB_BOUNDS.maxLng - ARAB_BOUNDS.minLng)) * W,
    ((ARAB_BOUNDS.maxLat - lat) / (ARAB_BOUNDS.maxLat - ARAB_BOUNDS.minLat)) * H
  ];

  // Tropic of Cancer & Equator
  const [, eqY] = toXY(0, 0);
  const [, cancerY] = toXY(23.5, 0);
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(W, eqY);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, cancerY);
  ctx.lineTo(W, cancerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Major Arab Rivers (Nile, Tigris, Euphrates)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const river of ARAB_RIVERS) {
    ctx.beginPath();
    river.pts.forEach(([lat, lng], i) => {
      const [x, y] = toXY(lat, lng);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }

  drawGeoPoly(ctx, ARAB_NORTH_AFRICA_POLY, toXY, '#14532d', 1.8);
  drawGeoPoly(ctx, ARAB_WEST_ASIA_POLY, toXY, '#14532d', 1.8);
  drawGeoPoly(ctx, YEMEN_MAINLAND_POLY, toXY, '#047857', 2.0);
  drawGeoPoly(ctx, SOCOTRA_POLY, toXY, '#047857', 1.4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHighResGlobeTexture(): THREE.CanvasTexture {
  const W = 1536;
  const H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#0c4a6e');
  oceanGrad.addColorStop(0.5, '#0369a1');
  oceanGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += W / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += H / 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const toXY = (lat: number, lng: number): [number, number] => [
    ((lng + 180) / 360) * W,
    ((90 - lat) / 180) * H
  ];

  // Tropics & Equator
  const [, eqY] = toXY(0, 0);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(W, eqY);
  ctx.stroke();

  // Eurasia & Africa continental backdrop
  drawGeoPoly(
    ctx,
    [
      [36, -9], [43, -9], [48, -4], [54, 8], [60, 10], [70, 28], [68, 60],
      [55, 80], [40, 115], [22, 110], [12, 105], [20, 90], [8, 77], [24, 67],
      [25, 57], [30, 48.5], [37.1, 44.3], [37.2, 36], [41, 29], [37, 22], [41, 14], [43, 3]
    ],
    toXY,
    '#64748b',
    1.2,
    '#cfd8c0'
  );
  drawGeoPoly(
    ctx,
    [
      [35, -6], [37, 10], [32, 15], [31, 32], [22, 37], [12, 43], [11.8, 51.2],
      [0, 42], [-12, 40], [-34, 25], [-34, 18], [-15, 12], [4, 9], [5, -8], [15, -17], [28, -13]
    ],
    toXY,
    '#64748b',
    1.2,
    '#ddd4be'
  );
  drawGeoPoly(ctx, [[60, -140], [50, -60], [25, -80], [15, -90], [32, -117]], toXY, '#64748b', 1, '#cfd8c0');
  drawGeoPoly(ctx, [[10, -75], [-5, -35], [-50, -70], [-20, -80]], toXY, '#64748b', 1, '#cfd8c0');
  drawGeoPoly(ctx, [[-12, 130], [-25, 153], [-38, 140], [-30, 115]], toXY, '#64748b', 1, '#cfd8c0');

  // Detailed Arab World Wings + Yemen Highlight
  drawGeoPoly(ctx, ARAB_NORTH_AFRICA_POLY, toXY, '#14532d', 1.4, '#84cc16');
  drawGeoPoly(ctx, ARAB_WEST_ASIA_POLY, toXY, '#14532d', 1.4, '#a3e635');
  drawGeoPoly(ctx, YEMEN_MAINLAND_POLY, toXY, '#022c22', 1.6, '#10b981');
  drawGeoPoly(ctx, SOCOTRA_POLY, toXY, '#022c22', 1.2, '#10b981');

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Atlas3DCanvas: React.FC<Atlas3DCanvasProps> = ({
  mode,
  locations,
  selectedLocationId,
  onSelectLocation
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsApiRef = useRef<{ zoom: (factor: number) => void; reset: () => void } | null>(null);
  const onSelectRef = useRef(onSelectLocation);
  onSelectRef.current = onSelectLocation;

  const [hoveredInfo, setHoveredInfo] = useState<{ id: string; name: string } | null>(null);
  const [selectedScreenPos, setSelectedScreenPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const [useSoftware2DFallback, setUseSoftware2DFallback] = useState(false);

  const selectedLoc = locations.find((l) => l.id === selectedLocationId);

  useEffect(() => {
    if (useSoftware2DFallback) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
    } catch {
      setUseSoftware2DFallback(true);
      return;
    }

    const width = container.clientWidth || 760;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(mode === 'globe' ? 0x0b1324 : 0xeff6ff);
    if (mode !== 'globe') {
      scene.fog = new THREE.FogExp2(0xeff6ff, 0.018);
    }

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-point + hemisphere studio terrain lighting (raking sunlight reveals valleys & ridges)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x64748b, 1.05);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.05);
    sunLight.position.set(7.5, 6.2, 5.5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.7);
    fillLight.position.set(-6.0, 3.5, -5.0);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.6;
    controls.maxDistance = 16;

    const disposables: { dispose: () => void }[] = [];
    const clickableMeshes: THREE.Mesh[] = [];
    const _vec3 = new THREE.Vector3();
    let selectedPinWorldPos: THREE.Vector3 | null = null;

    const defaultCamPos = new THREE.Vector3();
    const defaultTarget = new THREE.Vector3(0, 0, 0);

    const buildCompactPin = (
      isSelected: boolean,
      colorHex: number,
      stemHeight: number,
      stemRadius: number,
      headRadius: number,
      loc: AtlasLocation
    ) => {
      const pinGroup = new THREE.Group();

      // Base precision target ring flush on terrain
      const ringGeo = new THREE.RingGeometry(headRadius * 0.9, headRadius * 1.45, 20);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xe11d48 : 0xffffff,
        transparent: true,
        opacity: isSelected ? 0.92 : 0.55,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.012;
      pinGroup.add(ring);

      // Slender metallic pin needle
      const stemGeo = new THREE.CylinderGeometry(stemRadius * 0.7, stemRadius, stemHeight, 10);
      const stemMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xbe123c : 0x334155,
        roughness: 0.35,
        metalness: 0.65
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = stemHeight / 2;
      pinGroup.add(stem);

      // Compact jewel head
      const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xe11d48 : colorHex,
        emissive: isSelected ? 0x9f1239 : 0x000000,
        roughness: 0.22,
        metalness: 0.25
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = stemHeight;
      head.userData = { locId: loc.id, locName: loc.shortLabel ?? loc.name };
      head.layers.enable(1);
      clickableMeshes.push(head);
      pinGroup.add(head);

      // Invisible slightly larger touch/click proxy so small pins stay effortless to click
      const hitGeo = new THREE.SphereGeometry(headRadius * 2.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitProxy = new THREE.Mesh(hitGeo, hitMat);
      hitProxy.position.y = stemHeight;
      hitProxy.userData = { locId: loc.id, locName: loc.shortLabel ?? loc.name };
      hitProxy.layers.enable(1);
      clickableMeshes.push(hitProxy);
      pinGroup.add(hitProxy);

      disposables.push(ringGeo, ringMat, stemGeo, stemMat, headGeo, headMat, hitGeo, hitMat);
      return pinGroup;
    };

    if (mode === 'yemen-relief' || mode === 'arab-world-relief') {
      const isYemen = mode === 'yemen-relief';
      const b = isYemen ? YEMEN_BOUNDS : ARAB_BOUNDS;
      const elevScale = isYemen ? ELEV_SCALE_YEMEN : ELEV_SCALE_ARAB;
      const getElev = isYemen ? getYemenElevationMeters : getArabWorldElevationMeters;

      const segX = isYemen ? 150 : 148;
      const segZ = isYemen ? 92 : 84;
      const terrainGeo = new THREE.PlaneGeometry(b.w, b.d, segX, segZ);
      terrainGeo.rotateX(-Math.PI / 2);

      const posAttr = terrainGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const u = vx / b.w + 0.5;
        const v = vz / b.d + 0.5;
        const lng = b.minLng + u * (b.maxLng - b.minLng);
        const lat = b.maxLat - v * (b.maxLat - b.minLat);
        const elevM = getElev(lat, lng);
        const y = elevM > 0 ? elevM * elevScale : (elevM / 900) * 0.22;
        posAttr.setY(i, y);
      }
      terrainGeo.computeVertexNormals();

      const terrainTex = isYemen ? createYemenTerrainTexture() : createArabWorldTerrainTexture();
      terrainTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const terrainMat = new THREE.MeshStandardMaterial({
        map: terrainTex,
        roughness: 0.82,
        metalness: 0.04
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      scene.add(terrainMesh);
      disposables.push(terrainGeo, terrainTex, terrainMat);

      // Translucent Sea Level Surface Sheet
      const seaGeo = new THREE.PlaneGeometry(b.w, b.d);
      seaGeo.rotateX(-Math.PI / 2);
      const seaMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.34,
        roughness: 0.14,
        metalness: 0.18,
        depthWrite: false
      });
      const seaMesh = new THREE.Mesh(seaGeo, seaMat);
      seaMesh.position.y = 0.014;
      scene.add(seaMesh);
      disposables.push(seaGeo, seaMat);

      // Grounded compact cartographic pins filtered to matching scope
      const scopedLocations = locations.filter((l) =>
        isYemen ? l.scope === 'yemen' : l.scope === 'arab-world'
      );

      scopedLocations.forEach((loc) => {
        if (loc.lat < b.minLat || loc.lat > b.maxLat || loc.lng < b.minLng || loc.lng > b.maxLng) {
          return;
        }
        const isSelected = loc.id === selectedLocationId;
        const { x, z } = geoToPlaneXZ(loc.lat, loc.lng, b);
        const elevM = Math.max(0, getElev(loc.lat, loc.lng));
        const groundY = elevM * elevScale;

        const pinColor = loc.layer === 'water' ? 0x0284c7 : loc.layer === 'reserves' ? 0x059669 : 0xd97706;
        const stemH = isSelected ? 0.42 : 0.24;
        const headR = isSelected ? 0.068 : 0.042;
        const pin = buildCompactPin(isSelected, pinColor, stemH, 0.009, headR, loc);
        pin.position.set(x, groundY, z);
        scene.add(pin);

        if (isSelected) {
          selectedPinWorldPos = new THREE.Vector3(x, groundY + stemH + 0.08, z);
        }
      });

      defaultCamPos.set(isYemen ? -0.4 : 0, isYemen ? 5.6 : 6.4, isYemen ? 7.2 : 8.2);
      defaultTarget.set(0, 0.35, 0.2);
      camera.position.copy(defaultCamPos);
      camera.lookAt(defaultTarget);
      controls.target.copy(defaultTarget);
      controls.maxPolarAngle = Math.PI / 2.15;
    } else if (mode === 'globe') {
      const globeGroup = new THREE.Group();
      scene.add(globeGroup);

      const earthGeo = new THREE.SphereGeometry(2.2, 64, 48);
      const earthTex = createHighResGlobeTexture();
      earthTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const earthMat = new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.72,
        metalness: 0.06
      });
      globeGroup.add(new THREE.Mesh(earthGeo, earthMat));
      disposables.push(earthGeo, earthTex, earthMat);

      const atmoGeo = new THREE.SphereGeometry(2.26, 48, 36);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        side: THREE.BackSide
      });
      globeGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
      disposables.push(atmoGeo, atmoMat);

      // Tiny proportional precision pins on the 2.2-radius globe
      locations.forEach((loc) => {
        const isSelected = loc.id === selectedLocationId;
        const pos = latLngToVec3(loc.lat, loc.lng, 2.2, _vec3).clone();
        const normal = pos.clone().normalize();

        const stemH = isSelected ? 0.11 : 0.055;
        const headR = isSelected ? 0.032 : 0.019;
        const colorHex = loc.scope === 'yemen' ? 0x10b981 : 0x38bdf8;
        const pin = buildCompactPin(isSelected, colorHex, stemH, 0.004, headR, loc);
        pin.position.copy(pos);
        pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        globeGroup.add(pin);

        if (isSelected) {
          selectedPinWorldPos = pos.clone().addScaledVector(normal, stemH + 0.04);
        }
      });

      const focusTarget = latLngToVec3(22, 36, 4.9, new THREE.Vector3());
      defaultCamPos.copy(focusTarget);
      camera.position.copy(defaultCamPos);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
    } else {
      // Mountains 3D Educational Formations (Unit 3 p. 67)
      const baseGeo = new THREE.BoxGeometry(3.1, 0.35, 3.2);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
      disposables.push(baseGeo, baseMat);

      // 1. Folded (Atlas)
      const foldGroup = new THREE.Group();
      foldGroup.position.set(-3.5, 0, 0);
      foldGroup.add(new THREE.Mesh(baseGeo, baseMat));
      const foldPlane = new THREE.PlaneGeometry(2.9, 2.9, 48, 28);
      foldPlane.rotateX(-Math.PI / 2);
      const fp = foldPlane.attributes.position;
      for (let i = 0; i < fp.count; i++) {
        const x = fp.getX(i);
        const z = fp.getZ(i);
        fp.setY(i, 0.25 + 0.85 * Math.pow(Math.cos(x * 1.55), 2) + 0.14 * Math.sin(z * 2.2));
      }
      foldPlane.computeVertexNormals();
      const foldMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 });
      const foldMesh = new THREE.Mesh(foldPlane, foldMat);
      foldMesh.userData = { locId: 'loc-atlas-mountains', locName: 'الجبال الالتوائية (أطلس وعمان)' };
      foldMesh.layers.enable(1);
      clickableMeshes.push(foldMesh);
      foldGroup.add(foldMesh);
      scene.add(foldGroup);
      disposables.push(foldPlane, foldMat);

      // 2. Fault-block (Red Sea / Yemen / Sham)
      const faultGroup = new THREE.Group();
      faultGroup.position.set(0, 0, 0);
      faultGroup.add(new THREE.Mesh(baseGeo, baseMat));
      const b1Geo = new THREE.BoxGeometry(1.1, 1.35, 2.7);
      const b2Geo = new THREE.BoxGeometry(1.0, 0.55, 2.7);
      const b3Geo = new THREE.BoxGeometry(0.8, 1.05, 2.7);
      const faultMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 });
      const b1 = new THREE.Mesh(b1Geo, faultMat);
      b1.position.set(-0.85, 0.7, 0);
      const b2 = new THREE.Mesh(b2Geo, faultMat);
      b2.position.set(0.1, 0.3, 0);
      const b3 = new THREE.Mesh(b3Geo, faultMat);
      b3.position.set(0.95, 0.55, 0);
      [b1, b2, b3].forEach((b) => {
        b.userData = { locId: 'loc-nabi-shuayb', locName: 'الجبال الانكسارية (البحر الأحمر واليمن والشام)' };
        b.layers.enable(1);
        clickableMeshes.push(b);
        faultGroup.add(b);
      });
      scene.add(faultGroup);
      disposables.push(b1Geo, b2Geo, b3Geo, faultMat);

      // 3. Volcanic (Yemen Highlands / Jabal al-Druze)
      const volcGroup = new THREE.Group();
      volcGroup.position.set(3.5, 0, 0);
      volcGroup.add(new THREE.Mesh(baseGeo, baseMat));
      const coneGeo = new THREE.ConeGeometry(1.25, 1.55, 32, 1, false);
      const volcMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 });
      const cone = new THREE.Mesh(coneGeo, volcMat);
      cone.position.y = 0.85;
      cone.userData = { locId: 'loc-nabi-shuayb', locName: 'الجبال البركانية (مرتفعات اليمن وجبل الدروز)' };
      cone.layers.enable(1);
      clickableMeshes.push(cone);
      volcGroup.add(cone);

      const craterGeo = new THREE.CylinderGeometry(0.28, 0.16, 0.14, 20);
      const craterMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0x9a3412, roughness: 0.4 });
      const crater = new THREE.Mesh(craterGeo, craterMat);
      crater.position.y = 1.6;
      volcGroup.add(crater);
      scene.add(volcGroup);
      disposables.push(coneGeo, volcMat, craterGeo, craterMat);

      defaultCamPos.set(0, 4.2, 8.2);
      defaultTarget.set(0, 0.6, 0);
      camera.position.copy(defaultCamPos);
      camera.lookAt(defaultTarget);
      controls.target.copy(defaultTarget);
      controls.maxPolarAngle = Math.PI / 2.1;
    }

    const updateSelectedScreenCallout = () => {
      if (!selectedPinWorldPos || !container) {
        setSelectedScreenPos(null);
        return;
      }
      const proj = selectedPinWorldPos.clone().project(camera);
      const w = container.clientWidth || 760;
      const h = container.clientHeight || 450;
      // Check if facing camera (on globe check dot product; in general check z < 1)
      let facing = proj.z < 1;
      if (mode === 'globe') {
        const dirToPin = selectedPinWorldPos.clone().normalize();
        const dirToCam = camera.position.clone().normalize();
        facing = dirToPin.dot(dirToCam) > 0.15;
      }
      setSelectedScreenPos({
        x: (proj.x * 0.5 + 0.5) * w,
        y: (-proj.y * 0.5 + 0.5) * h,
        visible: facing
      });
    };

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();

    let lastHoverTs = 0;
    const onPointerMove = (ev: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTs < 50) return;
      lastHoverTs = now;
      const rect = renderer!.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        renderer!.domElement.style.cursor = 'pointer';
        setHoveredInfo({
          id: String(hits[0].object.userData.locId ?? ''),
          name: String(hits[0].object.userData.locName ?? '')
        });
      } else {
        renderer!.domElement.style.cursor = 'grab';
        setHoveredInfo(null);
      }
    };

    const onClick = (ev: MouseEvent) => {
      const rect = renderer!.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const locId = hits[0].object.userData.locId as string | undefined;
        if (locId) onSelectRef.current(locId);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    let frameId = 0;
    let disposed = false;
    let scheduled = false;

    const renderFrame = () => {
      scheduled = false;
      if (disposed || !renderer) return;
      const changed = controls.update();
      renderer.render(scene, camera);
      updateSelectedScreenCallout();
      if (changed) requestRender();
    };

    const requestRender = () => {
      if (disposed || scheduled) return;
      scheduled = true;
      frameId = requestAnimationFrame(renderFrame);
    };

    controlsApiRef.current = {
      zoom: (factor: number) => {
        const dir = camera.position.clone().sub(controls.target);
        const newLen = Math.max(controls.minDistance, Math.min(controls.maxDistance, dir.length() * factor));
        dir.setLength(newLen);
        camera.position.copy(controls.target).add(dir);
        requestRender();
      },
      reset: () => {
        camera.position.copy(defaultCamPos);
        controls.target.copy(defaultTarget);
        controls.update();
        requestRender();
      }
    };

    controls.addEventListener('change', requestRender);
    const onResize = () => {
      if (!container || disposed || !renderer) return;
      const w = container.clientWidth || 760;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    // Initial synchronous render
    renderer.render(scene, camera);
    updateSelectedScreenCallout();

    return () => {
      disposed = true;
      controlsApiRef.current = null;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('change', requestRender);
      renderer?.domElement.removeEventListener('pointermove', onPointerMove);
      renderer?.domElement.removeEventListener('click', onClick);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer?.dispose();
    };
  }, [mode, locations, selectedLocationId, useSoftware2DFallback]);

  if (useSoftware2DFallback) {
    return (
      <FallbackRelief3D
        mode={mode}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
        onRetryWebGL={() => setUseSoftware2DFallback(false)}
      />
    );
  }

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
      <div ref={mountRef} className="h-full w-full" />

      {/* Projected crisp Arabic callout for ONLY the currently selected pin */}
      {selectedScreenPos && selectedScreenPos.visible && selectedLoc && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-rose-300 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-sm"
          style={{ left: `${selectedScreenPos.x}px`, top: `${Math.max(36, selectedScreenPos.y - 6)}px` }}
        >
          {selectedLoc.shortLabel ?? selectedLoc.name.split('(')[0].trim()}
        </div>
      )}

      {/* Top instruction / hover readout */}
      <div className="pointer-events-none absolute top-3 right-3 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs text-white">
        {hoveredInfo
          ? hoveredInfo.name
          : mode === 'yemen-relief'
          ? 'مجسم تضاريس اليمن الفعلي 3D (مرتفعات 3670م · أودية محفورة · سهول تهامة · سقطرى)'
          : mode === 'arab-world-relief'
          ? 'مجسم تضاريس الوطن العربي 3D (أطلس 4165م · النيل والفرات · البحر الأحمر والمضائق)'
          : mode === 'globe'
          ? 'الكرة الأرضية المرجعية بدقة سواحل عالية ودبابيس مواقع دقيقة'
          : 'مقارنة تكوين الجبال 3D: الالتوائية · الانكسارية · البركانية'}
      </div>

      {/* Elevation legend for terrain modes */}
      {(mode === 'yemen-relief' || mode === 'arab-world-relief') && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-slate-900/85 px-2.5 py-1 text-[10px] text-white">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-400" />بحر/أودية</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" />سهول 0–200م</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-300" />هضاب</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-700" />جبال عالية</span>
        </div>
      )}

      {/* Camera Zoom, Reset & Light Fallback */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-slate-900/90 p-1 text-white">
        <button
          type="button"
          onClick={() => controlsApiRef.current?.zoom(0.8)}
          title="تكبير"
          className="rounded p-1.5 hover:bg-slate-700"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => controlsApiRef.current?.zoom(1.25)}
          title="تصغير"
          className="rounded p-1.5 hover:bg-slate-700"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => controlsApiRef.current?.reset()}
          title="إعادة الضبط"
          className="rounded p-1.5 hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setUseSoftware2DFallback(true)}
          className="rounded border border-slate-600 px-2 py-1 text-[11px] hover:bg-slate-700"
        >
          الوضع الخفيف
        </button>
      </div>
    </div>
  );
};

/**
 * Geographic Isometric Relief Fallback (when WebGL is disabled)
 */
const FallbackRelief3D: React.FC<{
  mode: Atlas3DMode;
  locations: AtlasLocation[];
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  onRetryWebGL: () => void;
}> = ({ mode, locations, selectedLocationId, onSelectLocation, onRetryWebGL }) => {
  const isYemen = mode === 'yemen-relief' || mode === 'mountains-3d';
  const filtered = locations.filter((l) => (isYemen ? l.scope === 'yemen' : l.scope === 'arab-world'));

  const toIso = (lat: number, lng: number) => {
    const b = isYemen ? YEMEN_BOUNDS : ARAB_BOUNDS;
    const u = (lng - b.minLng) / (b.maxLng - b.minLng);
    const v = (b.maxLat - lat) / (b.maxLat - b.minLat);
    const elev = isYemen ? getYemenElevationMeters(lat, lng) : getArabWorldElevationMeters(lat, lng);
    const hPx = elev > 0 ? (elev / 3670) * 52 : 0;
    const x = 110 + u * 470 + (1 - v) * 90;
    const y = 135 + v * 215 - hPx;
    return { x, y };
  };

  const polyToPath = (poly: LatLng[]) =>
    poly
      .map(([la, ln], i) => {
        const p = toIso(la, ln);
        return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-950 to-slate-900 text-white">
      <div className="absolute top-3 right-3 z-10 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs">
        عرض تضاريسي مجسم (الوضع الخفيف أوفلاين)
      </div>
      <button
        type="button"
        onClick={onRetryWebGL}
        className="absolute bottom-3 left-3 z-10 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700"
      >
        تفعيل محرك WebGL الثلاثي
      </button>

      <svg viewBox="0 0 760 450" className="h-full w-full">
        {isYemen ? (
          <>
            <path d={polyToPath(YEMEN_MAINLAND_POLY)} fill="#65a30d" stroke="#dcfce7" strokeWidth="1.5" />
            <path d={polyToPath(SOCOTRA_POLY)} fill="#10b981" stroke="#dcfce7" strokeWidth="1.2" />
            {YEMEN_WADIS.map((w) => (
              <path
                key={w.name}
                d={w.pts
                  .map(([la, ln], i) => {
                    const p = toIso(la, ln);
                    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            ))}
          </>
        ) : (
          <>
            <path d={polyToPath(ARAB_NORTH_AFRICA_POLY)} fill="#65a30d" stroke="#dcfce7" strokeWidth="1.4" />
            <path d={polyToPath(ARAB_WEST_ASIA_POLY)} fill="#84cc16" stroke="#dcfce7" strokeWidth="1.4" />
          </>
        )}
        {filtered.map((loc) => {
          const p = toIso(loc.lat, loc.lng);
          const sel = loc.id === selectedLocationId;
          return (
            <g key={loc.id} onClick={() => onSelectLocation(loc.id)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={sel ? 5.5 : 3.5} fill={sel ? '#e11d48' : '#f59e0b'} stroke="#fff" strokeWidth="1.2" />
              {sel && (
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fef3c7" fontSize="11" fontWeight="700">
                  {loc.shortLabel ?? loc.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Atlas3DCanvas;
