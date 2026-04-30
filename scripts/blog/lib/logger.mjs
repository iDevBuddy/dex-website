export function log(event, details = {}) {
    const payload = {
        ts: new Date().toISOString(),
        event,
        ...details,
    }
    console.log(JSON.stringify(payload))
}

export function warn(event, details = {}) {
    log(`warn:${event}`, details)
}

export function fail(event, error) {
    log(`error:${event}`, {
        message: error?.message || String(error),
        stack: error?.stack,
    })
}
