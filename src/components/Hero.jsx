'use client'
import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HEAD_A = ['Build', 'autonomous', 'agents']
const HEAD_B = ['that', 'run', 'your', 'business.']

export default function Hero() {
    const root = useRef(null)
    const wordRefs = useRef([])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(wordRefs.current, { yPercent: 115, opacity: 0 })
            gsap.to(wordRefs.current, {
                yPercent: 0,
                opacity: 1,
                duration: 1.1,
                stagger: 0.06,
                ease: 'expo.out',
                delay: 0.2,
            })
            gsap.from('[data-fade]', {
                y: 16,
                opacity: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.7,
            })
        }, root)
        return () => ctx.revert()
    }, [])

    let wi = 0
    const Word = ({ children, faded }) => (
        <span className="inline-block overflow-hidden align-bottom pb-[0.06em] mr-[0.2em]">
            <span
                ref={(el) => (wordRefs.current[wi++] = el)}
                className={`inline-block ${faded ? 'text-white/40' : 'text-white'}`}
            >
                {children}
            </span>
        </span>
    )

    return (
        <section ref={root} className="bg-dark px-4 sm:px-6 pt-24 pb-6">
            <div className="max-w-[1320px] mx-auto">
                <div className="relative rounded-[26px] bg-night overflow-hidden flex flex-col justify-between min-h-[88vh] p-7 sm:p-10 lg:p-14">
                    {/* texture + ambient */}
                    <div className="dex-grain-overlay opacity-60" />
                    <div
                        className="absolute -right-32 -top-24 w-[42rem] h-[42rem] rounded-full pointer-events-none blur-[120px]"
                        style={{ background: 'radial-gradient(circle, rgba(221,4,38,0.18), transparent 70%)' }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.06]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                            backgroundSize: '70px 70px',
                            maskImage: 'radial-gradient(ellipse 70% 70% at 80% 20%, black, transparent 70%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 80% 20%, black, transparent 70%)',
                        }}
                    />

                    {/* top row */}
                    <div data-fade className="relative z-10 flex items-start justify-between">
                        <span className="eyebrow eyebrow-light">Next-Gen AI Agency</span>
                        <span className="hidden sm:block font-mono text-[0.62rem] tracking-[0.22em] uppercase text-white/40 text-right leading-relaxed">
                            Voice · Chat · Workflow<br />Autonomous Agents
                        </span>
                    </div>

                    {/* headline + bottom row */}
                    <div className="relative z-10 mt-auto">
                        <h1 className="font-display font-extrabold text-white tracking-tightest leading-[0.94] text-[2.6rem] sm:text-6xl lg:text-[5.2rem] max-w-[14ch]">
                            {HEAD_A.map((w, i) => <Word key={`a${i}`}>{w}</Word>)}
                            <br />
                            {HEAD_B.map((w, i) => <Word key={`b${i}`} faded={i >= 1}>{w}</Word>)}
                        </h1>

                        <div className="mt-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-t border-white/10 pt-7">
                            {/* service markers */}
                            <div data-fade className="flex flex-wrap gap-x-8 gap-y-2">
                                {['Voice Agents', 'Workflow Automation', 'Lead Systems'].map((m) => (
                                    <span key={m} className="flex items-center gap-2 text-[0.82rem] text-white/65">
                                        <span className="text-accent font-semibold">+</span>
                                        {m}
                                    </span>
                                ))}
                            </div>

                            {/* subcopy + CTAs */}
                            <div data-fade className="flex flex-col items-start lg:items-end gap-4">
                                <p className="text-[0.82rem] text-white/55 leading-relaxed max-w-xs lg:text-right">
                                    Custom AI voice agents & validated lead workflows — built on verified infrastructure, not templates.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={openChatbot}
                                        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-semibold text-[0.82rem] transition-colors hover:bg-accent-hover cursor-pointer"
                                    >
                                        Start Consultation
                                        <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                    <a
                                        href="/#pipeline"
                                        className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/25 text-white font-semibold text-[0.82rem] transition-colors hover:border-white/60"
                                    >
                                        View Pipeline
                                        <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
