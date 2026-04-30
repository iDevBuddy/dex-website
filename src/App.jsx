import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import AgentTypes from './components/AgentTypes'
import Services from './components/Services'
import Industries from './components/Industries'
import Demo from './components/Demo'
import Process from './components/Process'
import CTA from './components/CTA'
import Footer from './components/Footer'
import VoiceChatbot from './components/VoiceChatbot'
import BlogIndex from './components/blog/BlogIndex'
import BlogPost from './components/blog/BlogPost'
import TrustPage from './components/pages/TrustPage'
import { trustPages } from './lib/trustPages'

function HomePage() {
    return (
        <main id="main-content">
            <Hero />
            <Stats />
            <AgentTypes />
            <Services />
            <Industries />
            <Demo />
            <Process />
            <CTA />
        </main>
    )
}

function Router() {
    const path = window.location.pathname.replace(/\/$/, '') || '/'

    if (path === '/blog') return <BlogIndex />

    if (path.startsWith('/blog/')) {
        return <BlogPost slug={path.replace('/blog/', '')} />
    }

    const trustSlug = path.replace('/', '')
    const trustPage = trustPages[trustSlug]
    if (trustPage) return <TrustPage page={{ ...trustPage, slug: trustSlug }} />

    return <HomePage />
}

export default function App() {
    return (
        <div className="min-h-screen bg-dark font-sans">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Navbar />
            <Router />
            <Footer />
            <VoiceChatbot />

        </div>
    )
}
