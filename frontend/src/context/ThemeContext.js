import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'Light';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('appFontSize') || 'Default';
  });

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('appFontSize', fontSize);
    document.body.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const getColors = () => {
    if (theme === 'Dark') {
      return {
        // Base surfaces
        background:  '#111F21',
        cardBg:      '#1A2E31',
        surface:     '#1A2E31',
        surfaceAlt:  '#182A2C',
        white:       '#1A2E31',
        bgLight:     '#182A2C',

        // Text
        textDark:    '#FFFFFF',
        textPrimary: '#E8F0F1',
        textMuted:   '#7FA8AB',
        textSubtle:  '#5A8285',

        // Borders
        border:      '#2A4548',
        borderStrong:'#3A5558',

        // Brand / Accent
        accent:      '#22C55E',
        green:       '#22C55E',
        successText: '#22C55E',
        tealPrimary: '#38A3A5',
        tealDark:    '#4EBFC2',

        // Semantic
        danger:      '#EF4444',
        red:         '#EF4444',
        warning:     '#F59E0B',
        amber:       '#F59E0B',

        // Semantic backgrounds
        successBg:   'rgba(34, 197, 94, 0.12)',
        dangerBg:    'rgba(239, 68, 68, 0.12)',
        warningBg:   'rgba(245, 158, 11, 0.12)',

        // Legacy aliases (keep for backward compat)
        redText:     '#EF4444',
        redBg:       'rgba(239, 68, 68, 0.12)',
        greenText:   '#22C55E',
        greenBg:     'rgba(34, 197, 94, 0.12)',
      };
    }

    // Light theme
    return {
      // Base surfaces
      background:  '#FFFFFF',
      cardBg:      '#FFFFFF',
      surface:     '#FFFFFF',
      surfaceAlt:  '#F8FAFA',
      white:       '#FFFFFF',
      bgLight:     '#F4F7F7',

      // Text
      textDark:    '#1E3336',
      textPrimary: '#374C4F',
      textMuted:   '#6B8B8E',
      textSubtle:  '#9BB5B8',

      // Borders
      border:      '#E0E8E8',
      borderStrong:'#C8D8D8',

      // Brand / Accent
      accent:      '#0F6E56',
      green:       '#0F6E56',
      successText: '#0F6E56',
      tealPrimary: '#2B5854',
      tealDark:    '#1E3336',

      // Semantic
      danger:      '#C0392B',
      red:         '#C0392B',
      warning:     '#B45309',
      amber:       '#B45309',

      // Semantic backgrounds
      successBg:   '#E6F7EF',
      dangerBg:    '#FDECEA',
      warningBg:   '#FEF3C7',

      // Legacy aliases (keep for backward compat)
      redText:     '#C0392B',
      redBg:       '#FDECEA',
      greenText:   '#0F6E56',
      greenBg:     '#E6F7EF',
    };
  };

  const getFontSizeMultiplier = () => {
    switch (fontSize) {
      case 'Small':   return 0.9;
      case 'Large':   return 1.1;
      case 'Default':
      default:        return 1.0;
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      fontSize, setFontSize,
      colors: getColors(),
      fontSizeMultiplier: getFontSizeMultiplier(),
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
