export function inferContentPersona(topic = {}) {
    const text = `${topic.topic || ''} ${topic.keyword || ''} ${topic.category || ''}`.toLowerCase()
    const aiTerms = /\bagent|llm|gpt|gemma|model|prompt|github|kaggle|tool|repo|dataset|ai news\b/
    const businessTerms = /\bfinance|security|marketing|sales|operations|support|crm|lead|ecommerce|hr|reporting|automation\b/
    if (aiTerms.test(text) && businessTerms.test(text)) return 'Hybrid'
    if (aiTerms.test(text)) return 'AI Expert'
    if (businessTerms.test(text)) return 'Business Automation Expert'
    return process.env.DEFAULT_CONTENT_PERSONA || 'Hybrid'
}

export function inferBusinessFunction(topic = {}) {
    const text = `${topic.topic || ''} ${topic.keyword || ''}`.toLowerCase()
    if (/finance|invoice|billing|accounting|payment/.test(text)) return 'Finance'
    if (/security|risk|compliance|fraud/.test(text)) return 'Security'
    if (/marketing|content|seo|campaign/.test(text)) return 'Marketing'
    if (/sales|lead|crm|pipeline/.test(text)) return 'Sales'
    if (/support|ticket|customer service/.test(text)) return 'Customer Support'
    if (/ecommerce|shopify|store|cart/.test(text)) return 'Ecommerce'
    if (/\bhr|hiring|recruit|employee/.test(text)) return 'HR'
    if (/analytics|report|dashboard|metric/.test(text)) return 'Analytics'
    if (/operation|workflow|process/.test(text)) return 'Operations'
    return 'General'
}

export function inferAuthorityAngle(topic = {}) {
    const text = `${topic.topic || ''} ${topic.keyword || ''}`.toLowerCase()
    if (/trend|news|latest|explained/.test(text)) return 'trend_analysis'
    if (/tool|software|platform|repo|github|dataset|kaggle/.test(text)) return 'tool_tutorial'
    if (/case study|example|use case/.test(text)) return 'case_study'
    if (/how|guide|workflow|tutorial|step/.test(text)) return 'practical_workflow'
    if (/solution|fix|problem/.test(text)) return 'solution_guide'
    if (/trick|hack|advanced|expert/.test(text)) return 'expert_tricks'
    return process.env.DEFAULT_AUTHORITY_ANGLE || 'practical_workflow'
}

export function enrichTopicPersona(topic = {}) {
    return {
        ...topic,
        contentPersona: topic.contentPersona || inferContentPersona(topic),
        businessFunction: topic.businessFunction || inferBusinessFunction(topic),
        authorityAngle: topic.authorityAngle || inferAuthorityAngle(topic),
    }
}
