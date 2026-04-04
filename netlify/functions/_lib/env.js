export function requireEnv(name) {
    const value = process.env[name]?.trim()
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }

    return value
}

export function optionalEnv(name, fallback = '') {
    return process.env[name]?.trim() || fallback
}
