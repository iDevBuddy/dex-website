import { ArrowUpRight } from 'lucide-react'
import { blogPosts } from '../lib/blog'
import ArticleCard from './blog/ArticleCard'

/* Homepage "Latest insights" — pulls the most recent posts straight from the
   automated blog engine, so it stays current with zero manual upkeep. */
export default function BlogTeaser() {
    const latest = blogPosts.slice(0, 4)
    if (!latest.length) return null

    return (
        <section id="insights" className="bg-dark py-20 lg:py-28">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="dotted-rule text-border mb-14" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <span className="eyebrow mb-5">From the Blog</span>
                        <h2 data-reveal className="font-display text-3xl sm:text-[2.8rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] max-w-xl">
                            Latest insights &amp; resources
                        </h2>
                    </div>
                    <a
                        href="/blog"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-[0.84rem] font-semibold text-ghost transition-colors hover:border-accent hover:text-accent shrink-0"
                    >
                        Read all articles
                        <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {latest.map((post, i) => (
                        <div key={post.slug} data-reveal style={{ '--rd': `${i * 0.08}s` }}>
                            <ArticleCard post={post} priority={i === 0} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
