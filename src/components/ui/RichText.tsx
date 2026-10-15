import React from 'react';

/** Inline formatting: **bold**, *italic* and [text](https://link). Everything else is plain text. */
function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyBase}-${i++}`;
    if (match[1] !== undefined) out.push(<strong key={key} className="font-semibold text-[var(--nxt-ink)]">{match[1]}</strong>);
    else if (match[2] !== undefined) out.push(<em key={key}>{match[2]}</em>);
    else out.push(<a key={key} href={match[4]} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[var(--nxt-ink)]">{match[3]}</a>);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

/**
 * Renders the simple format blog posts are written in: blank-line separated paragraphs, "## " and "### " headings,
 * "- " bullets, "1. " numbered lists, "> " callouts and "| a | b |" tables.
 */
export const RichText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-5 text-[17px] leading-[1.75] text-[var(--nxt-ink)]/85 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const key = `b${i}`;
        if (/^###\s/.test(block)) return <h3 key={key} className="font-display font-bold text-xl tracking-[-0.02em] text-[var(--nxt-ink)] pt-3">{inline(block.replace(/^###\s+/, ''), key)}</h3>;
        if (/^##\s/.test(block)) return <h2 key={key} className="font-display font-bold text-[1.6rem] leading-tight tracking-[-0.025em] text-[var(--nxt-ink)] pt-6">{inline(block.replace(/^##\s+/, ''), key)}</h2>;
        if (lines.every(l => /^>\s?/.test(l))) {
          return <blockquote key={key} className="border-l-2 border-[var(--nxt-ink)] pl-5 py-1 text-[var(--nxt-ink)]">{inline(lines.map(l => l.replace(/^>\s?/, '')).join(' '), key)}</blockquote>;
        }
        if (lines.every(l => /^-\s/.test(l))) {
          return <ul key={key} className="list-disc pl-6 space-y-2">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^-\s+/, ''), `${key}-${j}`)}</li>)}</ul>;
        }
        if (lines.every(l => /^\d+\.\s/.test(l))) {
          return <ol key={key} className="list-decimal pl-6 space-y-2">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s+/, ''), `${key}-${j}`)}</li>)}</ol>;
        }
        if (lines.length >= 2 && lines.every(l => l.trim().startsWith('|'))) {
          const rows = lines.filter(l => !/^\|?(\s*:?-{3,}:?\s*\|?)+$/.test(l.trim()));
          const [head, ...body] = rows.map(cells);
          return (
            <div key={key} className="overflow-x-auto rounded-xl border border-[var(--nxt-line)]">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="bg-[var(--nxt-bg-soft)]">{head.map((h, j) => <th key={j} className="px-4 py-3 font-semibold text-[var(--nxt-ink)] align-top">{inline(h, `${key}-h${j}`)}</th>)}</tr>
                </thead>
                <tbody>
                  {body.map((row, r) => (
                    <tr key={r} className="border-t border-[var(--nxt-line)]">
                      {row.map((c, j) => <td key={j} className="px-4 py-3 align-top">{inline(c, `${key}-${r}-${j}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={key}>{inline(lines.join(' '), key)}</p>;
      })}
    </div>
  );
};
