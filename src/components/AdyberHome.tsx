'use client'

import React, { useState, useEffect } from 'react'
import { ThemeManifest } from '../types/theme'
import { CURATED_PRESETS } from '../hooks/useThemeState'
import { AdyberHeader } from './AdyberHeader'
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Monitor,
  MousePointer,
  Volume2,
  Trash2,
  Copy,
  Download,
  ExternalLink,
} from 'lucide-react'

interface AdyberHomeProps {
  themes: ThemeManifest[];
  onOpenTheme: (theme: ThemeManifest) => void;
  onCreateNewTheme: () => void;
  onDeleteTheme?: (themeId: string) => void;
  onDuplicateTheme?: (theme: ThemeManifest) => void;
}

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  category: string;
  background: string;
  themePresetId: string;
}

const FEATURED_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'Storm Industrial',
    subtitle: 'Official Windows 11 Storm Slate (#4F585E) palette with deep graphite window accents and high-precision pointers',
    accent: '#4F585E',
    category: 'WINDOWS 11 OFFICIAL DWM',
    background: 'radial-gradient(ellipse at 80% 20%, rgba(79, 88, 94, 0.45) 0%, rgba(15, 20, 27, 0.95) 75%), linear-gradient(135deg, #1b2024 0%, #2b3338 50%, #11141a 100%)',
    themePresetId: 'storm-industrial',
  },
  {
    id: 'slide-2',
    title: 'Cyber Obsidian',
    subtitle: 'True black surfaces designed for OLED displays, developer terminals, and amber system telemetry',
    accent: '#2B3338',
    category: 'OLED HIGH CONTRAST',
    background: 'radial-gradient(ellipse at 70% 30%, rgba(217, 119, 6, 0.25) 0%, rgba(9, 10, 12, 0.98) 70%), linear-gradient(135deg, #090a0c 0%, #171a1d 50%, #000000 100%)',
    themePresetId: 'cyber-obsidian',
  },
  {
    id: 'slide-3',
    title: 'Nordic Glacier',
    subtitle: 'Frosted steel tones inspired by Scandinavian minimalist architecture with subtle glass reflection',
    accent: '#5A7384',
    category: 'MINIMALIST WORKSPACE',
    background: 'radial-gradient(ellipse at 75% 25%, rgba(90, 115, 132, 0.4) 0%, rgba(14, 20, 26, 0.95) 70%), linear-gradient(135deg, #0e141a 0%, #1f2b35 50%, #0a0d12 100%)',
    themePresetId: 'nordic-glacier',
  },
  {
    id: 'slide-4',
    title: 'Solaris Twilight',
    subtitle: 'Warm evening ambient lighting with matte carbon window frames and golden taskbar color prevalence',
    accent: '#D97706',
    category: 'WARM AMBIENT DUSK',
    background: 'radial-gradient(ellipse at 70% 30%, rgba(217, 119, 6, 0.35) 0%, rgba(18, 13, 8, 0.95) 75%), linear-gradient(135deg, #1f140a 0%, #2b1d10 50%, #0d0a07 100%)',
    themePresetId: 'amber-twilight',
  },
]

