'use client'
import { Check, ArrowRight } from 'lucide-react'

const benefits = [
    {
        title: 'Operational efficiency at scale',
        desc: 'Integrate AI agents into your workflows to connect tools, streamline processes, and remove bottlenecks — reducing delays and improving execution speed.',
    },
    {
        title: 'Growth without added costs',
        desc: 'Automate repetitive tasks and reduce dependency on external tools, improving output without increasing overhead — saving costs by up to 30%.',
    },
    {
        title: 'Enhanced customer experience',
        desc: 'Track interactions, predict customer needs, and deliver timely, personalized responses that improve satisfaction and retention.',
    },
    {
        title: 'Around-the-clock availability',
        desc: 'Keep operations running with systems that work 24/7, maintaining responsiveness and service quality without extra workforce or downtime.',
    },
    {
        title: 'Data-driven decision making',
        desc: 'Analyze data in real time to generate actionable insights that improve forecasting, performance tracking, and business planning.',
    },
]

/* Decorative top-right orbital beacon — the section's focal vector */
function OrbitalVector() {
    return (
        <div className="absolute -top-28 -right-28 w-[34rem] h-[34rem] pointer-events-none">
            {/* soft bloom */}
            <div
                className="float-orb absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 42%, transparent 68%)' }}
            />
            {/* rotating orbit rings + radiating ticks */}
            <svg viewBox="0 0 400 400" className="slow-spin absolute inset-0 w-full h-full" fill="none">
                <circle cx="200" cy="200" r="70" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="200" cy="200" r="120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="200" cy="200" r="170" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 6" />
                {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i / 24) * Math.PI * 2
                    const x1 = 200 + Math.cos(a) * 174
                    const y1 = 200 + Math.sin(a) * 174
                    const x2 = 200 + Math.cos(a) * 186
                    const y2 = 200 + Math.sin(a) * 186
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                })}
                {/* orbiting nodes */}
                <circle cx="200" cy="30" r="4" fill="#fff" />
                <circle cx="370" cy="200" r="3" fill="rgba(255,255,255,0.7)" />
            </svg>
            {/* counter-rotating inner ring */}
            <svg viewBox="0 0 400 400" className="slow-spin-rev absolute inset-0 w-full h-full" fill="none">
                <circle cx="200" cy="200" r="44" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 5" />
                <circle cx="244" cy="200" r="3.5" fill="#fff" />
            </svg>
            {/* glowing core */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white blur-[6px]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white" />
        </div>
    )
}

export default function Benefits() {
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section id="benefits" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div
                    className="relative rounded-[26px] overflow-hidden p-7 sm:p-10 lg:p-16"
                    style={{ background: 'radial-gradient(120% 130% at 85% 0%, #C40322 0%, #8E0119 48%, #5C0212 100%)' }}
                >
                    {/* depth vignette */}
                    <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.45)' }} />
                    <div className="dex-grain-overlay opacity-35" />
                    <OrbitalVector />

                    {/* header */}
                    <div className="relative z-10 max-w-2xl mb-14">
                        <span className="flex items-center gap-2.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/80 mb-6">
                            <span className="w-2.5 h-2.5 bg-white" />
                            Why Automate
                        </span>
                        <h2 className="font-display text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tightest leading-[1.0]">
                            What AI agents can do <span className="text-white/55">for your business</span>
                        </h2>
                    </div>

                    {/* benefits grid */}
                    <div className="relative z-10 grid md:grid-cols-3 gap-5">
                        {benefits.map((b, i) => (
                            <div
                                key={i}
                                className="reveal-up group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.08), 0 16px 40px -18px rgba(0,0,0,0.7)',
                                    animationDelay: `${i * 0.08}s`,
                                }}
                            >
                                {/* top specular sheen */}
                                <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                                {/* index */}
                                <span className="absolute top-5 right-6 font-mono text-[0.6rem] tracking-[0.2em] text-white/35">{String(i + 1).padStart(2, '0')}</span>

                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
                                        style={{ background: 'rgba(255,255,255,0.16)', boxShadow: 'inset 0 1px 0.5px rgba(255,255,255,0.6)' }}
                                    >
                                        <Check size={13} strokeWidth={3} className="text-white" />
                                    </span>
                                    <h3 className="font-display text-[1.05rem] font-bold text-white tracking-tight leading-tight">{b.title}</h3>
                                </div>
                                <p className="text-[0.86rem] text-white/65 leading-relaxed">{b.desc}</p>
                            </div>
                        ))}

                        {/* CTA cell */}
                        <div className="reveal-up rounded-2xl p-7 flex flex-col justify-center" style={{ animationDelay: `${benefits.length * 0.08}s` }}>
                            <h3 className="font-display text-2xl font-extrabold text-white tracking-tight mb-5">Start today</h3>
                            <button
                                onClick={openChatbot}
                                className="group relative overflow-hidden inline-flex items-center justify-between gap-3 w-full px-6 py-4 rounded-full font-semibold text-[0.86rem] text-white transition-all duration-300 hover:shadow-[0_0_32px_-4px_rgba(255,255,255,0.5)] cursor-pointer"
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(14px) saturate(1.5)',
                                    WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
                                    boxShadow: 'inset 0 1px 0.5px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(255,255,255,0.12), 0 10px 26px -8px rgba(0,0,0,0.5)',
                                }}
                            >
                                <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                                Book free consultation
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
