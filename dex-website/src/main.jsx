import './styles.css'
import '../../assets/index-BN4JQaKt.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { VoiceProvider } from '@humeai/voice-react'
import { VoiceConsultationWidget } from './voice-agent/VoiceConsultationWidget'

const overlayRoot = document.createElement('div')
overlayRoot.id = 'dex-voice-overlay-root'
document.body.appendChild(overlayRoot)

createRoot(overlayRoot).render(
    <StrictMode>
        <VoiceProvider clearMessagesOnDisconnect={false}>
            <VoiceConsultationWidget />
        </VoiceProvider>
    </StrictMode>
)
