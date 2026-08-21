import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Check, 
  Sliders, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Layers,
  Link2,
  Plus
} from 'lucide-react';
import { 
  useTheme, 
  CAMPUS_BACKGROUND_PRESETS, 
  AppTheme 
} from '../context/ThemeContext';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    customImages, 
    setTheme, 
    setBgImage, 
    setIsBgEnabled, 
    setBlurAmount, 
    setOverlayOpacity, 
    setOverlayTint,
    addCustomImage, 
    removeCustomImage, 
    resetThemeSettings 
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'background' | 'theme' | 'adjustments'>('background');
  const [urlInput, setUrlInput] = useState('');
  const [urlName, setUrlName] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size is too large (max 8MB).');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        addCustomImage(file.name.replace(/\.[^/.]+$/, ''), dataUrl);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput);
      addCustomImage(urlName.trim() || 'Campus Web Photo', urlInput.trim());
      setUrlInput('');
      setUrlName('');
      setUrlError('');
    } catch {
      setUrlError('Please enter a valid image URL (e.g. https://example.com/photo.jpg)');
    }
  };

  const themeOptions: { id: AppTheme; label: string; icon: any; desc: string; previewClass: string }[] = [
    {
      id: 'dark',
      label: 'Deep Obsidian',
      icon: Moon,
      desc: 'Default sleek dark campus theme with emerald accents',
      previewClass: 'bg-zinc-950 border-emerald-500/40 text-emerald-400',
    },
    {
      id: 'midnight',
      label: 'Midnight Slate',
      icon: Layers,
      desc: 'Cool slate navy backdrop with sapphire & cyan glow',
      previewClass: 'bg-slate-950 border-cyan-500/40 text-cyan-400',
    },
    {
      id: 'emerald',
      label: 'Campus Forest',
      icon: Sparkles,
      desc: 'Organic deep botanical dark with lush green highlights',
      previewClass: 'bg-[#061a14] border-emerald-400 text-emerald-300',
    },
    {
      id: 'light',
      label: 'Academic Daylight',
      icon: Sun,
      desc: 'High-clarity light theme for daylight & lecture halls',
      previewClass: 'bg-zinc-100 border-zinc-300 text-zinc-900',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="theme-manager-modal"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Campus Theme & Background Customizer
              </h2>
              <p className="text-xs text-zinc-400">
                Choose campus photos, customize blur intensity, and switch color styles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetThemeSettings}
              title="Reset to defaults"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              id="theme-manager-close-btn"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-zinc-800 bg-zinc-900/50 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'background'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Campus Pictures ({CAMPUS_BACKGROUND_PRESETS.length + customImages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adjustments')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'adjustments'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Blur & Opacity ({settings.blurAmount}px)</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Color Palette</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-200">
          
          {/* TAB 1: CAMPUS BACKGROUND PICTURES */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              
              {/* Background Enable Toggle & Active Preview */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                    {settings.isBgEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Campus Background Layer</h4>
                    <p className="text-xs text-zinc-400">
                      {settings.isBgEnabled ? 'Render softly blurred backdrop behind platform cards' : 'Background disabled (solid theme)'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isBgEnabled}
                    onChange={(e) => setIsBgEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Upload Your Own Campus Pictures (Dropzone) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload Your Campus Pictures
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Drop your photos to set as blurred backdrop
                  </span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-zinc-700 hover:border-emerald-500/60 bg-zinc-950/40 hover:bg-zinc-950/70'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {isUploading ? 'Processing campus photo...' : 'Click to browse or drag & drop campus photo'}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Supports JPG, PNG, WebP (Automatically saved to your browser)
                      </p>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 mt-1">{uploadError}</p>
                )}

                {/* Optional URL input for online images */}
                <form onSubmit={handleUrlSubmit} className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={urlName}
                    onChange={(e) => setUrlName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-28 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!urlInput.trim()}
                    className="px-3 py-2 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                  >
                    Add URL
                  </button>
                </form>
                {urlError && <p className="text-xs text-rose-400">{urlError}</p>}
              </div>

              {/* User's Custom Uploaded Photos (if any) */}
              {customImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Your Uploaded Photos ({customImages.length})</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {customImages.map((img) => {
                      const isSelected = settings.bgImageUrl === img.dataUrl;
                      return (
                        <div
                          key={img.id}
                          onClick={() => setBgImage(img.dataUrl, img.id)}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video bg-zinc-950 ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent flex flex-col justify-end p-2">
                            <span className="text-[11px] font-semibold text-white truncate">
                              {img.name}
                            </span>
                          </div>

                          {/* Selected Checkmark badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 rounded-full p-1 shadow-lg">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomImage(img.id);
                            }}
                            className="absolute top-2 left-2 p-1.5 bg-zinc-950/80 hover:bg-rose-500 text-zinc-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Curated Campus Presets */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Curated Campus Scenery Presets
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAMPUS_BACKGROUND_PRESETS.map((preset) => {
                    const isSelected = settings.bgImageUrl === preset.url;
                    return (
                      <div
                        key={preset.id}
                        id={`campus-preset-${preset.id}`}
                        onClick={() => setBgImage(preset.url, preset.id)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video bg-zinc-950 ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={preset.thumbnail}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[11px] font-semibold text-white truncate">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-medium">
                            {preset.category}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 rounded-full p-1 shadow-lg">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BLUR & OPACITY ADJUSTMENTS */}
          {activeTab === 'adjustments' && (
            <div className="space-y-6">
              
              {/* Blur Intensity Slider */}
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-white block">
                      Campus Background Blur Amount
                    </label>
                    <p className="text-xs text-zinc-400">
                      Controls how soft and diffused the background campus photo appears
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                    {settings.blurAmount} px
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="2"
                  value={settings.blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                />

                {/* Quick Blur Presets */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Subtle', val: 6 },
                    { label: 'Standard', val: 14 },
                    { label: 'Deep', val: 22 },
                    { label: 'Ultra Soft', val: 32 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setBlurAmount(preset.val)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                        settings.blurAmount === preset.val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {preset.label} ({preset.val}px)
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark Overlay Opacity Slider (Readability Guardian) */}
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-white block">
                      Readability Tint & Darkness
                    </label>
                    <p className="text-xs text-zinc-400">
                      Higher opacity ensures complaint texts and cards remain high-contrast and legible
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 font-mono text-xs font-bold border border-zinc-700">
                    {Math.round(settings.overlayOpacity * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.30"
                  max="0.95"
                  step="0.05"
                  value={settings.overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                />

                {/* Overlay Tint Selector */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-zinc-300 block mb-2">
                    Atmospheric Tint
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'zinc', label: 'Dark Obsidian', color: 'bg-zinc-950 border-zinc-700' },
                      { id: 'slate', label: 'Slate Navy', color: 'bg-slate-900 border-slate-700' },
                      { id: 'emerald', label: 'Campus Green', color: 'bg-emerald-950 border-emerald-800' },
                      { id: 'cyan', label: 'Cyber Teal', color: 'bg-cyan-950 border-cyan-800' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setOverlayTint(t.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          settings.overlayTint === t.id
                            ? 'border-emerald-400 ring-2 ring-emerald-400/20 text-white'
                            : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        } ${t.color}`}
                      >
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: THEME COLOR PALETTE */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Select your preferred interface color atmosphere across navigation, buttons, and status indicators:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = settings.theme === opt.id;
                  return (
                    <div
                      key={opt.id}
                      id={`theme-option-${opt.id}`}
                      onClick={() => setTheme(opt.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${opt.previewClass} ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{opt.label}</span>
                            <span className="text-[10px] text-zinc-400">{opt.desc}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="p-1 rounded-full bg-emerald-500 text-zinc-950">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <span className="text-xs text-zinc-400">
            {settings.isBgEnabled ? `Active: Blurred Campus Image (${settings.blurAmount}px blur)` : 'Solid Background'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs transition-colors shadow-md shadow-emerald-500/20"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
