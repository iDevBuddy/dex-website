'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HEADLINE = ['Build', 'autonomous', 'agents', 'that', 'run', 'your', 'business.']

export default function Hero() {
    const root = useRef(null)
    const wordRefs = useRef([])
    const headlineWrap = useRef(null)
    const wireframe = useRef(null)

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ── Entrance: words rise from translateY(50px) + fade in ───────
            gsap.set(wordRefs.current, { y: 50, opacity: 0 })
            gsap.to(wordRefs.current, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.08,
                ease: 'power3.out', // premium cubic-bezier feel
                delay: 0.15,
            })

            // Badge + subcopy + CTA cascade
            gsap.from('[data-hero-fade]', {
                y: 18,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                delay: 0.55,
            })

            // Wireframe whole-block fade-in
            gsap.from(wireframe.current, {
                opacity: 0,
                duration: 1.6,
                ease: 'power2.out',
            })

            // ── Parallax: headline travels up faster than the wireframe ───
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                gsap.to(headlineWrap.current, {
                    yPercent: -28,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: root.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                })
                gsap.to(wireframe.current, {
                    yPercent: -8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: root.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                })
            }
        }, root)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={root}
            className="relative min-h-screen flex items-center bg-dark overflow-hidden pt-28 pb-16"
        >
            {/* Faint blueprint grid */}
            <div className="absolute inset-0 dex-void-grid pointer-events-none" />
            {/* Soft red ambience anchored to the node cluster */}
            <div
                className="absolute top-1/3 right-[8%] w-[36rem] h-[36rem] rounded-full pointer-events-none blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(255,79,100,0.08), transparent 70%)' }}
            />

            {/* ── Abstract automation wireframe (right / background) ──────── */}
            <div
                ref={wireframe}
                className="absolute inset-y-0 right-0 w-full lg:w-[62%] pointer-events-none select-none"
                aria-hidden="true"
            >
                <svg viewBox="0 0 800 600" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.2" result="b" />
                            <feMerge>
                                <feMergeNode in="b" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="lineFade" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
                        </linearGradient>
                    </defs>

                    {/* Pipeline paths — ultra-thin, muted */}
                    <g stroke="url(#lineFade)" strokeWidth="1">
                        <path id="flowA" d="M120,120 C260,120 260,300 420,300 C560,300 560,180 700,180" />
                        <path id="flowB" d="M120,300 C240,300 240,440 400,440 C540,440 560,300 700,300" />
                        <path id="flowC" d="M120,480 C300,480 320,300 480,300 C600,300 620,420 700,420" />
                        <path d="M420,300 L420,180" stroke="rgba(255,255,255,0.05)" />
                        <path d="M480,300 L480,420" stroke="rgba(255,255,255,0.05)" />
                    </g>

                    {/* Nodes (junctions) */}
                    <g>
                        {[
                            [120, 120], [120, 300], [120, 480],
                            [420, 300], [480, 300], [400, 440],
                            [700, 180], [700, 300], [700, 420],
                        ].map(([cx, cy], i) => (
                            <g key={i}>
                                <rect
                                    x={cx - 9} y={cy - 9} width="18" height="18" rx="4"
                                    fill="#0D0D0F" stroke="rgba(255,255,255,0.14)" strokeWidth="1"
                                />
                                <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.35)" />
                            </g>
                        ))}
                    </g>

                    {/* Glowing red dots travelling the pipelines = live data extraction */}
                    <g filter="url(#redGlow)">
                        <circle r="3.4" fill="#FF4F64">
                            <animateMotion dur="5.5s" repeatCount="indefinite" rotate="auto">
                                <mpath href="#flowA" />
                            </animateMotion>
                        </circle>
                        <circle r="3.4" fill="#FF4F64">
                            <animateMotion dur="6.5s" begin="1.2s" repeatCount="indefinite">
                                <mpath href="#flowB" />
                            </animateMotion>
                        </circle>
                        <circle r="3.4" fill="#FF4F64">
                            <animateMotion dur="7s" begin="2.4s" repeatCount="indefinite">
                                <mpath href="#flowC" />
                            </animateMotion>
                        </circle>
                    </g>
                </svg>
            </div>

            {/* ── Left: typography ─────────────────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                <div ref={headlineWrap} className="max-w-2xl">
                    <div
                        data-hero-fade
                        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-accent/5 border border-accent/20 mb-9"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="font-mono text-[0.6rem] font-semibold tracking-[0.28em] uppercase text-accent">
                            AI Agent Engineering Lab
                        </span>
                    </div>

                    <h1 className="font-display font-bold text-ghost text-4xl sm:text-6xl lg:text-[4.4rem] leading-[0.98] tracking-tightest mb-8">
                        {HEADLINE.map((word, i) => (
                            <span
                                key={i}
                                ref={(el) => (wordRefs.current[i] = el)}
                                className="inline-block mr-[0.22em] will-change-transform"
                            >
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p data-hero-fade className="text-[0.95rem] sm:text-base text-ghost-dim leading-relaxed max-w-lg mb-10">
                        We design, integrate, and deploy custom AI voice agents and validated lead
                        workflows — production-ready systems built on verified infrastructure, not templates.
                    </p>

                    <div data-hero-fade className="flex flex-wrap gap-3.5 items-center">
                        <button
                            onClick={openChatbot}
                            className="px-7 py-3.5 bg-[#111111] border border-accent text-ghost font-semibold text-[0.82rem] rounded-xl transition-all duration-300 hover:bg-accent/[0.08] hover:shadow-[0_0_28px_-4px_rgba(255,79,100,0.7)] cursor-pointer"
                        >
                            Start Consultation
                        </button>
                        <a
                            href="/#pipeline"
                            className="px-7 py-3.5 border border-white/15 text-ghost font-semibold text-[0.82rem] rounded-xl text-center transition-all duration-300 hover:border-white/30 hover:bg-white/[0.03]"
                        >
                            View Active Projects
                        </a>
                    </div>

                    <div data-hero-fade className="mt-14 pt-7 border-t border-white/[0.07] flex items-center gap-9">
                        {[
                            ['50+', 'Agents Deployed'],
                            ['24/7', 'Orchestration'],
                            ['3.8x', 'Average ROI'],
                        ].map(([n, label], i) => (
                            <div key={i} className="flex items-center gap-9">
                                {i > 0 && <span className="w-px h-8 bg-white/10 -ml-9" />}
                                <div>
                                    <p className="font-mono text-2xl font-bold text-ghost">{n}</p>
                                    <p className="font-mono text-[0.56rem] tracking-[0.2em] uppercase text-ghost-faint mt-1.5">
                                        {label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
