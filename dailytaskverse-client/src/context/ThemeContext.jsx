import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = [
  { id: 'cosmic-light', name: 'Cosmic', color: '#4f46e5' },
  { id: 'cosmic-dark', name: 'Cosmic Dark', color: '#7c6aff' },
  { id: 'ocean', name: 'Ocean', color: '#0891b2' },
  { id: 'sunset', name: 'Sunset', color: '#ea580c' },
  { id: 'forest', name: 'Forest', color: '#059669' },
  { id: 'midnight', name: 'Midnight', color: '#6366f1' },
];

const STORAGE_KEY = 'dtv-theme';
const DEFAULT_THEME = 'cosmic-light';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;

    root.classList.add('theme-transitioning');

    if (theme === DEFAULT_THEME) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    localStorage.setItem(STORAGE_KEY, theme);

    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 400);

    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
