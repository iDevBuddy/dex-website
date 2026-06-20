'use client'
import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import {
    siAnthropic, siGooglegemini, siMeta, siMistralai, siDeepseek,
    siCrewai, siLangchain, siLanggraph, siN8n, siStreamlit,
    siDatabricks, siSnowflake, siGooglecloud, siHubspot, siPostgresql,
} from 'simple-icons'

// OpenAI mark isn't in simple-icons — bundled directly (monochrome)
const OPENAI = {
    hex: '0D0D0D', vb: '0 0 256 260',
    path: 'M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z',
}

const groups = {
    'LLMs': [
        { name: 'OpenAI', icon: OPENAI }, { name: 'Anthropic', icon: siAnthropic }, { name: 'Gemini', icon: siGooglegemini },
        { name: 'Llama', icon: siMeta }, { name: 'Mistral', icon: siMistralai }, { name: 'DeepSeek', icon: siDeepseek },
    ],
    'Agent frameworks': [
        { name: 'CrewAI', icon: siCrewai }, { name: 'LangChain', icon: siLangchain }, { name: 'LangGraph', icon: siLanggraph },
        { name: 'AutoGen', mono: 'AG' }, { name: 'n8n', icon: siN8n }, { name: 'Streamlit', icon: siStreamlit },
    ],
    'Integrations & data': [
        { name: 'Databricks', icon: siDatabricks }, { name: 'Snowflake', icon: siSnowflake }, { name: 'Google Cloud', icon: siGooglecloud },
        { name: 'HubSpot', icon: siHubspot }, { name: 'PostgreSQL', icon: siPostgresql }, { name: 'Microsoft Dynamics', mono: 'MD' },
    ],
}

function Logo({ tool }) {
    if (tool.mono) {
        return (
            <span className="w-10 h-10 rounded-xl border border-border bg-dark-deeper flex items-center justify-center font-display text-sm font-extrabold text-ghost tracking-tight transition-colors duration-300 group-hover:border-accent/40 group-hover:text-accent">
                {tool.mono}
            </span>
        )
    }
    const ic = tool.icon
    return (
        <svg viewBox={ic.vb || '0 0 24 24'} aria-label={tool.name} className="w-10 h-10 grayscale opacity-55 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
            <path d={ic.path} fill={`#${ic.hex}`} />
        </svg>
    )
}

export default function Tools() {
    const tabs = Object.keys(groups)
    const [active, setActive] = useState(0)
    const items = groups[tabs[active]]

    return (
        <section id="tools" className="bg-dark py-16 lg:py-20">
            <div className="max-w-[1320px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                    <div>
                        <span className="eyebrow mb-5">Tech Stack</span>
                        <h2 className="font-display text-3xl sm:text-[2.6rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] max-w-xl">
                            Tools &amp; technologies
                        </h2>
                    </div>
                    <p className="text-sm text-ghost-dim max-w-sm leading-relaxed md:text-right">
                        Production-grade, vendor-agnostic — we pick the right enterprise stack for each workflow.
                    </p>
                </div>

                <div className="flex gap-1 overflow-x-auto border-b border-border mb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

                <div key={active} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {items.map((t, i) => (
                        <div
                            key={t.name}
                            className="reveal-up group flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-dark py-10 px-3 text-center transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.25)]"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <Logo tool={t} />
                            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ghost-dim group-hover:text-ghost transition-colors">
                                {t.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* teaser footer → full capabilities page */}
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-7">
                    <p className="text-sm text-ghost-dim max-w-xl leading-relaxed">
                        See the full picture — every technology we engineer with, the industries we build for, and exactly how we ship production-grade agents.
                    </p>
                    <a href="/capabilities" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-grad-red text-white text-[0.84rem] font-semibold shrink-0">
                        Explore full capabilities
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    )
}
