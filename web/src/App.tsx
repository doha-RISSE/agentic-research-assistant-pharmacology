import { MotionConfig, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { HistoryView } from './components/HistoryView';
import { ClinicalLightWorkspace } from './components/workspaces/ClinicalLightWorkspace';
import { ObsidianGlassWorkspace } from './components/workspaces/ObsidianGlassWorkspace';
import type {
  ActiveView,
  AgentResult,
  SearchHistoryItem,
  StyleProposalId
} from './types/agent';
import { runPharmacologicalSearch, validateQuestion } from './utils/searchAgent';

const INITIAL_QUESTION = 'What are the main contraindications for warfarin?';

export default function App() {
  const [activeStyle, setActiveStyle] = useState<StyleProposalId>('obsidian-glass');
  const [activeView, setActiveView] = useState<ActiveView>('search');
  const [query, setQuery] = useState<string>(INITIAL_QUESTION);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const timersRef = useRef<number[]>([]);

  const clearScheduledTimers = useCallback(() => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearScheduledTimers();
  }, [clearScheduledTimers]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeStyle === 'obsidian-glass') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeStyle]);

  const executeQuery = useCallback(
    async (rawQuestion: string) => {
      const error = validateQuestion(rawQuestion);
      if (error) {
        setValidationError(error);
        return;
      }

      clearScheduledTimers();
      setValidationError(null);
      setCopied(false);
      setIsSearching(true);
      setSearchStep(0);
      setActiveView('search');

      const step1 = window.setTimeout(() => setSearchStep(1), 720);
      const step2 = window.setTimeout(() => setSearchStep(2), 1520);
      const step3 = window.setTimeout(() => setSearchStep(3), 2320);
      timersRef.current = [step1, step2, step3];
      try {
        const nextResult = await runPharmacologicalSearch(rawQuestion);
        setResult(nextResult);
        setSelectedCitation(nextResult.citedFiles[0] ?? null);
        setHistory((prev) => [
          {
            id: nextResult.id,
            question: nextResult.question,
            scope: nextResult.scope,
            citedFiles: nextResult.citedFiles,
            timestamp: nextResult.timestamp,
            result: nextResult
          },
          ...prev.filter((item) => item.question !== nextResult.question)
        ]);
      } catch (requestError) {
        setValidationError(requestError instanceof Error ? requestError.message : 'La recherche a échoué.');
      } finally {
        clearScheduledTimers();
        setIsSearching(false);
      }
    },
    [clearScheduledTimers]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleNewQuery = () => {
    clearScheduledTimers();
    setIsSearching(false);
    setQuery('');
    setValidationError(null);
    setResult(null);
    setSelectedCitation(null);
    setCopied(false);
    setActiveView('search');
  };

  const handleCopyResult = async () => {
    if (!result) return;
    const textToCopy = `${result.statusLabel}\n\n${result.markdownAnswer}\n\n${result.disclaimer}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      // Clipboard fallback when restricted
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    clearScheduledTimers();
    setIsSearching(false);
    setQuery(item.question);
    setValidationError(null);
    setResult(item.result);
    setSelectedCitation(item.result.citedFiles[0] ?? null);
    setActiveView('search');
  };

  const workspaceProps = {
    query,
    onQueryChange: handleQueryChange,
    validationError,
    isSearching,
    searchStep,
    result,
    selectedCitation,
    onSelectCitation: setSelectedCitation,
    onSubmit: () => executeQuery(query),
    onClear: handleNewQuery,
    copied,
    onCopyResult: handleCopyResult,
    history,
    onSelectHistory: handleSelectHistory
  };

  const rootBgClass =
    activeStyle === 'obsidian-glass' ? 'bg-[#07090E]' : 'bg-[#F5F6FB]';

  return (
    <MotionConfig reducedMotion="user">
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${rootBgClass}`}>
        <HeaderBar
          activeStyle={activeStyle}
          activeView={activeView}
          onSelectView={setActiveView}
          onSelectStyle={setActiveStyle}
          onNewQuery={handleNewQuery}
        />

        <main className="flex-1">
          {activeView === 'search' && (
            <motion.div
              key={`search-${activeStyle}`}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeStyle === 'obsidian-glass' ? (
                <ObsidianGlassWorkspace {...workspaceProps} />
              ) : (
                <ClinicalLightWorkspace {...workspaceProps} />
              )}
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key={`history-${activeStyle}`}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <HistoryView
                activeStyle={activeStyle}
                history={history}
                onRestoreItem={handleSelectHistory}
                onClearHistory={() => setHistory([])}
              />
            </motion.div>
          )}
        </main>
      </div>
    </MotionConfig>
  );
}
