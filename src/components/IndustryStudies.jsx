import { motion } from 'framer-motion'
import { TrendingUp, BarChart2, Shield } from 'lucide-react'

const studies = [
    {
        organization: 'IBM Watson Research',
        metric: '30%',
        description: 'Conversational AI assistants and voice agents reduce customer support operation costs by up to 30% while maintaining instant query response times.',
        icon: TrendingUp,
        color: '#3b82f6', // blue
        label: 'Cost Reduction',
    },
    {
        organization: 'McKinsey & Company',
        metric: '65%',
        description: 'Generative AI and automated reasoning systems can automate up to 60-70% of employee time today, routing labor to high-growth development.',
        icon: BarChart2,
        color: '#e05132', // orange
        label: 'Time Automated',
    },
    {
        organization: 'Gartner Research',
        metric: '25%',
        description: 'By 2027, conversational chatbots and intelligent agents will become the primary customer service channel for 25% of global organizations.',
        icon: Shield,
        color: '#10b981', // emerald
        label: 'Support Transition',
    },
]

export default function IndustryStudies() {
    return (
        <section id="impact" className="relative py-24 bg-[#02050f] overflow-hidden">
            {/* Top divider light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-cobalt mb-4">
                        Authority & Data
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                        Proven Impact: Verified Industry Studies
                    </h2>
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                        AI automation is not a futuristic concept—it is a mathematically proven business multiplier. We anchor all our solutions in verified, global research.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {studies.map((s, idx) => {
                        const Icon = s.icon
                        return (
                            <motion.div
                                key={s.organization}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="dex-glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
                            >
                                <div className="dex-grain-overlay" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-400">
                                        <Icon size={18} style={{ color: s.color }} />
                                    </div>
                                    <span className="font-mono text-[0.62rem] text-gray-500 uppercase tracking-widest">
                                        {s.label}
                                    </span>
                                </div>

                                <div className="mb-6 flex items-baseline gap-2">
                                    <h3
                                        className="text-5xl font-black font-display"
                                        style={{ color: s.color }}
                                    >
                                        {s.metric}
                                    </h3>
                                    <span className="text-xs text-gray-400">Impact</span>
                                </div>

                                <div className="mb-6">
                                    <p className="text-white font-bold text-sm font-display mb-2">{s.organization}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                                </div>

                                {/* Custom Blueprint-Style Radial Gauge */}
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="font-mono text-[0.6rem] text-gray-500">Verified Study Data</span>
                                    <svg className="w-8 h-8" viewBox="0 0 36 36">
                                        {/* Background Track */}
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.03)"
                                            strokeWidth="2.5"
                                        />
                                        {/* Animated Stroke */}
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            stroke={s.color}
                                            strokeWidth="2.5"
                                            strokeDasharray={`${s.metric.replace('%', '')} 100`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                        />
                                    </svg>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
