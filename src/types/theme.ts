/**
 * Unified Theme Specification & Types
 * Defined according to GUIDE.md
 */

export type WallpaperMode = 'static' | 'slideshow' | 'video';

export interface WallpaperSlide {
  order: number;
  assetPath: string; // Relative path or Data URL in web studio
  name?: string;
}

export interface WallpaperConfig {
  mode: WallpaperMode;
  static?: {
    assetPath: string;
    fit: 'fill' | 'fit' | 'stretch' | 'tile' | 'center' | 'span';
  };
  slideshow?: {
    slides: WallpaperSlide[];
    intervalSeconds: number; // Duration per slide (min 10s)
    shuffle: boolean;
  };
  video?: {
    assetPath?: string;
    comingSoon: true;
  };
}

export type StandardCursorRole = 'normal' | 'pointer' | 'loading' | 'textSelect';

export interface CursorRoleMeta {
  id: string;
  name: string;
  win32Id: string;
  description: string;
  icon: string;
}

export interface CursorConfig {
  roles: Record<string, string | undefined>; // e.g. Arrow: "data:..." or "cursors/normal.ani"
  files?: Record<string, { fileName: string; sizeBytes?: number; isAni?: boolean }>;
}

export type StandardSoundEvent = 
  | 'deviceConnect'
  | 'deviceDisconnect'
  | 'notification'
  | 'error'
  | 'click'
  | 'startup'
  | 'shutdown';

export interface SoundEventMeta {
  id: string;
  name: string;
  registryKey: string;
  description: string;
  icon: string;
}

export interface SoundConfig {
  events: Record<string, string | undefined>; // e.g. deviceConnect: "data:..." or "sounds/plug-in.wav"
  files?: Record<string, { fileName: string; durationSeconds?: number; wasConverted?: boolean }>;
}

export interface AppearanceConfig {
  colorMode: 'dark' | 'light' | 'system';
  accentColor: string; // Hex (e.g. #4F585E for Storm)
  windowColor?: string;
  colorPrevalence: boolean;
  additionalColors?: Record<string, string>;
}

export interface CreatorMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    url?: string;
    email?: string;
    notes?: string;
  };
  icon?: string;
  createdDate: string;
  tags?: string[];
}

export interface InstallerConfig {
  productName: string;
  artifactName: string;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export interface ThemeManifest {
  $schema?: string;
  schemaVersion: '1.0.0';
  metadata: CreatorMetadata;
  appearance: AppearanceConfig;
  wallpaper: WallpaperConfig;
  cursors: CursorConfig;
  sounds: SoundConfig;
  installer?: InstallerConfig;
  custom?: Record<string, unknown>;
}

export interface ValidationError {
  section: 'general' | 'wallpaper' | 'cursors' | 'sounds' | 'appearance' | 'creator' | 'system';
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
