'use client'

import React, { useState, useMemo } from 'react'
import { ThemeManifest, CursorRoleMeta } from '../types/theme'
import { WizardStepFooter } from './WizardNavigation'

interface CursorsPanelProps {
  theme: ThemeManifest;
  updateCursors: (
    rolesPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; sizeBytes?: number; isAni?: boolean }>
  ) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
}

// Complete list of 17 official Windows cursors with their exact Windows names & descriptions
const WINDOWS_CURSORS: CursorRoleMeta[] = [
  { id: 'Arrow', name: 'Normal Select', win32Id: 'OCR_NORMAL (32512)', description: 'Standard primary Windows desktop pointer arrow', icon: '↗️' },
  { id: 'Help', name: 'Help Select', win32Id: 'OCR_HELP (32651)', description: 'Arrow with question mark for contextual help', icon: '❓' },
  { id: 'AppStarting', name: 'Working in Background', win32Id: 'OCR_APPSTARTING (32650)', description: 'Arrow with background busy spinner', icon: '⏱️' },
  { id: 'Wait', name: 'Busy', win32Id: 'OCR_WAIT (32514)', description: 'Full wait spinner or hourglass', icon: '⏳' },
  { id: 'Crosshair', name: 'Precision Select', win32Id: 'OCR_CROSS (32515)', description: 'Crosshair for fine graphics and drawing', icon: '🎯' },
  { id: 'IBeam', name: 'Text Select', win32Id: 'OCR_IBEAM (32513)', description: 'I-beam cursor for selecting and editing text', icon: '📝' },
  { id: 'NWPen', name: 'Handwriting', win32Id: 'OCR_PEN (32631)', description: 'Pen/stylus cursor for ink and freehand input', icon: '✏️' },
  { id: 'No', name: 'Unavailable', win32Id: 'OCR_NO (32648)', description: 'Circle with slash indicating unavailable action', icon: '🚫' },
  { id: 'SizeNS', name: 'Vertical Resize', win32Id: 'OCR_SIZENS (32645)', description: 'Double vertical arrow for top/bottom resizing', icon: '↕️' },
  { id: 'SizeWE', name: 'Horizontal Resize', win32Id: 'OCR_SIZEWE (32644)', description: 'Double horizontal arrow for left/right resizing', icon: '↔️' },
  { id: 'SizeNWSE', name: 'Diagonal Resize 1', win32Id: 'OCR_SIZENWSE (32642)', description: 'Diagonal arrow for top-left / bottom-right', icon: '↘️' },
  { id: 'SizeNESW', name: 'Diagonal Resize 2', win32Id: 'OCR_SIZENESW (32643)', description: 'Diagonal arrow for top-right / bottom-left', icon: '↗️' },
  { id: 'SizeAll', name: 'Move', win32Id: 'OCR_SIZEALL (32646)', description: 'Four-way arrow for moving windows and objects', icon: '✥' },
  { id: 'UpArrow', name: 'Alternate Select', win32Id: 'OCR_UP (32516)', description: 'Vertical arrow pointing up', icon: '⬆️' },
  { id: 'Hand', name: 'Link Select', win32Id: 'OCR_HAND (32649)', description: 'Hand pointer for web links and clickable buttons', icon: '👆' },
  { id: 'Pin', name: 'Location Select', win32Id: 'OCR_PIN', description: 'Pin marker for map and location selection', icon: '📍' },
  { id: 'Person', name: 'Person Select', win32Id: 'OCR_PERSON', description: 'User silhouette for people and contacts', icon: '👤' },
]

