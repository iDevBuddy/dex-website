'use client'
import { useState } from 'react'
import { useRetellDemo } from '../hooks/useRetellDemo'
import { ArrowUpRight, ArrowRight, Check, Mic, PhoneOff, Target, PenLine, Phone } from 'lucide-react'

const agents = [
    {
        id: 'acquisition', name: 'Client Acquisition Agent', cat: 'Sales', icon: Target, metric: '47 leads today',
        desc: 'Finds prospects, qualifies authority, and books meetings — autonomously, around the clock.',
        features: ['Territory-rotation prospecting', 'SMTP-verified outreach', 'Auto lead scoring + CRM sync'],
        cta: 'chat',
    },
    {
        id: 'blogging', name: 'Blogging Automation System', cat: 'Content', icon: PenLine, metric: '14 posts / mo',
        desc: 'Researches topics, drafts SEO-ready articles, generates media, and publishes — end to end.',
        features: ['Topic discovery + scoring', 'Draft + SEO optimization', 'Auto media + publish'],
        cta: 'chat',
    },
    {
        id: 'voice', name: 'Voice Receptionist Agent', cat: 'Voice', icon: Phone, metric: '128 calls today',
        desc: 'Answers calls, books appointments, and confirms over SMS/email in a natural voice.',
        features: ['24/7 inbound call handling', 'Calendar + availability', 'SMS / email confirmations'],
        cta: 'voice',
    },
]

function Ring({ pct, size = 32 }) {
    const r = (size - 5) / 2
    const c = 2 * Math.PI * r
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DD0426" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill="#fff" className="font-mono">{pct}</text>
        </svg>
    )
}

