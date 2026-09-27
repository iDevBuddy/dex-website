import { slugify } from '../../lib/blog'

function inline(text) {
    const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g)
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
        if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) return safeLink(link[2]) ? <a key={index} href={link[2]}>{link[1]}</a> : link[1]
        return part
    })
}

export function safeLink(url) {
    return /^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*|#[a-z0-9-]+)$/i.test(url) && !/[\\\u0000-\u0020]/.test(url)
}

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim())

export default function MarkdownRenderer({ body, skipSections = [] }) {
    const lines = body.split(/\r?\n/)
    const nodes = []
    let list = []
    let ordered = false
    let code = null
    let skipReferences = false
    let skipNamedSection = false
    const skipped = skipSections.map((section) => String(section).toLowerCase())

    const flushList = () => {
        if (list.length) {
            const Tag = ordered ? 'ol' : 'ul'
            nodes.push(<Tag key={`list-${nodes.length}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</Tag>)
            list = []
        }
    }

    lines.forEach((line, lineIndex) => {
        const trimmed = line.trim()
        if (code !== null) {
            if (trimmed.startsWith('```')) {
                nodes.push(<pre key={nodes.length}><code>{code.join('\n')}</code></pre>)
                code = null
            } else code.push(line)
            return
        }
        const headingText = trimmed.replace(/^#{2,3}\s+/, '').trim().toLowerCase()
        if (/^##\s+(references|sources|sources and references|research sources|sources used)\s*:?$/i.test(trimmed) || /^(\*\*)?references:(\*\*)?$/i.test(trimmed)) {
            flushList()
            skipReferences = true
            return
        }
        if (skipReferences && /^##\s+/.test(trimmed)) {
            skipReferences = false
        }
        if (/^##\s+/.test(trimmed) && skipped.includes(headingText)) {
            flushList()
            skipNamedSection = true
            return
        }
        if (skipNamedSection && /^##\s+/.test(trimmed)) {
            skipNamedSection = false
        }
        if (skipReferences || skipNamedSection || /^---+$/.test(trimmed)) {
            return
        }

        if (trimmed.startsWith('```')) { flushList(); code = []; return }
        if (trimmed.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[lineIndex + 1] || '')) {
            flushList()
            const headers = cells(trimmed), rows = []
            let end = lineIndex + 2
            while (end < lines.length && lines[end].trim().includes('|') && lines[end].trim()) rows.push(cells(lines[end++]))
            nodes.push(<div className="blog-table-scroll" key={nodes.length}><table><thead><tr>{headers.map((v, i) => <th key={i} scope="col">{inline(v)}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{headers.map((_, j) => <td key={j}>{inline(row[j] || '')}</td>)}</tr>)}</tbody></table></div>)
            // These lines belong to this table; do not render them again as paragraphs.
            for (let i = lineIndex + 1; i < end; i++) lines[i] = ''
            return
        }

        if (!trimmed) {
            flushList()
            return
        }

        const listItem = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)/)
        if (listItem) {
            const nextOrdered = /^\d+\./.test(trimmed)
            if (list.length && nextOrdered !== ordered) flushList()
            ordered = nextOrdered
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
    if (code !== null) nodes.push(<pre key={nodes.length}><code>{code.join('\n')}</code></pre>)

    return <div className="blog-prose">{nodes}</div>
}
