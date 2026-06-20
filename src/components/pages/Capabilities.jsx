'use client'
import { ArrowUpRight, ArrowLeft, Check } from 'lucide-react'
import DotNum from '../DotNum'

const TECH = [
    ['Agent Frameworks', ['LangChain', 'LangGraph', 'CrewAI', 'AutoGen', 'DSPy', 'Semantic Kernel']],
    ['Large Language Models', ['GPT-4o', 'Claude Opus & Sonnet', 'Llama 3', 'Mistral Large', 'Gemini Pro', 'Fine-tuned models']],
    ['RAG & Vector Databases', ['Pinecone', 'Weaviate', 'Chroma', 'pgvector', 'Supabase', 'Qdrant']],
    ['Cloud AI Platforms', ['AWS Bedrock', 'Azure OpenAI', 'Google Vertex AI', 'Hugging Face']],
    ['MLOps & Deployment', ['MLflow', 'Docker', 'Kubernetes', 'GitHub Actions', 'Weights & Biases']],
    ['Enterprise Integrations', ['Salesforce', 'Microsoft Dynamics', 'HubSpot', 'REST & GraphQL APIs', 'Webhooks', 'Twilio']],
]

const PROCESS = [
    ['Discovery & Workflow Audit', 'We map your existing workflows, surface the highest-value automation opportunities, assess data readiness, and define success metrics up front — grounded in how your business actually runs.'],
    ['Architecture & Model Selection', 'We design the right agent architecture — single, multi-agent, or hybrid — and select the optimal model balancing accuracy, cost, latency, and data privacy.'],
    ['Agent Development & Integration', 'We build iteratively, wiring RAG pipelines, memory, tools, and enterprise APIs. You see working demos at every stage, not just at the end.'],
    ['Testing, Evaluation & Guardrails', 'We measure task success, response accuracy, and policy compliance — adding human-in-the-loop controls and fallback logic at every critical decision point.'],
    ['Production Deployment', 'We ship into your live environment, integrated with your CRM, ERP, and cloud — built for security, scale, and observability from day one.'],
    ['Monitoring & Ongoing Optimization', 'We track performance, detect model drift, retrain on new data, and evolve guardrails as your business changes — with monthly reports on every key metric.'],
]

const INDUSTRIES = [
    ['Healthcare & Life Sciences', 'Automate clinical and administrative workflows and lift patient outcomes with agents built for healthcare-grade compliance.'],
    ['Financial Services & Banking', 'Automate compliance-heavy processes, speed up credit and risk decisions, and deliver intelligent advisory at scale.'],
    ['Legal & Professional Services', 'Read, analyze, classify, and act on document-heavy legal workflows faster than any manual team.'],
    ['E-commerce & Retail', '24/7 intelligent customer operations, automated order management, and hyper-personalized shopping across every channel.'],
    ['SaaS & Technology', 'Automate internal engineering and customer-facing workflows so your team scales output without scaling headcount.'],
    ['Logistics & Supply Chain', 'End-to-end supply-chain intelligence — from predictive inventory to automated shipment tracking, so disruptions are caught early.'],
    ['HR & Talent Operations', 'Cut time-to-hire, automate high-volume HR workflows, and deliver a better employee experience from day one.'],
]

export default function Capabilities() {
    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    return (
        <main id="main-content" className="bg-dark">
            {/* header */}
            <section className="px-4 sm:px-6 pt-28 pb-10">
                <div className="max-w-[1320px] mx-auto px-2">
                    <a href="/" className="flex w-fit items-center gap-2 text-[0.8rem] font-semibold text-ghost-dim hover:text-accent transition-colors mb-8">
                        <ArrowLeft size={15} /> Back to home
                    </a>
                    <span className="eyebrow mb-5">Capabilities</span>
                    <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-grad-dark tracking-tightest leading-[0.98] max-w-3xl mb-6">
                        How we build AI agents
                    </h1>
                    <p className="text-base text-ghost-dim leading-relaxed max-w-2xl">
                        The full picture — the technologies we engineer with, the industries we build for, and the exact process we follow to ship production-grade agents.
                    </p>
                </div>
            </section>

            {/* TECH STACK */}
            <section className="px-4 sm:px-6 py-12">
                <div className="max-w-[1320px] mx-auto px-2">
                    <span className="eyebrow mb-4">Tech Stack</span>
                    <h2 className="font-display text-3xl sm:text-[2.4rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] mb-10 max-w-xl">Our AI agent development stack</h2>
                    <div className="border-t border-border">
                        {TECH.map(([cat, tools]) => (
                            <div key={cat} className="grid md:grid-cols-[260px_1fr] gap-4 md:gap-8 py-6 border-b border-border">
                                <h3 className="font-display text-base font-bold text-ghost tracking-tight">{cat}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tools.map((t) => (
                                        <span key={t} className="px-3 py-1.5 rounded-lg border border-border bg-dark-deeper text-[0.8rem] font-medium text-ghost-dim hover:border-accent/40 hover:text-accent transition-colors">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS — Night block */}
            <section className="px-4 sm:px-6 py-6">
                <div className="max-w-[1320px] mx-auto">
                    <div className="rounded-[26px] bg-night p-7 sm:p-10 lg:p-14">
                        <span className="eyebrow eyebrow-light mb-4">Process</span>
                        <h2 className="font-display text-3xl sm:text-[2.4rem] font-extrabold text-white tracking-tightest leading-[1.0] mb-12 max-w-xl">Our development process</h2>
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
                            {PROCESS.map(([title, desc], i) => (
                                <div key={title} className="flex gap-5">
                                    <span className="text-accent shrink-0 pt-1"><DotNum value={String(i + 1).padStart(2, '0')} cell={5} /></span>
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-white tracking-tight mb-2">{title}</h3>
                                        <p className="text-[0.92rem] text-white/55 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* INDUSTRIES */}
            <section className="px-4 sm:px-6 py-12">
                <div className="max-w-[1320px] mx-auto px-2">
                    <span className="eyebrow mb-4">Industries</span>
                    <h2 className="font-display text-3xl sm:text-[2.4rem] font-extrabold text-grad-dark tracking-tightest leading-[1.0] mb-10 max-w-xl">AI agents built for your industry</h2>
                    <div className="grid md:grid-cols-2 border-t border-l border-border">
                        {INDUSTRIES.map(([title, desc]) => (
                            <div key={title} className="group border-r border-b border-border p-7 transition-colors hover:bg-dark-deeper">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <span className="w-1.5 h-1.5 bg-accent" />
                                    <h3 className="font-display text-[1.15rem] font-bold text-ghost tracking-tight">{title}</h3>
                                </div>
                                <p className="text-[0.9rem] text-ghost-dim leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 sm:px-6 py-16">
                <div className="max-w-[1320px] mx-auto px-2 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-border pt-12">
                    <div>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-grad-dark tracking-tightest leading-[1.0] max-w-lg">Ready to put agents to work?</h2>
                    </div>
                    <button onClick={openChatbot} className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-grad-red text-white font-semibold text-[0.85rem] cursor-pointer shrink-0">
                        Book a free consultation
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </section>
        </main>
    )
}
