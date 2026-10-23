import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { colorsDark, colorsLight } from './colors';
import { radius } from './radius';
import { createShadows } from './shadows';
import { spacing } from './spacing';
import { loadStoredColorScheme, persistColorScheme } from './themeStorage';
import type { AppTheme, ColorScheme } from './types';
import { typography } from './typography';

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildTheme(scheme: ColorScheme): AppTheme {
  const colors = scheme === 'dark' ? colorsDark : colorsLight;
  return {
    colors,
    spacing,
    radius,
    typography,
    shadows: createShadows(scheme),
  };
}

type Props = {
  children: React.ReactNode;
  initialScheme?: ColorScheme;
};

export function ThemeProvider({ children, initialScheme = 'dark' }: Props) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(initialScheme);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await loadStoredColorScheme();
      if (!cancelled && stored) {
        setColorSchemeState(stored);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    void persistColorScheme(scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      void persistColorScheme(next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(colorScheme), [colorScheme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [theme, colorScheme, setColorScheme, toggleColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
