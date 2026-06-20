'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'

const faqs = [
    { q: 'What exactly are AI agents?', a: 'AI agents are autonomous software systems that perceive context, make decisions, and take real actions to complete business tasks — booking calls, qualifying leads, processing data — with little or no human input.' },
    { q: 'What can AI agents do for my business?', a: 'They automate repetitive, rule-based, and conversational work across your operations: voice and chat support, lead acquisition, scheduling, data entry, and multi-step workflows — running 24/7 without added headcount.' },
    { q: 'What is the typical timeline to build an agent?', a: 'Most agents go from discovery to a working proof of concept in 2–4 weeks, and to production in 4–8 weeks, depending on integrations and complexity.' },
    { q: 'Who should consider adopting AI agents?', a: 'Any business with high-volume, repeatable workflows — clinics, agencies, real estate, e-commerce, professional services — where speed, availability, or headcount is the bottleneck.' },
    { q: 'How do you handle security and data privacy?', a: 'We build on verified infrastructure with role-based access, encrypted data, and compliance-ready schemas. Human-in-the-loop controls guard every critical action.' },
    { q: 'Can agents integrate with the tools we already use?', a: 'Yes. We connect to your CRM, calendars, databases, and channels — Salesforce, HubSpot, Twilio, Supabase, REST/GraphQL APIs, webhooks — so agents work inside your existing stack.' },
    { q: 'Do we need a technical team to work with you?', a: 'No. We handle architecture, build, and deployment end to end. You bring the domain knowledge; we translate it into a production agent and train your team to run it.' },
    { q: 'What kind of results can we expect?', a: 'Clients typically see large drops in manual workload and response time, higher lead conversion, and round-the-clock coverage — with measurable ROI tracked from day one.' },
    { q: 'How do we get started?', a: 'Book a free consultation. We audit your workflows, map the highest-value automation, and hand back a clear, risk-free build plan.' },
]

export default function FAQ() {
    const [open, setOpen] = useState(-1)
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section id="faq" className="bg-dark py-20 lg:py-28">
            <div className="max-w-3xl mx-auto px-6">
                <h2 data-reveal className="font-display text-3xl sm:text-4xl font-bold text-ghost tracking-tight text-center mb-14">
                    Frequently asked questions
                </h2>

                <div>
                    {faqs.map((f, i) => {
                        const on = open === i
                        return (
                            <div key={i} className="border-t border-border last:border-b">
                                <button
                                    onClick={() => setOpen(on ? -1 : i)}
                                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                                    aria-expanded={on}
                                >
                                    <span className="text-[1.02rem] sm:text-[1.1rem] font-medium text-ghost">{f.q}</span>
                                    <Plus size={20} className={`shrink-0 text-ghost-faint transition-transform duration-300 ${on ? 'rotate-45' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-400 ease-out ${on ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-[0.95rem] text-ghost-dim leading-relaxed pb-6 pr-10">{f.a}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-center text-[0.9rem] text-ghost-dim mt-12">
                    Still have questions?{' '}
                    <button onClick={openChatbot} className="font-semibold text-ghost hover:text-accent transition-colors underline underline-offset-4 cursor-pointer">
                        Talk to us
                    </button>
                </p>
            </div>
        </section>
    )
}
