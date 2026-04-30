export type MediaRecommendations = {
    featuredImage: boolean
    infographic: boolean
    slides: boolean
    checklist: boolean
    workflowDiagram: boolean
    downloadablePdf: boolean
    notebookLmResearch: boolean
}

export function recommendMedia(input: { title?: string; category?: string; authorityAngle?: string }): MediaRecommendations {
    const text = `${input.title || ''} ${input.category || ''} ${input.authorityAngle || ''}`.toLowerCase()
    return {
        featuredImage: true,
        infographic: /business|use case|trend|pillar|finance|security/.test(text),
        slides: /tool|comparison|pillar|tutorial/.test(text),
        checklist: /workflow|tutorial|finance|security|pillar/.test(text),
        workflowDiagram: /workflow|automation|process|tutorial/.test(text),
        downloadablePdf: /pillar|complete guide/.test(text),
        notebookLmResearch: /news|trend|analysis|research/.test(text),
    }
}
