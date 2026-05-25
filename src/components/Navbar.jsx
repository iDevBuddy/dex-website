import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const links = [
        { label: 'Pipeline', href: '/#pipeline' },
        { label: 'Services', href: '/#services' },
        { label: 'Proven Impact', href: '/#impact' },
        { label: 'Process', href: '/#process' },
        { label: 'Blog', href: '/blog' },
    ]

    return (
        <motion.nav
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'py-4 px-6 md:px-12 flex justify-center'
                    : 'py-6 px-6'
            }`}
        >
            <div
                className={`transition-all duration-500 flex items-center justify-between ${
                    scrolled
                        ? 'max-w-5xl w-full bg-white/80 backdrop-blur-xl border border-black/5 px-8 py-3 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
                        : 'max-w-7xl w-full mx-auto'
                }`}
            >
                <a href="/" className="font-display text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
                    <span>DEX</span>
                    <span className="text-slate-500 font-normal text-xs uppercase tracking-[0.2em] ml-1.5 hidden sm:inline">by Akif Saeed</span>
                </a>

                {/* Desktop menu */}
                <div className="hidden lg:flex items-center gap-8">
                    {links.map(l => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="relative text-[0.82rem] font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 group py-1"
                        >
                            {l.label}
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </a>
                    ))}
                    <button
                        onClick={openChatbot}
                        className="text-[0.82rem] font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 cursor-pointer"
                    >
                        Live Demo
                    </button>
                    <a
                        href="/#contact"
                        className="ml-2 px-5 py-2.5 bg-accent text-white text-[0.8rem] font-semibold rounded-full hover:bg-accent-hover transition-all duration-300 hover:scale-[1.02] focus:outline-none"
                    >
                        Get Started
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-full focus:outline-none"
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:hidden absolute top-full left-6 right-6 mt-2 bg-white/95 backdrop-blur-2xl border border-black/5 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
                    >
                        {links.map(l => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1"
                            >
                                {l.label}
                            </a>
                        ))}
                        <button
                            onClick={() => { openChatbot(); setMobileOpen(false) }}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors text-left py-1 cursor-pointer"
                        >
                            Live Demo
                        </button>
                        <a
                            href="/#contact"
                            onClick={() => setMobileOpen(false)}
                            className="mt-2 px-5 py-3 bg-cobalt text-white text-sm font-semibold rounded-full text-center hover:bg-cobalt-hover transition-colors shadow-lg"
                        >
                            Get Started
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
