import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  RotateCcw,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { LiveParticleWaveCanvas } from '../LiveParticleWaveCanvas';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { SearchProgressBanner } from '../SearchProgressBanner';
import { SourceInspectorPanel } from '../SourceInspectorPanel';
import type { WorkspaceProps } from './workspaceProps';

export function ClinicalLightWorkspace({
  query,
  onQueryChange,
  validationError,
  isSearching,
  searchStep,
  result,
  selectedCitation,
  onSelectCitation,
  onSubmit,
  onClear,
  copied,
  onCopyResult
}: WorkspaceProps) {
  return (
    <div className="relative overflow-hidden bg-[#F5F6FA] text-slate-900 font-jakarta min-h-[calc(100vh-66px)]">
      {/* Material Aesthetics: soft periwinkle-lavender, sky-blue, and rose-blush atmospheric washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-[-10%] h-[620px] w-[660px] rounded-full opacity-90"
        style={{
          background:
            'radial-gradient(circle, rgba(165, 180, 252, 0.36) 0%, rgba(147, 197, 253, 0.2) 40%, transparent 70%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[12%] right-[-10%] h-[640px] w-[680px] rounded-full opacity-90"
        style={{
          background:
            'radial-gradient(circle, rgba(249, 168, 212, 0.32) 0%, rgba(196, 181, 253, 0.2) 42%, transparent 72%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-[28%] h-[520px] w-[640px] rounded-full opacity-85"
        style={{
          background:
            'radial-gradient(circle, rgba(147, 197, 253, 0.28) 0%, rgba(251, 207, 232, 0.2) 45%, transparent 72%)'
        }}
      />

      {/* LangSmith-inspired live flowing particle wave field */}
      <LiveParticleWaveCanvas variant="material-light" isSearching={isSearching} />

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 border-b border-slate-200/80 pb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-indigo-600">
              Clinique Clair · Glassmorphism · Neumorphism · Liquid Glass
            </p>
            <span className="font-mono-code text-[11px] text-slate-500">
              Corpus local · Synthèse sourcée
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Recherche pharmacologique
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
            Réponses limitées au corpus local et accompagnées d&apos;un avertissement médical.
          </p>
        </motion.div>

        {/* 3-Zone Material Aesthetics Workstation */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Glassmorphism Composer + Pillowy Neumorphism Presets */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className={`rounded-[26px] p-5 transition-all duration-300 ${
                isSearching ? 'liquid-glass-shell' : 'neu-glass-card'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="clinical-question-input"
                  className="text-sm font-semibold text-slate-900"
                >
                  Question
                </label>
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="neu-soft-btn inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all duration-150"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Effacer</span>
                  </button>
                )}
              </div>

              <textarea
                id="clinical-question-input"
                rows={4}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
                placeholder="Ex. Explique les différences entre anticoagulant, antiagrégant plaquettaire et thrombolytique."
                className="neu-inset-well mt-3 w-full resize-y rounded-2xl px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-indigo-400/70 focus:bg-white/85 focus:outline-none focus:ring-3 focus:ring-indigo-500/15"
              />

              {validationError && (
                <p role="alert" className="mt-2.5 text-xs font-medium text-rose-700">
                  {validationError}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-slate-500">
                  Ctrl + Entrée
                </span>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="neu-primary-btn relative overflow-hidden inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 active:translate-y-[1px] disabled:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  {isSearching && (
                    <span
                      aria-hidden="true"
                      className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-pink-200/45 to-transparent"
                    />
                  )}
                  <Search className="relative z-10 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="relative z-10">
                    {isSearching ? 'Préparation…' : 'Rechercher'}
                  </span>
                </button>
              </div>
            </form>
          </aside>

          {/* Center Column: Synthesis or Iridescent Liquid Glass Preparation */}
          <div className="lg:col-span-8 xl:col-span-6 space-y-6">
            {isSearching ? (
              <SearchProgressBanner
                key="searching"
                activeStyle="clinical-light"
                activeStep={searchStep}
              />
            ) : result ? (
              <motion.article
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="neu-glass-card rounded-[28px] p-6 sm:p-8"
              >
                {/* Scope & Tactile Copy Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {result.scope === 'in_scope' ? (
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-600 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="h-4 w-4 text-amber-600 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={
                        result.scope === 'in_scope'
                          ? 'text-emerald-800'
                          : 'text-amber-800'
                      }
                    >
                      {result.statusLabel}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="font-mono-code text-slate-500">
                      {result.timestamp}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onCopyResult}
                    className="neu-soft-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 hover:text-slate-900"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>

                {/* Markdown Body */}
                <div className="mt-5">
                  <MarkdownRenderer
                    markdown={result.markdownAnswer}
                    activeStyle="clinical-light"
                    selectedCitation={selectedCitation}
                    onSelectCitation={(f) => onSelectCitation(f)}
                  />
                </div>

                {/* Carved Soft UI Medical Disclaimer Well */}
                <div className="neu-inset-well mt-7 rounded-2xl px-4 py-3.5 text-xs leading-relaxed text-slate-600">
                  {result.disclaimer}
                </div>
              </motion.article>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="neu-glass-card rounded-[28px] p-12 text-center"
              >
                <p className="text-base font-semibold text-slate-900">
                  Prêt pour une nouvelle recherche pharmacologique
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  Saisissez une question à gauche pour interroger le corpus local.
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Live Source Inspector */}
          <aside className="lg:col-span-12 xl:col-span-3">
            {isSearching ? (
              <div className="liquid-glass-shell rounded-[24px] p-5 xl:sticky xl:top-24">
                <p className="text-xs font-semibold text-indigo-700">
                  Indexation des sources…
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  Sélection des extraits pharmacologiques pertinents et vérification des références.
                </p>
                <div className="mt-4 space-y-2.5" aria-hidden="true">
                  <div className="relative h-8 w-full overflow-hidden rounded-xl bg-white/70">
                    <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" />
                  </div>
                  <div className="relative h-3 w-4/5 overflow-hidden rounded-full bg-indigo-200/60">
                    <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                  </div>
                  <div className="relative h-3 w-3/5 overflow-hidden rounded-full bg-pink-200/60">
                    <span className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                  </div>
                </div>
              </div>
            ) : (
              result && (
                <div className="xl:sticky xl:top-24">
                  <SourceInspectorPanel
                    activeStyle="clinical-light"
                    selectedFilename={selectedCitation}
                    citedFiles={result.citedFiles}
                    onSelectCitation={onSelectCitation}
                  />
                </div>
              )
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
