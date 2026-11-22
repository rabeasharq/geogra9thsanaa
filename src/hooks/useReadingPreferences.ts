import { useEffect, useState } from 'react';

export type ReadingThemeMode = 'light' | 'reading' | 'night';

export interface ReadingPreferences {
  themeMode: ReadingThemeMode;
  fontScale: number; // percentage: 100..160
}

export const FONT_SCALE_STEPS = [100, 115, 130, 145, 160] as const;

const STORAGE_KEY = 'yemen-geo9-display-prefs-v1';

const DEFAULT_PREFS: ReadingPreferences = {
  themeMode: 'light',
  fontScale: 100
};

function loadPrefs(): ReadingPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReadingPreferences>;
    const themeMode: ReadingThemeMode =
      parsed.themeMode === 'reading' || parsed.themeMode === 'night' || parsed.themeMode === 'light'
        ? parsed.themeMode
        : 'light';
    const fontScale =
      typeof parsed.fontScale === 'number' && parsed.fontScale >= 90 && parsed.fontScale <= 175
        ? parsed.fontScale
        : 100;
    return { themeMode, fontScale };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useReadingPreferences() {
  const [prefs, setPrefs] = useState<ReadingPreferences>(loadPrefs);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }

    const html = document.documentElement;
    html.setAttribute('data-theme', prefs.themeMode);
    html.style.fontSize = `${prefs.fontScale}%`;
  }, [prefs]);

  const setThemeMode = (themeMode: ReadingThemeMode) => {
    setPrefs((prev) => ({ ...prev, themeMode }));
  };

  const setFontScale = (fontScale: number) => {
    const clamped = Math.max(90, Math.min(160, fontScale));
    setPrefs((prev) => ({ ...prev, fontScale: clamped }));
  };

  const increaseFont = () => {
    setPrefs((prev) => {
      const nextStep = FONT_SCALE_STEPS.find((s) => s > prev.fontScale);
      return { ...prev, fontScale: nextStep ?? Math.min(160, prev.fontScale + 15) };
    });
  };

  const decreaseFont = () => {
    setPrefs((prev) => {
      const prevStep = [...FONT_SCALE_STEPS].reverse().find((s) => s < prev.fontScale);
      return { ...prev, fontScale: prevStep ?? Math.max(100, prev.fontScale - 15) };
    });
  };

  const resetPrefs = () => setPrefs(DEFAULT_PREFS);

  return {
    themeMode: prefs.themeMode,
    fontScale: prefs.fontScale,
    setThemeMode,
    setFontScale,
    increaseFont,
    decreaseFont,
    resetPrefs
  };
}
