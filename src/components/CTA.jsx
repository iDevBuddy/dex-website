import { FadeIn } from './Animations'
import { Mail, ArrowRight } from 'lucide-react'

export default function CTA() {
    return (
        <section id="contact" className="section-padding bg-dark border-t border-border relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(224,81,50,0.08) 0%, transparent 70%)',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                <FadeIn>
                    <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Get Started</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to put AI agents to work?</h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
                        Our experts help you identify where agentic AI can add the most value — no matter where you are in your AI journey.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="mailto:iakifsaeed@gmail.com"
                            className="inline-flex items-center gap-2.5 px-8 py-4 bg-accent text-white font-semibold text-[0.95rem] rounded-lg hover:bg-accent-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                            <Mail size={18} />
                            Book a Free Consultation
                        </a>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))}
                            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-gray-300 font-semibold text-[0.95rem] rounded-lg hover:border-border-hover hover:text-white hover:bg-white/[0.02] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            Try Live Demo
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Trust note */}
                    <p className="font-mono text-[0.75rem] text-gray-600 mt-8">
                        Free consultation · No commitment · Response within 24 hours
                    </p>
                </FadeIn>
            </div>
        </section>
    )
}
