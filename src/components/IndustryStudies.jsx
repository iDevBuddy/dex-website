'use client'
import { useState, useEffect } from 'react'
import { ArrowUpRight, Quote } from 'lucide-react'

const cases = [
    {
        client: 'Apex Health Group', industry: 'Healthcare', metric: '100%', bar: 92, metricLabel: 'of booking calls automated',
        headline: 'A HIPAA-safe voice agent that runs the front desk, 24/7.',
        before: { label: 'Receptionist phone lag', tag: 'manual' }, after: { label: 'Instant booking & triage', tag: 'autonomous' },
        quote: 'Our front desk stopped drowning in calls. The agent books, confirms, and triages around the clock — patients actually prefer it.',
        name: 'Dr. Lena Ortiz', role: 'Director of Operations',
    },
    {
        client: 'Elite Tech Consulting', industry: 'SaaS & Technology', metric: '10×', bar: 86, metricLabel: 'verified outbound volume',
        headline: 'A multi-agent pipeline that only sends SMTP-verified mail.',
        before: { label: '6% reply rate', tag: 'manual lists' }, after: { label: '12% reply rate', tag: 'auto-qualified' },
        quote: 'It finds prospects, qualifies authority, and only sends verified mail. Our reply rate doubled in a single quarter.',
        name: 'Marcus Vale', role: 'Head of Growth',
    },
    {
        client: 'Kallos Real Estate', industry: 'Real Estate', metric: '24/7', bar: 80, metricLabel: 'instant valuations',
        headline: 'WhatsApp property valuations, at any hour of the day.',
        before: { label: 'Next-day quotes', tag: 'agent time' }, after: { label: 'Seconds', tag: 'self-serve' },
        quote: 'Leads get an accurate valuation in seconds, any hour. Our agents now only touch deals that are ready to close.',
        name: 'Sara Demir', role: 'Managing Partner',
    },
    {
        client: 'Northbeam Retail', industry: 'E-commerce', metric: '68%', bar: 68, metricLabel: 'faster support response',
        headline: 'An AI knowledge agent that resolves tickets in minutes.',
        before: { label: '4h avg response', tag: 'overloaded' }, after: { label: '12m avg response', tag: 'deflected' },
        quote: 'Tickets that used to take hours resolve in minutes. Same team, far happier customers, measurable retention lift.',
        name: 'Owen Fisk', role: 'VP Customer Success',
    },
]

const initials = (name) => name.split(' ').map((w) => w[0]).slice(-2).join('')

function Metric({ value }) {
    const m = /^(\d+)(.*)$/.exec(value)
    const target = m ? parseInt(m[1], 10) : null
    const suffix = m ? m[2] : ''
    const [n, setN] = useState(target ?? 0)
    useEffect(() => {
        if (target == null) return
        let cur = 0
        const inc = Math.max(1, target / 26)
        const id = setInterval(() => { cur += inc; if (cur >= target) { setN(target); clearInterval(id) } else setN(Math.floor(cur)) }, 26)
        return () => clearInterval(id)
    }, [target])
    if (target == null) return <span>{value}</span>
    return <span>{n}{suffix}</span>
}

