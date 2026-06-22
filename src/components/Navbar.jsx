'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu, X, ChevronDown, ArrowUpRight,
    Boxes, Sparkles, Cpu, PlayCircle,
    TrendingUp, Building2, Workflow, Route,
} from 'lucide-react'

const menus = [
    {
        id: 'platform', label: 'Platform', items: [
            { label: 'What We Build', href: '/#agents', icon: Boxes, desc: 'Agent types we ship' },
            { label: 'Capabilities', href: '/#services', icon: Sparkles, desc: 'What our agents do' },
            { label: 'Tech Stack', href: '/#tools', icon: Cpu, desc: 'Models & frameworks' },
            { label: 'Live Demo', href: '/#demo', icon: PlayCircle, desc: 'See an agent run' },
        ],
    },
    {
        id: 'impact', label: 'Impact', items: [
            { label: 'Proven Impact', href: '/#impact', icon: TrendingUp, desc: 'Outcomes & metrics' },
            { label: 'Industries', href: '/#industries', icon: Building2, desc: 'Where we operate' },
            { label: 'Active Pipeline', href: '/#pipeline', icon: Workflow, desc: 'Live operations' },
            { label: 'Our Process', href: '/#process', icon: Route, desc: 'How we deliver' },
        ],
    },
]
const simpleLinks = [
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/#faq' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [overDark, setOverDark] = useState(true) // hero is the Night block → start dark
    const [openMenu, setOpenMenu] = useState(null)
    const closeTimer = useRef(null)

    const openMenuNow = (id) => { clearTimeout(closeTimer.current); setOpenMenu(id) }
    const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpenMenu(null), 130) }

    // Sense the luminance behind the bar and flip the glass light/dark.
    useEffect(() => {
        let raf = null
        const sample = () => {
            raf = null
            setScrolled(window.scrollY > 12)
            const stack = document.elementsFromPoint(window.innerWidth / 2, 64).filter((el) => !el.closest('nav'))
            let rgb = null
            for (const el of stack) {
                const c = getComputedStyle(el).backgroundColor
                const m = c && c.match(/[\d.]+/g)
                if (m && m.length >= 3 && (m[3] === undefined || Number(m[3]) > 0.4)) { rgb = m.map(Number); break }
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

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const idleText = overDark ? 'text-white/80' : 'text-[#3f3f46]'
    const hoverText = overDark ? 'hover:text-white' : 'hover:text-ghost'
    const litBg = overDark ? 'bg-white/10' : 'bg-black/[0.04]'

    // single live-agent CTA → opens Sarah
    const SarahButton = ({ full = false }) => (
        <button
            onClick={() => { openChatbot(); setMobileOpen(false) }}
            className={`group relative flex items-center gap-2.5 rounded-full btn-grad-red text-white cursor-pointer pl-1.5 pr-4 py-1.5 ${full ? 'w-full justify-center mt-1' : ''}`}
        >
            <span className="relative shrink-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent font-display font-extrabold text-[0.72rem] shadow-[inset_0_1px_1px_rgba(0,0,0,0.06)]">S</span>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
            </span>
            <span className="text-[0.8rem] font-semibold leading-none">Talk with Sarah</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
    )

    return (
        <>
            {/* SVG lens — warps the backdrop so the background refracts through the glass */}
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
                <div className={`relative w-full max-w-[880px] rounded-full pl-5 pr-2 py-2 nav-glass ${overDark ? 'nav-glass--dark' : 'nav-glass--light'} ${scrolled ? 'is-scrolled' : ''}`}>
                    <span className="nav-glass__shine" aria-hidden="true" />

                    <div className="relative z-10 flex items-center justify-between">
                        {/* wordmark */}
                        <a href="/" className={`font-display text-[0.95rem] font-extrabold tracking-tight flex items-center gap-2 shrink-0 transition-colors duration-500 ${overDark ? 'text-white' : 'text-ghost'}`}>
                            <span className="w-2.5 h-2.5 bg-accent" />
                            DEX
                        </a>

                        {/* desktop links: two dropdowns + blog + faq */}
                        <div className="hidden md:flex items-center gap-0.5">
                            {menus.map((menu) => {
                                const open = openMenu === menu.id
                                return (
                                    <div key={menu.id} className="relative" onMouseEnter={() => openMenuNow(menu.id)} onMouseLeave={scheduleClose}>
                                        <button
                                            className={`flex items-center gap-1 px-3 py-2 rounded-full text-[0.82rem] font-medium transition-colors duration-300 ${idleText} ${hoverText} ${open ? litBg : ''}`}
                                            aria-expanded={open}
                                        >
                                            {menu.label}
                                            <ChevronDown size={14} strokeWidth={2.2} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {open && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                                    className="absolute top-full left-0 pt-3"
                                                >
                                                    <div className="w-[320px] p-2 rounded-[20px] bg-white/95 backdrop-blur-2xl border border-black/[0.06] shadow-[0_28px_64px_-22px_rgba(17,17,17,0.32)]">
                                                        {menu.items.map((it) => (
                                                            <a
                                                                key={it.href}
                                                                href={it.href}
                                                                onClick={() => setOpenMenu(null)}
                                                                className="group/item flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors duration-200"
                                                            >
                                                                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#f2f2f4] text-ghost transition-colors duration-300 group-hover/item:bg-accent group-hover/item:text-white">
                                                                    <it.icon size={17} strokeWidth={2} />
                                                                </span>
                                                                <span className="flex flex-col">
                                                                    <span className="text-[0.84rem] font-semibold text-ghost leading-tight">{it.label}</span>
                                                                    <span className="text-[0.72rem] text-ghost-dim leading-tight mt-0.5">{it.desc}</span>
                                                                </span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}

                            {simpleLinks.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    className={`px-3 py-2 rounded-full text-[0.82rem] font-medium transition-colors duration-300 ${idleText} ${hoverText}`}
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>

                        {/* desktop CTA */}
                        <div className="hidden md:flex items-center shrink-0">
                            <SarahButton />
                        </div>

                        {/* mobile toggle */}
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

                {/* mobile panel */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/90 backdrop-blur-2xl border border-black/[0.07] rounded-3xl p-4 flex flex-col shadow-[0_20px_50px_-20px_rgba(17,17,17,0.30)] max-h-[78vh] overflow-y-auto"
                        >
                            {menus.map((menu) => (
                                <div key={menu.id} className="mb-1">
                                    <p className="px-3 pt-3 pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ghost-faint">{menu.label}</p>
                                    {menu.items.map((it) => (
                                        <a
                                            key={it.href}
                                            href={it.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="group flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium text-ghost-dim hover:text-accent hover:bg-accent/[0.05] transition-colors"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f2f2f4] text-ghost group-hover:bg-accent group-hover:text-white transition-colors">
                                                <it.icon size={16} strokeWidth={2} />
                                            </span>
                                            {it.label}
                                        </a>
                                    ))}
                                </div>
                            ))}
                            <div className="h-px bg-black/[0.07] my-2" />
                            {simpleLinks.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="py-2.5 px-3 rounded-xl text-sm font-medium text-ghost-dim hover:text-accent hover:bg-accent/[0.05] transition-colors"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <SarahButton full />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    )
}
