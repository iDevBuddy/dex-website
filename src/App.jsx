import { useEffect, useState, lazy, Suspense } from 'react'
import { injectSiteSchema } from './lib/siteSchema'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import ProjectPipeline from './components/ProjectPipeline'
import AgentTypes from './components/AgentTypes'
import Benefits from './components/Benefits'
import Services from './components/Services'
import IndustryStudies from './components/IndustryStudies'
import Industries from './components/Industries'
import Demo from './components/Demo'
import Process from './components/Process'
import Tools from './components/Tools'
import FAQ from './components/FAQ'
import BlogTeaser from './components/BlogTeaser'
import Footer from './components/Footer'
const VoiceChatbot = lazy(() => import('./components/VoiceChatbot'))
import BlogIndex from './components/blog/BlogIndex'
import BlogPost from './components/blog/BlogPost'
import TrustPage from './components/pages/TrustPage'
import Capabilities from './components/pages/Capabilities'
import { trustPages } from './lib/trustPages'
import NotFound from './components/pages/NotFound'
import { pageSeo } from './lib/pageSeo'
import { setSeo } from './lib/seo'

function HomePage() {
    return (
        <main id="main-content">
            <Hero />
            <Stats />
            <ProjectPipeline />
            <AgentTypes />
            <Benefits />
            <Services />
            <IndustryStudies />
            <Industries />
            <Demo />
            <Process />
            <Tools />
            <FAQ />
            <BlogTeaser />
        </main>
    )
}

function Router({ path }) {

    if (path === '/capabilities') return <Capabilities />

    if (path === '/blog') return <BlogIndex />

    if (path.startsWith('/blog/')) {
        return <BlogPost slug={path.replace('/blog/', '')} />
    }

    const trustSlug = path.replace('/', '')
    const trustPage = trustPages[trustSlug]
    if (trustPage) return <TrustPage page={{ ...trustPage, slug: trustSlug }} />

    return path === '/' ? <HomePage /> : <NotFound />
}

export default function App({ pathname }) {
    const path = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')).replace(/\/$/, '') || '/'
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    useEffect(() => { injectSiteSchema(); setSeo(pageSeo(path)) }, [path])
    return (
        <div className="min-h-screen bg-dark font-sans">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Navbar />
            <Router path={path} />
            <Footer />
            {mounted && <Suspense fallback={null}><VoiceChatbot /></Suspense>}

        </div>
    )
}
