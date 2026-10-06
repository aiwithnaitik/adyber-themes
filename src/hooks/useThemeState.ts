import { useState, useMemo, useCallback } from 'react'
import { ThemeManifest, ValidationReport } from '../types/theme'
import { validateTheme } from '../services/validator'

export const THEME_STEPS = [
  { id: 'general', label: 'General', number: 1 },
  { id: 'wallpaper', label: 'Wallpaper', number: 2 },
  { id: 'cursors', label: 'Cursors', number: 3 },
  { id: 'sounds', label: 'Sounds', number: 4 },
  { id: 'appearance', label: 'Appearance', number: 5 },
  { id: 'creator', label: 'Creator Info', number: 6 },
  { id: 'preview', label: 'Preview', number: 7 },
  { id: 'installer', label: 'Installer', number: 8 },
] as const

export type ThemeStepId = typeof THEME_STEPS[number]['id']
export type ThemeSectionId = ThemeStepId | 'validation'

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  colorMode: 'dark' | 'light';
  previewWallpaperGradient: string;
  description: string;
  manifest: ThemeManifest;
}

export const CURATED_PRESETS: ThemePreset[] = [
  {
    id: 'storm-industrial',
    name: 'Storm Industrial',
    tagline: 'Windows 11 official Storm palette with graphite window accents',
    accent: '#4F585E',
    colorMode: 'dark',
    description: 'Official Windows 11 Storm Slate theme configured with deep graphite windows, high-contrast dark surfaces, and balanced color prevalence.',
    previewWallpaperGradient: 'linear-gradient(135deg, #1b2024 0%, #3c474e 50%, #4f585e 100%)',
    manifest: {
      schemaVersion: '1.0.0',
      metadata: {
        id: 'storm-industrial',
        name: 'Storm Industrial',
        version: '1.0.0',
        description: 'Official Windows 11 Storm Slate theme configured with deep graphite windows, high-contrast dark surfaces, and balanced color prevalence.',
        author: {
          name: 'Windows Studio',
          url: 'https://github.com',
          notes: 'Built for desktop ergonomics and focus.',
        },
        createdDate: new Date().toISOString(),
        tags: ['storm', 'slate', 'dark', 'industrial'],
        icon: '',
      },
      appearance: {
        colorMode: 'dark',
        accentColor: '#4F585E',
        windowColor: '#4F585E',
        colorPrevalence: true,
      },
      wallpaper: {
        mode: 'static',
        static: {
          assetPath: '',
          fit: 'fill',
        },
      },
      cursors: { roles: {}, files: {} },
      sounds: { events: {}, files: {} },
      installer: {
        productName: 'Storm Industrial',
        artifactName: 'storm-industrial.exe',
        confirmationTitle: 'Install Storm Industrial Theme',
        confirmationMessage: 'Install Storm Industrial Theme on your PC?',
      },
    },
  },
  {
    id: 'nordic-glacier',
    name: 'Nordic Glacier',
    tagline: 'Cool arctic slate with polished frost windows and minimal noise',
    accent: '#5A7384',
    colorMode: 'dark',
    description: 'Subtle cool steel tones inspired by Scandinavian minimalist workspaces.',
    previewWallpaperGradient: 'linear-gradient(135deg, #0e141a 0%, #1f2b35 50%, #5a7384 100%)',
    manifest: {
      schemaVersion: '1.0.0',
      metadata: {
        id: 'nordic-glacier',
        name: 'Nordic Glacier',
        version: '1.0.0',
        description: 'Subtle cool steel tones inspired by Scandinavian minimalist workspaces.',
        author: {
          name: 'Nordic Design Lab',
          url: 'https://github.com',
          notes: 'Minimalist ergonomics.',
        },
        createdDate: new Date().toISOString(),
        tags: ['nordic', 'glacier', 'steel', 'minimal'],
        icon: '',
      },
      appearance: {
        colorMode: 'dark',
        accentColor: '#5A7384',
        windowColor: '#5A7384',
        colorPrevalence: false,
      },
      wallpaper: {
        mode: 'static',
        static: {
          assetPath: '',
          fit: 'fill',
        },
      },
      cursors: { roles: {}, files: {} },
      sounds: { events: {}, files: {} },
      installer: {
        productName: 'Nordic Glacier',
        artifactName: 'nordic-glacier.exe',
        confirmationTitle: 'Install Nordic Glacier Theme',
        confirmationMessage: 'Install Nordic Glacier Theme on your PC?',
      },
    },
  },
  {
    id: 'cyber-obsidian',
    name: 'Cyber Obsidian',
    tagline: 'Deep onyx architecture with sharp high-contrast precision',
    accent: '#2B3338',
    colorMode: 'dark',
    description: 'True black surfaces designed for OLED displays and developer terminals.',
    previewWallpaperGradient: 'linear-gradient(135deg, #090a0c 0%, #171a1d 50%, #2b3338 100%)',
    manifest: {
      schemaVersion: '1.0.0',
      metadata: {
        id: 'cyber-obsidian',
        name: 'Cyber Obsidian',
        version: '1.0.0',
        description: 'True black surfaces designed for OLED displays and developer terminals.',
        author: {
          name: 'Obsidian Team',
          url: 'https://github.com',
        },
        createdDate: new Date().toISOString(),
        tags: ['obsidian', 'oled', 'dark'],
        icon: '',
      },
      appearance: {
        colorMode: 'dark',
        accentColor: '#2B3338',
        windowColor: '#2B3338',
        colorPrevalence: true,
      },
      wallpaper: {
        mode: 'static',
        static: {
          assetPath: '',
          fit: 'fill',
        },
      },
      cursors: { roles: {}, files: {} },
      sounds: { events: {}, files: {} },
      installer: {
        productName: 'Cyber Obsidian',
        artifactName: 'cyber-obsidian.exe',
        confirmationTitle: 'Install Cyber Obsidian Theme',
        confirmationMessage: 'Install Cyber Obsidian Theme on your PC?',
      },
    },
  },
  {
    id: 'amber-twilight',
    name: 'Amber Twilight',
    tagline: 'Warm amber glow against matte carbon backdrop',
    accent: '#D97706',
    colorMode: 'dark',
    description: 'Warm evening lighting palette with carbon black windows and golden amber taskbar highlights.',
    previewWallpaperGradient: 'linear-gradient(135deg, #120d08 0%, #291a0e 50%, #78350f 100%)',
    manifest: {
      schemaVersion: '1.0.0',
      metadata: {
        id: 'amber-twilight',
        name: 'Amber Twilight',
        version: '1.0.0',
        description: 'Warm evening lighting palette with carbon black windows and golden amber taskbar highlights.',
        author: {
          name: 'Solaris Studio',
          url: 'https://github.com',
        },
        createdDate: new Date().toISOString(),
        tags: ['amber', 'warm', 'sunset'],
        icon: '',
      },
      appearance: {
        colorMode: 'dark',
        accentColor: '#D97706',
        windowColor: '#D97706',
        colorPrevalence: true,
      },
      wallpaper: {
        mode: 'static',
        static: {
          assetPath: '',
          fit: 'fill',
        },
      },
      cursors: { roles: {}, files: {} },
      sounds: { events: {}, files: {} },
      installer: {
        productName: 'Amber Twilight',
        artifactName: 'amber-twilight.exe',
        confirmationTitle: 'Install Amber Twilight Theme',
        confirmationMessage: 'Install Amber Twilight Theme on your PC?',
      },
    },
  },
]

