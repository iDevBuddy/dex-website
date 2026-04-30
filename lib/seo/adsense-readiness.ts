export type AdsenseCheck = {
    name: string
    passed: boolean
    points: number
}

export type AdsenseReadinessReport = {
    score: number
    ready: boolean
    checks: AdsenseCheck[]
    recommendedActions: string[]
}

export function calculateAdsenseReadiness(checks: AdsenseCheck[]): AdsenseReadinessReport {
    const score = Math.min(100, checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0))
    return {
        score,
        ready: score >= 80,
        checks,
        recommendedActions: checks.filter((check) => !check.passed).map((check) => `Fix: ${check.name}`),
    }
}
