'use client'
import { useRef } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'

const services = [
    {
        num: '01',
        title: 'Custom AI agent development',
        desc: 'We architect autonomous agent systems from the ground up — voice assistants, chat agents, and multi-agent networks planned, built, integrated, and deployed to scale with your workflow.',
    },
    {
        num: '02',
        title: 'Voice call automation',
        desc: 'Intelligent conversational AI on your phone lines, 24/7. Handles inquiries, pre-screens leads, books appointments, and fires SMS/email recap confirmations in real time.',
    },
    {
        num: '03',
        title: 'Conversational support agents',
        desc: 'Engage and qualify prospects on the channels they use. Chat agents for WhatsApp, web, and Slack that resolve support tickets and sync your pipeline instantly.',
    },
    {
        num: '04',
        title: 'Workflow & CRM integration',
        desc: 'Wire agents directly into HubSpot, Salesforce, Notion, Supabase, Twilio, and more. We automate data flows, kill manual entry, and keep every system in sync.',
    },
    {
        num: '05',
        title: 'AI audits & strategy workshops',
        desc: 'Focused workshops that audit your pipelines and surface processes ripe for automation — from POC planning to ROI models and a risk-free execution roadmap.',
    },
]

export default function Services() {
    const track = useRef(null)
    const scroll = (dir) => track.current?.scrollBy({ left: dir * 380, behavior: 'smooth' })

    return (
        <section id="services" className="bg-dark py-20 lg:py-28 overflow-hidden">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <span className="eyebrow mb-5">Capabilities</span>
                        <h2 className="font-display text-3xl sm:text-[2.8rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                            Our agentic AI services
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => scroll(-1)} aria-label="Previous" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ghost hover:border-accent hover:text-accent transition-colors">
                            <ArrowLeft size={16} />
                        </button>
                        <button onClick={() => scroll(1)} aria-label="Next" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ghost hover:border-accent hover:text-accent transition-colors">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={track} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 pl-6 sm:pl-10 lg:pl-16 pr-6 max-w-[1320px] mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {services.map((s, i) => (
                    <article
                        key={i}
                        className="group snap-start shrink-0 w-[290px] sm:w-[340px] h-[380px] rounded-2xl border border-border bg-dark-card relative overflow-hidden cursor-pointer transition-all duration-400 hover:border-accent shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-20px_rgba(120,2,18,0.55)]"
                    >
                        {/* glassy red material — fades in on hover */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                            style={{
                                background: 'linear-gradient(150deg, #FF1E3C 0%, #DD0426 50%, #B00320 100%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 1px rgba(255,255,255,0.08), inset 0 0 80px rgba(255,255,255,0.06)',
                            }}
                        />
                        {/* specular glass reflection */}
                        <div className="absolute -top-12 -left-8 w-52 h-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.28), transparent 65%)' }} />
                        <div className="dex-grain-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-400" />
                        {/* top specular sheen */}
                        <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent group-hover:via-white/50 transition-colors duration-400" />
                        {/* ghosted index watermark fills the void */}
                        <span className="absolute -bottom-8 right-1 font-display font-extrabold text-[9rem] leading-none text-ghost/[0.035] group-hover:text-white/10 transition-colors duration-400 select-none pointer-events-none">{s.num}</span>

                        <div className="relative z-10 h-full p-7 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ghost-faint group-hover:text-white/70 transition-colors">AI Automation</span>
                                <span className="font-mono text-[0.62rem] text-ghost-faint group-hover:text-white/60 transition-colors">{s.num}</span>
                            </div>

                            {/* bottom block — title+arrow row, desc reveals below (no overlap) */}
                            <div>
                                <div className="flex items-end justify-between gap-3">
                                    <h3 className="font-display text-[1.4rem] font-bold text-ghost group-hover:text-white tracking-tight leading-[1.1] transition-colors duration-300">
                                        {s.title}
                                    </h3>
                                    <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white text-accent shadow-sm transition-transform duration-300 group-hover:rotate-[0deg]">
                                        <ArrowUpRight size={16} className="transition-transform duration-400 group-hover:rotate-90" />
                                    </span>
                                </div>
                                <p className="text-[0.84rem] text-white/85 leading-relaxed max-h-0 opacity-0 group-hover:max-h-44 group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
                                    {s.desc}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
