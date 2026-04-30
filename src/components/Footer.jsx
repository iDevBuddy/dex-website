export default function Footer() {
    return (
        <footer className="pt-14 pb-8 bg-dark-deeper border-t border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div>
                        <a href="/" className="font-mono text-lg font-bold text-white tracking-tight mb-4 block">
                            DEX <span className="text-accent">by Akif Saeed</span>
                        </a>
                        <p className="text-gray-500 text-[0.85rem] leading-relaxed max-w-[260px]">
                            We build intelligent AI agents that automate operations, handle customer interactions, and drive results - 24/7.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-300 uppercase tracking-[2px] mb-5">Services</h4>
                        <div className="flex flex-col gap-2.5">
                            <a href="/#agents" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Voice Agents</a>
                            <a href="/#agents" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Chat Agents</a>
                            <a href="/#services" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Workflow Automation</a>
                            <a href="/#services" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">AI Consulting</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-300 uppercase tracking-[2px] mb-5">Industries</h4>
                        <div className="flex flex-col gap-2.5">
                            <a href="/#industries" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Medical Clinics</a>
                            <a href="/#industries" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Law Firms</a>
                            <a href="/#industries" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Real Estate</a>
                            <a href="/#industries" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">E-commerce</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-300 uppercase tracking-[2px] mb-5">Company</h4>
                        <div className="flex flex-col gap-2.5">
                            <a href="/blog" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Blog</a>
                            <a href="/about" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">About</a>
                            <a href="/contact" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Contact</a>
                            <a href="/privacy" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Privacy Policy</a>
                            <a href="/terms" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Terms</a>
                            <a href="/disclaimer" className="text-[0.85rem] text-gray-500 hover:text-accent transition-colors duration-200">Disclaimer</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="font-mono text-[0.72rem] text-gray-500">&copy; 2026 DEX by Akif Saeed. All rights reserved.</p>
                    <p className="font-mono text-[0.72rem] text-gray-500">AI Automation Agency</p>
                </div>
            </div>
        </footer>
    )
}
