const JSON_HEADERS = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
}

export function json(statusCode, body) {
    return {
        statusCode,
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    }
}

export function methodNotAllowed(allowed) {
    return {
        statusCode: 405,
        headers: {
            ...JSON_HEADERS,
            Allow: allowed.join(', '),
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

    try {
        return JSON.parse(event.body)
    } catch {
        throw new Error('Invalid JSON body.')
    }
}
