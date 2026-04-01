import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Conversation } from '@elevenlabs/client'

const AGENT_ID = 'agent_4501kn3whsk4eq6a22eyqpxf43nc'
const EMAIL_TRIGGER = 'type your email'

export default function VoiceChatbot() {
    const [status, setStatus] = useState('idle') // idle | connecting | connected | disconnecting
    const [mode, setMode] = useState('listening') // speaking | listening
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [emailValue, setEmailValue] = useState('')
    const [emailError, setEmailError] = useState('')
    const [error, setError] = useState('')

    const conversationRef = useRef(null)
    const messagesRef = useRef([])
    const errorTimerRef = useRef(null)

    const showError = useCallback((msg) => {
        setError(msg)
        clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setError(''), 4000)
    }, [])

    const startCall = useCallback(async () => {
        if (status !== 'idle') return
        setStatus('connecting')
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            const conv = await Conversation.startSession({
                agentId: AGENT_ID,
                onConnect: () => setStatus('connected'),
                onDisconnect: () => {
                    setStatus('idle')
                    setMode('listening')
                    conversationRef.current = null
                },
                onMessage: ({ message, source }) => {
                    messagesRef.current.push({
                        role: source === 'ai' ? 'assistant' : 'user',
                        content: message,
                    })
                    if (source === 'ai' && message.toLowerCase().includes(EMAIL_TRIGGER)) {
                        setShowEmailInput(true)
                    }
                },
                onModeChange: ({ mode: m }) => setMode(m),
                onError: () => {
                    showError('Connection error. Please try again.')
                    setStatus('idle')
                    conversationRef.current = null
                },
            })
            conversationRef.current = conv
        } catch (err) {
            showError(
                err.name === 'NotAllowedError'
                    ? 'Microphone access denied.'
                    : 'Failed to connect. Please try again.'
            )
            setStatus('idle')
        }
    }, [status, showError])

    const endCall = useCallback(async () => {
        setStatus('disconnecting')
        setShowEmailInput(false)
        setEmailValue('')
        messagesRef.current = []
        const conv = conversationRef.current
        conversationRef.current = null
        if (conv) {
            try { await conv.endSession() } catch { /* ignore */ }
        }
        setStatus('idle')
        setMode('listening')
    }, [])

    const handleButtonClick = () => {
        if (status === 'idle') startCall()
        else if (status === 'connecting' || status === 'connected') endCall()
    }

    const handleEmailSubmit = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setEmailError('Please enter a valid email address.')
            return
        }
        setEmailError('')
        const summary = messagesRef.current
            .map((m) => `${m.role === 'user' ? 'Visitor' : 'DEX'}: ${m.content}`)
            .join('\n')
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientEmail: emailValue, conversationSummary: summary }),
            })
        } catch { /* silent */ }
        setShowEmailInput(false)
        setEmailValue('')
    }

    useEffect(() => {
        return () => {
            if (conversationRef.current) conversationRef.current.endSession().catch(() => {})
            clearTimeout(errorTimerRef.current)
        }
    }, [])

    const isInCall = status !== 'idle'

    const labelText =
        status === 'connecting'    ? 'Connecting...' :
        status === 'disconnecting' ? 'Ending...' :
        status === 'connected' && mode === 'speaking' ? 'Speaking...' :
        status === 'connected'     ? 'Listening...' :
        null // idle → two-line label

    const waveState =
        status === 'connected' && mode === 'speaking' ? 'speaking' :
        status === 'connected' ? 'listening' :
        'idle'

    // Box-shadow driven by framer-motion animate
    const boxShadowValue =
        status === 'connected'
            ? '0 0 0 5px rgba(224,81,50,0.14), 0 0 30px rgba(224,81,50,0.2), 0 8px 32px rgba(0,0,0,0.5)'
            : status === 'connecting' || status === 'disconnecting'
            ? '0 0 0 2px rgba(224,81,50,0.08), 0 8px 32px rgba(0,0,0,0.4)'
            : [
                '0 0 0 0px rgba(224,81,50,0.0), 0 8px 32px rgba(0,0,0,0.35)',
                '0 0 0 5px rgba(224,81,50,0.08), 0 0 22px rgba(224,81,50,0.12), 0 8px 32px rgba(0,0,0,0.35)',
                '0 0 0 0px rgba(224,81,50,0.0), 0 8px 32px rgba(0,0,0,0.35)',
            ]

    const boxShadowTransition =
        status === 'idle'
            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.35, ease: 'easeOut' }

    return (
        <>
            {/* Email input — floats above button */}
            <AnimatePresence>
                {showEmailInput && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-[96px] right-6 z-[9999] w-[300px]"
                    >
                        <div
                            className="rounded-2xl p-4 shadow-2xl"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <p className="text-gray-500 text-[0.68rem] uppercase tracking-widest mb-3 font-mono">
                                Enter your email
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={emailValue}
                                    onChange={(e) => { setEmailValue(e.target.value); setEmailError('') }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                                    placeholder="you@example.com"
                                    autoFocus
                                    className="flex-1 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-gray-700"
                                    style={{
                                        background: '#111',
                                        border: emailError
                                            ? '1px solid rgba(239,68,68,0.5)'
                                            : '1px solid rgba(255,255,255,0.1)',
                                    }}
                                />
                                <button
                                    onClick={handleEmailSubmit}
                                    className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                                    style={{ background: '#e05132' }}
                                    aria-label="Submit email"
                                >
                                    <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                                    </svg>
                                </button>
                            </div>
                            {emailError && <p className="text-red-400 text-xs mt-2 pl-1">{emailError}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error toast */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-[96px] right-6 z-[9998] text-red-300 text-xs px-4 py-2.5 rounded-xl"
                        style={{ background: 'rgba(127,29,29,0.85)', backdropFilter: 'blur(8px)' }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Mount wrapper — slides up on load */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-6 right-6 z-[9999]"
            >
                <motion.button
                    onClick={handleButtonClick}
                    animate={{ boxShadow: boxShadowValue }}
                    transition={{ boxShadow: boxShadowTransition }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={isInCall ? 'End call' : 'Start voice consultation'}
                    className="flex items-center gap-3 pl-5 pr-4 py-3.5 rounded-[22px] border border-white/[0.06] backdrop-blur-xl cursor-pointer"
                    style={{ background: '#1a1a1a', minWidth: '210px' }}
                >
                    {/* Red phone icon — appears during call */}
                    <AnimatePresence>
                        {isInCall && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(239,68,68,0.15)' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text label */}
                    <div className="flex-1 text-left select-none">
                        <AnimatePresence mode="wait">
                            {labelText ? (
                                <motion.p
                                    key={labelText}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight whitespace-nowrap"
                                >
                                    {labelText}
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <p className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight">Talk with Our</p>
                                    <p className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight">Consultant</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Wave bars */}
                    <WaveBars state={waveState} />
                </motion.button>
            </motion.div>
        </>
    )
}

function WaveBars({ state }) {
    const animClass =
        state === 'speaking'  ? 'wave-bar-speaking' :
        state === 'listening' ? 'wave-bar-listening' :
        'wave-bar-idle'

    return (
        <div className="flex items-end gap-[3px]" style={{ height: '26px' }}>
            {[0, 1, 2, 3, 4].map((i) => (
                <span
                    key={i}
                    className={`w-[3px] rounded-full ${animClass}`}
                    style={{ backgroundColor: '#e05132', animationDelay: `${i * 0.13}s` }}
                />
            ))}
        </div>
    )
}
