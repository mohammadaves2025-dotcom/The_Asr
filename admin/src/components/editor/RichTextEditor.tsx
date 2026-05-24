import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Quote, Link2, Image,
  Heading1, Heading2, Heading3, Type, Palette, Minus, Code, Undo, Redo,
  ChevronDown, X, Check, ExternalLink, Upload, Film
} from 'lucide-react';
import { articlesAdmin } from '../../services/admin';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZES = ['12px','13px','14px','15px','16px','18px','20px','22px','24px','28px','32px','36px','42px','48px','56px','64px'];
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Inter', value: "Inter, sans-serif" },
  { label: 'Roboto', value: "Roboto, sans-serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Noto Nastaliq Urdu', value: "'Noto Nastaliq Urdu', serif" },
];
const TEXT_COLORS = [
  '#0f172a','#374151','#64748b','#ef4444','#f97316','#eab308',
  '#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#ffffff',
  '#c8392b','#122837','#FBFC09','#16a34a','#2563eb','#d97706',
];
const BG_COLORS = [
  'transparent','#fef9c3','#dcfce7','#dbeafe','#fce7f3','#f3f4f6',
  '#fee2e2','#fef3c7','#e0f2fe','#f5f3ff','#122837','#0f172a',
];
const LINE_HEIGHTS = ['1.2','1.4','1.5','1.6','1.8','2.0','2.2','2.5'];
const LETTER_SPACINGS = ['normal','-0.05em','-0.025em','0.025em','0.05em','0.1em','0.15em','0.2em'];

// ── Small UI helpers ─────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;
}

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
        flex items-center justify-center w-7 h-7 rounded transition-all text-xs
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

// ── Dropdown base ────────────────────────────────────────────────────────────

