import { useEffect } from 'react'
import { ArrowRight, Clock } from 'lucide-react'
import { blogPosts, formatDate } from '../../lib/blog'
import { setSeo } from '../../lib/seo'

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
        <main id="main-content" className="pt-28 pb-24">
            <section className="max-w-7xl mx-auto px-6">
                <div className="max-w-3xl mb-14">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent mb-4">AI Authority Blog</p>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Practical AI automation playbooks for modern businesses.
                    </h1>
                    <p className="text-lg text-gray-400 leading-8">
                        Expert guides, workflows, and implementation notes for AI agents, automation systems, and business growth.
                    </p>
                </div>

                {featured && (
                    <article className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center border-y border-border py-10 mb-12">
                        <a href={`/blog/${featured.slug}`} className="block overflow-hidden rounded-lg border border-border bg-dark-card">
                            <img
                                src={featured.image}
                                alt={featured.imageAlt}
                                className="aspect-[16/9] w-full object-cover"
                                loading="eager"
                                width="1280"
                                height="720"
                            />
                        </a>
                        <div>
                            <p className="font-mono text-xs text-accent uppercase tracking-[0.2em] mb-4">{featured.category}</p>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                                <a href={`/blog/${featured.slug}`} className="hover:text-accent transition-colors">{featured.title}</a>
                            </h2>
                            <p className="text-gray-400 leading-7 mb-6">{featured.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-7">
                                <span>{featured.author}</span>
                                <span>{formatDate(featured.publishedAt)}</span>
                                <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {featured.readingTime}</span>
                            </div>
                            <a href={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors">
                                Read article <ArrowRight size={16} />
                            </a>
                        </div>
                    </article>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <article key={post.slug} className="border border-border bg-dark-card rounded-lg overflow-hidden hover:border-border-hover transition-colors">
                            <a href={`/blog/${post.slug}`}>
                                <img src={post.image} alt={post.imageAlt} className="aspect-[16/9] w-full object-cover" loading="lazy" width="800" height="450" />
                            </a>
                            <div className="p-6">
                                <p className="font-mono text-[0.7rem] text-accent uppercase tracking-[0.18em] mb-3">{post.category}</p>
                                <h2 className="text-xl font-bold text-white mb-3">
                                    <a href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">{post.title}</a>
                                </h2>
                                <p className="text-sm text-gray-400 leading-6 mb-5">{post.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{formatDate(post.publishedAt)}</span>
                                    <span>{post.readingTime}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
