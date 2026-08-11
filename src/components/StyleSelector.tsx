import React from 'react';
import { Palette, Check } from 'lucide-react';

export interface StyleOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  badgeBg: string;
  iconSymbol: string;
}

export const GENERATIVE_STYLES: StyleOption[] = [
  {
    id: 'Lego',
    name: 'Lego Toy World',
    badge: '3D Brick',
    description: 'Vibrant plastic block aesthetics & minifig action',
    badgeBg: 'bg-green-500 text-white',
    iconSymbol: '🧱',
  },
  {
    id: 'Minecraft',
    name: 'Voxel Blocky',
    badge: 'Pixel 3D',
    description: 'Textured cube worlds & nostalgic voxel landscapes',
    badgeBg: 'bg-yellow-400 text-slate-900',
    iconSymbol: '⛏️',
  },
  {
    id: 'Disney Pixar',
    name: '3D Animated Film',
    badge: 'Popular',
    description: 'Warm lighting, expressively detailed character animation',
    badgeBg: 'bg-teal-500 text-white',
    iconSymbol: '✨',
  },
  {
    id: 'Anime',
    name: 'Japanese Anime',
    badge: '2D / 3D',
    description: 'Cinematic cel-shading, vivid color palettes & speed lines',
    badgeBg: 'bg-fuchsia-500 text-white',
    iconSymbol: '🌸',
  },
  {
    id: 'Cyberpunk',
    name: 'Neon Cyberpunk',
    badge: 'Futuristic',
    description: 'High-contrast neon lights, metallic reflections & rain',
    badgeBg: 'bg-sky-500 text-white',
    iconSymbol: '🏙️',
  },
  {
    id: 'Hyper-realistic',
    name: 'Photorealistic',
    badge: '8K Render',
    description: 'Ultra detailed lighting, natural skin tones & real optics',
    badgeBg: 'bg-orange-500 text-white',
    iconSymbol: '📸',
  },
  {
    id: 'Chibi',
    name: 'Chibi Cute',
    badge: 'Adorable',
    description: 'Big heads, playful pastel tones & oversized eyes',
    badgeBg: 'bg-pink-500 text-white',
    iconSymbol: '🧸',
  },
  {
    id: 'Hand-drawn',
    name: 'Hand-Drawn Sketch',
    badge: 'Artistic',
    description: 'Pencil shading, watercolor textures & organic linework',
    badgeBg: 'bg-purple-500 text-white',
    iconSymbol: '🎨',
  },
  {
    id: 'Fantasy',
    name: 'Epic Fantasy',
    badge: 'Mythical',
    description: 'Magical glows, ethereal atmospheres & mythical realms',
    badgeBg: 'bg-indigo-500 text-white',
    iconSymbol: '🔮',
  },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Palette className="w-4 h-4 text-blue-600" />
          Generative Visual Style
        </label>
        <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 font-medium">
          Selected: {selectedStyle}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GENERATIVE_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={`relative group text-left p-4 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'glass-panel-active ring-2 ring-blue-600/30'
                  : 'glass-panel-interactive'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  {/* Circular Icon Badge matching reference screenshot */}
                  <div
                    className={`w-9 h-9 rounded-full ${style.badgeBg} flex items-center justify-center text-lg shadow-sm shrink-0`}
                  >
                    {style.iconSymbol}
                  </div>
                  <span className="font-bold text-sm text-slate-900 line-clamp-1">
                    {style.id}
                  </span>
                </div>
                {isSelected ? (
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    {style.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pl-12">
                {style.description}
              </p>

              {/* Blue accent line at bottom of active card */}
              {isSelected && (
                <div className="mt-3 w-12 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
