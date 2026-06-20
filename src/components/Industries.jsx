'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

const industries = [
    { id: 'clinics', tab: 'Healthcare', label: 'Medical & Dental Clinics', desc: 'Reduce front-desk workload, eliminate missed calls, and give patients a seamless booking experience — 24/7.', items: ['AI receptionist handling appointment calls', 'Smart scheduling with doctor availability', 'WhatsApp & email confirmations', 'CRM / Airtable patient records', 'After-hours triage routing'], nodes: ['Voice', 'Calendar', 'WhatsApp', 'CRM', 'Records'] },
    { id: 'law', tab: 'Legal', label: 'Law Firms', desc: 'Streamline client intake, automate scheduling, and handle consultations without adding staff.', items: ['Automated client intake & screening', 'Attorney calendar scheduling', 'Document & case-info collection', 'Follow-up & status updates', 'After-hours lead capture'], nodes: ['Intake', 'Calendar', 'Docs', 'Email', 'CRM'] },
    { id: 'realestate', tab: 'Real Estate', label: 'Real Estate Agencies', desc: 'Qualify leads instantly, schedule viewings, and stay available 24/7 for buyers and sellers.', items: ['Lead qualification by conversation', 'Viewing scheduling with agent sync', 'Property & availability inquiries', 'Nurture & follow-up sequences', 'CRM lead tracking'], nodes: ['Leads', 'Viewings', 'Listings', 'Email', 'CRM'] },
    { id: 'restaurants', tab: 'Hospitality', label: 'Restaurants & Hotels', desc: 'Handle reservations, answer inquiries, and manage guest communications automatically.', items: ['Table reservation management', 'Menu & dietary handling', 'Room booking & availability', 'Concierge guest support', 'Review & feedback collection'], nodes: ['Bookings', 'Menu', 'Rooms', 'Reviews', 'Support'] },
    { id: 'ecommerce', tab: 'E-commerce', label: 'E-commerce', desc: 'Instant support, automated orders, and personalized shopping that lifts conversion.', items: ['Order tracking via WhatsApp', 'Recommendations & upselling', 'Returns & refund automation', 'Support ticket handling', 'Abandoned-cart recovery'], nodes: ['Orders', 'Recommend', 'Returns', 'Support', 'Cart'] },
    { id: 'services', tab: 'Professional', label: 'Professional Services', desc: 'Automate scheduling, client communication, and admin so you can focus on delivery.', items: ['Appointment & calendar management', 'Client intake & onboarding', 'Invoice & payment reminders', 'Quote generation', 'Multi-channel comms'], nodes: ['Booking', 'Intake', 'Invoices', 'Quotes', 'Comms'] },
]

function IndustryIcon({ variant }) {
    const p = { fill: 'none', stroke: '#DD0426', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
    const icons = {
        clinics: <g {...p}><rect x="22" y="26" width="52" height="50" rx="10" /><path d="M22 38 H74" /><path d="M48 48 V66 M39 57 H57" strokeWidth="4.5" /></g>,
        law: <g {...p}><path d="M48 22 V72" /><path d="M32 72 H64" /><path d="M28 34 H68" /><path d="M28 34 L21 50 M28 34 L35 50" /><path d="M21 50 A7 7 0 0 0 35 50" /><path d="M68 34 L61 50 M68 34 L75 50" /><path d="M61 50 A7 7 0 0 0 75 50" /><circle cx="48" cy="29" r="2.5" fill="#DD0426" /></g>,
        realestate: <g {...p}><path d="M24 48 L48 28 L72 48" /><path d="M30 45 V72 H66 V45" /><path d="M44 72 V58 H52 V72" /></g>,
        restaurants: <g {...p}><path d="M24 64 H72" /><path d="M28 64 A20 20 0 0 1 68 64" /><path d="M48 44 V39" /><circle cx="48" cy="36" r="2.6" fill="#DD0426" /></g>,
        ecommerce: <g {...p}><path d="M31 39 H65 L69 73 H27 Z" /><path d="M40 45 V37 A8 8 0 0 1 56 37 V45" /></g>,
        services: <g {...p}><rect x="24" y="40" width="48" height="34" rx="6" /><path d="M40 40 V34 A4 4 0 0 1 44 30 H52 A4 4 0 0 1 56 34 V40" /><path d="M24 54 H72" /><rect x="44" y="50" width="8" height="8" rx="2" /></g>,
    }
    return <svg viewBox="0 0 96 96" className="w-12 h-12">{icons[variant]}</svg>
}

const C = 160, R = 100
const pos = (i, n) => {
    const a = (-90 + (i * 360) / n) * (Math.PI / 180)
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) }
}

