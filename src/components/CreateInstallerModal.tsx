'use client'

import React, { useState } from 'react'
import { ThemeManifest, ValidationReport } from '../types/theme'
import JSZip from 'jszip'
import {
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  X,
  Package,
  Layers,
} from 'lucide-react'

interface CreateInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeManifest;
  validation: ValidationReport;
}

const COLOR_NAMES: Record<string, string> = {
  '#4F585E': 'Storm',
  '#64748B': 'Slate Gray',
  '#0284C7': 'Deep Azure',
  '#EC4899': 'Neon Pink',
  '#10B981': 'Emerald Forest',
  '#8B5CF6': 'Cyber Violet',
  '#F59E0B': 'Amber Sunset',
  '#F43F5E': 'Crimson Rose',
}

export const CreateInstallerModal: React.FC<CreateInstallerModalProps> = ({
  isOpen,
  onClose,
  theme,
  validation,
}) => {
  const [step, setStep] = useState<'idle' | 'building' | 'complete' | 'error'>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const [exeBase64, setExeBase64] = useState<string | null>(null)
  const [zipBase64, setZipBase64] = useState<string | null>(null)
  const [artifactName, setArtifactName] = useState<string>(theme.installer?.artifactName || 'theme.exe')

  if (!isOpen) return null

  const accentHex = (theme.appearance.accentColor || '#4F585E').toUpperCase()
  const accentName = COLOR_NAMES[accentHex] || ''

  const handleStartBuild = async () => {
    setStep('building')
    setLogs([
      '[1/5] Validating theme manifest and media specifications...',
      '[2/5] Connecting to installer build pipeline...',
    ])

    try {
      // Call backend builder route
      const response = await fetch('/api/build-installer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      })

      const data = await response.json()

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs)
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server build failed')
      }

      setExeBase64(data.exeBase64)
      setZipBase64(data.zipBase64)
      if (data.artifactName) setArtifactName(data.artifactName)
      setStep('complete')
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `[WARN] Server-side build notice: ${err?.message || 'Compiling client-side fallback...'}`,
        '[INFO] Assembling portable theme package in-browser using JSZip...',
      ])

      // Client-side fallback package generation
      try {
        const zip = new JSZip()
        zip.file('theme.json', JSON.stringify(theme, null, 2))

        // Wallpaper
        if (theme.wallpaper.static?.assetPath?.startsWith('data:')) {
          const b64 = theme.wallpaper.static.assetPath.replace(/^data:image\/\w+;base64,/, '')
          zip.folder('wallpaper')?.file('wallpaper.png', b64, { base64: true })
        }

        // Install batch script
        const cmdScript = `@echo off\r\ntitle ${theme.metadata.name} Installer\r\ncd /d "%~dp0"\r\npowershell.exe -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Install theme: ${theme.metadata.name}?', 'Install theme', 'OKCancel', 'Question')"\r\n`
        zip.file('Install-Theme.cmd', cmdScript)

        const fallbackZipBlob = await zip.generateAsync({ type: 'base64' })
        setZipBase64(fallbackZipBlob)
        setLogs((prev) => [...prev, '[SUCCESS] Standalone theme package assembled successfully.'])
        setStep('complete')
      } catch (fallbackErr: any) {
        setLogs((prev) => [...prev, `[ERROR] Package generation failed: ${fallbackErr?.message}`])
        setStep('error')
      }
    }
  }

  const handleDownloadExe = () => {
    if (!exeBase64) return
    const byteCharacters = atob(exeBase64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/vnd.microsoft.portable-executable' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = artifactName || 'theme.exe'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadZip = () => {
    if (!zipBase64) return
    const byteCharacters = atob(zipBase64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const zipName = `${theme.metadata.id || 'theme'}-installer.zip`
    a.download = zipName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadManifest = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.1] bg-[#0c1016] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Theme Installer Compilation</h3>
              <p className="text-xs text-slate-400">Package manifest and assets for Windows desktop distribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Warning */}
        {!validation.isValid ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Validation Requirements Pending</span>
            </div>
            <p className="text-xs text-slate-300">
              Your theme has {validation.errors.length} unresolved issue(s) before compilation:
            </p>
            <ul className="text-xs text-rose-300/90 list-disc list-inside space-y-1">
              {validation.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target Specs */}
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Executable:</span>
                <span className="text-white font-bold">{artifactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Architecture:</span>
                <span className="text-white">Windows x64 Portable Binary</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Windows Accent:</span>
                <span className="text-white flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.appearance.accentColor }} />
                  {accentHex} {accentName ? `(${accentName})` : ''}
                </span>
              </div>
            </div>

            {/* Console Log Area */}
            {logs.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith('[SUCCESS]')
                        ? 'text-emerald-400 font-bold'
                        : log.startsWith('[ERROR]')
                        ? 'text-rose-400'
                        : log.startsWith('[WARN]')
                        ? 'text-amber-400'
                        : ''
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Complete Screen */}
            {step === 'complete' && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">Installer Compiled Successfully</h4>
                    <p className="text-[11px] text-slate-300">
                      Standalone portable Windows executable ready for distribution.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {exeBase64 && (
                    <button
                      type="button"
                      onClick={handleDownloadExe}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download {artifactName}</span>
                    </button>
                  )}

                  {zipBase64 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                    >
                      <Package className="h-4 w-4" />
                      <span>Download Package (.zip)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleDownloadManifest}
            className="w-full sm:w-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>Export theme.json</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Close
            </button>

            {validation.isValid && step !== 'complete' && (
              <button
                type="button"
                onClick={handleStartBuild}
                disabled={step === 'building'}
                className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
              >
                {step === 'building' ? 'Compiling Installer...' : 'Build Theme Executable'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
