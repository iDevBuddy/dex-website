import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Activity } from 'lucide-react'

export default function Hero() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [consoleState, setConsoleState] = useState('idle') // 'idle', 'compiling', 'success'
    const [logs, setLogs] = useState([])

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const runSimulation = () => {
        if (consoleState === 'compiling') return
        setConsoleState('compiling')
        setLogs([])

        const sequence = [
            { time: 0, text: '$ dex init --agent=core' },
            { time: 500, text: '❯ Establishing Hume AI WebSockets... OK' },
            { time: 1300, text: '❯ Securing Twilio voice media trunks... OK' },
            { time: 2100, text: '❯ Fine-tuning LLaMA reasoning schema... OK' },
            { time: 2900, text: '❯ Guarding HIPAA Supabase vault... OK' },
            { time: 3700, text: '✔ DEX AGENT PIPELINE SUCCESSFULLY DEPLOYED' },
        ]

        sequence.forEach((step) => {
            setTimeout(() => {
                setLogs((prev) => [...prev, step.text])
                if (step.text.startsWith('✔')) {
                    setConsoleState('success')
                }
            }, step.time)
        })
    }

    const resetSimulation = () => {
        setConsoleState('idle')
        setLogs([])
    }

    return (
        <section className="relative min-h-screen flex items-center bg-dark overflow-hidden pt-24 border-b border-[#E5E5E7]">
            {/* Ambient subtle light blue spotlight - very low opacity */}
            <div
                className="absolute inset-0 pointer-events-none opacity-25 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 82, 255, 0.03), transparent 80%)`,
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full py-16">
                {/* Left: Heading & Value Proposition */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-7 text-left flex flex-col items-start"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/5 border border-accent/15 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                        <span className="font-mono text-[0.62rem] font-bold tracking-[0.25em] uppercase text-accent">
                            AI Agent Engineering Lab
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-black text-slate-900 leading-[0.92] tracking-tighter font-display mb-8">
                        Build autonomous agents that run your business.
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-10 max-w-xl">
                        We design, integrate, and deploy custom AI voice assistants and SMTP-validated lead workflows. 
                        No cliches, no geometric placeholders—just mathematically sound, production-ready AI agents built on verified infrastructure.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                        <button
                            onClick={openChatbot}
                            className="w-full sm:w-auto px-8 py-4 bg-accent text-white font-bold text-xs rounded-xl hover:bg-accent-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                            Start Consultation
                        </button>
                        <a
                            href="/#pipeline"
                            className="w-full sm:w-auto px-8 py-4 border border-black/10 text-slate-700 font-bold text-xs rounded-xl hover:border-black/20 hover:bg-slate-50 hover:text-slate-900 text-center transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                            View Active Projects
                        </a>
                    </div>

                    {/* Technical Metric Blocks */}
                    <div className="mt-16 pt-8 border-t border-slate-200 flex items-center gap-10 w-full">
                        <div>
                            <p className="font-mono text-2xl font-bold text-slate-900">50+</p>
                            <p className="font-mono text-[0.58rem] tracking-widest uppercase text-slate-500 mt-1">Agents Deployed</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                            <p className="font-mono text-2xl font-bold text-slate-900">24/7</p>
                            <p className="font-mono text-[0.58rem] tracking-widest uppercase text-slate-500 mt-1">Orchestration Uptime</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                            <p className="font-mono text-2xl font-bold text-slate-900">3.8x</p>
                            <p className="font-mono text-[0.58rem] tracking-widest uppercase text-slate-500 mt-1">Average Client ROI</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Apple-Grade Software Simulator Console */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-5 flex justify-center items-center"
                >
                    <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-3xl bg-white border border-[#E5E5E7] p-5 md:p-6 overflow-hidden flex flex-col justify-between shadow-[0_24px_64px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="dex-grain-overlay" />

                        {/* Console Header bar */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/90" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/90" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/90" />
                            </div>
                            <span className="font-mono text-[0.58rem] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse" />
                                dex-agent-terminal
                            </span>
                        </div>

                        {/* Interactive Compiler Logs Panel */}
                        <div className="flex-1 py-6 font-mono text-[0.72rem] leading-relaxed text-slate-600 overflow-y-auto flex flex-col gap-2">
                            {consoleState === 'idle' ? (
                                <div className="text-slate-400 flex flex-col gap-1">
                                    <p className="text-slate-800 font-bold">$ dex run --agent=all</p>
                                    <p className="mt-2">❯ System status: IDLE</p>
                                    <p>❯ Ready to compile active workflows.</p>
                                    <p className="text-[#0052FF] font-semibold mt-4 text-[0.68rem] animate-pulse">
                                        [CLICK DEPLOY BUTTON BELOW TO INITIALIZE RUN]
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {logs.map((log, idx) => {
                                        const isCmd = log.startsWith('$')
                                        const isSuccess = log.startsWith('✔')
                                        return (
                                            <p
                                                key={idx}
                                                className={
                                                    isCmd
                                                        ? 'text-slate-800 font-bold'
                                                        : isSuccess
                                                        ? 'text-emerald-600 font-bold mt-3'
                                                        : 'text-slate-600'
                                                }
                                            >
                                                {log}
                                            </p>
                                        )
                                    })}
                                    {consoleState === 'compiling' && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-ping" />
                                            <span className="text-[#0052FF] text-[10px] font-semibold animate-pulse">COMPILING STACK...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Console Trigger Footer */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[0.62rem] font-mono">
                                <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Activity size={10} className="text-slate-400" />
                                    Active Orchestrator
                                </span>
                                <span className="text-emerald-600 uppercase tracking-widest font-semibold">
                                    1,247 runs/day
                                </span>
                            </div>

                            {consoleState !== 'success' ? (
                                <button
                                    onClick={runSimulation}
                                    disabled={consoleState === 'compiling'}
                                    className="w-full py-3 bg-[#0052FF] hover:bg-[#0040C7] disabled:opacity-60 text-white font-mono text-[0.68rem] font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Play size={10} fill="white" />
                                    {consoleState === 'compiling' ? 'Deploying stack...' : 'Deploy AI Agent Pipeline'}
                                </button>
                            ) : (
                                <button
                                    onClick={resetSimulation}
                                    className="w-full py-3 bg-slate-50 border border-black/5 hover:bg-slate-100 text-slate-800 font-mono text-[0.68rem] font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                >
                                    <RotateCcw size={10} />
                                    Reset Terminal Console
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
