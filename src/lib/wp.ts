export interface WPPost {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  jetpack_featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string; alt_text?: string }>;
    author?: Array<{ name?: string }>;
  };
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  image: string | null;
  imageAlt: string;
  readingMinutes: number;
  author: string | null;
}

const RAW_BASE = import.meta.env.WP_API_URL || 'https://wordpress.org/news/wp-json';
export const WP_API_BASE = RAW_BASE.replace(/\/+$/, '');

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“',
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const isHex = code[1] === 'x' || code[1] === 'X';
      const value = parseInt(isHex ? code.slice(2) : code.slice(1), isHex ? 16 : 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Strip tags and collapse whitespace so plain text can be used in summaries and meta tags. */
export function toPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function readingMinutes(contentHtml: string): number {
  const words = toPlainText(contentHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function featuredImage(post: WPPost): { src: string | null; alt: string } {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const src = media?.source_url || post.jetpack_featured_media_url || null;
  const alt = media?.alt_text?.trim() || toPlainText(post.title.rendered);
  return { src, alt };
}

export function toSummary(post: WPPost): PostSummary {
  const image = featuredImage(post);
  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(toPlainText(post.title.rendered)),
    excerpt: truncate(toPlainText(post.excerpt.rendered || post.content.rendered), 200),
    date: post.date,
    dateLabel: formatDate(post.date),
    image: image.src,
    imageAlt: image.alt,
    readingMinutes: readingMinutes(post.content.rendered),
    author: post._embedded?.author?.[0]?.name
      ? decodeEntities(post._embedded.author[0].name)
      : null,
  };
}

async function request<T>(path: string): Promise<T> {
  const url = `${WP_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'user-agent': 'astro-wp-headless (portfolio demo)' },
  });

  if (!res.ok) {
    throw new Error(`WordPress API request failed (${res.status}) for ${url}`);
  }

  return (await res.json()) as T;
}

/** Fetch published posts, newest first. Content is included so detail pages can be pre-rendered. */
export async function getPosts(limit = 12): Promise<WPPost[]> {
  const posts = await request<WPPost[]>(
    `/wp/v2/posts?per_page=${limit}&_embed=1&_fields=id,slug,date,link,title,excerpt,content,jetpack_featured_media_url,_embedded`,
  );
  return Array.isArray(posts) ? posts : [];
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await request<WPPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&_fields=id,slug,date,link,title,excerpt,content,jetpack_featured_media_url,_embedded`,
  );
  return posts?.[0] ?? null;
}
