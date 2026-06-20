'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, ArrowUpRight } from 'lucide-react'

const projects = [
    {
        id: 'clinic-scheduler',
        title: 'APEX Voice Scheduler',
        clientName: 'Apex Health Group',
        purpose: 'Automate 100% of patient voice booking calls and lead pre-qualification.',
        done: [
            'Live Twilio voice trunks with redundant carrier fallbacks.',
            'Custom Hume AI assistant trained on clinic treatment taxonomies.',
            'HIPAA-compliant data schema inside Supabase.',
        ],
        next: [
            'Integrate live Google Calendar booking slots API.',
            'Deploy outbound SMS appointment confirmation checks.',
        ],
        phase: 'Phase 3 · Outbound Twilio Routing',
        pipeline: ['Inbound Call', 'Hume AI Agent', 'HIPAA Shield DB', 'Symptom Router'],
        activeStep: 2,
        metrics: { runs: '1,247', latency: '420ms', uptime: '99.98%' },
    },
    {
        id: 'sales-recruiter',
        title: 'Sales Multi-Agent Pipeline',
        clientName: 'Elite Tech Consulting',
        purpose: 'Multi-agent sales pipeline that extracts, qualifies, and fires verified campaigns.',
        done: [
            'Territory-rotation crawler spanning 27 cities.',
            'LLaMA-based pain-signal classification models.',
            '7-layer verification SMTP delivery node.',
        ],
        next: [
            'Automated LinkedIn DM connection pipeline.',
            'Personal email synthesis generator.',
        ],
        phase: 'Phase 2 · SMTP Verification',
        pipeline: ['Serper Search', 'Pain Detector', 'SMTP Verifier', 'CRM Dispatch'],
        activeStep: 1,
        metrics: { runs: '3,910', latency: '180ms', uptime: '99.95%' },
    },
    {
        id: 'whatsapp-consultant',
        title: 'Valuation WhatsApp Agent',
        clientName: 'Kallos Real Estate',
        purpose: 'Automate support and property valuation routing over WhatsApp Business.',
        done: [
            'Meta WhatsApp Business API integration.',
            'Knowledge-base vector store for local property rules.',
        ],
        next: [
            'Connect live MLS property databases.',
            'Dynamic geographic agent handover rules.',
        ],
        phase: 'Phase 1 · Knowledge-Graph Tuning',
        pipeline: ['WhatsApp Text', 'Vector Store', 'LLaMA Reason', 'MLS DB Sync'],
        activeStep: 0,
        metrics: { runs: '842', latency: '610ms', uptime: '99.90%' },
    },
]

function buildLog(p) {
    return [
        { t: `$ dex run --agent="${p.title}"`, k: 'cmd' },
        { t: `❯ initializing pipeline · ${p.pipeline.length} nodes`, k: 'sys' },
        ...p.done.map((d) => ({ t: `✓ ${d}`, k: 'ok' })),
        { t: `▶ executing node 0${p.activeStep + 1} · ${p.pipeline[p.activeStep]}`, k: 'run' },
        { t: `● status: ACTIVE BUILD · ${p.phase}`, k: 'live' },
    ]
}

function Console({ project }) {
    const [lines, setLines] = useState([])
    const scroller = useRef(null)

    useEffect(() => {
        const seq = buildLog(project)
        setLines([])
        let i = 0
        const id = setInterval(() => {
            i += 1
            setLines(seq.slice(0, i))
            if (i >= seq.length) clearInterval(id)
        }, 520)
        return () => clearInterval(id)
    }, [project])

    useEffect(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
    }, [lines])

    const color = (k) =>
        k === 'cmd' ? 'text-white font-semibold'
        : k === 'ok' ? 'text-white/45'
        : k === 'run' ? 'text-accent font-semibold'
        : k === 'live' ? 'text-accent'
        : 'text-white/55'

    return (
        <div className="rounded-2xl bg-[#0B0B0B] border border-white/[0.07] overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/35">dex-agent · live console</span>
            </div>
            <div ref={scroller} className="flex-1 p-4 font-mono text-[0.72rem] leading-relaxed overflow-y-auto min-h-[220px] max-h-[260px]">
                {lines.map((l, idx) => (
                    <p key={idx} className={`${color(l.k)} whitespace-pre-wrap break-words mb-1`}>{l.t}</p>
                ))}
                <span className="term-cursor inline-block w-2 h-3.5 bg-accent align-middle" />
            </div>
        </div>
    )
}

