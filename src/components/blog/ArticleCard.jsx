import { formatDate } from '../../lib/blog'

/* Editorial article card — image-led, red-square category, display title.
   Shared by the homepage teaser and the blog index for one consistent voice. */
export default function ArticleCard({ post, priority = false }) {
    return (
        <a href={`/blog/${post.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-dark-deeper aspect-[4/3]">
                <img
                    src={post.image}
                    alt={post.imageAlt}
                    loading={priority ? 'eager' : 'lazy'}
                    width="800"
                    height="600"
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
            </div>
            <div className="mt-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-2 h-2 bg-accent shrink-0" />
                    <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ghost-dim">{post.category}</span>
                </div>
                <h3 className="font-display text-[1.12rem] font-bold text-ghost leading-snug tracking-tight transition-colors duration-300 group-hover:text-accent">
                    {post.title}
                </h3>
                <div className="mt-4 flex items-center gap-2.5 font-mono text-[0.68rem] text-ghost-faint uppercase tracking-[0.12em]">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-ghost-faint/60" />
                    <span>{post.readingTime}</span>
                </div>
            </div>
        </a>
    )
}
