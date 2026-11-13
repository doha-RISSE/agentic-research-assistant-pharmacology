export type StyleProposalId =
  | 'obsidian-glass'
  | 'clinical-light';

export type ActiveView = 'search' | 'history';

export type AgentScope = 'in_scope' | 'out_of_scope';

export interface CorpusDocument {
  filename: string;
  title: string;
  authority: string;
  therapeuticClass: string;
  updatedAt: string;
  summary: string;
  excerpts: string[];
  keywords: string[];
}

export interface PresetQuery {
  id: string;
  label: string;
  question: string;
  category: string;
  expectedScope: AgentScope;
}

export interface AgentResult {
  id: string;
  question: string;
  scope: AgentScope;
  statusLabel: string;
  markdownAnswer: string;
  citedFiles: string[];
  disclaimer: string;
  timestamp: string;
  durationMs: number;
}

export interface SearchHistoryItem {
  id: string;
  question: string;
  scope: AgentScope;
  citedFiles: string[];
  timestamp: string;
  result: AgentResult;
}

export interface StyleProposalMeta {
  id: StyleProposalId;
  index: string;
  name: string;
  shortName: string;
  tagline: string;
  mode: 'light' | 'dark';
  typography: string;
  palette: string;
  motionSignature: string;
  idealFor: string;
  swatches: [string, string, string];
}

export type InlineSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'citation'; filename: string };

export type MarkdownBlock =
  | { type: 'heading'; level: 3; text: string }
  | { type: 'paragraph'; segments: InlineSegment[] }
  | { type: 'list'; items: InlineSegment[][] };