function NetworkVisual({ industry }) {
    const pts = industry.nodes.map((_, i) => pos(i, industry.nodes.length))
    return (
        <div key={industry.id} className="reveal-up relative w-[320px] h-[320px]">
            {/* ambient: connecting network + travelling data (SVG) */}
            <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full">
                {pts.map((pt, i) => (
                    <g key={i}>
                        <line className="motif-line" x1={C} y1={C} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                        <circle r="2.4" fill="#DD0426">
                            <animateMotion dur="2.8s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={`M${C},${C} L${pt.x},${pt.y}`} />
                        </circle>
                    </g>
                ))}
            </svg>

            {/* node chips (secondary) */}
            {pts.map((pt, i) => (
                <div
                    key={i}
                    className="node-blink absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-sm text-[0.6rem] font-medium text-white/75 whitespace-nowrap"
                    style={{ left: `${(pt.x / 320) * 100}%`, top: `${(pt.y / 320) * 100}%`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.3}s` }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {industry.nodes[i]}
                </div>
            ))}

            {/* center hero (primary) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                {/* radar ping rings */}
                <span className="ping-ring absolute w-[88px] h-[88px] rounded-full border border-accent/45" />
                <span className="ping-ring absolute w-[88px] h-[88px] rounded-full border border-accent/30" style={{ animationDelay: '1.6s' }} />
                {/* rotating dashed orbit */}
                <svg viewBox="0 0 120 120" className="slow-spin absolute w-[118px] h-[118px]">
                    <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="2 7" />
                    <circle cx="60" cy="4" r="2.5" fill="#DD0426" />
                </svg>
                {/* glass disc + icon */}
                <div className="breathe relative w-[84px] h-[84px] rounded-full flex items-center justify-center"
                    style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.03))', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 0 36px -6px rgba(221,4,38,0.5)' }}>
                    <IndustryIcon variant={industry.id} />
                </div>
            </div>
        </div>
    )
}

export default function Industries() {
    const [active, setActive] = useState(0)
    const cur = industries[active]

    return (
        <section id="industries" className="bg-dark py-16 lg:py-20">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="mb-8">
                    <span className="eyebrow mb-5">Industries</span>
                    <h2 data-reveal className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                        AI agent use cases across industries
                    </h2>
                </div>

                {/* tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-border mb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {industries.map((ind, i) => {
                        const on = active === i
                        return (
                            <button key={ind.id} onClick={() => setActive(i)} className={`relative shrink-0 px-4 py-3 text-[0.84rem] font-semibold transition-colors ${on ? 'text-accent' : 'text-ghost-dim hover:text-ghost'}`}>
                                {ind.tab}
                                {on && <span className="absolute bottom-[-1px] left-3 right-3 h-[2px] bg-accent rounded-full" />}
                            </button>
                        )
                    })}
                </div>

                {/* split: left bullets, right network visual */}
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    <div key={cur.id} className="reveal-up">
                        <h3 className="font-display text-xl font-bold text-ghost tracking-tight mb-3">{cur.label}</h3>
                        <p className="text-[0.95rem] text-ghost-dim leading-relaxed mb-6 max-w-lg">{cur.desc}</p>
                        <ul className="flex flex-col gap-3">
                            {cur.items.map((it, k) => (
                                <li key={k} className="flex items-start gap-3 text-[0.9rem] text-ghost-dim">
                                    <ArrowRight size={15} className="text-accent shrink-0 mt-1" />
                                    <span>{it}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* right: animated agent-network panel */}
                    <div className="relative rounded-2xl bg-night overflow-hidden h-[360px] flex items-center justify-center">
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 75%)' }} />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, rgba(221,4,38,0.14), transparent 70%)' }} />
                        <div className="dex-grain-overlay opacity-30" />
                        <NetworkVisual industry={cur} />
                        <p className="absolute bottom-4 left-0 right-0 text-center font-mono text-[0.56rem] uppercase tracking-[0.22em] text-white/35">
                            {cur.label} · live agent mesh
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
