import type { InlineSegment, MarkdownBlock } from '../types/agent';

export function parseInlineSegments(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\[[a-z0-9._-]+\.md\])/gi;
  let lastIndex = 0;

  for (const match of text.matchAll(tokenRegex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      segments.push({ type: 'bold', value: token.slice(2, -2) });
    } else if (token.startsWith('[') && token.endsWith(']')) {
      segments.push({ type: 'citation', filename: token.slice(1, -1) });
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

export function extractCitedFilenames(markdown: string): string[] {
  const seen = new Set<string>();
  const regex = /\[([a-z0-9._-]+\.md)\]/gi;
  for (const match of markdown.matchAll(regex)) {
    seen.add(match[1]);
  }
  return Array.from(seen);
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: InlineSegment[][] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const joined = paragraphLines.join(' ').trim();
      if (joined) {
        blocks.push({ type: 'paragraph', segments: parseInlineSegments(joined) });
      }
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: 3,
        text: line.slice(4).trim()
      });
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      listItems.push(parseInlineSegments(line.slice(2).trim()));
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
