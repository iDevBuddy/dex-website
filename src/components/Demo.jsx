'use client'
import { useState } from 'react'
import { useRetellDemo } from '../hooks/useRetellDemo'
import { ArrowUpRight, ArrowRight, Check, Mic, PhoneOff } from 'lucide-react'

const agents = [
    {
        id: 'acquisition', name: 'Client Acquisition Agent', cat: 'Sales',
        desc: 'Finds prospects, qualifies authority, and books meetings — autonomously, around the clock.',
        features: ['Territory-rotation prospecting', 'SMTP-verified outreach', 'Auto lead scoring + CRM sync'],
        cta: 'chat',
    },
    {
        id: 'blogging', name: 'Blogging Automation System', cat: 'Content',
        desc: 'Researches topics, drafts SEO-ready articles, generates media, and publishes — end to end.',
        features: ['Topic discovery + scoring', 'Draft + SEO optimization', 'Auto media + publish'],
        cta: 'chat',
    },
    {
        id: 'voice', name: 'Voice Receptionist Agent', cat: 'Voice',
        desc: 'Answers calls, books appointments, and confirms over SMS/email in a natural voice.',
        features: ['24/7 inbound call handling', 'Calendar + availability', 'SMS / email confirmations'],
        cta: 'voice',
    },
]

