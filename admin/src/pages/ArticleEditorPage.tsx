import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Loader, Clock, CheckCircle, AlertCircle,
  Sparkles, Eye, EyeOff, ChevronRight, ChevronLeft, X,
  Tag, Globe, Zap, Star, FileText, Settings, Copy, RefreshCw,
} from 'lucide-react';
import { articlesAdmin, categoriesAdmin } from '../services/admin';
import toast from 'react-hot-toast';
import type { Article, Category } from '../types';
import RichTextEditor from '../components/editor/RichTextEditor';

// ── Constants ─────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  'news', 'investigation', 'opinion', 'analysis', 'ground-report',
  'explainer', 'interview', 'photo-essay', 'video-report', 'book-excerpt',
  'special-series', 'community-voice', 'verified-report', 'in-their-words',
];
const STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
  { value: 'hi', label: 'हिन्दी' },
];

interface FormState extends Partial<Article> {
  tagsInput?: string;
  categoryId?: string;
}

// ── Save indicator ────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-sans transition-all
      ${state === 'saving' ? 'text-ink-muted' : state === 'saved' ? 'text-accent-green' : 'text-accent-red'}`}>
      {state === 'saving' && <Loader size={11} className="animate-spin" />}
      {state === 'saved' && <CheckCircle size={11} />}
      {state === 'error' && <AlertCircle size={11} />}
      {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Failed'}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

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

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-bold font-sans uppercase tracking-widest text-ink-muted mb-3">
      {title}
    </p>
  );
}

// ── Live Preview Panel ────────────────────────────────────────────────────────

function LivePreview({ title, subtitle, excerpt, body, featuredImage, category }: {
  title: string; subtitle: string; excerpt: string; body: string;
  featuredImage: { url: string; caption: string; credit: string };
  category: string;
}) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-10">
        {/* Category */}
        {category && (
          <p className="text-xs font-bold uppercase tracking-widest text-brand-navy mb-4 font-sans">
            {category}
          </p>
        )}

        {/* Headline */}
        <h1
          className="font-serif text-3xl font-bold leading-tight text-gray-900 mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title || <span className="text-gray-300 italic">Your headline will appear here…</span>}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg text-gray-600 leading-relaxed mb-5 font-serif">{subtitle}</p>
        )}

        {/* Featured image */}
        {featuredImage?.url && (
          <figure className="mb-6 -mx-0">
            <img src={featuredImage.url} alt="" className="w-full rounded-sm object-cover max-h-80" />
            {featuredImage.caption && (
              <figcaption className="text-xs text-gray-500 mt-2 italic font-sans">
                {featuredImage.caption}{featuredImage.credit ? ` — ${featuredImage.credit}` : ''}
              </figcaption>
            )}
          </figure>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p className="text-base text-gray-700 leading-relaxed font-sans border-l-4 border-brand-navy pl-4 mb-6 italic">
            {excerpt}
          </p>
        )}

        {/* Body */}
        <div
          className="prose-preview"
          dangerouslySetInnerHTML={{ __html: body || '<p style="color:#cbd5e1;font-style:italic;">Your article body will render here as you write…</p>' }}
        />
      </div>

      <style>{`
        .prose-preview { font-family: Georgia, serif; font-size: 17px; line-height: 1.8; color: #1a1a2e; }
        .prose-preview h1 { font-family: 'Playfair Display', serif; font-size: 1.875rem; font-weight: 700; margin: 1.75rem 0 0.75rem; }
        .prose-preview h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.625rem; }
        .prose-preview h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
        .prose-preview p { margin: 0 0 1.25rem; }
        .prose-preview blockquote { border-left: 3px solid #122837; margin: 1.5rem 0; padding: 0.75rem 1.25rem; background: #f8fafc; font-style: italic; color: #374151; }
        .prose-preview ul { list-style: disc; padding-left: 1.75rem; margin: 1rem 0; }
        .prose-preview ol { list-style: decimal; padding-left: 1.75rem; margin: 1rem 0; }
        .prose-preview li { margin-bottom: 0.375rem; }
        .prose-preview a { color: #2563eb; text-decoration: underline; }
        .prose-preview img { max-width: 100%; height: auto; }
        .prose-preview figure { margin: 1.5rem 0; }
        .prose-preview figcaption { font-size: 0.8rem; color: #64748b; font-style: italic; margin-top: 0.375rem; font-family: sans-serif; }
        .prose-preview table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; font-family: sans-serif; }
        .prose-preview th, .prose-preview td { padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; text-align: left; }
        .prose-preview th { background: #f1f5f9; font-weight: 600; }
        .prose-preview aside { border-left: 3px solid #FBFC09; background: #f8fafc; padding: 1rem 1.25rem; margin: 1.5rem 0; font-style: italic; color: #374151; }
        .prose-preview code { background: #f1f5f9; padding: 2px 6px; font-family: monospace; font-size: 0.875em; border-radius: 3px; }
        .prose-preview hr { border: 0; border-top: 2px solid #e2e8f0; margin: 2rem 0; }
      `}</style>
    </div>
  );
}

// ── AI Drawer ─────────────────────────────────────────────────────────────────

function AIDrawer({ form, onApply, onClose }: {
  form: FormState;
  onApply: (field: string, value: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string[]>>({});

  const callAI = async (task: string, prompt: string) => {
    setLoading(task);
    try {
      const res = await articlesAdmin.aiAssist([{ role: 'user', content: prompt }]);
      const data = res.data;
      const text = data.content?.[0]?.text || '';

      // Parse JSON arrays or plain text lines
      let parsed: string[] = [];
      try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = text.split('\n').map((l: string) => l.replace(/^[-•\d.]\s*/, '').trim()).filter(Boolean);
      }
      setResults(r => ({ ...r, [task]: parsed }));
    } catch {
      toast.error('AI request failed');
    } finally {
      setLoading(null);
    }
  };

  const bodyText = form.body?.replace(/<[^>]+>/g, '').slice(0, 2000) || '';
  const hasContent = bodyText.length > 50;

  const tasks = [
    {
      id: 'headlines',
      label: 'Suggest Headlines',
      icon: <Zap size={14} />,
      desc: 'Get 5 compelling headline options',
      field: 'title',
      prompt: `You are a journalist's assistant for The Asr, an independent news publication. Given this article body, suggest 5 compelling, clear, and journalistically sound headlines. Return ONLY a JSON array of strings, no commentary.\n\nArticle body:\n${bodyText}`,
    },
    {
      id: 'excerpt',
      label: 'Write Excerpt',
      icon: <FileText size={14} />,
      desc: 'Auto-generate a 2-line summary',
      field: 'excerpt',
      prompt: `You are a journalist's assistant. Write a concise 1-2 sentence excerpt/summary for this article, suitable for card previews. Return ONLY a JSON array with a single string.\n\nTitle: ${form.title}\nBody: ${bodyText}`,
    },
    {
      id: 'tags',
      label: 'Suggest Tags',
      icon: <Tag size={14} />,
      desc: 'Generate relevant article tags',
      field: 'tagsInput',
      prompt: `You are a journalist's assistant. Suggest 5-8 relevant tags for this article. Tags should be lowercase, specific, and useful for search/discovery. Return ONLY a JSON array of tag strings.\n\nTitle: ${form.title}\nBody: ${bodyText}`,
    },
    {
      id: 'seo',
      label: 'Write Meta Description',
      icon: <Globe size={14} />,
      desc: 'Generate SEO meta description',
      field: 'seo.metaDescription',
      prompt: `Write a compelling SEO meta description (140-160 characters) for this news article. Return ONLY a JSON array with a single string.\n\nTitle: ${form.title}\nBody: ${bodyText}`,
    },
    {
      id: 'tone',
      label: 'Check Tone',
      icon: <Star size={14} />,
      desc: 'Review for bias or unclear language',
      field: '_tone',
      prompt: `You are an editorial assistant. Review this article excerpt for tone issues: bias, loaded language, lack of clarity, or unprofessional phrasing. Give 3-5 specific, actionable suggestions. Return ONLY a JSON array of suggestion strings.\n\nTitle: ${form.title}\nBody: ${bodyText}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      <div className="pointer-events-auto w-96 h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-brand-navy">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-yellow" />
            <h2 className="text-sm font-bold text-white font-sans">AI Writing Assistant</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {!hasContent && (
          <div className="m-4 p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-sans">
            Write at least a few sentences in the article body to unlock AI suggestions.
          </div>
        )}

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-brand-navy">{task.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-ink font-sans">{task.label}</p>
                    <p className="text-[10px] text-ink-muted font-sans mt-0.5">{task.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => callAI(task.id, task.prompt)}
                  disabled={!hasContent || loading === task.id}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-brand-navy text-brand-yellow px-2.5 py-1.5 rounded hover:bg-brand-navy-dark disabled:opacity-40 transition-colors font-sans"
                >
                  {loading === task.id
                    ? <Loader size={11} className="animate-spin" />
                    : results[task.id] ? <RefreshCw size={11} /> : <Sparkles size={11} />
                  }
                  {loading === task.id ? 'Generating…' : results[task.id] ? 'Regenerate' : 'Generate'}
                </button>
              </div>

              {results[task.id] && (
                <div className="divide-y divide-gray-50">
                  {results[task.id].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 px-4 py-2.5 hover:bg-blue-50 group transition-colors">
                      <p className="flex-1 text-xs text-ink font-sans leading-relaxed">{item}</p>
                      {task.field !== '_tone' && (
                        <button
                          onClick={() => {
                            if (task.field === 'tagsInput') {
                              const current = form.tagsInput || '';
                              const tags = current ? `${current}, ${item}` : item;
                              onApply(task.field, tags);
                            } else if (task.field.includes('.')) {
                              onApply(task.field, item);
                            } else {
                              onApply(task.field, item);
                            }
                            toast.success('Applied!');
                          }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Apply this suggestion"
                        >
                          <Copy size={11} className="text-brand-navy" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-ink-muted font-sans text-center">
            Powered by Claude · Suggestions are a starting point — always review before publishing
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

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

  // Panel controls
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showAI, setShowAI] = useState(false);

  // ── Categories ──────────────────────────────────────────────────────────────
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAdmin.getAll(),
  });
  const categories: Category[] = catData?.data?.data?.categories ?? [];

  // ── Fetch existing article ──────────────────────────────────────────────────
  const { isLoading: articleLoading, data: articleData } = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: async () => {
      const res = await articlesAdmin.getById(id!);
      return res.data?.data?.article;
    },
    enabled: isEditing,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!articleData) return;
    setForm({
      ...articleData,
      tagsInput: articleData.tags?.join(', ') ?? '',
      categoryId: typeof articleData.category === 'object' ? articleData.category._id : articleData.category,
    });
  }, [articleData]);

  // ── Save mutation ───────────────────────────────────────────────────────────
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
      const statusLabel = variables.status === 'published' ? 'Article published!'
        : variables.status === 'review' ? 'Submitted for review' : 'Draft saved';
      if (variables.status !== 'draft') toast.success(statusLabel);
      setTimeout(() => setSaveState('idle'), 3000);
    },
    onError: (err: any) => {
      setSaveState('error');
      toast.error(err.response?.data?.message ?? 'Failed to save article');
      setTimeout(() => setSaveState('idle'), 5000);
    },
  });

  const buildPayload = useCallback((statusOverride?: string) => {
    const payload: any = {
      ...form,
      tags: form.tagsInput?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
      status: statusOverride ?? form.status,
    };

    // Only include category if it has a valid value
    if (form.categoryId) {
      payload.category = form.categoryId;
    } else {
      delete payload.category;
    }

    // Clean up featuredImage — remove if no URL
    if (!payload.featuredImage?.url) {
      delete payload.featuredImage;
    } else {
      // Strip empty string fields inside featuredImage
      payload.featuredImage = Object.fromEntries(
        Object.entries(payload.featuredImage).filter(([, v]) => v !== '')
      );
    }

    // Clean up location — remove if all empty
    if (!payload.location?.state && !payload.location?.district) {
      delete payload.location;
    }

    // Clean up seo — remove empty string fields
    if (payload.seo) {
      payload.seo = Object.fromEntries(
        Object.entries(payload.seo).filter(([, v]) => v !== '')
      );
      if (Object.keys(payload.seo).length === 0) delete payload.seo;
    }

    // Remove internal form-only fields
    delete payload.tagsInput;
    delete payload.categoryId;
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    return payload;
  }, [form]);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (!form.title?.trim()) return;
      setSaveState('saving');
      saveMutation.mutate(buildPayload('draft'));
    }, 3000);
  }, [form, buildPayload, saveMutation]);

  useEffect(() => {
    if (!form.title?.trim()) return;
    triggerAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [form.title, form.body, form.excerpt]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setNested = (parent: 'featuredImage' | 'location' | 'seo', key: string, val: string) =>
    setForm(f => ({ ...f, [parent]: { ...(f[parent] as any), [key]: val } }));

  const handleSave = (statusOverride?: string) => {
    if (!form.title?.trim()) { toast.error('Please enter a title first'); return; }
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    if (!form.excerpt?.trim()) { toast.error('Please add an excerpt/summary'); return; }
    if (!form.body?.trim()) { toast.error('Article body cannot be empty'); return; }
    setSaveState('saving');
    saveMutation.mutate(buildPayload(statusOverride));
  };

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

  // AI apply handler
  const handleAIApply = (field: string, value: string) => {
    if (field === 'title') set('title', value);
    else if (field === 'excerpt') set('excerpt', value);
    else if (field === 'tagsInput') set('tagsInput', value);
    else if (field === 'seo.metaDescription') setNested('seo', 'metaDescription', value);
  };

  // Current category name for preview
  const currentCategoryName = categories.find(c => c._id === form.categoryId)?.name || '';

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

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-surface-secondary">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <Link to="/articles" className="text-ink-muted hover:text-ink transition-colors flex-shrink-0 p-1">
          <ArrowLeft size={15} />
        </Link>

        {/* Status pill */}
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 font-sans flex-shrink-0
          ${form.status === 'published' ? 'bg-green-100 text-green-700'
            : form.status === 'review' ? 'bg-amber-100 text-amber-700'
            : form.status === 'scheduled' ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'}`}>
          {form.status}
        </span>

        <p className="text-xs text-ink-muted font-sans truncate flex-1 min-w-0">
          {form.title || (isEditing ? 'Untitled' : 'New Article')}
        </p>

        <SaveIndicator state={saveState} />

        {/* View toggles */}
        <div className="flex items-center gap-1 border border-gray-200 rounded p-0.5 flex-shrink-0">
          <button
            onClick={() => setShowPreview(false)}
            title="Write mode"
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold font-sans rounded transition-colors
              ${!showPreview ? 'bg-brand-navy text-brand-yellow' : 'text-ink-muted hover:text-ink'}`}
          >
            Write
          </button>
          <button
            onClick={() => setShowPreview(true)}
            title="Preview mode"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold font-sans rounded transition-colors
              ${showPreview ? 'bg-brand-navy text-brand-yellow' : 'text-ink-muted hover:text-ink'}`}
          >
            <Eye size={11} /> Preview
          </button>
        </div>

        {/* AI button */}
        <button
          onClick={() => setShowAI(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-sans rounded border transition-all flex-shrink-0
            ${showAI
              ? 'bg-brand-navy text-brand-yellow border-brand-navy'
              : 'border-gray-200 text-ink hover:border-brand-navy hover:text-brand-navy'}`}
        >
          <Sparkles size={12} />
          AI Assist
        </button>

        {/* Settings toggle */}
        <button
          onClick={() => setShowSettings(s => !s)}
          title={showSettings ? 'Hide settings' : 'Show settings'}
          className={`p-1.5 rounded border transition-colors flex-shrink-0
            ${showSettings ? 'border-brand-navy text-brand-navy' : 'border-gray-200 text-ink-muted hover:text-ink'}`}
        >
          <Settings size={14} />
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => handleSave('draft')}
            disabled={saveMutation.isPending}
            className="admin-btn-secondary text-xs py-1.5 gap-1"
          >
            <Save size={12} /> Draft
          </button>
          <button
            onClick={() => handleSave('review')}
            disabled={saveMutation.isPending}
            className="admin-btn text-xs py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          >
            Submit
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saveMutation.isPending}
            className="admin-btn-primary text-xs py-1.5 gap-1"
          >
            {saveMutation.isPending ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Publish
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── Write/Preview Pane ── */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${showPreview ? 'bg-white' : 'bg-surface-secondary'}`}>
          {showPreview ? (
            <LivePreview
              title={form.title || ''}
              subtitle={form.subtitle || ''}
              excerpt={form.excerpt || ''}
              body={form.body || ''}
              featuredImage={form.featuredImage as any}
              category={currentCategoryName}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-5 py-6 space-y-4">

              {/* ── Breaking/Featured quick-flags ── */}
              <div className="flex gap-2">
                {[
                  { key: 'isBreaking', label: '🔴 Breaking', color: 'bg-red-50 border-red-200 text-red-700' },
                  { key: 'isFeatured', label: '⭐ Featured', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { key: 'isVerified', label: '✅ Verified', color: 'bg-green-50 border-green-200 text-green-700' },
                ].map(flag => (
                  <button
                    key={flag.key}
                    type="button"
                    onClick={() => set(flag.key as keyof FormState, !(form as any)[flag.key])}
                    className={`text-[11px] font-semibold font-sans px-3 py-1 rounded-full border transition-all
                      ${(form as any)[flag.key] ? flag.color : 'bg-white border-gray-200 text-ink-muted hover:border-gray-300'}`}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>

              {/* ── Headline card ── */}
              <div className="admin-card p-6 space-y-4">
                <div>
                  <label className="admin-label">Headline *</label>
                  <textarea
                    rows={2}
                    value={form.title ?? ''}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Write a compelling headline…"
                    className="w-full resize-none text-2xl font-bold leading-snug border-0 border-b border-gray-200 px-0 py-1 focus:border-brand-navy outline-none transition-colors bg-transparent font-serif placeholder:text-gray-300"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="admin-label mb-0">Excerpt / Summary</label>
                    <span className="text-[10px] text-ink-faint font-sans">{form.excerpt?.length ?? 0}/300</span>
                  </div>
                  <textarea
                    rows={2}
                    value={form.excerpt ?? ''}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="1–2 sentences shown in article cards…"
                    className="admin-input resize-none"
                  />
                </div>
              </div>

              {/* ── Featured image (compact) ── */}
              <div className="admin-card p-5">
                <SectionLabel title="Featured Image" />
                {form.featuredImage?.url ? (
                  <div className="relative mb-3">
                    <img src={form.featuredImage.url} alt="Preview" className="w-full h-44 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => setNested('featuredImage', 'url', '')}
                      className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2 py-1 rounded hover:opacity-90"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-navy transition-colors rounded mb-3">
                    <div className="w-9 h-9 bg-gray-100 flex items-center justify-center text-gray-400 rounded flex-shrink-0">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Click to upload featured image</p>
                      <p className="text-xs text-ink-muted">JPG, PNG, WebP · 1200×630 recommended</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">Caption</label>
                    <input type="text" value={form.featuredImage?.caption ?? ''} onChange={e => setNested('featuredImage', 'caption', e.target.value)} className="admin-input" placeholder="Optional caption" />
                  </div>
                  <div>
                    <label className="admin-label">Photo Credit</label>
                    <input type="text" value={form.featuredImage?.credit ?? ''} onChange={e => setNested('featuredImage', 'credit', e.target.value)} className="admin-input" placeholder="Photographer / Agency" />
                  </div>
                </div>
              </div>

              {/* ── Rich Text Editor ── */}
              <div className="admin-card overflow-hidden">
                <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <label className="admin-label mb-0">Article Body</label>
                    <p className="text-xs text-ink-muted mt-0.5">Use the toolbar to format. Press Preview above to see how it looks.</p>
                  </div>
                </div>
                <RichTextEditor
                  value={form.body ?? ''}
                  onChange={v => set('body', v)}
                  minHeight={480}
                />
              </div>

              {/* ── SEO (compact) ── */}
              <div className="admin-card p-5 space-y-3">
                <SectionLabel title="SEO" />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="admin-label mb-0">Meta Description</label>
                    <span className="text-[10px] text-ink-faint font-sans">{(form.seo?.metaDescription || '').length}/160</span>
                  </div>
                  <textarea
                    rows={2}
                    value={form.seo?.metaDescription ?? ''}
                    onChange={e => setNested('seo', 'metaDescription', e.target.value)}
                    className="admin-input resize-none"
                    placeholder="150–160 characters for search engines"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="admin-label mb-0">Meta Title</label>
                    <span className="text-[10px] text-ink-faint font-sans">{(form.seo?.metaTitle || form.title || '').length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={form.seo?.metaTitle ?? ''}
                    onChange={e => setNested('seo', 'metaTitle', e.target.value)}
                    className="admin-input"
                    placeholder={form.title || 'Defaults to headline'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Settings Sidebar ── */}
        {showSettings && (
          <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 space-y-5">

              {/* Publish */}
              <div>
                <SectionLabel title="Publish" />
                <div className="space-y-2.5">
                  <div>
                    <label className="admin-label">Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value as any)} className="admin-select">
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  {form.status === 'scheduled' && (
                    <div>
                      <label className="admin-label flex items-center gap-1"><Clock size={10} /> Scheduled For</label>
                      <input type="datetime-local" value={(form as any).scheduledFor ?? ''} onChange={e => set('scheduledFor' as any, e.target.value)} className="admin-input" />
                    </div>
                  )}
                  <div>
                    <label className="admin-label">Language</label>
                    <select value={form.language} onChange={e => set('language', e.target.value as any)} className="admin-select">
                      {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  {(isEditing || currentArticleId) && (
                    <a href={`${clientUrl}/article/${form.slug}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-brand-navy font-semibold font-sans hover:underline mt-1">
                      <Eye size={12} /> View live article
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Classification */}
              <div>
                <SectionLabel title="Classification" />
                <div className="space-y-2.5">
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
                      placeholder="e.g. uapa, kashmir, judiciary"
                    />
                    {form.tagsInput && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {form.tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="text-[11px] bg-gray-100 text-ink-secondary px-2 py-0.5 rounded-full font-sans">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Location */}
              <div>
                <SectionLabel title="Location" />
                <div className="space-y-2.5">
                  <div>
                    <label className="admin-label">State</label>
                    <input type="text" value={form.location?.state ?? ''} onChange={e => setNested('location', 'state', e.target.value)} className="admin-input" placeholder="e.g. Uttar Pradesh" />
                  </div>
                  <div>
                    <label className="admin-label">District</label>
                    <input type="text" value={form.location?.district ?? ''} onChange={e => setNested('location', 'district', e.target.value)} className="admin-input" placeholder="e.g. Muzaffarnagar" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Flags */}
              <div>
                <SectionLabel title="Flags & Badges" />
                <div className="space-y-3">
                  <Toggle label="Featured Article" desc="Show in hero slots" checked={!!form.isFeatured} onChange={() => set('isFeatured', !form.isFeatured)} />
                  <Toggle label="Breaking News" desc="Show in breaking ticker" checked={!!form.isBreaking} onChange={() => set('isBreaking', !form.isBreaking)} />
                  <Toggle label="Editor's Pick" checked={!!form.isEditorsPick} onChange={() => set('isEditorsPick', !form.isEditorsPick)} />
                  <Toggle label="Must Read" checked={!!form.isMustRead} onChange={() => set('isMustRead', !form.isMustRead)} />
                  <Toggle label="Fact-Checked / Verified" desc="Show verified badge" checked={!!form.isVerified} onChange={() => set('isVerified', !form.isVerified)} />
                  <Toggle label="Premium / Subscribers Only" checked={!!form.isPremium} onChange={() => set('isPremium', !form.isPremium)} />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Guest Author */}
              <div>
                <SectionLabel title="Guest Author" />
                <Toggle label="This is a guest author piece" checked={!!form.isGuestAuthor} onChange={() => set('isGuestAuthor', !form.isGuestAuthor)} />
                {form.isGuestAuthor && (
                  <div className="space-y-2.5 mt-3">
                    <div>
                      <label className="admin-label">Author Name</label>
                      <input type="text" value={form.guestAuthorName ?? ''} onChange={e => set('guestAuthorName', e.target.value)} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Author Bio</label>
                      <textarea rows={2} value={form.guestAuthorBio ?? ''} onChange={e => set('guestAuthorBio', e.target.value)} className="admin-input resize-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Series + Video */}
              <div>
                <SectionLabel title="Series" />
                <div className="space-y-2.5">
                  <div>
                    <label className="admin-label">Series Name</label>
                    <input type="text" value={form.series ?? ''} onChange={e => set('series', e.target.value)} className="admin-input" placeholder="e.g. Voices from the Ground" />
                  </div>
                  {form.series && (
                    <div>
                      <label className="admin-label">Part #</label>
                      <input type="number" min={1} value={form.seriesPart ?? ''} onChange={e => set('seriesPart', Number(e.target.value))} className="admin-input" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel title="Video" />
                <input type="url" value={form.videoUrl ?? ''} onChange={e => set('videoUrl', e.target.value)} className="admin-input" placeholder="YouTube / Vimeo URL" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Drawer ── */}
      {showAI && (
        <AIDrawer
          form={form}
          onApply={handleAIApply}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}