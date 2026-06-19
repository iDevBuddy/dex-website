'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DotNum from './DotNum'

gsap.registerPlugin(ScrollTrigger)

/* Hand-built node/dot vectors — one geometric motif per agent type */
const MOTIFS = {
    workflow: { lines: [[18, 8, 18, 28], [8, 18, 28, 18]], nodes: [[18, 8, 0], [18, 28, 0], [8, 18, 0], [28, 18, 0], [18, 18, 1]] },
    conversational: { lines: [[10, 11, 22, 11], [10, 11, 10, 23], [22, 11, 22, 23], [10, 23, 22, 23]], nodes: [[10, 11, 1], [22, 11, 0], [10, 23, 0], [22, 23, 1], [29, 29, 0]] },
    predictive: { lines: [[8, 28, 16, 20], [16, 20, 24, 13], [24, 13, 30, 7]], nodes: [[8, 28, 0], [16, 20, 1], [24, 13, 0], [30, 7, 1], [25, 27, 0]] },
    orchestrator: { lines: [[18, 18, 8, 8], [18, 18, 28, 8], [18, 18, 8, 28], [18, 18, 28, 28]], nodes: [[8, 8, 0], [28, 8, 0], [8, 28, 0], [28, 28, 0], [18, 18, 1]] },
    generative: { lines: [], nodes: [[9, 9, 0], [18, 9, 1], [27, 9, 0], [9, 18, 1], [18, 18, 0], [27, 18, 1], [9, 27, 0], [18, 27, 1], [27, 27, 0]] },
    vision: { lines: [[11, 11, 24, 9], [24, 9, 29, 21], [29, 21, 16, 23], [16, 23, 11, 11]], nodes: [[11, 11, 1], [24, 9, 0], [29, 21, 1], [16, 23, 0], [23, 30, 0]] },
}

function NodeMotif({ variant }) {
    const d = MOTIFS[variant]
    let live = 0
    return (
        <svg viewBox="0 0 36 36" className="w-9 h-9">
            {d.lines.map((l, i) => (
                <line key={`l${i}`} className="motif-line" x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="#DD0426" strokeOpacity="0.35" strokeWidth="1.2" />
            ))}
            {d.nodes.map((nd, i) =>
                nd[2] ? (
                    <rect
                        key={`n${i}`}
                        className="motif-node-live"
                        style={{ animationDelay: `${(live++) * 0.4}s` }}
                        x={nd[0] - 2.6} y={nd[1] - 2.6} width="5.2" height="5.2" rx="1.4" fill="#DD0426"
                    />
                ) : (
                    <rect key={`n${i}`} x={nd[0] - 2.4} y={nd[1] - 2.4} width="4.8" height="4.8" rx="1.3" fill="#FFFFFF" stroke="#DD0426" strokeWidth="1.2" strokeOpacity="0.5" />
                )
            )}
        </svg>
    )
}

const agents = [
    {
        variant: 'workflow',
        title: 'Voice & call agents',
        desc: 'Handle inbound and outbound calls with human-like conversation — book appointments, qualify leads, and provide 24/7 phone support.',
        apps: 'Clinic receptionist, lead qualification, appointment scheduling, support hotlines.',
    },
    {
        variant: 'conversational',
        title: 'Conversational & chat agents',
        desc: 'Deliver natural communication across WhatsApp, website chat, and messaging. Automate support, onboarding, and engagement on every channel.',
        apps: 'WhatsApp bots, website live chat, FAQ automation, order status updates.',
    },
    {
        variant: 'predictive',
        title: 'Decision intelligence agents',
        desc: 'Analyze real-time and historical data to forecast outcomes and recommend next steps — data-driven decisions that improve efficiency.',
        apps: 'Sales forecasting, churn prediction, demand planning, risk assessment.',
    },
    {
        variant: 'orchestrator',
        title: 'Multi-agent systems',
        desc: 'Coordinate multiple specialized agents across complex, cross-functional operations — a unified intelligence layer over your business.',
        apps: 'Supply chain coordination, customer lifecycle, cross-department automation.',
    },
    {
        variant: 'generative',
        title: 'Workflow automation agents',
        desc: 'Automate repetitive, rule-based tasks across operations — from CRM updates to invoice processing — eliminating manual load.',
        apps: 'CRM data entry, invoice validation, employee onboarding, scheduling.',
    },
    {
        variant: 'vision',
        title: 'Vision & data agents',
        desc: 'Extract, validate, and analyze data from text and visual inputs like invoices, reports, or product images to improve accuracy and visibility.',
        apps: 'Invoice extraction, document classification, defect detection, report digitization.',
    },
]

export default function AgentTypes() {
    const sectionRef = useRef(null)
    const cellsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cellsRef.current, {
                y: 28,
                opacity: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="agents" className="bg-dark py-20 lg:py-28">
            <div className="max-w-[1320px] mx-auto px-6">
                {/* editorial header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
                    <div>
                        <span className="eyebrow mb-5">What We Build</span>
                        <h2 className="font-display text-3xl sm:text-[2.8rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-lg">
                            Types of AI agents we build
                        </h2>
                    </div>
                    <p className="text-sm text-ghost-dim max-w-sm leading-relaxed lg:text-right">
                        From conversational voice agents to complex multi-agent orchestration — intelligent systems engineered around your workflows.
                    </p>
                </div>

                {/* tkxel-style ruled grid */}
                <div className="grid md:grid-cols-3 border-t border-l border-border">
                    {agents.map((a, i) => (
                        <div
                            key={i}
                            ref={(el) => (cellsRef.current[i] = el)}
                            className="group relative border-r border-b border-border p-8 lg:p-10 transition-colors duration-300 hover:bg-dark-deeper"
                        >
                            {/* hover red top-line draw */}
                            <span className="absolute top-0 left-0 right-0 h-[2px] bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                            <div className="flex items-start justify-between mb-8">
                                <div className="transition-transform duration-300 group-hover:-translate-y-1">
                                    <NodeMotif variant={a.variant} />
                                </div>
                                <span className="text-ghost-faint group-hover:text-accent transition-colors">
                                    <DotNum value={String(i + 1).padStart(2, '0')} cell={4} />
                                </span>
                            </div>
                            <h3 className="font-display text-[1.15rem] font-bold text-ghost mb-4 tracking-tight">{a.title}</h3>
                            <p className="text-[0.88rem] text-ghost-dim leading-relaxed mb-5">{a.desc}</p>
                            <p className="text-[0.82rem] text-ghost-dim leading-relaxed">
                                <span className="font-semibold text-ghost">Potential applications: </span>
                                {a.apps}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
