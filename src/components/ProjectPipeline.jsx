'use client'
import { useState } from 'react'
import { Check, ChevronRight, Activity, ArrowUpRight } from 'lucide-react'

const projects = [
    {
        id: 'clinic-scheduler',
        title: 'APEX Voice Scheduler',
        clientName: 'Apex Health Group',
        purpose: 'Automate 100% of patient voice booking calls and lead pre-qualification, eliminating receptionist phone lag.',
        done: [
            'Configured live Twilio voice trunks with redundant carrier fallbacks.',
            'Engineered custom Hume AI voice assistant trained on clinic treatment taxonomies.',
            'Constructed HIPAA-compliant data schema inside Supabase.',
        ],
        next: [
            'Integrate live Google Calendar booking slots API.',
            'Deploy outbound SMS automated appointment confirmation checks.',
        ],
        phase: 'Phase 3 · Outbound Twilio Routing & Live QA Audits',
        pipeline: ['Inbound Phone Call', 'Hume AI Agent', 'HIPAA Shield DB', 'Symptom Router'],
        activeStep: 2,
    },
    {
        id: 'sales-recruiter',
        title: 'Sales Multi-Agent Pipeline',
        clientName: 'Elite Tech Consulting',
        purpose: 'A multi-agent sales pipeline that extracts prospects, qualifies authority, and fires SMTP-verified email campaigns.',
        done: [
            'Constructed territory-rotation crawler spanning 27 cities.',
            'Fine-tuned LLaMA-based pain signal classification models.',
            'Developed 7-layer verification SMTP delivery node.',
        ],
        next: [
            'Integrate automated LinkedIn DM connection API pipeline.',
            'Fine-tune personal email synthesis generator.',
        ],
        phase: 'Phase 2 · SMTP Verification & API Integration',
        pipeline: ['Serper Search', 'Pain Detector', 'SMTP Verifier', 'CRM Dispatcher'],
        activeStep: 1,
    },
    {
        id: 'whatsapp-consultant',
        title: 'Valuation WhatsApp Agent',
        clientName: 'Kallos Real Estate',
        purpose: 'Automate customer support and property valuation routing over WhatsApp Business channels.',
        done: [
            'Established Meta WhatsApp Business API integration.',
            'Constructed knowledge-base vector store for local property rules.',
        ],
        next: [
            'Connect live MLS property databases.',
            'Deploy dynamic geographic agent handover rules.',
        ],
        phase: 'Phase 1 · Knowledge-Graph Fine-Tuning',
        pipeline: ['WhatsApp Text', 'Vector Store', 'LLaMA Reasoning', 'MLS DB Sync'],
        activeStep: 0,
    },
]

export default function ProjectPipeline() {
    const [selected, setSelected] = useState(projects[0])

    return (
        <section id="pipeline" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div className="relative rounded-[26px] bg-night overflow-hidden p-7 sm:p-10 lg:p-14">
                    <div className="dex-grain-overlay opacity-50" />

                    {/* editorial header */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                        <div>
                            <span className="eyebrow eyebrow-light mb-5">Active Operations</span>
                            <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-white tracking-tightest leading-[1.02] max-w-xl">
                                Live project workflow pipeline
                            </h2>
                        </div>
                        <p className="text-sm text-white/45 max-w-sm leading-relaxed lg:text-right">
                            We don't work in secret — track active development, workflow phases, and roadmaps for real client projects.
                        </p>
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-start">
                        {/* selector */}
                        <div className="lg:col-span-4 flex flex-col gap-3">
                            {projects.map((p) => {
                                const on = selected.id === p.id
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelected(p)}
                                        className={`relative w-full text-left p-5 rounded-2xl border overflow-hidden transition-all duration-300 ${
                                            on ? 'bg-white/[0.06] border-white/10' : 'border-transparent hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <span
                                            className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors"
                                            style={{ background: on ? '#DD0426' : 'transparent' }}
                                        />
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-white/40">{p.clientName}</span>
                                            <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-accent animate-pulse' : 'bg-white/25'}`} />
                                        </div>
                                        <h3 className={`font-display text-sm font-bold mb-1 ${on ? 'text-white' : 'text-white/70'}`}>{p.title}</h3>
                                        <p className="text-[0.72rem] text-white/40 line-clamp-1">{p.purpose}</p>
                                    </button>
                                )
                            })}
                        </div>

                        {/* panel */}
                        <div className="lg:col-span-8">
                            <div className="rounded-3xl bg-night-soft border border-white/[0.06] p-6 md:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
                                    <span className="text-[0.65rem] font-mono font-semibold px-3 py-1 rounded-full text-accent border border-accent/30 bg-accent/10">
                                        {selected.phase}
                                    </span>
                                    <span className="font-mono text-[0.62rem] text-accent flex items-center gap-1.5 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                                        Active Build
                                    </span>
                                </div>

                                <div className="py-8">
                                    <h3 className="font-display text-base font-bold text-white mb-6 flex items-center gap-2">
                                        Workflow Map
                                        <Activity size={14} className="text-accent animate-pulse" />
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {selected.pipeline.map((step, idx) => {
                                            const completed = idx <= selected.activeStep
                                            const active = idx === selected.activeStep
                                            return (
                                                <div
                                                    key={step}
                                                    className={`relative p-4 rounded-xl border flex flex-col gap-2 transition-all duration-300 ${
                                                        active
                                                            ? 'bg-white/[0.05] border-accent/45'
                                                            : completed
                                                            ? 'bg-white/[0.03] border-white/10'
                                                            : 'border-white/[0.06] opacity-35'
                                                    }`}
                                                >
                                                    {idx < 3 && (
                                                        <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 text-white/20">
                                                            <ChevronRight size={15} />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-[0.58rem] text-white/35">Node 0{idx + 1}</span>
                                                        {completed && <Check size={12} className="text-accent" />}
                                                    </div>
                                                    <p className={`text-[0.76rem] font-semibold ${completed ? 'text-white' : 'text-white/40'}`}>{step}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/[0.07]">
                                    <div>
                                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40 mb-3">Completed Milestones</p>
                                        <ul className="flex flex-col gap-2.5">
                                            {selected.done.map((item, idx) => (
                                                <li key={idx} className="flex gap-2.5 text-xs text-white/55 leading-relaxed items-start">
                                                    <Check size={13} className="text-white/30 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="eyebrow eyebrow-light !text-accent mb-3">Immediate Next Steps</p>
                                        <ul className="flex flex-col gap-2.5">
                                            {selected.next.map((item, idx) => (
                                                <li key={idx} className="flex gap-2.5 text-xs text-white/55 leading-relaxed items-start">
                                                    <ArrowUpRight size={13} className="text-accent shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
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
