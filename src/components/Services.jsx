import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const services = [
    {
        num: '01',
        title: 'Custom AI Agent Engineering',
        desc: 'We build autonomous agent systems from the ground up, custom-engineered for your business workflow. Whether it is an automated voice assistant, an automated chat channel, or multi-agent networks—we plan, build, integrate, and deploy agents that scale seamlessly.',
    },
    {
        num: '02',
        title: 'Voice Call Automation',
        desc: 'Elevate your phone lines with intelligent conversational AI that runs 24/7. Our custom-engineered voice agents handle inquiries, pre-screen leads, schedule appointments, and coordinate SMS/email recap confirmations in real-time.',
    },
    {
        num: '03',
        title: 'WhatsApp Conversational Support',
        desc: 'Engage and qualify prospects directly on the channels they use. We construct intelligent chat agents for WhatsApp, web portals, and Slack that resolve customer support tickets and sync pipelines instantly.',
    },
    {
        num: '04',
        title: 'Workflow & CRM API Integration',
        desc: 'Connect your active AI agents directly to your backend systems—HubSpot, Salesforce, Notion, Supabase, Twilio, and more. We automate data flows, eradicate manual entry, and keep your business databases perfectly synchronized.',
    },
    {
        num: '05',
        title: 'AI Audits & Strategy Workshops',
        desc: 'Not sure where to begin? We conduct focused workshops to audit your active business pipelines and identify processes ripe for AI automation. From POC planning to ROI models, we build a clear, risk-free execution roadmap.',
    },
]

export default function Services() {
    const [active, setActive] = useState(0)

    return (
        <section id="services" className="relative py-24 bg-dark border-t border-b border-white/5 overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Asymmetric Typographic Intro */}
                    <div className="lg:col-span-5 text-left lg:sticky lg:top-28">
                        <p className="font-mono text-[0.62rem] font-bold tracking-[0.25em] uppercase text-accent mb-4">
                            Capabilities
                        </p>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-[0.95] font-display mb-6">
                            End-to-end AI Agent Services.
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
                            From strategic pipeline audit to massive multi-agent enterprise deployment—comprehensive AI agent engineering built for measurable commercial impact.
                        </p>
                    </div>

                    {/* Right: The Micro-thin Hairline Grid Accordin */}
                    <div className="lg:col-span-7 flex flex-col border-t border-white/8">
                        {services.map((s, i) => {
                            const isOpen = active === i
                            return (
                                <div
                                    key={i}
                                    onClick={() => setActive(isOpen ? -1 : i)}
                                    className={`py-6 border-b border-white/8 cursor-pointer group transition-all duration-300 relative overflow-hidden`}
                                    role="button"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-center justify-between gap-6 relative z-10">
                                        <div className="flex items-center gap-6">
                                            {/* Large light monospace index number */}
                                            <span className={`font-mono text-xl sm:text-2xl transition-colors duration-300 font-light ${
                                                isOpen ? 'text-[#0052FF]' : 'text-gray-700 group-hover:text-gray-500'
                                            }`}>
                                                {s.num}
                                            </span>
                                            <h3 className="text-white font-bold text-sm sm:text-base font-display tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                                                {s.title}
                                            </h3>
                                        </div>
                                        <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                            isOpen
                                                ? 'bg-[#0052FF] text-white'
                                                : 'text-gray-500 bg-white/[0.02] border border-white/8 group-hover:border-white/15'
                                        }`}>
                                            {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden relative z-10"
                                            >
                                                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed pl-12 pt-4 max-w-xl">
                                                    {s.desc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
