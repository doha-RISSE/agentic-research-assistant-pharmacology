import { Moon, Plus, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import type { ActiveView, StyleProposalId } from '../types/agent';

interface HeaderBarProps {
  activeStyle: StyleProposalId;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onSelectStyle: (style: StyleProposalId) => void;
  onNewQuery: () => void;
}

const NAV_ITEMS: { id: ActiveView; label: string }[] = [
  { id: 'search', label: 'Recherche' },
  { id: 'history', label: 'Historique' }
];

export function HeaderBar({
  activeStyle,
  activeView,
  onSelectView,
  onSelectStyle,
  onNewQuery
}: HeaderBarProps) {
  const isDark = activeStyle === 'obsidian-glass';

  const headerSurface = isDark
    ? 'bg-[#07090E]/85 border-slate-800/80 text-slate-100 backdrop-blur-xl'
    : 'bg-white/70 border-white/90 text-slate-900 backdrop-blur-2xl';

  const brandFont = isDark
    ? 'font-outfit font-semibold tracking-tight'
    : 'font-jakarta font-bold tracking-tight';

  const ctaClasses = isDark
    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
    : 'neu-primary-btn text-white';

  const underlineColor = isDark ? 'bg-cyan-400' : 'bg-indigo-600';

  const themeGroupBg = isDark
    ? 'border-slate-800 bg-slate-900/90'
    : 'neu-inset-well border-white/80';

  return (
    <header className={`sticky top-0 z-30 border-b transition-colors duration-200 ${headerSurface}`}>
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8 py-3">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('search')}
          className={`text-left text-sm sm:text-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm ${brandFont}`}
        >
          Recherche pharmacologique
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 rounded-sm ${
                  isActive
                    ? isDark
                      ? 'text-white'
                      : 'text-current'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="header-nav-underline"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                    className={`absolute inset-x-0 -bottom-[13px] h-[2px] ${underlineColor}`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Switcher (Obsidienne Verre / Clinique Clair) + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            role="group"
            aria-label="Basculer entre thème sombre et thème clair"
            className={`inline-flex items-center rounded-full border p-0.5 sm:p-1 ${themeGroupBg}`}
          >
            <button
              type="button"
              onClick={() => onSelectStyle('obsidian-glass')}
              aria-pressed={isDark}
              title="Obsidienne Verre (sombre)"
              className={`relative inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                isDark
                  ? 'text-cyan-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isDark && (
                <motion.span
                  layoutId="header-theme-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-slate-800 border border-cyan-500/40"
                />
              )}
              <Moon className="relative z-10 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="relative z-10 hidden sm:inline">Obsidienne Verre</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectStyle('clinical-light')}
              aria-pressed={!isDark}
              title="Clinique Clair (clair)"
              className={`relative inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                !isDark
                  ? 'text-indigo-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isDark && (
                <motion.span
                  layoutId="header-theme-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="neu-soft-btn absolute inset-0 rounded-full"
                />
              )}
              <Sun className="relative z-10 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="relative z-10 hidden sm:inline">Clinique Clair</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNewQuery}
            aria-label="Nouvelle requête"
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ctaClasses}`}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Nouvelle requête</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>
      </div>

      {/* Mobile compact nav row */}
      <nav
        aria-label="Navigation mobile"
        className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-inherit px-4 py-2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`text-xs font-medium whitespace-nowrap shrink-0 py-1 px-2 rounded-md transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-slate-800 text-cyan-300'
                    : 'bg-slate-100 text-slate-900'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
