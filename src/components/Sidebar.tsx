'use client'

import React from 'react'
import { ValidationReport } from '../types/theme'
import { ThemeSectionId } from '../hooks/useThemeState'
import {
  Settings,
  Image as ImageIcon,
  MousePointer,
  Volume2,
  Palette,
  User,
  Package,
  Monitor,
  ShieldCheck,
  Lock,
  Check,
  PackageCheck,
} from 'lucide-react'

interface SidebarProps {
  activeSection: ThemeSectionId;
  onSelectSection: (section: ThemeSectionId) => void;
  highestStepReached: number;
  isStepAccessible: (section: ThemeSectionId) => boolean;
  validation: ValidationReport;
  onOpenBuildModal: () => void;
}

interface NavItem {
  id: ThemeSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  stepNumber?: number;
  sectionKey?: 'general' | 'wallpaper' | 'cursors' | 'sounds' | 'appearance' | 'creator';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: '1. General', icon: Settings, stepNumber: 1, sectionKey: 'general' },
  { id: 'wallpaper', label: '2. Wallpaper', icon: ImageIcon, stepNumber: 2, sectionKey: 'wallpaper' },
  { id: 'cursors', label: '3. Cursors', icon: MousePointer, stepNumber: 3, sectionKey: 'cursors' },
  { id: 'sounds', label: '4. Sounds', icon: Volume2, stepNumber: 4, sectionKey: 'sounds' },
  { id: 'appearance', label: '5. Appearance', icon: Palette, stepNumber: 5, sectionKey: 'appearance' },
  { id: 'creator', label: '6. Creator Info', icon: User, stepNumber: 6, sectionKey: 'creator' },
  { id: 'installer', label: '7. Installer Settings', icon: Package, stepNumber: 7 },
  { id: 'preview', label: '8. Preview & Build', icon: Monitor, stepNumber: 8 },
  { id: 'validation', label: 'Validation Report', icon: ShieldCheck },
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  highestStepReached,
  isStepAccessible,
  validation,
  onOpenBuildModal,
}) => {
  return (
    <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-[#0c1016]/80 backdrop-blur-xl flex flex-col justify-between">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Creation Pipeline
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          const accessible = isStepAccessible(item.id)
          const isPassed = item.stepNumber ? highestStepReached > item.stepNumber : false
          const Icon = item.icon

          const sectionErrors = item.sectionKey
            ? validation.errors.filter((e) => e.section === item.sectionKey).length
            : item.id === 'validation'
            ? validation.errors.length
            : 0

          return (
            <button
              key={item.id}
              onClick={() => accessible && onSelectSection(item.id)}
              disabled={!accessible}
              title={!accessible ? 'Complete previous steps to unlock this section' : undefined}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-white/10 text-white font-semibold border-l-2 border-slate-200 shadow-sm'
                  : accessible
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed opacity-50 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {!accessible && item.stepNumber && (
                  <Lock className="h-3 w-3 text-slate-400" />
                )}

                {accessible && isPassed && !isActive && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full h-4 w-4 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}

                {sectionErrors > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/30">
                    {sectionErrors}
                  </span>
                )}

                {item.id === 'validation' && sectionErrors === 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/[0.08] space-y-2">
        <button
          onClick={onOpenBuildModal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition active:scale-[0.98]"
        >
          <PackageCheck className="h-4 w-4" />
          <span>Create Installer</span>
        </button>

        <p className="text-center text-[11px] text-slate-400">
          {validation.isValid ? (
            <span className="text-emerald-400 font-medium">Ready to package</span>
          ) : (
            <span className="text-rose-400 font-medium">
              {validation.errors.length} issue(s) remaining
            </span>
          )}
        </p>
      </div>
    </aside>
  )
}
