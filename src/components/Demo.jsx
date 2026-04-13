import { FadeIn } from './Animations'
import { useRetellDemo } from '../hooks/useRetellDemo'
import { Mic, MicOff, PhoneOff } from 'lucide-react'

export default function Demo() {
    const { status, startCall, stopCall } = useRetellDemo()

    const handleClick = () => {
        if (status === 'connected') {
            stopCall()
        } else {
            startCall()
        }
    }

    const buttonText = {
        idle: 'Talk to Our AI Agent',
        connecting: 'Connecting...',
        connected: 'End Conversation',
        error: 'Try Again',
    }

    const ButtonIcon = status === 'connected' ? PhoneOff : status === 'connecting' ? MicOff : Mic

    return (
        <section id="demo" className="section-padding bg-dark-deeper relative overflow-hidden">
            {/* Background accent gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(224,81,50,0.12) 0%, transparent 70%)',
                }}
            />
            {/* Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(224,81,50,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(224,81,50,0.06) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                <FadeIn>
                    {/* Panel */}
                    <div
                        className="max-w-2xl mx-auto rounded-2xl p-10 sm:p-14"
                        style={{
                            background: 'rgba(17,17,17,0.85)',
                            border: '1px solid rgba(224,81,50,0.25)',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(224,81,50,0.06)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Live Demo</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Experience it yourself</h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-[1rem] leading-relaxed">
                            Talk to Maya — our AI clinic receptionist. She handles appointments, recommends
                            doctors, checks availability, and sends WhatsApp and email confirmations.
                            All in a natural voice conversation.
                        </p>
                        <button
                            onClick={handleClick}
                            disabled={status === 'connecting'}
                            aria-label={buttonText[status]}
                            className={`inline-flex items-center gap-3 px-10 py-4 rounded-lg text-[1rem] font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark focus:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed ${status === 'connected'
                                    ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-xl hover:shadow-red-900/30'
                                    : 'bg-accent text-white hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/25'
                                }`}
                        >
                            {status === 'connected' && (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                            <ButtonIcon size={18} />
                            {buttonText[status]}
                        </button>
                        <p className="font-mono text-[0.75rem] text-gray-600 mt-6">
                            Live demo of our clinic booking agent · No sign-up required
                        </p>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
