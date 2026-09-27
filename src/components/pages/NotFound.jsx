export default function NotFound() {
    return <main id="main-content" className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="font-display text-4xl font-extrabold text-ghost mb-5">Page not found</h1>
        <p className="text-ghost-dim mb-8">This address does not match a published page.</p>
        <a href="/blog" className="text-accent font-semibold">Browse the blog</a>
    </main>
}
