import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('skillsetu_theme');
    // Auto dark mode disabled: default to 'light' if not explicitly set to 'dark'
    if (saved === 'dark') {
      return 'dark';
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      // Keep white as default unless user explicitly chose dark
      const isDark = theme === 'dark';

      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    applyTheme();
  }, [theme]);

  const setTheme = (newTheme) => {
    const finalTheme = newTheme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('skillsetu_theme', finalTheme);
    setThemeState(finalTheme);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;

