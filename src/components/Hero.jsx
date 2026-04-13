import { motion } from 'framer-motion'

const agentPulses = [
    { label: 'Voice Agent', status: 'Active', color: '#e05132', delay: 0 },
    { label: 'Chat Agent', status: 'Handling 3 chats', color: '#22c55e', delay: 0.4 },
    { label: 'Workflow Agent', status: 'Running task', color: '#3b82f6', delay: 0.8 },
    { label: 'Decision AI', status: 'Analyzing', color: '#a855f7', delay: 1.2 },
]

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center bg-dark-deeper overflow-hidden">
            {/* Grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
            />
            {/* Glow blobs */}
            <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] bg-accent/[0.05] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center pt-20 pb-10">
                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-xl"
                >
                    <div className="inline-flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent">
                            AI Agent Development Services
                        </p>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                        Build agents and copilots{' '}
                        <span className="text-accent">that move the needle</span>
                    </h1>
                    <p className="text-[1.05rem] text-gray-400 leading-relaxed mb-10">
                        We design, build, and deploy intelligent AI agents that automate customer calls,
                        schedule appointments, handle support, and streamline operations — so your team
                        can focus on what matters most.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))}
                            className="px-7 py-3.5 bg-accent text-white font-semibold text-[0.9rem] rounded-md hover:bg-accent-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                            Try Live Demo
                        </button>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))}
                            className="px-7 py-3.5 border border-border text-gray-300 font-semibold text-[0.9rem] rounded-md hover:border-gray-500 hover:bg-white/[0.03] hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            Book a Consultation
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-10 flex items-center gap-6">
                        <div className="text-center">
                            <p className="font-mono text-xl font-bold text-white">50+</p>
                            <p className="text-[0.72rem] text-gray-600 mt-0.5">Agents Deployed</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                            <p className="font-mono text-xl font-bold text-white">24/7</p>
                            <p className="text-[0.72rem] text-gray-600 mt-0.5">Uptime</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                            <p className="font-mono text-xl font-bold text-white">3x</p>
                            <p className="text-[0.72rem] text-gray-600 mt-0.5">Avg ROI</p>
                        </div>
                    </div>
                </motion.div>

                {/* Visual — agent dashboard panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:flex justify-center items-center"
                >
                    <div
                        className="w-full max-w-[420px] rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(17,17,17,0.92)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
                        }}
                    >
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                            <span className="w-3 h-3 rounded-full bg-red-500/70" />
                            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <span className="w-3 h-3 rounded-full bg-green-500/70" />
                            <span className="ml-3 font-mono text-[0.7rem] text-gray-600 tracking-wider">DEX Agent Dashboard</span>
                        </div>

                        {/* Agent rows */}
                        <div className="p-5 flex flex-col gap-3">
                            {agentPulses.map((agent, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 + agent.delay }}
                                    className="flex items-center justify-between p-3.5 rounded-lg"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.span
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: agent.delay }}
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ background: agent.color }}
                                        />
                                        <span className="text-gray-300 text-[0.85rem] font-medium">{agent.label}</span>
                                    </div>
                                    <span
                                        className="font-mono text-[0.7rem] px-2 py-0.5 rounded"
                                        style={{
                                            color: agent.color,
                                            background: `${agent.color}15`,
                                            border: `1px solid ${agent.color}25`,
                                        }}
                                    >
                                        {agent.status}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer metric */}
                        <div className="px-5 pb-5">
                            <div
                                className="rounded-lg p-4"
                                style={{
                                    background: 'rgba(224,81,50,0.07)',
                                    border: '1px solid rgba(224,81,50,0.18)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-[0.7rem] text-accent uppercase tracking-wider">Today's Automations</span>
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="font-mono text-[0.65rem] text-green-400"
                                    >
                                        ● LIVE
                                    </motion.span>
                                </div>
                                <p className="font-mono text-3xl font-bold text-white">1,247</p>
                                <p className="text-[0.72rem] text-gray-500 mt-1">calls handled · appointments booked · tickets resolved</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
