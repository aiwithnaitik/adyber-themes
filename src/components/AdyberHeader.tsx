'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  MoreVertical,
  ExternalLink,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react'

interface AdyberHeaderProps {
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
}

export const AdyberHeader: React.FC<AdyberHeaderProps> = ({
  onOpenHelp,
  onOpenSettings,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="w-full bg-transparent px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between select-none">
      {/* Left: Brand Name */}
      <div className="flex items-center gap-3">
        <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
          Adyber Themes
        </span>
      </div>

      {/* Right: Social Media, Menu, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Discord Link */}
        <a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
          title="Join Discord"
          aria-label="Discord"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </a>

        {/* Instagram Link */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
          title="Follow on Instagram"
          aria-label="Instagram"
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>

        {/* X / Twitter Link */}
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
          title="Follow on X"
          aria-label="X"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* Help Icon */}
        <button
          onClick={onOpenHelp}
          className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
          title="Documentation & Guide"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Three Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
            title="More Options"
            aria-label="Menu"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#0f1319] p-1.5 shadow-2xl z-50 space-y-1"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                System Options
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  onOpenHelp?.()
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white text-left transition"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Architecture Guide</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  onOpenSettings?.()
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white text-left transition"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Preferences</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Pill Badge (matching screenshot exactly) */}
        <div className="flex items-center gap-2 rounded-full bg-[#12161f] border border-white/15 pl-2 pr-1 py-1 shadow-sm">
          <span className="rounded bg-black/70 border border-white/20 px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider text-white">
            PRO
          </span>
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full p-[1.5px] bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0d14] text-[10px] font-bold text-white">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