/* ── live previews ──────────────────────────────────────────────────── */
function LeadFeed() {
    const leads = [['AM', 'A. Mercer', 'Northwind SaaS', 92], ['JP', 'J. Patel', 'Vertex Health', 84], ['RC', 'R. Cohen', 'Apex Realty', 76]]
    return (
        <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/45">Live lead feed</span>
                <span className="font-mono text-[0.58rem] text-accent flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />qualifying</span>
            </div>
            <div className="flex flex-col gap-2.5">
                {leads.map(([ini, name, co, score], i) => (
                    <div key={i} className="reveal-up flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3" style={{ animationDelay: `${i * 0.15}s` }}>
                        <span className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center font-mono text-[0.6rem] font-bold text-accent shrink-0">{ini}</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[0.78rem] font-semibold text-white leading-tight">{name}</p>
                            <p className="text-[0.64rem] text-white/45">{co}</p>
                        </div>
                        <div className="w-20 shrink-0">
                            <div className="flex justify-between mb-1"><span className="text-[0.54rem] text-white/40">score</span><span className="text-[0.6rem] font-bold text-white">{score}</span></div>
                            <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="grow-bar h-full rounded-full" style={{ '--w': `${score}%`, background: 'linear-gradient(90deg,#FF1E3C,#DD0426)', animationDelay: `${i * 0.15 + 0.3}s` }} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2 text-[0.62rem] text-white/45"><Check size={12} className="text-accent" />2 qualified · meeting booked with A. Mercer</div>
        </div>
    )
}

function ContentPipeline() {
    const stages = ['Topic', 'Research', 'Draft', 'SEO', 'Publish']
    return (
        <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/45">Content pipeline</span>
                <span className="font-mono text-[0.58rem] text-accent flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />running</span>
            </div>
            <div className="relative flex items-center justify-between mb-7 px-1">
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-white/10" />
                {stages.map((s, i) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <span className={`w-3 h-3 rounded-full border ${i < 4 ? 'bg-accent border-accent' : 'bg-night border-white/25'} ${i === 3 ? 'node-pulse' : ''}`} />
                        <span className={`text-[0.56rem] font-medium ${i < 4 ? 'text-white' : 'text-white/40'}`}>{s}</span>
                    </div>
                ))}
            </div>
            <div className="reveal-up rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                <p className="font-mono text-[0.56rem] uppercase tracking-wider text-white/40 mb-2">Draft output</p>
                <p className="text-[0.8rem] font-semibold text-white leading-snug mb-2">"AI Automation for Small Businesses: The 2027 Playbook"</p>
                <div className="flex flex-wrap gap-1.5">
                    {['1,840 words', 'SEO 94', '3 images', 'audio'].map((t) => <span key={t} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[0.58rem] text-white/60">{t}</span>)}
                </div>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2 text-[0.62rem] text-white/45"><Check size={12} className="text-accent" />Published to /blog · cross-posted to Medium</div>
        </div>
    )
}

function VoiceCall({ live }) {
    return (
        <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/45">Voice session</span>
                <span className="font-mono text-[0.58rem] text-accent flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />{live ? 'on call' : 'inbound'}</span>
            </div>
            <div className="flex items-center justify-center gap-1 h-16 mb-5">
                {Array.from({ length: 22 }).map((_, i) => (
                    <span key={i} className="wave-bar w-1 rounded-full bg-accent" style={{ height: `${20 + (i % 5) * 14}%`, animationDelay: `${i * 0.06}s`, opacity: 0.4 + (i % 5) * 0.12 }} />
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {[['caller', '"Hi, I need a dentist appointment this week."'], ['agent', '"I have Tuesday 3 PM or Wednesday 11 AM — which works?"'], ['caller', '"Tuesday works."']].map(([who, txt], i) => (
                    <div key={i} className="reveal-up text-[0.74rem] leading-snug" style={{ animationDelay: `${i * 0.3}s` }}>
                        <span className={`font-mono text-[0.52rem] uppercase tracking-wider mr-2 ${who === 'agent' ? 'text-accent' : 'text-white/40'}`}>{who}</span>
                        <span className="text-white/75">{txt}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2 text-[0.62rem] text-white/45"><Check size={12} className="text-accent" />Booked Tue 3:00 PM · SMS + email confirmation sent</div>
        </div>
    )
}

export default function Demo() {
    const [active, setActive] = useState(0)
    const { status, startCall, stopCall } = useRetellDemo()
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))
    const agent = agents[active]

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
                        <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-ghost tracking-tightest leading-[1.0] max-w-xl">
                            See our agents in action
                        </h2>
                    </div>
                    <a href="/agents" className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold text-ghost shrink-0">
                        All agents
                        <ArrowUpRight size={15} className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </div>

                {/* agent switcher */}
                <div className="flex flex-wrap gap-2 mb-7">
                    {agents.map((a, i) => {
                        const on = active === i
                        return (
                            <button key={a.id} onClick={() => setActive(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[0.78rem] font-medium transition-all duration-300 ${on ? 'bg-accent text-white border-accent' : 'border-border text-ghost-dim hover:text-ghost hover:border-ghost/40'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-white animate-pulse' : 'bg-ghost-faint'}`} />
                                {a.name}
                            </button>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                    {/* preview window */}
                    <div className="lg:col-span-7">
                        <div className="relative rounded-2xl bg-night overflow-hidden h-[360px]">
                            <div className="dex-grain-overlay opacity-30" />
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                                <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                                <span className="ml-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/35">{agent.name}</span>
                            </div>
                            <div key={agent.id} className="reveal-up h-[calc(360px-42px)]">
                                {agent.id === 'acquisition' && <LeadFeed />}
                                {agent.id === 'blogging' && <ContentPipeline />}
                                {agent.id === 'voice' && <VoiceCall live={status === 'connected'} />}
                            </div>
                        </div>
                    </div>

                    {/* info + CTA */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                        <div key={agent.id} className="reveal-up">
                            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent">{agent.cat} · ● Live</span>
                            <h3 className="font-display text-2xl font-bold text-ghost tracking-tight mt-3 mb-3">{agent.name}</h3>
                            <p className="text-[0.92rem] text-ghost-dim leading-relaxed mb-5 max-w-md">{agent.desc}</p>
                            <ul className="flex flex-col gap-2.5 mb-7">
                                {agent.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-[0.86rem] text-ghost-dim"><ArrowRight size={14} className="text-accent shrink-0 mt-0.5" />{f}</li>
                                ))}
                            </ul>
                            <button
                                onClick={handleCta}
                                disabled={status === 'connecting' && agent.cta === 'voice'}
                                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full btn-grad-red text-white font-semibold text-[0.84rem] cursor-pointer disabled:opacity-60"
                            >
                                {agent.cta === 'voice' ? (status === 'connected' ? <PhoneOff size={15} /> : <Mic size={15} />) : null}
                                {ctaLabel}
                                {agent.cta !== 'voice' && <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                            </button>
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