export default function IndustryStudies() {
    const [active, setActive] = useState(0)
    const sel = cases[active]

    return (
        <section id="impact" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div className="relative rounded-[26px] bg-night overflow-hidden p-6 sm:p-8 lg:p-10">
                    <div className="dex-grain-overlay opacity-50" />
                    <div className="absolute -top-28 -right-28 w-[30rem] h-[30rem] rounded-full pointer-events-none float-orb" style={{ background: 'radial-gradient(circle, rgba(221,4,38,0.16), transparent 68%)' }} />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
                        <div>
                            <span className="eyebrow eyebrow-light mb-5">Proven Impact</span>
                            <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-white tracking-tightest leading-[1.02] max-w-xl">
                                Real-world impact of AI agents
                            </h2>
                        </div>
                        <a href="/blog" className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold text-white/70 hover:text-white transition-colors">
                            All case studies
                            <ArrowUpRight size={15} className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-stretch">
                        {/* selector */}
                        <div className="lg:col-span-4 flex flex-col gap-2.5">
                            {cases.map((c, i) => {
                                const on = active === i
                                return (
                                    <button key={c.client} onClick={() => setActive(i)} className={`relative w-full text-left p-5 rounded-2xl border overflow-hidden transition-all duration-300 ${on ? 'bg-white/[0.06] border-white/10' : 'border-transparent hover:bg-white/[0.03]'}`}>
                                        <span className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors" style={{ background: on ? '#DD0426' : 'transparent' }} />
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-white/40">{c.industry}</span>
                                            <span className={`font-display text-sm font-extrabold ${on ? 'text-accent' : 'text-white/40'}`}>{c.metric}</span>
                                        </div>
                                        <p className={`font-display text-[0.95rem] font-bold ${on ? 'text-white' : 'text-white/65'}`}>{c.client}</p>
                                    </button>
                                )
                            })}
                        </div>

                        {/* featured panel */}
                        <div className="lg:col-span-8">
                            <div className="h-full rounded-3xl bg-white/[0.03] border border-white/[0.07] p-6 sm:p-7 flex flex-col">
                                <div key={sel.client} className="flex flex-col h-full">
                                    <div className="reveal-up flex flex-wrap items-center gap-2 mb-5">
                                        <span className="px-3 py-1 rounded-full border border-white/15 text-[0.68rem] font-medium text-white/65">{sel.industry}</span>
                                        <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-[0.68rem] font-medium text-accent">AI Agents</span>
                                    </div>

                                    {/* metric + impact meter */}
                                    <div className="reveal-up mb-5" style={{ animationDelay: '0.06s' }}>
                                        <div className="flex items-end gap-4 mb-3">
                                            <span className="font-display text-6xl lg:text-7xl font-extrabold text-white tracking-tightest leading-[0.85]"><Metric value={sel.metric} /></span>
                                            <span className="text-white/55 text-[0.82rem] font-medium pb-1.5">{sel.metricLabel}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div key={sel.client + 'bar'} className="grow-bar h-full rounded-full" style={{ '--w': `${sel.bar}%`, background: 'linear-gradient(90deg, #FF1E3C, #DD0426)' }} />
                                        </div>
                                    </div>

                                    <h3 className="reveal-up font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-5 max-w-lg" style={{ animationDelay: '0.12s' }}>
                                        {sel.headline}
                                    </h3>

                                    <div className="reveal-up flex items-stretch gap-2.5 mb-6" style={{ animationDelay: '0.18s' }}>
                                        <div className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                                            <p className="font-mono text-[0.54rem] uppercase tracking-[0.18em] text-white/35 mb-1.5">Before · {sel.before.tag}</p>
                                            <p className="text-[0.82rem] font-semibold text-white/55 line-through decoration-white/25">{sel.before.label}</p>
                                        </div>
                                        <div className="flex items-center text-accent shrink-0"><ArrowUpRight size={17} /></div>
                                        <div className="flex-1 rounded-xl border border-accent/25 bg-accent/[0.06] p-3.5">
                                            <p className="font-mono text-[0.54rem] uppercase tracking-[0.18em] text-accent/80 mb-1.5">After · {sel.after.tag}</p>
                                            <p className="text-[0.82rem] font-semibold text-white">{sel.after.label}</p>
                                        </div>
                                    </div>

                                    <div className="reveal-up mt-auto pt-5 border-t border-white/[0.07]" style={{ animationDelay: '0.24s' }}>
                                        <p className="text-[0.9rem] text-white/75 leading-relaxed mb-4 max-w-xl">
                                            <Quote size={15} className="text-accent inline mr-1.5 -mt-1" />
                                            {sel.quote}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/15 border border-accent/25 font-mono text-[0.72rem] font-bold text-accent shrink-0">{initials(sel.name)}</span>
                                            <div>
                                                <p className="text-[0.85rem] font-semibold text-white leading-tight">{sel.name}</p>
                                                <p className="text-[0.72rem] text-white/45 mt-0.5">{sel.role}, {sel.client}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
