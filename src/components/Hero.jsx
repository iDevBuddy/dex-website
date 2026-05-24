import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const agentNodes = [
    { label: 'Voice Portal', x: 70, y: 70, color: '#e05132' },
    { label: 'Agent Core', x: 200, y: 150, color: '#3b82f6', isCore: true },
    { label: 'API Integrator', x: 330, y: 70, color: '#10b981' },
    { label: 'Lead Scoring', x: 70, y: 230, color: '#a855f7' },
    { label: 'Verification SMTP', x: 330, y: 230, color: '#f59e0b' },
]

export default function Hero() {
    const [activeNode, setActiveNode] = useState(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <section className="relative min-h-screen flex items-center bg-dark overflow-hidden pt-20">
            {/* Ambient mouse spotlight background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.12), transparent 80%)`,
                }}
            />

            {/* Mesh background grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Glowing atmosphere blurs */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-cobalt/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center w-full py-16">
                {/* Heading & Details */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-7 max-w-2xl text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
                        <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        <p className="font-mono text-[0.68rem] font-bold tracking-[0.25em] uppercase text-accent">
                            AI Agent Engineering Lab
                        </p>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-white leading-[1.08] tracking-tight font-display mb-6">
                        Build autonomous agents{' '}
                        <span className="bg-gradient-to-r from-accent to-cobalt bg-clip-text text-transparent">
                            that move the needle
                        </span>
                    </h1>
                    <p className="text-[1.02rem] text-gray-400 leading-relaxed mb-10 max-w-xl">
                        We design, integrate, and deploy custom AI agents that automate customer phone calls,
                        qualify incoming leads, sync systems, and scale operations—all built on verified,
                        hallucination-guarded infrastructure.
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                        <button
                            onClick={openChatbot}
                            className="px-8 py-3.5 bg-accent text-white font-semibold text-[0.88rem] rounded-full hover:bg-accent-hover transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(224,81,50,0.25)] cursor-pointer"
                        >
                            Start Consultation
                        </button>
                        <a
                            href="/#pipeline"
                            className="px-8 py-3.5 border border-white/10 text-gray-300 font-semibold text-[0.88rem] rounded-full hover:border-white/20 hover:bg-white/5 hover:text-white transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                        >
                            View Active Projects
                        </a>
                    </div>

                    {/* Quick Stats metrics */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-10">
                        <div>
                            <p className="font-display text-2xl font-bold text-white">50+</p>
                            <p className="text-[0.72rem] tracking-wider uppercase text-gray-500 mt-1">Agents Deployed</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div>
                            <p className="font-display text-2xl font-bold text-white">24/7</p>
                            <p className="text-[0.72rem] tracking-wider uppercase text-gray-500 mt-1">System Uptime</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div>
                            <p className="font-display text-2xl font-bold text-white">3.8x</p>
                            <p className="text-[0.72rem] tracking-wider uppercase text-gray-500 mt-1">Average Client ROI</p>
                        </div>
                    </div>
                </motion.div>

                {/* Living AI Node Network Visualizer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-5 flex justify-center items-center"
                >
                    <div className="relative w-full max-w-[440px] aspect-square rounded-[32px] dex-panel p-6 overflow-hidden flex flex-col justify-between">
                        {/* Analog Grain Texture */}
                        <div className="dex-grain-overlay" />
                        
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                            </div>
                            <span className="font-mono text-[0.62rem] text-gray-500 uppercase tracking-widest">Active Node Visualizer</span>
                        </div>

                        {/* Interactive Node Canvas Map */}
                        <div className="relative flex-1 py-4 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 400 300">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#e05132" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                                    </linearGradient>
                                </defs>

                                {/* Animated connecting lines */}
                                {agentNodes.map((n, i) => {
                                    if (n.isCore) return null
                                    return (
                                        <g key={i}>
                                            <line
                                                x1={200}
                                                y1={150}
                                                x2={n.x}
                                                y2={n.y}
                                                stroke="url(#lineGrad)"
                                                strokeWidth="1.5"
                                                strokeDasharray="6 4"
                                            />
                                            {/* Glowing packet animation */}
                                            <circle r="3" fill={n.color}>
                                                <animateMotion
                                                    dur="3s"
                                                    repeatCount="Infinity"
                                                    path={`M 200 150 L ${n.x} ${n.y}`}
                                                    keyTimes="0;1"
                                                    keySplines="0.4 0 0.2 1"
                                                />
                                            </circle>
                                        </g>
                                    )
                                })}

                                {/* Glowing Nodes */}
                                {agentNodes.map((n, i) => (
                                    <g
                                        key={i}
                                        className="cursor-pointer"
                                        onMouseEnter={() => setActiveNode(n)}
                                        onMouseLeave={() => setActiveNode(null)}
                                    >
                                        {/* Outer soft glow ring */}
                                        <circle
                                            cx={n.x}
                                            cy={n.y}
                                            r={n.isCore ? 28 : 16}
                                            fill={n.color}
                                            fillOpacity="0.08"
                                            className="transition-all duration-300 hover:fill-opacity-20"
                                        />
                                        {/* Solid center dot */}
                                        <circle
                                            cx={n.x}
                                            cy={n.y}
                                            r={n.isCore ? 12 : 7}
                                            fill={n.color}
                                        />
                                    </g>
                                ))}
                            </svg>

                            {/* Center Status Display */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <AnimatePresence>
                                    {activeNode ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-slate-950/90 border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-center backdrop-blur-md max-w-[200px]"
                                        >
                                            <p className="text-white font-bold text-xs font-display">{activeNode.label}</p>
                                            <p className="text-[0.65rem] text-gray-500 mt-1 uppercase tracking-wider">
                                                {activeNode.isCore ? 'Central Orchestrator' : 'Active Channel Node'}
                                            </p>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Interactive Status Footer */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mt-auto">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-[0.62rem] text-accent uppercase tracking-widest">Automation Engine</span>
                                <span className="font-mono text-[0.62rem] text-emerald-400 flex items-center gap-1.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    OPERATIONAL
                                </span>
                            </div>
                            <p className="font-mono text-2xl font-bold text-white tracking-tight">1,247 <span className="text-xs text-gray-500 font-normal">runs/day</span></p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
