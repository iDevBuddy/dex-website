import path from 'node:path'
import { dataDir, readJson, writeJson } from './content.mjs'
import { config } from './config.mjs'

export function getPipelineOptions(argv = process.argv) {
    const getValue = (flag) => {
        const inline = argv.find((item) => item.startsWith(`${flag}=`))
        if (inline) return inline.slice(flag.length + 1)
        const index = argv.indexOf(flag)
        return index >= 0 ? argv[index + 1] : undefined
    }

    return {
        dryRun: argv.includes('--dry-run'),
        force: argv.includes('--force'),
        forceDraft: argv.includes('--force-draft') || argv.includes('--forceDraft'),
        manualApproval: argv.includes('--manual-approval') || (!argv.includes('--auto-publish') && config.manualApproval),
        autoPublish: argv.includes('--auto-publish') || config.autoPublish,
        topic: getValue('--topic'),
        slug: getValue('--slug'),
        minTopicScore: Number(getValue('--min-topic-score') || process.env.MIN_TOPIC_SCORE || config.minTopicScore || 75),
        sourceLimit: Number(getValue('--source-limit') || process.env.TOPIC_SOURCE_LIMIT || 12),
    }
}

export function shouldRequireApproval(options = {}) {
    return options.manualApproval !== false && !options.force && !options.autoPublish
}

export async function writePipelineJson(fileName, data, options = {}) {
    const target = options.dryRun
        ? path.join(dataDir, 'dry-run', fileName)
        : path.join(dataDir, fileName)
    await writeJson(target, data)
    return target
}

export async function readPipelineJson(fileName, fallback, options = {}) {
    if (options.dryRun) {
        const dryRunValue = await readJson(path.join(dataDir, 'dry-run', fileName), undefined)
        if (dryRunValue !== undefined) return dryRunValue
    }
    return readJson(path.join(dataDir, fileName), fallback)
}

export function modeDetails(options = {}) {
    return {
        dryRun: Boolean(options.dryRun),
        manualApproval: shouldRequireApproval(options),
        autoPublish: Boolean(options.autoPublish),
        force: Boolean(options.force),
    }
}
