import { useEffect } from 'react';

interface SeoMetaOptions {
  title?:       string;
  description?: string;
  image?:       string;
  url?:         string;
  type?:        'website' | 'article';
  publishedAt?: string;
  author?:      string;
  section?:     string;
}

const SITE_NAME = 'The Orbis Journal';
const DEFAULT_DESCRIPTION =
  'Independent journalism on human rights, minorities, and social justice in India and beyond.';
const DEFAULT_IMAGE = '/og-default.jpg'; // put a 1200×630 branded image in client/public/
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://theorbisjournal.in';

function setMeta(property: string, content: string, attr: 'name' | 'property' = 'property') {
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeoMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  publishedAt,
  author,
  section,
}: SeoMetaOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    const fullUrl   = url ?? window.location.href;

    // ── Page title ────────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Standard meta ─────────────────────────────────────────────────────────
    setMeta('description',         description,    'name');
    setMeta('robots',              'index, follow', 'name');

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta('og:site_name',        SITE_NAME);
    setMeta('og:type',             type);
    setMeta('og:title',            fullTitle);
    setMeta('og:description',      description);
    setMeta('og:image',            fullImage);
    setMeta('og:image:width',      '1200');
    setMeta('og:image:height',     '630');
    setMeta('og:url',              fullUrl);

    if (type === 'article') {
      if (publishedAt) setMeta('article:published_time', publishedAt);
      if (author)      setMeta('article:author',         author);
      if (section)     setMeta('article:section',        section);
    }

    // ── Twitter / X Card ──────────────────────────────────────────────────────
    setMeta('twitter:card',        'summary_large_image',  'name');
    setMeta('twitter:site',        '@theorbisjournal',     'name'); // update to real handle
    setMeta('twitter:title',       fullTitle,              'name');
    setMeta('twitter:description', description,            'name');
    setMeta('twitter:image',       fullImage,              'name');

    // ── Canonical ─────────────────────────────────────────────────────────────
    setLink('canonical', fullUrl);

    // ── Cleanup: reset to defaults when component unmounts ────────────────────
    return () => {
      document.title = SITE_NAME;
      setMeta('description',         DEFAULT_DESCRIPTION, 'name');
      setMeta('og:type',             'website');
      setMeta('og:title',            SITE_NAME);
      setMeta('og:description',      DEFAULT_DESCRIPTION);
      setMeta('og:image',            `${SITE_URL}${DEFAULT_IMAGE}`);
      setMeta('og:url',              SITE_URL);
      setMeta('twitter:title',       SITE_NAME,            'name');
      setMeta('twitter:description', DEFAULT_DESCRIPTION,  'name');
      setMeta('twitter:image',       `${SITE_URL}${DEFAULT_IMAGE}`, 'name');
    };
  }, [title, description, image, url, type, publishedAt, author, section]);
}