import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [active, setActive] = useState('')

    // Track which section is in view to light its dot
    useEffect(() => {
        const ids = ['pipeline', 'services', 'impact', 'process']
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id)
                })
            },
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
        { label: 'Pipeline', href: '/#pipeline', id: 'pipeline' },
        { label: 'Services', href: '/#services', id: 'services' },
        { label: 'Impact', href: '/#impact', id: 'impact' },
        { label: 'Process', href: '/#process', id: 'process' },
        { label: 'Blog', href: '/blog', id: 'blog' },
    ]

    return (
        <motion.nav
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4"
        >
            {/* The Floating Pill */}
            <div className="dex-glass w-full max-w-[800px] rounded-full pl-5 pr-2.5 py-2.5 flex items-center justify-between shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)]">
                {/* Wordmark */}
                <a
                    href="/"
                    className="font-display text-[0.95rem] font-bold text-ghost tracking-tight flex items-center gap-2 shrink-0"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    DEX
                </a>

                {/* Desktop links — hover slides a red dot under the label */}
                <div className="hidden md:flex items-center gap-7">
                    {links.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className={`nav-link relative text-[0.8rem] font-medium text-ghost-dim transition-colors duration-300 py-1 ${
                                active === l.id ? 'is-active text-ghost' : ''
                            }`}
                        >
                            {l.label}
                            <span className="nav-dot" aria-hidden="true" />
                        </a>
                    ))}
                </div>

                {/* Ghost CTA — border turns red + glows on hover */}
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

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden text-ghost-dim hover:text-ghost transition-colors cursor-pointer p-1.5 rounded-full"
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden absolute top-full left-4 right-4 mt-2 dex-glass rounded-3xl p-6 flex flex-col gap-4 shadow-2xl"
                    >
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-ghost-dim hover:text-ghost transition-colors py-1"
                            >
                                {l.label}
                            </a>
                        ))}
                        <button
                            onClick={() => { openChatbot(); setMobileOpen(false) }}
                            className="text-sm font-medium text-ghost-dim hover:text-ghost transition-colors text-left py-1 cursor-pointer"
                        >
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
