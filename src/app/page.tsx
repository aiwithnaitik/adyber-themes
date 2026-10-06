'use client'

import React, { useState, useEffect } from 'react'
import { AdyberHome } from '../components/AdyberHome'
import { ThemeCreator } from '../components/ThemeCreator'
import { CreateInstallerModal } from '../components/CreateInstallerModal'
import { ThemeManifest } from '../types/theme'
import { CURATED_PRESETS, EMPTY_THEME_MANIFEST } from '../hooks/useThemeState'
import { validateTheme } from '../services/validator'

export default function Home() {
  const [currentView, setCurrentView] = useState<'projects' | 'creator'>('projects')
  const [themes, setThemes] = useState<ThemeManifest[]>([])
  const [activeTheme, setActiveTheme] = useState<ThemeManifest>(EMPTY_THEME_MANIFEST)
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false)

  // Real-time validation for active theme
  const validation = validateTheme(activeTheme)

  // Load saved themes from localStorage on client mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adyber_themes_projects')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setThemes(parsed)
          if (parsed.length > 0) {
            setActiveTheme(parsed[0])
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [])

  // Persist themes to localStorage
  const saveThemesToStorage = (updatedThemes: ThemeManifest[]) => {
    setThemes(updatedThemes)
    try {
      localStorage.setItem('adyber_themes_projects', JSON.stringify(updatedThemes))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }

  // Creator updater helpers
  const updateMetadata = (patch: Partial<ThemeManifest['metadata']>) => {
    setActiveTheme((prev) => {
      const updated = {
        ...prev,
        metadata: { ...prev.metadata, ...patch },
      }
      return updated
    })
  }

  const updateAppearance = (patch: Partial<ThemeManifest['appearance']>) => {
    setActiveTheme((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...patch },
    }))
  }

  const updateWallpaper = (patch: Partial<ThemeManifest['wallpaper']>) => {
    setActiveTheme((prev) => ({
      ...prev,
      wallpaper: { ...prev.wallpaper, ...patch },
    }))
  }

  const updateCursors = (
    rolesPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; sizeBytes?: number; isAni?: boolean }>
  ) => {
    setActiveTheme((prev) => ({
      ...prev,
      cursors: {
        ...prev.cursors,
        roles: { ...prev.cursors.roles, ...rolesPatch },
        files: { ...(prev.cursors.files || {}), ...(filesPatch || {}) },
      },
    }))
  }

  const updateSounds = (
    eventsPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; durationSeconds?: number; wasConverted?: boolean }>
  ) => {
    setActiveTheme((prev) => ({
      ...prev,
      sounds: {
        ...prev.sounds,
        events: { ...prev.sounds.events, ...eventsPatch },
        files: { ...(prev.sounds.files || {}), ...(filesPatch || {}) },
      },
    }))
  }

  const updateInstaller = (patch: Partial<ThemeManifest['installer']>) => {
    setActiveTheme((prev) => ({
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
  }

  // Create a brand new theme
  const handleCreateNewTheme = () => {
    const newTheme: ThemeManifest = {
      ...JSON.parse(JSON.stringify(EMPTY_THEME_MANIFEST)),
      metadata: {
        ...EMPTY_THEME_MANIFEST.metadata,
        id: '',
        name: '',
        version: '1.0.0',
        description: '',
        author: { name: '' },
        createdDate: new Date().toISOString(),
        tags: [],
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
        static: { assetPath: '', fit: 'fill' },
        slideshow: { slides: [], intervalSeconds: 60, shuffle: true },
      },
      cursors: { roles: {}, files: {} },
      sounds: { events: {}, files: {} },
      installer: {
        productName: '',
        artifactName: '',
        confirmationTitle: '',
        confirmationMessage: '',
      },
    }

    setActiveTheme(newTheme)
    setCurrentView('creator')
  }

  // Open an existing theme
  const handleOpenTheme = (theme: ThemeManifest) => {
    setActiveTheme(JSON.parse(JSON.stringify(theme)))
    setCurrentView('creator')
  }

  // Duplicate an existing theme
  const handleDuplicateTheme = (theme: ThemeManifest) => {
    const duplicated: ThemeManifest = {
      ...JSON.parse(JSON.stringify(theme)),
      metadata: {
        ...theme.metadata,
        id: `${theme.metadata.id || 'theme'}-copy-${Date.now().toString(36).slice(0, 4)}`,
        name: `${theme.metadata.name} (Copy)`,
      },
    }
    const updated = [duplicated, ...themes]
    saveThemesToStorage(updated)
  }

  // Delete a theme
  const handleDeleteTheme = (themeId: string) => {
    const updated = themes.filter((t) => t.metadata.id !== themeId)
    saveThemesToStorage(updated)
    if (activeTheme.metadata.id === themeId && updated.length > 0) {
      setActiveTheme(updated[0])
    }
  }

  // Save current theme back to list
  const handleSaveActiveTheme = () => {
    if (!activeTheme.metadata.name?.trim()) return
    const id = activeTheme.metadata.id?.trim() || activeTheme.metadata.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    const themeToSave: ThemeManifest = {
      ...activeTheme,
      metadata: {
        ...activeTheme.metadata,
        id,
      },
      installer: {
        productName: activeTheme.installer?.productName || activeTheme.metadata.name,
        artifactName: activeTheme.installer?.artifactName || `${id}.exe`,
        confirmationTitle: activeTheme.installer?.confirmationTitle || 'Install theme',
        confirmationMessage: activeTheme.installer?.confirmationMessage || `Install theme ${activeTheme.metadata.name}?`,
      },
    }
    const updated = themes.map((t) =>
      t.metadata.id === themeToSave.metadata.id ? themeToSave : t
    )
    if (!updated.some((t) => t.metadata.id === themeToSave.metadata.id)) {
      updated.unshift(themeToSave)
    }
    saveThemesToStorage(updated)
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 select-none">
      {currentView === 'projects' ? (
        <AdyberHome
          themes={themes}
          onOpenTheme={handleOpenTheme}
          onCreateNewTheme={handleCreateNewTheme}
          onDeleteTheme={handleDeleteTheme}
          onDuplicateTheme={handleDuplicateTheme}
        />
      ) : (
        <ThemeCreator
          theme={activeTheme}
          validation={validation}
          updateMetadata={updateMetadata}
          updateAppearance={updateAppearance}
          updateWallpaper={updateWallpaper}
          updateCursors={updateCursors}
          updateSounds={updateSounds}
          updateInstaller={updateInstaller}
          onBackToHome={() => {
            handleSaveActiveTheme()
            setCurrentView('projects')
          }}
          onOpenBuildModal={() => setIsBuildModalOpen(true)}
          onSave={handleSaveActiveTheme}
        />
      )}

      {/* Installer Build Modal */}
      <CreateInstallerModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        theme={activeTheme}
        validation={validation}
      />
    </div>
  )
}
