'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Network, Wrench, BarChart2, Activity, MessageSquare, ArrowUpRight } from 'lucide-react'

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [active, setActive] = useState('pipeline')
    const [hovered, setHovered] = useState(null)
    const [scrolled, setScrolled] = useState(false)
    const [overDark, setOverDark] = useState(true) // hero is the Night block → start dark

    // Sense the luminance of whatever sits behind the bar and flip the glass
    // between light (dark text) and dark (light text). This is what makes the
    // glass adapt the way Apple's chrome does over mixed-brightness content.
    useEffect(() => {
        let raf = null
        const sample = () => {
            raf = null
            setScrolled(window.scrollY > 12)
            const x = window.innerWidth / 2
            const y = 64 // a touch below the floating bar
            const stack = document.elementsFromPoint(x, y)
            let node = stack.find((el) => !el.closest('nav')) || null
            let rgb = null
            while (node && node !== document.documentElement) {
                const c = getComputedStyle(node).backgroundColor
                const m = c && c.match(/[\d.]+/g)
                if (m && m.length >= 3 && (m[3] === undefined || Number(m[3]) > 0.3)) {
                    rgb = m.map(Number)
                    break
                }
                node = node.parentElement
            }
            if (!rgb) {
                const m = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)
                rgb = m ? m.map(Number) : [255, 255, 255]
            }
            const lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
            setOverDark(lum < 130)
        }
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(sample) }
        sample()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [])

    useEffect(() => {
        const ids = ['pipeline', 'services', 'impact', 'process']
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
            { rootMargin: '-45% 0px -50% 0px' }
        )
        ids.forEach((id) => {
            const el = document.getElementById(id)
            if (el) obs.observe(el)
        })
        return () => obs.disconnect()
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const links = [
        { label: 'Pipeline', href: '/#pipeline', id: 'pipeline', icon: Network },
        { label: 'Services', href: '/#services', id: 'services', icon: Wrench },
        { label: 'Impact', href: '/#impact', id: 'impact', icon: BarChart2 },
        { label: 'Process', href: '/#process', id: 'process', icon: Activity },
        { label: 'Blog', href: '/blog', id: 'blog', icon: MessageSquare },
    ]

    const highlight = hovered ?? active
    const idleText = overDark ? 'text-white/80' : 'text-[#3f3f46]'
    const hoverText = overDark ? 'hover:text-white' : 'hover:text-ghost'

    return (
        <>
            {/* SVG lens — turbulence + displacement warps the backdrop so the
                background visibly refracts through the glass (the real Apple
                Liquid Glass tell, not a flat blur). Rendered once, off-screen. */}
            <svg width="0" height="0" className="absolute" aria-hidden="true" style={{ position: 'absolute' }}>
                <filter id="liquidGlass" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
                    <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="11" result="noise" />
                    <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
                    <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>

            <motion.nav
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div className={`relative overflow-hidden w-full max-w-[860px] rounded-full pl-5 pr-2 py-2 nav-glass ${overDark ? 'nav-glass--dark' : 'nav-glass--light'} ${scrolled ? 'is-scrolled' : ''}`}>
                    {/* specular sheen + lens rim */}
                    <span className="nav-glass__shine" aria-hidden="true" />

                    <div className="relative z-10 flex items-center justify-between">
                        {/* wordmark with red square */}
                        <a href="/" className={`font-display text-[0.95rem] font-extrabold tracking-tight flex items-center gap-2 shrink-0 transition-colors duration-500 ${overDark ? 'text-white' : 'text-ghost'}`}>
                            <span className="w-2.5 h-2.5 bg-accent" />
                            DEX
                        </a>

                        {/* links: icon + label, sliding glass-key active pill */}
                        <div className="hidden md:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
                            {links.map((l) => {
                                const Icon = l.icon
                                const lit = highlight === l.id
                                return (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        onMouseEnter={() => setHovered(l.id)}
                                        onClick={() => setActive(l.id)}
                                        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[0.8rem] font-medium transition-colors duration-300 ${
                                            lit ? 'text-accent' : idleText
                                        }`}
                                    >
                                        {lit && (
                                            <motion.span
                                                layoutId="nav-pill"
                                                className="absolute inset-0 rounded-full -z-0 bg-white/80 border border-accent/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_14px_-4px_rgba(221,4,38,0.30)]"
                                                transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                                            />
                                        )}
                                        <Icon size={14} strokeWidth={2.2} className="relative z-10" />
                                        <span className="relative z-10">{l.label}</span>
                                    </a>
                                )
                            })}
                        </div>

                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={openChatbot}
                                className={`text-[0.8rem] font-medium transition-colors duration-300 cursor-pointer px-3 ${idleText} ${hoverText}`}
                            >
                                Live Demo
                            </button>
                            <button
                                onClick={openChatbot}
                                className="group flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.8rem] font-semibold text-white btn-grad-red cursor-pointer"
                            >
                                Book a Call
                                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={`md:hidden transition-colors cursor-pointer p-1.5 rounded-full ${idleText} ${hoverText}`}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/85 backdrop-blur-2xl border border-black/[0.07] rounded-3xl p-5 flex flex-col gap-1 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.30)]"
                        >
                            {links.map((l) => {
                                const Icon = l.icon
                                return (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => { setActive(l.id); setMobileOpen(false) }}
                                        className="flex items-center gap-3 text-sm font-medium text-ghost-dim hover:text-accent hover:bg-accent/[0.05] transition-colors py-2.5 px-3 rounded-xl group"
                                    >
                                        <Icon size={16} strokeWidth={2.2} className="group-hover:text-accent transition-colors" />
                                        {l.label}
                                    </a>
                                )
                            })}
                            <div className="h-px bg-black/[0.07] my-2" />
                            <button
                                onClick={() => { openChatbot(); setMobileOpen(false) }}
                                className="flex items-center gap-3 text-sm font-medium text-ghost-dim hover:text-accent transition-colors text-left py-2.5 px-3 rounded-xl cursor-pointer"
                            >
                                <MessageSquare size={16} strokeWidth={2.2} />
                                Live Demo
                            </button>
                            <button
                                onClick={() => { openChatbot(); setMobileOpen(false) }}
                                className="mt-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-sm font-semibold text-white text-center btn-grad-red cursor-pointer"
                            >
                                Book a Call
                                <ArrowUpRight size={15} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    )
}