export default function ProjectPipeline() {
    const [selected, setSelected] = useState(projects[0])
    const n = selected.pipeline.length

    return (
        <section id="pipeline" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div className="relative rounded-[26px] bg-night overflow-hidden p-7 sm:p-10 lg:p-14">
                    <div className="dex-grain-overlay opacity-50" />

                    {/* header */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                        <div>
                            <span className="eyebrow eyebrow-light mb-5">Active Operations</span>
                            <h2 data-reveal className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-white tracking-tightest leading-[1.02] max-w-xl">
                                Watch our agents run, live.
                            </h2>
                        </div>
                        <p className="text-sm text-white/45 max-w-sm leading-relaxed lg:text-right">
                            We don't work in secret. Real client pipelines, executing in real time — pick one and watch the build.
                        </p>
                    </div>

                    {/* project tabs */}
                    <div className="relative z-10 flex flex-wrap gap-2 mb-10">
                        {projects.map((p) => {
                            const on = selected.id === p.id
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelected(p)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[0.78rem] font-medium transition-all duration-300 ${
                                        on ? 'bg-accent text-white border-accent' : 'border-white/12 text-white/55 hover:text-white hover:border-white/30'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
                                    {p.title}
                                </button>
                            )
                        })}
                    </div>

                    {/* animated rail */}
                    <div className="relative z-10 mb-12 px-1">
                        <div className="relative">
                            {/* base + progress line */}
                            <div className="absolute top-3.5 left-[12%] right-[12%] h-px bg-white/10" />
                            <div
                                className="absolute top-3.5 left-[12%] h-px bg-accent transition-all duration-700"
                                style={{ width: `${(selected.activeStep / (n - 1)) * 76}%` }}
                            />
                            {/* traveling data packet */}
                            <div className="absolute top-3.5 left-[12%] right-[12%]">
                                <span className="rail-packet absolute -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(221,4,38,0.9)]" />
                            </div>

                            {/* nodes */}
                            <div className="relative grid grid-cols-4 gap-2">
                                {selected.pipeline.map((step, idx) => {
                                    const completed = idx <= selected.activeStep
                                    const active = idx === selected.activeStep
                                    return (
                                        <div key={step} className="flex flex-col items-center text-center">
                                            <span
                                                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border text-[0.6rem] font-mono ${
                                                    active
                                                        ? 'bg-accent border-accent text-white node-pulse'
                                                        : completed
                                                        ? 'bg-night border-accent/60 text-accent'
                                                        : 'bg-night border-white/15 text-white/35'
                                                }`}
                                            >
                                                {completed && !active ? <Check size={12} /> : idx + 1}
                                            </span>
                                            <span className="font-mono text-[0.54rem] uppercase tracking-wider text-white/35 mt-3">Node 0{idx + 1}</span>
                                            <span className={`text-[0.74rem] font-semibold mt-1 ${completed ? 'text-white' : 'text-white/40'}`}>{step}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* console + intel */}
                    <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-7">
                            <Console project={selected} />
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-4">
                            {/* live metrics */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    ['Runs / day', selected.metrics.runs],
                                    ['Avg latency', selected.metrics.latency],
                                    ['Uptime', selected.metrics.uptime],
                                ].map(([label, val]) => (
                                    <div key={label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5">
                                        <p className="font-display text-lg font-bold text-white tracking-tight">{val}</p>
                                        <p className="font-mono text-[0.54rem] uppercase tracking-wider text-white/40 mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* next steps */}
                            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex-1">
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
        </section>
    )
}
