import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Palette from the MoneyWise design spec (section 2 = light, section 3 = dark).
const PALETTE = {
  Light: {
    mainBackground:      '#FFFFFF',
    secondaryBackground: '#F2F5F5',
    cardBackground:      '#FFFFFF',
    primaryText:         '#1D292B',
    secondaryText:       '#647477',
    primaryAccent:       '#628B91',
    secondaryAccent:     '#85BAC2',
    borders:             '#DCE4E5',
    sidebar:             '#1D292B',
    success:             '#2A7352',
    danger:              '#C0392B',
    warning:             '#B45309',
  },
  Dark: {
    mainBackground:      '#1D292B',
    secondaryBackground: '#243638',
    cardBackground:      '#2C4144',
    primaryText:         '#F2F5F5',
    secondaryText:       '#A7A7A9',
    primaryAccent:       '#85BAC2',
    secondaryAccent:     '#628B91',
    borders:             '#405558',
    sidebar:             '#243638',
    success:             '#7BC6A4',
    danger:              '#FF8A80',
    warning:             '#F0B453',
  },
};

const buildColors = (p, isDark) => ({
  background:   p.mainBackground,
  cardBg:       p.cardBackground,
  surface:      p.cardBackground,
  surfaceAlt:   p.secondaryBackground,
  white:        p.cardBackground,
  bgLight:      p.secondaryBackground,

  textDark:     p.primaryText,
  textPrimary:  p.primaryText,
  textMuted:    p.secondaryText,
  textSubtle:   p.secondaryText,

  border:       p.borders,
  borderStrong: p.borders,

  sidebar:      p.sidebar,

  accent:       p.primaryAccent,
  green:        p.primaryAccent,
  tealPrimary:  p.primaryAccent,
  tealDark:     p.secondaryAccent,
  successText:  p.success,

  danger:       p.danger,
  red:          p.danger,
  warning:      p.warning,
  amber:        p.warning,

  successBg:    isDark ? 'rgba(123, 198, 164, 0.14)' : '#E6F4EE',
  dangerBg:     isDark ? 'rgba(229, 115, 107, 0.14)' : '#FDECEA',
  warningBg:    isDark ? 'rgba(240, 180, 83, 0.14)' : '#FEF3C7',

  redText:      p.danger,
  redBg:        isDark ? 'rgba(229, 115, 107, 0.14)' : '#FDECEA',
  greenText:    p.success,
  greenBg:      isDark ? 'rgba(123, 198, 164, 0.14)' : '#E6F4EE',
});

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

  const isDark = theme === 'Dark';
  const getColors = () => buildColors(PALETTE[isDark ? 'Dark' : 'Light'], isDark);

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