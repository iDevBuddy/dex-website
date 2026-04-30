import { useEffect } from 'react'
import { setSeo } from '../../lib/seo'

export default function TrustPage({ page }) {
    useEffect(() => {
        setSeo({
            title: `${page.title} | DEX by Akif Saeed`,
            description: page.description,
            path: `/${page.slug}`,
        })
    }, [page])

    return (
        <main id="main-content" className="pt-32 pb-24">
            <section className="max-w-3xl mx-auto px-6">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent mb-4">Trust Center</p>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">{page.title}</h1>
                <p className="text-lg text-gray-400 leading-relaxed mb-12">{page.description}</p>
                <div className="space-y-10">
                    {page.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-2xl font-bold text-white mb-3">{section.heading}</h2>
                            <p className="text-gray-400 leading-8">{section.body}</p>
                        </section>
                    ))}
                </div>
            </section>
        </main>
    )
}
