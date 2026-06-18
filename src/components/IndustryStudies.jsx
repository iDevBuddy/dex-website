'use client'
import { useRef } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'

const studies = [
    {
        industry: 'Healthcare',
        title: '100% of patient booking calls automated with a HIPAA-safe voice agent',
        client: 'Apex Health Group',
        quote: 'Our front desk stopped drowning in calls. The agent books, confirms, and triages 24/7 — and patients actually prefer it.',
        name: 'Dr. Lena Ortiz',
        role: 'Director of Operations',
    },
    {
        industry: 'SaaS & Technology',
        title: 'A multi-agent sales pipeline that 10× verified outbound',
        client: 'Elite Tech Consulting',
        quote: 'It finds prospects, qualifies authority, and only sends SMTP-verified mail. Our reply rate doubled in a quarter.',
        name: 'Marcus Vale',
        role: 'Head of Growth',
    },
    {
        industry: 'Real Estate',
        title: 'Instant WhatsApp property valuations, around the clock',
        client: 'Kallos Real Estate',
        quote: 'Leads get an accurate valuation in seconds, any hour. Our agents now only touch deals that are ready to close.',
        name: 'Sara Demir',
        role: 'Managing Partner',
    },
    {
        industry: 'E-commerce',
        title: 'Support response time cut by 68% with an AI knowledge agent',
        client: 'Northbeam Retail',
        quote: 'Tickets that used to take hours resolve in minutes. Same team, far happier customers, measurable retention lift.',
        name: 'Owen Fisk',
        role: 'VP Customer Success',
    },
]

const initials = (name) => name.split(' ').map((w) => w[0]).slice(-2).join('')

export default function IndustryStudies() {
    const track = useRef(null)
    const scroll = (dir) => track.current?.scrollBy({ left: dir * 400, behavior: 'smooth' })

    return (
        <section id="impact" className="bg-dark py-20 lg:py-28 overflow-hidden">
            <div className="max-w-[1320px] mx-auto px-6">
                {/* header + controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="eyebrow mb-5">Proven Impact</span>
                        <h2 className="font-display text-3xl sm:text-[2.8rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                            Real-world impact of AI agents
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/blog" className="px-4 py-2.5 rounded-full border border-border text-[0.8rem] font-semibold text-ghost hover:border-ghost transition-colors">
                            All case studies
                        </a>
                        <button onClick={() => scroll(-1)} aria-label="Previous" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ghost hover:border-accent hover:text-accent transition-colors">
                            <ArrowLeft size={16} />
                        </button>
                        <button onClick={() => scroll(1)} aria-label="Next" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ghost hover:border-accent hover:text-accent transition-colors">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* carousel track (bleeds to right edge) */}
            <div ref={track} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pl-6 pr-6 max-w-[1320px] mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {studies.map((s, i) => (
                    <article
                        key={i}
                        className="reveal-up group snap-start shrink-0 w-[330px] sm:w-[380px] rounded-2xl border border-border bg-dark-card overflow-hidden relative transition-transform duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${i * 0.08}s` }}
                    >
                        <span className="absolute top-0 left-0 right-0 h-[2px] bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                        <div className="p-7">
                            <h3 className="font-display text-[1.15rem] font-bold text-ghost tracking-tight leading-snug mb-5 min-h-[3.5em]">
                                {s.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-7">
                                <span className="px-3 py-1 rounded-full border border-border text-[0.7rem] font-medium text-ghost-dim">{s.industry}</span>
                                <span className="px-3 py-1 rounded-full bg-accent/[0.07] border border-accent/20 text-[0.7rem] font-medium text-accent">AI Agents</span>
                            </div>
                            <p className="font-display text-lg font-extrabold text-ghost tracking-tight">{s.client}</p>
                        </div>

                        <div className="border-t border-border p-7 bg-dark-deeper">
                            <p className="text-[0.9rem] text-ghost-dim leading-relaxed mb-5">"{s.quote}"</p>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/[0.08] border border-accent/15 font-mono text-[0.72rem] font-bold text-accent shrink-0">
                                    {initials(s.name)}
                                </span>
                                <div>
                                    <p className="text-[0.82rem] font-semibold text-ghost leading-tight">{s.name}</p>
                                    <p className="text-[0.72rem] text-ghost-faint mt-0.5">{s.role}</p>
                                </div>
                                <ArrowUpRight size={16} className="ml-auto text-ghost-faint group-hover:text-accent transition-colors" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
