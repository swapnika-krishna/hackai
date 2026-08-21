import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const CampusBackground: React.FC = () => {
  const { settings } = useTheme();

  if (!settings.isBgEnabled || !settings.bgImageUrl) {
    return null;
  }

  // Determine overlay color class based on theme and tint
  const getOverlayBackground = () => {
    const opacity = settings.overlayOpacity;
    
    if (settings.theme === 'light') {
      return `rgba(244, 244, 245, ${Math.min(0.96, opacity + 0.05)})`;
    }

    switch (settings.overlayTint) {
      case 'emerald':
        return `rgba(6, 26, 20, ${opacity})`;
      case 'cyan':
        return `rgba(8, 28, 36, ${opacity})`;
      case 'slate':
        return `rgba(15, 23, 42, ${opacity})`;
      case 'zinc':
      default:
        return `rgba(9, 9, 11, ${opacity})`;
    }
  };

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none transition-all duration-700 ease-in-out"
    >
      {/* Blurred Campus Image Layer with slight scale to eliminate edge blur bleeding */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url("${settings.bgImageUrl}")`,
          filter: `blur(${settings.blurAmount}px)`,
          transform: 'scale(1.08)',
          transformOrigin: 'center center',
        }}
      />

      {/* Adaptive Tint & Darkness Overlay */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: getOverlayBackground(),
        }}
      />

      {/* Subtle vignette gradient for enhanced contrast */}
      <div 
        className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/20 to-zinc-950/80 pointer-events-none" 
      />
    </div>
  );
};
