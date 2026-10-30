import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  X,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { EventDetails, EventGalleryItem } from '../types/photobooth';

interface SlideshowKioskProps {
  items: EventGalleryItem[];
  eventDetails: EventDetails;
  onExit: () => void;
}

export const SlideshowKiosk: React.FC<SlideshowKioskProps> = ({
  items,
  eventDetails,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      margin: 1,
      width: 180,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#09090c] p-12 text-center text-zinc-100">
        <Sparkles className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-display text-xl font-bold">No Photos in Slideshow</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Capture photos in the booth studio first to start the venue projector stream.
        </p>
        <button
          onClick={onExit}
          className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex % items.length];

  return (
    <div className="relative flex min-h-[82vh] w-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-[#070709] p-6 text-zinc-100 shadow-2xl">
      {/* Top Bar for Projector */}
      <div className="z-10 flex w-full items-center justify-between rounded-xl bg-black/60 px-6 py-3 backdrop-blur-md border border-zinc-800/80">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
            Live Venue Display
          </span>
          <h2 className="font-display text-lg font-bold text-white">
            {eventDetails.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 tabular-nums font-mono">
            Photo {currentIndex + 1} of {items.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700"
          >
            <X className="h-3.5 w-3.5" />
            <span>Close Kiosk</span>
          </button>
        </div>
      </div>

      {/* Main Display: Current Photo with Smooth Crossfade */}
      <div className="relative my-auto flex h-full max-h-[68vh] w-full items-center justify-center py-4">
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-zinc-950 p-2 shadow-2xl transition-all duration-500">
          <img
            key={currentItem.id}
            src={currentItem.compositeUrl}
            alt={currentItem.caption}
            className="max-h-[60vh] w-auto object-contain rounded-lg animate-in fade-in duration-700"
          />

          {/* Caption banner on bottom of photo */}
          <div className="absolute inset-x-2 bottom-2 rounded-b-lg bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-center">
            <p className="font-display text-sm font-semibold text-white">
              {currentItem.author}
            </p>
            <p className="text-xs text-zinc-300 italic mt-0.5">
              &ldquo;{currentItem.caption}&rdquo;
            </p>
          </div>
        </div>

        {/* Live Guest QR Code in Corner */}
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-black/85 p-3 backdrop-blur-md shadow-2xl">
          <div className="overflow-hidden rounded-md bg-white p-1">
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="Scan QR" className="h-16 w-16 object-contain" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Scan to Join Booth
            </span>
            <span className="text-xs font-semibold text-white">
              {eventDetails.hashtag}
            </span>
            <span className="text-[10px] text-zinc-400">
              Instant mobile downloads
            </span>
          </div>
        </div>
      </div>

      {/* Slideshow Controls Bar */}
      <div className="z-10 flex items-center gap-3 rounded-full bg-zinc-900/90 px-6 py-2.5 backdrop-blur-md border border-zinc-800">
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
          }
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          title="Previous Photo"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all active:scale-95"
          title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          title="Next Photo"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
