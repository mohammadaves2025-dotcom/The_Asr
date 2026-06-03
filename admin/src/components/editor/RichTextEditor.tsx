import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline, Quote, Link2, Image,
  Heading2, Heading3, List, ListOrdered, Minus,
  X, Check, ExternalLink, Upload, Film, Code, Undo, Redo,
  BookOpen,   // ← new: used for "Read Also" toolbar button
} from 'lucide-react';
import { articlesAdmin } from '../../services/admin';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ── Tool button ───────────────────────────────────────────────────────────────

function ToolBtn({
  title, active, onClick, disabled, children
}: { title: string; active?: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`
        flex items-center justify-center w-8 h-8 rounded transition-all text-xs
        ${active
          ? 'bg-brand-navy text-brand-yellow'
          : 'text-ink-secondary hover:bg-gray-100 hover:text-ink'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;
}

// ── Link dialog ───────────────────────────────────────────────────────────────

function LinkDialog({ onInsert, onClose }: { onInsert: (url: string, text: string, newTab: boolean) => void; onClose: () => void }) {
  const [url, setUrl] = useState('https://');
  const [text, setText] = useState('');
  const [newTab, setNewTab] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 shadow-2xl w-96 p-5 rounded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2"><Link2 size={14} /> Insert Link</h3>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">URL *</label>
            <input autoFocus type="url" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded"
              placeholder="https://example.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Link Text (optional)</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded"
              placeholder="Leave blank to use selected text" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} className="w-3.5 h-3.5" />
            <ExternalLink size={12} className="text-ink-muted" />
            Open in new tab
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 py-2 text-sm text-ink hover:bg-gray-50 rounded transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { if (url) { onInsert(url, text, newTab); onClose(); } }}
            disabled={!url || url === 'https://'}
            className="flex-1 bg-brand-navy text-brand-yellow py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 rounded transition-colors">
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image dialog ──────────────────────────────────────────────────────────────

function InlineImageDialog({ onInsert, onClose }: {
  onInsert: (url: string, alt: string, caption: string, align: string, size: string) => void;
  onClose: () => void
}) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'full'>('large');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await articlesAdmin.uploadImage(file);
      const imgUrl = res.data?.data?.url;
      if (imgUrl) setUrl(imgUrl);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 shadow-2xl w-[500px] p-5 rounded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2"><Image size={14} /> Insert Image</h3>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink"><X size={16} /></button>
        </div>

        <div className="flex border-b border-gray-200 mb-4">
          {(['upload', 'url'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px
                ${tab === t ? 'border-brand-navy text-brand-navy' : 'border-transparent text-ink-muted hover:text-ink'}`}>
              {t === 'upload' ? 'Upload File' : 'Image URL'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tab === 'upload' ? (
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-navy transition-colors rounded">
              <Upload size={20} className="text-ink-muted" />
              <span className="text-sm text-ink-muted">
                {uploading ? 'Uploading…' : url
                  ? <span className="text-green-600 flex items-center gap-1"><Check size={12} /> Uploaded</span>
                  : 'Click to select image'}
              </span>
              <span className="text-xs text-ink-faint">JPG, PNG, WebP — max 10MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          ) : (
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Image URL</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded"
                placeholder="https://..." />
            </div>
          )}

          {url && (
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <img src={url} alt="Preview" className="max-h-32 mx-auto object-contain" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Alt Text</label>
              <input type="text" value={alt} onChange={e => setAlt(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded"
                placeholder="Describe image" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Caption</label>
              <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded"
                placeholder="Optional caption" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Alignment</label>
              <select value={align} onChange={e => setAlign(e.target.value as any)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Size</label>
              <select value={size} onChange={e => setSize(e.target.value as any)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded">
                <option value="small">Small (33%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="large">Large (75%)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 py-2 text-sm text-ink hover:bg-gray-50 rounded">Cancel</button>
          <button type="button"
            onClick={() => { if (url) { onInsert(url, alt, caption, align, size); onClose(); } }}
            disabled={!url || uploading}
            className="flex-1 bg-brand-navy text-brand-yellow py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 rounded">
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NEW: Read Also dialog ─────────────────────────────────────────────────────
// Opens a small modal where the editor pastes an article slug or full URL.
// Inserts a styled <div class="read-also-block"> placeholder into the body HTML.
// The frontend ArticlePage.tsx parses this div, fetches the article by slug,
// and renders the proper thumbnail-left card in place of this placeholder.

function ReadAlsoDialog({
  onInsert,
  onClose,
}: {
  onInsert: (slug: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');

  // Accept either a full URL like https://site.com/article/my-slug
  // or just the bare slug my-slug
  const extractSlug = (raw: string): string => {
    const trimmed = raw.trim();
    try {
      const url = new URL(trimmed);
      // e.g. /article/my-article-slug → last segment
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] ?? trimmed;
    } catch {
      // Not a URL — treat as bare slug
      return trimmed;
    }
  };

  const handleInsert = () => {
    const slug = extractSlug(input);
    if (slug) {
      onInsert(slug);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 shadow-2xl w-[420px] p-5 rounded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
            <BookOpen size={14} /> Insert "Read Also" Link
          </h3>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-ink-muted font-sans mb-3 leading-relaxed">
          Paste the article URL or slug. This will render as a styled "Read Also" card
          at this point in the article body.
        </p>

        <div className="mb-4">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">
            Article URL or Slug *
          </label>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && input.trim()) handleInsert(); }}
            className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy rounded font-mono"
            placeholder="https://theorbisjournal.in/article/my-slug  or  my-slug"
          />
        </div>

        {/* Preview of what will be inserted */}
        {input.trim() && (
          <div className="border border-dashed border-brand-navy/30 bg-brand-navy/5 rounded p-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[1.5px] text-brand-red mb-1 font-sans">
              Preview — Read Also block
            </p>
            <p className="text-[12px] text-ink-secondary font-sans truncate">
              Slug: <span className="font-mono text-brand-navy">{extractSlug(input)}</span>
            </p>
            <p className="text-[10px] text-ink-muted font-sans mt-1">
              Article card will render here on the frontend.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 py-2 text-sm text-ink hover:bg-gray-50 rounded transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!input.trim()}
            className="flex-1 bg-brand-navy text-brand-yellow py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 rounded transition-colors"
          >
            Insert Read Also
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────────────

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your article here…',
  minHeight = 480,
}: RichTextEditorProps) {
  const editorRef          = useRef<HTMLDivElement>(null);
  const isInternalChange   = useRef(false);
  const savedSelection     = useRef<Range | null>(null);
  const [showLinkDialog,    setShowLinkDialog]    = useState(false);
  const [showImageDialog,   setShowImageDialog]   = useState(false);
  const [showReadAlsoDlg,   setShowReadAlsoDlg]   = useState(false);  // ← new
  const [activeFormats,     setActiveFormats]      = useState<Set<string>>(new Set());
  const [wordCount,         setWordCount]          = useState(0);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
      updateWordCount(el);
    }
  }, [value]);

  // ── Selection ───────────────────────────────────────────────────────────────
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedSelection.current = sel.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  }, []);

  // ── Format state ────────────────────────────────────────────────────────────
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    ['bold', 'italic', 'underline'].forEach(cmd => {
      try { if (document.queryCommandState(cmd)) formats.add(cmd); } catch {}
    });
    setActiveFormats(formats);
  }, []);

  const updateWordCount = (el: HTMLDivElement) => {
    const text  = el.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  };

  // ── Exec ─────────────────────────────────────────────────────────────────────
  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateActiveFormats();
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
    isInternalChange.current = false;
  }, [onChange, updateActiveFormats]);

  const insertHTML = useCallback((html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    exec('insertHTML', html);
  }, [exec, restoreSelection]);

  const setHeading = useCallback((tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
    isInternalChange.current = false;
  }, [onChange]);

  // ── Link ─────────────────────────────────────────────────────────────────────
  const handleInsertLink = useCallback((url: string, text: string, newTab: boolean) => {
    editorRef.current?.focus();
    restoreSelection();
    const sel          = window.getSelection();
    const selectedText = sel?.toString() || text || url;
    const target       = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    exec('insertHTML', `<a href="${url}"${target} class="article-link">${selectedText}</a>`);
  }, [exec, restoreSelection]);

  // ── Image ─────────────────────────────────────────────────────────────────────
  const handleInsertImage = useCallback((url: string, alt: string, caption: string, align: string, size: string) => {
    const sizeMap: Record<string, string>  = { small: '33%', medium: '50%', large: '75%', full: '100%' };
    const alignStyle: Record<string, string> = {
      left:   'float:left; margin:0 1.5rem 1rem 0;',
      right:  'float:right; margin:0 0 1rem 1.5rem;',
      center: 'display:block; margin:0 auto;',
      full:   'display:block; margin:0 auto;',
    };
    const figStyle = align === 'center' || align === 'full'
      ? 'text-align:center; margin:1.5rem 0;'
      : `margin:1rem 0; ${align === 'left' ? 'float:left; margin-right:1.5rem;' : 'float:right; margin-left:1.5rem;'}`;
    const capHtml  = caption
      ? `<figcaption style="font-size:0.75rem;color:#64748b;font-style:italic;margin-top:0.375rem;">${caption}</figcaption>`
      : '';
    const html = `<figure style="${figStyle}"><img src="${url}" alt="${alt}" style="max-width:${sizeMap[size]};width:100%;height:auto;${alignStyle[align]}" />${capHtml}</figure><p><br></p>`;
    insertHTML(html);
  }, [insertHTML]);

  // ── NEW: Read Also ─────────────────────────────────────────────────────────
  // Inserts a div with class "read-also-block" and data-slug attribute.
  // ArticlePage.tsx on the frontend parses this div, fetches the article,
  // and replaces it with a styled thumbnail-left card.
  const handleInsertReadAlso = useCallback((slug: string) => {
    const html = `
<div
  class="read-also-block"
  data-slug="${slug}"
  style="border:1.5px dashed #e2e8f0;padding:0.75rem 1rem;margin:1.5rem 0;border-radius:4px;background:#f8fafc;font-family:sans-serif;"
>
  <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c8392b;">Read Also</span><br/>
  <span style="font-size:12px;color:#64748b;font-family:monospace;">${slug}</span>
  <span style="font-size:11px;color:#94a3b8;"> — card renders on frontend</span>
</div>
<p><br></p>`.trim();
    insertHTML(html);
  }, [insertHTML]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const map: Record<string, () => void> = {
        b: () => exec('bold'),
        i: () => exec('italic'),
        u: () => exec('underline'),
        z: () => exec(e.shiftKey ? 'redo' : 'undo'),
        y: () => exec('redo'),
        k: () => { saveSelection(); setShowLinkDialog(true); },
      };
      const action = map[e.key.toLowerCase()];
      if (action) { e.preventDefault(); action(); }
    }
  }, [exec, saveSelection]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
    isInternalChange.current = false;
    updateWordCount(el);
  }, [onChange]);

  // ── Embed video ───────────────────────────────────────────────────────────────
  const handleEmbedVideo = useCallback(() => {
    const url = prompt('Paste YouTube or Vimeo URL:');
    if (!url) return;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vm = url.match(/vimeo\.com\/(\d+)/);
    let embed = '';
    if (yt)      embed = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://www.youtube.com/embed/${yt[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    else if (vm) embed = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://player.vimeo.com/video/${vm[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    else         embed = `<div style="margin:1.5rem 0;"><iframe src="${url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe></div>`;
    insertHTML(embed + '<p><br></p>');
  }, [insertHTML]);

  return (
    <div className="bg-white overflow-hidden" style={{ fontFamily: 'inherit' }}>

      {/* ── Single-row toolbar ── */}
      <div className="bg-gray-50 border-b border-gray-200 select-none px-3 py-2 flex items-center gap-0.5 flex-wrap">

        {/* History */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => exec('undo')}><Undo size={14} /></ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => exec('redo')}><Redo size={14} /></ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn title="Heading 2" onClick={() => setHeading('h2')}><Heading2 size={14} /></ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => setHeading('h3')}><Heading3 size={14} /></ToolBtn>
        <ToolBtn title="Paragraph" onClick={() => setHeading('p')}>
          <span className="text-[11px] font-bold">¶</span>
        </ToolBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolBtn title="Bold (Ctrl+B)" active={activeFormats.has('bold')} onClick={() => exec('bold')}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={activeFormats.has('italic')} onClick={() => exec('italic')}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={activeFormats.has('underline')} onClick={() => exec('underline')}>
          <Underline size={14} />
        </ToolBtn>
        <ToolBtn title="Inline Code" onClick={() => exec('insertHTML', `<code style="background:#f1f5f9;padding:2px 6px;font-family:monospace;font-size:0.875em;border-radius:3px;">${window.getSelection()?.toString() || 'code'}</code>`)}>
          <Code size={14} />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn title="Bullet List" onClick={() => exec('insertUnorderedList')}><List size={14} /></ToolBtn>
        <ToolBtn title="Numbered List" onClick={() => exec('insertOrderedList')}><ListOrdered size={14} /></ToolBtn>
        <ToolBtn title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')}><Quote size={14} /></ToolBtn>
        <ToolBtn title="Horizontal Rule" onClick={() => exec('insertHorizontalRule')}><Minus size={14} /></ToolBtn>

        <Divider />

        {/* Insert buttons */}
        <button type="button" title="Insert Link (Ctrl+K)"
          onMouseDown={e => { e.preventDefault(); saveSelection(); setShowLinkDialog(true); }}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-semibold font-sans text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors">
          <Link2 size={12} /> Link
        </button>
        <button type="button" title="Insert Image"
          onMouseDown={e => { e.preventDefault(); saveSelection(); setShowImageDialog(true); }}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-semibold font-sans text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors">
          <Image size={12} /> Image
        </button>
        <button type="button" title="Embed Video"
          onMouseDown={e => { e.preventDefault(); handleEmbedVideo(); }}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-semibold font-sans text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors">
          <Film size={12} /> Video
        </button>
        <button type="button" title="Insert Pull Quote"
          onMouseDown={e => {
            e.preventDefault();
            insertHTML('<aside style="border-left:3px solid #FBFC09;background:#f8fafc;padding:1rem 1.25rem;margin:1.5rem 0;font-style:italic;color:#374151;">Pull quote or key highlight goes here…</aside><p><br></p>');
          }}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-semibold font-sans text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors">
          <Quote size={12} /> Pull Quote
        </button>

        {/* ── NEW: Read Also button ── */}
        <button
          type="button"
          title="Insert Read Also block"
          onMouseDown={e => { e.preventDefault(); saveSelection(); setShowReadAlsoDlg(true); }}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-semibold font-sans text-brand-red hover:bg-red-50 rounded border border-red-200 transition-colors"
        >
          <BookOpen size={12} /> Read Also
        </button>

        <div className="ml-auto">
          <ToolBtn title="Remove Formatting" onClick={() => exec('removeFormat')}>
            <X size={13} />
          </ToolBtn>
        </div>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        data-placeholder={placeholder}
        className="rich-editor-body outline-none px-8 py-7 text-ink leading-relaxed"
        style={{
          minHeight,
          fontFamily: "'Georgia', serif",
          fontSize: '16px',
          lineHeight: '1.8',
        }}
      />

      {/* ── Status bar ── */}
      <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-ink-muted font-sans">
        <span><span className="font-semibold text-ink">{wordCount}</span> words</span>
        <span className="text-ink-faint">Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link</span>
      </div>

      {/* ── Dialogs ── */}
      {showLinkDialog   && <LinkDialog         onInsert={handleInsertLink}    onClose={() => setShowLinkDialog(false)} />}
      {showImageDialog  && <InlineImageDialog  onInsert={handleInsertImage}   onClose={() => setShowImageDialog(false)} />}
      {showReadAlsoDlg  && <ReadAlsoDialog     onInsert={handleInsertReadAlso} onClose={() => setShowReadAlsoDlg(false)} />}

      {/* ── Editor styles ── */}
      <style>{`
        .rich-editor-body:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .rich-editor-body h1 { font-family:'Playfair Display',Georgia,serif; font-size:2rem; font-weight:700; line-height:1.25; margin:1.5rem 0 0.75rem; color:#0f172a; }
        .rich-editor-body h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.5rem; font-weight:700; line-height:1.3; margin:1.5rem 0 0.625rem; color:#0f172a; }
        .rich-editor-body h3 { font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:600; line-height:1.4; margin:1.25rem 0 0.5rem; color:#0f172a; }
        .rich-editor-body h4 { font-size:1.1rem; font-weight:600; margin:1rem 0 0.5rem; color:#0f172a; }
        .rich-editor-body p { margin:0 0 1.1rem; }
        .rich-editor-body blockquote { border-left:3px solid #122837; margin:1.5rem 0; padding:0.75rem 1.25rem; background:#f8fafc; font-style:italic; color:#374151; }
        .rich-editor-body aside { border-left:3px solid #FBFC09; background:#f8fafc; padding:1rem 1.25rem; margin:1.5rem 0; font-style:italic; color:#374151; }
        .rich-editor-body ul { list-style:disc; padding-left:1.75rem; margin:1rem 0; }
        .rich-editor-body ol { list-style:decimal; padding-left:1.75rem; margin:1rem 0; }
        .rich-editor-body li { margin-bottom:0.375rem; }
        .rich-editor-body a, .rich-editor-body .article-link { color:#2563eb; text-decoration:underline; text-underline-offset:2px; }
        .rich-editor-body a:hover { color:#1d4ed8; }
        .rich-editor-body code { background:#f1f5f9; padding:2px 6px; font-family:monospace; font-size:0.875em; border-radius:3px; }
        .rich-editor-body pre { background:#f1f5f9; padding:1rem; font-family:monospace; font-size:0.875em; overflow-x:auto; border-radius:4px; margin:1rem 0; }
        .rich-editor-body hr { border:0; border-top:2px solid #e2e8f0; margin:2rem 0; }
        .rich-editor-body img { max-width:100%; height:auto; }
        .rich-editor-body figure { margin:1.5rem 0; }
        .rich-editor-body figcaption { font-size:0.8rem; color:#64748b; font-style:italic; margin-top:0.375rem; font-family:sans-serif; }
        .rich-editor-body table { width:100%; border-collapse:collapse; margin:1.5rem 0; }
        .rich-editor-body th, .rich-editor-body td { padding:0.625rem 0.75rem; border:1px solid #e2e8f0; text-align:left; }
        .rich-editor-body th { background:#f1f5f9; font-weight:600; }
        .rich-editor-body tr:nth-child(even) td { background:#f8fafc; }
        .rich-editor-body .read-also-block { border:1.5px dashed #e2e8f0; padding:0.75rem 1rem; margin:1.5rem 0; border-radius:4px; background:#f8fafc; }
        .rich-editor-body ::selection { background:rgba(18,40,55,0.15); }
      `}</style>
    </div>
  );
}