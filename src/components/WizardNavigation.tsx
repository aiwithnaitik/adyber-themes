'use client'

import React from 'react'
import { THEME_STEPS, ThemeSectionId } from '../hooks/useThemeState'
import {
  Lock,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
} from 'lucide-react'

interface WizardNavigationProps {
  activeSection: ThemeSectionId;
  currentStepIndex: number;
  highestStepReached: number;
  isCurrentStepValid: boolean;
  onGoToStep: (stepId: ThemeSectionId) => void;
  onGoToNext: () => void;
  onGoToPrev: () => void;
  validationErrorHint?: string;
  nextButtonLabel?: string;
}

export const WizardStepper: React.FC<{
  activeSection: ThemeSectionId;
  highestStepReached: number;
  onGoToStep: (stepId: ThemeSectionId) => void;
  isStepAccessible: (stepId: ThemeSectionId) => boolean;
}> = ({ activeSection, highestStepReached, onGoToStep, isStepAccessible }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 mb-6">
      <div className="flex items-center gap-1.5 min-w-[720px]">
        {THEME_STEPS.map((step, idx) => {
          const isActive = activeSection === step.id
          const isPassed = highestStepReached > idx + 1
          const accessible = isStepAccessible(step.id)

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => accessible && onGoToStep(step.id)}
                disabled={!accessible}
                title={!accessible ? 'Complete previous steps to unlock' : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : isPassed
                    ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                    : accessible
                    ? 'bg-white/[0.04] text-slate-400 hover:text-white'
                    : 'bg-transparent text-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : accessible
                      ? 'bg-white/10 text-slate-300'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {!accessible ? (
                    <Lock className="h-2.5 w-2.5" />
                  ) : isPassed && !isActive ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    step.number
                  )}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < THEME_STEPS.length - 1 && (
                <div
                  className={`h-[1px] w-3.5 shrink-0 transition ${
                    idx + 1 < highestStepReached ? 'bg-emerald-500/40' : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export const WizardStepFooter: React.FC<WizardNavigationProps> = ({
  currentStepIndex,
  isCurrentStepValid,
  onGoToNext,
  onGoToPrev,
  validationErrorHint,
  nextButtonLabel,
}) => {
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === THEME_STEPS.length - 1
  const nextStep = !isLastStep ? THEME_STEPS[currentStepIndex + 1] : null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-white/[0.08]">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onGoToPrev}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition active:scale-[0.98]"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
            <span>Previous Step</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!isCurrentStepValid && validationErrorHint && (
          <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>{validationErrorHint}</span>
          </span>
        )}

        {!isLastStep ? (
          <button
            type="button"
            onClick={onGoToNext}
            disabled={!isCurrentStepValid}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>{nextButtonLabel || `Next: ${nextStep?.label}`}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToNext}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition active:scale-[0.98]"
          >
            <PackageCheck className="h-4 w-4" />
            <span>Finish & Package Theme</span>
          </button>
        )}
      </div>
    </div>
  )
}