export const CursorsPanel: React.FC<CursorsPanelProps> = ({
  theme,
  updateCursors,
  onGoToNext,
  onGoToPrev,
}) => {
  const currentRoles = theme.cursors.roles || {}
  const savedFiles = theme.cursors.files || {}
  const [searchQuery, setSearchQuery] = useState('')
  const [customRoleName, setCustomRoleName] = useState('')

  const handleFileUpload = (roleId: string, file: File) => {
    const isAni = file.name.toLowerCase().endsWith('.ani')
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      updateCursors(
        { [roleId]: dataUrl },
        { [roleId]: { fileName: file.name, sizeBytes: file.size, isAni } }
      )
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveRole = (roleId: string) => {
    updateCursors(
      { [roleId]: '' },
      { [roleId]: undefined as any }
    )
  }

  const handleAddCustomRole = () => {
    const trimmed = customRoleName.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (trimmed && !currentRoles[trimmed]) {
      updateCursors({ [trimmed]: '' })
      setCustomRoleName('')
    }
  }

  // Combine standard 17 Windows roles with any custom ones (e.g. sword)
  const allRoles: CursorRoleMeta[] = useMemo(() => {
    const customList = Object.keys(currentRoles)
      .filter((k) => !WINDOWS_CURSORS.some((c) => c.id === k))
      .map((k) => ({
        id: k,
        name: k,
        win32Id: 'Custom Windows Role',
        description: 'Custom creator-defined pointer (e.g. sword, special reticle)',
        icon: '🗡️',
      }))
    return [...WINDOWS_CURSORS, ...customList]
  }, [currentRoles])

  // Filter based on search query
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return allRoles
    const q = searchQuery.toLowerCase()
    return allRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.win32Id.toLowerCase().includes(q)
    )
  }, [allRoles, searchQuery])

  const configuredCount = Object.values(currentRoles).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 3 OF 8
          </span>
          <span className="text-xs text-slate-400">Pointer Scheme</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white">Mouse Cursor System</h2>
          <span className="text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
            {configuredCount} / {allRoles.length} configured
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload custom animated (.ani) or static (.cur) cursor files. Windows official roles are listed with their standard system names. You can also add custom cursors like sword or custom pointer styles.
        </p>
      </div>

      {/* Search & Custom Cursor Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 17 Windows cursors (e.g. Normal Select, Link Select, Busy, Text Select, Resize)..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customRoleName}
            onChange={(e) => setCustomRoleName(e.target.value)}
            placeholder="Add custom role (e.g. SwordCursor)..."
            className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none w-52"
          />
          <button
            type="button"
            onClick={handleAddCustomRole}
            disabled={!customRoleName.trim()}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-40 shrink-0"
          >
            + Add Role
          </button>
        </div>
      </div>

      {/* Cursor Role Cards */}
      <div className="space-y-3">
        {filteredRoles.map((role) => {
          const assetData = currentRoles[role.id]
          const fileMeta = savedFiles[role.id]
          const inputId = `cursor-upload-input-${role.id}`

          return (
            <div
              key={role.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10 text-2xl">
                  {role.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{role.name}</h4>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {role.id}
                    </span>
                    {assetData && fileMeta?.isAni && (
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 border border-sky-500/30">
                        ANIMATED (.ANI)
                      </span>
                    )}
                    {assetData && !fileMeta?.isAni && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        STATIC (.CUR)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                </div>
              </div>

              {/* Upload & Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <input
                  id={inputId}
                  type="file"
                  accept=".ani,.cur"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(role.id, file)
                    e.target.value = ''
                  }}
                  className="hidden"
                />

                {assetData ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-emerald-400 block">
                        ✓ {fileMeta?.fileName || 'Cursor File Set'}
                      </span>
                      {fileMeta?.sizeBytes && (
                        <span className="text-[10px] text-slate-500">
                          {(fileMeta.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition"
                    >
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={inputId}
                    className="cursor-pointer flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 hover:border-sky-400 transition"
                  >
                    <span>📁</span>
                    <span>Upload .ani / .cur</span>
                  </label>
                )}
              </div>
            </div>
          )
        })}

        {filteredRoles.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-slate-400 text-xs">
            No cursor roles matched your search: "{searchQuery}". You can add it as a custom role using the input above!
          </div>
        )}
      </div>

      {/* Wizard Step Footer */}
      <WizardStepFooter
        activeSection="cursors"
        currentStepIndex={2}
        highestStepReached={3}
        isCurrentStepValid={true}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Sounds"
      />
    </div>
  )
}
