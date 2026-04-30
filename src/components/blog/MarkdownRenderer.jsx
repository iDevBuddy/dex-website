import { slugify } from '../../lib/blog'

function inline(text) {
    const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g)
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
        if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) return <a key={index} href={link[2]}>{link[1]}</a>
        return part
    })
}

export default function MarkdownRenderer({ body }) {
    const lines = body.split(/\r?\n/)
    const nodes = []
    let list = []
    let skipReferences = false

    const flushList = () => {
        if (list.length) {
            nodes.push(
                <ul key={`list-${nodes.length}`}>
                    {list.map((item) => <li key={item}>{inline(item)}</li>)}
                </ul>,
            )
            list = []
        }
    }

    lines.forEach((line) => {
        const trimmed = line.trim()
        if (/^##\s+(references|sources|sources and references|research sources|sources used)\s*:?$/i.test(trimmed) || /^(\*\*)?references:(\*\*)?$/i.test(trimmed)) {
            flushList()
            skipReferences = true
            return
        }
        if (skipReferences && /^##\s+/.test(trimmed)) {
            skipReferences = false
        }
        if (skipReferences || /^---+$/.test(trimmed)) {
            return
        }

        if (!trimmed) {
            flushList()
            return
        }

        const listItem = trimmed.match(/^[-*]\s+(.+)/)
        if (listItem) {
            list.push(listItem[1])
            return
        }

        flushList()

        if (trimmed.startsWith('### ')) {
            const text = trimmed.replace('### ', '')
            nodes.push(<h3 key={nodes.length} id={slugify(text)}>{inline(text)}</h3>)
            return
        }

        if (trimmed.startsWith('## ')) {
            const text = trimmed.replace('## ', '')
            nodes.push(<h2 key={nodes.length} id={slugify(text)}>{inline(text)}</h2>)
            return
        }

        if (trimmed.startsWith('> ')) {
            nodes.push(<blockquote key={nodes.length}>{inline(trimmed.replace('> ', ''))}</blockquote>)
            return
        }

        nodes.push(<p key={nodes.length}>{inline(trimmed)}</p>)
    })

    flushList()

    return <div className="blog-prose">{nodes}</div>
}
