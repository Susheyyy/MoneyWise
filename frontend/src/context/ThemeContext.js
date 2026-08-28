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
        background: '#111F21',
        cardBg: '#1E3336',
        textPrimary: '#F2F5F5',
        textDark: '#FFFFFF',
        textMuted: '#9BB5B8',
        border: '#2E4C4F',
        white: '#1E3336',
        bgLight: '#182A2C',
        red: '#D9534F',
        green: '#1D9E75',
        amber: '#F0AD4E',
        successText: '#26C28F',
        tealPrimary: '#38A3A5',
        tealDark: '#57CC99'
      };
    }
    return {
      background: '#F4F7F7',
      cardBg: '#FFFFFF',
      textPrimary: '#364C4F',
      textDark: '#1E3336',
      textMuted: '#6B8B8E',
      border: '#E0E8E8',
      white: '#ffffff',
      bgLight: '#F2F5F5',
      red: '#A32D2D',
      green: '#0F6E56',
      amber: '#BA7517',
      successText: '#1D9E75',
      tealPrimary: '#2B5854',
      tealDark: '#1E3336'
    };
  };

  const getFontSizeMultiplier = () => {
    switch (fontSize) {
      case 'Small': return 0.9;
      case 'Large': return 1.1;
      case 'Default':
      default: return 1.0;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, colors: getColors(), fontSizeMultiplier: getFontSizeMultiplier() }}>
      {children}
    </ThemeContext.Provider>
  );
};