function LeadFeed() {
    const leads = [
        { ini: 'AM', name: 'Alex Mercer', co: 'Northwind SaaS', score: 92, tag: 'Booked', live: false },
        { ini: 'JP', name: 'Jaya Patel', co: 'Vertex Health', score: 84, tag: 'Qualified', live: true },
        { ini: 'RC', name: 'Ray Cohen', co: 'Apex Realty', score: 76, tag: 'Qualified', live: false },
    ]
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-2 pb-2 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-white/30">
                <span>Lead</span><span>Score</span><span className="text-right w-16">Status</span>
            </div>
            <div className="flex flex-col gap-1.5">
                {leads.map((l) => (
                    <div key={l.ini} className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${l.live ? 'bg-accent/[0.07] border border-accent/15' : 'bg-white/[0.025] border border-transparent'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-[0.56rem] font-bold text-white/70 shrink-0">{l.ini}</span>
                            <div className="min-w-0">
                                <p className="text-[0.74rem] font-semibold text-white leading-tight truncate">{l.name}</p>
                                <p className="text-[0.6rem] text-white/40 truncate">{l.co}</p>
                            </div>
                        </div>
                        <Ring pct={l.score} />
                        <span className={`w-16 text-right text-[0.6rem] font-medium ${l.tag === 'Booked' ? 'text-accent' : 'text-white/55'}`}>
                            {l.live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse mr-1 align-middle" />}{l.tag}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[0.58rem] text-white/40">
                <span>+3 new today</span><span className="text-white/55">2 meetings booked</span>
            </div>
        </div>
    )
}

function ContentPipeline() {
    const stages = [['Topic', 1], ['Research', 1], ['Draft', 1], ['SEO', 0], ['Publish', 0]]
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
                {stages.map(([s, done], i) => (
                    <div key={s} className="flex flex-col items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${done ? 'bg-accent border-accent' : i === 3 ? 'border-accent/50 bg-accent/10' : 'border-white/15 bg-night'}`}>
                            {done ? <Check size={11} className="text-white" /> : <span className={`w-1.5 h-1.5 rounded-full ${i === 3 ? 'bg-accent animate-pulse' : 'bg-white/25'}`} />}
                        </span>
                        <span className={`text-[0.54rem] font-medium ${done || i === 3 ? 'text-white/80' : 'text-white/35'}`}>{s}</span>
                    </div>
                ))}
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.07] p-3.5 flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[0.52rem] uppercase tracking-wider text-white/35">Draft · editing</span>
                    <span className="font-mono text-[0.54rem] text-accent">SEO 94</span>
                </div>
                <p className="text-[0.82rem] font-semibold text-white leading-snug mb-2.5">AI Automation for Small Businesses: The 2027 Playbook</p>
                <div className="space-y-1.5 mb-3">
                    <span className="block h-1.5 rounded-full bg-white/[0.08] w-full" />
                    <span className="block h-1.5 rounded-full bg-white/[0.08] w-[88%]" />
                    <span className="block h-1.5 rounded-full bg-white/[0.06] w-[72%]" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {['1,840 words', '3 images', 'audio', 'internal links'].map((t) => <span key={t} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[0.56rem] text-white/55">{t}</span>)}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[0.58rem] text-white/40">
                <span>Queued · 4 drafts</span><span className="text-white/55">14 published this month</span>
            </div>
        </div>
    )
}

function VoiceCall({ live }) {
    const lines = [
        { who: 'caller', txt: 'Hi, I need a dentist appointment this week.' },
        { who: 'agent', txt: 'I have Tuesday 3 PM or Wednesday 11 AM — which works?' },
        { who: 'caller', txt: 'Tuesday works, thanks.' },
    ]
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.07] px-3 py-2.5 mb-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center"><Phone size={13} className="text-accent" /></span>
                    <div>
                        <p className="text-[0.72rem] font-semibold text-white leading-tight">Inbound · +1 (415) 555-0182</p>
                        <p className="font-mono text-[0.54rem] text-white/40">{live ? 'on call' : 'connected'} · 00:48</p>
                    </div>
                </div>
                <div className="flex items-end gap-[3px] h-6">
                    {Array.from({ length: 9 }).map((_, i) => <span key={i} className="wave-bar w-[3px] rounded-full bg-accent" style={{ height: `${30 + (i % 4) * 18}%`, animationDelay: `${i * 0.08}s`, opacity: 0.5 + (i % 4) * 0.14 }} />)}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {lines.map((l, i) => (
                    <div key={i} className={`max-w-[82%] rounded-xl px-3 py-2 text-[0.74rem] leading-snug ${l.who === 'agent' ? 'self-end bg-accent/[0.12] border border-accent/20 text-white' : 'self-start bg-white/[0.04] border border-white/[0.07] text-white/75'}`}>
                        {l.txt}
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center gap-2 font-mono text-[0.58rem] text-white/45">
                <Check size={12} className="text-accent" />Booked Tue 3:00 PM · confirmation sent
            </div>
        </div>
    )
}

export default function Demo() {
    const [active, setActive] = useState(0)
    const { status, startCall, stopCall } = useRetellDemo()
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))
    const agent = agents[active]
    const AIcon = agent.icon

    const handleCta = () => {
        if (agent.cta === 'voice') { status === 'connected' ? stopCall() : startCall() }
        else openChatbot()
    }
    const ctaLabel = agent.cta === 'voice'
        ? (status === 'connected' ? 'End call' : status === 'connecting' ? 'Connecting…' : 'Talk to the agent')
        : 'Try it live'

    return (
        <section id="demo" className="bg-dark py-16 lg:py-20">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                    <div>
                        <span className="eyebrow mb-5">Live Demo</span>
                        <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] max-w-xl">
                            See our agents in action
                        </h2>
                    </div>
                    <a href="/agents" className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold text-ghost shrink-0">
                        All agents
                        <ArrowUpRight size={15} className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </div>

                {/* switcher */}
                <div className="flex flex-wrap gap-2 mb-7">
                    {agents.map((a, i) => {
                        const on = active === i
                        const Ic = a.icon
                        return (
                            <button key={a.id} onClick={() => setActive(i)} className={`flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full border text-[0.78rem] font-medium transition-all duration-300 ${on ? 'btn-grad-red border-transparent text-white' : 'border-border text-ghost-dim hover:text-ghost hover:border-ghost/40'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${on ? 'bg-white/20' : 'bg-dark-deeper'}`}><Ic size={11} className={on ? 'text-white' : 'text-ghost-dim'} /></span>
                                {a.name}
                            </button>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                    {/* product window */}
                    <div className="lg:col-span-7">
                        <div className="relative rounded-2xl bg-night overflow-hidden h-[380px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)]">
                            {/* app-shell header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center"><AIcon size={13} className="text-accent" /></span>
                                    <div>
                                        <p className="text-[0.72rem] font-semibold text-white leading-tight">{agent.name}</p>
                                        <p className="font-mono text-[0.52rem] uppercase tracking-wider text-white/35">{agent.cat} · v2.4</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] border border-white/10 font-mono text-[0.54rem] text-white/55">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                                    </span>
                                    <span className="hidden sm:inline px-2 py-1 rounded-full bg-white/[0.05] border border-white/10 font-mono text-[0.54rem] text-white/55">{agent.metric}</span>
                                </div>
                            </div>
                            <div key={agent.id} className="reveal-up h-[calc(380px-46px)]">
                                {agent.id === 'acquisition' && <LeadFeed />}
                                {agent.id === 'blogging' && <ContentPipeline />}
                                {agent.id === 'voice' && <VoiceCall live={status === 'connected'} />}
                            </div>
                        </div>
                    </div>

                    {/* info + CTA */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                        <div key={agent.id} className="reveal-up">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent">{agent.cat}</span>
                                <span className="w-1 h-1 rounded-full bg-ghost-faint" />
                                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ghost-faint">99.9% uptime</span>
                            </div>
                            <h3 className="font-display text-2xl font-bold text-ghost tracking-tight mb-3">{agent.name}</h3>
                            <p className="text-[0.92rem] text-ghost-dim leading-relaxed mb-5 max-w-md">{agent.desc}</p>
                            <ul className="flex flex-col gap-2.5 mb-7">
                                {agent.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-[0.86rem] text-ghost-dim">
                                        <span className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5"><Check size={10} className="text-accent" /></span>{f}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCta}
                                    disabled={status === 'connecting' && agent.cta === 'voice'}
                                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full btn-grad-red text-white font-semibold text-[0.84rem] cursor-pointer disabled:opacity-60"
                                >
                                    {agent.cta === 'voice' ? (status === 'connected' ? <PhoneOff size={15} /> : <Mic size={15} />) : null}
                                    {ctaLabel}
                                    {agent.cta !== 'voice' && <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                </button>
                                <a href="/agents" className="text-[0.8rem] font-semibold text-ghost-dim hover:text-ghost transition-colors inline-flex items-center gap-1.5">How it works <ArrowRight size={13} /></a>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="font-mono text-[0.64rem] text-ghost-faint mt-7 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Shipping new agents every month — a full agent playground is coming soon.
                </p>
            </div>
        </section>
    )
}
