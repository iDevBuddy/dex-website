import React from 'react'
import ReactDOM from 'react-dom/client'
import { VoiceProvider } from '@humeai/voice-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import './index.css'

// Recompute ScrollTrigger positions once web fonts settle the layout —
// prevents reveal animations from getting stuck (font-load shift makes
// cached trigger positions stale).
gsap.registerPlugin(ScrollTrigger)
if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
}
window.addEventListener('load', () => ScrollTrigger.refresh())

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <VoiceProvider>
            <App />
        </VoiceProvider>
    </React.StrictMode>,
)
