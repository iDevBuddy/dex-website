import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'

export default function ArticleAudioPlayer({ title, text, audioSrc }) {
    const [status, setStatus] = useState('idle')
    const [rate, setRate] = useState(1)
    const [progress, setProgress] = useState(0)
    const audioRef = useRef(null)
    const estimatedListenTime = Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 170))

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel()
        }
    }, [])

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = rate
    }, [rate])

    const playBrowserVoice = () => {
        window.speechSynthesis.cancel()
        setProgress(0)
        const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`>-]/g, ' '))
        utterance.rate = rate
        utterance.onend = () => setStatus('idle')
        utterance.onerror = () => setStatus('idle')
        window.speechSynthesis.speak(utterance)
        setStatus('playing')
        const started = Date.now()
        const duration = estimatedListenTime * 60 * 1000 / rate
        const timer = window.setInterval(() => {
            if (window.speechSynthesis?.speaking && !window.speechSynthesis?.paused) {
                setProgress(Math.min(98, ((Date.now() - started) / duration) * 100))
            } else {
                window.clearInterval(timer)
            }
        }, 800)
    }

    const play = () => {
        if (audioSrc && audioRef.current) {
            audioRef.current.play()
            setStatus('playing')
            return
        }

        if (!('speechSynthesis' in window)) return
        if (status === 'paused') {
            window.speechSynthesis.resume()
            setStatus('playing')
            return
        }
        playBrowserVoice()
    }

    const pause = () => {
        if (audioSrc && audioRef.current) audioRef.current.pause()
        else window.speechSynthesis?.pause()
        setStatus('paused')
    }

    const stop = () => {
        if (audioSrc && audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        } else {
            window.speechSynthesis?.cancel()
        }
        setStatus('idle')
    }

    const replay = () => {
        stop()
        window.setTimeout(play, 50)
    }

    return (
        <section className="rounded-lg border border-accent/30 bg-gradient-to-br from-dark-card to-dark-deeper p-4 shadow-lg shadow-black/20" aria-label={`Listen to ${title}`}>
            {audioSrc && <audio ref={audioRef} src={audioSrc} onTimeUpdate={(event) => setProgress((event.currentTarget.currentTime / event.currentTarget.duration) * 100 || 0)} onEnded={() => setStatus('idle')} preload="none" />}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <p className="font-semibold text-white">Listen to this article</p>
                    <p className="text-sm text-gray-500">{estimatedListenTime} min listen | {audioSrc ? 'Humanized studio voice available' : 'Browser voice fallback'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={status === 'playing' ? pause : play} className="p-2.5 rounded-md bg-accent text-white hover:bg-accent-hover transition-colors" aria-label={status === 'playing' ? 'Pause audio' : 'Play audio'}>
                        {status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={replay} className="p-2.5 rounded-md border border-border text-gray-300 hover:text-white hover:border-border-hover transition-colors" aria-label="Replay audio">
                        <RotateCcw size={18} />
                    </button>
                    <button onClick={stop} className="p-2.5 rounded-md border border-border text-gray-300 hover:text-white hover:border-border-hover transition-colors" aria-label="Stop audio">
                        <Square size={18} />
                    </button>
                    <label className="sr-only" htmlFor="audio-rate">Audio speed</label>
                    <select
                        id="audio-rate"
                        value={rate}
                        onChange={(event) => setRate(Number(event.target.value))}
                        className="dex-field py-2 w-24"
                    >
                        <option value="0.85">0.85x</option>
                        <option value="1">1x</option>
                        <option value="1.15">1.15x</option>
                        <option value="1.3">1.3x</option>
                    </select>
                </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
        </section>
    )
}
