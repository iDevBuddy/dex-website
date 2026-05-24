import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Activity, ArrowUpRight } from 'lucide-react'

const projects = [
    {
        id: 'clinic-scheduler',
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
        phase: 'Phase 3: Outbound Twilio Routing & Live QA Audits',
        color: '#e05132', // Brand Orange
        pipeline: ['Inbound Phone Call', 'Hume AI Agent', 'HIPAA Shield DB', 'Symptom Router'],
        activeStep: 2,
    },
    {
        id: 'sales-recruiter',
        clientName: 'Elite Tech Consulting',
        purpose: 'Build a multi-agent sales pipeline that automatically extracts prospects, qualifies authority, and firesSMTP verified email campaigns.',
        done: [
            'Constructed territory-rotation crawler spanning 27 cities.',
            'Fine-tuned LLaMA-based pain signal classification models.',
            'Developed 7-layer verification SMTP delivery node.',
        ],
        next: [
            'Integrate automated LinkedIn DM connection API pipeline.',
            'Fine-tune personal email synthesis generator.',
        ],
        phase: 'Phase 2: SMTP Verification & API Integration',
        color: '#2563eb', // Cobalt Blue
        pipeline: ['Serper search', 'Pain Detector', 'SMTP Verifier', 'CRM Dispatcher'],
        activeStep: 1,
    },
    {
        id: 'whatsapp-consultant',
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
        phase: 'Phase 1: Knowledge-Graph Fine-Tuning',
        color: '#10b981', // Emerald
        pipeline: ['WhatsApp Text', 'Vector Store', 'LLaMA Reasoning', 'MLS DB Sync'],
        activeStep: 0,
    },
]

export default function ProjectPipeline() {
    const [selectedProject, setSelectedProject] = useState(projects[0])

    return (
        <section id="pipeline" className="relative py-24 bg-dark overflow-hidden">

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-accent mb-4">
                        Active Operations
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                        Live Project Workflow Pipeline
                    </h2>
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                        We don't work in secret. Track our active development, active workflow phases, and strategic roadmaps for current client projects.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Project Selector Tabs */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {projects.map((p) => {
                            const isSelected = selectedProject.id === p.id
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProject(p)}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-[#0F0F11]/80 border-white/10'
                                            : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {/* Accent strip */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-[4px]"
                                        style={{ background: p.color }}
                                    />
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-mono text-[0.62rem] text-gray-500 uppercase tracking-wider">
                                            {p.clientName}
                                        </p>
                                        <span
                                            className="h-1.5 w-1.5 rounded-full animate-pulse"
                                            style={{ background: p.color }}
                                        />
                                    </div>
                                    <h3 className="text-white font-bold text-sm font-display mb-1">
                                        {p.id === 'clinic-scheduler' ? 'APEX Voice Scheduler' : p.id === 'sales-recruiter' ? 'Sales Multi-Agent Pipeline' : 'Valuation WhatsApp Agent'}
                                    </h3>
                                    <p className="text-[0.72rem] text-gray-500 line-clamp-1">
                                        {p.purpose}
                                    </p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Selected Project Workflow Pipeline Display */}
                    <div className="lg:col-span-8">
                        <div className="dex-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
                            <div className="dex-grain-overlay" />

                            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
                                <div>
                                    <span
                                        className="text-[0.65rem] font-mono font-bold px-3 py-1 rounded-full border"
                                        style={{
                                            color: selectedProject.color,
                                            borderColor: `${selectedProject.color}30`,
                                            background: `${selectedProject.color}10`,
                                        }}
                                    >
                                        {selectedProject.phase}
                                    </span>
                                </div>
                                <span className="font-mono text-[0.62rem] text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                    ACTIVE BUILD
                                </span>
                            </div>

                            <div className="py-8">
                                <h3 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <span>Workflow Map</span>
                                    <Activity size={14} className="text-gray-600 animate-pulse" />
                                </h3>

                                {/* Flow Pipeline Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    {selectedProject.pipeline.map((step, idx) => {
                                        const isCompleted = idx <= selectedProject.activeStep
                                        const isActive = idx === selectedProject.activeStep
                                        return (
                                            <div
                                                key={step}
                                                className={`p-4 rounded-xl border flex flex-col gap-2 relative transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-[#0F0F11]/80 border-white/15'
                                                        : isCompleted
                                                        ? 'bg-white/[0.02] border-white/5 opacity-80'
                                                        : 'bg-white/[0.01] border-white/5 opacity-30'
                                                }`}
                                            >
                                                {/* Connecting arrow - hidden on mobile / last element */}
                                                {idx < 3 && (
                                                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-gray-700">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-[0.6rem] text-gray-500">Node 0{idx+1}</span>
                                                    {isCompleted && (
                                                        <Check size={12} className="text-emerald-500" />
                                                    )}
                                                </div>
                                                <p className={`text-[0.78rem] font-bold ${isCompleted ? 'text-white' : 'text-gray-600'}`}>{step}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Done & Next breakdown */}
                            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                {/* Done */}
                                <div>
                                    <p className="font-mono text-[0.62rem] uppercase tracking-wider text-gray-500 mb-3">Completed Milestones</p>
                                    <ul className="flex flex-col gap-2">
                                        {selectedProject.done.map((item, idx) => (
                                            <li key={idx} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Next */}
                                <div>
                                    <p className="font-mono text-[0.62rem] uppercase tracking-wider text-accent mb-3">Immediate Next Steps</p>
                                    <ul className="flex flex-col gap-2">
                                        {selectedProject.next.map((item, idx) => (
                                            <li key={idx} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
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
        </section>
    )
}
