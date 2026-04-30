export type BlogEngineConfig = {
    siteUrl: string
    brandName: string
    authorName: string
    manualApproval: boolean
    autoPublish: boolean
    minQualityScore: number
    notebookLmMode: string
}

export function getBlogEngineConfig(env = process.env): BlogEngineConfig {
    return {
        siteUrl: env.SITE_URL || 'https://dexbyakif.com',
        brandName: env.BRAND_NAME || 'DEX by Akif Saeed',
        authorName: env.AUTHOR_NAME || 'Akif Saeed',
        manualApproval: env.MANUAL_APPROVAL !== 'false',
        autoPublish: env.USE_AUTO_PUBLISH === 'true',
        minQualityScore: Number(env.MIN_QUALITY_SCORE || 85),
        notebookLmMode: env.NOTEBOOKLM_MODE || 'manual',
    }
}
