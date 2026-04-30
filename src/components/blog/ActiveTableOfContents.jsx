import { useEffect, useMemo, useState } from 'react'

export default function ActiveTableOfContents({ headings = [], variant = 'both' }) {
    const [activeId, setActiveId] = useState(headings[0]?.id || '')
    const visibleHeadings = useMemo(() => headings.filter((heading) => heading.depth === 2 || heading.depth === 3), [headings])

    useEffect(() => {
        if (!visibleHeadings.length || typeof IntersectionObserver === 'undefined') return undefined
        const elements = visibleHeadings
            .map((heading) => document.getElementById(heading.id))
            .filter(Boolean)

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
            },
            { rootMargin: '-22% 0px -62% 0px', threshold: [0, 0.2, 0.6, 1] },
        )

        elements.forEach((element) => observer.observe(element))
        return () => observer.disconnect()
    }, [visibleHeadings])

    if (!visibleHeadings.length) return null

    const handleClick = (event, id) => {
        event.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${id}`)
        setActiveId(id)
    }

    return (
        <>
            {variant !== 'mobile' && <aside className="hidden lg:block">
                <div className="sticky top-28 border-l border-border pl-5">
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em] mb-4">Contents</p>
                    <nav className="space-y-2">
                        {visibleHeadings.map((heading) => {
                            const isActive = activeId === heading.id
                            return (
                                <a
                                    key={heading.id}
                                    href={`#${heading.id}`}
                                    onClick={(event) => handleClick(event, heading.id)}
                                    className={[
                                        'block rounded-r-md border-l-2 py-1.5 pr-2 text-sm leading-5 transition-colors',
                                        heading.depth === 3 ? 'pl-5' : 'pl-3',
                                        isActive
                                            ? 'border-accent bg-accent/10 text-white'
                                            : 'border-transparent text-gray-500 hover:border-accent/50 hover:text-accent',
                                    ].join(' ')}
                                >
                                    {heading.text}
                                </a>
                            )
                        })}
                    </nav>
                </div>
            </aside>}

            {variant !== 'desktop' && <details className="lg:hidden mb-8 rounded-lg border border-border bg-dark-card p-4">
                <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.2em] text-gray-400">Contents</summary>
                <nav className="mt-4 space-y-2">
                    {visibleHeadings.map((heading) => (
                        <a
                            key={heading.id}
                            href={`#${heading.id}`}
                            onClick={(event) => handleClick(event, heading.id)}
                            className={`block text-sm ${activeId === heading.id ? 'text-accent' : 'text-gray-400'} ${heading.depth === 3 ? 'pl-4' : ''}`}
                        >
                            {heading.text}
                        </a>
                    ))}
                </nav>
            </details>}
        </>
    )
}
