export type FilterId =
  | 'normal'
  | 'glam'
  | 'retro'
  | 'golden'
  | 'noir'
  | 'cyber'
  | 'pastel'
  | 'vintage'
  | 'duotone';

export interface FilterPreset {
  id: FilterId;
  name: string;
  description: string;
  cssFilter: string;
  temperature: number; // -30 to 30
  tint: number;
  grain: number; // 0 to 100
  vignette: number; // 0 to 100
  contrast: number; // 0.8 to 1.5
  brightness: number; // 0.8 to 1.3
  saturation: number; // 0 to 2
}

export type LayoutMode = 'strip_3' | 'strip_4' | 'grid_4' | 'single';

export type EventCategory = 'bazar' | 'birthday' | 'office' | 'wedding' | 'custom';

export type FrameTheme =
  | 'modern-noir'
  | 'classic-white'
  | 'champagne-gold'
  | 'neon-glow'
  | 'polaroid'
  | 'bazar-carnival'
  | 'birthday-confetti'
  | 'corporate-navy'
  | 'corporate-gold-gala'
  | 'corporate-tech-summit'
  | 'corporate-modern-travertine'
  | 'corporate-emerald-esg';

export type DeviceDisplayMode = 'desktop' | 'tablet_landscape' | 'tablet_portrait' | 'auto';

export type PrintPaperSize = 'strip_2x6_dual' | 'postcard_4x6' | 'single_strip_2x6';

export interface PrintSettings {
  paperSize: PrintPaperSize;
  copies: number;
  showCutLine: boolean;
  highDpi: boolean;
}

export interface VideoDeviceOption {
  deviceId: string;
  label: string;
  isVirtual?: boolean;
}

export interface MultiCameraConfig {
  enabled: boolean;
  primaryDeviceId: string;
  secondaryDeviceId: string;
  viewMode: 'pip' | 'split' | 'single';
  activeCaptureMode: 'primary_only' | 'alternate' | 'dual_angle';
}

export interface StickerItem {
  id: string;
  type: 'emoji' | 'badge' | 'prop';
  content: string; // Emoji char or text
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px size
  rotation: number; // deg
}

export interface PhotoCapture {
  id: string;
  dataUrl: string;
  timestamp: number;
  filterId: FilterId;
  cameraSource?: 'primary' | 'secondary' | 'dual';
}

export interface EventDetails {
  category: EventCategory;
  title: string;
  subtitle: string;
  hashtag: string;
  date: string;
  location: string;
  frameTheme: FrameTheme;
}

export interface EventGalleryItem {
  id: string;
  compositeUrl: string;
  layout: LayoutMode;
  theme: FrameTheme;
  timestamp: number;
  eventTitle: string;
  category?: EventCategory;
  caption: string;
  author: string;
  likes: number;
  reactions: { [key: string]: number };
  comments: { id: string; author: string; text: string; time: string }[];
}
