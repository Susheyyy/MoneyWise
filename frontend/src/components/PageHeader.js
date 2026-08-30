import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { TYPE, SPACE, FONT } from '../design/tokens';

const PageHeader = ({ title, subtitle, action, badge }) => {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SPACE.lg,
      marginBottom: SPACE.xl,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.sm, marginBottom: subtitle ? SPACE.xs : 0 }}>
          <h1 style={{
            fontFamily: FONT.display,
            fontSize: TYPE.xxl,
            fontWeight: 600,
            color: colors.textDark,
            letterSpacing: '-0.3px',
            lineHeight: 1.1,
            margin: 0,
            textTransform: 'none',
            textAlign: 'left',
          }}>
            {title}
          </h1>
          {badge && (
            <span style={{
              background: colors.successBg,
              color: colors.green,
              fontSize: TYPE.xs,
              fontWeight: 700,
              padding: `${SPACE.xs - 2}px ${SPACE.sm}px`,
              borderRadius: 999,
              fontFamily: FONT.body,
              letterSpacing: '0.3px',
              alignSelf: 'center',
              marginTop: 2,
            }}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{
            fontFamily: FONT.body,
            fontSize: TYPE.sm,
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ flexShrink: 0, alignSelf: 'center' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
