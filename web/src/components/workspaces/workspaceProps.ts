import type { AgentResult, SearchHistoryItem } from '../../types/agent';

export interface WorkspaceProps {
  query: string;
  onQueryChange: (value: string) => void;
  validationError: string | null;
  isSearching: boolean;
  searchStep: number;
  result: AgentResult | null;
  selectedCitation: string | null;
  onSelectCitation: (filename: string | null) => void;
  onSubmit: () => void;
  onClear: () => void;
  copied: boolean;
  onCopyResult: () => void;
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
}
