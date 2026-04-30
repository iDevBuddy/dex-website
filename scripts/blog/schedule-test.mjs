import { config } from './lib/config.mjs'
import { log } from './lib/logger.mjs'
import { fileURLToPath } from 'node:url'

const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }

export function getNextBlogRun(now = new Date(), env = process.env) {
    const days = (env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 'SUN,MON,TUE,WED,THU,FRI,SAT' : (env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT'))
        .split(',')
        .map((day) => day.trim().toUpperCase())
        .filter(Boolean)
    const [hourRaw, minuteRaw] = (env.BLOG_GENERATION_TIME_UTC || '05:00').split(':')
    const hour = Number(hourRaw)
    const minute = Number(minuteRaw)
    const targetDays = days.map((day) => dayMap[day]).filter((day) => day !== undefined)
    if (!targetDays.length || Number.isNaN(hour) || Number.isNaN(minute)) {
        throw new Error('Invalid BLOG_GENERATION_DAYS or BLOG_GENERATION_TIME_UTC.')
    }
    for (let offset = 0; offset <= 8; offset += 1) {
        const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset, hour, minute, 0))
        if (targetDays.includes(candidate.getUTCDay()) && candidate > now) return candidate
    }
    throw new Error('Could not calculate next scheduled blog run.')
}

export async function scheduleTest() {
    const nextRun = getNextBlogRun()
    const payload = {
        authoritySprintEnabled: config.firstMonthAuthoritySprint,
        blogsPerWeek: config.firstMonthAuthoritySprint ? 7 : config.blogsPerWeek,
        days: config.firstMonthAuthoritySprint ? ['DAILY'] : config.blogGenerationDays,
        timeUtc: config.blogGenerationTimeUtc,
        timezone: config.blogTimezone,
        localTime: '10:00 Pakistan time',
        nextRunUtc: nextRun.toISOString(),
        manualApproval: config.manualApproval,
        autoPublish: config.autoPublish,
    }
    log('blog_schedule', payload)
    console.log(JSON.stringify(payload, null, 2))
    return payload
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    scheduleTest().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
