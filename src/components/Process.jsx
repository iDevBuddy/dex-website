'use client'
import { useState } from 'react'

const steps = [
    {
        num: '01', title: 'Discover',
        desc: 'Identify high-value opportunities where AI agents deliver measurable impact — use-case discovery, value mapping, data-readiness assessment, and a governance baseline.',
        deliverables: 'Use-case backlog, ROI model, and solution options (build, buy, or hybrid).',
        duration: '1 — 2 weeks',
    },
    {
        num: '02', title: 'Build',
        desc: 'Design and develop a focused proof of concept — a working AI agent integrated with your core business systems and validated against real workflows.',
        deliverables: 'Working PoC, system integration, and success metrics.',
        duration: '2 — 4 weeks',
    },
    {
        num: '03', title: 'Launch',
        desc: 'Ship a production-ready deployment built for scale and reliability — authentication, logging, monitoring, cost controls, and human-in-the-loop workflows.',
        deliverables: 'Production deploy, SLOs, adoption plan, and training resources.',
        duration: '1 — 2 weeks',
    },
    {
        num: '04', title: 'Scale',
        desc: 'Expand adoption across business functions. Optimize performance, add capabilities, and roll out to more teams with continuous improvement.',
        deliverables: 'Multi-team rollout, optimization loop, and new agent capabilities.',
        duration: 'Ongoing',
    },
]

function IsoStack({ active }) {
    const cx = 180, hw = 122, hh = 40, depth = 8, spacing = 62, top = 48
    const layers = [0, 1, 2, 3].map((i) => ({ i, cy: top + i * spacing }))
    // subtle slab: top face + two shaded side faces; progress tint done > pending
    const tone = (i) => {
        if (i === active) return { top: 'url(#layerGrad)', left: '#8E0119', right: '#C40322' }
        if (i < active) return { top: 'rgba(221,4,38,0.26)', left: 'rgba(140,1,25,0.34)', right: 'rgba(196,3,34,0.30)' }
        return { top: 'rgba(221,4,38,0.12)', left: 'rgba(140,1,25,0.16)', right: 'rgba(196,3,34,0.14)' }
    }
    return (
        <svg viewBox="0 0 360 320" className="w-full max-w-[340px] overflow-visible">
            <defs>
                <linearGradient id="layerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FF1E3C" />
                    <stop offset="1" stopColor="#A80320" />
                </linearGradient>
                <filter id="isoGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="0" dy="7" stdDeviation="13" floodColor="#DD0426" floodOpacity="0.55" />
                </filter>
            </defs>
            {/* paint bottom -> top so upper slabs overlap */}
            {layers.slice().reverse().map(({ i, cy }) => {
                const on = i === active
                const t = tone(i)
                const topPts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
                const leftPts = `${cx - hw},${cy} ${cx},${cy + hh} ${cx},${cy + hh + depth} ${cx - hw},${cy + depth}`
                const rightPts = `${cx},${cy + hh} ${cx + hw},${cy} ${cx + hw},${cy + depth} ${cx},${cy + hh + depth}`
                return (
                    <g key={i} className={on ? 'layer-float' : ''} filter={on ? 'url(#isoGlow)' : undefined}>
                        <polygon points={leftPts} fill={t.left} style={{ transition: 'fill .5s ease' }} />
                        <polygon points={rightPts} fill={t.right} style={{ transition: 'fill .5s ease' }} />
                        <polygon points={topPts} fill={t.top} style={{ transition: 'fill .5s ease' }} />
                    </g>
                )
            })}
        </svg>
    )
}

export default function Process() {
    const [active, setActive] = useState(0)

    return (
        <section id="process" className="bg-dark py-16 lg:py-20">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="mb-10">
                    <span className="eyebrow mb-5">Our Process</span>
                    <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                        Our process for building AI agents
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center border-t border-border pt-10">
                    {/* left: big number + iso stack */}
                    <div className="relative flex flex-col">
                        <span key={active} className="reveal-up font-display text-7xl lg:text-8xl font-extrabold text-ghost tracking-tightest leading-none mb-2">
                            {steps[active].num}
                        </span>
                        <div className="flex justify-center">
                            <IsoStack active={active} />
                        </div>
                    </div>

                    {/* right: step accordion */}
                    <div className="border-t border-border">
                        {steps.map((s, i) => {
                            const on = active === i
                            return (
                                <div key={i} className="border-b border-border">
                                    <button onClick={() => setActive(i)} className="w-full flex items-center py-5 text-left group">
                                        <h3 className={`font-display text-xl font-bold tracking-tight transition-colors ${on ? 'text-accent' : 'text-ghost group-hover:text-accent'}`}>{s.title}</h3>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pb-6 max-w-lg">
                                            <p className="text-[0.9rem] text-ghost-dim leading-relaxed mb-4">{s.desc}</p>
                                            <p className="text-[0.85rem] text-ghost-dim mb-1.5"><span className="font-semibold text-ghost">Deliverables: </span>{s.deliverables}</p>
                                            <p className="text-[0.85rem] text-ghost-dim"><span className="font-semibold text-ghost">Duration: </span>{s.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
