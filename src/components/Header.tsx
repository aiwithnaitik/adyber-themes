'use client'

import React, { useRef, useState } from 'react'
import { ThemeManifest, ValidationReport } from '../types/theme'
import { ThemePreset, CURATED_PRESETS } from '../hooks/useThemeState'
import {
  Plus,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Upload,
  Download,
  Sparkles,
  ChevronDown,
  FileCode,
} from 'lucide-react'

interface HeaderProps {
  theme: ThemeManifest;
  validation: ValidationReport;
  onOpenBuildModal: () => void;
  onCreateNewTheme: () => void;
  onLoadPreset?: (preset: ThemePreset) => void;
  onImportManifest?: (manifest: ThemeManifest) => void;
  onOpenValidation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  validation,
  onOpenBuildModal,
  onCreateNewTheme,
  onLoadPreset,
  onImportManifest,
  onOpenValidation,
}) => {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
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
        }
      } catch (err) {
        console.error('Failed to parse manifest JSON:', err)
      }
    }
    reader.readAsText(file)
  }

  const handleExportJson = () => {
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

  const accentColor = theme.appearance.accentColor || '#4F585E'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090b0e]/95 backdrop-blur-xl">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Studio Title */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm">
            <div className="grid grid-cols-2 gap-0.5">
              <span className="h-1.5 w-1.5 rounded-sm bg-slate-200" />
              <span className="h-1.5 w-1.5 rounded-sm bg-slate-400" />
              <span className="h-1.5 w-1.5 rounded-sm bg-slate-400" />
              <span className="h-1.5 w-1.5 rounded-sm bg-slate-200" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                Windows Theme Studio
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/10">
                Creator Edition
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Theme:</span>
              <span className="font-semibold text-slate-200">
                {theme.metadata.name || 'Untitled Draft'}
              </span>
              <span className="font-mono text-slate-400">v{theme.metadata.version || '1.0.0'}</span>
              <span
                className="inline-block h-2 w-2 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: accentColor }}
                title={`Accent: ${accentColor}`}
              />
            </div>
          </div>
        </div>

        {/* Center Actions: Presets & Tools */}
        <div className="hidden md:flex items-center gap-2">
          {/* Preset Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPresetsOpen(!isPresetsOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              <span>Load Preset</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isPresetsOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-60 rounded-xl border border-white/10 bg-[#0f1319] p-2 shadow-2xl z-50 space-y-1"
                onMouseLeave={() => setIsPresetsOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Starter Templates
                </div>
                {CURATED_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onLoadPreset?.(p)
                      setIsPresetsOpen(false)
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{p.accent}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
            title="Import theme.json"
          >
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span>Import</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
            title="Export theme.json manifest"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {/* Validation Status Pill */}
          <button
            onClick={onOpenValidation}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              validation.isValid
                ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300 hover:bg-emerald-500/10'
                : 'border-amber-500/20 bg-amber-500/[0.06] text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            {validation.isValid ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ready to Build</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>{validation.errors.length} Issue(s)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCreateNewTheme}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Theme</span>
          </button>

          <button
            onClick={onOpenBuildModal}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition active:scale-[0.98] shadow-sm"
          >
            <PackageCheck className="h-4 w-4" />
            <span>Create Installer</span>
            {!validation.isValid && (
              <span className="flex h-4 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-[10px] font-mono text-rose-400 border border-rose-500/30">
                {validation.errors.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
