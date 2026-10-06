'use client'

import React, { useState } from 'react'
import { ThemeManifest, SoundEventMeta } from '../types/theme'
import { convertAudioToWav } from '../services/audioConverter'
import { WizardStepFooter } from './WizardNavigation'

interface SoundsPanelProps {
  theme: ThemeManifest;
  updateSounds: (
    eventsPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; durationSeconds?: number; wasConverted?: boolean }>
  ) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
}

const DEFAULT_SOUND_EVENTS: SoundEventMeta[] = [
  { id: 'deviceConnect', name: 'Device Plug-in (Hardware Insert)', registryKey: 'DeviceConnect', description: 'Played when a USB peripheral, mouse, or phone is plugged in', icon: '🔌' },
  { id: 'deviceDisconnect', name: 'Device Remove (Hardware Eject)', registryKey: 'DeviceDisconnect', description: 'Played when hardware or peripheral is disconnected', icon: '⚡' },
  { id: 'notification', name: 'System Notification', registryKey: 'Notification.Default', description: 'Windows action center notification banner chime', icon: '🔔' },
  { id: 'error', name: 'Critical Stop / Error', registryKey: '.Default', description: 'Modal dialog error and critical warning chime', icon: '⚠️' },
  { id: 'click', name: 'Navigation Click', registryKey: 'Navigating', description: 'File Explorer folder navigation click sound', icon: '🖱️' },
  { id: 'startup', name: 'Windows Logon / Startup', registryKey: 'WindowsLogon', description: 'User logon welcome chime', icon: '🚀' },
  { id: 'shutdown', name: 'Windows Logoff / Shutdown', registryKey: 'WindowsLogoff', description: 'System logoff farewell chime', icon: '🌙' },
]

export const SoundsPanel: React.FC<SoundsPanelProps> = ({
  theme,
  updateSounds,
  onGoToNext,
  onGoToPrev,
}) => {
  const currentEvents = theme.sounds.events || {}
  const savedFiles = theme.sounds.files || {}
  const [customEventName, setCustomEventName] = useState('')
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileUpload = async (eventId: string, file: File) => {
    setErrorMessage(null)
    setConvertingId(eventId)

    try {
      // Decode and convert any MP3, M4A, OGG, AAC, or FLAC into 16-bit PCM WAV directly in browser
      const result = await convertAudioToWav(file)

      updateSounds(
        { [eventId]: result.dataUrl },
        {
          [eventId]: {
            fileName: file.name,
            durationSeconds: Math.round(result.durationSeconds * 10) / 10,
            wasConverted: result.wasConverted,
          },
        }
      )
    } catch (err: any) {
      setErrorMessage(`Audio conversion failed for "${file.name}": ${err?.message || 'Unsupported format'}`)
    } finally {
      setConvertingId(null)
    }
  }

  const handleRemoveEvent = (eventId: string) => {
    updateSounds(
      { [eventId]: '' },
      { [eventId]: undefined as any }
    )
    if (playingId === eventId) setPlayingId(null)
  }

  const handleTogglePlay = (eventId: string, dataUrl: string) => {
    if (playingId === eventId) {
      setPlayingId(null)
      return
    }

    const audio = new Audio(dataUrl)
    setPlayingId(eventId)
    audio.play().catch(() => setPlayingId(null))
    audio.onended = () => setPlayingId(null)
  }

  const handleAddCustomEvent = () => {
    const trimmed = customEventName.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (trimmed && !currentEvents[trimmed]) {
      updateSounds({ [trimmed]: '' })
      setCustomEventName('')
    }
  }

  const allEventIds = Array.from(new Set([...DEFAULT_SOUND_EVENTS.map((e) => e.id), ...Object.keys(currentEvents)]))
  const configuredCount = Object.values(currentEvents).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STEP 4 OF 8
          </span>
          <span className="text-xs text-slate-400">Audio Hooks</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white">System Sound Scheme</h2>
          <span className="text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
            {configuredCount} event{configuredCount === 1 ? '' : 's'} configured
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload audio files for Windows system hooks. If you upload an MP3, M4A, or OGG, it is automatically transcoded in-browser into 16-bit linear PCM WAV required by Windows.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="space-y-3">
        {allEventIds.map((eventId) => {
          const meta = DEFAULT_SOUND_EVENTS.find((e) => e.id === eventId)
          const name = meta?.name || eventId
          const registry = meta?.registryKey || 'Custom Hook'
          const description = meta?.description || 'Custom Windows sound event hook'
          const icon = meta?.icon || '🔊'
          const assetData = currentEvents[eventId]
          const fileMeta = savedFiles[eventId]
          const inputId = `sound-upload-input-${eventId}`
          const isPlaying = playingId === eventId
          const isConverting = convertingId === eventId

          return (
            <div
              key={eventId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10 text-2xl">
                  {icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{name}</h4>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {registry}
                    </span>
                    {fileMeta?.wasConverted && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        ✓ CONVERTED MP3 → PCM WAV
                      </span>
                    )}
                    {fileMeta && !fileMeta.wasConverted && (
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 border border-sky-500/30">
                        PCM WAV
                      </span>
                    )}
                    {isConverting && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                        ⏳ Transcoding to WAV...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                </div>
              </div>

              {/* Upload & Audio Player */}
              <div className="flex items-center gap-2.5 shrink-0">
                <input
                  id={inputId}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(eventId, file)
                    e.target.value = ''
                  }}
                  className="hidden"
                />

                {assetData ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(eventId, assetData)}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition shadow"
                    >
                      <span>{isPlaying ? '⏸️ Stop' : '▶️ Play'}</span>
                      {fileMeta?.durationSeconds ? (
                        <span className="text-[10px] text-sky-400 font-mono">({fileMeta.durationSeconds}s)</span>
                      ) : null}
                    </button>

                    <label
                      htmlFor={inputId}
                      className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition"
                    >
                      Replace
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(eventId)}
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
                    <span>Upload Audio (MP3 / WAV)</span>
                  </label>
                )}
              </div>
            </div>
          )
        })}

        {/* Add Custom Sound Hook */}
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
          <input
            type="text"
            value={customEventName}
            onChange={(e) => setCustomEventName(e.target.value)}
            placeholder="Add custom sound event hook (e.g. BatteryLow, RecycleBin, PrintComplete)..."
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustomEvent}
            disabled={!customEventName.trim()}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-40 shrink-0"
          >
            + Add Hook
          </button>
        </div>
      </div>

      {/* Wizard Step Footer */}
      <WizardStepFooter
        activeSection="sounds"
        currentStepIndex={3}
        highestStepReached={4}
        isCurrentStepValid={true}
        onGoToStep={() => {}}
        onGoToNext={onGoToNext}
        onGoToPrev={onGoToPrev}
        nextButtonLabel="Next: Appearance"
      />
    </div>
  )
}
