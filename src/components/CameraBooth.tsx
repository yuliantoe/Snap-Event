import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  FlipHorizontal,
  Timer,
  Sparkles,
  Upload,
  RefreshCw,
  Layers,
  VideoOff,
  Split,
  Maximize2,
  Minimize2,
  Tv2,
  SlidersHorizontal,
  Check,
  Expand,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DeviceDisplayMode,
  EventCategory,
  EventDetails,
  FilterId,
  FrameTheme,
  LayoutMode,
  VideoDeviceOption,
} from '../types/photobooth';
import { computeLiveCssFilter, getFilterById, FILTER_PRESETS } from '../utils/filters';
import { sfx } from '../utils/audio';
import { EVENT_PRESETS, CORPORATE_THEMES_INFO } from '../data/eventPresets';

interface CameraBoothProps {
  onPhotosCaptured: (photos: string[], layout: LayoutMode) => void;
  selectedFilter: FilterId;
  customAdjust: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    grain: number;
    vignette: number;
  };
  eventDetails: EventDetails;
  onSelectEventPreset: (category: EventCategory) => void;
  onOpenSettings: () => void;
  onSelectFrameTheme: (theme: FrameTheme) => void;
  deviceMode?: DeviceDisplayMode;
  isFullCamera?: boolean;
  onToggleFullCamera?: () => void;
  onSelectFilter?: (filter: FilterId) => void;
}

