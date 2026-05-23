import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, Loader } from 'lucide-react';
import { articlesAdmin, categoriesAdmin } from '../services/admin';
import { useAdminAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { Article, Category } from '../types';

const CONTENT_TYPES = [
  'news','investigation','opinion','analysis','ground-report',
  'explainer','interview','photo-essay','video-report','book-excerpt',
  'special-series','community-voice','verified-report','in-their-words',
];

const STATUSES = ['draft','review','scheduled','published','archived'];
const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' }, { value: 'hi', label: 'Hindi' }];

interface FormState extends Partial<Article> {
  tagsInput?: string;
  categoryId?: string;
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button type="button" onClick={onChange}
        className={`relative mt-0.5 flex-shrink-0 w-9 h-5 rounded-full transition-colors ${checked ? 'bg-brand-navy' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {desc && <p className="text-xs text-ink-muted">{desc}</p>}
      </div>
    </label>
  );
}

export default function ArticleEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormState>({
    title: '', subtitle: '', excerpt: '', body: '',
    contentType: 'news', status: 'draft', language: 'en',
    categoryId: '', tagsInput: '', series: '', seriesPart: undefined,
    videoUrl: '', featuredImage: { url: '', alt: '', caption: '', credit: '' },
    location: { state: '', district: '', country: 'India' },
    seo: { metaTitle: '', metaDescription: '' },
    isFeatured: false, isBreaking: false, isEditorsPick: false,
    isMustRead: false, isVerified: false, isPremium: false,
    isGuestAuthor: false, guestAuthorName: '', guestAuthorBio: '',
  });

  // Fetch categories
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAdmin.getAll(),
  });
  const categories: Category[] = catData?.data?.data?.categories ?? [];

  // Fetch existing article if editing
  const { isLoading: articleLoading } = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: () => articlesAdmin.getAll({ id, limit: 1 }),
    enabled: isEditing,
    select: (res) => res.data?.data?.articles?.[0],
    onSuccess: (art: Article) => {
      if (!art) return;
      setForm({
        ...art,
        tagsInput: art.tags?.join(', ') ?? '',
        categoryId: typeof art.category === 'object' ? art.category._id : art.category,
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing && id) return articlesAdmin.update(id, payload);
      return articlesAdmin.create(payload);
    },
    onSuccess: (res) => {
      const article = res.data?.data?.article;
      toast.success(isEditing ? 'Article updated!' : 'Article created!');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      if (!isEditing && article?._id) {
        navigate(`/articles/${article._id}/edit`);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to save article');
    },
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setNested = (parent: 'featuredImage' | 'location' | 'seo', key: string, val: string) =>
    setForm(f => ({ ...f, [parent]: { ...(f[parent] as any), [key]: val } }));

  const handleSave = (statusOverride?: string) => {
    const payload: any = {
      ...form,
      tags: form.tagsInput?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
      category: form.categoryId,
      status: statusOverride ?? form.status,
    };
    delete payload.tagsInput;
    delete payload.categoryId;
    saveMutation.mutate(payload);
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

  if (isEditing && articleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-brand-navy" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <Link to="/articles" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-ink-muted font-sans">{isEditing ? 'Editing article' : 'New article'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <a href={`${import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:3000'}/article/${form.slug}`}
              target="_blank" rel="noopener noreferrer"
              className="admin-btn-secondary text-xs py-1.5 gap-1.5">
              <Eye size={13} /> Preview
            </a>
          )}
          <button onClick={() => handleSave('draft')} disabled={saveMutation.isPending}
            className="admin-btn-secondary text-xs py-1.5">
            Save Draft
          </button>
          <button onClick={() => handleSave('review')} disabled={saveMutation.isPending}
            className="admin-btn text-xs py-1.5 bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200">
            Submit for Review
          </button>
          <button onClick={() => handleSave('published')} disabled={saveMutation.isPending}
            className="admin-btn-primary text-xs py-1.5 gap-1.5">
            {saveMutation.isPending ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
            Publish
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left: Main Content ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Core fields */}
            <div className="admin-card p-6 space-y-4">
              <div>
                <label className="admin-label">Title *</label>
                <textarea rows={2} value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Write a compelling headline…"
                  className="admin-input resize-none text-xl font-serif font-bold leading-snug" />
              </div>
              <div>
                <label className="admin-label">Subtitle / Deck</label>
                <input type="text" value={form.subtitle ?? ''}
                  onChange={e => set('subtitle', e.target.value)}
                  placeholder="Supporting line displayed below the headline"
                  className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Excerpt / Summary *</label>
                <textarea rows={3} value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  placeholder="1-2 sentences shown in article cards and search results…"
                  className="admin-input resize-none" />
                <p className="text-xs text-ink-faint mt-1">{(form.excerpt?.length ?? 0)}/1000</p>
              </div>
            </div>

            {/* Body */}
            <div className="admin-card p-6">
              <label className="admin-label">Article Body</label>
              <p className="text-xs text-ink-muted mb-3">Write HTML or plain text. In production, replace textarea with TipTap/Quill rich text editor.</p>
              <textarea rows={28}
                value={form.body ?? ''}
                onChange={e => set('body', e.target.value)}
                placeholder="<p>Start writing your article here…</p>"
                className="admin-input resize-y font-mono text-sm leading-relaxed" />
            </div>

            {/* Featured Image */}
            <div className="admin-card p-6">
              <label className="admin-label">Featured Image</label>
              <div className="space-y-4">
                {form.featuredImage?.url ? (
                  <div className="relative">
                    <img src={form.featuredImage.url} alt="Preview" className="w-full h-52 object-cover" />
                    <button type="button" onClick={() => setNested('featuredImage', 'url', '')}
                      className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2.5 py-1 hover:opacity-90">
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-10 border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-navy transition-colors">
                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <span className="text-sm text-ink-muted">Click to upload image</span>
                    <span className="text-xs text-ink-faint">JPG, PNG, WebP — max 10MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">Alt Text</label>
                    <input type="text" value={form.featuredImage?.alt ?? ''} onChange={e => setNested('featuredImage', 'alt', e.target.value)} className="admin-input" placeholder="Describe the image for screen readers" />
                  </div>
                  <div>
                    <label className="admin-label">Caption</label>
                    <input type="text" value={form.featuredImage?.caption ?? ''} onChange={e => setNested('featuredImage', 'caption', e.target.value)} className="admin-input" placeholder="Caption shown below the image" />
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">Photo Credit</label>
                    <input type="text" value={form.featuredImage?.credit ?? ''} onChange={e => setNested('featuredImage', 'credit', e.target.value)} className="admin-input" placeholder="Photographer or agency name" />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="admin-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-ink mb-1">SEO & Meta</h3>
              <div>
                <label className="admin-label">Meta Title <span className="normal-case font-normal text-ink-faint">(leave blank to use headline)</span></label>
                <input type="text" value={form.seo?.metaTitle ?? ''} onChange={e => setNested('seo', 'metaTitle', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Meta Description</label>
                <textarea rows={2} value={form.seo?.metaDescription ?? ''} onChange={e => setNested('seo', 'metaDescription', e.target.value)} className="admin-input resize-none" placeholder="150-160 characters for search engines" />
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">

            {/* Publish */}
            <div className="admin-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-ink">Publish Settings</h3>
              <div>
                <label className="admin-label">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value as any)} className="admin-select">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="admin-label">Scheduled For</label>
                  <input type="datetime-local" value={form.scheduledFor ?? ''} onChange={e => set('scheduledFor', e.target.value)} className="admin-input" />
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
              <h3 className="text-sm font-semibold text-ink">Classification</h3>
              <div>
                <label className="admin-label">Content Type *</label>
                <select value={form.contentType} onChange={e => set('contentType', e.target.value)} className="admin-select">
                  {CONTENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/-/g, ' ')}</option>)}
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
                <input type="text" value={form.tagsInput ?? ''} onChange={e => set('tagsInput', e.target.value)} className="admin-input" placeholder="uapa, muslim, detention, kashmir" />
              </div>
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

            {/* Location */}
            <div className="admin-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-ink">Location</h3>
              <div>
                <label className="admin-label">State</label>
                <input type="text" value={form.location?.state ?? ''} onChange={e => setNested('location', 'state', e.target.value)} className="admin-input" placeholder="e.g. Uttar Pradesh" />
              </div>
              <div>
                <label className="admin-label">District</label>
                <input type="text" value={form.location?.district ?? ''} onChange={e => setNested('location', 'district', e.target.value)} className="admin-input" placeholder="e.g. Muzaffarnagar" />
              </div>
            </div>

            {/* Flags */}
            <div className="admin-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-ink">Flags & Badges</h3>
              <Toggle label="Featured Article" desc="Show in hero/featured slots" checked={!!form.isFeatured} onChange={() => set('isFeatured', !form.isFeatured)} />
              <Toggle label="Breaking News" desc="Show in breaking ticker" checked={!!form.isBreaking} onChange={() => set('isBreaking', !form.isBreaking)} />
              <Toggle label="Editor's Pick" checked={!!form.isEditorsPick} onChange={() => set('isEditorsPick', !form.isEditorsPick)} />
              <Toggle label="Must Read" checked={!!form.isMustRead} onChange={() => set('isMustRead', !form.isMustRead)} />
              <Toggle label="Fact-Checked / Verified" desc="Show verified badge" checked={!!form.isVerified} onChange={() => set('isVerified', !form.isVerified)} />
              <Toggle label="Premium Content" desc="Subscriber-only" checked={!!form.isPremium} onChange={() => set('isPremium', !form.isPremium)} />
            </div>

            {/* Guest Author */}
            <div className="admin-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-ink">Guest / External Author</h3>
              <Toggle label="This is a guest author" checked={!!form.isGuestAuthor} onChange={() => set('isGuestAuthor', !form.isGuestAuthor)} />
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
              <input type="url" value={form.videoUrl ?? ''} onChange={e => set('videoUrl', e.target.value)} className="admin-input" placeholder="https://youtube.com/watch?v=…" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
