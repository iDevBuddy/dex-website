'use client'
import { ArrowRight } from 'lucide-react'

const glass = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 44px -20px rgba(0,0,0,0.75)',
}

/* ── bespoke micro-visualizations ───────────────────────────────────── */
function AreaTrend() {
    return (
        <svg viewBox="0 0 240 90" preserveAspectRatio="none" className="w-full h-24">
            <defs>
                <linearGradient id="bn-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="1" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>
            <path d="M0,28 C50,34 80,44 120,52 C160,60 200,66 240,74 L240,90 L0,90 Z" fill="url(#bn-area)" />
            <path id="bn-trend" d="M0,28 C50,34 80,44 120,52 C160,60 200,66 240,74" stroke="#fff" strokeWidth="2" fill="none" strokeOpacity="0.9" vectorEffect="non-scaling-stroke" />
            <circle r="3.5" fill="#fff">
                <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto"><mpath href="#bn-trend" /></animateMotion>
            </circle>
        </svg>
    )
}

function Bars() {
    const hs = [42, 60, 50, 74, 62, 88]
    return (
        <div className="flex items-end gap-1.5 h-16 w-full">
            {hs.map((h, i) => (
                <span key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${h}%`, background: i === hs.length - 1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)' }} />
            ))}
        </div>
    )
}

function Radar() {
    return (
        <div className="relative w-[4.5rem] h-[4.5rem]">
            <svg viewBox="0 0 80 80" className="slow-spin absolute inset-0 w-full h-full">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                <path d="M40 6 A34 34 0 0 1 74 40" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-extrabold text-white">24/7</span>
        </div>
    )
}

function Spark() {
    return (
        <svg viewBox="0 0 200 60" className="w-full h-14">
            <path id="bn-spark" d="M0,48 L40,34 L80,40 L120,18 L160,26 L200,6" stroke="#fff" strokeWidth="2" fill="none" strokeOpacity="0.9" />
            <circle r="3" fill="#fff">
                <animateMotion dur="3.6s" repeatCount="indefinite"><mpath href="#bn-spark" /></animateMotion>
            </circle>
        </svg>
    )
}

function Gauge() {
    return (
        <svg viewBox="0 0 120 66" className="w-24 h-14">
            <path d="M8,60 A52,52 0 0,1 112,60" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="8" strokeLinecap="round" />
            <path d="M8,60 A52,52 0 0,1 98,24" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </svg>
    )
}

function Cell({ className = '', style, children, delay = 0 }) {
    return (
        <div
            className={`reveal-up relative overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5 ${className}`}
            style={{ ...glass, ...style, animationDelay: `${delay}s` }}
        >
            <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            {children}
        </div>
    )
}

export default function Benefits() {
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section id="benefits" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div
                    className="relative rounded-[26px] overflow-hidden p-7 sm:p-10 lg:p-14"
                    style={{ background: 'radial-gradient(120% 130% at 85% 0%, #C40322 0%, #8E0119 48%, #5C0212 100%)' }}
                >
                    <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)' }} />
                    <div className="dex-grain-overlay opacity-30" />
                    <div className="float-orb absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%)' }} />

                    {/* header */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                        <div className="max-w-2xl">
                            <span className="flex items-center gap-2.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/80 mb-6">
                                <span className="w-2.5 h-2.5 bg-white" /> Why Automate
                            </span>
                            <h2 className="font-display text-3xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white tracking-tightest leading-[1.0]">
                                What AI agents can do <span className="text-white/55">for your business</span>
                            </h2>
                        </div>
                        <button
                            onClick={openChatbot}
                            className="group relative overflow-hidden inline-flex items-center gap-3 px-6 py-3.5 rounded-full font-semibold text-[0.84rem] text-white transition-all duration-300 hover:shadow-[0_0_34px_-4px_rgba(255,255,255,0.55)] cursor-pointer shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(14px) saturate(1.5)', WebkitBackdropFilter: 'blur(14px) saturate(1.5)', boxShadow: 'inset 0 1px 0.5px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(255,255,255,0.12), 0 10px 26px -8px rgba(0,0,0,0.5)' }}
                        >
                            <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                            Book free consultation
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* asymmetric bento */}
                    <div className="relative z-10 grid md:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)]">
                        {/* HERO — cost reduction */}
                        <Cell className="md:col-span-2 md:row-span-2 flex flex-col justify-between" delay={0}>
                            <div>
                                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55 mb-3">Growth without added costs</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display text-6xl lg:text-7xl font-extrabold text-white tracking-tightest leading-none">30%</span>
                                    <span className="text-white/60 text-sm font-medium">avg. cost reduction</span>
                                </div>
                                <p className="text-[0.86rem] text-white/60 leading-relaxed mt-4 max-w-sm">
                                    Automate repetitive tasks and cut dependency on external tools — more output, less overhead.
                                </p>
                            </div>
                            <AreaTrend />
                        </Cell>

                        {/* operational efficiency */}
                        <Cell className="md:col-span-2 flex items-center justify-between gap-6" delay={0.08}>
                            <div className="max-w-[14rem]">
                                <h3 className="font-display text-[1.05rem] font-bold text-white tracking-tight mb-2">Operational efficiency at scale</h3>
                                <p className="text-[0.82rem] text-white/60 leading-relaxed">Connect tools, streamline processes, remove bottlenecks.</p>
                            </div>
                            <div className="w-32 shrink-0"><Bars /></div>
                        </Cell>

                        {/* 24/7 */}
                        <Cell className="flex flex-col justify-between" delay={0.16}>
                            <Radar />
                            <div>
                                <h3 className="font-display text-[0.98rem] font-bold text-white tracking-tight mt-3">Around-the-clock</h3>
                                <p className="text-[0.78rem] text-white/55 leading-snug mt-1">Always responsive, zero downtime.</p>
                            </div>
                        </Cell>

                        {/* data-driven */}
                        <Cell className="flex flex-col justify-between" delay={0.24}>
                            <Spark />
                            <div>
                                <h3 className="font-display text-[0.98rem] font-bold text-white tracking-tight mt-2">Data-driven decisions</h3>
                                <p className="text-[0.78rem] text-white/55 leading-snug mt-1">Real-time insights & forecasting.</p>
                            </div>
                        </Cell>

                        {/* CX gauge */}
                        <Cell className="md:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6" delay={0.32}>
                            <div className="max-w-md">
                                <h3 className="font-display text-[1.1rem] font-bold text-white tracking-tight mb-2">Enhanced customer experience</h3>
                                <p className="text-[0.84rem] text-white/60 leading-relaxed">Predict needs and deliver timely, personalized responses that lift satisfaction and retention.</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <Gauge />
                                <div>
                                    <p className="font-display text-2xl font-extrabold text-white leading-none">+54%</p>
                                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/50 mt-1.5">satisfaction lift</p>
                                </div>
                            </div>
                        </Cell>
                    </div>
                </div>
            </div>
        </section>
    )
}
