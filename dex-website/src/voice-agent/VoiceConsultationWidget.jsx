import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVoice } from '@humeai/voice-react'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildTranscript(messages) {
    return messages
        .filter((entry) => {
            if (!entry || typeof entry !== 'object') return false
            if (entry.type === 'user_message') return !entry.interim && entry.message?.content
            if (entry.type === 'assistant_message') return Boolean(entry.message?.content)
            return false
        })
        .map((entry) => ({
            role: entry.type === 'assistant_message' ? 'assistant' : 'user',
            content: entry.message.content.trim(),
        }))
        .filter((entry) => entry.content.length > 0)
}

function PulseIcon({ active }) {
    return (
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <AnimatePresence>
                {active ? (
                    <motion.span
                        className="absolute inset-0 rounded-full border border-accent/40"
                        initial={{ opacity: 0.7, scale: 0.9 }}
                        animate={{ opacity: 0, scale: 1.55 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                ) : null}
            </AnimatePresence>
            <svg
                aria-hidden="true"
                className="h-5 w-5 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Zm5 8a5 5 0 0 1-10 0M12 18v3m-4 0h8"
                />
            </svg>
        </div>
    )
}

function StatusChip({ phase, isPlaying }) {
    const label = {
        idle: 'Voice consultation',
        collecting_user_info: 'Confirmation form',
        connecting: 'Connecting',
        active: isPlaying ? 'Speaking' : 'Listening',
        ending: 'Wrapping up',
        error: 'Retry needed',
    }[phase]

    return (
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gray-400">
            {label}
        </div>
    )
}

export function VoiceConsultationWidget() {
    const { connect, disconnect, readyState, status, messages, chatMetadata, isPlaying, error, clearMessages } = useVoice()

    const [phase, setPhase] = useState('idle')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [lead, setLead] = useState({ fullName: '', email: '' })
    const [summaryDraft, setSummaryDraft] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({ fullName: '', email: '' })
    const [uiError, setUiError] = useState('')
    const [banner, setBanner] = useState(null)

    const phaseRef = useRef(phase)
    const chatMetadataRef = useRef(chatMetadata)
    const sessionRef = useRef(null)
    const transcriptRef = useRef([])
    const summaryStateRef = useRef({ previewed: false, inFlight: false, sent: false })

    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    useEffect(() => {
        chatMetadataRef.current = chatMetadata
    }, [chatMetadata])

    useEffect(() => {
        if (!banner) return undefined
        const id = window.setTimeout(() => setBanner(null), 6000)
        return () => window.clearTimeout(id)
    }, [banner])

    const transcriptPreview = useMemo(() => buildTranscript(messages).slice(-2), [messages])

    const resetContactState = useCallback(() => {
        setLead({ fullName: '', email: '' })
        setSummaryDraft(null)
        setFieldErrors({ fullName: '', email: '' })
        setUiError('')
        transcriptRef.current = []
        summaryStateRef.current = { previewed: false, inFlight: false, sent: false }
    }, [])

    const releaseSession = useCallback(() => {
        sessionRef.current = null
        clearMessages()
        transcriptRef.current = []
    }, [clearMessages])

    const previewSummary = useCallback(
        async (reason) => {
            if (!sessionRef.current || summaryStateRef.current.previewed || summaryStateRef.current.inFlight) {
                return
            }

            summaryStateRef.current.inFlight = true
            const transcript = buildTranscript(messages)
            transcriptRef.current = transcript

            try {
                const response = await fetch('/api/consultation-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: 'preview',
                        reason,
                        lead: sessionRef.current.lead,
                        sessionId: sessionRef.current.sessionId,
                        hume: {
                            chatId: chatMetadataRef.current?.chatId ?? null,
                            chatGroupId: chatMetadataRef.current?.chatGroupId ?? null,
                            requestId: chatMetadataRef.current?.requestId ?? null,
                        },
                        transcript,
                    }),
                })

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}))
                    throw new Error(payload.error || 'Failed to prepare the consultation recap.')
                }

                const payload = await response.json()
                const summary = payload.summary || null
                setSummaryDraft(summary)
                setLead({
                    fullName: summary?.customer_name || '',
                    email: summary?.customer_email || '',
                })
                summaryStateRef.current.previewed = true
            } catch (requestError) {
                setSummaryDraft(null)
                setLead({ fullName: '', email: '' })
                setUiError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'The conversation ended, but the confirmation form could not be prepared.'
                )
            } finally {
                summaryStateRef.current.inFlight = false
                setIsModalOpen(true)
                setPhase('collecting_user_info')
            }
        },
        [messages]
    )

    useEffect(() => {
        if (status.value === 'connected') {
            setPhase('active')
            return
        }

        if (status.value === 'error') {
            setPhase('error')
            setUiError(error?.message || 'Voice connection failed.')
            return
        }

        if (status.value !== 'disconnected' || !sessionRef.current) {
            return
        }

        const previousPhase = phaseRef.current
        const reason = previousPhase === 'ending' ? 'completed' : 'disconnected'

        if (previousPhase === 'active' || previousPhase === 'ending' || previousPhase === 'connecting') {
            void previewSummary(reason)
        }
    }, [error?.message, previewSummary, status.value])

    const startConversation = useCallback(async () => {
        resetContactState()
        setBanner(null)
        setPhase('connecting')

        try {
            const response = await fetch('/api/hume-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}))
                throw new Error(payload.error || 'Failed to prepare the voice session.')
            }

            const payload = await response.json()
            sessionRef.current = {
                sessionId: payload.sessionId,
                lead: { fullName: '', email: '' },
            }

            await connect({
                auth: { type: 'accessToken', value: payload.accessToken },
                configId: payload.configId,
                sessionSettings: payload.sessionSettings,
            })
        } catch (requestError) {
            sessionRef.current = null
            setUiError(requestError instanceof Error ? requestError.message : 'Failed to start the consultation.')
            setPhase('error')
        }
    }, [connect, resetContactState])

    const endConversation = useCallback(async () => {
        if (phaseRef.current !== 'active' && phaseRef.current !== 'connecting') return
        setPhase('ending')

        try {
            await disconnect()
        } catch (requestError) {
            setUiError(requestError instanceof Error ? requestError.message : 'Failed to end the consultation cleanly.')
            setPhase('error')
        }
    }, [disconnect])

    const closeModal = useCallback(() => {
        if (summaryStateRef.current.inFlight) return
        setIsModalOpen(false)
        setPhase('idle')
        if (!summaryStateRef.current.sent) {
            releaseSession()
            resetContactState()
        }
    }, [releaseSession, resetContactState])

    const sendConfirmation = useCallback(async () => {
        const nextErrors = {
            fullName: lead.fullName.trim() ? '' : 'Full name is required.',
            email: EMAIL_PATTERN.test(lead.email.trim()) ? '' : 'Enter a valid email address.',
        }

        if (nextErrors.fullName || nextErrors.email) {
            setFieldErrors(nextErrors)
            return
        }

        if (!sessionRef.current) {
            setUiError('No completed consultation was found.')
            return
        }

        summaryStateRef.current.inFlight = true
        setUiError('')

        try {
            const response = await fetch('/api/consultation-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'send',
                    reason: 'completed',
                    lead: {
                        fullName: lead.fullName.trim(),
                        email: lead.email.trim(),
                    },
                    sessionId: sessionRef.current.sessionId,
                    hume: {
                        chatId: chatMetadataRef.current?.chatId ?? null,
                        chatGroupId: chatMetadataRef.current?.chatGroupId ?? null,
                        requestId: chatMetadataRef.current?.requestId ?? null,
                    },
                    summary: summaryDraft,
                    transcript: transcriptRef.current,
                }),
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}))
                throw new Error(payload.error || 'Failed to send the confirmation emails.')
            }

            summaryStateRef.current.sent = true
            setBanner({ tone: 'success', text: 'Confirmation emails were sent successfully.' })
            setIsModalOpen(false)
            setPhase('idle')
            releaseSession()
            resetContactState()
        } catch (requestError) {
            setUiError(
                requestError instanceof Error ? requestError.message : 'Failed to send the confirmation emails.'
            )
        } finally {
            summaryStateRef.current.inFlight = false
        }
    }, [lead.email, lead.fullName, releaseSession, resetContactState, summaryDraft])

    const handleButtonClick = useCallback(() => {
        if (phase === 'idle' || phase === 'error') {
            void startConversation()
            return
        }

        if (phase === 'collecting_user_info') {
            closeModal()
            return
        }

        if (phase === 'connecting' || phase === 'active') {
            void endConversation()
        }
    }, [closeModal, endConversation, phase, startConversation])

    const primaryLabel = {
        idle: 'Talk to a DEX consultant',
        collecting_user_info: 'Send confirmation email',
        connecting: 'Connecting securely',
        active: isPlaying ? 'DEX is speaking' : 'DEX is listening',
        ending: 'Ending consultation',
        error: 'Retry voice consultation',
    }[phase]

    const secondaryLabel = {
        idle: 'Start the consultation instantly',
        collecting_user_info: 'Confirm recipient details after the call',
        connecting: 'Preparing your Hume session',
        active: 'Business consultation in progress',
        ending: 'Preparing your recap',
        error: uiError || 'Something interrupted the voice session',
    }[phase]

    return (
        <>
            <AnimatePresence>
                {banner ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className={`fixed bottom-28 right-6 z-[10002] max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
                            banner.tone === 'success'
                                ? 'border-emerald-500/25 bg-emerald-950/85 text-emerald-100'
                                : 'border-red-500/25 bg-red-950/85 text-red-100'
                        }`}
                    >
                        {banner.text}
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
                    >
                        <button
                            aria-label="Close recap form"
                            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
                            onClick={closeModal}
                            type="button"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="dex-panel relative z-10 w-full max-w-md rounded-[28px] p-6 text-left"
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                                        DEX consultation
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Where should we send it?</h2>
                                    <p className="mt-2 text-sm leading-6 text-gray-400">
                                        Confirm the name and email that should receive the consultation summary.
                                    </p>
                                </div>
                                <StatusChip phase={phase} isPlaying={isPlaying} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-gray-500">
                                        Full name
                                    </label>
                                    <input
                                        autoFocus
                                        className={`dex-field ${fieldErrors.fullName ? 'dex-field-error' : ''}`}
                                        onChange={(event) => {
                                            setLead((current) => ({ ...current, fullName: event.target.value }))
                                            setFieldErrors((current) => ({ ...current, fullName: '' }))
                                        }}
                                        placeholder="Your full name"
                                        type="text"
                                        value={lead.fullName}
                                    />
                                    {fieldErrors.fullName ? (
                                        <p className="mt-2 text-xs text-red-400">{fieldErrors.fullName}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-gray-500">
                                        Email
                                    </label>
                                    <input
                                        className={`dex-field ${fieldErrors.email ? 'dex-field-error' : ''}`}
                                        onChange={(event) => {
                                            setLead((current) => ({ ...current, email: event.target.value }))
                                            setFieldErrors((current) => ({ ...current, email: '' }))
                                        }}
                                        placeholder="you@company.com"
                                        type="email"
                                        value={lead.email}
                                    />
                                    {fieldErrors.email ? (
                                        <p className="mt-2 text-xs text-red-400">{fieldErrors.email}</p>
                                    ) : null}
                                </div>
                            </div>

                            {summaryDraft?.business_name || summaryDraft?.business_problem ? (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Consultation recap</p>
                                    {summaryDraft?.business_name ? (
                                        <p className="mt-3 text-sm text-gray-300">
                                            <span className="text-gray-500">Business:</span> {summaryDraft.business_name}
                                        </p>
                                    ) : null}
                                    {summaryDraft?.business_problem ? (
                                        <p className="mt-2 text-sm text-gray-300">
                                            <span className="text-gray-500">Problem:</span> {summaryDraft.business_problem}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}

                            {uiError ? <p className="mt-4 text-sm text-red-300">{uiError}</p> : null}

                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                                    onClick={closeModal}
                                    type="button"
                                >
                                    Close
                                </button>
                                <button
                                    className="flex-1 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={summaryStateRef.current.inFlight}
                                    onClick={() => {
                                        void sendConfirmation()
                                    }}
                                    type="button"
                                >
                                    {summaryStateRef.current.inFlight ? 'Sending...' : 'Send confirmation'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="fixed bottom-6 right-6 z-[9999]"
            >
                <motion.button
                    aria-label={phase === 'active' ? 'End Hume voice consultation' : 'Start Hume voice consultation'}
                    className="dex-widget-button flex min-w-[260px] items-center gap-4 rounded-[26px] px-4 py-3 text-left"
                    onClick={handleButtonClick}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                >
                    <PulseIcon active={phase === 'active' || phase === 'connecting'} />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-white">{primaryLabel}</p>
                            <StatusChip phase={phase} isPlaying={isPlaying} />
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-400">{secondaryLabel}</p>
                        {transcriptPreview.length > 0 && phase === 'active' ? (
                            <div className="mt-2 space-y-1">
                                {transcriptPreview.map((entry) => (
                                    <p key={`${entry.role}-${entry.content}`} className="truncate text-[11px] text-gray-500">
                                        <span className="text-gray-400">
                                            {entry.role === 'assistant' ? 'DEX' : 'Visitor'}:
                                        </span>{' '}
                                        {entry.content}
                                    </p>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </motion.button>
            </motion.div>

            <div
                aria-hidden="true"
                className="pointer-events-none fixed bottom-4 right-4 z-[9998] h-32 w-32 rounded-full bg-accent/10 blur-3xl"
            />

            <div className="sr-only">
                {readyState} {status.value}
            </div>
        </>
    )
}
