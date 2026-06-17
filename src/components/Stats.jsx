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
    { number: 66, text: 'of businesses using AI agents report higher productivity, 57% see cost savings, and 54% improve customer experience.', source: 'PwC', url: 'https://www.pwc.com' },
]

export default function Stats() {
    const sectionRef = useRef(null)
    const cardsRef = useRef([])
    const [counting, setCounting] = useState(false)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardsRef.current, {
                y: 40,
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
        <section ref={sectionRef} className="relative py-24 bg-dark border-y border-white/[0.06] overflow-hidden">
            {/* Blueprint / matrix grid — backdrop for the smoked glass */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                }}
            />
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className={`group relative flex flex-col rounded-b-2xl border-x border-b border-white/[0.05] border-t-2 border-t-accent bg-[rgba(10,11,14,0.55)] backdrop-blur-[16px] shadow-[0_-4px_16px_-2px_rgba(255,79,100,0.15)] transition-transform duration-300 hover:-translate-y-1 ${
                                i === 1 ? 'md:-translate-y-8 md:hover:-translate-y-9' : ''
                            }`}
                        >
                            <div className="flex-1 p-9 text-center">
                                <div className="font-mono text-5xl font-bold mb-4 tracking-tight">
                                    <Counter target={stat.number} start={counting} />
                                    <span className="text-accent">%</span>
                                </div>
                                <p className="text-[0.92rem] text-ghost-dim leading-snug max-w-[24ch] mx-auto">
                                    {stat.text}
                                </p>
                            </div>

                            {/* Source verification footer */}
                            <a
                                href={stat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-9 py-4 border-t border-white/[0.05] group/src"
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