export const CameraBooth: React.FC<CameraBoothProps> = ({
  onPhotosCaptured,
  selectedFilter,
  customAdjust,
  eventDetails,
  onSelectEventPreset,
  onOpenSettings,
  onSelectFrameTheme,
  deviceMode = 'desktop',
  isFullCamera,
  onToggleFullCamera,
  onSelectFilter,
}) => {
  // Primary Video Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Secondary Video Refs (Kamera Tambahan)
  const secondaryVideoRef = useRef<HTMLVideoElement | null>(null);
  const secondaryStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera State
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('strip_3');
  const [countdownSetting, setCountdownSetting] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [flashActive, setFlashActive] = useState(false);

  // Multi-Camera / Kamera Tambahan State
  const [availableDevices, setAvailableDevices] = useState<VideoDeviceOption[]>([]);
  const [primaryDeviceId, setPrimaryDeviceId] = useState<string>('');
  const [secondaryDeviceId, setSecondaryDeviceId] = useState<string>('virtual-dslr');
  const [isSecondaryActive, setIsSecondaryActive] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'pip' | 'split'>('pip');
  const [multiAngleCaptureMode, setMultiAngleCaptureMode] = useState<'alternate' | 'primary_only'>('alternate');

  // Full Camera Mode State
  const [internalFullCamera, setInternalFullCamera] = useState<boolean>(false);
  const [isSideFilterCollapsed, setIsSideFilterCollapsed] = useState<boolean>(false);
  const activeFullCamera = isFullCamera !== undefined ? isFullCamera : internalFullCamera;
  const handleToggleFullCamera = () => {
    if (onToggleFullCamera) {
      onToggleFullCamera();
    } else {
      setInternalFullCamera((prev) => !prev);
    }
    sfx.playBeep(920, 0.05);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeFullCamera) {
        handleToggleFullCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFullCamera]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Multi-shot sequence state
  const [sequenceProgress, setSequenceProgress] = useState<{
    currentShot: number;
    totalShots: number;
    captured: string[];
    cameraAngle: 'Kamera 1 (Primary)' | 'Kamera 2 (Tambahan)';
  } | null>(null);

  // Dynamic Fallback image based on event category
  const getDemoImageForCategory = (cat: EventCategory): string => {
    switch (cat) {
      case 'bazar':
        return '/src/assets/images/booth_bazaar_market_1793279423707.jpg';
      case 'birthday':
        return '/src/assets/images/booth_birthday_party_1793279424143.jpg';
      case 'office':
        return '/src/assets/images/booth_office_gathering_1793279425370.jpg';
      case 'wedding':
      default:
        return '/src/assets/images/booth_celebration_group_1793272234607.jpg';
    }
  };

  const [demoImageSrc, setDemoImageSrc] = useState<string>(
    getDemoImageForCategory(eventDetails.category)
  );

  useEffect(() => {
    setDemoImageSrc(getDemoImageForCategory(eventDetails.category));
  }, [eventDetails.category]);

  const requiredShots =
    layoutMode === 'strip_3'
      ? 3
      : layoutMode === 'strip_4' || layoutMode === 'grid_4'
      ? 4
      : 1;

  // 1. Enumerate Video Input Devices
  const enumerateCameras = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');

      const mapped: VideoDeviceOption[] = videoInputs.map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Kamera ${index + 1} (${index === 0 ? 'Built-in' : 'External USB'})`,
      }));

      // Add a virtual high-angle DSLR option for testing/simulation
      mapped.push({
        deviceId: 'virtual-dslr',
        label: 'Kamera Tambahan Virtual (Wide Angle / DSLR)',
        isVirtual: true,
      });

      setAvailableDevices(mapped);

      if (mapped.length > 0 && !primaryDeviceId) {
        setPrimaryDeviceId(mapped[0].deviceId);
      }
      if (mapped.length > 1 && secondaryDeviceId === 'virtual-dslr') {
        // If a real second camera exists, pre-select it
        const secondReal = mapped.find((m) => !m.isVirtual && m.deviceId !== mapped[0].deviceId);
        if (secondReal) {
          setSecondaryDeviceId(secondReal.deviceId);
        }
      }
    } catch (err) {
      console.warn('Error enumerating devices', err);
    }
  };

  // 2. Start Primary Camera
  const startPrimaryCamera = async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser');
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId && deviceId !== 'virtual-dslr'
          ? { deviceId: { exact: deviceId } }
          : { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCamera(true);

      // Re-enumerate to get labels if they were blank before permission
      enumerateCameras();
    } catch (err) {
      console.warn('Primary camera error', err);
      setHasCamera(false);
    }
  };

  // 3. Start Secondary Camera (Kamera Tambahan)
  const startSecondaryCamera = async (deviceId: string) => {
    if (deviceId === 'virtual-dslr' || !deviceId) {
      // Use virtual secondary stream
      if (secondaryStreamRef.current) {
        secondaryStreamRef.current.getTracks().forEach((t) => t.stop());
        secondaryStreamRef.current = null;
      }
      return;
    }

    try {
      if (secondaryStreamRef.current) {
        secondaryStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      secondaryStreamRef.current = stream;
      if (secondaryVideoRef.current) {
        secondaryVideoRef.current.srcObject = stream;
        secondaryVideoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Secondary camera error', err);
    }
  };

  useEffect(() => {
    startPrimaryCamera(primaryDeviceId);

    // Listen to USB camera plug/unplug
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', enumerateCameras);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (secondaryStreamRef.current) {
        secondaryStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', enumerateCameras);
      }
    };
  }, [primaryDeviceId, facingMode]);

  useEffect(() => {
    if (isSecondaryActive && secondaryDeviceId) {
      startSecondaryCamera(secondaryDeviceId);
    } else {
      if (secondaryStreamRef.current) {
        secondaryStreamRef.current.getTracks().forEach((t) => t.stop());
        secondaryStreamRef.current = null;
      }
    }
  }, [isSecondaryActive, secondaryDeviceId]);

  // Flip Front/Rear on mobile
  const switchFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Swap Primary and Secondary cameras
  const handleSwapCameras = () => {
    const tempPrimary = primaryDeviceId;
    setPrimaryDeviceId(secondaryDeviceId);
    setSecondaryDeviceId(tempPrimary);
  };

  // Capture single frame from specific camera feed
  const captureFrameFromSource = (useSecondary: boolean = false): string => {
    const canvas = document.createElement('canvas');

    if (useSecondary) {
      if (
        secondaryDeviceId !== 'virtual-dslr' &&
        secondaryVideoRef.current &&
        secondaryVideoRef.current.videoWidth > 0
      ) {
        const sv = secondaryVideoRef.current;
        canvas.width = sv.videoWidth;
        canvas.height = sv.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(sv, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.92);
      } else {
        // Virtual secondary angle with alternate framing
        const img = new Image();
        img.src = demoImageSrc;
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        return canvas.toDataURL('image/jpeg', 0.92);
      }
    }

    // Capture Primary
    if (hasCamera && videoRef.current && videoRef.current.videoWidth > 0) {
      const v = videoRef.current;
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      }
    } else {
      // Use fallback
      const img = new Image();
      img.src = demoImageSrc;
      canvas.width = 1080;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const triggerFlash = () => {
    setFlashActive(true);
    sfx.playShutter();
    setTimeout(() => {
      setFlashActive(false);
    }, 450);
  };

  // Start Multi-shot Capture Sequence
  const startCaptureSequence = () => {
    if (isCountingDown || sequenceProgress) return;

    const total = requiredShots;
    const capturedPhotos: string[] = [];

    const runSingleShot = (shotIndex: number) => {
      // Determine camera source for this shot
      const useSecondary =
        isSecondaryActive &&
        multiAngleCaptureMode === 'alternate' &&
        shotIndex % 2 === 1;

      setSequenceProgress({
        currentShot: shotIndex + 1,
        totalShots: total,
        captured: [...capturedPhotos],
        cameraAngle: useSecondary ? 'Kamera 2 (Tambahan)' : 'Kamera 1 (Primary)',
      });

      const delay = shotIndex === 0 ? countdownSetting : 2.5;

      if (delay === 0) {
        triggerFlash();
        const data = captureFrameFromSource(useSecondary);
        capturedPhotos.push(data);
        proceedAfterShot(shotIndex, capturedPhotos);
      } else {
        setIsCountingDown(true);
        let count = Math.ceil(delay);
        setCountdownValue(count);
        sfx.playBeep(640, 0.08);

        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            setCountdownValue(count);
            sfx.playBeep(640, 0.08);
          } else {
            clearInterval(interval);
            setIsCountingDown(false);
            triggerFlash();
            const data = captureFrameFromSource(useSecondary);
            capturedPhotos.push(data);
            proceedAfterShot(shotIndex, capturedPhotos);
          }
        }, 1000);
      }
    };

    const proceedAfterShot = (shotIndex: number, currentList: string[]) => {
      if (shotIndex + 1 < total) {
        setTimeout(() => {
          runSingleShot(shotIndex + 1);
        }, 1200);
      } else {
        sfx.playCelebration();
        setSequenceProgress(null);
        onPhotosCaptured(currentList, layoutMode);
      }
    };

    runSingleShot(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setDemoImageSrc(url);
          setHasCamera(false);
          onPhotosCaptured([url], layoutMode);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const preset = getFilterById(selectedFilter);
  const liveCssFilter = computeLiveCssFilter(preset, customAdjust);

  const aspectClass = activeFullCamera
    ? 'h-full w-full'
    : deviceMode === 'tablet_portrait'
    ? 'aspect-[3/4] max-h-[680px]'
    : deviceMode === 'tablet_landscape'
    ? 'aspect-[4/3] max-h-[620px]'
    : deviceMode === 'desktop'
    ? 'aspect-[16/10] max-h-[650px]'
    : 'aspect-[4/3] sm:aspect-[16/10]';

  const containerMaxWidthClass = activeFullCamera
    ? 'w-full h-full'
    : deviceMode === 'tablet_portrait'
    ? 'max-w-2xl'
    : deviceMode === 'tablet_landscape'
    ? 'max-w-5xl'
    : 'max-w-5xl';

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Quick Moment Preset Selector (Bazar, Ulang Tahun, Kantor Gathering, Wedding) */}
      <div className="rounded-xl border border-zinc-800 bg-[#121217] p-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Pilihan Momen Acara (Event Presets)
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Klik untuk mengganti tema, properti stiker & frame otomatis:
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(
            [
              { id: 'bazar', label: 'Bazar & Festival', sub: 'Kuliner & UMKM', icon: '🎪' },
              { id: 'birthday', label: 'Ulang Tahun', sub: 'Birthday Bash', icon: '🎂' },
              { id: 'office', label: 'Kantor Gathering', sub: 'Gala & Outing', icon: '🏢' },
              { id: 'wedding', label: 'Pernikahan', sub: 'Wedding & Reception', icon: '💍' },
            ] as const
          ).map((m) => {
            const isActive = eventDetails.category === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectEventPreset(m.id)}
                className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                  isActive
                    ? 'border-rose-500 bg-rose-500/10 shadow-sm shadow-rose-500/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-rose-400' : 'text-zinc-200'
                      }`}
                    >
                      {m.label}
                    </span>
                    {isActive && <Check className="h-3 w-3 text-rose-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">{m.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 5 Corporate Themes Quick Selector (Shows when in corporate mode or toggled) */}
        {eventDetails.category === 'office' && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400">
                🏢 5 Tema Desain Acara Korporat Perusahaan:
              </span>
              <span className="text-[11px] text-zinc-400">
                Klik tema untuk mengubah desain bingkai & warna print:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {CORPORATE_THEMES_INFO.map((ct) => {
                const isSelected = eventDetails.frameTheme === ct.id;
                return (
                  <button
                    key={ct.id}
                    onClick={() => onSelectFrameTheme(ct.id)}
                    className={`flex flex-col gap-1 rounded-lg border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/15 shadow-sm ring-1 ring-rose-500'
                        : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {ct.badge}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-rose-400 shrink-0" />}
                    </div>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {ct.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                      {ct.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Session Banner & Layout Formats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121217] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              {EVENT_PRESETS[eventDetails.category]?.icon || '✨'}{' '}
              {EVENT_PRESETS[eventDetails.category]?.name || 'Momen Acara'}
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-white mt-0.5">
            {eventDetails.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span>{eventDetails.location || eventDetails.subtitle}</span>
            <span aria-hidden="true">·</span>
            <span>{eventDetails.date}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-medium">{eventDetails.hashtag}</span>
          </div>
        </div>

        {/* Layout Mode Selector & Full Camera Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setLayoutMode('strip_3')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'strip_3'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>3-Strip</span>
            </button>
            <button
              onClick={() => setLayoutMode('strip_4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'strip_4'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>4-Strip</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid_4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'grid_4'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>2x2 Grid</span>
            </button>
            <button
              onClick={() => setLayoutMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'single'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Single</span>
            </button>
          </div>

          {/* Button: Foto Utama Full Kamera */}
          <button
            onClick={handleToggleFullCamera}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/80 bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            title="Buka tampilan foto utama kamera penuh (Kiosk Mode)"
          >
            <Maximize2 className="h-4 w-4" />
            <span>📷 Foto Utama Full Kamera</span>
          </button>
        </div>
      </div>

      {/* 3. Multi-Camera Hardware & Setting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/90 bg-[#101015] px-4 py-2.5">
        {/* Primary Camera Selector */}
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-300 font-medium">Kamera Utama:</span>
          <select
            value={primaryDeviceId}
            onChange={(e) => setPrimaryDeviceId(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-white focus:border-rose-500 focus:outline-none max-w-[200px] truncate"
          >
            {availableDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Camera (Kamera Tambahan) Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSecondaryActive}
              onChange={(e) => setIsSecondaryActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs font-semibold text-zinc-200">
              + Kamera Tambahan (Multi-Angle)
            </span>
          </label>

          {isSecondaryActive && (
            <div className="flex items-center gap-2">
              <select
                value={secondaryDeviceId}
                onChange={(e) => setSecondaryDeviceId(e.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white focus:border-rose-500 focus:outline-none max-w-[180px] truncate"
              >
                {availableDevices
                  .filter((d) => d.deviceId !== primaryDeviceId)
                  .map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
              </select>

              {/* View Mode Toggle: Picture in Picture vs Split Screen */}
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                <button
                  onClick={() => setViewMode('pip')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    viewMode === 'pip' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Picture-in-Picture View"
                >
                  PiP
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    viewMode === 'split' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Split Screen Dual View"
                >
                  <Split className="h-3 w-3 inline mr-0.5" />
                  Split
                </button>
              </div>

              {/* Swap Cameras Button */}
              <button
                onClick={handleSwapCameras}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700 hover:text-white"
                title="Tukar Kamera Utama & Tambahan"
              >
                Tukar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Viewfinder (with Full Camera Kiosk support & PiP / Split Screen) */}
      <div
        className={
          activeFullCamera
            ? 'fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none'
            : `relative mx-auto w-full ${containerMaxWidthClass} overflow-hidden rounded-2xl border border-zinc-800 bg-[#070709] shadow-2xl transition-all duration-300`
        }
      >
        {/* Flash Overlay */}
        {flashActive && (
          <div className="screen-flash pointer-events-none absolute inset-0 z-40" />
        )}

        {/* Full Camera Mode Top Header Overlay */}
        {activeFullCamera && (
          <div className="absolute top-0 inset-x-0 z-30 flex flex-wrap items-center justify-between gap-3 p-4 sm:px-8 sm:py-5 bg-gradient-to-b from-black/95 via-black/60 to-transparent">
            {/* Live Indicator & Event Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-rose-600/25 border border-rose-500/50 px-3 py-1 shadow-lg shadow-rose-600/20">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-200 tracking-wider">
                  LIVE FULL KAMERA
                </span>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-white drop-shadow truncate max-w-sm">
                  {eventDetails.title}
                </span>
                <span className="text-[11px] text-zinc-300 font-medium">
                  {eventDetails.hashtag}
                </span>
              </div>
            </div>

            {/* In-view Layout Switcher */}
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl">
              {(['strip_3', 'strip_4', 'grid_4', 'single'] as LayoutMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setLayoutMode(m);
                    sfx.playBeep(880, 0.04);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    layoutMode === m
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {m === 'strip_3'
                    ? '3-Strip'
                    : m === 'strip_4'
                    ? '4-Strip'
                    : m === 'grid_4'
                    ? '2x2 Grid'
                    : 'Single'}
                </button>
              ))}
            </div>

            {/* Right: Layar Penuh Kiosk & Tutup Full Kamera */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBrowserFullscreen}
                className="flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                title="Layar Penuh Layar (Fullscreen)"
              >
                <Expand className="h-3.5 w-3.5 text-rose-400" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
              <button
                onClick={handleToggleFullCamera}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                title="Kembali ke tampilan normal (Esc)"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Tutup Full Kamera</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewfinder Aspect Container */}
        <div
          className={
            activeFullCamera
              ? 'relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center'
              : `relative ${aspectClass} w-full overflow-hidden bg-zinc-950 flex items-center justify-center transition-all duration-300`
          }
        >
          {viewMode === 'split' && isSecondaryActive ? (
            /* Split View: Dual Feeds Side-by-Side */
            <div className="grid grid-cols-2 h-full w-full divide-x divide-zinc-800">
              {/* Primary Feed */}
              <div className="relative h-full w-full overflow-hidden flex items-center justify-center bg-black">
                {hasCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                    style={{ filter: liveCssFilter }}
                  />
                ) : (
                  <img
                    src={demoImageSrc}
                    alt="Primary Feed"
                    className="h-full w-full object-cover"
                    style={{ filter: liveCssFilter }}
                  />
                )}
                <div className="absolute top-3 left-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  Kamera 1 (Primary)
                </div>
              </div>

              {/* Secondary Feed */}
              <div className="relative h-full w-full overflow-hidden flex items-center justify-center bg-black">
                {secondaryDeviceId !== 'virtual-dslr' ? (
                  <video
                    ref={secondaryVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                    style={{ filter: liveCssFilter }}
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <img
                      src={demoImageSrc}
                      alt="Secondary Feed"
                      className="h-full w-full object-cover scale-x-[-1]"
                      style={{ filter: liveCssFilter }}
                    />
                    <div className="absolute top-3 right-3 rounded bg-amber-500/80 px-2 py-0.5 text-[10px] font-bold text-black backdrop-blur-xs">
                      DSLR Angle
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-rose-300 backdrop-blur-xs">
                  Kamera 2 (Tambahan)
                </div>
              </div>
            </div>
          ) : (
            /* Default Single / PiP View (Foto Utama Full Kamera) */
            <div className="relative h-full w-full flex items-center justify-center">
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover transition-all duration-150 ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                  style={{ filter: liveCssFilter }}
                />
              ) : (
                <div className="relative h-full w-full">
                  <img
                    src={demoImageSrc}
                    alt="Event Photobooth Viewfinder"
                    className="h-full w-full object-cover transition-all duration-150"
                    style={{ filter: liveCssFilter }}
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-amber-300 border border-amber-500/30">
                    <VideoOff className="h-3.5 w-3.5" />
                    <span>Demo Mode ({eventDetails.title})</span>
                  </div>
                </div>
              )}

              {/* Quick Full Camera Expand Button on Top-Right when in standard mode */}
              {!activeFullCamera && (
                <button
                  onClick={handleToggleFullCamera}
                  className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-xl hover:bg-rose-600 transition-all hover:scale-105"
                  title="Perbesar ke Mode Foto Utama Full Kamera"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>Full Kamera</span>
                </button>
              )}

              {/* Secondary Camera Picture-in-Picture (PiP) Window */}
              {isSecondaryActive && (
                <div
                  onClick={handleSwapCameras}
                  className={`group absolute ${
                    activeFullCamera ? 'top-20 right-6' : 'top-4 right-4'
                  } z-20 h-28 w-36 sm:h-36 sm:w-48 overflow-hidden rounded-xl border-2 border-rose-500/80 bg-black shadow-2xl cursor-pointer transition-transform hover:scale-105`}
                  title="Klik untuk menukar kamera utama"
                >
                  {secondaryDeviceId !== 'virtual-dslr' ? (
                    <video
                      ref={secondaryVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                      style={{ filter: liveCssFilter }}
                    />
                  ) : (
                    <div className="relative h-full w-full">
                      <img
                        src={demoImageSrc}
                        alt="Secondary Feed"
                        className="h-full w-full object-cover scale-x-[-1]"
                        style={{ filter: liveCssFilter }}
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-amber-500 px-1.5 py-0.2 text-[9px] font-bold text-black">
                        DSLR Wide
                      </div>
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">
                    Kamera 2 (PiP)
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-medium bg-black/80 px-2 py-0.5 rounded">
                      Klik Tukar
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Side Filter Menu when in Full Camera Mode */}
          {activeFullCamera && onSelectFilter && (
            <div
              className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${
                isSideFilterCollapsed ? 'w-auto' : 'w-40 sm:w-48'
              }`}
            >
              {isSideFilterCollapsed ? (
                <button
                  onClick={() => {
                    setIsSideFilterCollapsed(false);
                    sfx.playBeep(880, 0.04);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-black/85 backdrop-blur-xl border border-white/20 p-2.5 text-xs font-semibold text-white shadow-2xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 group"
                  title="Buka Menu Filter Samping"
                >
                  <Sparkles className="h-4 w-4 text-rose-400 group-hover:text-white animate-pulse" />
                  <span className="hidden sm:inline font-medium text-[11px] text-zinc-300 group-hover:text-white">
                    Filter
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
                </button>
              ) : (
                <div className="flex flex-col gap-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 p-2.5 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-1.5 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                      <span>Menu Filter</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsSideFilterCollapsed(true);
                        sfx.playBeep(750, 0.04);
                      }}
                      className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Ciutkan Menu Filter"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Scrollable Vertical Preset Pills */}
                  <div className="flex flex-col gap-1.5 max-h-[58vh] sm:max-h-[66vh] overflow-y-auto pr-0.5 scrollbar-none">
                    {FILTER_PRESETS.map((p) => {
                      const isSel = selectedFilter === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectFilter(p.id);
                            sfx.playBeep(920, 0.04);
                          }}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                            isSel
                              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg ring-2 ring-white/90 font-bold scale-[1.02]'
                              : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/15 border border-white/5'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isSel ? (
                            <span className="h-2 w-2 rounded-full bg-white shrink-0 animate-ping ml-1" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-rose-400 shrink-0 ml-1 transition-colors" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Filter Hint */}
                  <div className="pt-1.5 border-t border-white/10 text-center">
                    <span className="text-[10px] text-zinc-400">
                      Aktif: <strong className="text-rose-400">{preset.name}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Filter Badge */}
          {(!activeFullCamera || isSideFilterCollapsed) && (
            <div className={`absolute ${activeFullCamera ? 'bottom-28 left-6' : 'bottom-4 left-4'} z-10 flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs text-zinc-300 border border-zinc-800`}>
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>Filter: {preset.name}</span>
            </div>
          )}

          {/* Frame Theme watermark preview */}
          <div className={`absolute ${activeFullCamera ? 'bottom-28 right-6' : 'bottom-4 right-4'} z-10 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs text-zinc-400 border border-zinc-800`}>
            Frame: {eventDetails.frameTheme}
          </div>

          {/* Countdown Display Modal */}
          {isCountingDown && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs">
              <span className="font-display text-8xl sm:text-9xl font-extrabold text-white animate-ping drop-shadow-2xl">
                {countdownValue}
              </span>
              <p className="mt-4 text-base sm:text-lg font-bold tracking-wider text-rose-400 uppercase drop-shadow">
                {sequenceProgress
                  ? `Pose! (Foto ${sequenceProgress.currentShot} dari ${sequenceProgress.totalShots} - ${sequenceProgress.cameraAngle})`
                  : 'Get Ready to Smile!'}
              </p>
            </div>
          )}

          {/* Multi-shot Sequence Notification Ribbon */}
          {sequenceProgress && !isCountingDown && (
            <div className={`absolute ${activeFullCamera ? 'top-20 inset-x-6' : 'top-4 inset-x-4'} z-30 flex items-center justify-between rounded-xl bg-black/80 backdrop-blur-md px-4 py-2 border border-rose-500/40 text-white shadow-xl`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-300">
                  Mengambil foto {sequenceProgress.currentShot} dari {sequenceProgress.totalShots}...
                </span>
                <span className="rounded bg-rose-600/30 border border-rose-500/40 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                  {sequenceProgress.cameraAngle}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: sequenceProgress.totalShots }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-7 rounded-full transition-all ${
                      i < sequenceProgress.captured.length
                        ? 'bg-rose-500'
                        : i === sequenceProgress.currentShot - 1
                        ? 'bg-rose-400 animate-pulse'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Full Camera Mode Floating Bottom Controls */}
        {activeFullCamera ? (
          <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col items-center gap-3.5 p-4 sm:pb-8 sm:px-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
            {/* Bottom Actions Row */}
            <div className="w-full flex items-center justify-between max-w-3xl">
              {/* Left: Flip & Upload */}
              <div className="flex items-center gap-2">
                <button
                  onClick={switchFacingMode}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/70 backdrop-blur-md px-3.5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                  title="Balik Arah Kamera"
                >
                  <FlipHorizontal className="h-4 w-4 text-rose-400" />
                  <span className="hidden sm:inline">Flip Kamera</span>
                </button>
              </div>

              {/* Center: Mega Glowing Shutter Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={startCaptureSequence}
                  disabled={isCountingDown}
                  className="group relative flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 p-1.5 text-white shadow-2xl shadow-rose-600/60 shutter-glow hover:scale-110 active:scale-95 transition-all disabled:opacity-50 ring-4 ring-rose-500/30"
                  title={`Ambil ${requiredShots} foto`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/90 bg-rose-600">
                    <Camera className="h-8 w-8 sm:h-9 sm:w-9 transition-transform group-hover:scale-110" />
                  </div>
                </button>
              </div>

              {/* Right: Timer Selector */}
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-xl p-1.5 border border-white/15">
                <Timer className="h-4 w-4 text-rose-400 ml-1 mr-0.5" />
                {[0, 3, 5, 10].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCountdownSetting(t);
                      sfx.playBeep(850, 0.04);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      countdownSetting === t
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    {t === 0 ? 'Off' : `${t}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Bottom Control Toolbar */
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 bg-[#0e0e13] px-6 py-4">
            {/* Left Controls: Camera Flip & Fallback switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={switchFacingMode}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Switch Camera (Front / Rear)"
              >
                <FlipHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Flip Kamera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Upload photo from device"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Test</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!hasCamera && (
                <button
                  onClick={() => startPrimaryCamera(primaryDeviceId)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
                  title="Retry camera access"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Coba Lagi</span>
                </button>
              )}
            </div>

            {/* Center: Big Shutter Button with Pulse Glow */}
            <div className="flex items-center justify-center">
              <button
                onClick={startCaptureSequence}
                disabled={isCountingDown}
                className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 p-1 text-white shadow-lg shadow-rose-600/40 shutter-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                title={`Take ${requiredShots} photo${requiredShots > 1 ? 's' : ''}`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/80 bg-rose-600">
                  <Camera className="h-7 w-7 transition-transform group-hover:scale-110" />
                </div>
              </button>
            </div>

            {/* Right Controls: Timer Delay Selector & Event Setting */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <Timer className="h-4 w-4 text-zinc-400 ml-1.5 mr-0.5" />
                {[0, 3, 5, 10].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCountdownSetting(t)}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      countdownSetting === t
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title={`${t === 0 ? 'Tanpa timer' : t + ' detik'}`}
                  >
                    {t === 0 ? 'Off' : `${t}s`}
                  </button>
                ))}
              </div>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Kustomisasi Nama Acara & Branding"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
