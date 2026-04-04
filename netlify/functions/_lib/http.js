export function json(statusCode, payload) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
        },
        body: JSON.stringify(payload),
    }
}

export function methodNotAllowed(allowed = ['POST']) {
    return {
        statusCode: 405,
        headers: {
            Allow: allowed.join(', '),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            error: `Method not allowed. Use ${allowed.join(', ')}.`,
        }),
    }
}

export async function parseJsonBody(event) {
    if (!event.body) {
        return {}
    }

    if (typeof event.body === 'string') {
        return JSON.parse(event.body)
    }

    return event.body
}