export const EMPTY_THEME_MANIFEST: ThemeManifest = {
  schemaVersion: '1.0.0',
  metadata: {
    id: '',
    name: '',
    version: '',
    description: '',
    author: {
      name: '',
      url: '',
      email: '',
      notes: '',
    },
    createdDate: new Date().toISOString(),
    tags: [],
    icon: '',
  },
  appearance: {
    colorMode: 'dark',
    accentColor: '#4F585E', // Storm default Windows accent
    windowColor: '#4F585E',
    colorPrevalence: true,
  },
  wallpaper: {
    mode: 'static',
    static: {
      assetPath: '',
      fit: 'fill',
    },
    slideshow: {
      slides: [],
      intervalSeconds: 60,
      shuffle: true,
    },
  },
  cursors: {
    roles: {},
    files: {},
  },
  sounds: {
    events: {},
    files: {},
  },
  installer: {
    productName: 'theme',
    artifactName: 'theme.exe',
    confirmationTitle: 'Install theme',
    confirmationMessage: 'Install theme?',
  },
}

export function useThemeState() {
  const [theme, setTheme] = useState<ThemeManifest>(EMPTY_THEME_MANIFEST)
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard')
  const [activeSection, setActiveSection] = useState<ThemeSectionId>('general')
  const [highestStepReached, setHighestStepReached] = useState<number>(1)
  const [isBuildModalOpen, setIsBuildModalOpen] = useState<boolean>(false)

  // Real-time validation against GUIDE.md rules
  const validation: ValidationReport = useMemo(() => {
    return validateTheme(theme)
  }, [theme])

  // Check if current step requirements are satisfied before moving forward
  const isCurrentStepValid = useMemo(() => {
    if (activeSection === 'general') {
      return Boolean(theme.metadata.name.trim())
    }
    if (activeSection === 'wallpaper') {
      if (theme.wallpaper.mode === 'static') {
        return Boolean(theme.wallpaper.static?.assetPath)
      }
      if (theme.wallpaper.mode === 'slideshow') {
        const slides = theme.wallpaper.slideshow?.slides || []
        return slides.length >= 2 && slides.every((s) => Boolean(s.assetPath))
      }
      return false
    }
    if (activeSection === 'creator') {
      return Boolean(theme.metadata.author?.name.trim())
    }
    return true
  }, [activeSection, theme])

  const currentStepIndex = useMemo(() => {
    return THEME_STEPS.findIndex((s) => s.id === activeSection)
  }, [activeSection])

  const isStepAccessible = useCallback(
    (sectionId: ThemeSectionId) => {
      if (sectionId === 'validation') return true
      const targetIdx = THEME_STEPS.findIndex((s) => s.id === sectionId)
      return targetIdx >= 0 && targetIdx + 1 <= highestStepReached
    },
    [highestStepReached]
  )

  const goToStep = useCallback(
    (sectionId: ThemeSectionId) => {
      if (sectionId === 'validation') {
        setActiveSection('validation')
        return
      }
      const targetIdx = THEME_STEPS.findIndex((s) => s.id === sectionId)
      if (targetIdx >= 0 && targetIdx + 1 <= highestStepReached) {
        setActiveSection(sectionId)
      }
    },
    [highestStepReached]
  )

  const goToNextStep = useCallback(() => {
    if (activeSection === 'validation') {
      setActiveSection('preview')
      return
    }

    // Auto-fill defaults for empty optional fields if user progresses
    if (activeSection === 'general') {
      if (!theme.metadata.name.trim()) return

      setTheme((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          version: prev.metadata.version.trim() || '1.0.0',
          id:
            prev.metadata.id.trim() ||
            prev.metadata.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        },
      }))
    }

    const nextIdx = currentStepIndex + 1
    if (nextIdx < THEME_STEPS.length) {
      const nextStep = THEME_STEPS[nextIdx]
      setActiveSection(nextStep.id)
      setHighestStepReached((prev) => Math.max(prev, nextIdx + 1))
    }
  }, [activeSection, currentStepIndex, theme.metadata.name])

  const goToPrevStep = useCallback(() => {
    if (activeSection === 'validation') {
      setActiveSection('preview')
      return
    }
    const prevIdx = currentStepIndex - 1
    if (prevIdx >= 0) {
      const prevStep = THEME_STEPS[prevIdx]
      setActiveSection(prevStep.id)
    }
  }, [activeSection, currentStepIndex])

  // Updater helpers
  const updateMetadata = useCallback((patch: Partial<ThemeManifest['metadata']>) => {
    setTheme((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...patch },
    }))
  }, [])

  const updateAppearance = useCallback((patch: Partial<ThemeManifest['appearance']>) => {
    setTheme((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...patch },
    }))
  }, [])

  const updateWallpaper = useCallback((patch: Partial<ThemeManifest['wallpaper']>) => {
    setTheme((prev) => ({
      ...prev,
      wallpaper: { ...prev.wallpaper, ...patch },
    }))
  }, [])

  const updateCursors = useCallback(
    (
      rolesPatch: Record<string, string | undefined>,
      filesPatch?: Record<string, { fileName: string; sizeBytes?: number; isAni?: boolean }>
    ) => {
      setTheme((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          roles: { ...prev.cursors.roles, ...rolesPatch },
          files: { ...(prev.cursors.files || {}), ...(filesPatch || {}) },
        },
      }))
    },
    []
  )

  const updateSounds = useCallback(
    (
      eventsPatch: Record<string, string | undefined>,
      filesPatch?: Record<string, { fileName: string; durationSeconds?: number; wasConverted?: boolean }>
    ) => {
      setTheme((prev) => ({
        ...prev,
        sounds: {
          ...prev.sounds,
          events: { ...prev.sounds.events, ...eventsPatch },
          files: { ...(prev.sounds.files || {}), ...(filesPatch || {}) },
        },
      }))
    },
    []
  )

  const updateInstaller = useCallback((patch: Partial<ThemeManifest['installer']>) => {
    setTheme((prev) => ({
      ...prev,
      installer: {
        ...(prev.installer || {
          productName: 'theme',
          artifactName: 'theme.exe',
          confirmationTitle: 'Install theme',
          confirmationMessage: 'Install theme?',
        }),
        ...patch,
      },
    }))
  }, [])

  const resetTheme = useCallback(() => {
    setTheme(EMPTY_THEME_MANIFEST)
    setActiveSection('general')
    setHighestStepReached(1)
    setView('workspace')
  }, [])

  const loadPresetTheme = useCallback((preset: ThemePreset) => {
    setTheme(JSON.parse(JSON.stringify(preset.manifest)))
    setActiveSection('general')
    setHighestStepReached(1)
    setView('workspace')
  }, [])

  return {
    theme,
    setTheme,
    view,
    setView,
    activeSection,
    setActiveSection,
    currentStepIndex,
    highestStepReached,
    isCurrentStepValid,
    isStepAccessible,
    goToStep,
    goToNextStep,
    goToPrevStep,
    validation,
    updateMetadata,
    updateAppearance,
    updateWallpaper,
    updateCursors,
    updateSounds,
    updateInstaller,
    resetTheme,
    createNewTheme: resetTheme,
    loadPresetTheme,
    curatedPresets: CURATED_PRESETS,
    isBuildModalOpen,
    setIsBuildModalOpen,
  }
}
