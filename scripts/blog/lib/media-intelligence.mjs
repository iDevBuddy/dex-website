export function recommendMediaForArticle(articleOrTopic = {}) {
    const frontmatter = articleOrTopic.frontmatter || articleOrTopic
    const text = `${frontmatter.title || frontmatter.topic || ''} ${frontmatter.category || ''} ${frontmatter.authorityAngle || ''}`.toLowerCase()
    const type = frontmatter.contentType || frontmatter.authorityAngle || ''
    const recommendations = {
        featuredImage: true,
        infographic: false,
        slides: false,
        checklist: false,
        comparisonTable: false,
        workflowDiagram: false,
        downloadablePdf: false,
        notebookLmResearch: false,
        socialCarousel: false,
    }

    if (/comparison|tools|tool|software|platform/.test(text) || type === 'tool_tutorial') {
        recommendations.comparisonTable = true
        recommendations.slides = true
        recommendations.socialCarousel = true
    }
    if (/workflow|tutorial|how|step|guide/.test(text) || type === 'practical_workflow') {
        recommendations.workflowDiagram = true
        recommendations.checklist = true
    }
    if (/business automation|use case|case study|operations|support|sales|finance/.test(text) || type === 'case_study') {
        recommendations.infographic = true
        recommendations.workflowDiagram = true
    }
    if (/security|finance|risk|compliance/.test(text)) {
        recommendations.checklist = true
        recommendations.comparisonTable = true
    }
    if (/news|trend|latest|analysis/.test(text) || type === 'trend_analysis') {
        recommendations.infographic = true
        recommendations.notebookLmResearch = true
    }
    if (/pillar|complete guide|authority|ultimate/.test(text)) {
        recommendations.infographic = true
        recommendations.slides = true
        recommendations.checklist = true
        recommendations.downloadablePdf = true
    }

    return recommendations
}

export function mediaBrief(articleOrTopic = {}) {
    const frontmatter = articleOrTopic.frontmatter || articleOrTopic
    const recs = frontmatter.mediaRecommendations || recommendMediaForArticle(articleOrTopic)
    const enabled = Object.entries(recs).filter(([, value]) => value).map(([key]) => key)
    return [
        `Create supporting assets for: ${frontmatter.title || frontmatter.topic}`,
        `Recommended assets: ${enabled.join(', ') || 'featuredImage'}`,
        `Persona: ${frontmatter.contentPersona || 'Hybrid'}`,
        `Business function: ${frontmatter.businessFunction || 'General'}`,
        `Angle: ${frontmatter.authorityAngle || 'practical_workflow'}`,
        'Keep assets business-focused, clear, original, and safe for Google/AdSense.',
    ].join('\n')
}
