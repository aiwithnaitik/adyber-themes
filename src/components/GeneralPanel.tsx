'use client'

import React from 'react'
import { ThemeManifest } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface GeneralPanelProps {
  theme: ThemeManifest;
  updateMetadata: (patch: Partial<ThemeManifest['metadata']>) => void;
  onGoToNext: () => void;
  isCurrentStepValid: boolean;
}

export const GeneralPanel: React.FC<GeneralPanelProps> = ({
  theme,
  updateMetadata,
  onGoToNext,
  isCurrentStepValid,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 1 OF 8
          </span>
          <span className="text-xs text-slate-400">Theme Foundation</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">General Theme Configuration</h2>
        <p className="text-xs text-slate-400 mt-1">
          Define theme naming and identification. Once confirmed, you can proceed to upload your desktop wallpaper.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="theme-name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Theme Name *
          </label>
          <input
            id="theme-name"
            type="text"
            value={theme.metadata.name}
            onChange={(e) => updateMetadata({ name: e.target.value })}
            placeholder="e.g. Cyber Storm or Minimal Dusk"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[11px] text-slate-400">
            Displayed in Windows Personalization and on the installer confirmation popup.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="theme-version" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Version (SemVer)
          </label>
          <input
            id="theme-version"
            type="text"
            value={theme.metadata.version}
            onChange={(e) => updateMetadata({ version: e.target.value })}
            placeholder="1.0.0"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[11px] text-slate-400">Defaults to 1.0.0 if left blank.</p>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="theme-description" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Theme Description
          </label>
          <textarea
            id="theme-description"
            rows={3}
            value={theme.metadata.description}
            onChange={(e) => updateMetadata({ description: e.target.value })}
            placeholder="Describe your theme aesthetic, color choices, and sound details..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[11px] text-slate-400">A concise summary of what this theme customizes.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="theme-id" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Theme ID (Directory Slug)
          </label>
          <input
            id="theme-id"
            type="text"
            value={theme.metadata.id}
            onChange={(e) =>
              updateMetadata({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })
            }
            placeholder={theme.metadata.name ? theme.metadata.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : 'my-theme-id'}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[11px] text-slate-400">Folder name under %LOCALAPPDATA%\Themes\</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <label htmlFor="theme-tags" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Categorization Tags
          </label>
          <input
            id="theme-tags"
            type="text"
            value={(theme.metadata.tags || []).join(', ')}
            onChange={(e) =>
              updateMetadata({
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="dark, storm, minimal, cyberpunk"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[11px] text-slate-400">Comma-separated tags for filtering and discovery.</p>
        </div>
      </div>

      {/* Step Wizard Footer */}
      <WizardStepFooter
        activeSection="general"
        currentStepIndex={0}
        highestStepReached={1}
        isCurrentStepValid={isCurrentStepValid}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={() => {}}
        nextButtonLabel="Confirm & Next: Wallpaper"
        validationErrorHint={!isCurrentStepValid ? 'Please enter a Theme Name to continue.' : undefined}
      />
    </div>
  )
}
