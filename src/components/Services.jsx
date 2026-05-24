import { useState } from 'react'
import { FadeIn } from './Animations'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const services = [
    {
        title: 'Custom AI Agent Development',
        desc: 'We build autonomous agent systems from the ground up, custom-engineered for your business workflow. Whether it is an automated voice assistant, an automated chat channel, or multi-agent networks—we plan, build, integrate, and deploy agents that scale seamlessly.',
    },
    {
        title: 'Voice and Call Automation',
        desc: 'Elevate your phone lines with intelligent conversational AI that runs 24/7. Our custom-engineered voice agents handle inquiries, pre-screen leads, schedule appointments, and coordinate SMS/email recap confirmations in real-time.',
    },
    {
        title: 'WhatsApp and Conversational Chat',
        desc: 'Engage and qualify prospects directly on the channels they use. We construct intelligent chat agents for WhatsApp, web portals, and Slack that resolve customer support tickets and sync pipelines instantly.',
    },
    {
        title: 'Workflow & CRM API Integration',
        desc: 'Connect your active AI agents directly to your backend systems—HubSpot, Salesforce, Notion, Supabase, Twilio, and more. We automate data flows, eradicate manual entry, and keep your business databases perfectly synchronized.',
    },
    {
        title: 'AI Consulting & Strategy Workshops',
        desc: 'Not sure where to begin? We conduct focused workshops to audit your active business pipelines and identify processes ripe for AI automation. From POC planning to ROI models, we build a clear, risk-free execution roadmap.',
    },
]

export default function Services() {
    const [active, setActive] = useState(0)

    return (
        <section id="services" className="relative py-24 bg-[#02050f] overflow-hidden">
            {/* Top accent glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cobalt/25 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-accent mb-4">Our Services</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-4">End-to-end AI Agent Services</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">From initial strategic workshop to full-scale enterprise deployment—comprehensive AI agent engineering built for measurable commercial impact.</p>
                    </div>
                </FadeIn>

                <div className="max-w-3xl mx-auto flex flex-col gap-4">
                    {services.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.06}>
                            <div
                                onClick={() => setActive(active === i ? -1 : i)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                    active === i
                                        ? 'border-accent/40 bg-slate-900/40 shadow-lg'
                                        : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                                }`}
                                role="button"
                                aria-expanded={active === i}
                            >
                                <div className="dex-grain-overlay" />
                                
                                <div className="flex items-center justify-between gap-4 relative z-10">
                                    <h3 className="text-white font-bold text-sm sm:text-base font-display">{s.title}</h3>
                                    <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 border ${
                                        active === i
                                            ? 'bg-accent text-white border-accent'
                                            : 'text-gray-500 border-white/10 bg-white/[0.02]'
                                    }`}>
                                        {active === i ? <Minus size={12} /> : <Plus size={12} />}
                                    </span>
                                </div>
                                <AnimatePresence>
                                    {active === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden relative z-10"
                                        >
                                            <p className="text-gray-400 text-[0.82rem] sm:text-sm leading-relaxed pt-4 max-w-2xl">{s.desc}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
