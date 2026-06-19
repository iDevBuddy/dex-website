'use client'
import { useState } from 'react'

const groups = {
    'LLMs': [
        ['OpenAI', 'OA'], ['Anthropic', 'AN'], ['Gemini', 'GE'], ['Llama', 'LL'], ['Mistral', 'MI'], ['DeepSeek', 'DS'],
    ],
    'Agent frameworks': [
        ['CrewAI', 'CA'], ['LangChain', 'LC'], ['AutoGen', 'AG'], ['n8n', 'N8'], ['Make', 'MK'], ['Streamlit', 'ST'],
    ],
    'Integrations & data': [
        ['Supabase', 'SB'], ['Twilio', 'TW'], ['WhatsApp', 'WA'], ['HubSpot', 'HS'], ['Microsoft Dynamics', 'MD'], ['Notion', 'NO'],
    ],
}

export default function Tools() {
    const tabs = Object.keys(groups)
    const [active, setActive] = useState(0)
    const items = groups[tabs[active]]

    return (
        <section id="tools" className="bg-dark py-16 lg:py-20">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="mb-8">
                    <span className="eyebrow mb-5">Tech Stack</span>
                    <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] max-w-xl">
                        Tools &amp; technologies
                    </h2>
                </div>

                {/* tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-border mb-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((t, i) => {
                        const on = active === i
                        return (
                            <button key={t} onClick={() => setActive(i)} className={`relative shrink-0 px-4 py-3 text-[0.84rem] font-semibold transition-colors ${on ? 'text-accent' : 'text-ghost-dim hover:text-ghost'}`}>
                                {t}
                                {on && <span className="absolute bottom-[-1px] left-3 right-3 h-[2px] bg-accent rounded-full" />}
                            </button>
                        )
                    })}
                </div>

                {/* ruled grid of tools */}
                <div key={active} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-border">
                    {items.map(([name, mono], i) => (
                        <div
                            key={name}
                            className="reveal-up group flex flex-col items-center justify-center gap-4 border-r border-b border-border py-10 px-3 text-center transition-colors duration-300 hover:bg-dark-deeper"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <span className="w-12 h-12 rounded-xl border border-border bg-dark-deeper flex items-center justify-center font-display text-base font-extrabold text-ghost tracking-tight transition-colors duration-300 group-hover:border-accent/40 group-hover:text-accent">
                                {mono}
                            </span>
                            <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ghost-dim group-hover:text-ghost transition-colors">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="font-mono text-[0.64rem] text-ghost-faint mt-7 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Production-grade, vendor-agnostic — we pick the right tool for each workflow.
                </p>
            </div>
        </section>
    )
}
