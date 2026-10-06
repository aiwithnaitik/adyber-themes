'use client'

import React, { useState, useRef } from 'react'
import {
  ThemeManifest,
  ValidationReport,
  WallpaperSlide,
} from '../types/theme'
import JSZip from 'jszip'
import {
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  MousePointer,
  Volume2,
  Palette,
  User,
  Package,
  Monitor,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
  Trash2,
  Play,
  Square,
  Plus,
  Terminal,
  Cpu,
  Save,
  Check,
  Search,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Download,
  FileJson,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'

export type CreatorStep =
  | 'general'
  | 'wallpaper'
  | 'cursors'
  | 'sounds'
  | 'appearance'
  | 'creator'
  | 'preview'
  | 'installer'

interface ThemeCreatorProps {
  theme: ThemeManifest;
  validation: ValidationReport;
  updateMetadata: (patch: Partial<ThemeManifest['metadata']>) => void;
  updateAppearance: (patch: Partial<ThemeManifest['appearance']>) => void;
  updateWallpaper: (patch: Partial<ThemeManifest['wallpaper']>) => void;
  updateCursors: (
    rolesPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; sizeBytes?: number; isAni?: boolean }>
  ) => void;
  updateSounds: (
    eventsPatch: Record<string, string | undefined>,
    filesPatch?: Record<string, { fileName: string; durationSeconds?: number; wasConverted?: boolean }>
  ) => void;
  updateInstaller: (patch: Partial<ThemeManifest['installer']>) => void;
  onBackToHome: () => void;
  onOpenBuildModal: () => void;
  onSave?: () => void;
}

const STEPS: Array<{
  id: CreatorStep;
  number: string;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'general', number: '01', label: 'General', tagline: 'Identity & Identifier', icon: Settings },
  { id: 'wallpaper', number: '02', label: 'Wallpaper', tagline: 'Background Media', icon: ImageIcon },
  { id: 'cursors', number: '03', label: 'Cursors', tagline: '17 Windows Pointer Roles', icon: MousePointer },
  { id: 'sounds', number: '04', label: 'Sounds', tagline: 'Windows Audio Scheme', icon: Volume2 },
  { id: 'appearance', number: '05', label: 'Appearance', tagline: 'Windows DWM & Accents', icon: Palette },
  { id: 'creator', number: '06', label: 'Creator', tagline: 'Attribution & Branding', icon: User },
  { id: 'preview', number: '07', label: 'Preview', tagline: 'Desktop Simulation', icon: Monitor },
  { id: 'installer', number: '08', label: 'Installer', tagline: 'Build & Download', icon: Package },
]

