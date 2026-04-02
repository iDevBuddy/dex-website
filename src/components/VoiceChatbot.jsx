import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AGENT_ID = 'agent_4501kn3whsk4eq6a22eyqpxf43nc'

export default function VoiceChatbot() {
  const [widgetOpen, setWidgetOpen] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    script.type = 'text/javascript'
    document.head.appendChild(script)
  }, [])

  const boxShadowValue = widgetOpen
    ? '0 0 0 5px rgba(224,81,50,0.14), 0 0 30px rgba(224,81,50,0.2), 0 8px 32px rgba(0,0,0,0.5)'
    : [
        '0 0 0 0px rgba(224,81,50,0.0), 0 8px 32px rgba(0,0,0,0.35)',
        '0 0 0 5px rgba(224,81,50,0.08), 0 0 22px rgba(224,81,50,0.12), 0 8px 32px rgba(0,0,0,0.35)',
        '0 0 0 0px rgba(224,81,50,0.0), 0 8px 32px rgba(0,0,0,0.35)',
      ]

  const boxShadowTransition = widgetOpen
    ? { duration: 0.35, ease: 'easeOut' }
    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }

  return (
    <>
      {/* ElevenLabs widget — hidden until button clicked */}
      <div
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          zIndex: 9998,
          display: widgetOpen ? 'block' : 'none',
        }}
      >
        <elevenlabs-convai agent-id={AGENT_ID} />
      </div>

      {/* Floating Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-[9999]"
      >
        <motion.button
          onClick={() => setWidgetOpen(prev => !prev)}
          animate={{ boxShadow: boxShadowValue }}
          transition={{ boxShadow: boxShadowTransition }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-3 pl-5 pr-4 py-3.5 rounded-[22px] border border-white/[0.06] backdrop-blur-xl cursor-pointer"
          style={{ background: '#1a1a1a', minWidth: '210px' }}
        >
          <div className="flex-1 text-left select-none">
            {widgetOpen ? (
              <p className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight whitespace-nowrap">
                Close Sarah
              </p>
            ) : (
              <>
                <p className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight">Talk with Sarah</p>
                <p className="text-white/50 font-medium text-[0.75rem] leading-tight tracking-tight">AI Consultant</p>
              </>
            )}
          </div>
          <WaveBars active={widgetOpen} />
        </motion.button>
      </motion.div>
    </>
  )
}

function WaveBars({ active }) {
  return (
    <div style={{ width: 32, height: 26, overflow: 'hidden' }} aria-hidden="true">
      <div className={active ? 'wave-anim-listening' : 'wave-anim-idle'} style={{ width: 64, height: 26 }}>
        <svg width="64" height="26" viewBox="0 0 64 26" fill="none">
          <path d="M0,13 C5,3 11,3 16,13 C21,23 27,23 32,13 C37,3 43,3 48,13 C53,23 59,23 64,13"
            stroke="#e05132" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M0,13 C5,23 11,23 16,13 C21,3 27,3 32,13 C37,23 43,23 48,13 C53,3 59,3 64,13"
            stroke="#e05132" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>
    </div>
  )
}
