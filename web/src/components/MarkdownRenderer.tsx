import { FileText } from 'lucide-react';
import { motion } from 'motion/react';
import type { InlineSegment, StyleProposalId } from '../types/agent';
import { parseMarkdownBlocks } from '../utils/markdownParser';

interface MarkdownRendererProps {
  markdown: string;
  activeStyle: StyleProposalId;
  selectedCitation: string | null;
  onSelectCitation: (filename: string) => void;
}

export function MarkdownRenderer({
  markdown,
  activeStyle,
  selectedCitation,
  onSelectCitation
}: MarkdownRendererProps) {
  const blocks = parseMarkdownBlocks(markdown);
  const isDark = activeStyle === 'obsidian-glass';

  const headingClasses = isDark
    ? 'font-outfit text-lg font-semibold text-white tracking-tight mt-6 first:mt-0 mb-2.5'
    : 'font-jakarta text-lg font-semibold text-slate-900 tracking-tight mt-6 first:mt-0 mb-2.5';

  const proseClasses = isDark
    ? 'font-dm text-[15px] leading-[1.7] text-slate-200'
    : 'font-jakarta text-[15px] leading-[1.7] text-slate-700';

  const renderSegments = (segments: InlineSegment[]) =>
    segments.map((seg, idx) => {
      if (seg.type === 'text') {
        return <span key={idx}>{seg.value}</span>;
      }
      if (seg.type === 'bold') {
        return (
          <strong
            key={idx}
            className={isDark ? 'font-semibold text-white' : 'font-semibold text-slate-900'}
          >
            {seg.value}
          </strong>
        );
      }

      const isCitedActive = selectedCitation === seg.filename;
      const citationButtonStyle = isDark
        ? isCitedActive
          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60'
          : 'bg-slate-800/80 text-cyan-300 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800'
        : isCitedActive
          ? 'neu-primary-btn text-white'
          : 'neu-soft-btn text-indigo-700 hover:text-indigo-900';

      return (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectCitation(seg.filename)}
          aria-label={`Inspecter la source ${seg.filename}`}
          className={`mx-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono-code text-[11.5px] font-medium align-baseline transition-all duration-150 hover:-translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 ${citationButtonStyle}`}
        >
          <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{seg.filename}</span>
        </button>
      );
    });

  return (
    <div className="max-w-[72ch]">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <motion.h3
              key={`h-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={headingClasses}
            >
              {block.text}
            </motion.h3>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <motion.p
              key={`p-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={`${proseClasses} mb-3.5 last:mb-0`}
            >
              {renderSegments(block.segments)}
            </motion.p>
          );
        }

        return (
          <motion.ul
            key={`ul-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className={`${proseClasses} mb-4 space-y-2.5 pl-4`}
          >
            {block.items.map((itemSegments, itemIdx) => (
              <li key={itemIdx} className="relative pl-3">
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[0.65em] h-1.5 w-1.5 rounded-full ${
                    isDark ? 'bg-cyan-400' : 'bg-indigo-600'
                  }`}
                />
                {renderSegments(itemSegments)}
              </li>
            ))}
          </motion.ul>
        );
      })}
    </div>
  );
}