const ACCENT_PRESETS = [
  { name: 'Windows Storm', hex: '#4F585E' },
  { name: 'Windows Blue', hex: '#0078D7' },
  { name: 'Cobalt Blue', hex: '#0063B1' },
  { name: 'Dark Teal', hex: '#038387' },
  { name: 'Emerald Forest', hex: '#107C41' },
  { name: 'Amber Sunset', hex: '#D97706' },
  { name: 'Crimson Rose', hex: '#C42B1C' },
  { name: 'Orchid Violet', hex: '#8764B8' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Carbon Black', hex: '#2B3338' },
]

export const WINDOWS_CURSOR_ROLES = [
  { id: 'Arrow', name: 'Normal Select', win32: 'OCR_NORMAL (32512)', desc: 'Standard Windows navigation pointer' },
  { id: 'Help', name: 'Help Select', win32: 'OCR_HELP (32651)', desc: 'Contextual help and question cursor' },
  { id: 'AppStarting', name: 'Working in Background', win32: 'OCR_APPSTARTING (32650)', desc: 'Background task with interactive pointer' },
  { id: 'Wait', name: 'Busy', win32: 'OCR_WAIT (32514)', desc: 'System busy spinner / hourglass' },
  { id: 'Crosshair', name: 'Precision Select', win32: 'OCR_CROSS (32515)', desc: 'Graphic alignment and crosshair cursor' },
  { id: 'IBeam', name: 'Text Select', win32: 'OCR_IBEAM (32513)', desc: 'Text input and caret insertion cursor' },
  { id: 'NWPen', name: 'Handwriting', win32: 'OCR_PEN (32631)', desc: 'Stylus pen and handwriting input' },
  { id: 'No', name: 'Unavailable', win32: 'OCR_NO (32648)', desc: 'Action unavailable / prohibited drop' },
  { id: 'SizeNS', name: 'Vertical Resize', win32: 'OCR_SIZENS (32645)', desc: 'Vertical window border resize cursor' },
  { id: 'SizeWE', name: 'Horizontal Resize', win32: 'OCR_SIZEWE (32644)', desc: 'Horizontal window border resize cursor' },
  { id: 'SizeNWSE', name: 'Diagonal Resize 1', win32: 'OCR_SIZENWSE (32642)', desc: 'Top-left to bottom-right window resize' },
  { id: 'SizeNESW', name: 'Diagonal Resize 2', win32: 'OCR_SIZENESW (32643)', desc: 'Top-right to bottom-left window resize' },
  { id: 'SizeAll', name: 'Move', win32: 'OCR_SIZEALL (32646)', desc: 'Four-way window and canvas move cursor' },
  { id: 'UpArrow', name: 'Alternate Select', win32: 'OCR_UP (32516)', desc: 'Vertical upward pointing alternate select' },
  { id: 'Hand', name: 'Link Select', win32: 'OCR_HAND (32649)', desc: 'Hyperlink hover and clickable button hand' },
  { id: 'Pin', name: 'Location Select', win32: 'OCR_PIN', desc: 'Maps and geolocation pin selector' },
  { id: 'Person', name: 'Person Select', win32: 'OCR_PERSON', desc: 'Contact and collaborator selector' },
]

export const WINDOWS_SOUND_EVENTS = [
  { id: 'deviceConnect', name: 'Hardware Plug-in', key: 'DeviceConnect', desc: 'USB or external device plugged in' },
  { id: 'deviceDisconnect', name: 'Hardware Remove', key: 'DeviceDisconnect', desc: 'USB or external device unplugged' },
  { id: 'deviceFail', name: 'Device Failed to Connect', key: 'DeviceFail', desc: 'USB device connection failed or unrecognized' },
  { id: 'notification', name: 'Notification Chime', key: 'Notification.Default', desc: 'Windows Action Center and app notification alert' },
  { id: 'notificationIM', name: 'Instant Message Chime', key: 'Notification.IM', desc: 'Incoming chat message or DM notification' },
  { id: 'notificationMail', name: 'New Mail Notification', key: 'Notification.Mail', desc: 'Sound played when new email arrives' },
  { id: 'notificationReminder', name: 'Calendar Reminder', key: 'Notification.Reminder', desc: 'Calendar alarm and scheduled task alert' },
  { id: 'error', name: 'Critical Stop / Error', key: '.Default', desc: 'Default system error and critical stop beep' },
  { id: 'click', name: 'Navigation Click', key: 'Navigating', desc: 'File Explorer folder navigation click' },
  { id: 'startup', name: 'Windows Logon', key: 'WindowsLogon', desc: 'User login and welcome greeting chime' },
  { id: 'shutdown', name: 'Windows Logoff', key: 'WindowsLogoff', desc: 'System shut-down and user log-off chime' },
  { id: 'systemAsterisk', name: 'Asterisk (Info Dialogue)', key: 'SystemAsterisk', desc: 'Information dialog alert chime' },
  { id: 'systemExclamation', name: 'Exclamation (Warning Dialogue)', key: 'SystemExclamation', desc: 'Warning alert dialog chime' },
  { id: 'lowBattery', name: 'Low Battery Alarm', key: 'LowBatteryAlarm', desc: 'Alert when laptop battery reaches low threshold' },
  { id: 'criticalBattery', name: 'Critical Battery Alarm', key: 'CriticalBatteryAlarm', desc: 'Urgent chime when battery is critically low' },
  { id: 'emptyRecycleBin', name: 'Empty Recycle Bin', key: 'EmptyRecycleBin', desc: 'Audio cue when emptying files from Recycle Bin' },
]

// Render authentic Windows default mouse pointer SVGs
export const DefaultPointerGlyph: React.FC<{ roleId: string; className?: string }> = ({ roleId, className = 'h-5 w-5' }) => {
  switch (roleId) {
    case 'Arrow':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M4 2L4 18L8.5 13.5L13 22L16 20.5L11.5 12L17.5 12L4 2Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )
    case 'Help':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M3 2L3 17L7 13L11 21L13.5 19.5L9.5 11.5L15 11.5L3 2Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M17 3.5C17 2.4 18 1.5 19.5 1.5C21 1.5 22 2.4 22 3.5C22 4.5 21 5.2 20 5.8C19.5 6.1 19.5 6.8 19.5 7.5M19.5 10H19.51" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'AppStarting':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M3 2L3 17L7 13L11 21L13.5 19.5L9.5 11.5L15 11.5L3 2Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="18" cy="7" r="4.5" stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="6 3" className="animate-spin origin-[18px_7px]" />
        </svg>
      )
    case 'Wait':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="8" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="16 8" className="animate-spin origin-center" />
        </svg>
      )
    case 'Crosshair':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 2V9M12 15V22M2 12H9M15 12H22" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="#38BDF8" />
        </svg>
      )
    case 'IBeam':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M8 4H16M12 4V20M8 20H16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'NWPen':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M19 3L21 5L8 18L4 20L6 16L19 3Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 6L18 8" stroke="#000000" strokeWidth="1.5" />
        </svg>
      )
    case 'No':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="#EF4444" strokeWidth="2" />
          <line x1="6" y1="6" x2="18" y2="18" stroke="#EF4444" strokeWidth="2" />
        </svg>
      )
    case 'SizeNS':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 2L8 6H16L12 2ZM12 22L8 18H16L12 22ZM12 5V19" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'SizeWE':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M2 12L6 8V16L2 12ZM22 12L18 8V16L22 12ZM5 12H19" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'SizeNWSE':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M3 3L9 4L4 9L3 3ZM21 21L15 20L20 15L21 21ZM5.5 5.5L18.5 18.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'SizeNESW':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M21 3L15 4L20 9L21 3ZM3 21L9 20L4 15L3 21ZM18.5 5.5L5.5 18.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'SizeAll':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 2L9 5H15L12 2ZM12 22L9 19H15L12 22ZM2 12L5 9V15L2 12ZM22 12L19 9V15L22 12ZM12 4V20M4 12H20" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'UpArrow':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 3L6 10H10V21H14V10H18L12 3Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'Hand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M10 3V12H7C6 12 5 13 6 14L10 20C11 21.5 13 22 15 22H17C19 22 20 20.5 20 18.5V11C20 10 19 9 18 9C17 9 16 9.8 16 10.5V10C16 9 15 8 14 8C13 8 12 8.8 12 9.5V4C12 3 11 3 10 3Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'Pin':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 2C8.5 2 6 4.5 6 8C6 12.5 12 21 12 21C12 21 18 12.5 18 8C18 4.5 15.5 2 12 2Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="8" r="2.5" fill="#38BDF8" />
        </svg>
      )
    case 'Person':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="7" r="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          <path d="M5 21C5 17 8 14 12 14C16 14 19 17 19 21" stroke="#000000" strokeWidth="1.8" fill="#FFFFFF" />
        </svg>
      )
    default:
      return <MousePointer className={className} />
  }
}

