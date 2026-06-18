'use client'
import { useRef, useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Counter({ target, start }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!start) return
        let current = 0
        const increment = Math.max(1, target / 45)
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, 24)
        return () => clearInterval(timer)
    }, [start, target])

    return <span className="text-ghost">{count}</span>
}

const stats = [
    { number: 50, text: 'of business decisions will be augmented or automated by AI Agents by 2027.', source: 'Gartner', url: 'https://www.gartner.com' },
    { number: 86, text: 'of executives say AI agents will make workflow automation more effective by 2027.', source: 'IBM', url: 'https://www.ibm.com' },
    { number: 66, text: 'of businesses report higher productivity, 57% see cost savings, and 54% improve CX using AI agents.', source: 'PwC', url: 'https://www.pwc.com' },
]

export default function Stats() {
    const sectionRef = useRef(null)
    const cardsRef = useRef([])
    const [counting, setCounting] = useState(false)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardsRef.current, {
                y: 36,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    onEnter: () => setCounting(true),
                },
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="relative py-24 bg-dark border-y border-white/[0.05] overflow-hidden">
            {/* Barely-there blueprint grid — only felt, not seen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="relative w-full max-w-sm mx-auto flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                            style={{
                                background: 'rgba(10,11,14,0.4)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                boxShadow:
                                    'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 4px 24px -8px rgba(0,0,0,0.8)',
                            }}
                        >
                            {/* Vercel edge glow — soft elliptical bloom inside the top */}
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                                style={{ width: 100, height: 20, background: '#FF4F64', filter: 'blur(24px)', opacity: 0.15 }}
                            />
                            {/* hairline gradient edge */}
                            <div
                                className="absolute top-0 inset-x-0 h-px pointer-events-none"
                                style={{ background: 'linear-gradient(90deg, transparent, #FF4F64, transparent)' }}
                            />

                            <div className="p-8 text-left">
                                <div className="font-display font-bold text-6xl tracking-tightest leading-none mb-5 flex items-baseline">
                                    <Counter target={stat.number} start={counting} />
                                    <span className="text-accent ml-0.5">%</span>
                                </div>
                                <p className="text-[0.92rem] text-ghost-dim leading-relaxed">{stat.text}</p>
                            </div>

                            {/* Source footer — left label, arrow far right */}
                            <a
                                href={stat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto flex items-center justify-between px-8 py-4 border-t border-white/[0.05] group/src"
                            >
                                <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ghost-dim group-hover/src:text-ghost transition-colors">
                                    {stat.source}
                                </span>
                                <ArrowUpRight
                                    size={15}
                                    className="text-ghost-faint group-hover/src:text-accent group-hover/src:-translate-y-0.5 group-hover/src:translate-x-0.5 transition-all duration-300"
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
