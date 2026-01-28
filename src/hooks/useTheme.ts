import { useState, useEffect, useCallback } from 'react';

export type ThemeColor = 'orange' | 'blue' | 'green' | 'pink' | 'purple';

interface ThemeConfig {
  name: string;
  primary: string;
  accent: string;
  cssVars: {
    primary: string;
    accent: string;
    ring: string;
  };
}

export const themes: Record<ThemeColor, ThemeConfig> = {
  orange: {
    name: 'Sunset',
    primary: '#ea580c',
    accent: '#f59e0b',
    cssVars: {
      primary: '16 90% 55%',
      accent: '35 100% 55%',
      ring: '16 90% 55%',
    },
  },
  blue: {
    name: 'Ocean',
    primary: '#3b82f6',
    accent: '#06b6d4',
    cssVars: {
      primary: '217 91% 60%',
      accent: '188 94% 43%',
      ring: '217 91% 60%',
    },
  },
  green: {
    name: 'Forest',
    primary: '#22c55e',
    accent: '#84cc16',
    cssVars: {
      primary: '142 71% 45%',
      accent: '84 81% 44%',
      ring: '142 71% 45%',
    },
  },
  pink: {
    name: 'Rose',
    primary: '#ec4899',
    accent: '#f472b6',
    cssVars: {
      primary: '330 81% 60%',
      accent: '330 86% 70%',
      ring: '330 81% 60%',
    },
  },
  purple: {
    name: 'Violet',
    primary: '#8b5cf6',
    accent: '#a78bfa',
    cssVars: {
      primary: '262 83% 58%',
      accent: '262 83% 70%',
      ring: '262 83% 58%',
    },
  },
};

const THEME_STORAGE_KEY = 'Now Music-theme';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeColor) || 'orange';
  });

  const applyTheme = useCallback((themeColor: ThemeColor) => {
    const config = themes[themeColor];
    const root = document.documentElement;
    
    root.style.setProperty('--primary', config.cssVars.primary);
    root.style.setProperty('--accent', config.cssVars.accent);
    root.style.setProperty('--ring', config.cssVars.ring);
    root.style.setProperty('--sidebar-primary', config.cssVars.primary);
    root.style.setProperty('--sidebar-ring', config.cssVars.ring);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  return { theme, setTheme, themes };
};

export default useTheme;