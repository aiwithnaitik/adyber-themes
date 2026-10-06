'use client'

import React from 'react'
import { ThemeManifest } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface AppearancePanelProps {
  theme: ThemeManifest;
  updateAppearance: (patch: Partial<ThemeManifest['appearance']>) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
}

interface ColorPreset {
  name: string;
  hex: string;
  badge?: string;
}

const ACCENT_PRESETS: ColorPreset[] = [
  { name: 'Storm', hex: '#4F585E', badge: 'Windows Storm' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Deep Azure', hex: '#0284C7' },
  { name: 'Neon Pink', hex: '#EC4899' },
  { name: 'Emerald Forest', hex: '#10B981' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Amber Sunset', hex: '#F59E0B' },
  { name: 'Crimson Rose', hex: '#F43F5E' },
]

export const AppearancePanel: React.FC<AppearancePanelProps> = ({
  theme,
  updateAppearance,
  onGoToNext,
  onGoToPrev,
}) => {
  const currentAccent = theme.appearance.accentColor || '#4F585E'
  const currentWindowColor = theme.appearance.windowColor || currentAccent

  // Calculate 8-shade AccentPalette for Windows registry
  const generateShades = (hex: string) => {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.slice(0, 2), 16) || 79
    const g = parseInt(cleanHex.slice(2, 4), 16) || 88
    const b = parseInt(cleanHex.slice(4, 6), 16) || 94

    const shades = []
    for (let i = 0; i < 8; i++) {
      const factor = 1.6 - i * 0.16
      const sr = Math.min(255, Math.max(0, Math.round(r * factor)))
      const sg = Math.min(255, Math.max(0, Math.round(g * factor)))
      const sb = Math.min(255, Math.max(0, Math.round(b * factor)))
      shades.push(`rgb(${sr}, ${sg}, ${sb})`)
    }
    return shades
  }

  const shades = generateShades(currentAccent)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 5 OF 8
          </span>
          <span className="text-xs text-slate-400">Visual Styling</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Appearance & Color System</h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize Windows DWM accent colors, system-wide dark mode, and window frame colorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Mode */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            System Color Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateAppearance({ colorMode: 'dark' })}
              className={`rounded-xl py-3 text-xs font-bold transition border ${
                theme.appearance.colorMode === 'dark'
                  ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30'
                  : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
              }`}
            >
              🌙 Dark Mode
            </button>
            <button
              type="button"
              onClick={() => updateAppearance({ colorMode: 'light' })}
              className={`rounded-xl py-3 text-xs font-bold transition border ${
                theme.appearance.colorMode === 'light'
                  ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30'
                  : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
              }`}
            >
              ☀️ Light Mode
            </button>
            <button
              type="button"
              onClick={() => updateAppearance({ colorMode: 'system' })}
              className={`rounded-xl py-3 text-xs font-bold transition border ${
                theme.appearance.colorMode === 'system'
                  ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30'
                  : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
              }`}
            >
              ⚙️ Auto (System)
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Dark mode sets AppsUseLightTheme = 0 and SystemUsesLightTheme = 0 in Windows Personalization.
          </p>
        </div>

        {/* Windows Accent Color */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="accent-color" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Windows Accent Color *
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">
              {currentAccent.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              id="accent-color-picker"
              value={currentAccent.startsWith('#') && currentAccent.length === 7 ? currentAccent : '#4F585E'}
              onChange={(e) => updateAppearance({ accentColor: e.target.value.toUpperCase() })}
              className="h-10 w-12 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
            />
            <input
              type="text"
              id="accent-color"
              value={currentAccent}
              onChange={(e) => updateAppearance({ accentColor: e.target.value.toUpperCase() })}
              placeholder="#4F585E"
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-2">Preset Accent Colors</span>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((p) => {
                const isSelected = currentAccent.toUpperCase() === p.hex.toUpperCase()
                return (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => updateAppearance({ accentColor: p.hex })}
                    style={{ backgroundColor: p.hex }}
                    className={`h-8 w-8 rounded-lg border-2 transition transform hover:scale-110 ${
                      isSelected ? 'border-white shadow-lg shadow-white/25 scale-105' : 'border-transparent'
                    }`}
                    title={`${p.name} (${p.hex})`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Window Border Color */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="window-color" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Window Border & Title Bar Color
            </label>
            <span className="text-xs font-mono font-bold text-slate-300">
              {currentWindowColor.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              id="window-color-picker"
              value={currentWindowColor.startsWith('#') && currentWindowColor.length === 7 ? currentWindowColor : '#4F585E'}
              onChange={(e) => updateAppearance({ windowColor: e.target.value.toUpperCase() })}
              className="h-10 w-12 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
            />
            <input
              type="text"
              id="window-color"
              value={currentWindowColor}
              onChange={(e) => updateAppearance({ windowColor: e.target.value.toUpperCase() })}
              placeholder="#4F585E"
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Window frame colorization applied by Windows Desktop Window Manager (DWM).
          </p>
        </div>

        {/* Color Prevalence */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.appearance.colorPrevalence}
              onChange={(e) => updateAppearance({ colorPrevalence: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-black/40 text-sky-500 focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                Show Accent Color on Title Bars, Taskbar & Start Menu
              </span>
              <span className="text-[11px] text-slate-400">
                Sets ColorPrevalence = 1 in Windows registry.
              </span>
            </div>
          </label>
        </div>

        {/* 8-shade AccentPalette */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Generated Windows 32-Byte AccentPalette Spectrum
          </span>
          <p className="text-[11px] text-slate-400">
            Windows DWM automatically derives these 8 tonal shades for taskbar highlights, Start menu tiles, sliders, and borders.
          </p>

          <div className="grid grid-cols-8 gap-2 h-12 pt-2">
            {shades.map((shade, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: shade }}
                className={`rounded-lg flex items-end justify-center pb-1 text-[10px] font-bold ${
                  idx < 4 ? 'text-black' : 'text-white'
                } ${idx === 4 ? 'border-2 border-white shadow-md' : 'border border-white/10'}`}
              >
                #{idx}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wizard Step Footer */}
      <WizardStepFooter
        activeSection="appearance"
        currentStepIndex={4}
        highestStepReached={5}
        isCurrentStepValid={true}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Creator Info"
      />
    </div>
  )
}
