import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppTheme = 'dark' | 'light' | 'midnight' | 'emerald';

export interface CampusBackgroundPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail: string;
}

export const CAMPUS_BACKGROUND_PRESETS: CampusBackgroundPreset[] = [
  {
    id: 'campus-plaza',
    name: 'Modern University Plaza',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=70',
  },
  {
    id: 'academic-quad',
    name: 'Heritage Academic Quad',
    category: 'Campus Grounds',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=70',
  },
  {
    id: 'campus-library',
    name: 'Grand Campus Library',
    category: 'Academic Wing',
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=300&q=70',
  },
  {
    id: 'tech-promenade',
    name: 'Engineering Walkway',
    category: 'Walkways',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=70',
  },
  {
    id: 'evening-campus',
    name: 'Evening Illuminated Campus',
    category: 'Night Scenery',
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=70',
  },
];

export interface CustomCampusImage {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface ThemeSettings {
  theme: AppTheme;
  isBgEnabled: boolean;
  bgImageUrl: string;
  selectedPresetId?: string;
  blurAmount: number; // in pixels (e.g. 4, 12, 18, 28)
  overlayOpacity: number; // 0.2 to 0.95
  overlayTint: 'slate' | 'emerald' | 'cyan' | 'zinc';
}

const DEFAULT_SETTINGS: ThemeSettings = {
  theme: 'dark',
  isBgEnabled: true,
  bgImageUrl: CAMPUS_BACKGROUND_PRESETS[0].url,
  selectedPresetId: CAMPUS_BACKGROUND_PRESETS[0].id,
  blurAmount: 14,
  overlayOpacity: 0.82,
  overlayTint: 'zinc',
};

const THEME_STORAGE_KEY = 'civicmind_theme_settings_v1';
const CUSTOM_IMAGES_STORAGE_KEY = 'civicmind_custom_campus_images_v1';

interface ThemeContextType {
  settings: ThemeSettings;
  customImages: CustomCampusImage[];
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  setTheme: (theme: AppTheme) => void;
  setBgImage: (url: string, presetId?: string) => void;
  setIsBgEnabled: (enabled: boolean) => void;
  setBlurAmount: (blur: number) => void;
  setOverlayOpacity: (opacity: number) => void;
  setOverlayTint: (tint: 'slate' | 'emerald' | 'cyan' | 'zinc') => void;
  addCustomImage: (name: string, dataUrl: string) => CustomCampusImage;
  removeCustomImage: (id: string) => void;
  resetThemeSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse theme settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [customImages, setCustomImages] = useState<CustomCampusImage[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_IMAGES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse custom images from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save theme settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_IMAGES_STORAGE_KEY, JSON.stringify(customImages));
    } catch (e) {
      console.warn('Failed to save custom images to localStorage', e);
    }
  }, [customImages]);

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-midnight', 'theme-emerald');
    root.classList.add(`theme-${settings.theme}`);
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [settings.theme]);

  const updateSettings = (partial: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const setTheme = (theme: AppTheme) => {
    updateSettings({ theme });
  };

  const setBgImage = (url: string, presetId?: string) => {
    updateSettings({
      bgImageUrl: url,
      selectedPresetId: presetId,
      isBgEnabled: true,
    });
  };

  const setIsBgEnabled = (isBgEnabled: boolean) => {
    updateSettings({ isBgEnabled });
  };

  const setBlurAmount = (blurAmount: number) => {
    updateSettings({ blurAmount });
  };

  const setOverlayOpacity = (overlayOpacity: number) => {
    updateSettings({ overlayOpacity });
  };

  const setOverlayTint = (overlayTint: 'slate' | 'emerald' | 'cyan' | 'zinc') => {
    updateSettings({ overlayTint });
  };

  const addCustomImage = (name: string, dataUrl: string): CustomCampusImage => {
    const newImage: CustomCampusImage = {
      id: `custom-campus-${Date.now()}`,
      name: name || `Campus Picture ${customImages.length + 1}`,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [newImage, ...customImages];
    setCustomImages(updated);
    // Auto-select the newly added image as background
    setBgImage(dataUrl, newImage.id);
    return newImage;
  };

  const removeCustomImage = (id: string) => {
    setCustomImages((prev) => prev.filter((img) => img.id !== id));
    if (settings.selectedPresetId === id) {
      setBgImage(CAMPUS_BACKGROUND_PRESETS[0].url, CAMPUS_BACKGROUND_PRESETS[0].id);
    }
  };

  const resetThemeSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        customImages,
        updateSettings,
        setTheme,
        setBgImage,
        setIsBgEnabled,
        setBlurAmount,
        setOverlayOpacity,
        setOverlayTint,
        addCustomImage,
        removeCustomImage,
        resetThemeSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
