import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  RotateCcw,
  Search
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import { LiveParticleWaveCanvas } from '../LiveParticleWaveCanvas';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { SearchProgressBanner } from '../SearchProgressBanner';
import { SourceInspectorPanel } from '../SourceInspectorPanel';
import type { WorkspaceProps } from './workspaceProps';

export function ObsidianGlassWorkspace({
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
  const stageRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={stageRef}
      onMouseMove={handlePointerMove}
      className="relative overflow-hidden bg-[#07090E] text-slate-100 font-dm min-h-[calc(100vh-66px)]"
      style={
        {
          '--mx': '50%',
          '--my': '20%'
        } as React.CSSProperties
      }
    >
      {/* LangSmith-inspired live flowing cyan particle wave field */}
      <LiveParticleWaveCanvas variant="obsidian" isSearching={isSearching} />

      {/* Subtle calibrated radial spotlight following cursor (no React re-render) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(640px circle at var(--mx) var(--my), rgba(6, 182, 212, 0.085), transparent 70%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Centered Luxury Header & Glass Composer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400">
                Obsidienne Verre · Thème sombre
              </p>
              <h1 className="font-outfit mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
                Recherche pharmacologique
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Réponses limitées au corpus local et accompagnées d&apos;un avertissement médical.
            </p>
          </div>

          {/* Frosted Glass Query Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="rounded-2xl border border-slate-800/90 bg-slate-900/65 p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-black/40 transition-colors focus-within:border-cyan-500/50"
          >
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="obsidian-question-input"
                className="font-outfit text-sm font-medium text-slate-200"
              >
                Question
              </label>
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            <textarea
              id="obsidian-question-input"
              rows={3}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Interrogez le corpus sur les antithrombotiques, posologies ou interactions…"
              className="mt-3 w-full resize-y rounded-xl border border-slate-800 bg-[#0B0F17]/90 px-4 py-3 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-500 transition-all focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />

            {validationError && (
              <p role="alert" className="mt-2.5 text-xs font-medium text-rose-400">
                {validationError}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
              <span className="text-xs text-slate-500">
                Ctrl + Entrée pour interroger le corpus
              </span>
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-150 hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isSearching ? 'Analyse…' : 'Rechercher'}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results & Live Source Inspector Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <SearchProgressBanner
                  key="searching"
                  activeStyle="obsidian-glass"
                  activeStep={searchStep}
                />
              ) : result ? (
                <motion.article
                  key={result.id}
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8 backdrop-blur-xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      {result.scope === 'in_scope' ? (
                        <CheckCircle2
                          className="h-4 w-4 text-cyan-400 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertTriangle
                          className="h-4 w-4 text-amber-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={
                          result.scope === 'in_scope'
                            ? 'text-cyan-200'
                            : 'text-amber-300'
                        }
                      >
                        {result.statusLabel}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span className="font-mono-code text-slate-400">
                        {result.timestamp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onCopyResult}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{copied ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>

                  <div className="mt-6">
                    <MarkdownRenderer
                      markdown={result.markdownAnswer}
                      activeStyle="obsidian-glass"
                      selectedCitation={selectedCitation}
                      onSelectCitation={(f) => onSelectCitation(f)}
                    />
                  </div>

                  <div className="mt-8 rounded-xl border border-slate-800 bg-[#0B0F17]/80 px-4 py-3.5 text-xs leading-relaxed text-slate-400">
                    {result.disclaimer}
                  </div>
                </motion.article>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/35 p-10 text-center"
                >
                  <p className="font-outfit text-base font-medium text-slate-200">
                    Console prête pour l&apos;analyse
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Formulez votre question ci-dessus ou testez un cas hors périmètre pour observer le filtrage.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-5 xl:col-span-4 space-y-5">
            {result && !isSearching && (
              <SourceInspectorPanel
                activeStyle="obsidian-glass"
                selectedFilename={selectedCitation}
                citedFiles={result.citedFiles}
                onSelectCitation={onSelectCitation}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
