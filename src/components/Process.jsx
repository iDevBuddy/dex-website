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
    const cx = 180, hw = 104, hh = 50, depth = 13, spacing = 46, top = 96
    const layers = [0, 1, 2, 3].map((i) => ({ i, cy: top + i * spacing }))
    return (
        <svg viewBox="0 0 360 296" className="w-full max-w-[340px]">
            <defs>
                <filter id="isoGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#DD0426" floodOpacity="0.55" />
                </filter>
            </defs>
            {/* paint bottom -> top so upper layers overlap */}
            {layers.slice().reverse().map(({ i, cy }) => {
                const on = i === active
                const topPts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
                const leftPts = `${cx - hw},${cy} ${cx},${cy + hh} ${cx},${cy + hh + depth} ${cx - hw},${cy + depth}`
                const rightPts = `${cx},${cy + hh} ${cx + hw},${cy} ${cx + hw},${cy + depth} ${cx},${cy + hh + depth}`
                return (
                    <g key={i} filter={on ? 'url(#isoGlow)' : undefined} style={{ transition: 'transform .55s cubic-bezier(.16,1,.3,1)', transform: on ? 'translateY(-6px)' : 'none' }}>
                        <polygon points={leftPts} fill={on ? '#A80320' : 'rgba(221,4,38,0.05)'} style={{ transition: 'fill .5s' }} />
                        <polygon points={rightPts} fill={on ? '#EE2440' : 'rgba(221,4,38,0.09)'} style={{ transition: 'fill .5s' }} />
                        <polygon points={topPts} fill={on ? '#DD0426' : 'rgba(221,4,38,0.10)'} stroke={on ? 'rgba(255,255,255,0.25)' : 'rgba(221,4,38,0.20)'} strokeWidth="1" style={{ transition: 'fill .5s' }} />
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
                                    <button onClick={() => setActive(i)} className="w-full flex items-center gap-4 py-5 text-left group">
                                        <span className={`font-mono text-xs transition-colors ${on ? 'text-accent' : 'text-ghost-faint'}`}>{s.num}</span>
                                        <h3 className={`font-display text-xl font-bold tracking-tight transition-colors ${on ? 'text-accent' : 'text-ghost group-hover:text-accent'}`}>{s.title}</h3>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pb-6 pl-9 max-w-lg">
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
