'use client'

import React, { useRef, useState } from 'react'
import { ThemeManifest, WallpaperMode, WallpaperSlide } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface WallpaperPanelProps {
  theme: ThemeManifest;
  updateWallpaper: (patch: Partial<ThemeManifest['wallpaper']>) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
  isCurrentStepValid: boolean;
}

export const WallpaperPanel: React.FC<WallpaperPanelProps> = ({
  theme,
  updateWallpaper,
  onGoToNext,
  onGoToPrev,
  isCurrentStepValid,
}) => {
  const currentMode = theme.wallpaper.mode || 'static'
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const staticInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = (mode: WallpaperMode) => {
    updateWallpaper({ mode })
    setUploadError(null)
  }

  // Pure File Upload Handler for Static Wallpaper
  const processImageFile = (file: File) => {
    setUploadError(null)

    // Check if valid image
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
      setUploadError(`File "${file.name}" is not a recognized image format. Please select a JPG, PNG, WEBP, or BMP.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (!dataUrl) {
        setUploadError('Failed to read image data.')
        return
      }

      updateWallpaper({
        static: {
          assetPath: dataUrl,
          fit: theme.wallpaper.static?.fit || 'fill',
        },
      })
    }

    reader.onerror = () => {
      setUploadError('Error occurred while reading the image file.')
    }

    reader.readAsDataURL(file)
  }

  const handleStaticFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
    // Clear value so user can re-upload same file if they removed it
    e.target.value = ''
  }

  const handleRemoveStatic = () => {
    updateWallpaper({
      static: {
        assetPath: '',
        fit: theme.wallpaper.static?.fit || 'fill',
      },
    })
    setUploadError(null)
  }

  // Slideshow Handlers
  const handleAddSlide = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
      setUploadError(`File "${file.name}" is not an image format.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const currentSlides = theme.wallpaper.slideshow?.slides || []
      const newSlide: WallpaperSlide = {
        order: currentSlides.length + 1,
        assetPath: dataUrl,
        name: file.name,
      }

      updateWallpaper({
        slideshow: {
          slides: [...currentSlides, newSlide],
          intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
          shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
        },
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveSlide = (order: number) => {
    const currentSlides = theme.wallpaper.slideshow?.slides || []
    const filtered = currentSlides.filter((s) => s.order !== order)
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }))

    updateWallpaper({
      slideshow: {
        slides: reordered,
        intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
        shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
      },
    })
  }

  const staticAsset = theme.wallpaper.static?.assetPath
  const slideshowSlides = theme.wallpaper.slideshow?.slides || []

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 2 OF 8
          </span>
          <span className="text-xs text-slate-400">Desktop Background</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Wallpaper Configuration</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload real image files from your computer. Link/URL inputs are disabled to ensure all wallpaper assets package reliably into the offline installer.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Wallpaper Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleModeChange('static')}
            className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs font-bold transition border ${
              currentMode === 'static'
                ? 'border-sky-500 bg-sky-500/10 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                : 'border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>🖼️</span>
            <span>Static Wallpaper</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('slideshow')}
            className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs font-bold transition border ${
              currentMode === 'slideshow'
                ? 'border-sky-500 bg-sky-500/10 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                : 'border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>🎞️</span>
            <span>Wallpaper Slideshow</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('video')}
            className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs font-bold transition border ${
              currentMode === 'video'
                ? 'border-pink-500 bg-pink-500/10 text-white shadow-lg shadow-pink-500/10'
                : 'border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>🎬</span>
            <span>Video Wallpaper</span>
            <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[9px] font-bold text-pink-400 border border-pink-500/40">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Static Mode Upload */}
      {currentMode === 'static' && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Static Wallpaper Image *
            </label>
            {staticAsset && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <span>✓</span> Image Uploaded
              </span>
            )}
          </div>

          <input
            id="static-wallpaper-file-input"
            ref={staticInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.bmp"
            onChange={handleStaticFileChange}
            className="hidden"
          />

          {!staticAsset ? (
            <label
              htmlFor="static-wallpaper-file-input"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) processImageFile(file)
              }}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer group select-none ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-white/20 bg-black/40 hover:border-sky-400 hover:bg-sky-500/5'
              }`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition transform">🖼️</span>
              <p className="text-sm font-bold text-white">Click to browse or drag & drop wallpaper image</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP, BMP. Recommended: 1920×1080 or 4K.</p>
              <span className="mt-4 rounded-xl bg-sky-500/20 border border-sky-500/40 px-4 py-2 text-xs font-bold text-sky-300 group-hover:bg-sky-500 group-hover:text-white transition">
                Browse Image File
              </span>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 h-72 bg-black/60 flex items-center justify-center shadow-xl">
                <img
                  src={staticAsset}
                  alt="Uploaded wallpaper preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <label
                    htmlFor="static-wallpaper-file-input"
                    className="cursor-pointer rounded-lg bg-black/80 backdrop-blur border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition shadow"
                  >
                    Replace Image
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveStatic}
                    className="rounded-lg bg-rose-500/85 backdrop-blur px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Wallpaper Display Fit Mode</label>
                <select
                  value={theme.wallpaper.static?.fit || 'fill'}
                  onChange={(e) =>
                    updateWallpaper({
                      static: {
                        assetPath: staticAsset,
                        fit: e.target.value as any,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="fill">Fill Screen (Recommended)</option>
                  <option value="fit">Fit Screen (Letterbox)</option>
                  <option value="stretch">Stretch to Fit</option>
                  <option value="center">Center (Actual Size)</option>
                  <option value="tile">Tile Across Screen</option>
                  <option value="span">Span Multiple Monitors</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slideshow Mode Upload */}
      {currentMode === 'slideshow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
              <label htmlFor="slide-duration" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Rotation Interval (Seconds)
              </label>
              <input
                id="slide-duration"
                type="number"
                min={10}
                max={86400}
                value={theme.wallpaper.slideshow?.intervalSeconds || 60}
                onChange={(e) =>
                  updateWallpaper({
                    slideshow: {
                      slides: theme.wallpaper.slideshow?.slides || [],
                      intervalSeconds: Math.max(10, parseInt(e.target.value, 10) || 10),
                      shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
                    },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Windows switches slides at this interval (minimum 10s).</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Shuffle Sequence
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">Randomize wallpaper order in Windows</p>
              </div>
              <input
                type="checkbox"
                checked={theme.wallpaper.slideshow?.shuffle ?? true}
                onChange={(e) =>
                  updateWallpaper({
                    slideshow: {
                      slides: theme.wallpaper.slideshow?.slides || [],
                      intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
                      shuffle: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded border-white/20 bg-black/40 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Slides List & Upload */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Slideshow Wallpapers ({slideshowSlides.length} slide{slideshowSlides.length === 1 ? '' : 's'})
              </span>
              <span className="text-xs text-slate-400">Minimum 2 slides required</span>
            </div>

            {/* Hidden Input for Adding Slides */}
            <input
              id="add-slideshow-file-input"
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.bmp"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                files.forEach((f) => handleAddSlide(f))
                e.target.value = ''
              }}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slideshowSlides.map((slide) => (
                <div
                  key={slide.order}
                  className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400">Slide #{slide.order}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(slide.order)}
                      className="text-slate-400 hover:text-rose-400 transition"
                      title="Remove slide"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="relative h-32 rounded-xl overflow-hidden border border-white/15 bg-black/80">
                    <img
                      src={slide.assetPath}
                      alt={`Slide ${slide.order}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{slide.name || `Slide ${slide.order}`}</p>
                </div>
              ))}

              {/* Add Slide Card */}
              <label
                htmlFor="add-slideshow-file-input"
                className="flex flex-col items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-sky-400 hover:bg-sky-500/5 transition cursor-pointer p-4 text-center group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition transform">➕</span>
                <span className="text-xs font-bold text-white">Add Wallpaper Slide</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Click to browse multiple images</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Video Mode Banner */}
      {currentMode === 'video' && (
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-8 text-center space-y-3">
          <span className="text-4xl">🎬</span>
          <h3 className="text-lg font-bold text-white">Video Wallpaper Support Coming Soon</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Direct MP4 and WebM video desktop wallpaper playback is scheduled for an upcoming release. Video themes cannot be packaged into an installer yet.
          </p>
          <button
            type="button"
            onClick={() => handleModeChange('static')}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
          >
            Switch to Static Wallpaper
          </button>
        </div>
      )}

      {/* Wizard Step Footer */}
      <WizardStepFooter
        activeSection="wallpaper"
        currentStepIndex={1}
        highestStepReached={2}
        isCurrentStepValid={isCurrentStepValid}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Cursors"
        validationErrorHint={
          !isCurrentStepValid
            ? currentMode === 'slideshow'
              ? 'Please upload at least 2 slide images for the slideshow.'
              : 'Please upload a wallpaper image to proceed.'
            : undefined
        }
      />
    </div>
  )
}
