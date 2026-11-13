import type { AgentResult, CorpusDocument } from '../types/agent';

const DISCLAIMER =
  'Ceci n’est pas un avis médical. Consultez un professionnel de santé pour toute décision de soins.';

interface AskPayload {
  answer: string;
  sources: string[];
  scope: 'in_scope' | 'out_of_scope';
}

export function validateQuestion(rawQuestion: string): string | null {
  const trimmed = rawQuestion.trim();
  if (!trimmed) return 'Veuillez saisir une question pharmacologique avant de lancer la recherche.';
  if (trimmed.length < 4) return 'Votre question est trop courte pour être analysée dans le corpus local.';
  return null;
}

function separateAnswer(answer: string): { markdownAnswer: string; disclaimer: string } {
  const sourceMarker = '\n\nSources consulted:';
  const beforeSources = answer.includes(sourceMarker) ? answer.split(sourceMarker, 1)[0] : answer;
  const disclaimerIndex = beforeSources.indexOf(DISCLAIMER);
  if (disclaimerIndex === -1) return { markdownAnswer: beforeSources.trim(), disclaimer: DISCLAIMER };
  return {
    markdownAnswer: beforeSources.slice(0, disclaimerIndex).trim(),
    disclaimer: beforeSources.slice(disclaimerIndex).trim()
  };
}

/** Calls the FastAPI backend. No pharmacology answer is generated in the browser. */
export async function runPharmacologicalSearch(question: string): Promise<AgentResult> {
  const startedAt = performance.now();
  const response = await fetch('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question.trim() })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || 'Le service de recherche est indisponible. Réessayez dans un instant.');
  }
  const data = payload as AskPayload;
  const separated = separateAnswer(data.answer);
  return {
    id: `res-${Date.now()}`,
    question: question.trim(),
    scope: data.scope,
    statusLabel: `Terminé — périmètre : ${data.scope}`,
    markdownAnswer: separated.markdownAnswer,
    citedFiles: data.sources,
    disclaimer: separated.disclaimer,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    durationMs: Math.round(performance.now() - startedAt)
  };
}

/** The API exposes filenames but not source excerpts; keep the inspector honest and generic. */
export function getDocumentByFilename(filename: string): CorpusDocument {
  return {
    filename,
    title: filename.replace(/\.md$/i, '').replace(/[-_]/g, ' '),
    authority: 'Corpus local',
    therapeuticClass: 'Fichier source consulté',
    updatedAt: 'non renseignée',
    summary: 'Ce fichier a été cité par le backend après une recherche dans le corpus local.',
    excerpts: ['Les extraits détaillés restent contrôlés par le backend afin de préserver le grounding de la réponse.'],
    keywords: []
  };
}
