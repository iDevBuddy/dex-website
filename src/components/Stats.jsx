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
            if (current >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(current))
        }, 24)
        return () => clearInterval(timer)
    }, [start, target])
    return <span>{count}</span>
}

const stats = [
    { number: 50, text: 'of business decisions will be augmented or automated by AI agents by 2027.', source: 'Gartner', url: 'https://www.gartner.com' },
    { number: 86, text: 'of executives say AI agents will make workflow automation more effective.', source: 'IBM', url: 'https://www.ibm.com' },
    { number: 66, text: 'of businesses using AI agents report higher productivity and lower costs.', source: 'PwC', url: 'https://www.pwc.com' },
]

export default function Stats() {
    const sectionRef = useRef(null)
    const itemsRef = useRef([])
    const [counting, setCounting] = useState(false)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(itemsRef.current, {
                y: 36,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 72%',
                    onEnter: () => setCounting(true),
                },
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-dark py-20 lg:py-28">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <span className="eyebrow mb-5">By the Numbers</span>
                        <h2 data-reveal className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-ghost tracking-tightest leading-[1.04] max-w-xl">
                            The shift to autonomous AI is already happening.
                        </h2>
                    </div>
                    <a href="/#pipeline" className="group flex items-center gap-2 text-[0.8rem] font-semibold text-ghost shrink-0">
                        <span className="dotted-rule w-10 text-accent" />
                        See it in action
                        <ArrowUpRight size={15} className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </div>

                <div className="grid md:grid-cols-3 gap-y-10 gap-x-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            ref={(el) => (itemsRef.current[i] = el)}
                            className={`flex flex-col ${i > 0 ? 'md:pl-8 md:border-l md:border-border' : ''}`}
                        >
                            <div className="font-display text-6xl lg:text-7xl font-extrabold text-ghost tracking-tightest leading-none flex items-baseline">
                                <Counter target={stat.number} start={counting} />
                                <span className="text-accent">%</span>
                            </div>
                            <div className="dotted-rule w-full text-border my-6" />
                            <p className="text-[0.95rem] text-ghost-dim leading-relaxed mb-5 max-w-[34ch]">{stat.text}</p>
                            <a
                                href={stat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto inline-flex items-center gap-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ghost-faint hover:text-accent transition-colors group/src"
                            >
                                Source: {stat.source}
                                <ArrowUpRight size={13} className="group-hover/src:text-accent group-hover/src:-translate-y-0.5 group-hover/src:translate-x-0.5 transition-all" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
