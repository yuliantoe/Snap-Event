import React from 'react';
import { FilterId, FilterPreset } from '../types/photobooth';
import { FILTER_PRESETS } from '../utils/filters';
import { RotateCcw, Sparkles, Sliders } from 'lucide-react';

interface FilterControlsProps {
  selectedFilter: FilterId;
  onSelectFilter: (id: FilterId) => void;
  customAdjust: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    grain: number;
    vignette: number;
  };
  setCustomAdjust: React.Dispatch<
    React.SetStateAction<{
      brightness: number;
      contrast: number;
      saturation: number;
      warmth: number;
      grain: number;
      vignette: number;
    }>
  >;
  onResetAdjust: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedFilter,
  onSelectFilter,
  customAdjust,
  setCustomAdjust,
  onResetAdjust,
}) => {
  const [activeTab, setActiveTab] = React.useState<'presets' | 'adjust'>('presets');

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#121217] p-4 text-zinc-100 shadow-xl">
      {/* Sub-header with Presets / Adjust tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Filter Presets ({FILTER_PRESETS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'adjust'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Tone Adjustments</span>
          </button>
        </div>

        {activeTab === 'adjust' && (
          <button
            onClick={onResetAdjust}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Reset tone adjustments"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Preset Cards Carousel / Grid */}
      {activeTab === 'presets' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-2">
          {FILTER_PRESETS.map((preset) => {
            const isSelected = selectedFilter === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectFilter(preset.id)}
                className={`group flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-500/10 shadow-sm shadow-rose-500/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Visual tone badge swatch */}
                <div
                  className={`h-9 w-9 rounded-md transition-transform group-hover:scale-105 border ${
                    isSelected ? 'border-rose-400' : 'border-zinc-700/50'
                  }`}
                  style={{
                    background:
                      preset.id === 'glam'
                        ? 'linear-gradient(135deg, #fbcfe8, #fed7aa)'
                        : preset.id === 'golden'
                        ? 'linear-gradient(135deg, #fef08a, #f97316)'
                        : preset.id === 'noir'
                        ? 'linear-gradient(135deg, #18181b, #71717a)'
                        : preset.id === 'retro'
                        ? 'linear-gradient(135deg, #fcd34d, #b45309)'
                        : preset.id === 'cyber'
                        ? 'linear-gradient(135deg, #06b6d4, #ec4899)'
                        : preset.id === 'pastel'
                        ? 'linear-gradient(135deg, #e0e7ff, #fce7f3)'
                        : preset.id === 'vintage'
                        ? 'linear-gradient(135deg, #d6d3d1, #78350f)'
                        : preset.id === 'duotone'
                        ? 'linear-gradient(135deg, #8b5cf6, #f59e0b)'
                        : 'linear-gradient(135deg, #e4e4e7, #71717a)',
                  }}
                />
                <span
                  className={`text-[11px] font-medium truncate max-w-full ${
                    isSelected ? 'text-rose-400 font-semibold' : 'text-zinc-300'
                  }`}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Fine Tuning Sliders */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 py-1">
          {/* Brightness */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Exposure / Brightness</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.brightness.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.02"
              value={customAdjust.brightness}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, brightness: parseFloat(e.target.value) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Contrast</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.contrast.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.02"
              value={customAdjust.contrast}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, contrast: parseFloat(e.target.value) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Saturation</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.saturation.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={customAdjust.saturation}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, saturation: parseFloat(e.target.value) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
            />
          </div>

          {/* Warmth (Hue Shift) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Color Temperature</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.warmth > 0 ? `+${customAdjust.warmth}°` : `${customAdjust.warmth}°`}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={customAdjust.warmth}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, warmth: parseInt(e.target.value, 10) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500"
            />
          </div>

          {/* Vignette */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Vignette Falloff</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.vignette}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={customAdjust.vignette}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, vignette: parseInt(e.target.value, 10) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
            />
          </div>

          {/* Film Grain */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Analog Film Grain</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {customAdjust.grain}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={customAdjust.grain}
              onChange={(e) =>
                setCustomAdjust((prev) => ({ ...prev, grain: parseInt(e.target.value, 10) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
