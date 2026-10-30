import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Share2,
  Sparkles,
  Layers,
  Palette,
  X,
  Smartphone,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { EventDetails, FilterPreset, FrameTheme, LayoutMode, StickerItem } from '../types/photobooth';
import { renderPhotoboothComposite } from '../utils/canvasRenderer';
import { StickerDrawer } from './StickerDrawer';
import { PrintModal } from './PrintModal';

interface ReviewModalProps {
  capturedPhotos: string[];
  initialLayout: LayoutMode;
  preset: FilterPreset;
  customAdjust: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    grain: number;
    vignette: number;
  };
  eventDetails: EventDetails;
  onRetake: () => void;
  onProceedToShare: (compositeUrl: string, storyUrl: string | null) => void;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  capturedPhotos,
  initialLayout,
  preset,
  customAdjust,
  eventDetails,
  onRetake,
  onProceedToShare,
  onClose,
}) => {
  const [layout, setLayout] = useState<LayoutMode>(initialLayout);
  const [theme, setTheme] = useState<FrameTheme>(eventDetails.frameTheme);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [compositeUrl, setCompositeUrl] = useState<string>('');
  const [storyUrl, setStoryUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Render composite whenever layout, theme, or stickers change
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const updatedEventDetails = { ...eventDetails, frameTheme: theme };

    // Generate standard composite
    renderPhotoboothComposite({
      photos: capturedPhotos,
      layout,
      preset,
      customAdjust,
      eventDetails: updatedEventDetails,
      stickers,
      outputType: 'standard',
    })
      .then((url) => {
        if (!isCancelled) {
          setCompositeUrl(url);
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error('Error rendering composite:', err);
        if (!isCancelled) setIsRendering(false);
      });

    // Also pre-generate 9:16 Instagram Story format
    renderPhotoboothComposite({
      photos: capturedPhotos,
      layout,
      preset,
      customAdjust,
      eventDetails: updatedEventDetails,
      stickers,
      outputType: 'story_9_16',
    })
      .then((url) => {
        if (!isCancelled) {
          setStoryUrl(url);
        }
      })
      .catch((err) => console.warn('Story format notice', err));

    return () => {
      isCancelled = true;
    };
  }, [capturedPhotos, layout, theme, preset, customAdjust, eventDetails, stickers]);

  const handleAddSticker = (item: Omit<StickerItem, 'id'>) => {
    const newSticker: StickerItem = {
      ...item,
      id: `sticker-${Date.now()}-${Math.random()}`,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRotateSticker = (id: string) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + 25) % 360 } : s))
    );
  };

  const handleClearAllStickers = () => {
    setStickers([]);
  };

  const handleDone = () => {
    if (compositeUrl) {
      onProceedToShare(compositeUrl, storyUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#0e0e13] text-zinc-100 shadow-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-lg font-bold text-white">
              Kustomisasi Photostrip & Cetak
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Composite Display Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 min-h-[460px]">
            {isRendering ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                <span className="text-xs">Menerapkan tema frame & grade foto...</span>
              </div>
            ) : compositeUrl ? (
              <div className="relative max-h-[520px] overflow-hidden rounded-lg shadow-2xl">
                <img
                  src={compositeUrl}
                  alt="Review Strip"
                  className="max-h-[500px] w-auto object-contain mx-auto"
                />
              </div>
            ) : null}
          </div>

          {/* Right Editing Controls */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            <div className="flex flex-col gap-4">
              {/* Frame Theme Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-rose-400" />
                    <span>Tema Desain Frame Acara</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    5 Tema Korporat Baru ✨
                  </span>
                </div>

                {/* 5 Corporate Company Event Themes */}
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                  <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">
                    🏢 5 Tema Khusus Acara Korporat Perusahaan:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'corporate-navy', label: '1. Executive Navy', color: 'bg-blue-950 border-blue-600' },
                        { id: 'corporate-gold-gala', label: '2. Gold Awards Gala', color: 'bg-amber-950 border-amber-500' },
                        { id: 'corporate-tech-summit', label: '3. Tech Summit Cyber', color: 'bg-cyan-950 border-cyan-500' },
                        { id: 'corporate-modern-travertine', label: '4. Swiss Travertine', color: 'bg-zinc-200 text-zinc-900 border-zinc-400' },
                        { id: 'corporate-emerald-esg', label: '5. Emerald ESG Gala', color: 'bg-emerald-950 border-emerald-500' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTheme(f.id)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-md border text-center transition-all truncate ${
                          theme === f.id
                            ? 'border-rose-500 bg-rose-500/20 text-white font-semibold ring-1 ring-rose-500'
                            : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                        }`}
                        title={f.label}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Event Themes */}
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[10px] text-zinc-400">Tema Acara Lainnya:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {(
                      [
                        { id: 'bazar-carnival', label: '🎪 Bazar' },
                        { id: 'birthday-confetti', label: '🎂 Ultah' },
                        { id: 'champagne-gold', label: '💍 Luxury' },
                        { id: 'neon-glow', label: 'Neon' },
                        { id: 'polaroid', label: 'Polaroid' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTheme(f.id)}
                        className={`px-1.5 py-1 text-[11px] font-medium rounded border text-center transition-all truncate ${
                          theme === f.id
                            ? 'border-rose-500 bg-rose-500/10 text-white font-semibold'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Switcher */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  <Layers className="h-4 w-4 text-rose-400" />
                  <span>Format Photostrip</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {(
                    [
                      { id: 'strip_3', label: '3-Strip' },
                      { id: 'strip_4', label: '4-Strip' },
                      { id: 'grid_4', label: '2x2 Grid' },
                      { id: 'single', label: 'Single' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setLayout(m.id)}
                      className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                        layout === m.id
                          ? 'bg-rose-600 text-white shadow-sm font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Props & Stickers Drawer with Event Category */}
              <StickerDrawer
                stickers={stickers}
                category={eventDetails.category}
                onAddSticker={handleAddSticker}
                onRemoveSticker={handleRemoveSticker}
                onRotateSticker={handleRotateSticker}
                onClearAll={handleClearAllStickers}
              />
            </div>

            {/* Bottom Actions with Direct Print Button */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-800/80">
              <button
                onClick={onRetake}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Ambil Ulang Foto"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retake</span>
              </button>

              {/* Direct Print to Printer Button */}
              <button
                onClick={() => setShowPrintModal(true)}
                disabled={isRendering || !compositeUrl}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-700 hover:text-white disabled:opacity-50 transition-colors shadow-sm"
                title="Cetak langsung ke printer foto fisik (2x6 dual atau 4x6)"
              >
                <Printer className="h-4 w-4 text-rose-400" />
                <span>Print Langsung</span>
              </button>

              <button
                onClick={handleDone}
                disabled={isRendering || !compositeUrl}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share & Simpan</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Print Studio Modal */}
      {showPrintModal && compositeUrl && (
        <PrintModal
          compositeUrl={compositeUrl}
          eventTitle={eventDetails.title}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
