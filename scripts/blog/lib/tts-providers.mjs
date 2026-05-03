import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { audioDir, dataDir } from './content.mjs'

function configured(name) {
    return Boolean(process.env[name] && String(process.env[name]).trim())
}

function pythonCommand() {
    return process.platform === 'win32' ? 'python' : 'python3'
}

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env },
            stdio: ['ignore', 'pipe', 'pipe'],
        })
        let stdout = ''
        let stderr = ''
        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString()
        })
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
        })
        child.on('error', reject)
        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() })
                return
            }
            reject(new Error(stderr.trim() || stdout.trim() || `${command} exited with code ${code}`))
        })
    })
}

export async function generateNvidiaTtsAudio({ text, slug }) {
    const apiKey = process.env.NVIDIA_TTS_API_KEY || process.env.NVIDIA_API_KEY
    if (!apiKey) throw new Error('NVIDIA_TTS_API_KEY is missing.')

    const helperScript = path.join(process.cwd(), 'scripts', 'blog', 'lib', 'nvidia_tts_generate.py')
    const textFile = path.join(dataDir, `${slug}.tts.txt`)
    const outputFile = path.join(audioDir, `${slug}.wav`)
    await fs.mkdir(audioDir, { recursive: true })
    await fs.writeFile(textFile, text, 'utf8')

    const args = [
        helperScript,
        '--text-file',
        textFile,
        '--output',
        outputFile,
        '--api-key',
        apiKey,
        '--function-id',
        process.env.NVIDIA_TTS_FUNCTION_ID || '877104f7-e885-42b9-8de8-f6e4c6303969',
        '--server',
        process.env.NVIDIA_TTS_SERVER || 'grpc.nvcf.nvidia.com:443',
        '--voice',
        process.env.NVIDIA_TTS_VOICE || 'Magpie-Multilingual.EN-US.Aria',
        '--language-code',
        process.env.NVIDIA_TTS_LANGUAGE_CODE || 'en-US',
        '--sample-rate',
        String(Number(process.env.NVIDIA_TTS_SAMPLE_RATE || 22050)),
        '--max-chars',
        String(Math.min(Number(process.env.NVIDIA_TTS_MAX_CHARS || 380), 380)),
    ]

    try {
        const result = await runCommand(pythonCommand(), args)
        return {
            ok: true,
            provider: 'nvidia_tts',
            path: `/blog/audio/${slug}.wav`,
            outputFile,
            voice: process.env.NVIDIA_TTS_VOICE || 'Magpie-Multilingual.EN-US.Aria',
            stdout: result.stdout,
        }
    } finally {
        await fs.unlink(textFile).catch(() => {})
    }
}

export function ttsProviderConfigured(provider) {
    if (provider === 'nvidia_tts' || provider === 'nvidia_riva') {
        return configured('NVIDIA_TTS_API_KEY') || configured('NVIDIA_API_KEY')
    }
    if (provider === 'piper') return configured('PIPER_TTS_URL')
    if (provider === 'kokoro') return configured('KOKORO_TTS_URL')
    if (provider === 'minimax') return configured('MINIMAX_API_KEY')
    if (provider === 'elevenlabs') return configured('ELEVENLABS_API_KEY')
    if (provider === 'openai') return configured('OPENAI_API_KEY')
    return configured('TTS_API_URL')
}
