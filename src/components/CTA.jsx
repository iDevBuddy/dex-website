import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react'

const industries = ['Healthcare', 'Real Estate', 'Consultancy', 'Retail & E-commerce']
const bottlenecks = [
    { label: 'Outbound receptionist calls', score: 94 },
    { label: 'Manual lead data sync', score: 88 },
    { label: 'Inquiry response lag', score: 91 },
    { label: 'CRM entry overhead', score: 85 },
]

export default function CTA() {
    const [step, setStep] = useState(1)
    const [selectedIndustry, setSelectedIndustry] = useState(null)
    const [selectedBottleneck, setSelectedBottleneck] = useState(null)
    const [leadName, setLeadName] = useState('')
    const [leadEmail, setLeadEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleNextStep = () => {
        if (step < 3) setStep(step + 1)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!leadName || !leadEmail) return
        setSubmitted(true)
    }

    const feasibilityScore = selectedBottleneck ? selectedBottleneck.score : 90

    return (
        <section id="contact" className="relative py-24 bg-dark border-t border-white/5 overflow-hidden">
            {/* Ambient cobalt gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(37,99,235,0.08) 0%, transparent 70%)',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <div className="max-w-2xl mx-auto mb-12">
                    <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-accent mb-4">Interactive Planner</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-4">Ready to Put AI Agents to Work?</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Assess the feasibility of AI automation in your specific workflow. Click through our quick planner to map your strategy instantly.
                    </p>
                </div>

                {/* Strategy Planner Wizard Container */}
                <div className="w-full max-w-lg rounded-[28px] dex-panel p-6 md:p-8 relative text-left">
                    <div className="dex-grain-overlay" />

                    {!submitted ? (
                        <>
                            {/* Step Indicator Header */}
                            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                                <span className="font-mono text-[0.62rem] text-gray-500 uppercase tracking-widest">
                                    Step 0{step} of 03
                                </span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`w-4 h-1 rounded-full transition-all duration-300 ${
                                                s <= step ? 'bg-accent' : 'bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="font-display text-base font-bold text-white mb-4">Select your primary business sector</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {industries.map((ind) => (
                                                <button
                                                    key={ind}
                                                    onClick={() => {
                                                        setSelectedIndustry(ind)
                                                        handleNextStep()
                                                    }}
                                                    className={`p-4 rounded-xl border text-xs font-semibold text-left transition-all duration-300 cursor-pointer ${
                                                        selectedIndustry === ind
                                                            ? 'border-accent bg-accent/5 text-white'
                                                            : 'border-white/5 bg-white/[0.01] text-gray-400 hover:border-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="font-display text-base font-bold text-white mb-4">What is your primary process bottleneck?</h3>
                                        <div className="flex flex-col gap-3">
                                            {bottlenecks.map((bot) => (
                                                <button
                                                    key={bot.label}
                                                    onClick={() => {
                                                        setSelectedBottleneck(bot)
                                                        handleNextStep()
                                                    }}
                                                    className={`p-4 rounded-xl border text-xs font-semibold text-left transition-all duration-300 flex justify-between items-center cursor-pointer ${
                                                        selectedBottleneck?.label === bot.label
                                                            ? 'border-accent bg-accent/5 text-white'
                                                            : 'border-white/5 bg-white/[0.01] text-gray-400 hover:border-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    <span>{bot.label}</span>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="font-display text-base font-bold text-white mb-2">Generate feasibility blueprint</h3>
                                        <p className="text-xs text-gray-500 mb-4">Enter your details to generate your active strategy report.</p>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <input
                                                    required
                                                    type="text"
                                                    value={leadName}
                                                    onChange={(e) => setLeadName(e.target.value)}
                                                    placeholder="Your name"
                                                    className="dex-field"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    required
                                                    type="email"
                                                    value={leadEmail}
                                                    onChange={(e) => setLeadEmail(e.target.value)}
                                                    placeholder="you@company.com"
                                                    className="dex-field"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full py-3.5 bg-accent text-white font-semibold text-xs rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <Mail size={14} />
                                                Generate Strategy Score
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <CheckCircle size={44} className="text-emerald-500 mx-auto mb-4 animate-bounce" />
                            <h3 className="font-display text-lg font-bold text-white mb-2">Strategy Map Generated</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                                Thanks, {leadName}! A custom automation report is heading to <span className="text-accent">{leadEmail}</span>.
                            </p>
                            
                            {/* Visual score display */}
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 max-w-xs mx-auto text-center">
                                <p className="text-[0.62rem] uppercase tracking-wider text-gray-500 mb-1">Automation Feasibility</p>
                                <p className="text-3xl font-black font-display text-emerald-400">{feasibilityScore}%</p>
                                <p className="text-[10px] text-emerald-500/70 font-mono mt-1">HIGHLY VIABLE FOR AGENT DEPLOYMENT</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <p className="font-mono text-[0.72rem] text-gray-600 mt-8">
                    Free interactive assessment · Blueprint delivers response paths in 15 seconds
                </p>
            </div>
        </section>
    )
}
