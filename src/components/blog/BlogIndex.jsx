import { useEffect } from 'react'
import { ArrowUpRight, Clock } from 'lucide-react'
import { blogPosts, formatDate } from '../../lib/blog'
import { setSeo } from '../../lib/seo'
import ArticleCard from './ArticleCard'

export default function BlogIndex() {
    const featured = blogPosts[0]
    const posts = blogPosts.slice(1)

    useEffect(() => {
        setSeo({
            title: 'AI Automation Blog | DEX by Akif Saeed',
            description: 'Practical guides on AI agents, business automation, Slack automation, workflow systems, and scaling service businesses with AI.',
            path: '/blog',
            type: 'blog',
        })
    }, [])

    return (
        <main id="main-content" className="bg-dark pt-32 pb-24">
            <div className="max-w-[1320px] mx-auto px-6">
                {/* editorial header */}
                <div className="max-w-3xl mb-16">
                    <span className="eyebrow mb-5">AI Authority Blog</span>
                    <h1 className="font-display text-4xl md:text-[3.6rem] font-extrabold text-grad-dark tracking-tightest leading-[1.02] mb-6">
                        Practical AI automation playbooks.
                    </h1>
                    <p className="text-lg text-ghost-dim leading-8 max-w-2xl">
                        Expert guides, workflows, and implementation notes for AI agents, automation systems, and scaling service businesses with AI.
                    </p>
                </div>

                {/* featured — latest post */}
                {featured && (
                    <a
                        href={`/blog/${featured.slug}`}
                        className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20 pb-16 border-b border-border"
                    >
                        <div className="relative overflow-hidden rounded-[22px] border border-border bg-dark-deeper aspect-[16/11]">
                            <img
                                src={featured.image}
                                alt={featured.imageAlt}
                                loading="eager"
                                width="1280"
                                height="880"
                                className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="w-2 h-2 bg-accent" />
                                <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-ghost-dim">{featured.category} · Featured</span>
                            </div>
                            <h2 className="font-display text-3xl lg:text-[2.6rem] font-extrabold text-ghost tracking-tight leading-[1.05] mb-5 transition-colors group-hover:text-accent">
                                {featured.title}
                            </h2>
                            <p className="text-ghost-dim leading-7 mb-7 max-w-xl">{featured.description}</p>
                            <div className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ghost-faint mb-7">
                                <span>{featured.author}</span>
                                <span className="w-1 h-1 rounded-full bg-ghost-faint/60" />
                                <span>{formatDate(featured.publishedAt)}</span>
                                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {featured.readingTime}</span>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[0.86rem] font-semibold text-ghost transition-colors group-hover:text-accent">
                                Read article
                                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </div>
                    </a>
                )}

                {/* the rest */}
                {posts.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                        {posts.map((post) => (
                            <ArticleCard key={post.slug} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
