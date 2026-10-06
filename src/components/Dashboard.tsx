'use client'

import React, { useRef } from 'react'
import { ThemeManifest, ValidationReport } from '../types/theme'
import { ThemePreset, CURATED_PRESETS } from '../hooks/useThemeState'
import {
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Sliders,
  Monitor,
  MousePointer,
  Volume2,
  Palette,
  FileJson,
  Upload,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu,
  Sparkles,
  Check,
} from 'lucide-react'

interface DashboardProps {
  currentTheme: ThemeManifest;
  onOpenWorkspace: () => void;
  onCreateNewTheme: () => void;
  onLoadPreset?: (preset: ThemePreset) => void;
  validation?: ValidationReport;
  onImportManifest?: (manifest: ThemeManifest) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentTheme,
  onOpenWorkspace,
  onCreateNewTheme,
  onLoadPreset,
  validation,
  onImportManifest,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (json && json.metadata && json.appearance) {
          onImportManifest?.(json)
          onOpenWorkspace()
        }
      } catch (err) {
        console.error('Failed to parse manifest JSON:', err)
      }
    }
    reader.readAsText(file)
  }

  const configuredCursorsCount = Object.values(currentTheme.cursors?.roles || {}).filter(Boolean).length
  const configuredSoundsCount = Object.values(currentTheme.sounds?.events || {}).filter(Boolean).length
  const accentColor = currentTheme.appearance.accentColor || '#4F585E'
  const isDark = currentTheme.appearance.colorMode !== 'light'

  const activeWallpaper =
    currentTheme.wallpaper.mode === 'slideshow'
      ? currentTheme.wallpaper.slideshow?.slides[0]?.assetPath
      : currentTheme.wallpaper.static?.assetPath

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hidden file input for manifest import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Hero Command Console */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1319] p-8 sm:p-12 shadow-2xl">
        {/* Subtle engineering background grid and top storm lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f585e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 right-1/4 h-64 w-96 rounded-full bg-storm-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Win32 Engine & Electron Packaging System
            </span>
          </div>

          {/* Master Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Windows Desktop Theme & <br />
            <span className="text-slate-300">
              Executable Installer Studio
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Design native Windows desktop environments with high-resolution multi-slide wallpapers, custom animated pointers, system sound schemes, and Storm accent palettes. Package everything into a standalone, portable Windows installer in one click.
          </p>

          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onCreateNewTheme}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-slate-100 transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Theme</span>
            </button>

            <button
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-white hover:bg-white/[0.08] hover:border-white/20 transition active:scale-[0.98]"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Open Theme Workspace</span>
              {currentTheme.metadata.name && (
                <span className="ml-1 rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                  {currentTheme.metadata.name}
                </span>
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import theme.json</span>
            </button>
          </div>

          {/* System Spec Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.06]">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <MousePointer className="h-3 w-3 text-slate-400" />
                <span>Win32 Cursors</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">17 Pointer Roles (.ani / .cur)</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Volume2 className="h-3 w-3 text-slate-400" />
                <span>AppEvents Sound</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">PCM 16-Bit WAV Transcoding</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-slate-400" />
                <span>DWM Personalization</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">32-Byte ARGB Accent Palette</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <PackageCheck className="h-3 w-3 text-slate-400" />
                <span>Target Distribution</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">Portable x64 Executable (.exe)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jumpstart with Curated Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-400" />
              <span>Curated Theme Presets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a pre-configured Windows palette to jumpstart your design workspace instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURATED_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0f1319] p-5 hover:border-white/20 transition hover:shadow-lg"
            >
              <div className="space-y-3">
                {/* Visual Palette Preview Header */}
                <div
                  className="h-24 w-full rounded-lg border border-white/10 p-3 flex flex-col justify-between shadow-inner"
                  style={{ background: preset.previewWallpaperGradient }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-white/30 shadow"
                      style={{ backgroundColor: preset.accent }}
                    />
                    <span className="font-mono text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                      {preset.accent}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-200 bg-black/30 px-2 py-0.5 rounded w-fit backdrop-blur">
                    {preset.colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                </div>

                {/* Preset Metadata */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-slate-200 transition">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.tagline}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onLoadPreset?.(preset)
                  onOpenWorkspace()
                }}
                className="mt-4 flex items-center justify-between w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <span>Load & Customize</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Theme Draft & Desktop Live Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Draft Specs (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0f1319] p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Active Project
                </span>
                <h3 className="text-base font-bold text-white">
                  {currentTheme.metadata.name || 'Untitled Draft Theme'}
                </h3>
              </div>
              <span className="rounded bg-white/10 px-2.5 py-1 font-mono text-xs text-slate-300">
                v{currentTheme.metadata.version || '1.0.0'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {currentTheme.metadata.description ||
                'Configure your desktop theme elements, wallpaper assets, and sound scheme in the workspace.'}
            </p>

            {/* Configured Components Matrix */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Component Manifest
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Monitor className="h-3 w-3" />
                    <span>Wallpaper</span>
                  </div>
                  <div className="font-semibold text-slate-200 capitalize">
                    {currentTheme.wallpaper.mode} mode
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Palette className="h-3 w-3" />
                    <span>DWM Accent</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span>{accentColor}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <MousePointer className="h-3 w-3" />
                    <span>Custom Cursors</span>
                  </div>
                  <div className="font-semibold text-slate-200">
                    {configuredCursorsCount} of 17 mapped
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Volume2 className="h-3 w-3" />
                    <span>Sound Events</span>
                  </div>
                  <div className="font-semibold text-slate-200">
                    {configuredSoundsCount} of 7 mapped
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-Flight Health Check */}
            {validation && (
              <div
                className={`rounded-xl border p-3.5 flex items-center justify-between text-xs ${
                  validation.isValid
                    ? 'border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400'
                    : 'border-amber-500/20 bg-amber-500/[0.04] text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {validation.isValid
                      ? 'Pre-flight validation passed. Ready to package.'
                      : `${validation.errors.length} requirement(s) pending for build.`}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-2">
            <button
              onClick={onOpenWorkspace}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition"
            >
              <span>Edit in Studio Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Live Windows 11 Desktop Sandbox (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0f1319] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="h-4 w-4 text-slate-400" />
                <span>Simulated Windows 11 Environment</span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time visual simulation of active accent color and desktop styling.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">DWM 60 FPS</span>
          </div>

          {/* Desktop Canvas */}
          <div
            className="relative h-72 sm:h-80 w-full rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between bg-cover bg-center"
            style={{
              backgroundColor: '#11161d',
              backgroundImage: activeWallpaper
                ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('${activeWallpaper}')`
                : `radial-gradient(ellipse at 50% 20%, ${accentColor}44, #0b0e14)`,
            }}
          >
            {/* Desktop Icons Sandbox */}
            <div className="p-4 space-y-3">
              <div className="w-14 rounded-lg p-1.5 text-center hover:bg-white/10 transition cursor-default">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 border border-white/15 text-slate-200">
                  <Terminal className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-white/90 drop-shadow truncate block mt-1">Terminal</span>
              </div>
            </div>

            {/* Simulated Fluent App Window */}
            <div
              className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 max-w-md rounded-xl border shadow-2xl overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: isDark ? 'rgba(15, 20, 27, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: currentTheme.appearance.colorPrevalence ? accentColor : 'rgba(255,255,255,0.15)',
              }}
            >
              {/* Window Title Bar */}
              <div
                className="h-8 px-3 flex items-center justify-between text-xs font-semibold"
                style={{
                  backgroundColor: currentTheme.appearance.colorPrevalence ? accentColor : isDark ? '#1a222d' : '#e2e8f0',
                  color: currentTheme.appearance.colorPrevalence ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                <div className="flex items-center gap-2 text-[11px] truncate">
                  <Cpu className="h-3 w-3" />
                  <span>{currentTheme.metadata.name || 'Windows Application'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                  <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                  <span className="h-2 w-2 rounded-full bg-slate-400/80" />
                </div>
              </div>

              {/* Window Body */}
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Active Windows DWM Accent</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    {accentColor}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Windows title bars and system accents will reflect this configured hex value.
                </p>
              </div>
            </div>

            {/* Windows 11 Centered Taskbar */}
            <div className="h-10 border-t border-white/10 bg-black/60 backdrop-blur-md px-4 flex items-center justify-between text-xs">
              <div className="w-16" />
              {/* Centered Icons */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer">
                  <div className="grid grid-cols-2 gap-0.5">
                    <span className="h-1.5 w-1.5 bg-blue-400 rounded-sm" />
                    <span className="h-1.5 w-1.5 bg-blue-400 rounded-sm" />
                    <span className="h-1.5 w-1.5 bg-blue-400 rounded-sm" />
                    <span className="h-1.5 w-1.5 bg-blue-400 rounded-sm" />
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
                  <Sliders className="h-3.5 w-3.5" />
                </div>
                <div className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
                  <Terminal className="h-3.5 w-3.5" />
                </div>
              </div>
              {/* System Tray Time */}
              <div className="font-mono text-[10px] text-slate-400">11:11 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Pipeline Architecture Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">System Architecture & Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation between web authoring and privileged local Windows installer execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#0f1319] p-5 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                1. Creator Studio (Web)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Design themes visually in the browser. Manage wallpapers, cursors, sounds, and DWM Storm colors without modifying host settings.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0f1319] p-5 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                2. Pre-Flight Validator
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated schema validation verifies cursor headers, slideshow timing intervals (min 10s), and audio formats before packaging.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0f1319] p-5 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                3. Installer Generation
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Theme manifest and media assets are assembled into a portable Electron Windows installer (<code className="text-slate-300 font-mono">theme.exe</code>).
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0f1319] p-5 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                4. Win32 Application
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                End users run the lightweight executable, view the consent dialog, and apply wallpapers, cursors, and sounds to Windows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
