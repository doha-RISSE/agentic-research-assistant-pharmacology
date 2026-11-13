import { AlertTriangle, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { SearchHistoryItem, StyleProposalId } from '../types/agent';

interface HistoryViewProps {
  activeStyle: StyleProposalId;
  history: SearchHistoryItem[];
  onRestoreItem: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryView({
  activeStyle,
  history,
  onRestoreItem,
  onClearHistory
}: HistoryViewProps) {
  const isDark = activeStyle === 'obsidian-glass';

  const pageBg = isDark
    ? 'bg-[#07090E] text-slate-100 font-dm'
    : 'bg-[#F5F6FB] text-[#11131A] font-jakarta relative overflow-hidden';

  const cardClass = isDark
    ? 'border-slate-800/90 bg-slate-900/60 backdrop-blur-xl'
    : 'neu-glass-card border-white/90';

  return (
    <div className={`min-h-[calc(100vh-72px)] transition-colors duration-200 ${pageBg}`}>
      {!isDark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(560px 380px at 14% 14%, rgba(167, 179, 255, 0.22), transparent 72%), radial-gradient(560px 380px at 86% 20%, rgba(251, 207, 232, 0.25), transparent 74%)'
          }}
        />
      )}
      <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-current/10 pb-6">
          <div>
            <p className="text-xs font-semibold opacity-70">Journal de session</p>
            <h1
              className={`mt-1 text-2xl sm:text-3xl font-bold tracking-tight ${
                isDark ? 'font-outfit' : ''
              }`}
            >
              Historique des recherches
            </h1>
            <p className="mt-1 text-sm opacity-75">
              {history.length} requête(s) exécutée(s) durant cette session.
            </p>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-900'
                  : 'border-current/15 hover:bg-black/5'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Vider l&apos;historique</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className={`mt-8 rounded-xl border border-dashed p-12 text-center ${cardClass}`}>
            <p className="text-sm font-semibold">Aucune recherche enregistrée</p>
            <p className="mt-1 text-xs opacity-70">
              Vos requêtes pharmacologiques apparaîtront ici pour une consultation rapide.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`flex flex-col justify-between gap-4 rounded-xl border p-5 sm:flex-row sm:items-center ${cardClass}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {item.scope === 'in_scope' ? (
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-amber-500 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-mono-code">{item.scope}</span>
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                    <span className="font-mono-code opacity-70">{item.timestamp}</span>
                    {item.citedFiles.length > 0 && (
                      <>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <span className="opacity-75">
                          {item.citedFiles.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug">
                    {item.question}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRestoreItem(item)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    isDark
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'neu-primary-btn text-white'
                  }`}
                >
                  <span>Rouvrir</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