export const ThemeCreator: React.FC<ThemeCreatorProps> = ({
  theme,
  validation,
  updateMetadata,
  updateAppearance,
  updateWallpaper,
  updateCursors,
  updateSounds,
  updateInstaller,
  onBackToHome,
  onOpenBuildModal,
  onSave,
}) => {
  const [activeStep, setActiveStep] = useState<CreatorStep>('general')
  const [cursorSearch, setCursorSearch] = useState('')
  const [soundSearch, setSoundSearch] = useState('')
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [isSavedFeedback, setIsSavedFeedback] = useState(false)
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)

  // Slideshow preview index
  const [slideshowPreviewIdx, setSlideshowPreviewIdx] = useState(0)

  // In-page build state for Step 8 (Installer)
  const [buildStep, setBuildStep] = useState<'idle' | 'building' | 'complete' | 'error'>('idle')
  const [buildLogs, setBuildLogs] = useState<string[]>([])
  const [exeBase64, setExeBase64] = useState<string | null>(null)
  const [zipBase64, setZipBase64] = useState<string | null>(null)
  const [builtArtifactName, setBuiltArtifactName] = useState<string>(theme.installer?.artifactName || 'theme.exe')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wallpaperInputRef = useRef<HTMLInputElement>(null)
  const slideAddInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)
  const currentStep = STEPS[activeIndex]
  const accent = theme.appearance.accentColor || '#4F585E'
  const isDark = theme.appearance.colorMode !== 'light'

  const handleNextStep = () => {
    if (activeIndex < STEPS.length - 1) {
      setActiveStep(STEPS[activeIndex + 1].id)
    }
  }

  const handlePrevStep = () => {
    if (activeIndex > 0) {
      setActiveStep(STEPS[activeIndex - 1].id)
    }
  }

  const handleSaveClick = () => {
    onSave?.()
    setIsSavedFeedback(true)
    setTimeout(() => setIsSavedFeedback(false), 2000)
  }

  // Audio preview handler
  const handleTogglePlayAudio = (eventId: string, dataUrl?: string) => {
    if (!dataUrl) return
    if (playingAudioId === eventId) {
      audioRef.current?.pause()
      setPlayingAudioId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    try {
      const audio = new Audio(dataUrl)
      audioRef.current = audio
      setPlayingAudioId(eventId)
      audio.onended = () => setPlayingAudioId(null)
      audio.onerror = () => setPlayingAudioId(null)
      audio.play().catch(() => setPlayingAudioId(null))
    } catch {
      setPlayingAudioId(null)
    }
  }

  // Wallpaper Upload Handlers
  const handleWallpaperFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (theme.wallpaper.mode === 'slideshow') {
        const slides = theme.wallpaper.slideshow?.slides || []
        const newSlide: WallpaperSlide = {
          order: slides.length + 1,
          assetPath: dataUrl,
          name: file.name,
        }
        const updatedSlides = [...slides, newSlide]
        updateWallpaper({
          slideshow: {
            slides: updatedSlides,
            intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
            shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
          },
        })
        setSlideshowPreviewIdx(updatedSlides.length - 1)
      } else {
        updateWallpaper({
          static: {
            assetPath: dataUrl,
            fit: 'fit',
          },
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Cursor Upload Handler
  const handleCursorFile = (roleId: string, file: File) => {
    const isAni = file.name.toLowerCase().endsWith('.ani')
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      updateCursors(
        { [roleId]: dataUrl },
        { [roleId]: { fileName: file.name, sizeBytes: file.size, isAni } }
      )
    }
    reader.readAsDataURL(file)
  }

  // Sound Upload Handler
  const handleSoundFile = (eventId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const wasConverted = !file.name.toLowerCase().endsWith('.wav')
      updateSounds(
        { [eventId]: dataUrl },
        { [eventId]: { fileName: file.name, wasConverted } }
      )
    }
    reader.readAsDataURL(file)
  }

  // Slideshow navigation in preview
  const currentSlides = theme.wallpaper.slideshow?.slides || []
  const safeSlideIdx = Math.min(slideshowPreviewIdx, Math.max(0, currentSlides.length - 1))
  const activeSlideImage = currentSlides[safeSlideIdx]?.assetPath

  const activeWallpaper =
    theme.wallpaper.mode === 'slideshow'
      ? activeSlideImage || currentSlides[0]?.assetPath
      : theme.wallpaper.static?.assetPath

  const configuredCursorsList = Object.entries(theme.cursors.roles || {}).filter(([, p]) => Boolean(p))
  const configuredSoundsList = Object.entries(theme.sounds.events || {}).filter(([, p]) => Boolean(p))

  // In-page build trigger for Step 8
  const handleBuildInstallerNow = async () => {
    setBuildStep('building')
    setBuildLogs([
      '[1/5] Validating theme manifest and media specifications...',
      '[2/5] Connecting to installer build pipeline...',
    ])

    try {
      const response = await fetch('/api/build-installer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      })

      const data = await response.json()
      if (data.logs && Array.isArray(data.logs)) {
        setBuildLogs(data.logs)
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server build failed')
      }

      setExeBase64(data.exeBase64)
      setZipBase64(data.zipBase64)
      if (data.artifactName) setBuiltArtifactName(data.artifactName)
      setBuildStep('complete')
    } catch (err: any) {
      setBuildLogs((prev) => [
        ...prev,
        `[WARN] Server-side build notice: ${err?.message || 'Compiling client-side fallback...'}`,
        '[INFO] Assembling portable theme package in-browser using JSZip...',
      ])

      try {
        const zip = new JSZip()
        zip.file('theme.json', JSON.stringify(theme, null, 2))

        if (theme.wallpaper.static?.assetPath?.startsWith('data:')) {
          const b64 = theme.wallpaper.static.assetPath.replace(/^data:image\/\w+;base64,/, '')
          zip.folder('wallpaper')?.file('wallpaper.png', b64, { base64: true })
        }

        const cmdScript = `@echo off\r\ntitle ${theme.metadata.name} Installer\r\ncd /d "%~dp0"\r\npowershell.exe -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Install theme: ${theme.metadata.name}?', 'Install theme', 'OKCancel', 'Question')"\r\n`
        zip.file('Install-Theme.cmd', cmdScript)

        const fallbackZipBlob = await zip.generateAsync({ type: 'base64' })
        setZipBase64(fallbackZipBlob)
        setBuildLogs((prev) => [...prev, '[SUCCESS] Standalone theme package assembled successfully.'])
        setBuildStep('complete')
      } catch (fallbackErr: any) {
        setBuildLogs((prev) => [...prev, `[ERROR] Package generation failed: ${fallbackErr?.message}`])
        setBuildStep('error')
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
    a.download = builtArtifactName || 'theme.exe'
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
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#050608] text-slate-100 flex p-4 sm:p-7 gap-5 sm:gap-8 select-none relative">
      <audio ref={audioRef} className="hidden" />

      {/* LEFT COLUMN: Seamless Floating Vertical Step Indicator (No separate background or border) */}
      <nav
        aria-label="Creation Steps"
        className="w-56 sm:w-64 shrink-0 flex flex-col justify-between py-1 bg-transparent select-none z-10"
      >
        <div className="space-y-6">
          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            <span>All Themes</span>
          </button>

          {/* Studio Branding */}
          <div className="space-y-1 pl-1">
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Adyber Studio
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              {theme.metadata.name || 'Untitled Theme'}
            </h1>
          </div>

          {/* Vertical Steps List (Seamlessly floating, no background, no separator) */}
          <div className="space-y-1 pt-1">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id
              const Icon = step.icon

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`group w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {step.number}
                  </span>

                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-bold leading-none ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">
                      {step.tagline}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Specs Info */}
        <div className="space-y-3 pt-4 pl-1">
          <div className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20 shrink-0"
              style={{ backgroundColor: accent }}
            />
            <span className="font-mono text-[11px] text-slate-300 truncate">
              {accent}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-[11px] text-slate-400">
              {theme.metadata.id || 'slug'}
            </span>
          </div>

          <button
            onClick={() => setActiveStep('installer')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 py-2.5 text-xs font-bold shadow-lg hover:bg-slate-100 active:scale-95 transition"
          >
            <PackageCheck className="h-4 w-4" />
            <span>Go to Installer</span>
          </button>
        </div>
      </nav>

      {/* MIDDLE / MAIN CANVAS: The Creative Workspace */}
      <main className="flex-1 h-full overflow-hidden flex flex-col rounded-3xl border border-white/[0.08] bg-[#0b0e14]/90 shadow-2xl relative backdrop-blur-xl p-6 sm:p-8 justify-between">
        {/* Subtle Ambient Accent Glow in Top-Right */}
        <div
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
          style={{ backgroundColor: accent }}
        />

        {/* Workspace Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 shrink-0 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Step {currentStep.number} of 08
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-400">{currentStep.tagline}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
              {currentStep.label}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition active:scale-95"
            >
              {isSavedFeedback ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Validation Chip */}
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-medium ${
                validation.isValid
                  ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400'
                  : 'border-amber-500/20 bg-amber-500/[0.06] text-amber-400'
              }`}
            >
              {validation.isValid ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>{validation.isValid ? 'Valid' : `${validation.errors.length} Issues`}</span>
            </div>
          </div>
        </div>

        {/* Content Body for Active Step */}
        <div className="flex-1 overflow-hidden py-4 relative z-10">
          {/* STEP 1: GENERAL (Left: Name, ID, Tag; Right: Description) */}
          {activeStep === 'general' && (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-y-auto pr-1">
                {/* Left Side: Theme Name, Theme ID, Categorization Tag */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  {/* Theme Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Theme Name *</span>
                      <span className="text-[10px] font-mono text-emerald-400">Required</span>
                    </label>
                    <input
                      type="text"
                      value={theme.metadata.name}
                      onChange={(e) => {
                        const val = e.target.value
                        const autoId = theme.metadata.id ? theme.metadata.id : val.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
                        updateMetadata({ name: val, id: autoId })
                      }}
                      placeholder="e.g. Cyber Dusk"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:border-white focus:outline-none transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      Primary theme display name presented in Windows Personalization.
                    </p>
                  </div>

                  {/* Theme ID (Unique slug for installation path) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Theme ID *</span>
                      <span className="text-[10px] font-mono text-emerald-400">Required Unique</span>
                    </label>
                    <input
                      type="text"
                      value={theme.metadata.id}
                      onChange={(e) => updateMetadata({ id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                      placeholder="e.g. cyber-dusk"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:border-white focus:outline-none transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      Unique path identifier used in <code className="text-slate-300">%LOCALAPPDATA%\Themes\{theme.metadata.id || 'theme-id'}</code>.
                    </p>
                  </div>

                  {/* Categorization Tag */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Categorization Tag</span>
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    </label>
                    <input
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
                      placeholder="e.g. Minimal, Dark, Cyberpunk"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-white focus:outline-none transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      Discovery tag or category used to organize themes.
                    </p>
                  </div>
                </div>

                {/* Right Side: Theme Description */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Theme Description</span>
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    </label>
                    <textarea
                      rows={7}
                      value={theme.metadata.description}
                      onChange={(e) => updateMetadata({ description: e.target.value })}
                      placeholder="Describe the aesthetic, color balance, desktop ergonomics, and visual mood..."
                      className="w-full flex-1 rounded-xl border border-white/10 bg-black/60 p-4 text-xs text-white placeholder-slate-500 focus:border-white focus:outline-none resize-none transition leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400">
                      A brief description of this theme. You can continue without filling this.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1.5 font-mono">
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Installation Path Target</div>
                    <div className="text-slate-200 text-[11px] truncate">
                      %LOCALAPPDATA%\Themes\{theme.metadata.id || 'theme-slug'}\
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: WALLPAPER (Static vs Slideshow; No fit mode dropdown; Left/Right buttons for slideshow) */}
          {activeStep === 'wallpaper' && (
            <div className="h-full flex flex-col justify-between space-y-3">
              <input
                ref={wallpaperInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.bmp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleWallpaperFile(file)
                  e.target.value = ''
                }}
              />
              <input
                ref={slideAddInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.bmp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleWallpaperFile(file)
                  e.target.value = ''
                }}
              />

              {/* Mode Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 rounded-xl bg-black/40 p-1 border border-white/10">
                  <button
                    onClick={() => updateWallpaper({ mode: 'static' })}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                      theme.wallpaper.mode === 'static'
                        ? 'bg-white text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Static Wallpaper
                  </button>
                  <button
                    onClick={() => updateWallpaper({ mode: 'slideshow' })}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                      theme.wallpaper.mode === 'slideshow'
                        ? 'bg-white text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Slideshow Wallpaper
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {theme.wallpaper.mode === 'slideshow' ? 'Dynamic Desktop Slideshow' : 'Single High-Res Wallpaper'}
                </span>
              </div>

              {/* Canvas & Controls Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-hidden">
                {/* Left Controls (5 cols) */}
                <div className="md:col-span-5 rounded-2xl border border-white/[0.06] bg-black/40 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4 overflow-y-auto pr-1">
                    {theme.wallpaper.mode === 'static' ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Static Desktop Image</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Upload a high-resolution wallpaper image (.jpg, .png, .webp). The installer will automatically fit it to the user screen.
                          </p>
                        </div>

                        {theme.wallpaper.static?.assetPath && (
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-bold">Active Image</span>
                              <span className="text-emerald-400 font-mono text-[11px]">Ready</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              Fit: Auto Screen Fit
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Slideshow Configuration</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Upload multiple wallpapers. Windows will cycle through them at the interval you specify.
                          </p>
                        </div>

                        {/* Interval Settings */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Rotation Interval (Seconds)
                          </label>
                          <input
                            type="number"
                            min={10}
                            value={theme.wallpaper.slideshow?.intervalSeconds || 60}
                            onChange={(e) =>
                              updateWallpaper({
                                slideshow: {
                                  slides: theme.wallpaper.slideshow?.slides || [],
                                  intervalSeconds: Math.max(10, parseInt(e.target.value, 10) || 10),
                                  shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
                                },
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400 font-mono">Minimum 10s rotation interval</p>
                        </div>

                        {/* Shuffle Toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-3">
                          <div>
                            <div className="text-xs font-bold text-white">Shuffle Wallpaper Order</div>
                            <div className="text-[10px] text-slate-400">Randomize transition order</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={theme.wallpaper.slideshow?.shuffle ?? true}
                            onChange={(e) =>
                              updateWallpaper({
                                slideshow: {
                                  slides: theme.wallpaper.slideshow?.slides || [],
                                  intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
                                  shuffle: e.target.checked,
                                },
                              })
                            }
                            className="h-4 w-4 rounded border-white/20 bg-black text-white cursor-pointer"
                          />
                        </div>

                        {/* Slide Thumbnails List */}
                        {currentSlides.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                              <span>Uploaded Slides ({currentSlides.length})</span>
                            </div>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {currentSlides.map((slide, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSlideshowPreviewIdx(idx)}
                                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                                    safeSlideIdx === idx
                                      ? 'border-white bg-white/10 text-white'
                                      : 'border-white/5 bg-black/40 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                                    <span className="truncate text-xs">{slide.name || `Slide ${idx + 1}`}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const updated = currentSlides.filter((_, i) => i !== idx)
                                      updateWallpaper({
                                        slideshow: {
                                          slides: updated,
                                          intervalSeconds: theme.wallpaper.slideshow?.intervalSeconds || 60,
                                          shuffle: theme.wallpaper.slideshow?.shuffle ?? true,
                                        },
                                      })
                                      if (safeSlideIdx >= updated.length) {
                                        setSlideshowPreviewIdx(Math.max(0, updated.length - 1))
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                                    title="Delete slide"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Action Button */}
                  <button
                    onClick={() => {
                      if (theme.wallpaper.mode === 'slideshow') {
                        slideAddInputRef.current?.click()
                      } else {
                        wallpaperInputRef.current?.click()
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{theme.wallpaper.mode === 'slideshow' ? 'Add Slide Image' : 'Upload Wallpaper Image'}</span>
                  </button>
                </div>

                {/* Right Preview Canvas (7 cols) with Navigation Buttons */}
                <div
                  className="md:col-span-7 rounded-2xl border border-white/[0.08] overflow-hidden relative shadow-inner bg-cover bg-center flex flex-col justify-between p-5"
                  style={{
                    backgroundColor: '#10141c',
                    backgroundImage: activeWallpaper
                      ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${activeWallpaper}')`
                      : `radial-gradient(ellipse at 50% 30%, ${accent}55, #080a0f)`,
                  }}
                >
                  {/* Top Bar on Preview */}
                  <div className="flex items-center justify-between z-10">
                    <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border border-white/15">
                      {theme.wallpaper.mode === 'slideshow'
                        ? `${currentSlides.length} Slide${currentSlides.length === 1 ? '' : 's'} Configured`
                        : activeWallpaper
                        ? 'Static Wallpaper Loaded'
                        : 'No image uploaded'}
                    </span>

                    {activeWallpaper && (
                      <button
                        onClick={() =>
                          updateWallpaper({
                            static: { assetPath: '', fit: 'fit' },
                            slideshow: { slides: [], intervalSeconds: 60, shuffle: true },
                          })
                        }
                        className="p-1.5 rounded-lg bg-black/70 text-slate-400 hover:text-rose-400 transition"
                        title="Remove All Wallpapers"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Empty State Prompt */}
                  {!activeWallpaper && (
                    <div className="text-center py-12 space-y-2 z-10">
                      <ImageIcon className="h-10 w-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-white">Click upload to assign wallpaper</p>
                      <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP, BMP</p>
                    </div>
                  )}

                  {/* Middle Left & Right Buttons for Slideshow Browsing */}
                  {theme.wallpaper.mode === 'slideshow' && currentSlides.length > 0 && (
                    <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={() => {
                          setSlideshowPreviewIdx((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)
                        }}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:bg-black/90 active:scale-95 transition shadow-xl"
                        title="Previous wallpaper slide"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlideshowPreviewIdx((prev) => (prev + 1) % currentSlides.length)
                        }}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:bg-black/90 active:scale-95 transition shadow-xl"
                        title="Next wallpaper slide"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Bar: Slide Indicator & File Info */}
                  <div className="flex items-center justify-between z-10">
                    {theme.wallpaper.mode === 'slideshow' && currentSlides.length > 0 ? (
                      <div className="text-[11px] font-mono text-slate-300 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <span>Slide {safeSlideIdx + 1} of {currentSlides.length}</span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate max-w-[140px]">{currentSlides[safeSlideIdx]?.name || 'Wallpaper'}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-slate-300 bg-black/60 backdrop-blur px-3 py-1 rounded-md">
                        Fit: Auto Fit
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CURSORS (Top search bar, wide horizontal strip cards, official names, default icon on left, upload on right) */}
          {activeStep === 'cursors' && (
            <div className="h-full flex flex-col justify-between space-y-3">
              {/* Search Bar & Stats */}
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={cursorSearch}
                    onChange={(e) => setCursorSearch(e.target.value)}
                    placeholder="Search pointer roles..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <span className="font-mono text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  {configuredCursorsList.length} / 17 Pointer Roles Replaced
                </span>
              </div>

              {/* Wide Horizontal Strip Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {WINDOWS_CURSOR_ROLES.filter(
                  (r) =>
                    r.name.toLowerCase().includes(cursorSearch.toLowerCase()) ||
                    r.id.toLowerCase().includes(cursorSearch.toLowerCase()) ||
                    r.win32.toLowerCase().includes(cursorSearch.toLowerCase())
                ).map((role) => {
                  const dataUrl = theme.cursors.roles?.[role.id]
                  const fileMeta = theme.cursors.files?.[role.id]

                  return (
                    <div
                      key={role.id}
                      className={`rounded-xl border p-3 flex items-center justify-between gap-4 transition group ${
                        dataUrl
                          ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                          : 'border-white/[0.08] bg-black/40 hover:border-white/20 hover:bg-black/60'
                      }`}
                    >
                      {/* Left: Pointer Icon Glyph container */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="h-11 w-11 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center relative shadow-inner">
                          <DefaultPointerGlyph roleId={role.id} className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Default Windows Pointer
                          </span>
                          <span className="text-xs font-bold text-white">{role.name}</span>
                        </div>
                      </div>

                      {/* Middle: Windows Identifier & Replacement Status */}
                      <div className="flex-1 min-w-0 hidden sm:block">
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {role.win32}
                        </div>
                        {dataUrl ? (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Check className="h-3 w-3" />
                            <span>Replaced with: </span>
                            <span className="font-mono text-white underline decoration-emerald-500/40 truncate max-w-[180px]">
                              {fileMeta?.fileName || 'custom.cur'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {role.desc}
                          </div>
                        )}
                      </div>

                      {/* Right: Upload Button & Reset Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer transition active:scale-95 shadow">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{dataUrl ? 'Replace' : 'Upload new cursor'}</span>
                          <input
                            type="file"
                            accept=".cur,.ani"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleCursorFile(role.id, f)
                              e.target.value = ''
                            }}
                          />
                        </label>

                        {dataUrl && (
                          <button
                            onClick={() => updateCursors({ [role.id]: '' })}
                            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Reset to default pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SOUNDS (Search bar, wide horizontal cards, all Windows sounds, play preview, upload) */}
          {activeStep === 'sounds' && (
            <div className="h-full flex flex-col justify-between space-y-3">
              {/* Search Bar & Stats */}
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={soundSearch}
                    onChange={(e) => setSoundSearch(e.target.value)}
                    placeholder="Search sound events..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <span className="font-mono text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  {configuredSoundsList.length} / {WINDOWS_SOUND_EVENTS.length} Sounds Configured
                </span>
              </div>

              {/* Wide Horizontal Strip Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {WINDOWS_SOUND_EVENTS.filter(
                  (evt) =>
                    evt.name.toLowerCase().includes(soundSearch.toLowerCase()) ||
                    evt.id.toLowerCase().includes(soundSearch.toLowerCase()) ||
                    evt.key.toLowerCase().includes(soundSearch.toLowerCase())
                ).map((evt) => {
                  const dataUrl = theme.sounds.events?.[evt.id]
                  const fileMeta = theme.sounds.files?.[evt.id]
                  const isPlaying = playingAudioId === evt.id

                  return (
                    <div
                      key={evt.id}
                      className={`rounded-xl border p-3 flex items-center justify-between gap-4 transition group ${
                        dataUrl
                          ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                          : 'border-white/[0.08] bg-black/40 hover:border-white/20 hover:bg-black/60'
                      }`}
                    >
                      {/* Left: Audio Wave Icon container */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="h-11 w-11 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300">
                          <Volume2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{evt.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">[{evt.key}]</span>
                          </div>
                          <span className="text-[11px] text-slate-400 truncate max-w-sm">
                            {evt.desc}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Configured Status */}
                      <div className="flex-1 min-w-0 hidden md:block">
                        {dataUrl ? (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Check className="h-3 w-3" />
                            <span className="font-mono text-white truncate max-w-[200px]">
                              {fileMeta?.fileName || 'custom.wav'}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">· PCM WAV Ready</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-400">
                            Using Windows Default Sound Cue
                          </div>
                        )}
                      </div>

                      {/* Right: Audio Playback Preview & Upload Trigger */}
                      <div className="flex items-center gap-2 shrink-0">
                        {dataUrl && (
                          <button
                            onClick={() => handleTogglePlayAudio(evt.id, dataUrl)}
                            className={`p-2 rounded-xl border transition ${
                              isPlaying
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                                : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                            }`}
                            title={isPlaying ? 'Stop playback' : 'Play audio preview'}
                          >
                            {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </button>
                        )}

                        <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer transition active:scale-95 shadow">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{dataUrl ? 'Replace' : 'Upload sound'}</span>
                          <input
                            type="file"
                            accept="audio/*,.wav,.mp3,.ogg,.m4a"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleSoundFile(evt.id, f)
                              e.target.value = ''
                            }}
                          />
                        </label>

                        {dataUrl && (
                          <button
                            onClick={() => updateSounds({ [evt.id]: '' })}
                            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove sound"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 5: APPEARANCE (Dropdown for Dark/Light/System, Windows default accent swatches, Custom color +, prevalence toggle) */}
          {activeStep === 'appearance' && (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-y-auto pr-1">
                {/* Left: Mode Dropdown & Windows Presets */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-5 flex flex-col justify-between">
                  {/* System Color Mode Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      System Color Mode
                    </label>
                    <select
                      value={theme.appearance.colorMode}
                      onChange={(e) => updateAppearance({ colorMode: e.target.value as any })}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="dark">Dark (Windows & Apps dark mode)</option>
                      <option value="light">Light (Windows & Apps light mode)</option>
                      <option value="system">System (Follow Windows default setting)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Configures Windows Personalize AppsUseLightTheme and SystemUsesLightTheme keys.
                    </p>
                  </div>

                  {/* Windows Default Accent Swatches */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Windows Default Accent Colors
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {ACCENT_PRESETS.map((p) => {
                        const isSelected = accent.toUpperCase() === p.hex.toUpperCase()
                        return (
                          <button
                            key={p.hex}
                            onClick={() => {
                              updateAppearance({ accentColor: p.hex, windowColor: p.hex })
                            }}
                            className={`p-2 rounded-xl border text-left text-xs transition flex flex-col gap-1.5 ${
                              isSelected
                                ? 'border-white bg-white/20 shadow-md ring-1 ring-white/30'
                                : 'border-white/10 bg-black/60 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="h-4 w-4 rounded-full shadow" style={{ backgroundColor: p.hex }} />
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="font-bold text-white truncate text-[10px]">{p.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Select Custom Color / + Add Button */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomColorPicker((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 transition"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                      <span>Select Custom Color / Add Custom Hex</span>
                    </button>

                    {showCustomColorPicker && (
                      <div className="flex items-center gap-3 pt-1">
                        <input
                          type="color"
                          value={accent}
                          onChange={(e) => updateAppearance({ accentColor: e.target.value, windowColor: e.target.value })}
                          className="h-10 w-10 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={accent}
                          onChange={(e) => updateAppearance({ accentColor: e.target.value, windowColor: e.target.value })}
                          placeholder="#4F585E"
                          className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Color Prevalence Toggle & Live Visual Simulation */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  {/* Enable accent color on taskbar, start menu, and title bar */}
                  <div className="rounded-xl border border-white/10 bg-black/50 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Enable Accent Color on Taskbar, Start Menu & Title Bars</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Applies active color prevalence to Windows 11 DWM titlebars and shell taskbar
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.appearance.colorPrevalence}
                      onChange={(e) => updateAppearance({ colorPrevalence: e.target.checked })}
                      className="h-5 w-5 rounded border-white/20 bg-black/40 text-white focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {/* Desktop DWM Window Simulation Preview */}
                  <div className="rounded-xl border border-white/10 bg-[#090c10] p-4 space-y-3 shadow-inner">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Live Windows Title Bar & Shell Simulation
                    </div>

                    {/* Window title bar mockup */}
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <div
                        className="h-8 px-3 flex items-center justify-between text-xs font-semibold"
                        style={{
                          backgroundColor: theme.appearance.colorPrevalence ? accent : isDark ? '#1a222d' : '#e2e8f0',
                          color: theme.appearance.colorPrevalence ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Cpu className="h-3.5 w-3.5" />
                          <span>{theme.metadata.name || 'Sample Windows App'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                          <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                          <span className="h-2 w-2 rounded-full bg-slate-400/80" />
                        </div>
                      </div>

                      <div className="p-3 bg-black/40 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Accent Hex Code:</span>
                          <span className="font-mono font-bold text-white" style={{ color: accent }}>{accent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Prevalence Active:</span>
                          <span className="font-mono">{theme.appearance.colorPrevalence ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CREATOR (Author name, Website optional, Email optional, Author note optional, Branding icon) */}
          {activeStep === 'creator' && (
            <div className="h-full flex flex-col justify-between space-y-4">
              <input
                ref={iconInputRef}
                type="file"
                accept=".ico,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      updateMetadata({ icon: ev.target?.result as string })
                    }
                    reader.readAsDataURL(file)
                  }
                  e.target.value = ''
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-y-auto pr-1">
                {/* Left Column: Author Name, Website URL, Email */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Author Name *</span>
                      <span className="text-[10px] font-mono text-emerald-400">Required</span>
                    </label>
                    <input
                      type="text"
                      value={theme.metadata.author?.name || ''}
                      onChange={(e) =>
                        updateMetadata({
                          author: { ...(theme.metadata.author || {}), name: e.target.value },
                        })
                      }
                      placeholder="e.g. Rox Design or Studio Name"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400">The author or creator name shown in the Windows installer.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Website URL</span>
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    </label>
                    <input
                      type="url"
                      value={theme.metadata.author?.url || ''}
                      onChange={(e) =>
                        updateMetadata({
                          author: { ...(theme.metadata.author || {}), url: e.target.value },
                        })
                      }
                      placeholder="https://github.com/..."
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Support Email</span>
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    </label>
                    <input
                      type="email"
                      value={theme.metadata.author?.email || ''}
                      onChange={(e) =>
                        updateMetadata({
                          author: { ...(theme.metadata.author || {}), email: e.target.value },
                        })
                      }
                      placeholder="contact@example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right Column: Author Note & Branding Icon */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Author Note</span>
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    </label>
                    <textarea
                      rows={4}
                      value={theme.metadata.author?.notes || ''}
                      onChange={(e) =>
                        updateMetadata({
                          author: { ...(theme.metadata.author || {}), notes: e.target.value },
                        })
                      }
                      placeholder="Attribution notes, design acknowledgements, or release comments..."
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Branding Icon */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Branding Icon (Installer Icon)</div>
                        <div className="text-[11px] text-slate-400">Icon displayed on the Windows installer binary</div>
                      </div>
                      {theme.metadata.icon && (
                        <button
                          onClick={() => updateMetadata({ icon: '' })}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                          title="Remove icon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {theme.metadata.icon ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={theme.metadata.icon}
                          alt="Icon Preview"
                          className="h-10 w-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10"
                        />
                        <div className="text-xs text-slate-300">
                          <div className="font-bold text-white">Custom Branding Icon Active</div>
                          <div className="text-[10px] font-mono text-emerald-400">Embedded in Installer Executable</div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => iconInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/20 transition shadow"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Branding Icon (.ico / .png)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PREVIEW (Visual preview of everything added: wallpapers, accent, cursors, sounds) */}
          {activeStep === 'preview' && (
            <div className="h-full flex flex-col justify-between space-y-4 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-y-auto pr-1">
                {/* Desktop Sandbox Simulation (7 cols) */}
                <div
                  className="lg:col-span-7 rounded-2xl border border-white/[0.1] overflow-hidden relative shadow-2xl flex flex-col justify-between bg-cover bg-center min-h-[300px]"
                  style={{
                    backgroundColor: '#0c0f14',
                    backgroundImage: activeWallpaper
                      ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('${activeWallpaper}')`
                      : `radial-gradient(ellipse at 50% 30%, ${accent}44, #080a0f)`,
                  }}
                >
                  {/* Floating Simulated Window */}
                  <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-4/5 max-w-md rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl"
                    style={{
                      backgroundColor: isDark ? 'rgba(15, 20, 27, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                      borderColor: theme.appearance.colorPrevalence ? accent : 'rgba(255,255,255,0.15)',
                    }}
                  >
                    <div
                      className="h-8 px-4 flex items-center justify-between text-xs font-semibold"
                      style={{
                        backgroundColor: theme.appearance.colorPrevalence ? accent : isDark ? '#1a222d' : '#e2e8f0',
                        color: theme.appearance.colorPrevalence ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a',
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>{theme.metadata.name || 'Sample Application'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                        <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                        <span className="h-2 w-2 rounded-full bg-slate-400/80" />
                      </div>
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Windows DWM Accent Active</span>
                        <span
                          className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm"
                          style={{ backgroundColor: accent }}
                        >
                          {accent}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Colorization applied to Windows titlebars and immersive shell components.
                      </p>
                    </div>
                  </div>

                  {/* Slideshow switcher on sandbox if in slideshow mode */}
                  {theme.wallpaper.mode === 'slideshow' && currentSlides.length > 1 && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur rounded-full p-1 border border-white/20">
                      <button
                        onClick={() =>
                          setSlideshowPreviewIdx((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)
                        }
                        className="p-1 rounded-full text-slate-300 hover:text-white"
                        title="Previous wallpaper"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] font-mono px-1">
                        {safeSlideIdx + 1}/{currentSlides.length}
                      </span>
                      <button
                        onClick={() =>
                          setSlideshowPreviewIdx((prev) => (prev + 1) % currentSlides.length)
                        }
                        className="p-1 rounded-full text-slate-300 hover:text-white"
                        title="Next wallpaper"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div />

                  {/* Windows 11 Taskbar simulation */}
                  <div className="h-10 border-t border-white/10 bg-black/60 backdrop-blur-md px-4 flex items-center justify-between text-xs z-10">
                    <div className="w-12" />
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer"
                        style={{ backgroundColor: theme.appearance.colorPrevalence ? `${accent}40` : 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="grid grid-cols-2 gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: accent }} />
                          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: accent }} />
                          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: accent }} />
                          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: accent }} />
                        </div>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                        <Terminal className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">11:11 AM</div>
                  </div>
                </div>

                {/* Right Inspection Column (5 cols): ONLY SHOW WHAT IS CONFIGURED */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Replaced Cursors (Only show replaced cursors) */}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <MousePointer className="h-3.5 w-3.5 text-slate-300" />
                        <span>Configured Cursors</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {configuredCursorsList.length} Replaced
                      </span>
                    </div>

                    {configuredCursorsList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1">
                        Default Windows pointer scheme active. No custom cursors replaced.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {configuredCursorsList.map(([roleId]) => {
                          const roleMeta = WINDOWS_CURSOR_ROLES.find((r) => r.id === roleId)
                          const fileMeta = theme.cursors.files?.[roleId]
                          return (
                            <div
                              key={roleId}
                              className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <DefaultPointerGlyph roleId={roleId} className="h-4 w-4" />
                                <span className="font-bold text-white truncate">{roleMeta?.name || roleId}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                                {fileMeta?.fileName || 'custom.cur'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Added Sound Effects (Only show added sounds with playable preview) */}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Volume2 className="h-3.5 w-3.5 text-slate-300" />
                        <span>Configured Audio Cues</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {configuredSoundsList.length} Added
                      </span>
                    </div>

                    {configuredSoundsList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1">
                        Default Windows system sounds active. No sound effects added.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {configuredSoundsList.map(([eventId, dataUrl]) => {
                          const evtMeta = WINDOWS_SOUND_EVENTS.find((e) => e.id === eventId)
                          const isPlaying = playingAudioId === eventId
                          return (
                            <div
                              key={eventId}
                              className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-white truncate">{evtMeta?.name || eventId}</span>
                              </div>

                              <button
                                onClick={() => handleTogglePlayAudio(eventId, dataUrl)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                  isPlaying
                                    ? 'bg-amber-400 text-slate-950 shadow'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                {isPlaying ? <Square className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                                <span>{isPlaying ? 'Stop' : 'Play'}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Theme Specs Overview */}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wallpaper:</span>
                      <span className="text-white capitalize">
                        {theme.wallpaper.mode} ({theme.wallpaper.mode === 'slideshow' ? `${currentSlides.length} slides` : '1 image'})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accent Color:</span>
                      <span className="text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                        {accent}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Creator:</span>
                      <span className="text-white">{theme.metadata.author?.name || 'Unattributed'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: INSTALLER (Name installer, Win32 Prompt, Build Windows Installer -> Direct Download Button) */}
          {activeStep === 'installer' && (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-y-auto pr-1">
                {/* Left Column: Installer Binary Details */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Executable Binary Filename
                      </label>
                      <input
                        type="text"
                        value={theme.installer?.artifactName || `${theme.metadata.id || 'theme'}.exe`}
                        onChange={(e) => updateInstaller({ artifactName: e.target.value })}
                        placeholder="theme.exe"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-mono text-white focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400">Standalone portable Windows binary compiled with embedded theme payload.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Product Display Name
                      </label>
                      <input
                        type="text"
                        value={theme.installer?.productName || theme.metadata.name || ''}
                        onChange={(e) => updateInstaller({ productName: e.target.value })}
                        placeholder="e.g. Cyber Dusk Installer"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Confirmation Dialog Title
                      </label>
                      <input
                        type="text"
                        value={theme.installer?.confirmationTitle || 'Install theme'}
                        onChange={(e) => updateInstaller({ confirmationTitle: e.target.value })}
                        placeholder="Install theme"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Compilation Action Box */}
                  <div className="pt-2">
                    {buildStep === 'complete' ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-emerald-400">Windows Installer Ready</h4>
                            <p className="text-[11px] text-slate-300">
                              Compiled standalone portable executable with embedded theme assets.
                            </p>
                          </div>
                        </div>

                        {/* Direct Download Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          {exeBase64 && (
                            <button
                              type="button"
                              onClick={handleDownloadExe}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download Executable (.exe)</span>
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
                    ) : (
                      <button
                        type="button"
                        onClick={handleBuildInstallerNow}
                        disabled={buildStep === 'building'}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3.5 text-xs font-bold transition shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {buildStep === 'building' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Building Windows Installer...</span>
                          </>
                        ) : (
                          <>
                            <PackageCheck className="h-4 w-4" />
                            <span>Build Windows Installer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Native Win32 Dialog Mockup & Build Logs */}
                <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Windows Native Confirmation Prompt
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-slate-950 p-5 shadow-2xl space-y-4">
                      <div className="text-xs font-bold text-white flex items-center justify-between border-b border-white/10 pb-2.5">
                        <span>{theme.installer?.confirmationTitle || 'Install theme'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Win32 Dialog</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Install theme: <span className="font-bold text-white">{theme.metadata.name || 'Untitled'}</span> by{' '}
                        <span className="text-slate-200">{theme.metadata.author?.name || 'Creator'}</span>?
                      </p>

                      <div className="flex justify-end gap-2 pt-2">
                        <span className="rounded-lg bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-300">Cancel</span>
                        <span className="rounded-lg bg-white px-3.5 py-1 text-xs font-bold text-slate-950">Install</span>
                      </div>
                    </div>
                  </div>

                  {/* Console logs */}
                  {buildLogs.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                      {buildLogs.map((log, idx) => (
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

                  {/* Export theme.json */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadManifest}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                      <FileJson className="h-3.5 w-3.5" />
                      <span>Export theme.json</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Bottom Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] shrink-0 relative z-10">
          <div>
            {activeIndex > 0 && (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous: {STEPS[activeIndex - 1].label}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeIndex < STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
              >
                <span>Next: {STEPS[activeIndex + 1].label}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={buildStep === 'complete' ? handleDownloadExe : handleBuildInstallerNow}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow"
              >
                {buildStep === 'complete' ? (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Installer (.exe)</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    <span>Build Windows Installer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
