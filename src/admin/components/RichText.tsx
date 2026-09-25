import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, ImagePlus, Quote, Code2, Pilcrow, Undo2, Redo2 } from 'lucide-react';
import { MediaPicker } from './media';

/**
 * Lightweight WYSIWYG for blog and page bodies. Stores plain HTML, which the public site
 * already renders. A source view is one click away for anything the toolbar cannot do.
 */
export function RichText({ value, onChange, id }: { value: string; onChange: (html: string) => void; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(false);
  const [picking, setPicking] = useState(false);
  const saved = useRef<Range | null>(null);

  // Only push external values in; never clobber the caret while typing.
  useEffect(() => {
    if (!source && ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || '';
  }, [value, source]);

  const emit = () => ref.current && onChange(clean(ref.current.innerHTML));
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };
  const remember = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
  };
  const restore = () => {
    const sel = window.getSelection();
    ref.current?.focus();
    if (saved.current && sel) { sel.removeAllRanges(); sel.addRange(saved.current); }
  };

  const tools: { icon: typeof Bold; label: string; run: () => void }[] = [
    { icon: Pilcrow, label: 'Paragraph', run: () => exec('formatBlock', '<p>') },
    { icon: Heading2, label: 'Heading', run: () => exec('formatBlock', '<h2>') },
    { icon: Heading3, label: 'Subheading', run: () => exec('formatBlock', '<h3>') },
    { icon: Bold, label: 'Bold', run: () => exec('bold') },
    { icon: Italic, label: 'Italic', run: () => exec('italic') },
    { icon: List, label: 'Bulleted list', run: () => exec('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered list', run: () => exec('insertOrderedList') },
    { icon: Quote, label: 'Quote', run: () => exec('formatBlock', '<blockquote>') },
    {
      icon: Link2, label: 'Link', run: () => {
        remember();
        const url = window.prompt('Link address (leave empty to remove the link)', 'https://');
        restore();
        if (url === null) return;
        exec(url.trim() && url.trim() !== 'https://' ? 'createLink' : 'unlink', url.trim());
      },
    },
    { icon: ImagePlus, label: 'Image', run: () => { remember(); setPicking(true); } },
    { icon: Undo2, label: 'Undo', run: () => exec('undo') },
    { icon: Redo2, label: 'Redo', run: () => exec('redo') },
  ];

  return (
    <div className="rounded-lg border border-[var(--adm-line-strong)] bg-white focus-within:border-[var(--adm-accent)] focus-within:shadow-[0_0_0_3px_rgb(46_48_148/0.14)] transition-[border-color,box-shadow] duration-150">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-[var(--adm-line)] bg-[var(--adm-panel)] rounded-t-lg sticky top-14 z-10">
        {tools.map((t) => (
          <button key={t.label} type="button" title={t.label} aria-label={t.label} disabled={source}
            onMouseDown={(e) => e.preventDefault()} onClick={t.run}
            className="grid place-items-center size-8 rounded-md text-[var(--adm-ink-2)] hover:bg-white hover:text-[var(--adm-ink)] disabled:opacity-40 cursor-pointer transition-colors duration-150">
            <t.icon className="size-4" />
          </button>
        ))}
        <button type="button" onClick={() => setSource((s) => !s)} aria-pressed={source}
          className={`ml-auto inline-flex items-center gap-1.5 h-8 px-2 rounded-md text-[12.5px] font-medium cursor-pointer transition-colors duration-150 ${source ? 'bg-white text-[var(--adm-accent)]' : 'text-[var(--adm-ink-2)] hover:bg-white'}`}>
          <Code2 className="size-4" /> HTML
        </button>
      </div>
      {source ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false}
          className="block w-full min-h-80 p-4 font-mono text-[13px] leading-relaxed rounded-b-lg focus:outline-none resize-y" />
      ) : (
        <div id={id} ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
          data-placeholder="Start writing…"
          onInput={emit} onBlur={() => { remember(); emit(); }}
          onPaste={(e) => {
            // Paste as plain text so styles from Word or other sites never leak into the page.
            e.preventDefault();
            document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
          }}
          className="adm-prose min-h-80 px-4 py-3 rounded-b-lg" />
      )}
      <MediaPicker open={picking} onClose={() => setPicking(false)} preset="content"
        onPick={(m) => {
          setPicking(false);
          restore();
          exec('insertHTML', `<img src="${m.url}" alt="" width="${m.width || ''}" height="${m.height || ''}" loading="lazy">`);
        }} />
    </div>
  );
}

function clean(html: string) {
  return html.replace(/<br>$/, '').replace(/ style="[^"]*"/g, '');
}
