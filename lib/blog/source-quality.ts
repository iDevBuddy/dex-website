export type BlogSource = {
  title: string
  organization?: string
  url: string
  type?: string
  supports?: string
  authorityScore?: number
}

const trustedDomains = [
  'openai.com',
  'platform.openai.com',
  'microsoft.com',
  'learn.microsoft.com',
  'ibm.com',
  'mckinsey.com',
  'deloitte.com',
  'hbr.org',
  'nist.gov',
  'mit.edu',
  'stanford.edu',
  'harvard.edu',
  'github.com',
  'kaggle.com',
  'developers.google.com',
  'cloud.google.com',
]

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function scoreBlogSource(source: BlogSource, topic = '') {
  const sourceHost = host(source.url)
  const trusted = trustedDomains.some((domain) => sourceHost === domain || sourceHost.endsWith(`.${domain}`))
  const topicWords = topic.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3)
  const text = `${source.title} ${source.organization || ''} ${source.type || ''} ${source.supports || ''}`.toLowerCase()
  const relevance = topicWords.length ? Math.round((topicWords.filter((word) => text.includes(word)).length / topicWords.length) * 100) : 60
  const authority = trusted ? 84 : 40
  return Math.max(0, Math.min(100, Math.round((authority * 0.7) + (relevance * 0.3))))
}
