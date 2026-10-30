import { FilterId, FilterPreset } from '../types/photobooth';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Natural',
    description: 'Crisp, authentic camera colors',
    cssFilter: 'none',
    temperature: 0,
    tint: 0,
    grain: 0,
    vignette: 0,
    contrast: 1.0,
    brightness: 1.0,
    saturation: 1.0,
  },
  {
    id: 'glam',
    name: 'Glam Studio',
    description: 'Radiant skin tones & luminous glow',
    cssFilter: 'brightness(1.08) contrast(1.06) saturate(1.15)',
    temperature: 5,
    tint: 2,
    grain: 0,
    vignette: 15,
    contrast: 1.06,
    brightness: 1.08,
    saturation: 1.15,
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Warm champagne dusk illumination',
    cssFilter: 'sepia(0.24) saturate(1.35) brightness(1.05) contrast(1.06) hue-rotate(-8deg)',
    temperature: 20,
    tint: -5,
    grain: 12,
    vignette: 20,
    contrast: 1.06,
    brightness: 1.05,
    saturation: 1.35,
  },
  {
    id: 'noir',
    name: 'Classic Noir',
    description: 'Rich contrast timeless monochrome',
    cssFilter: 'grayscale(1) contrast(1.35) brightness(0.96)',
    temperature: 0,
    tint: 0,
    grain: 22,
    vignette: 35,
    contrast: 1.35,
    brightness: 0.96,
    saturation: 0,
  },
  {
    id: 'retro',
    name: '90s Disposable',
    description: 'Nostalgic analog film tones & soft grain',
    cssFilter: 'sepia(0.3) contrast(1.15) brightness(0.98) saturate(1.22) hue-rotate(-12deg)',
    temperature: 15,
    tint: 5,
    grain: 30,
    vignette: 25,
    contrast: 1.15,
    brightness: 0.98,
    saturation: 1.22,
  },
  {
    id: 'cyber',
    name: 'Cyber Party',
    description: 'Punchy electric party vibes',
    cssFilter: 'contrast(1.25) saturate(1.5) hue-rotate(185deg) brightness(1.02)',
    temperature: -15,
    tint: 25,
    grain: 10,
    vignette: 30,
    contrast: 1.25,
    brightness: 1.02,
    saturation: 1.5,
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    description: 'Soft airy ethereal wedding glow',
    cssFilter: 'brightness(1.1) contrast(0.92) saturate(1.2) hue-rotate(8deg)',
    temperature: 8,
    tint: 12,
    grain: 5,
    vignette: 10,
    contrast: 0.92,
    brightness: 1.1,
    saturation: 1.2,
  },
  {
    id: 'vintage',
    name: 'Vintage Sepia',
    description: 'Aged archival photobooth paper look',
    cssFilter: 'sepia(0.68) contrast(1.12) brightness(0.92) saturate(0.9)',
    temperature: 25,
    tint: -10,
    grain: 35,
    vignette: 45,
    contrast: 1.12,
    brightness: 0.92,
    saturation: 0.9,
  },
  {
    id: 'duotone',
    name: 'Electric Duotone',
    description: 'Ultra stylized violet & amber depth',
    cssFilter: 'contrast(1.3) saturate(1.7) hue-rotate(240deg) brightness(1.05)',
    temperature: -20,
    tint: 30,
    grain: 15,
    vignette: 35,
    contrast: 1.3,
    brightness: 1.05,
    saturation: 1.7,
  },
];

export function getFilterById(id: FilterId): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) || FILTER_PRESETS[0];
}

export function computeLiveCssFilter(
  preset: FilterPreset,
  custom: {
    brightness: number; // 0.7 - 1.4
    contrast: number;   // 0.7 - 1.4
    saturation: number; // 0 - 2
    warmth: number;     // -30 to 30
  }
): string {
  const baseBrightness = preset.brightness * custom.brightness;
  const baseContrast = preset.contrast * custom.contrast;
  const baseSaturation = preset.saturation * custom.saturation;
  const hueShift = custom.warmth;

  let str = `brightness(${baseBrightness.toFixed(2)}) contrast(${baseContrast.toFixed(2)}) saturate(${baseSaturation.toFixed(2)})`;

  if (preset.id === 'noir') {
    str = `grayscale(1) ${str}`;
  } else if (preset.id === 'vintage') {
    str = `sepia(0.65) ${str}`;
  } else if (preset.id === 'golden') {
    str = `sepia(0.25) ${str}`;
  } else if (preset.id === 'retro') {
    str = `sepia(0.3) ${str}`;
  } else if (preset.id === 'cyber') {
    str = `hue-rotate(185deg) ${str}`;
  } else if (preset.id === 'duotone') {
    str = `hue-rotate(240deg) ${str}`;
  }

  if (hueShift !== 0) {
    str += ` hue-rotate(${hueShift}deg)`;
  }

  return str;
}
