import { ThemeManifest, ValidationReport, ValidationError } from '../types/theme'

/**
 * Validates a ThemeManifest against the rules defined in GUIDE.md
 */
export function validateTheme(manifest: ThemeManifest): ValidationReport {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // 1. General & Creator Metadata
  if (!manifest.metadata.name || !manifest.metadata.name.trim()) {
    errors.push({
      section: 'general',
      field: 'name',
      message: 'Theme name is required.',
      severity: 'error',
    })
  }

  // Version is now managed under the hood (defaults to 1.0.0) without prompting user
  const version = manifest.metadata.version?.trim() || '1.0.0'
  const semverRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/
  if (!semverRegex.test(version)) {
    warnings.push({
      section: 'general',
      field: 'version',
      message: 'Theme version should follow semantic versioning.',
      severity: 'warning',
    })
  }

  // 2. Wallpaper Validation
  if (manifest.wallpaper.mode === 'static') {
    if (!manifest.wallpaper.static?.assetPath) {
      errors.push({
        section: 'wallpaper',
        field: 'static.assetPath',
        message: 'Static wallpaper image is required.',
        severity: 'error',
      })
    }
  } else if (manifest.wallpaper.mode === 'slideshow') {
    const slides = manifest.wallpaper.slideshow?.slides || []
    if (slides.length < 2) {
      errors.push({
        section: 'wallpaper',
        field: 'slideshow.slides',
        message: 'Slideshow mode requires at least 2 images.',
        severity: 'error',
      })
    }
    const interval = manifest.wallpaper.slideshow?.intervalSeconds ?? 0
    if (interval < 10) {
      errors.push({
        section: 'wallpaper',
        field: 'slideshow.intervalSeconds',
        message: 'Slideshow interval must be at least 10 seconds.',
        severity: 'error',
      })
    }
    slides.forEach((slide, idx) => {
      if (!slide.assetPath) {
        errors.push({
          section: 'wallpaper',
          field: `slideshow.slides[${idx}]`,
          message: `Slide ${idx + 1} has no image assigned.`,
          severity: 'error',
        })
      }
    })
  } else if (manifest.wallpaper.mode === 'video') {
    errors.push({
      section: 'wallpaper',
      field: 'video',
      message: 'Video wallpaper is "Coming Soon" and cannot be packaged into an installer.',
      severity: 'error',
    })
  }

  // 3. Cursor Validation
  const cursorRoles = manifest.cursors?.roles || {}
  const activeRoles = Object.entries(cursorRoles).filter(([, path]) => Boolean(path))
  if (activeRoles.length === 0) {
    warnings.push({
      section: 'cursors',
      message: 'No custom cursors configured; default Windows pointers will remain active.',
      severity: 'warning',
    })
  } else {
    for (const [role, path] of activeRoles) {
      if (path && !path.startsWith('data:')) {
        const lower = path.toLowerCase()
        if (!lower.endsWith('.ani') && !lower.endsWith('.cur')) {
          errors.push({
            section: 'cursors',
            field: role,
            message: `Cursor "${role}" must be an .ani or .cur file.`,
            severity: 'error',
          })
        }
      }
    }
  }

  // 4. Sound Validation
  const soundEvents = manifest.sounds?.events || {}
  const activeSounds = Object.entries(soundEvents).filter(([, path]) => Boolean(path))
  if (activeSounds.length === 0) {
    warnings.push({
      section: 'sounds',
      message: 'No custom sound events configured; system sound scheme will remain unchanged.',
      severity: 'warning',
    })
  }

  // 5. Appearance Validation
  const hexRegex = /^#([0-9A-Fa-f]{6})$/
  if (!manifest.appearance?.accentColor || !hexRegex.test(manifest.appearance.accentColor)) {
    errors.push({
      section: 'appearance',
      field: 'accentColor',
      message: 'Accent color must be a valid 6-character hex code (e.g. #4F585E).',
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
