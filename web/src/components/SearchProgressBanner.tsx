import { motion } from 'motion/react';
import type { StyleProposalId } from '../types/agent';

interface SearchProgressBannerProps {
  activeStyle: StyleProposalId;
  activeStep: number;
}

const TOTAL_PHASES = 4;

export function SearchProgressBanner({
  activeStyle,
  activeStep
}: SearchProgressBannerProps) {
  const isClinical = activeStyle === 'clinical-light';

  const progressPercent = Math.min(100, ((activeStep + 1) / TOTAL_PHASES) * 100);

  if (isClinical) {
    return (
      <motion.div
        initial={{ opacity: 0.94, scale: 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        role="status"
        aria-live="polite"
        className="relative"
      >
        {/* Soft Iridescent Liquid Glass Halo behind the preparation card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 rounded-[44px] opacity-95"
          style={{
            background:
              'radial-gradient(circle at 22% 30%, rgba(96, 165, 250, 0.36) 0%, transparent 56%), radial-gradient(circle at 78% 70%, rgba(244, 114, 182, 0.34) 0%, transparent 56%), radial-gradient(circle at 50% 25%, rgba(167, 139, 250, 0.3) 0%, transparent 62%)'
          }}
        />

        <div className="liquid-glass-shell relative overflow-hidden rounded-[28px] p-6 sm:p-8 text-slate-900">
          {/* Subtle animated iridescent ribbon across top edge */}
          <div
            aria-hidden="true"
            className="animate-iridescent-flow pointer-events-none absolute inset-x-0 top-0 h-[4px] w-[160%] bg-gradient-to-r from-sky-400 via-indigo-500 via-50% to-pink-400 opacity-95"
          />

          <div className="flex items-center gap-4">
            {/* Organic Liquid Glass Droplet */}
            <div
              aria-hidden="true"
              className="relative flex h-16 w-16 shrink-0 items-center justify-center"
            >
              <div className="liquid-glass-orb animate-liquid-swirl h-16 w-16 rounded-[44%_56%_52%_48%/48%_42%_58%_52%]" />
              <div className="pointer-events-none absolute h-5 w-5 rounded-full bg-white/80 blur-[1.5px] -translate-x-2.5 -translate-y-2.5" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                Préparation de la réponse en cours…
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-700">
                Synthèse dans les monographies locales
              </p>
            </div>
          </div>

          {/* Iridescent Liquid Glass Progress Track */}
          <div
            role="progressbar"
            aria-label="Progression de la recherche"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            className="neu-inset-well relative mt-6 h-3 w-full overflow-hidden rounded-full p-[2px]"
          >
            <motion.div
              initial={{ width: '18%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 95, damping: 24 }}
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-400"
            >
              <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/75 to-transparent" />
            </motion.div>
          </div>

          {/* Soft Frosted Iridescent Skeleton Preview of incoming answer */}
          <div className="mt-6 space-y-3 border-t border-white/80 pt-5" aria-hidden="true">
            <div className="relative h-4 w-56 overflow-hidden rounded-full bg-gradient-to-r from-sky-300/60 via-indigo-300/60 to-pink-300/60">
              <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/75">
              <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" />
            </div>
            <div className="relative h-3 w-5/6 overflow-hidden rounded-full bg-gradient-to-r from-indigo-200/65 to-pink-200/65">
              <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/75 p-5 text-slate-200 backdrop-blur-xl"
    >
      <div className="mb-3">
        <span className="text-sm font-medium">
          Recherche en cours dans le corpus local…
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Progression de la recherche"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent)}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
      >
        <motion.div
          initial={{ width: '10%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 24 }}
          className="relative h-full rounded-full bg-cyan-400"
        >
          <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
}
