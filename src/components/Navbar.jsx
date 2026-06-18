'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Network, Wrench, BarChart2, Activity, MessageSquare } from 'lucide-react'

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [active, setActive] = useState('pipeline')
    const [hovered, setHovered] = useState(null)

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

    return (
        <motion.nav
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4"
        >
            {/* ── Apple-grade liquid glass bar ──────────────────────────────
                Real vibrancy = heavy backdrop blur + saturation, a bright
                specular rim (inset top highlight), and a top-lit sheen. */}
            <div
                className="relative w-full max-w-[860px] rounded-full backdrop-blur-2xl backdrop-saturate-150 border border-white/10"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 38%, rgba(255,255,255,0.015))',
                    boxShadow:
                        'inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 1px rgba(255,255,255,0.06), 0 16px 40px -12px rgba(0,0,0,0.65)',
                }}
            >
                {/* top sheen highlight */}
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                <div className="relative flex items-center justify-between pl-5 pr-2.5 py-2">
                    <a href="/" className="font-display text-[0.95rem] font-bold text-ghost tracking-tight flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                        </span>
                        DEX
                    </a>

                    {/* Links with icon + label; glass pill rides active/hovered */}
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
                                        lit ? 'text-ghost' : 'text-ghost-dim'
                                    }`}
                                >
                                    {lit && (
                                        <motion.span
                                            layoutId="nav-glass-pill"
                                            className="absolute inset-0 rounded-full -z-0"
                                            style={{
                                                background:
                                                    'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.02))',
                                                backdropFilter: 'blur(8px) saturate(1.6)',
                                                WebkitBackdropFilter: 'blur(8px) saturate(1.6)',
                                                boxShadow:
                                                    'inset 0 1px 0.5px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(255,255,255,0.08), 0 6px 18px -4px rgba(0,0,0,0.45)',
                                            }}
                                            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                                        >
                                            {/* soft red under-glow for the active accent */}
                                            <span className="absolute inset-0 rounded-full bg-accent/10 mix-blend-screen" />
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-accent/70 blur-[6px]" />
                                        </motion.span>
                                    )}
                                    <Icon
                                        size={14}
                                        strokeWidth={2.2}
                                        className={`relative z-10 transition-colors duration-300 ${lit ? 'text-accent' : ''}`}
                                    />
                                    <span className="relative z-10">{l.label}</span>
                                </a>
                            )
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-2 shrink-0">
                        <button
                            onClick={openChatbot}
                            className="text-[0.8rem] font-medium text-ghost-dim hover:text-ghost transition-colors duration-300 cursor-pointer px-2"
                        >
                            Live Demo
                        </button>
                        <a
                            href="/#contact"
                            className="group relative px-5 py-2.5 rounded-full text-[0.8rem] font-semibold text-ghost border border-white/15 transition-all duration-300 hover:border-accent hover:shadow-[0_0_24px_-3px_rgba(255,79,100,0.65)]"
                        >
                            Book a Call
                        </a>
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-ghost-dim hover:text-ghost transition-colors cursor-pointer p-1.5 rounded-full"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden absolute top-full left-4 right-4 mt-2 dex-glass rounded-3xl p-5 flex flex-col gap-1 shadow-2xl"
                    >
                        {links.map((l) => {
                            const Icon = l.icon
                            return (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => { setActive(l.id); setMobileOpen(false) }}
                                    className="flex items-center gap-3 text-sm font-medium text-ghost-dim hover:text-ghost hover:bg-white/[0.04] transition-colors py-2.5 px-3 rounded-xl group"
                                >
                                    <Icon size={16} strokeWidth={2.2} className="group-hover:text-accent transition-colors" />
                                    {l.label}
                                </a>
                            )
                        })}
                        <div className="h-px bg-white/[0.06] my-2" />
                        <button
                            onClick={() => { openChatbot(); setMobileOpen(false) }}
                            className="flex items-center gap-3 text-sm font-medium text-ghost-dim hover:text-ghost transition-colors text-left py-2.5 px-3 rounded-xl cursor-pointer group"
                        >
                            <MessageSquare size={16} strokeWidth={2.2} className="group-hover:text-accent transition-colors" />
                            Live Demo
                        </button>
                        <a
                            href="/#contact"
                            onClick={() => setMobileOpen(false)}
                            className="mt-1 px-5 py-3 rounded-full text-sm font-semibold text-ghost border border-white/15 text-center hover:border-accent transition-colors"
                        >
                            Book a Call
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
