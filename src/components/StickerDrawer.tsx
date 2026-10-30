import React from 'react';
import { EventCategory, StickerItem } from '../types/photobooth';
import { EVENT_PRESETS } from '../data/eventPresets';
import { Sparkles, Trash2, RotateCw } from 'lucide-react';

interface StickerDrawerProps {
  stickers: StickerItem[];
  category?: EventCategory;
  onAddSticker: (item: Omit<StickerItem, 'id'>) => void;
  onRemoveSticker: (id: string) => void;
  onRotateSticker: (id: string) => void;
  onClearAll: () => void;
}

export const StickerDrawer: React.FC<StickerDrawerProps> = ({
  stickers,
  category = 'custom',
  onAddSticker,
  onRemoveSticker,
  onRotateSticker,
  onClearAll,
}) => {
  const presetConfig = EVENT_PRESETS[category] || EVENT_PRESETS.custom;
  const currentEmojis = presetConfig.specificEmojis;
  const currentBadges = presetConfig.specificBadges;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#121217] p-4 text-zinc-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{presetConfig.icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {presetConfig.name} Props & Badges
          </span>
        </div>
        {stickers.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear ({stickers.length})</span>
          </button>
        )}
      </div>

      {/* Quick Emoji Props */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-400">Click to add stickers & props:</span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-zinc-900/60 rounded-lg border border-zinc-800/60">
          {currentEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() =>
                onAddSticker({
                  type: 'emoji',
                  content: emoji,
                  x: 30 + Math.random() * 40,
                  y: 30 + Math.random() * 40,
                  size: 48,
                  rotation: (Math.random() - 0.5) * 30,
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/80 hover:bg-zinc-700 hover:scale-110 active:scale-95 transition-all text-xl"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Event Ribbon Badges */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-400">Event Ribbon Badges:</span>
        <div className="flex flex-wrap gap-1.5">
          {currentBadges.map((badge) => (
            <button
              key={badge}
              onClick={() =>
                onAddSticker({
                  type: 'badge',
                  content: badge,
                  x: 50,
                  y: 40 + Math.random() * 20,
                  size: 32,
                  rotation: (Math.random() - 0.5) * 16,
                })
              }
              className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-all active:scale-95 whitespace-nowrap"
            >
              + {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Active props list with rotation/delete controls */}
      {stickers.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/60">
          {stickers.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 bg-zinc-800/90 border border-zinc-700 rounded-md px-2 py-0.5 text-xs"
            >
              <span className="font-medium text-zinc-200">{s.content}</span>
              <button
                onClick={() => onRotateSticker(s.id)}
                className="text-zinc-400 hover:text-white"
                title="Rotate"
              >
                <RotateCw className="h-3 w-3" />
              </button>
              <button
                onClick={() => onRemoveSticker(s.id)}
                className="text-zinc-400 hover:text-rose-400"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
