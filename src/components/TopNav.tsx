import React from 'react';
import { Camera, Image as ImageIcon, MonitorPlay, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { sfx } from '../utils/audio';

interface TopNavProps {
  activeTab: 'booth' | 'gallery' | 'slideshow';
  setActiveTab: (tab: 'booth' | 'gallery' | 'slideshow') => void;
  onOpenSettings: () => void;
  eventTitle: string;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onQuickSnap: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  eventTitle,
  soundEnabled,
  setSoundEnabled,
  onQuickSnap,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playBeep(920, 0.05);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0c10]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-amber-400 shadow-sm shadow-rose-500/20">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap">
            SnapLuxe
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('booth')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'booth'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Booth Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Event Wall</span>
          </button>

          <button
            onClick={() => setActiveTab('slideshow')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'slideshow'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <MonitorPlay className="h-4 w-4" />
            <span>Projector Mode</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors whitespace-nowrap shrink-0"
            title="Configure Event Branding & Frames"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden md:inline">Event Settings</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
          </button>

          <button
            onClick={onQuickSnap}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Camera className="h-4 w-4" />
            <span>Capture Now</span>
          </button>
        </div>
      </div>
    </header>
  );
};
