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

export default function Benefits() {
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section id="benefits" className="bg-dark px-4 sm:px-6 py-6">
            <div className="max-w-[1320px] mx-auto">
                <div
                    className="relative rounded-[26px] overflow-hidden p-7 sm:p-10 lg:p-16"
                    style={{ background: 'linear-gradient(140deg, #A50220 0%, #DD0426 55%, #E8112E 100%)' }}
                >
                    {/* atmospheric orb + grain */}
                    <div
                        className="float-orb absolute -right-24 -top-32 w-[40rem] h-[40rem] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 45%, transparent 70%)' }}
                    />
                    <div className="dex-grain-overlay opacity-40" />

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
                                className="reveal-up group rounded-2xl border border-white/20 bg-white/[0.02] p-7 transition-all duration-300 hover:border-white/45 hover:bg-white/[0.06]"
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className="flex items-center gap-2.5 mb-4">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white shrink-0">
                                        <Check size={12} strokeWidth={3} className="text-accent" />
                                    </span>
                                    <h3 className="font-display text-[1.05rem] font-bold text-white tracking-tight">{b.title}</h3>
                                </div>
                                <p className="text-[0.86rem] text-white/70 leading-relaxed">{b.desc}</p>
                            </div>
                        ))}

                        {/* CTA cell */}
                        <div className="reveal-up rounded-2xl p-7 flex flex-col justify-center" style={{ animationDelay: `${benefits.length * 0.08}s` }}>
                            <h3 className="font-display text-2xl font-extrabold text-white tracking-tight mb-5">Start today</h3>
                            <button
                                onClick={openChatbot}
                                className="group inline-flex items-center justify-between gap-3 w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-ghost font-semibold text-[0.84rem] transition-all duration-300 hover:gap-5 cursor-pointer"
                            >
                                Book free consultation
                                <ArrowRight size={16} className="text-accent transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
