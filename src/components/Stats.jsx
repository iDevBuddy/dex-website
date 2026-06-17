'use client'
import { useRef, useEffect, useState } from 'react'
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

    // Cursor-following spotlight
    const handleMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - r.top}px`)
    }

    return (
        <section ref={sectionRef} className="relative py-20 bg-dark border-y border-white/[0.06] overflow-hidden">
            {/* Blueprint / matrix grid — the blur target behind the smoked glass */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                }}
            />
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            onMouseMove={handleMove}
                            className="dex-spotlight-card group relative text-center p-10 rounded-2xl border border-white/[0.08] bg-[rgba(10,11,14,0.4)] backdrop-blur-[16px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/[0.14] hover:-translate-y-1 transition-[transform,border-color] duration-300"
                        >
                            {/* Subtle top accent line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent/40 rounded-full" />
                            <div className="relative z-[2] font-mono text-5xl font-bold mb-3">
                                <Counter target={stat.number} start={counting} />
                                <span className="text-accent">%</span>
                            </div>
                            <p className="relative z-[2] text-[0.92rem] text-ghost-dim leading-relaxed">{stat.text}</p>
                            <p className="relative z-[2] font-mono text-[0.72rem] text-ghost-faint mt-3">
                                <a href={stat.url} target="_blank" rel="noopener noreferrer" className="border-b border-white/10 hover:text-accent hover:border-accent/40 transition-colors">
                                    Source: {stat.source}
                                </a>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
