import { useEffect } from 'react'
import { CalendarDays, CheckCircle2, Clock, Download, FileText, Presentation, RefreshCcw } from 'lucide-react'
import { buildBlogPostingSchema, buildFaqSchema, formatDate, getPostBySlug, getRelatedPosts } from '../../lib/blog'
import { setSeo } from '../../lib/seo'
import ArticleAudioPlayer from './ArticleAudioPlayer'
import ActiveTableOfContents from './ActiveTableOfContents'
import MarkdownRenderer from './MarkdownRenderer'

function articleMode(post) {
    const type = `${post.contentType || ''} ${post.style || ''} ${post.authorityAngle || ''}`.toLowerCase()
    const category = `${post.category || ''}`.toLowerCase()
    if (/case/.test(type)) return 'case-study'
    if (/tutorial|tool_tutorial|how to build|walkthrough/.test(type)) return 'tutorial'
    if (/business automation|workflow automation|lead generation|ecommerce automation/.test(category) || /business automation/.test(type)) return 'business-automation'
    return 'informational'
}

function hasBodyHeading(body, label) {
    return new RegExp(`^#{2,3}\\s+${label}\\b`, 'im').test(body || '')
}

function KeyTakeaways({ items = [], compact = false }) {
    if (!items.length) return null
    return (
        <section className={`${compact ? 'my-10' : 'mb-10'} rounded-lg border border-border bg-dark-card p-6`}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways</h2>
            <div className="grid gap-3">
                {items.map((item) => (
                    <div key={item} className="grid grid-cols-[22px_1fr] gap-3 rounded-md border border-border/70 bg-dark-deeper/70 p-4">
                        <CheckCircle2 size={18} className="mt-0.5 text-accent" aria-hidden="true" />
                        <p className="text-gray-300 leading-7">{item}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function EditorialOpener({ post }) {
    const mode = articleMode(post)
    const showDirectAnswer = post.directAnswer && (mode === 'informational' || /how-to|guide/i.test(post.contentType || ''))
    const showTakeaways = post.keyTakeaways.length > 0 && mode !== 'tutorial' && mode !== 'case-study'

    if (mode === 'tutorial') {
        return (
            <section className="mb-10 rounded-lg border border-border bg-dark-card p-6">
                <h2 className="text-lg font-bold text-white mb-3">{post.whatYouWillBuild ? "What You'll Build" : 'What This Guide Covers'}</h2>
                <p className="text-gray-300 leading-7 mb-5">{post.whatYouWillBuild || post.practicalUseCase || post.description}</p>
                {post.toolsNeeded.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-3">Tools Needed</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.toolsNeeded.map((tool) => <span key={tool} className="rounded-full border border-border px-3 py-1 text-sm text-gray-300">{tool}</span>)}
                        </div>
                    </div>
                )}
            </section>
        )
    }

    if (mode === 'case-study') {
        return (
            <section className="mb-10 grid md:grid-cols-3 gap-4">
                {[
                    ['Problem', post.caseProblem || post.businessProblem || post.description],
                    ['Result', post.caseResult || post.directAnswer || 'A cleaner workflow with clearer ownership and measurable operational improvement.'],
                    ['Business Impact', post.businessImpact || post.practicalUseCase || 'Less manual follow-up, better visibility, and fewer missed handoffs.'],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-border bg-dark-card p-5">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">{label}</p>
                        <p className="text-gray-300 leading-7">{value}</p>
                    </div>
                ))}
            </section>
        )
    }

    if (mode === 'business-automation') {
        return (
            <>
                <section className="mb-10 rounded-lg border border-accent/25 bg-dark-card p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">Business Problem</p>
                    <h2 className="text-xl font-bold text-white mb-3">{post.businessProblem || post.mainPainPoint || 'A repeatable workflow is costing time, focus, or revenue.'}</h2>
                    <p className="text-gray-300 leading-7">{post.automationOpportunity || post.directAnswer || post.practicalUseCase || post.description}</p>
                </section>
                {showTakeaways && <KeyTakeaways items={post.keyTakeaways} />}
            </>
        )
    }

    return (
        <>
            {showDirectAnswer && (
                <section className="mb-10 rounded-lg border border-accent/25 bg-accent-dim p-6">
                    <h2 className="text-lg font-bold text-white mb-2">Direct Answer</h2>
                    <p className="text-gray-200 leading-7">{post.directAnswer}</p>
                </section>
            )}
            {showTakeaways && <KeyTakeaways items={post.keyTakeaways} />}
        </>
    )
}

function skippedBodySections(post) {
    const mode = articleMode(post)
    const sections = []
    if (post.directAnswer && (mode === 'informational' || mode === 'business-automation' || /how-to|guide/i.test(post.contentType || ''))) sections.push('Direct Answer')
    if (post.keyTakeaways.length > 0 && mode !== 'tutorial' && mode !== 'case-study') sections.push('Key Takeaways')
    return sections
}

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
    const hiddenSections = skippedBodySections(post)
    const visibleHeadings = post.headings.filter((heading) => !hiddenSections.map((section) => section.toLowerCase()).includes(heading.text.toLowerCase()))

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
                        <span>{post.contentPersona}</span>
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
                    <ActiveTableOfContents headings={visibleHeadings} variant="desktop" />

                    <div>
                        <ActiveTableOfContents headings={visibleHeadings} variant="mobile" />

                        <EditorialOpener post={post} />

                        <MarkdownRenderer body={post.body} skipSections={hiddenSections} />

                        {post.expertInsight && !hasBodyHeading(post.body, 'Expert Insight') && (
                            <section className="mt-12 rounded-lg border border-accent/30 bg-dark-deeper p-6">
                                <h2 className="text-lg font-bold text-white mb-2">Expert Insight</h2>
                                <p className="text-gray-200 leading-7">{post.expertInsight}</p>
                            </section>
                        )}

                        {(post.assetLinks?.infographic || post.assetLinks?.slides || post.assetLinks?.downloadablePdf) && (
                            <section className="mt-14 border-t border-border pt-10">
                                <h2 className="text-3xl font-black text-white mb-6">Visual Resources</h2>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {post.assetLinks.infographic && <a href={post.assetLinks.infographic} className="rounded-lg border border-border p-5 text-white hover:border-accent"><FileText className="mb-3" /> Infographic</a>}
                                    {post.assetLinks.slides && <a href={post.assetLinks.slides} className="rounded-lg border border-border p-5 text-white hover:border-accent"><Presentation className="mb-3" /> Slides</a>}
                                    {post.assetLinks.downloadablePdf && <a href={post.assetLinks.downloadablePdf} className="rounded-lg border border-border p-5 text-white hover:border-accent"><Download className="mb-3" /> PDF</a>}
                                </div>
                            </section>
                        )}

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
                            <section className="mt-14 border-t border-border pt-10" aria-labelledby="research-sources">
                                <h2 id="research-sources" className="text-3xl font-black text-white mb-3">Research Sources</h2>
                                <p className="text-sm text-gray-500 mb-6">Topic-specific sources used to support the practical guidance in this article.</p>
                                <div className="grid gap-4">
                                    {post.sources.map((source) => (
                                        <article key={source.url} className="rounded-lg border border-border bg-dark-card/70 p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-accent transition-colors">
                                                        {source.title}
                                                    </a>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mt-1">{source.organization || source.type || 'External source'}</p>
                                                </div>
                                                {source.type && <span className="rounded-full border border-border px-3 py-1 text-xs text-gray-400">{source.type}</span>}
                                            </div>
                                            {source.supports && <p className="text-gray-400 leading-7 mt-4">{source.supports}</p>}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="mt-14 grid sm:grid-cols-[96px_1fr] gap-5 rounded-lg border border-border bg-dark-card p-6">
                            <div className="h-24 w-24 rounded-lg bg-accent text-white grid place-items-center font-mono font-bold text-2xl">AS</div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{post.author}</h2>
                                <p className="text-gray-400 leading-7">
                                    AI automation engineer building practical agents, workflow systems, and business automation infrastructure for service companies. Editorial persona for this article: {post.contentPersona}; business function: {post.businessFunction}.
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
