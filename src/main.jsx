import React from 'react'
import ReactDOM from 'react-dom/client'
import { VoiceProvider } from '@humeai/voice-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import App from './App'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Lenis buttery smooth-scroll (desktop), synced to GSAP ScrollTrigger ──
   Native momentum kept on touch devices; disabled for reduced-motion. */
if (typeof window !== 'undefined' && !reduceMotion) {
    const lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
    })

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // Smooth same-page anchor links (nav, CTAs) — accounts for the fixed nav.
    document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href*="#"]')
        if (!a) return
        const href = a.getAttribute('href') || ''
        const hash = href.slice(href.indexOf('#'))
        if (hash.length < 2) return
        let target
        try { target = document.querySelector(hash) } catch { return }
        if (target) {
            e.preventDefault()
            lenis.scrollTo(target, { offset: -96 })
        }
    })

    window.__lenis = lenis
}

/* ── Fail-safe scroll reveal — never leaves content hidden ──────────────
   Hidden state only applies when JS is active (.has-js); an IntersectionObserver
   reveals elements on enter, with a global timeout fallback. */
if (typeof document !== 'undefined' && !reduceMotion) {
    document.documentElement.classList.add('has-js')
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add('reveal-in')
                    io.unobserve(en.target)
                }
            })
        },
        { rootMargin: '0px 0px -7% 0px', threshold: 0.08 }
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.reveal-in)').forEach((el) => io.observe(el))
    const run = () => { scan(); setTimeout(scan, 400); setTimeout(scan, 1200) }
    if (document.readyState !== 'loading') run()
    else document.addEventListener('DOMContentLoaded', run)
    // absolute fallback: reveal everything after 3s no matter what
    setTimeout(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('reveal-in')), 3000)
    // keep ScrollTrigger + reveals correct after late content (fonts, images)
    document.fonts?.ready.then(() => { ScrollTrigger.refresh(); scan() })
}

window.addEventListener('load', () => ScrollTrigger.refresh())

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <VoiceProvider>
            <App />
        </VoiceProvider>
    </React.StrictMode>,
)
