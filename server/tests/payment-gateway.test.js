import test from 'node:test'
import assert from 'node:assert/strict'
import {
    PAYMENT_STATUSES,
    buildWebhookSignature,
    createCheckoutSession,
    normalizeWebhookEvent,
    parseRawWebhookBody,
    verifyWebhookSignature,
} from '../services/PaymentGateway.js'

test('createCheckoutSession returns mock payment payload', () => {
    const result = createCheckoutSession({
        provider: 'mock',
        orderId: 15,
        amount: 9900,
        currency: 'KZT',
        returnUrl: 'https://shop.local/checkout/success',
    })

    assert.equal(typeof result.providerPaymentId, 'string')
    assert.equal(result.providerPaymentId.startsWith('mock_'), true)
    assert.equal(result.status, PAYMENT_STATUSES.PENDING)
    assert.equal(typeof result.checkoutUrl, 'string')
})

test('verifyWebhookSignature validates HMAC signature', () => {
    const rawBody = Buffer.from(JSON.stringify({id: 'evt-1', paymentId: 'mock_1'}), 'utf8')
    const secret = '0123456789abcdef0123456789abcdef'
    const signature = buildWebhookSignature(rawBody, secret)

    assert.equal(
        verifyWebhookSignature({rawBody, signature, secret}),
        true
    )
    assert.equal(
        verifyWebhookSignature({rawBody, signature: `${signature}x`, secret}),
        false
    )
})

test('parseRawWebhookBody parses valid json body', () => {
    const payload = parseRawWebhookBody(Buffer.from('{"id":"evt-1"}', 'utf8'))
    assert.equal(payload.id, 'evt-1')
})

test('normalizeWebhookEvent normalizes mock event payload', () => {
    const event = normalizeWebhookEvent({
        provider: 'mock',
        payload: {
            eventId: 'evt-777',
            paymentId: 'mock_777',
            type: 'payment.succeeded',
            status: 'succeeded',
        },
    })

    assert.equal(event.provider, 'mock')
    assert.equal(event.providerEventId, 'evt-777')
    assert.equal(event.providerPaymentId, 'mock_777')
    assert.equal(event.eventType, 'payment.succeeded')
    assert.equal(event.status, PAYMENT_STATUSES.SUCCEEDED)
})
