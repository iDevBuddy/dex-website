import { useEffect } from 'react'
import { CalendarDays, Clock, RefreshCcw } from 'lucide-react'
import { buildBlogPostingSchema, buildFaqSchema, formatDate, getPostBySlug, getRelatedPosts } from '../../lib/blog'
import { setSeo } from '../../lib/seo'
import ArticleAudioPlayer from './ArticleAudioPlayer'
import MarkdownRenderer from './MarkdownRenderer'

export default function BlogPost({ slug }) {
    const post = getPostBySlug(slug)

    useEffect(() => {
        if (!post) {
            setSeo({
                title: 'Article Not Found | DEX by Akif Saeed',
                description: 'The requested article could not be found.',
                path: window.location.pathname,
            })
            return
        }

        setSeo({
            title: post.metaTitle || `${post.title} | DEX by Akif Saeed`,
            description: post.metaDescription || post.description,
            path: `/blog/${post.slug}`,
            image: post.image,
            type: 'article',
            schema: [buildBlogPostingSchema(post), buildFaqSchema(post)],
        })
    }, [post])

    if (!post) {
        return (
            <main id="main-content" className="pt-32 pb-24">
                <section className="max-w-3xl mx-auto px-6">
                    <h1 className="text-4xl font-black text-white mb-4">Article not found</h1>
                    <p className="text-gray-400 mb-8">This blog post does not exist yet.</p>
                    <a href="/blog" className="text-accent font-semibold">Back to blog</a>
                </section>
            </main>
        )
    }

    const relatedPosts = getRelatedPosts(post)

    return (
        <main id="main-content" className="pt-28 pb-24">
            <article>
                <header className="max-w-4xl mx-auto px-6 mb-10">
                    <a href="/blog" className="font-mono text-xs uppercase tracking-[0.2em] text-accent hover:text-white transition-colors">
                        {post.category}
                    </a>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mt-5 mb-5">{post.title}</h1>
                    <p className="text-xl text-gray-400 leading-8 mb-7">{post.subtitle || post.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-7">
                        <span>{post.author}</span>
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> {formatDate(post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><RefreshCcw size={15} /> Updated {formatDate(post.updatedAt || post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {post.readingTime}</span>
                    </div>
                    <ArticleAudioPlayer title={post.title} text={`${post.title}. ${post.description}. ${post.body}`} audioSrc={post.audio} />
                </header>

                <div className="max-w-6xl mx-auto px-6 mb-12">
                    <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="aspect-[16/9] w-full rounded-lg border border-border object-cover bg-dark-card"
                        width="1280"
                        height="720"
                        loading="eager"
                    />
                </div>

                <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[240px_minmax(0,760px)] gap-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 border-l border-border pl-5">
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em] mb-4">Contents</p>
                            <nav className="space-y-3">
                                {post.headings.map((heading) => (
                                    <a
                                        key={heading.id}
                                        href={`#${heading.id}`}
                                        className={`block text-sm leading-5 text-gray-500 hover:text-accent transition-colors ${heading.depth === 3 ? 'pl-3' : ''}`}
                                    >
                                        {heading.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div>
                        {post.directAnswer && (
                            <section className="mb-10 rounded-lg border border-accent/25 bg-accent-dim p-6">
                                <h2 className="text-lg font-bold text-white mb-2">Direct Answer</h2>
                                <p className="text-gray-200 leading-7">{post.directAnswer}</p>
                            </section>
                        )}

                        <MarkdownRenderer body={post.body} />

                        {post.faqs.length > 0 && (
                            <section className="mt-14 border-t border-border pt-10">
                                <h2 className="text-3xl font-black text-white mb-6">FAQ</h2>
                                <div className="space-y-5">
                                    {post.faqs.map((faq) => (
                                        <details key={faq.question} className="rounded-lg border border-border bg-dark-card p-5">
                                            <summary className="cursor-pointer text-white font-semibold">{faq.question}</summary>
                                            <p className="text-gray-400 leading-7 mt-3">{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}

                        {post.sources.length > 0 && (
                            <section className="mt-14 border-t border-border pt-10">
                                <h2 className="text-3xl font-black text-white mb-6">Sources and References</h2>
                                <ul className="space-y-3">
                                    {post.sources.map((source) => (
                                        <li key={source.url}>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">
                                                {source.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="mt-14 grid sm:grid-cols-[96px_1fr] gap-5 rounded-lg border border-border bg-dark-card p-6">
                            <div className="h-24 w-24 rounded-lg bg-accent text-white grid place-items-center font-mono font-bold text-2xl">AS</div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{post.author}</h2>
                                <p className="text-gray-400 leading-7">
                                    AI automation engineer building practical agents, workflow systems, and business automation infrastructure for service companies.
                                </p>
                            </div>
                        </section>

                        <section className="mt-12 rounded-lg border border-accent/30 bg-dark-deeper p-7">
                            <h2 className="text-2xl font-black text-white mb-3">Want an AI automation system like this?</h2>
                            <p className="text-gray-400 leading-7 mb-5">DEX can help you turn repetitive business work into reliable AI-assisted workflows.</p>
                            <a href="/#contact" className="inline-flex px-5 py-3 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">
                                Book an automation consult
                            </a>
                        </section>
                    </div>
                </div>
            </article>

            {relatedPosts.length > 0 && (
                <section className="max-w-6xl mx-auto px-6 mt-20 border-t border-border pt-12">
                    <h2 className="text-3xl font-black text-white mb-7">Related posts</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedPosts.map((related) => (
                            <a key={related.slug} href={`/blog/${related.slug}`} className="block rounded-lg border border-border bg-dark-card p-5 hover:border-border-hover transition-colors">
                                <p className="font-mono text-[0.7rem] text-accent uppercase tracking-[0.18em] mb-3">{related.category}</p>
                                <h3 className="text-lg font-bold text-white mb-3">{related.title}</h3>
                                <p className="text-sm text-gray-500">{related.readingTime}</p>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
