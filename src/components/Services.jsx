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
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

            <div ref={track} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pl-6 pr-6 max-w-[1320px] mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {services.map((s, i) => (
                    <article
                        key={i}
                        className="group snap-start shrink-0 w-[290px] sm:w-[340px] h-[380px] rounded-2xl border border-border bg-dark-card p-7 flex flex-col justify-between relative overflow-hidden transition-colors duration-400 hover:bg-accent hover:border-accent cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ghost-faint group-hover:text-white/70 transition-colors">AI Agents</span>
                            <span className="font-mono text-[0.62rem] text-ghost-faint group-hover:text-white/60 transition-colors">{s.num}</span>
                        </div>

                        {/* content block — anchored bottom; reveals upward on hover */}
                        <div>
                            <h3 className="font-display text-[1.45rem] font-bold text-ghost group-hover:text-white tracking-tight leading-[1.1] transition-colors duration-300">
                                {s.title}
                            </h3>
                            <p className="text-[0.85rem] text-white/85 leading-relaxed max-h-0 opacity-0 group-hover:max-h-44 group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
                                {s.desc}
                            </p>
                        </div>

                        {/* corner arrow — rotates down on hover */}
                        <span className="absolute bottom-6 right-6 w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-white text-accent group-hover:bg-white group-hover:text-accent transition-all duration-300">
                            <ArrowUpRight size={16} className="group-hover:rotate-90 transition-transform duration-400" />
                        </span>
                    </article>
                ))}
            </div>
        </section>
    )
}
