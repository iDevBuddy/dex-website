import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const feedback = [
    {
        name: 'Dr. Marcus Vance',
        role: 'Founder',
        company: 'Vance Dental Group',
        roiBadge: '0 missed calls · 3.5x Admin ROI',
        quote: "DEX's Apex Voice Scheduler has completely automated our patient receptionist line. We haven't missed a single phone booking since deployment, and admin scheduling overhead decreased by 40%.",
        metricColor: '#e05132', // orange
    },
    {
        name: 'Sarah Jenkins',
        role: 'COO',
        company: 'Apex Scale Ventures',
        roiBadge: '+180% Lead Volume · 4.8x ROI',
        quote: "Deploying the Sales Multi-Agent Pipeline completely changed our customer acquisition speed. The territory crawler and SMTP validation flows are fast and mathematically bulletproof.",
        metricColor: '#2563eb', // blue
    },
    {
        name: 'Karim Al-Husseini',
        role: 'Managing Director',
        company: 'Husseini Real Estate',
        roiBadge: '+230% Valuation Routing Speed',
        quote: "The valuation agent coordinates WhatsApp inquiries instantly, routing property candidates perfectly to our database, resulting in a dramatic increase in property viewing bookings.",
        metricColor: '#10b981', // emerald
    },
]

export default function Testimonials() {
    return (
        <section className="relative py-24 bg-dark overflow-hidden">
            {/* Ambient cobalt glow */}
            <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-cobalt/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-accent mb-4">
                        Client Results
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                        Client ROI & Direct Feedback
                    </h2>
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                        We measure success in tangible outcomes, not theories. Here is how our active AI deployments have impacted actual business operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {feedback.map((f, idx) => (
                        <motion.div
                            key={f.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.12 }}
                            className="dex-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="dex-grain-overlay" />

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span
                                        className="text-[0.62rem] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
                                        style={{
                                            color: f.metricColor,
                                            borderColor: `${f.metricColor}25`,
                                            background: `${f.metricColor}08`,
                                        }}
                                    >
                                        {f.roiBadge}
                                    </span>
                                    <Quote size={18} className="text-gray-700" />
                                </div>

                                <p className="text-sm text-gray-300 leading-relaxed italic mb-8">
                                    "{f.quote}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${f.metricColor}, #02040a)`,
                                    }}
                                >
                                    {f.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-xs font-display">{f.name}</h4>
                                    <p className="text-[0.68rem] text-gray-500 mt-0.5">{f.role} · {f.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
