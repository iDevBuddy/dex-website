import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { pagePaths, pageSeo } from './lib/pageSeo'
import { siteSchemas } from './lib/siteSchema'
export { pagePaths }
export function render(path) {
    return { html: renderToString(<App pathname={path} />), seo: pageSeo(path), siteSchemas }
}
