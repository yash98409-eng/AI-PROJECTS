import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  RefreshCw,
  X,
  Palette,
  User,
  ShieldCheck,
} from 'lucide-react';
import { PRESET_AVATARS, MONOGRAM_PALETTES, PresetAvatar } from '../../data/presetAvatars';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  fullName: string;
  username?: string;
  onSelectAvatar: (url: string, type: 'preset' | 'upload' | 'initials') => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatarUrl,
  fullName,
  username,
  onSelectAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'monogram'>('preset');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'educator' | 'mascot' | 'illustrated' | 'badge'>('all');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('indigo');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(fullName);

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }
    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size exceeds 3MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onSelectAvatar(dataUrl, 'upload');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRandomize = () => {
    const randomIdx = Math.floor(Math.random() * PRESET_AVATARS.length);
    const chosen = PRESET_AVATARS[randomIdx];
    onSelectAvatar(chosen.url, 'preset');
  };

  const handleMonogramSelect = (paletteId: string) => {
    setSelectedPaletteId(paletteId);
    const palette = MONOGRAM_PALETTES.find((p) => p.id === paletteId) || MONOGRAM_PALETTES[0];
    // Generate an SVG data URI for pure reliability
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${paletteId === 'indigo' ? '#4f46e5' : paletteId === 'emerald' ? '#059669' : paletteId === 'amber' ? '#d97706' : paletteId === 'rose' ? '#e11d48' : paletteId === 'cyan' ? '#0891b2' : paletteId === 'purple' ? '#9333ea' : '#334155'}" />
          <stop offset="100%" stop-color="${paletteId === 'indigo' ? '#6d28d9' : paletteId === 'emerald' ? '#0f766e' : paletteId === 'amber' ? '#ea580c' : paletteId === 'rose' ? '#be185d' : paletteId === 'cyan' ? '#1d4ed8' : paletteId === 'purple' ? '#4338ca' : '#0f172a'}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#grad)" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="46" fill="#ffffff">${initials}</text>
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    onSelectAvatar(dataUri, 'initials');
  };

  const filteredPresets = selectedCategory === 'all'
    ? PRESET_AVATARS
    : PRESET_AVATARS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'preset'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curated Library</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'upload'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monogram')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'monogram'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>Monogram Initials</span>
          </button>
        </div>

        {activeTab === 'preset' && (
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors border border-slate-200/80"
            title="Pick a random avatar"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        )}
      </div>

      {/* Tab 1: Preset Library */}
      {activeTab === 'preset' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Avatars' },
              { id: 'educator', label: 'Faculty & Leaders' },
              { id: 'mascot', label: 'School Mascots' },
              { id: 'illustrated', label: 'Illustrated Bots' },
              { id: 'badge', label: 'Academy Emblems' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Avatars */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5 max-h-56 overflow-y-auto p-1.5 rounded-xl border border-slate-100 bg-slate-50/60">
            {filteredPresets.map((avatar) => {
              const isSelected = currentAvatarUrl === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelectAvatar(avatar.url, 'preset')}
                  className={`group relative flex flex-col items-center p-1.5 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs scale-105'
                      : 'bg-white hover:bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                  title={`${avatar.name} - ${avatar.description || ''}`}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden relative bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 backdrop-blur-[1px] flex items-center justify-center text-white">
                        <Check className="w-4 h-4 drop-shadow-md stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center mt-1">
                    {avatar.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload Custom Image */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Click to upload or drag & drop your avatar
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, WebP, SVG • Maximum file size 3 MB
            </p>
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Monogram Initials */}
      {activeTab === 'monogram' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Generate a clean, high-contrast monogram badge using your initials (<span className="font-bold text-slate-700">{initials}</span>):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MONOGRAM_PALETTES.map((palette) => {
              const isSelected = selectedPaletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => handleMonogramSelect(palette.id)}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${palette.gradient} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{palette.name}</p>
                    <p className="text-[10px] text-slate-400">Apply monogram</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
