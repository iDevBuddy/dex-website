'use client'
import { useState } from 'react'
import { Plus, ArrowUpRight } from 'lucide-react'

const faqs = [
    {
        q: 'What exactly are AI agents?',
        a: 'AI agents are autonomous software systems that perceive context, make decisions, and take real actions to complete business tasks — booking calls, qualifying leads, processing data — with little or no human input.',
    },
    {
        q: 'What can AI agents do for my business?',
        a: 'They automate repetitive, rule-based, and conversational work across your operations: voice and chat support, lead acquisition, scheduling, data entry, and multi-step workflows — running 24/7 without added headcount.',
    },
    {
        q: 'What is the typical timeline to build an agent?',
        a: 'Most agents go from discovery to a working proof of concept in 2–4 weeks, and to production in 4–8 weeks, depending on integrations and complexity.',
    },
    {
        q: 'Who should consider adopting AI agents?',
        a: 'Any business with high-volume, repeatable workflows — clinics, agencies, real estate, e-commerce, professional services — where speed, availability, or headcount is the bottleneck.',
    },
    {
        q: 'How do you handle security and data privacy?',
        a: 'We build on verified infrastructure with role-based access, encrypted data, and compliance-ready schemas (e.g. HIPAA). Human-in-the-loop controls guard every critical action.',
    },
    {
        q: 'Can agents integrate with the tools we already use?',
        a: 'Yes. We connect to your CRM, calendars, databases, and channels — Salesforce, HubSpot, Twilio, WhatsApp, Supabase, REST/GraphQL APIs, webhooks — so agents work inside your existing stack.',
    },
    {
        q: 'Do we need a technical team to work with you?',
        a: 'No. We handle architecture, build, and deployment end to end. You bring the domain knowledge; we translate it into a production agent and train your team to run it.',
    },
    {
        q: 'What kind of results can we expect?',
        a: 'Clients typically see large drops in manual workload and response time, higher lead conversion, and round-the-clock coverage — with measurable ROI tracked from day one.',
    },
    {
        q: 'How do we get started?',
        a: 'Book a free consultation. We audit your workflows, map the highest-value automation, and hand back a clear, risk-free build plan.',
    },
]

export default function FAQ() {
    const [open, setOpen] = useState(0)
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section id="faq" className="bg-dark py-16 lg:py-24">
            <div className="max-w-[1320px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
                {/* left: sticky intro + CTA */}
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28">
                        <span className="eyebrow mb-5">FAQ</span>
                        <h2 className="font-display text-3xl sm:text-[2.4rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] mb-5">
                            Frequently asked questions
                        </h2>
                        <p className="text-[0.92rem] text-ghost-dim leading-relaxed mb-7 max-w-xs">
                            Everything you need to know before putting AI agents to work. Still unsure?
                        </p>
                        <button onClick={openChatbot} className="group inline-flex items-center gap-2 px-6 py-3 rounded-full btn-grad-red text-white font-semibold text-[0.82rem] cursor-pointer">
                            Talk to us
                            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* right: accordion */}
                <div className="lg:col-span-8 border-t border-border">
                    {faqs.map((f, i) => {
                        const on = open === i
                        return (
                            <div key={i} className="border-b border-border">
                                <button
                                    onClick={() => setOpen(on ? -1 : i)}
                                    className="relative w-full flex items-center justify-between gap-6 py-5 text-left group"
                                    aria-expanded={on}
                                >
                                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'h-7' : 'h-0'}`} />
                                    <h3 className={`font-display text-[1.02rem] sm:text-[1.1rem] font-bold tracking-tight transition-all duration-300 ${on ? 'text-grad-red translate-x-4' : 'text-ghost group-hover:text-accent'}`}>
                                        {f.q}
                                    </h3>
                                    <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-400 ${on ? 'bg-accent border-accent text-white rotate-[135deg]' : 'border-border text-ghost-dim group-hover:border-accent group-hover:text-accent'}`}>
                                        <Plus size={14} />
                                    </span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-[0.92rem] text-ghost-dim leading-relaxed pb-6 pl-4 pr-10 max-w-2xl">{f.a}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
