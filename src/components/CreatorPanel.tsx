'use client'

import React from 'react'
import { ThemeManifest } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface CreatorPanelProps {
  theme: ThemeManifest;
  updateMetadata: (patch: Partial<ThemeManifest['metadata']>) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
  isCurrentStepValid: boolean;
}

export const CreatorPanel: React.FC<CreatorPanelProps> = ({
  theme,
  updateMetadata,
  onGoToNext,
  onGoToPrev,
  isCurrentStepValid,
}) => {
  const author = theme.metadata.author || { name: '' }
  const iconData = theme.metadata.icon

  const handleIconUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      updateMetadata({ icon: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIcon = () => {
    updateMetadata({ icon: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 6 OF 8
          </span>
          <span className="text-xs text-slate-400">Author & Branding</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Creator Information & Branding</h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide creator details, attribution links, and upload an icon for the Windows installer executable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="creator-name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Creator / Author Name *
          </label>
          <input
            id="creator-name"
            type="text"
            value={author.name}
            onChange={(e) => updateMetadata({ author: { ...author, name: e.target.value } })}
            placeholder="e.g. Rox or Studio Name"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Displayed on the installer confirmation popup.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="creator-url" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Website or Portfolio URL
          </label>
          <input
            id="creator-url"
            type="text"
            value={author.url || ''}
            onChange={(e) => updateMetadata({ author: { ...author, url: e.target.value } })}
            placeholder="https://github.com/your-username"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Direct link for theme updates and creator credits.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="creator-email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Contact / Support Email
          </label>
          <input
            id="creator-email"
            type="email"
            value={author.email || ''}
            onChange={(e) => updateMetadata({ author: { ...author, email: e.target.value } })}
            placeholder="creator@example.com"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Optional contact for feedback and issues.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="creator-notes" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Creator Notes
          </label>
          <input
            id="creator-notes"
            type="text"
            value={author.notes || ''}
            onChange={(e) => updateMetadata({ author: { ...author, notes: e.target.value } })}
            placeholder="Built with Theme Creator Studio"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Internal notes stored in the manifest.</p>
        </div>

        {/* Real File Upload for Installer Icon */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Installer Application Icon (.ico or .png)
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Embedded directly into the generated Windows portable .exe file.
              </p>
            </div>
            {iconData && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                ✓ Icon Set
              </span>
            )}
          </div>

          <input
            id="creator-icon-file-input"
            type="file"
            accept="image/*,.ico,.png"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleIconUpload(file)
              e.target.value = ''
            }}
            className="hidden"
          />

          {iconData ? (
            <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-black/40 p-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/20 bg-slate-950 flex items-center justify-center p-1 shadow-lg">
                <img src={iconData} alt="Theme Icon" className="h-full w-full object-contain" />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-white block">Custom Installer Icon</span>
                <span className="text-[11px] text-slate-400 block">
                  Will be compiled into the portable .exe launcher
                </span>
                <div className="flex gap-2 pt-1">
                  <label
                    htmlFor="creator-icon-file-input"
                    className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition"
                  >
                    Replace Icon
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="creator-icon-file-input"
              className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-sky-400 hover:bg-sky-500/5 transition cursor-pointer p-6 text-center group"
            >
              <span className="text-2xl group-hover:scale-110 transition transform">🖼️</span>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Upload Executable Icon</span>
                <span className="text-[10px] text-slate-400">Click to browse .ico or .png image (256×256 recommended)</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Step Wizard Footer */}
      <WizardStepFooter
        activeSection="creator"
        currentStepIndex={5}
        highestStepReached={6}
        isCurrentStepValid={isCurrentStepValid}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Installer Settings"
        validationErrorHint={!isCurrentStepValid ? 'Please enter a Creator / Author Name to continue.' : undefined}
      />
    </div>
  )
}
