import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, Loader, Clock, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { articlesAdmin, categoriesAdmin } from '../services/admin';
import toast from 'react-hot-toast';
import type { Article, Category } from '../types';
import RichTextEditor from '../components/editor/RichTextEditor';

// ── Constants ────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  'news','investigation','opinion','analysis','ground-report',
  'explainer','interview','photo-essay','video-report','book-excerpt',
  'special-series','community-voice','verified-report','in-their-words',
];
const STATUSES = ['draft','review','scheduled','published','archived'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
  { value: 'hi', label: 'हिन्दी' },
];

interface FormState extends Partial<Article> {
  tagsInput?: string;
  categoryId?: string;
}

// ── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button type="button" onClick={onChange}
        className={`relative mt-0.5 flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
          ${checked ? 'bg-brand-navy' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink leading-tight">{label}</p>
        {desc && <p className="text-xs text-ink-muted mt-0.5">{desc}</p>}
      </div>
    </label>
  );
}

// ── AutoSave indicator ───────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-sans transition-all
      ${state === 'saving' ? 'text-ink-muted' : state === 'saved' ? 'text-accent-green' : 'text-accent-red'}`}>
      {state === 'saving' && <Loader size={11} className="animate-spin" />}
      {state === 'saved' && <CheckCircle size={11} />}
      {state === 'error' && <AlertCircle size={11} />}
      {state === 'saving' ? 'Saving draft…' : state === 'saved' ? 'Draft saved' : 'Save failed'}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-bold font-sans uppercase tracking-widest text-ink-muted mb-3 pb-2 border-b border-gray-100">
      {title}
    </h3>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ArticleEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormState>({
    title: '', subtitle: '', excerpt: '', body: '',
    contentType: 'news', status: 'draft', language: 'en',
    categoryId: '', tagsInput: '', series: '', seriesPart: undefined,
    videoUrl: '',
    featuredImage: { url: '', alt: '', caption: '', credit: '' },
    location: { state: '', district: '', country: 'India' },
    seo: { metaTitle: '', metaDescription: '' },
    isFeatured: false, isBreaking: false, isEditorsPick: false,
    isMustRead: false, isVerified: false, isPremium: false,
    isGuestAuthor: false, guestAuthorName: '', guestAuthorBio: '',
  });

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Fetch categories ──────────────────────────────────────────────────────
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAdmin.getAll(),
  });
  const categories: Category[] = catData?.data?.data?.categories ?? [];

  // ── Fetch existing article ────────────────────────────────────────────────
  const { isLoading: articleLoading } = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: async () => {
      const res = await articlesAdmin.getAll({ id, limit: 1 });
      return res.data?.data?.articles?.[0];
    },
    enabled: isEditing,
    staleTime: Infinity,
  });

  // ── Populate form when article loads ─────────────────────────────────────
  const { data: articleData } = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: async () => {
      const res = await articlesAdmin.getAll({ id, limit: 1 });
      return res.data?.data?.articles?.[0];
    },
    enabled: isEditing,
    staleTime: Infinity,
    select: (data: any) => data,
  });

  useEffect(() => {
    if (!articleData) return;
    setForm({
      ...articleData,
      tagsInput: articleData.tags?.join(', ') ?? '',
      categoryId: typeof articleData.category === 'object' ? articleData.category._id : articleData.category,
    });
  }, [articleData]);

  // ── Save mutation ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (currentArticleId) return articlesAdmin.update(currentArticleId, payload);
      return articlesAdmin.create(payload);
    },
    onSuccess: (res, variables) => {
      const article = res.data?.data?.article;
      if (article?._id && !currentArticleId) {
        setCurrentArticleId(article._id);
        navigate(`/articles/${article._id}/edit`, { replace: true });
      }
      setSaveState('saved');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      const statusLabel = variables.status === 'published' ? 'Article published!' :
        variables.status === 'review' ? 'Submitted for review' : 'Draft saved';
      if (variables.status !== 'draft') toast.success(statusLabel);
      setTimeout(() => setSaveState('idle'), 3000);
    },
    onError: (err: any) => {
      setSaveState('error');
      toast.error(err.response?.data?.message ?? 'Failed to save article');
      setTimeout(() => setSaveState('idle'), 5000);
    },
  });

  // ── Build payload ─────────────────────────────────────────────────────────
  const buildPayload = useCallback((statusOverride?: string) => {
    const payload: any = {
      ...form,
      tags: form.tagsInput?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
      category: form.categoryId,
      status: statusOverride ?? form.status,
    };
    delete payload.tagsInput;
    delete payload.categoryId;
    delete payload._id;
    delete payload.__v;
    return payload;
  }, [form]);

  // ── Auto-save draft ───────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (!form.title?.trim()) return; // don't save empty articles
      setSaveState('saving');
      saveMutation.mutate(buildPayload('draft'));
    }, 3000);
  }, [form, buildPayload, saveMutation]);

  // ── Trigger auto-save on form changes ────────────────────────────────────
  useEffect(() => {
    if (!form.title?.trim()) return;
    triggerAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [form.title, form.body, form.excerpt]);

  // ── Field helpers ─────────────────────────────────────────────────────────
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setNested = (parent: 'featuredImage' | 'location' | 'seo', key: string, val: string) =>
    setForm(f => ({ ...f, [parent]: { ...(f[parent] as any), [key]: val } }));

  // ── Manual save ──────────────────────────────────────────────────────────
  const handleSave = (statusOverride?: string) => {
    if (!form.title?.trim()) { toast.error('Please enter a title first'); return; }
    setSaveState('saving');
    saveMutation.mutate(buildPayload(statusOverride));
  };

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await articlesAdmin.uploadImage(file);
      const url = res.data?.data?.url;
      if (url) setNested('featuredImage', 'url', url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isEditing && articleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader className="animate-spin text-brand-navy mx-auto" size={24} />
          <p className="text-sm text-ink-muted font-sans">Loading article…</p>
        </div>
      </div>
    );
  }

  const clientUrl = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:3000';

  return (
    <div className="flex flex-col h-full bg-surface-secondary">

      {/* ── Sticky Top Toolbar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 shadow-sm">
        <Link to="/articles" className="text-ink-muted hover:text-ink transition-colors flex-shrink-0">
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 font-sans
              ${form.status === 'published' ? 'bg-green-100 text-green-700' :
                form.status === 'review' ? 'bg-amber-100 text-amber-700' :
                form.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                form.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'}`}>
              {form.status}
            </span>
            <p className="text-xs text-ink-muted font-sans truncate">
              {isEditing ? `Editing: ${form.title || 'Untitled'}` : 'New Article'}
            </p>
          </div>
        </div>

        <SaveIndicator state={saveState} />

        <div className="flex items-center gap-2 flex-shrink-0">
          {(isEditing || currentArticleId) && (
            <a
              href={`${clientUrl}/article/${form.slug}`}
              target="_blank" rel="noopener noreferrer"
              className="admin-btn-secondary text-xs py-1.5 gap-1.5"
            >
              <Eye size={12} /> Preview
            </a>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={saveMutation.isPending}
            className="admin-btn-secondary text-xs py-1.5 gap-1.5"
          >
            <Save size={12} /> Save Draft
          </button>
          <button
            onClick={() => handleSave('review')}
            disabled={saveMutation.isPending}
            className="admin-btn text-xs py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          >
            Submit Review
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saveMutation.isPending}
            className="admin-btn-primary text-xs py-1.5 gap-1.5"
          >
            {saveMutation.isPending
              ? <Loader size={12} className="animate-spin" />
              : <CheckCircle size={12} />
            }
            Publish
          </button>
        </div>
      </div>

      {/* ── Main editor area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto transition-all duration-300 ${sidebarCollapsed ? 'max-w-5xl' : 'max-w-7xl'}`}>
          <div className={`grid gap-5 p-5 ${sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[1fr_320px]'}`}>

            {/* ── Left: Content ── */}
            <div className="space-y-4 min-w-0">

              {/* Title + Meta */}
              <div className="admin-card p-6 space-y-4">
                <div>
                  <label className="admin-label">Headline *</label>
                  <textarea
                    rows={2}
                    value={form.title ?? ''}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Write a compelling headline…"
                    className="admin-input resize-none text-2xl font-serif font-bold leading-snug border-0 border-b border-gray-200 px-0 py-1 focus:border-brand-navy rounded-none"
                  />
                </div>
                <div>
                  <label className="admin-label">Subtitle / Deck</label>
                  <input
                    type="text"
                    value={form.subtitle ?? ''}
                    onChange={e => set('subtitle', e.target.value)}
                    placeholder="Supporting line shown below the headline"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">
                    Excerpt / Summary *
                    <span className="normal-case font-normal text-ink-faint ml-1">({form.excerpt?.length ?? 0}/300 recommended)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.excerpt ?? ''}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="1–2 sentences shown in article cards and search results…"
                    className="admin-input resize-none"
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="admin-card overflow-hidden">
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                  <label className="admin-label">Article Body</label>
                  <p className="text-xs text-ink-muted mt-0.5">Full-featured editor — images, links, formatting, embeds and more.</p>
                </div>
                <RichTextEditor
                  value={form.body ?? ''}
                  onChange={v => set('body', v)}
                  minHeight={560}
                />
              </div>

              {/* Featured Image */}
              <div className="admin-card p-6">
                <SectionHeader title="Featured Image" />
                <div className="space-y-4">
                  {form.featuredImage?.url ? (
                    <div className="relative">
                      <img src={form.featuredImage.url} alt="Preview" className="w-full h-56 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setNested('featuredImage', 'url', '')}
                        className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2.5 py-1 rounded hover:opacity-90"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-navy transition-colors rounded-sm">
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-ink">Click to upload featured image</p>
                        <p className="text-xs text-ink-muted mt-0.5">JPG, PNG, WebP — max 10MB · Recommended: 1200×630</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label">Alt Text</label>
                      <input
                        type="text"
                        value={form.featuredImage?.alt ?? ''}
                        onChange={e => setNested('featuredImage', 'alt', e.target.value)}
                        className="admin-input"
                        placeholder="Describe the image"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Caption</label>
                      <input
                        type="text"
                        value={form.featuredImage?.caption ?? ''}
                        onChange={e => setNested('featuredImage', 'caption', e.target.value)}
                        className="admin-input"
                        placeholder="Caption below image"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="admin-label">Photo Credit</label>
                      <input
                        type="text"
                        value={form.featuredImage?.credit ?? ''}
                        onChange={e => setNested('featuredImage', 'credit', e.target.value)}
                        className="admin-input"
                        placeholder="Photographer / Agency name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="admin-card p-6 space-y-3">
                <SectionHeader title="SEO & Meta" />
                <div>
                  <label className="admin-label">
                    Meta Title
                    <span className="normal-case font-normal text-ink-faint ml-1">(leave blank to use headline)</span>
                  </label>
                  <input
                    type="text"
                    value={form.seo?.metaTitle ?? ''}
                    onChange={e => setNested('seo', 'metaTitle', e.target.value)}
                    className="admin-input"
                    placeholder={form.title || 'Will use headline'}
                  />
                  <p className="text-xs text-ink-faint mt-1">{(form.seo?.metaTitle || form.title || '').length}/60</p>
                </div>
                <div>
                  <label className="admin-label">Meta Description</label>
                  <textarea
                    rows={2}
                    value={form.seo?.metaDescription ?? ''}
                    onChange={e => setNested('seo', 'metaDescription', e.target.value)}
                    className="admin-input resize-none"
                    placeholder="150–160 characters for search engines"
                  />
                  <p className="text-xs text-ink-faint mt-1">{(form.seo?.metaDescription || '').length}/160</p>
                </div>
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className={`space-y-4 ${sidebarCollapsed ? 'hidden' : ''}`}>

              {/* Publish */}
              <div className="admin-card p-5 space-y-3">
                <SectionHeader title="Publish Settings" />
                <div>
                  <label className="admin-label">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)} className="admin-select">
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {form.status === 'scheduled' && (
                  <div>
                    <label className="admin-label flex items-center gap-1"><Clock size={10} /> Scheduled For</label>
                    <input
                      type="datetime-local"
                      value={(form as any).scheduledFor ?? ''}
                      onChange={e => set('scheduledFor' as any, e.target.value)}
                      className="admin-input"
                    />
                  </div>
                )}
                <div>
                  <label className="admin-label">Language</label>
                  <select value={form.language} onChange={e => set('language', e.target.value as any)} className="admin-select">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Classification */}
              <div className="admin-card p-5 space-y-3">
                <SectionHeader title="Classification" />
                <div>
                  <label className="admin-label">Content Type *</label>
                  <select value={form.contentType} onChange={e => set('contentType', e.target.value)} className="admin-select">
                    {CONTENT_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Category *</label>
                  <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="admin-select">
                    <option value="">— Select category —</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Tags <span className="normal-case font-normal text-ink-faint">(comma separated)</span></label>
                  <input
                    type="text"
                    value={form.tagsInput ?? ''}
                    onChange={e => set('tagsInput', e.target.value)}
                    className="admin-input"
                    placeholder="uapa, kashmir, judiciary"
                  />
                  {form.tagsInput && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[11px] bg-gray-100 text-ink-secondary px-2 py-0.5 rounded-full font-sans">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="admin-label">Series Name</label>
                  <input
                    type="text"
                    value={form.series ?? ''}
                    onChange={e => set('series', e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Voices from the Ground"
                  />
                </div>
                {form.series && (
                  <div>
                    <label className="admin-label">Part #</label>
                    <input
                      type="number"
                      min={1}
                      value={form.seriesPart ?? ''}
                      onChange={e => set('seriesPart', Number(e.target.value))}
                      className="admin-input"
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="admin-card p-5 space-y-3">
                <SectionHeader title="Location" />
                <div>
                  <label className="admin-label">State</label>
                  <input
                    type="text"
                    value={form.location?.state ?? ''}
                    onChange={e => setNested('location', 'state', e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Uttar Pradesh"
                  />
                </div>
                <div>
                  <label className="admin-label">District</label>
                  <input
                    type="text"
                    value={form.location?.district ?? ''}
                    onChange={e => setNested('location', 'district', e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Muzaffarnagar"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="admin-card p-5 space-y-4">
                <SectionHeader title="Flags & Badges" />
                <Toggle label="Featured Article" desc="Show in hero/featured slots" checked={!!form.isFeatured} onChange={() => set('isFeatured', !form.isFeatured)} />
                <Toggle label="Breaking News" desc="Show in breaking ticker" checked={!!form.isBreaking} onChange={() => set('isBreaking', !form.isBreaking)} />
                <Toggle label="Editor's Pick" checked={!!form.isEditorsPick} onChange={() => set('isEditorsPick', !form.isEditorsPick)} />
                <Toggle label="Must Read" checked={!!form.isMustRead} onChange={() => set('isMustRead', !form.isMustRead)} />
                <Toggle label="Fact-Checked / Verified" desc="Show verified badge" checked={!!form.isVerified} onChange={() => set('isVerified', !form.isVerified)} />
                <Toggle label="Premium Content" desc="Subscriber-only" checked={!!form.isPremium} onChange={() => set('isPremium', !form.isPremium)} />
              </div>

              {/* Guest Author */}
              <div className="admin-card p-5 space-y-3">
                <SectionHeader title="Guest / External Author" />
                <Toggle label="This is a guest author piece" checked={!!form.isGuestAuthor} onChange={() => set('isGuestAuthor', !form.isGuestAuthor)} />
                {form.isGuestAuthor && (
                  <>
                    <div>
                      <label className="admin-label">Author Name</label>
                      <input type="text" value={form.guestAuthorName ?? ''} onChange={e => set('guestAuthorName', e.target.value)} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Author Bio</label>
                      <textarea rows={3} value={form.guestAuthorBio ?? ''} onChange={e => set('guestAuthorBio', e.target.value)} className="admin-input resize-none" />
                    </div>
                  </>
                )}
              </div>

              {/* Video */}
              <div className="admin-card p-5">
                <label className="admin-label">Video URL</label>
                <input
                  type="url"
                  value={form.videoUrl ?? ''}
                  onChange={e => set('videoUrl', e.target.value)}
                  className="admin-input"
                  placeholder="https://youtube.com/watch?v=…"
                />
                <p className="text-xs text-ink-faint mt-1.5">YouTube, Vimeo, or direct video link</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
