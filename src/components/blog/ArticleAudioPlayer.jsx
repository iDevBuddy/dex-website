import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'

export default function ArticleAudioPlayer({ title, text, audioSrc }) {
    const [status, setStatus] = useState('idle')
    const [rate, setRate] = useState(1)
    const audioRef = useRef(null)

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel()
        }
    }, [])

    const playBrowserVoice = () => {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`>-]/g, ' '))
        utterance.rate = rate
        utterance.onend = () => setStatus('idle')
        utterance.onerror = () => setStatus('idle')
        window.speechSynthesis.speak(utterance)
        setStatus('playing')
    }

    const play = () => {
        if (audioSrc && audioRef.current) {
            audioRef.current.playbackRate = rate
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
        <section className="rounded-lg border border-border bg-dark-card p-4" aria-label={`Listen to ${title}`}>
            {audioSrc && <audio ref={audioRef} src={audioSrc} onEnded={() => setStatus('idle')} preload="none" />}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <p className="font-semibold text-white">Listen to this article</p>
                    <p className="text-sm text-gray-500">{audioSrc ? 'MP3 audio available' : 'Browser voice fallback'}</p>
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
        </section>
    )
}
