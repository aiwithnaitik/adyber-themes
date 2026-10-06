'use client'

import React from 'react'
import { ThemeManifest } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface PreviewPanelProps {
  theme: ThemeManifest;
  onGoToPrev?: () => void;
  onOpenBuildModal?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  theme,
  onGoToPrev,
  onOpenBuildModal,
}) => {
  const accent = theme.appearance.accentColor || '#4F585E'
  const isDark = theme.appearance.colorMode !== 'light'

  const userWallpaper =
    theme.wallpaper.mode === 'slideshow'
      ? theme.wallpaper.slideshow?.slides[0]?.assetPath
      : theme.wallpaper.static?.assetPath

  const configuredCursorsCount = Object.values(theme.cursors.roles || {}).filter(Boolean).length
  const configuredSoundsCount = Object.values(theme.sounds.events || {}).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            STEP 8 OF 8
          </span>
          <span className="text-xs text-slate-400">Final Verification</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Live Theme Preview & Packaging</h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulated Windows desktop previewing your wallpaper, DWM window accent colors, taskbar, and theme elements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desktop Screen Mockup */}
        <div
          className="lg:col-span-2 relative h-[420px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 bg-cover bg-center"
          style={{
            backgroundImage: userWallpaper
              ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${userWallpaper}')`
              : `radial-gradient(ellipse at top, ${accent}33, #0a0e14)`,
          }}
        >
          {!userWallpaper && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40">
              <span className="text-4xl mb-2">🖼️</span>
              <p className="text-xs text-slate-300 font-semibold">No wallpaper uploaded</p>
              <p className="text-[11px] text-slate-500">Upload an image in Step 2 to preview it here</p>
            </div>
          )}

          {/* Simulated App Window */}
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-4/5 h-64 rounded-2xl border shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            style={{
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              color: isDark ? '#f8fafc' : '#0f172a',
              borderColor: accent,
            }}
          >
            {/* Window Title Bar */}
            <div
              className="h-9 px-4 flex items-center justify-between text-xs font-bold"
              style={{
                backgroundColor: theme.appearance.colorPrevalence ? accent : isDark ? '#1e293b' : '#e2e8f0',
                color: theme.appearance.colorPrevalence ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="truncate">{theme.metadata.name || 'Sample Application'}</span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              </div>
            </div>

            {/* Window Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Personalization Active</h4>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow"
                    style={{ backgroundColor: accent }}
                  >
                    Accent Color
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Window borders, buttons, and system highlights are colorized by Windows Desktop Window Manager.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  style={{ backgroundColor: accent }}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow hover:opacity-90 transition"
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {/* Windows Taskbar */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-slate-950/85 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-3 px-4">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow cursor-pointer"
              style={{ backgroundColor: accent }}
            >
              🪟
            </div>
            <div className="h-5 w-[1px] bg-white/10" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white">
                📁
              </div>
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white">
                🌐
              </div>
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white">
                ⚙️
              </div>
            </div>
          </div>
        </div>

        {/* Details Summary Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <h4 className="text-sm font-bold text-white">Theme Manifest Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-white">{theme.metadata.name || 'Untitled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Creator:</span>
                <span className="text-white">{theme.metadata.author?.name || 'Unspecified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono text-slate-300">{theme.metadata.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode:</span>
                <span className="capitalize font-semibold text-white">{theme.wallpaper.mode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Accent:</span>
                <span className="flex items-center gap-1.5 font-mono text-white">
                  <span className="h-3 w-3 rounded" style={{ backgroundColor: accent }} />
                  {accent}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cursors:</span>
                <span className="text-white font-mono">{configuredCursorsCount} custom</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sounds:</span>
                <span className="text-white font-mono">{configuredSoundsCount} hook(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output:</span>
                <span className="font-mono text-sky-400">{theme.installer?.artifactName || 'theme.exe'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onOpenBuildModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition active:scale-95"
              >
                <span>🚀</span>
                <span>Build Theme Installer Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Wizard Footer */}
      {onGoToPrev && (
        <WizardStepFooter
          activeSection="preview"
          currentStepIndex={7}
          highestStepReached={8}
          isCurrentStepValid={true}
          onGoToStep={() => {}}
          onGoToNext={onOpenBuildModal || (() => {})}
          onGoToPrev={onGoToPrev}
        />
      )}
    </div>
  )
}
