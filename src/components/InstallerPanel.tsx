'use client'

import React from 'react'
import { ThemeManifest } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface InstallerPanelProps {
  theme: ThemeManifest;
  updateInstaller: (patch: Partial<ThemeManifest['installer']>) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
}

export const InstallerPanel: React.FC<InstallerPanelProps> = ({
  theme,
  updateInstaller,
  onGoToNext,
  onGoToPrev,
}) => {
  const installer = theme.installer || {
    productName: 'theme',
    artifactName: 'theme.exe',
    confirmationTitle: 'Install theme',
    confirmationMessage: 'Install theme?',
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 7 OF 8
          </span>
          <span className="text-xs text-slate-400">Binary Packaging</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Installer Packaging Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure executable filenames, dialog messages, and the one-click end-user experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="artifact-name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Output Executable Name
          </label>
          <input
            id="artifact-name"
            type="text"
            value={installer.artifactName}
            onChange={(e) => updateInstaller({ artifactName: e.target.value })}
            placeholder="theme.exe"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Default executable filename generated for download (e.g. theme.exe).</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Product Identifier
          </label>
          <input
            id="product-name"
            type="text"
            value={installer.productName}
            onChange={(e) => updateInstaller({ productName: e.target.value })}
            placeholder="theme"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Used by electron-builder for Windows process metadata.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="dialog-title" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Confirmation Dialog Title
          </label>
          <input
            id="dialog-title"
            type="text"
            value={installer.confirmationTitle || 'Install theme'}
            onChange={(e) => updateInstaller({ confirmationTitle: e.target.value })}
            placeholder="Install theme"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Title of the native Windows confirmation popup.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="dialog-message" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Confirmation Prompt Message
          </label>
          <input
            id="dialog-message"
            type="text"
            value={installer.confirmationMessage || 'Install theme?'}
            onChange={(e) => updateInstaller({ confirmationMessage: e.target.value })}
            placeholder="Install theme?"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Message presented above the [Install] and [Cancel] buttons.</p>
        </div>

        {/* End user simulation card */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h4 className="text-sm font-bold text-white">End-User Installation Flow Simulation</h4>
          <div className="max-w-md mx-auto rounded-2xl border border-white/20 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❓</span>
              <div>
                <h5 className="text-sm font-bold text-white">{installer.confirmationTitle || 'Install theme'}</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  {installer.confirmationMessage || 'Install theme?'} ({theme.metadata.name || 'Theme'} by {theme.metadata.author?.name || 'Creator'})
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-400 transition"
              >
                Install
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">
            Clicking <strong className="text-white">Install</strong> extracts assets to <code className="text-sky-300">%LOCALAPPDATA%\Themes\</code> and applies Windows wallpaper, cursors, sounds, and Storm accent color.
          </p>
        </div>
      </div>

      {/* Step Wizard Footer */}
      <WizardStepFooter
        activeSection="installer"
        currentStepIndex={6}
        highestStepReached={7}
        isCurrentStepValid={true}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Preview & Build"
      />
    </div>
  )
}