export const AdyberHome: React.FC<AdyberHomeProps> = ({
  themes,
  onOpenTheme,
  onCreateNewTheme,
  onDeleteTheme,
  onDuplicateTheme,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slideshow every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const activeSlide = FEATURED_SLIDES[currentSlide]

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length)
  }

  const handleExportJson = (theme: ThemeManifest, e: React.MouseEvent) => {
    e.stopPropagation()
    const jsonStr = JSON.stringify(theme, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.metadata.id || 'theme'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col pb-28 relative">
      {/* Top Header matching Google Flow header style without word Flow */}
      <AdyberHeader />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-8 py-6 space-y-10">
        {/* Rectangular Rounded Corner Background Slideshow Banner */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.1] shadow-2xl transition-all duration-700 min-h-[300px] sm:min-h-[380px] flex flex-col justify-between p-6 sm:p-12">
          {/* Slide Background */}
          <div
            className="absolute inset-0 transition-all duration-700 bg-cover bg-center"
            style={{ background: activeSlide.background }}
          />

          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Slide Content Top: Category & Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-md">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activeSlide.accent }}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {activeSlide.category}
              </span>
            </div>

            {/* Slide Navigation Arrows */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
              <button
                onClick={handlePrevSlide}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
                title="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
                title="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Slide Content Middle: Title & Subtitle */}
          <div className="relative z-10 max-w-2xl space-y-3 py-6">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {activeSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {activeSlide.subtitle}
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  const match = themes.find((t) => t.metadata.id === activeSlide.themePresetId)
                  if (match) {
                    onOpenTheme(match)
                  } else {
                    const preset = CURATED_PRESETS.find((p) => p.id === activeSlide.themePresetId)
                    if (preset) {
                      onOpenTheme(JSON.parse(JSON.stringify(preset.manifest)))
                    } else {
                      onCreateNewTheme()
                    }
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow-lg active:scale-95"
              >
                <span>Open in Theme Creator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Slide Content Bottom: Indicators */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              {FEATURED_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="font-mono text-[11px] text-slate-400">
              {currentSlide + 1} / {FEATURED_SLIDES.length}
            </span>
          </div>
        </section>

        {/* Project Cards Section (Only displayed when themes exist) */}
        {themes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Theme Projects
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any theme to open it in the full-screen theme creator.
                </p>
              </div>

              <span className="font-mono text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {themes.length} Project{themes.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Grid of Theme Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {themes.map((theme) => {
              const accent = theme.appearance.accentColor || '#4F585E'
              const userWallpaper =
                theme.wallpaper.mode === 'slideshow'
                  ? theme.wallpaper.slideshow?.slides[0]?.assetPath
                  : theme.wallpaper.static?.assetPath

              const cursorsCount = Object.values(theme.cursors.roles || {}).filter(Boolean).length
              const soundsCount = Object.values(theme.sounds.events || {}).filter(Boolean).length

              return (
                <div
                  key={theme.metadata.id || theme.metadata.name}
                  onClick={() => onOpenTheme(theme)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e14] overflow-hidden hover:border-white/25 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Card Thumbnail Image */}
                  <div
                    className="relative h-44 w-full bg-cover bg-center overflow-hidden border-b border-white/[0.06] flex flex-col justify-between p-3"
                    style={{
                      backgroundColor: '#12161f',
                      backgroundImage: userWallpaper
                        ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${userWallpaper}')`
                        : `radial-gradient(ellipse at 50% 30%, ${accent}55, #080a0f)`,
                    }}
                  >
                    {/* Top Row: Accent Swatch & Version */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-white border border-white/15">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <span>{accent}</span>
                      </span>

                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/15">
                        v{theme.metadata.version || '1.0.0'}
                      </span>
                    </div>

                    {/* Bottom Row: Hover Prompt */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow">
                        <span>Edit Theme</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-white group-hover:text-slate-100 transition truncate">
                        {theme.metadata.name || 'Untitled Theme'}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {theme.metadata.description || 'Custom Windows desktop theme configuration.'}
                      </p>
                    </div>

                    {/* Component Specs Chips */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3 text-slate-400" />
                          <span className="capitalize">{theme.wallpaper.mode}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3 text-slate-400" />
                          <span>{cursorsCount}/17</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Volume2 className="h-3 w-3 text-slate-400" />
                          <span>{soundsCount}/7</span>
                        </span>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleExportJson(theme, e)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
                          title="Export theme.json"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        {onDuplicateTheme && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDuplicateTheme(theme)
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Duplicate Theme"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                        {onDeleteTheme && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteTheme(theme.metadata.id)
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Theme"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
      </main>

      {/* FIXED BOTTOM-CENTER "CREATE THEME" BUTTON */}
      {/* "At the bottom center there should be a new project button, which remains in its place even after scrolling, resizing the page, or zooming. It should remain exactly the same." */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={onCreateNewTheme}
          className="group flex items-center gap-2.5 rounded-full bg-white text-slate-950 px-6 py-3.5 text-xs font-bold shadow-2xl hover:bg-slate-100 active:scale-95 transition-all duration-200 border border-white/20 ring-4 ring-black/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
          aria-label="Create New Theme"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white group-hover:scale-105 transition-transform">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span className="tracking-wide">Create Theme</span>
        </button>
      </div>
    </div>
  )
}
