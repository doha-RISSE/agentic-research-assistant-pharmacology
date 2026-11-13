import { BookOpen, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { CorpusDocument, StyleProposalId } from '../types/agent';
import { getDocumentByFilename } from '../utils/searchAgent';

interface SourceInspectorPanelProps {
  activeStyle: StyleProposalId;
  selectedFilename: string | null;
  citedFiles: string[];
  onSelectCitation: (filename: string | null) => void;
  embedded?: boolean;
}

export function SourceInspectorPanel({
  activeStyle,
  selectedFilename,
  citedFiles,
  onSelectCitation,
  embedded = false
}: SourceInspectorPanelProps) {
  const isDark = activeStyle === 'obsidian-glass';

  const activeFile = selectedFilename ?? citedFiles[0] ?? null;
  const doc: CorpusDocument | undefined = activeFile
    ? getDocumentByFilename(activeFile)
    : undefined;

  const panelClass = embedded
    ? 'text-[#1D222B]'
    : isDark
      ? 'bg-slate-900/65 border-slate-800/90 text-slate-200 backdrop-blur-xl rounded-xl border p-5'
      : 'neu-glass-card text-[#1D222B] rounded-[24px] p-5';

  if (!doc) {
    return (
      <div className={panelClass}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4 opacity-70" aria-hidden="true" />
          <span>Inspecteur du corpus local</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed opacity-75">
          Aucune source citée pour cette réponse.
        </p>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-200 ${panelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium opacity-75">
            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Extrait du corpus local</span>
          </div>
          <h4 className="mt-1 text-sm font-semibold leading-snug">
            {doc.title}
          </h4>
        </div>
        {selectedFilename && (
          <button
            type="button"
            onClick={() => onSelectCitation(null)}
            aria-label="Réinitialiser la sélection de source"
            className={`rounded-md p-1 transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-black/5 text-slate-500'
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Unboxed metadata with typographic separators */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-75">
        <span className="font-mono-code">{doc.filename}</span>
        <span aria-hidden="true">·</span>
        <span>{doc.authority}</span>
        <span aria-hidden="true">·</span>
        <span>Mise à jour {doc.updatedAt}</span>
      </div>

      {citedFiles.length > 1 && (
        <div
          role="tablist"
          aria-label="Sources citées dans la réponse"
          className={`mt-4 flex flex-wrap gap-1.5 ${
            activeStyle === 'clinical-light' ? 'neu-inset-well rounded-xl p-1.5' : ''
          }`}
        >
          {citedFiles.map((file) => {
            const isCurrent = file === doc.filename;
            return (
              <button
                key={file}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => onSelectCitation(file)}
                className={`rounded-lg px-2.5 py-1 font-mono-code text-[11px] transition-all duration-150 ${
                  !isDark
                    ? isCurrent
                      ? 'neu-primary-btn text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    : isCurrent
                      ? 'border border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                      : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {file}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={doc.filename}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 space-y-3 border-t border-current/10 pt-4"
        >
          <p className="text-xs font-medium opacity-80">{doc.therapeuticClass}</p>
          {doc.excerpts.map((excerpt, idx) => (
            <p key={idx} className="text-xs leading-relaxed opacity-90">
              {excerpt}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
