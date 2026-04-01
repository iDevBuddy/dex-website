import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Conversation } from '@elevenlabs/client'

// Patch: ElevenLabs SDK crashes when server sends a message without error_event.
// Walk up the prototype chain and add a null-guard to handleErrorEvent.
;(function patchElevenLabs() {
    let proto = Conversation.prototype
    while (proto && proto !== Object.prototype) {
        if (Object.prototype.hasOwnProperty.call(proto, 'handleErrorEvent')) {
            const orig = proto.handleErrorEvent
            proto.handleErrorEvent = function (event) {
                if (!event || !event.error_event) return
                return orig.call(this, event)
            }
            break
        }
        proto = Object.getPrototypeOf(proto)
    }
})()

const AGENT_ID = 'agent_4501kn3whsk4eq6a22eyqpxf43nc'
const EMAIL_KEYWORDS = ['email', 'email address', 'send you', 'reach you']

export default function VoiceChatbot() {
    const [status, setStatus] = useState('idle') // idle | connecting | connected | disconnecting
    const [mode, setMode] = useState('listening') // speaking | listening
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [nameValue, setNameValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [phoneValue, setPhoneValue] = useState('')
    const [nameError, setNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [error, setError] = useState('')

    const conversationRef = useRef(null)
    const messagesRef = useRef([])
    const errorTimerRef = useRef(null)
    const connectTimeRef = useRef(null)

    const showError = useCallback((msg) => {
        setError(msg)
        clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setError(''), 5000)
    }, [])

    const startCall = useCallback(async () => {
        if (status !== 'idle') return
        setStatus('connecting')
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            const conv = await Conversation.startSession({
                agentId: AGENT_ID,
                onConnect: () => {
                    setStatus('connected')
                    connectTimeRef.current = Date.now()
                },
                onDisconnect: () => {
                    const duration = connectTimeRef.current ? Date.now() - connectTimeRef.current : 0
                    if (duration > 0 && duration < 10000) {
                        showError('Call dropped. Tap to try again.')
                    }
                    connectTimeRef.current = null
                    setStatus('idle')
                    setMode('listening')
                    conversationRef.current = null
                },
                onMessage: ({ message, source }) => {
                    messagesRef.current.push({
                        role: source === 'ai' ? 'assistant' : 'user',
                        content: message,
                    })
                    if (source === 'ai' && EMAIL_KEYWORDS.some(k => message.toLowerCase().includes(k))) {
                        setShowEmailInput(true)
                    }
                },
                onModeChange: ({ mode: m }) => setMode(m),
                onError: (err) => {
                    console.error('ElevenLabs error:', err)
                    showError(`Error: ${err?.message || JSON.stringify(err) || 'Connection failed'}`)
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
        setSubmitted(false)
        setNameValue('')
        setEmailValue('')
        setPhoneValue('')
        setNameError('')
        setEmailError('')
        messagesRef.current = []
        connectTimeRef.current = null
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

    const closePopup = () => {
        setShowEmailInput(false)
        setNameValue('')
        setEmailValue('')
        setPhoneValue('')
        setNameError('')
        setEmailError('')
    }

    const handleSubmit = async () => {
        let hasError = false
        if (!nameValue.trim()) {
            setNameError('Please enter your name.')
            hasError = true
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setEmailError('Please enter a valid email address.')
            hasError = true
        }
        if (hasError) return

        setNameError('')
        setEmailError('')

        const summary = messagesRef.current
            .map((m) => `${m.role === 'user' ? 'Visitor' : 'DEX'}: ${m.content}`)
            .join('\n')

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: nameValue.trim(),
                    clientEmail: emailValue.trim(),
                    clientPhone: phoneValue.trim(),
                    conversationSummary: summary,
                }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setEmailError(data.error || 'Failed to send. Please try again.')
                return
            }
        } catch {
            setEmailError('Network error. Please try again.')
            return
        }

        setSubmitted(true)
        setTimeout(() => {
            setShowEmailInput(false)
            setSubmitted(false)
            setNameValue('')
            setEmailValue('')
            setPhoneValue('')
        }, 2500)
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
        null

    const waveState =
        status === 'connected' && mode === 'speaking' ? 'speaking' :
        status === 'connected' ? 'listening' :
        'idle'

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
            {/* Centered contact popup */}
            <AnimatePresence>
                {showEmailInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60"
                            style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                            onClick={() => { if (!submitted) closePopup() }}
                        />

                        {/* Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full max-w-sm rounded-2xl p-6"
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(224,81,50,0.18)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 40px rgba(224,81,50,0.06)',
                            }}
                        >
                            {/* X close */}
                            {!submitted && (
                                <button
                                    onClick={closePopup}
                                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                    aria-label="Close"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M1 1l8 8M9 1L1 9" />
                                    </svg>
                                </button>
                            )}

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="text-center py-4"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ background: 'rgba(224,81,50,0.15)' }}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e05132" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <p className="text-white font-semibold text-base">Perfect!</p>
                                        <p className="text-gray-400 text-sm mt-1">You will hear back shortly.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <p className="font-mono text-[0.65rem] uppercase tracking-widest mb-2" style={{ color: '#e05132' }}>DEX AI Solutions</p>
                                        <h3 className="text-white font-semibold text-lg mb-1">Stay in touch</h3>
                                        <p className="text-gray-400 text-sm mb-5">Drop your details and we'll reach out shortly.</p>

                                        {/* Name */}
                                        <input
                                            type="text"
                                            value={nameValue}
                                            onChange={(e) => { setNameValue(e.target.value); setNameError('') }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                            placeholder="Your name"
                                            autoFocus
                                            className="w-full text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-600 transition-all mb-1"
                                            style={{
                                                background: '#111',
                                                border: nameError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(224,81,50,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(224,81,50,0.1)' }}
                                            onBlur={e => { e.target.style.border = nameError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                                        />
                                        {nameError && <p className="text-red-400 text-xs mb-2 pl-1">{nameError}</p>}
                                        {!nameError && <div className="mb-3" />}

                                        {/* Email */}
                                        <input
                                            type="email"
                                            value={emailValue}
                                            onChange={(e) => { setEmailValue(e.target.value); setEmailError('') }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                            placeholder="Email address"
                                            className="w-full text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-600 transition-all mb-1"
                                            style={{
                                                background: '#111',
                                                border: emailError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(224,81,50,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(224,81,50,0.1)' }}
                                            onBlur={e => { e.target.style.border = emailError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                                        />
                                        {emailError && <p className="text-red-400 text-xs mb-2 pl-1">{emailError}</p>}
                                        {!emailError && <div className="mb-3" />}

                                        {/* Phone */}
                                        <input
                                            type="tel"
                                            value={phoneValue}
                                            onChange={(e) => setPhoneValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                            placeholder="WhatsApp number (optional)"
                                            className="w-full text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-600 transition-all mb-4"
                                            style={{
                                                background: '#111',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(224,81,50,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(224,81,50,0.1)' }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                                        />

                                        <button
                                            onClick={handleSubmit}
                                            className="w-full py-3 rounded-xl text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 active:opacity-75"
                                            style={{ background: '#e05132' }}
                                        >
                                            Send
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
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
                                    <p className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight">Talk with DEX</p>
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
        state === 'speaking'  ? 'wave-anim-speaking' :
        state === 'listening' ? 'wave-anim-listening' :
        'wave-anim-idle'

    return (
        <div style={{ width: 32, height: 26, overflow: 'hidden' }} aria-hidden="true">
            <div className={animClass} style={{ width: 64, height: 26 }}>
                <svg width="64" height="26" viewBox="0 0 64 26" fill="none">
                    <path
                        d="M0,13 C5,3 11,3 16,13 C21,23 27,23 32,13 C37,3 43,3 48,13 C53,23 59,23 64,13"
                        stroke="#e05132"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M0,13 C5,23 11,23 16,13 C21,3 27,3 32,13 C37,23 43,23 48,13 C53,3 59,3 64,13"
                        stroke="#e05132"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.3"
                    />
                </svg>
            </div>
        </div>
    )
}
