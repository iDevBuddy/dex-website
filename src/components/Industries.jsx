'use client'
import { useState } from 'react'
import { Plus, Check } from 'lucide-react'

const industries = [
    {
        id: 'clinics', label: 'Medical & Dental Clinics',
        desc: 'Reduce front-desk workload, eliminate missed calls, and give patients a seamless booking experience — 24/7.',
        items: ['AI receptionist handling appointment calls', 'Smart scheduling with doctor availability', 'WhatsApp & email confirmations', 'CRM / Airtable patient records', 'After-hours triage routing'],
    },
    {
        id: 'law', label: 'Law Firms',
        desc: 'Streamline client intake, automate scheduling, and handle consultations without adding staff.',
        items: ['Automated client intake & screening', 'Attorney calendar scheduling', 'Document & case-info collection', 'Follow-up & status updates', 'After-hours lead capture'],
    },
    {
        id: 'realestate', label: 'Real Estate Agencies',
        desc: 'Qualify leads instantly, schedule viewings, and stay available 24/7 for buyers and sellers.',
        items: ['Lead qualification by conversation', 'Viewing scheduling with agent sync', 'Property & availability inquiries', 'Nurture & follow-up sequences', 'CRM lead tracking'],
    },
    {
        id: 'restaurants', label: 'Restaurants & Hotels',
        desc: 'Handle reservations, answer inquiries, and manage guest communications automatically.',
        items: ['Table reservation management', 'Menu & dietary handling', 'Room booking & availability', 'Concierge guest support', 'Review & feedback collection'],
    },
    {
        id: 'ecommerce', label: 'E-commerce',
        desc: 'Instant support, automated orders, and personalized shopping that lifts conversion.',
        items: ['Order tracking via WhatsApp', 'Recommendations & upselling', 'Returns & refund automation', 'Support ticket handling', 'Abandoned-cart recovery'],
    },
    {
        id: 'services', label: 'Professional Services',
        desc: 'Automate scheduling, client communication, and admin so you can focus on delivery.',
        items: ['Appointment & calendar management', 'Client intake & onboarding', 'Invoice & payment reminders', 'Quote generation', 'Multi-channel comms'],
    },
]

function IndustryIcon({ variant }) {
    const p = { fill: 'none', stroke: '#DD0426', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
    const icons = {
        clinics: <g {...p}><rect x="22" y="26" width="52" height="50" rx="10" /><path d="M22 38 H74" /><path d="M48 48 V66 M39 57 H57" strokeWidth="4" /></g>,
        law: <g {...p}><path d="M48 22 V72" /><path d="M32 72 H64" /><path d="M28 34 H68" /><path d="M28 34 L21 50 M28 34 L35 50" /><path d="M21 50 A7 7 0 0 0 35 50" /><path d="M68 34 L61 50 M68 34 L75 50" /><path d="M61 50 A7 7 0 0 0 75 50" /><circle cx="48" cy="29" r="2.5" fill="#DD0426" /></g>,
        realestate: <g {...p}><path d="M24 48 L48 28 L72 48" /><path d="M30 45 V72 H66 V45" /><path d="M44 72 V58 H52 V72" /></g>,
        restaurants: <g {...p}><path d="M24 64 H72" /><path d="M28 64 A20 20 0 0 1 68 64" /><path d="M48 44 V39" /><circle cx="48" cy="36" r="2.6" fill="#DD0426" /></g>,
        ecommerce: <g {...p}><path d="M31 39 H65 L69 73 H27 Z" /><path d="M40 45 V37 A8 8 0 0 1 56 37 V45" /></g>,
        services: <g {...p}><rect x="24" y="40" width="48" height="34" rx="6" /><path d="M40 40 V34 A4 4 0 0 1 44 30 H52 A4 4 0 0 1 56 34 V40" /><path d="M24 54 H72" /><rect x="44" y="50" width="8" height="8" rx="2" /></g>,
    }
    return <svg viewBox="0 0 96 96" className="w-28 h-28">{icons[variant]}</svg>
}

export default function Industries() {
    const [active, setActive] = useState(0)
    const cur = industries[active]

    return (
        <section id="industries" className="bg-dark py-20 lg:py-28">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="eyebrow mb-5">Industries</span>
                        <h2 className="font-display text-3xl sm:text-[2.8rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                            AI agent use cases across industries
                        </h2>
                    </div>
                    <p className="text-sm text-ghost-dim max-w-sm leading-relaxed md:text-right">
                        Production-grade agents tailored to the workflows, tools, and compliance of each sector.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* left: accordion */}
                    <div className="lg:col-span-7 border-t border-border">
                        {industries.map((ind, i) => {
                            const on = active === i
                            return (
                                <div key={ind.id} className="border-b border-border">
                                    <button
                                        onClick={() => setActive(i)}
                                        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                                        aria-expanded={on}
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className={`font-mono text-sm transition-colors ${on ? 'text-accent' : 'text-ghost-faint'}`}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className={`font-display text-lg sm:text-xl font-bold tracking-tight transition-colors ${on ? 'text-accent' : 'text-ghost group-hover:text-accent'}`}>
                                                {ind.label}
                                            </h3>
                                        </div>
                                        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${on ? 'bg-accent border-accent text-white rotate-45' : 'border-border text-ghost-dim group-hover:border-accent'}`}>
                                            <Plus size={14} />
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pb-7 pl-10 max-w-xl">
                                            <p className="text-[0.92rem] text-ghost-dim leading-relaxed mb-5">{ind.desc}</p>
                                            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                                {ind.items.map((it, k) => (
                                                    <li key={k} className="flex items-start gap-2 text-[0.84rem] text-ghost-dim">
                                                        <Check size={14} className="text-accent shrink-0 mt-0.5" />
                                                        <span>{it}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* right: vector icon panel */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <div className="relative rounded-3xl border border-border bg-dark-deeper overflow-hidden aspect-square flex flex-col items-center justify-center">
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(circle at 50% 45%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black, transparent 75%)' }}
                            />
                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, rgba(221,4,38,0.10), transparent 70%)' }} />
                            <div key={cur.id} className="reveal-up relative z-10 flex flex-col items-center">
                                <div className="p-6 rounded-2xl bg-white border border-border shadow-[0_10px_30px_-12px_rgba(0,0,0,0.12)]">
                                    <IndustryIcon variant={cur.id} />
                                </div>
                                <p className="font-display text-lg font-bold text-ghost mt-6">{cur.label}</p>
                                <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ghost-faint mt-2">
                                    Sector {String(active + 1).padStart(2, '0')} / {String(industries.length).padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
