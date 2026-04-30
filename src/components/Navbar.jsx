import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const links = [
        { label: 'Agents', href: '/#agents' },
        { label: 'Services', href: '/#services' },
        { label: 'Industries', href: '/#industries' },
        { label: 'Process', href: '/#process' },
        { label: 'Blog', href: '/blog' },
    ]

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-dark-deeper/95 backdrop-blur-xl border-b border-border py-3.5'
                    : 'py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <a href="/" className="font-mono text-lg font-bold text-white tracking-tight">
                    DEX <span className="text-accent">by Akif Saeed</span>
                </a>

                {/* Desktop */}
                <div className="hidden lg:flex items-center gap-8">
                    {links.map(l => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="text-[0.85rem] font-medium text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            {l.label}
                        </a>
                    ))}
                    <button
                        onClick={openChatbot}
                        className="text-[0.85rem] font-medium text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                        Live Demo
                    </button>
                    <a
                        href="/#contact"
                        className="ml-2 px-5 py-2.5 bg-accent text-white text-[0.82rem] font-semibold rounded-md hover:bg-accent-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                        Get Started
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-gray-300 hover:text-white transition-colors cursor-pointer p-1 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-dark-deeper/98 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-4"
                    >
                        {links.map(l => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm text-gray-400 hover:text-white transition-colors py-1"
                            >
                                {l.label}
                            </a>
                        ))}
                        <button
                            onClick={() => { openChatbot(); setMobileOpen(false) }}
                            className="text-sm text-gray-400 hover:text-white transition-colors text-left py-1 cursor-pointer"
                        >
                            Live Demo
                        </button>
                        <a
                            href="/#contact"
                            onClick={() => setMobileOpen(false)}
                            className="mt-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-md text-center hover:bg-accent-hover transition-colors"
                        >
                            Get Started
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
