import crypto from 'node:crypto'

const SUPPORTED_PAYMENT_PROVIDERS = Object.freeze(['mock'])
const PAYMENT_STATUSES = Object.freeze({
    CREATED: 'CREATED',
    PENDING: 'PENDING',
    SUCCEEDED: 'SUCCEEDED',
    FAILED: 'FAILED',
    CANCELED: 'CANCELED',
})

const normalizeProvider = (value) => {
    const normalized = String(value ?? 'mock').trim().toLowerCase()
    if (!SUPPORTED_PAYMENT_PROVIDERS.includes(normalized)) {
        throw new Error(`Неподдерживаемый платежный провайдер: ${normalized}`)
    }
    return normalized
}

const normalizePaymentStatus = (value) => {
    const normalized = String(value ?? '').trim().toUpperCase()
    if (Object.values(PAYMENT_STATUSES).includes(normalized)) {
        return normalized
    }
    return PAYMENT_STATUSES.PENDING
}

const parseRawWebhookBody = (rawBody) => {
    if (!rawBody) {
        throw new Error('Пустое тело webhook-запроса')
    }
    const payloadAsText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody)
    if (!payloadAsText.trim()) {
        throw new Error('Пустое тело webhook-запроса')
    }
    try {
        return JSON.parse(payloadAsText)
    } catch {
        throw new Error('Некорректный JSON в webhook-запросе')
    }
}

const buildWebhookSignature = (rawBody, secret) => {
    const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody ?? ''), 'utf8')
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
}

const verifyWebhookSignature = ({rawBody, signature, secret}) => {
    if (!secret || typeof secret !== 'string' || !secret.trim()) {
        throw new Error('Не настроен PAYMENT_WEBHOOK_SECRET')
    }
    const normalizedSignature = String(signature ?? '').trim()
    if (!normalizedSignature) {
        return false
    }

    const expected = buildWebhookSignature(rawBody, secret.trim())
    const left = Buffer.from(normalizedSignature, 'utf8')
    const right = Buffer.from(expected, 'utf8')
    if (left.length !== right.length) {
        return false
    }
    return crypto.timingSafeEqual(left, right)
}

const createMockCheckout = ({orderId, amount, currency, returnUrl}) => {
    const providerPaymentId = `mock_${crypto.randomUUID()}`
    const checkoutUrl = returnUrl
        ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}provider=mock&payment_id=${providerPaymentId}`
        : null

    return {
        providerPaymentId,
        checkoutUrl,
        status: PAYMENT_STATUSES.PENDING,
        metadata: {
            mode: 'mock',
            orderId,
            amount,
            currency,
        },
    }
}

const createCheckoutSession = ({
    provider = 'mock',
    orderId,
    amount,
    currency,
    returnUrl = null,
}) => {
    const normalizedProvider = normalizeProvider(provider)
    if (normalizedProvider === 'mock') {
        return createMockCheckout({orderId, amount, currency, returnUrl})
    }
    throw new Error(`Неподдерживаемый платежный провайдер: ${normalizedProvider}`)
}

const normalizeWebhookEvent = ({provider, payload}) => {
    const normalizedProvider = normalizeProvider(provider)
    if (!payload || typeof payload !== 'object') {
        throw new Error('Некорректный payload webhook-события')
    }

    if (normalizedProvider === 'mock') {
        const providerEventId = String(
            payload.eventId ?? payload.id ?? payload.event_id ?? ''
        ).trim()
        const providerPaymentId = String(
            payload.paymentId ?? payload.payment_id ?? payload.providerPaymentId ?? ''
        ).trim()
        if (!providerEventId) {
            throw new Error('Не указан providerEventId в webhook-событии')
        }
        if (!providerPaymentId) {
            throw new Error('Не указан providerPaymentId в webhook-событии')
        }

        return {
            provider: normalizedProvider,
            providerEventId,
            providerPaymentId,
            eventType: String(payload.type ?? 'payment.updated').trim() || 'payment.updated',
            status: normalizePaymentStatus(payload.status),
            payload,
        }
    }

    throw new Error(`Неподдерживаемый платежный провайдер: ${normalizedProvider}`)
}

export {
    SUPPORTED_PAYMENT_PROVIDERS,
    PAYMENT_STATUSES,
    buildWebhookSignature,
    createCheckoutSession,
    normalizeProvider,
    normalizeWebhookEvent,
    parseRawWebhookBody,
    verifyWebhookSignature,
}
