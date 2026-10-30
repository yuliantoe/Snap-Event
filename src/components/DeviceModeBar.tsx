import React from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, Check, Maximize2, Minimize2 } from 'lucide-react';
import { DeviceDisplayMode } from '../types/photobooth';

interface DeviceModeBarProps {
  deviceMode: DeviceDisplayMode;
  setDeviceMode: (mode: DeviceDisplayMode) => void;
  onRotateTablet: () => void;
  isFullCamera?: boolean;
  onToggleFullCamera?: () => void;
}

export const DeviceModeBar: React.FC<DeviceModeBarProps> = ({
  deviceMode,
  setDeviceMode,
  onRotateTablet,
  isFullCamera = false,
  onToggleFullCamera,
}) => {
  return (
    <div className="w-full bg-[#09090c] border-b border-zinc-800/80 px-4 py-1.5 text-xs text-zinc-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Title & Info */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Tampilan Layar (Display Mode):
          </span>
          <span className="text-zinc-200 font-medium">
            {deviceMode === 'desktop'
              ? '🖥️ Mode Komputer Desktop (1440 × 900)'
              : deviceMode === 'tablet_landscape'
              ? '📟 Mode Tablet Landscape (iPad 1024 × 768)'
              : deviceMode === 'tablet_portrait'
              ? '📱 Mode Tablet Vertikal (iPad 768 × 1024)'
              : '✨ Responsif Otomatis (Full Window)'}
          </span>
        </div>

        {/* Right: Device Mode Buttons & Rotate */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
            {/* Desktop */}
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Sesuaikan ukuran untuk layar Komputer Desktop / Laptop"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Komputer</span>
            </button>

            {/* Tablet Landscape */}
            <button
              onClick={() => setDeviceMode('tablet_landscape')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'tablet_landscape'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Sesuaikan ukuran untuk Tablet Landscape (iPad Stand 1024x768)"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Tablet Horizontal</span>
            </button>

            {/* Tablet Portrait */}
            <button
              onClick={() => setDeviceMode('tablet_portrait')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'tablet_portrait'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Sesuaikan ukuran untuk Tablet Vertikal / Standing Kiosk (768x1024)"
            >
              <Tablet className="h-3.5 w-3.5 rotate-90" />
              <span>Tablet Vertikal</span>
            </button>

            {/* Auto Responsive */}
            <button
              onClick={() => setDeviceMode('auto')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'auto'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Ikuti ukuran layar perangkat fisik secara otomatis"
            >
              <span>Auto</span>
            </button>
          </div>

          {/* Quick Rotate Tablet Button (Toggles between Landscape & Portrait) */}
          {(deviceMode === 'tablet_landscape' || deviceMode === 'tablet_portrait') && (
            <button
              onClick={onRotateTablet}
              className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              title="Putar Orientasi Tablet (Landscape / Portrait)"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Putar Tablet</span>
            </button>
          )}

          {/* Foto Utama Full Kamera Mode Button */}
          {onToggleFullCamera && (
            <button
              onClick={onToggleFullCamera}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${
                isFullCamera
                  ? 'border-rose-500 bg-rose-600 text-white shadow-sm shadow-rose-600/40'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white'
              }`}
              title="Aktifkan tampilan foto utama full kamera untuk booth"
            >
              {isFullCamera ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-white" />
                  <span>Tutup Full Kamera</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>📷 Foto Utama Full Kamera</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
