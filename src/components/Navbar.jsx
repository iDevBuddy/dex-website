'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Network, Wrench, BarChart2, Activity, MessageSquare, ArrowUpRight } from 'lucide-react'

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [active, setActive] = useState('pipeline')
    const [hovered, setHovered] = useState(null)

    useEffect(() => {
        const ids = ['pipeline', 'services', 'benefits', 'process']
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
        { label: 'Impact', href: '/#benefits', id: 'benefits', icon: BarChart2 },
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
            <div className="w-full max-w-[860px] rounded-full bg-white border border-black/[0.07] pl-5 pr-2 py-2 flex items-center justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]">
                {/* wordmark with red square */}
                <a href="/" className="font-display text-[0.95rem] font-extrabold text-ghost tracking-tight flex items-center gap-2 shrink-0">
                    <span className="w-2.5 h-2.5 bg-accent" />
                    DEX
                </a>

                {/* links: icon + label, sliding red-tint active pill */}
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
                                    lit ? 'text-accent' : 'text-ghost-dim'
                                }`}
                            >
                                {lit && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="absolute inset-0 rounded-full -z-0 bg-accent/[0.07] border border-accent/15"
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
                        className="text-[0.8rem] font-medium text-ghost-dim hover:text-ghost transition-colors duration-300 cursor-pointer px-3"
                    >
                        Live Demo
                    </button>
                    <a
                        href="/#contact"
                        className="group flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.8rem] font-semibold text-white bg-accent hover:bg-accent-hover transition-colors duration-300"
                    >
                        Book a Call
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white border border-black/[0.07] rounded-3xl p-5 flex flex-col gap-1 shadow-xl"
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
                        <a
                            href="/#contact"
                            onClick={() => setMobileOpen(false)}
                            className="mt-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-sm font-semibold text-white bg-accent text-center hover:bg-accent-hover transition-colors"
                        >
                            Book a Call
                            <ArrowUpRight size={15} />
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
