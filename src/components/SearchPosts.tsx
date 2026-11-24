import { useMemo, useState } from 'react';
import type { PostSummary } from '../lib/wp';

interface Props {
  posts: PostSummary[];
}

export default function SearchPosts({ posts }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) =>
      `${post.title} ${post.excerpt}`.toLowerCase().includes(needle),
    );
  }, [posts, query]);

  return (
    <div>
      <div className="search">
        <label className="search__label" htmlFor="post-search">
          Filter posts
        </label>
        <input
          id="post-search"
          className="search__input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="WordPress, release, security…"
          autoComplete="off"
          aria-describedby="post-search-status"
        />
        <p id="post-search-status" className="search__status" role="status" aria-live="polite">
          {results.length} of {posts.length} posts
          {query.trim() ? ` matching “${query.trim()}”` : ''}
        </p>
      </div>

      {results.length === 0 ? (
        <p className="empty">No posts match that filter.</p>
      ) : (
        <ul className="post-grid">
          {results.map((post) => (
            <li key={post.id}>
              <article className="card">
                {post.image ? (
                  <div className="card__media">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      loading="lazy"
                      decoding="async"
                      width={640}
                      height={360}
                    />
                  </div>
                ) : null}
                <p className="meta">
                  <time dateTime={post.date}>{post.dateLabel}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </p>
                <h3 className="card__title">
                  <a href={`/blog/${post.slug}/`}>{post.title}</a>
                </h3>
                <p className="card__excerpt">{post.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
