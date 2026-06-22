import { useEffect } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle, Clock, Download, FileText, Presentation, RefreshCcw } from 'lucide-react'
import { buildBlogPostingSchema, buildFaqSchema, formatDate, getPostBySlug, getRelatedPosts } from '../../lib/blog'
import { setSeo } from '../../lib/seo'
import ArticleAudioPlayer from './ArticleAudioPlayer'
import ActiveTableOfContents from './ActiveTableOfContents'
import MarkdownRenderer from './MarkdownRenderer'

const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

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

function SectionTitle({ children, id }) {
    return (
        <h2 id={id} className="font-display text-[1.7rem] lg:text-3xl font-extrabold text-ghost tracking-tight mb-6">{children}</h2>
    )
}

function KeyTakeaways({ items = [], compact = false }) {
    if (!items.length) return null
    return (
        <section className={`${compact ? 'my-10' : 'mb-10'} rounded-2xl border border-border bg-dark-deeper p-6`}>
            <div className="eyebrow mb-5">Key Takeaways</div>
            <div className="grid gap-3">
                {items.map((item) => (
                    <div key={item} className="grid grid-cols-[22px_1fr] gap-3">
                        <CheckCircle size={18} className="mt-0.5 text-accent" aria-hidden="true" />
                        <p className="text-ghost-dim leading-7">{item}</p>
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
            <section className="mb-10 rounded-2xl border border-border bg-dark-deeper p-6">
                <h2 className="font-display text-xl font-bold text-ghost mb-3">{post.whatYouWillBuild ? "What You'll Build" : 'What This Guide Covers'}</h2>
                <p className="text-ghost-dim leading-7 mb-5">{post.whatYouWillBuild || post.practicalUseCase || post.description}</p>
                {post.toolsNeeded.length > 0 && (
                    <div>
                        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ghost-faint mb-3">Tools Needed</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.toolsNeeded.map((tool) => <span key={tool} className="rounded-full border border-border bg-dark px-3 py-1 text-sm text-ghost-dim">{tool}</span>)}
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
                    <div key={label} className="rounded-2xl border border-border bg-dark-deeper p-5">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">{label}</p>
                        <p className="text-ghost-dim leading-7">{value}</p>
                    </div>
                ))}
            </section>
        )
    }

    if (mode === 'business-automation') {
        return (
            <>
                <section className="mb-10 rounded-2xl border border-accent/20 bg-accent-dim p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">Business Problem</p>
                    <h2 className="font-display text-xl font-bold text-ghost mb-3">{post.businessProblem || post.mainPainPoint || 'A repeatable workflow is costing time, focus, or revenue.'}</h2>
                    <p className="text-ghost-dim leading-7">{post.automationOpportunity || post.directAnswer || post.practicalUseCase || post.description}</p>
                </section>
                {showTakeaways && <KeyTakeaways items={post.keyTakeaways} />}
            </>
        )
    }

    return (
        <>
            {showDirectAnswer && (
                <section className="mb-10 rounded-2xl border border-accent/20 bg-accent-dim p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">Direct Answer</p>
                    <p className="text-ghost leading-7 text-[1.05rem]">{post.directAnswer}</p>
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
            <main id="main-content" className="bg-dark pt-32 pb-24">
                <section className="max-w-3xl mx-auto px-6">
                    <h1 className="font-display text-4xl font-extrabold text-ghost mb-4">Article not found</h1>
                    <p className="text-ghost-dim mb-8">This blog post does not exist yet.</p>
                    <a href="/blog" className="inline-flex items-center gap-2 text-accent font-semibold"><ArrowLeft size={16} /> Back to blog</a>
                </section>
            </main>
        )
    }

    const relatedPosts = getRelatedPosts(post)
    const hiddenSections = skippedBodySections(post)
    const visibleHeadings = post.headings.filter((heading) => !hiddenSections.map((section) => section.toLowerCase()).includes(heading.text.toLowerCase()))

    return (
        <main id="main-content" className="bg-dark pt-28 pb-24">
            <article>
                <header className="max-w-4xl mx-auto px-6 mb-10">
                    <a href="/blog" className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ghost-dim hover:text-accent transition-colors mb-6">
                        <ArrowLeft size={13} /> All articles
                    </a>
                    <div className="eyebrow mb-5">{post.category}</div>
                    <h1 className="font-display text-4xl md:text-[3.4rem] font-extrabold text-grad-dark tracking-tightest leading-[1.04] mb-6">{post.title}</h1>
                    <p className="text-xl text-ghost-dim leading-8 mb-7 max-w-2xl">{post.subtitle || post.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ghost-faint mb-7">
                        <span className="text-ghost-dim">{post.author}</span>
                        <span className="w-1 h-1 rounded-full bg-ghost-faint/60" />
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {formatDate(post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><RefreshCcw size={13} /> Updated {formatDate(post.updatedAt || post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {post.readingTime}</span>
                    </div>
                    <ArticleAudioPlayer title={post.title} text={`${post.title}. ${post.description}. ${post.body}`} audioSrc={post.audio} />
                </header>

                <div className="max-w-6xl mx-auto px-6 mb-12">
                    <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="aspect-[16/9] w-full rounded-[22px] border border-border object-cover bg-dark-deeper"
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
                            <section className="mt-12 rounded-2xl border border-accent/20 bg-accent-dim p-6">
                                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-3">Expert Insight</p>
                                <p className="text-ghost leading-7">{post.expertInsight}</p>
                            </section>
                        )}

                        {(post.assetLinks?.infographic || post.assetLinks?.slides || post.assetLinks?.downloadablePdf) && (
                            <section className="mt-14 border-t border-border pt-10">
                                <SectionTitle>Visual Resources</SectionTitle>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {post.assetLinks.infographic && <a href={post.assetLinks.infographic} className="group rounded-2xl border border-border bg-dark-deeper p-5 text-ghost hover:border-accent transition-colors"><FileText className="mb-3 text-accent" /> <span className="font-semibold text-sm">Infographic</span></a>}
                                    {post.assetLinks.slides && <a href={post.assetLinks.slides} className="group rounded-2xl border border-border bg-dark-deeper p-5 text-ghost hover:border-accent transition-colors"><Presentation className="mb-3 text-accent" /> <span className="font-semibold text-sm">Slides</span></a>}
                                    {post.assetLinks.downloadablePdf && <a href={post.assetLinks.downloadablePdf} className="group rounded-2xl border border-border bg-dark-deeper p-5 text-ghost hover:border-accent transition-colors"><Download className="mb-3 text-accent" /> <span className="font-semibold text-sm">PDF</span></a>}
                                </div>
                            </section>
                        )}

                        {post.faqs.length > 0 && (
                            <section className="mt-14 border-t border-border pt-10">
                                <SectionTitle>FAQ</SectionTitle>
                                <div className="space-y-3">
                                    {post.faqs.map((faq) => (
                                        <details key={faq.question} className="group rounded-2xl border border-border bg-dark-deeper p-5 open:bg-dark-deeper">
                                            <summary className="flex items-center justify-between cursor-pointer text-ghost font-semibold list-none">
                                                {faq.question}
                                                <span className="ml-4 text-accent transition-transform duration-300 group-open:rotate-45 text-xl leading-none">+</span>
                                            </summary>
                                            <p className="text-ghost-dim leading-7 mt-3">{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}

                        {post.sources.length > 0 && (
                            <section className="mt-14 border-t border-border pt-10" aria-labelledby="research-sources">
                                <SectionTitle id="research-sources">Research Sources</SectionTitle>
                                <p className="text-sm text-ghost-faint mb-6 -mt-2">Topic-specific sources used to support the practical guidance in this article.</p>
                                <div className="grid gap-4">
                                    {post.sources.map((source) => (
                                        <article key={source.url} className="rounded-2xl border border-border bg-dark-deeper p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-ghost font-semibold hover:text-accent transition-colors">
                                                        {source.title}
                                                    </a>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-ghost-faint mt-1">{source.organization || source.type || 'External source'}</p>
                                                </div>
                                                {source.type && <span className="rounded-full border border-border bg-dark px-3 py-1 text-xs text-ghost-dim">{source.type}</span>}
                                            </div>
                                            {source.supports && <p className="text-ghost-dim leading-7 mt-4">{source.supports}</p>}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="mt-14 grid sm:grid-cols-[96px_1fr] gap-5 rounded-2xl border border-border bg-dark-deeper p-6">
                            <div className="h-24 w-24 rounded-2xl btn-grad-red text-white grid place-items-center font-display font-extrabold text-2xl">AS</div>
                            <div>
                                <h2 className="font-display text-xl font-bold text-ghost mb-2">{post.author}</h2>
                                <p className="text-ghost-dim leading-7">
                                    AI automation engineer building practical agents, workflow systems, and business automation infrastructure for service companies. Editorial persona for this article: {post.contentPersona}; business function: {post.businessFunction}.
                                </p>
                            </div>
                        </section>

                        <section className="mt-12 overflow-hidden rounded-[22px] bg-night p-8 lg:p-10">
                            <div className="eyebrow eyebrow-light mb-5">Get Started</div>
                            <h2 className="font-display text-2xl lg:text-[1.9rem] font-extrabold text-white tracking-tight leading-[1.1] mb-3 max-w-lg">Want an AI automation system like this?</h2>
                            <p className="text-white/65 leading-7 mb-7 max-w-lg">DEX can help you turn repetitive business work into reliable AI-assisted workflows — talk to Sarah and we'll scope it together.</p>
                            <button onClick={openChatbot} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full btn-grad-red text-white text-sm font-semibold cursor-pointer">
                                Talk with Sarah
                                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </section>
                    </div>
                </div>
            </article>

            {relatedPosts.length > 0 && (
                <section className="max-w-6xl mx-auto px-6 mt-20 border-t border-border pt-12">
                    <SectionTitle>Related posts</SectionTitle>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedPosts.map((related) => (
                            <a key={related.slug} href={`/blog/${related.slug}`} className="group block rounded-2xl border border-border bg-dark-deeper p-6 hover:border-accent/40 transition-colors">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <span className="w-2 h-2 bg-accent shrink-0" />
                                    <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ghost-dim">{related.category}</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-ghost leading-snug mb-3 group-hover:text-accent transition-colors">{related.title}</h3>
                                <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ghost-faint">{related.readingTime}</p>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
