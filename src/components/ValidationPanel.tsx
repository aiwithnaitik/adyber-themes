'use client'

import React from 'react'
import { ValidationReport } from '../types/theme'

import { ThemeSectionId } from '../hooks/useThemeState'

interface ValidationPanelProps {
  validation: ValidationReport;
  onNavigateToSection: (section: ThemeSectionId) => void;
  onOpenBuildModal: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  onNavigateToSection,
  onOpenBuildModal,
}) => {
  const categories = [
    { id: 'general', title: 'General & Metadata', icon: '⚙️' },
    { id: 'wallpaper', title: 'Wallpaper & Slideshow', icon: '🖼️' },
    { id: 'cursors', title: 'Mouse Cursors', icon: '👆' },
    { id: 'sounds', title: 'Sound Scheme', icon: '🔊' },
    { id: 'appearance', title: 'Colors & Appearance', icon: '🎨' },
    { id: 'creator', title: 'Creator Information', icon: '👤' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Pre-Flight Validation Report</h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated linting verifying your theme against Windows compatibility rules.
        </p>
      </div>

      {/* Global Status Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-6 ${
          validation.isValid
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-rose-500/30 bg-rose-500/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{validation.isValid ? '✅' : '❌'}</span>
          <div>
            <h3 className="text-base font-bold text-white">
              {validation.isValid
                ? 'All Validation Checks Passed!'
                : `Validation Issues Found (${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''})`}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {validation.isValid
                ? 'Theme manifest and media assets are fully compliant with specification v1.0.0.'
                : 'Please resolve the highlighted errors before generating your standalone Windows installer.'}
            </p>
          </div>
        </div>

        {validation.isValid && (
          <button
            onClick={onOpenBuildModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:from-sky-400 hover:to-blue-500 transition active:scale-95 shrink-0"
          >
            <span>Proceed to Build</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Category Checklists */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const categoryErrors = validation.errors.filter((e) => e.section === cat.id)
          const categoryWarnings = validation.warnings.filter((w) => w.section === cat.id)
          const isPassed = categoryErrors.length === 0

          return (
            <div
              key={cat.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{cat.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{cat.title}</h4>
                    {isPassed ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        PASS
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                        {categoryErrors.length} ERROR
                      </span>
                    )}
                    {categoryWarnings.length > 0 && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                        {categoryWarnings.length} NOTICE
                      </span>
                    )}
                  </div>

                  {categoryErrors.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {categoryErrors.map((err, i) => (
                        <li key={i} className="text-xs text-rose-400 flex items-center gap-1.5">
                          <span>●</span> {err.message}
                        </li>
                      ))}
                    </ul>
                  ) : categoryWarnings.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {categoryWarnings.map((warn, i) => (
                        <li key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                          <span>⚠️</span> {warn.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Verified compliant with theme schema.</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onNavigateToSection(cat.id as ThemeSectionId)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition self-start sm:self-auto shrink-0"
              >
                Configure →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
