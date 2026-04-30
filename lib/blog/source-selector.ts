import { BlogSource, scoreBlogSource } from './source-quality'

const library: BlogSource[] = [
  {
    title: 'OpenAI Platform Documentation',
    organization: 'OpenAI',
    url: 'https://platform.openai.com/docs/',
    type: 'Official documentation',
    supports: 'LLM-assisted workflows, model integration, prompts, and AI automation architecture.',
  },
  {
    title: 'Microsoft Learn: Azure AI Services',
    organization: 'Microsoft',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/',
    type: 'Official documentation',
    supports: 'Practical AI service patterns and responsible workflow building blocks.',
  },
  {
    title: 'IBM: What Is Workflow Automation?',
    organization: 'IBM',
    url: 'https://www.ibm.com/topics/workflow-automation',
    type: 'Industry explainer',
    supports: 'Workflow automation definitions and operational process context.',
  },
  {
    title: 'The State of AI',
    organization: 'McKinsey & Company',
    url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
    type: 'Industry report',
    supports: 'Business AI adoption context and executive AI value framing.',
  },
]

export function selectBlogSources(topic: string, minScore = 75, maxSources = 6) {
  return library
    .map((source) => ({ ...source, authorityScore: scoreBlogSource(source, topic) }))
    .filter((source) => Number(source.authorityScore) >= minScore)
    .slice(0, maxSources)
}