function Dropdown({ trigger, children, width = 180 }: { trigger: React.ReactNode; children: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
        className="flex items-center gap-1 px-1.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded transition-colors"
      >
        {trigger}
        <ChevronDown size={10} className="opacity-60" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 py-1 rounded"
          style={{ width }}
          onMouseDown={e => e.preventDefault()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Color palette picker ─────────────────────────────────────────────────────

function ColorPicker({
  label, colors, onSelect, current, icon
}: { label: string; colors: string[]; onSelect: (c: string) => void; current?: string; icon: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        title={label}
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
        className="flex items-center gap-0.5 h-7 px-1 text-ink-secondary hover:bg-gray-100 rounded transition-colors"
      >
        <div className="flex flex-col items-center gap-0.5">
          {icon}
          <div className="w-4 h-1 rounded-sm border border-gray-300" style={{ backgroundColor: current || 'transparent' }} />
        </div>
        <ChevronDown size={9} className="opacity-50" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 p-2 rounded"
          style={{ width: 168 }}
          onMouseDown={e => e.preventDefault()}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">{label}</p>
          <div className="grid grid-cols-6 gap-1">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onMouseDown={e => { e.preventDefault(); onSelect(c); setOpen(false); }}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform relative"
                style={{ backgroundColor: c === 'transparent' ? undefined : c, backgroundImage: c === 'transparent' ? 'linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(225deg, #ccc 25%, transparent 25%), linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(315deg, #ccc 25%, white 25%)' : undefined, backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 0, 4px -4px, 0px 4px' }}
                title={c}
              >
                {current === c && <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span className="text-[10px] text-ink-muted">Custom:</span>
            <input
              type="color"
              defaultValue={current || '#000000'}
              className="w-6 h-6 cursor-pointer border-0 p-0 rounded"
              onInput={e => { onSelect((e.target as HTMLInputElement).value); setOpen(false); }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ── Link dialog ──────────────────────────────────────────────────────────────

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
            <input
              autoFocus
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Link Text (optional)</label>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              placeholder="Leave blank to use selected text"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} className="w-3.5 h-3.5" />
            <ExternalLink size={12} className="text-ink-muted" />
            Open in new tab
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-2 text-sm text-ink hover:bg-gray-50 rounded transition-colors">Cancel</button>
          <button
            type="button"
            onClick={() => { if (url) { onInsert(url, text, newTab); onClose(); } }}
            disabled={!url || url === 'https://'}
            className="flex-1 bg-brand-navy text-brand-yellow py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 rounded transition-colors"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image-in-body dialog ─────────────────────────────────────────────────────

function InlineImageDialog({ onInsert, onClose }: { onInsert: (url: string, alt: string, caption: string, align: string, size: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState<'left'|'center'|'right'|'full'>('center');
  const [size, setSize] = useState<'small'|'medium'|'large'|'full'>('large');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      <div className="bg-white border border-gray-200 shadow-2xl w-[520px] p-5 rounded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2"><Image size={14} /> Insert Image</h3>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink"><X size={16} /></button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {(['upload','url'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${tab===t ? 'border-brand-navy text-brand-navy' : 'border-transparent text-ink-muted hover:text-ink'}`}>
              {t === 'upload' ? 'Upload File' : 'Image URL'}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tab === 'upload' ? (
            <div>
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-navy transition-colors rounded">
                <Upload size={20} className="text-ink-muted" />
                <span className="text-sm text-ink-muted">{uploading ? 'Uploading…' : 'Click to select image'}</span>
                <span className="text-xs text-ink-faint">JPG, PNG, WebP — max 10MB</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {url && <div className="text-xs text-green-600 flex items-center gap-1 mt-1"><Check size={12} /> Uploaded successfully</div>}
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Image URL</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy" placeholder="https://..." />
            </div>
          )}
          {url && (
            <div className="relative bg-gray-50 p-2 rounded border border-gray-100">
              <img src={url} alt="Preview" className="max-h-32 mx-auto object-contain" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Alt Text</label>
              <input type="text" value={alt} onChange={e => setAlt(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy" placeholder="Describe image for screen readers" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Caption</label>
              <input type="text" value={caption} onChange={e => setCaption(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy" placeholder="Optional caption" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Alignment</label>
              <select value={align} onChange={e => setAlign(e.target.value as any)} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Size</label>
              <select value={size} onChange={e => setSize(e.target.value as any)} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy">
                <option value="small">Small (33%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="large">Large (75%)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-2 text-sm text-ink hover:bg-gray-50 rounded">Cancel</button>
          <button
            type="button"
            onClick={() => { if (url) { onInsert(url, alt, caption, align, size); onClose(); } }}
            disabled={!url || uploading}
            className="flex-1 bg-brand-navy text-brand-yellow py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 rounded"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ──────────────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your article here…', minHeight = 520 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [currentFontFamily, setCurrentFontFamily] = useState('');
  const [currentTextColor, setCurrentTextColor] = useState('');
  const [currentBgColor, setCurrentBgColor] = useState('transparent');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const savedSelection = useRef<Range | null>(null);

  // ── Initialize content ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
      updateCounts(el);
    }
  }, [value]);

  // ── Selection tracking ──────────────────────────────────────────────────────
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  }, []);

  // ── Update active format indicators ────────────────────────────────────────
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    const tags = ['bold','italic','underline','strikeThrough'];
    tags.forEach(cmd => { try { if (document.queryCommandState(cmd)) formats.add(cmd); } catch {} });
    setActiveFormats(formats);
    try {
      const size = document.queryCommandValue('fontSize');
      if (size) {
        const sizeMap: Record<string,string> = {'1':'10px','2':'13px','3':'16px','4':'18px','5':'24px','6':'32px','7':'48px'};
        setCurrentFontSize(sizeMap[size] || '16px');
      }
    } catch {}
  }, []);

  // ── Word/char count ─────────────────────────────────────────────────────────
  const updateCounts = (el: HTMLDivElement) => {
    const text = el.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  // ── Execute command ─────────────────────────────────────────────────────────
  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateActiveFormats();
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
    isInternalChange.current = false;
  }, [onChange, updateActiveFormats]);

  const execWithStyle = useCallback((property: string, value: string) => {
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      // Apply to entire block
      const block = range.commonAncestorContainer.parentElement?.closest('p,h1,h2,h3,li,blockquote') as HTMLElement;
      if (block) block.style[property as any] = value;
    } else {
      const span = document.createElement('span');
      span.style[property as any] = value;
      try { range.surroundContents(span); } catch { exec('insertHTML', `<span style="${property}:${value}">${range.toString()}</span>`); return; }
    }
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
    isInternalChange.current = false;
  }, [exec, onChange, restoreSelection]);

  // ── Insert HTML helper ──────────────────────────────────────────────────────
  const insertHTML = useCallback((html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    exec('insertHTML', html);
  }, [exec, restoreSelection]);

  // ── Heading ─────────────────────────────────────────────────────────────────
  const setHeading = useCallback((level: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, level);
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
    isInternalChange.current = false;
  }, [onChange]);

  // ── Link insertion ──────────────────────────────────────────────────────────
  const handleInsertLink = useCallback((url: string, text: string, newTab: boolean) => {
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    const selectedText = sel?.toString() || text || url;
    const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    exec('insertHTML', `<a href="${url}"${target} class="article-link">${selectedText}</a>`);
  }, [exec, restoreSelection]);

  // ── Image insertion ─────────────────────────────────────────────────────────
  const handleInsertImage = useCallback((url: string, alt: string, caption: string, align: string, size: string) => {
    const sizeMap: Record<string,string> = { small:'33%', medium:'50%', large:'75%', full:'100%' };
    const alignMap: Record<string,string> = {
      left: 'float:left; margin:0 1.5rem 1rem 0;',
      right: 'float:right; margin:0 0 1rem 1.5rem;',
      center: 'display:block; margin:0 auto;',
      full: 'display:block; margin:0 auto;',
    };
    const w = sizeMap[size];
    const style = `max-width:${w}; width:100%; height:auto; ${alignMap[align]}`;
    const figureStyle = align === 'center' || align === 'full' ? 'text-align:center; margin:1.5rem 0;' : `margin:1rem 0; ${align === 'left' ? 'float:left; margin-right:1.5rem;' : 'float:right; margin-left:1.5rem;'}`;
    const capHtml = caption ? `<figcaption style="font-size:0.75rem; color:#64748b; font-style:italic; margin-top:0.375rem;">${caption}</figcaption>` : '';
    const html = `<figure style="${figureStyle} clear:${align==='full'?'both':'none'};"><img src="${url}" alt="${alt}" style="${style}" />${capHtml}</figure><p><br></p>`;
    insertHTML(html);
  }, [insertHTML]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
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

  // ── Input handler ───────────────────────────────────────────────────────────
  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
    isInternalChange.current = false;
    updateCounts(el);
  }, [onChange]);

  // ── Toolbar Row ─────────────────────────────────────────────────────────────
  const ToolbarRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-gray-100 last:border-0">
      {children}
    </div>
  );

  return (
    <div className="border border-gray-200 bg-white overflow-hidden" style={{ fontFamily: 'inherit' }}>
      {/* ── Toolbar ── */}
      <div className="bg-gray-50 border-b border-gray-200 select-none sticky top-0 z-10">

        {/* Row 1 — History + Headings + Block */}
        <ToolbarRow>
          <ToolBtn title="Undo (Ctrl+Z)" onClick={() => exec('undo')}><Undo size={13} /></ToolBtn>
          <ToolBtn title="Redo (Ctrl+Y)" onClick={() => exec('redo')}><Redo size={13} /></ToolBtn>
          <Divider />
          <Dropdown trigger={<><Heading1 size={13} /><span className="text-[11px]">Heading</span></>} width={160}>
            {[
              { label: 'Heading 1', tag: 'h1', cls: 'text-2xl font-bold' },
              { label: 'Heading 2', tag: 'h2', cls: 'text-xl font-bold' },
              { label: 'Heading 3', tag: 'h3', cls: 'text-lg font-semibold' },
              { label: 'Heading 4', tag: 'h4', cls: 'text-base font-semibold' },
              { label: 'Paragraph', tag: 'p', cls: 'text-sm' },
              { label: 'Preformatted', tag: 'pre', cls: 'text-xs font-mono' },
            ].map(({ label, tag, cls }) => (
              <button key={tag} type="button" onMouseDown={e => { e.preventDefault(); setHeading(tag); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 text-ink ${cls}`}>{label}</button>
            ))}
          </Dropdown>
          <Divider />
          <Dropdown trigger={<><Type size={12} /><span className="text-[11px]">Font</span></>} width={200}>
            {FONT_FAMILIES.map(f => (
              <button key={f.value} type="button" onMouseDown={e => { e.preventDefault(); execWithStyle('fontFamily', f.value); }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs text-ink"
                style={{ fontFamily: f.value || 'inherit' }}>{f.label}</button>
            ))}
          </Dropdown>
          <Dropdown trigger={<span className="text-[11px] font-mono">{currentFontSize}</span>} width={100}>
            {FONT_SIZES.map(s => (
              <button key={s} type="button" onMouseDown={e => { e.preventDefault(); execWithStyle('fontSize', s); setCurrentFontSize(s); }}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-xs text-ink font-mono">{s}</button>
            ))}
          </Dropdown>
        </ToolbarRow>

        {/* Row 2 — Formatting */}
        <ToolbarRow>
          <ToolBtn title="Bold (Ctrl+B)" active={activeFormats.has('bold')} onClick={() => exec('bold')}><Bold size={13} /></ToolBtn>
          <ToolBtn title="Italic (Ctrl+I)" active={activeFormats.has('italic')} onClick={() => exec('italic')}><Italic size={13} /></ToolBtn>
          <ToolBtn title="Underline (Ctrl+U)" active={activeFormats.has('underline')} onClick={() => exec('underline')}><Underline size={13} /></ToolBtn>
          <ToolBtn title="Strikethrough" active={activeFormats.has('strikeThrough')} onClick={() => exec('strikeThrough')}><Strikethrough size={13} /></ToolBtn>
          <ToolBtn title="Superscript" onClick={() => exec('superscript')}><span className="text-[11px] font-bold">x²</span></ToolBtn>
          <ToolBtn title="Subscript" onClick={() => exec('subscript')}><span className="text-[11px] font-bold">x₂</span></ToolBtn>
          <ToolBtn title="Inline Code" onClick={() => exec('insertHTML', '<code style="background:#f1f5f9;padding:2px 6px;font-family:monospace;font-size:0.875em;border-radius:3px;">' + (window.getSelection()?.toString() || 'code') + '</code>')}><Code size={13} /></ToolBtn>
          <Divider />
          <ColorPicker
            label="Text Color"
            colors={TEXT_COLORS}
            current={currentTextColor}
            onSelect={c => { restoreSelection(); execWithStyle('color', c); setCurrentTextColor(c); }}
            icon={<Palette size={12} />}
          />
          <ColorPicker
            label="Highlight Color"
            colors={BG_COLORS}
            current={currentBgColor}
            onSelect={c => { restoreSelection(); execWithStyle('backgroundColor', c === 'transparent' ? '' : c); setCurrentBgColor(c); }}
            icon={<span className="text-[10px] font-bold">A</span>}
          />
          <Divider />
          <ToolBtn title="Remove Formatting" onClick={() => exec('removeFormat')}><X size={12} /></ToolBtn>
        </ToolbarRow>

        {/* Row 3 — Alignment + Lists + Structure */}
        <ToolbarRow>
          <ToolBtn title="Align Left" onClick={() => exec('justifyLeft')}><AlignLeft size={13} /></ToolBtn>
          <ToolBtn title="Align Center" onClick={() => exec('justifyCenter')}><AlignCenter size={13} /></ToolBtn>
          <ToolBtn title="Align Right" onClick={() => exec('justifyRight')}><AlignRight size={13} /></ToolBtn>
          <ToolBtn title="Justify" onClick={() => exec('justifyFull')}><AlignJustify size={13} /></ToolBtn>
          <Divider />
          <ToolBtn title="Bullet List" onClick={() => exec('insertUnorderedList')}><List size={13} /></ToolBtn>
          <ToolBtn title="Numbered List" onClick={() => exec('insertOrderedList')}><ListOrdered size={13} /></ToolBtn>
          <ToolBtn title="Indent" onClick={() => exec('indent')}><span className="text-[11px]">→</span></ToolBtn>
          <ToolBtn title="Outdent" onClick={() => exec('outdent')}><span className="text-[11px]">←</span></ToolBtn>
          <Divider />
          <ToolBtn title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')}><Quote size={13} /></ToolBtn>
          <ToolBtn title="Horizontal Rule" onClick={() => exec('insertHorizontalRule')}><Minus size={13} /></ToolBtn>
          <Divider />
          <Dropdown trigger={<><span className="text-[11px]">Line Height</span></>} width={130}>
            {LINE_HEIGHTS.map(h => (
              <button key={h} type="button" onMouseDown={e => { e.preventDefault(); execWithStyle('lineHeight', h); }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs text-ink">{h}</button>
            ))}
          </Dropdown>
          <Dropdown trigger={<><span className="text-[11px]">Spacing</span></>} width={150}>
            {LETTER_SPACINGS.map(s => (
              <button key={s} type="button" onMouseDown={e => { e.preventDefault(); execWithStyle('letterSpacing', s); }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs text-ink">{s}</button>
            ))}
          </Dropdown>
        </ToolbarRow>

        {/* Row 4 — Media + Insert */}
        <ToolbarRow>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); saveSelection(); setShowLinkDialog(true); }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Link2 size={12} /> Insert Link
          </button>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); saveSelection(); setShowImageDialog(true); }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Image size={12} /> Insert Image
          </button>
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              const url = prompt('Paste YouTube/Vimeo URL:');
              if (!url) return;
              const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
              const vm = url.match(/vimeo\.com\/(\d+)/);
              let embed = '';
              if (yt) embed = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://www.youtube.com/embed/${yt[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
              else if (vm) embed = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://player.vimeo.com/video/${vm[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
              else embed = `<div style="margin:1.5rem 0;"><iframe src="${url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe></div>`;
              insertHTML(embed + '<p><br></p>');
            }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Film size={12} /> Embed Video
          </button>
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              insertHTML('<aside style="border-left:3px solid #FBFC09;background:#f8fafc;padding:1rem 1.25rem;margin:1.5rem 0;font-style:italic;color:#374151;">Pull quote or key highlight goes here…</aside><p><br></p>');
            }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Quote size={12} /> Pull Quote
          </button>
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              insertHTML('<div style="background:#fef9c3;border:1px solid #fde047;padding:0.875rem 1rem;margin:1.25rem 0;font-size:0.875rem;"><strong>Editor\'s Note:</strong> </div><p><br></p>');
            }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            📌 Editor Note
          </button>
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              insertHTML('<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:0.875rem;"><thead><tr style="background:#f1f5f9;"><th style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;text-align:left;font-weight:600;">Header 1</th><th style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;text-align:left;font-weight:600;">Header 2</th><th style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;text-align:left;font-weight:600;">Header 3</th></tr></thead><tbody><tr><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td></tr><tr style="background:#f8fafc;"><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td><td style="padding:0.625rem 0.75rem;border:1px solid #e2e8f0;">Cell</td></tr></tbody></table><p><br></p>');
            }}
            className="flex items-center gap-1.5 px-2.5 h-7 text-xs text-ink-secondary hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            ⊞ Table
          </button>
        </ToolbarRow>
      </div>

      {/* ── Editable content area ── */}
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
          lineHeight: '1.75',
        }}
      />

      {/* ── Status bar ── */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-ink-muted font-sans">
        <div className="flex gap-4">
          <span><span className="font-semibold text-ink">{wordCount}</span> words</span>
          <span><span className="font-semibold text-ink">{charCount}</span> characters</span>
        </div>
        <span className="text-ink-faint">Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link</span>
      </div>

      {/* ── Dialogs ── */}
      {showLinkDialog && <LinkDialog onInsert={handleInsertLink} onClose={() => setShowLinkDialog(false)} />}
      {showImageDialog && <InlineImageDialog onInsert={handleInsertImage} onClose={() => setShowImageDialog(false)} />}

      {/* ── Editor styles (injected once) ── */}
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
        .rich-editor-body p { margin:0 0 1rem; }
        .rich-editor-body blockquote { border-left:3px solid #122837; margin:1.5rem 0; padding:0.75rem 1.25rem; background:#f8fafc; font-style:italic; color:#374151; }
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
        .rich-editor-body figcaption { font-size:0.8rem; color:#64748b; font-style:italic; margin-top:0.375rem; }
        .rich-editor-body table { width:100%; border-collapse:collapse; margin:1.5rem 0; }
        .rich-editor-body th, .rich-editor-body td { padding:0.625rem 0.75rem; border:1px solid #e2e8f0; text-align:left; }
        .rich-editor-body th { background:#f1f5f9; font-weight:600; }
        .rich-editor-body tr:nth-child(even) td { background:#f8fafc; }
        .rich-editor-body ::selection { background:rgba(18,40,55,0.15); }
      `}</style>
    </div>
  );
}
