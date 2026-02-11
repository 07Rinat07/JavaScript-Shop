import PaymentModel from '../models/Payment.js'
import AppError from '../errors/AppError.js'
import {
    parseRawWebhookBody,
    verifyWebhookSignature,
} from '../services/PaymentGateway.js'

const readIdempotencyKey = (req) => {
    const headerValue = req.headers['idempotency-key']
    if (Array.isArray(headerValue)) {
        return headerValue[0]
    }
    return headerValue
}

class Payment {
    async getByOrder(req, res, next) {
        try {
            const payment = await PaymentModel.getByOrder(req.params.orderId, req.auth)
            res.json(payment)
        } catch (e) {
            const status = e.message.includes('Недостаточно прав') ? 403 : 400
            const appError = status === 403
                ? AppError.forbidden(e.message)
                : AppError.badRequest(e.message)
            next(appError)
        }
    }

    async initiate(req, res, next) {
        try {
            const idempotencyKey = readIdempotencyKey(req)
            const result = await PaymentModel.initiate({
                orderId: req.params.orderId,
                auth: req.auth,
                provider: req.body?.provider,
                idempotencyKey,
                currency: req.body?.currency,
                returnUrl: req.body?.returnUrl,
                metadata: req.body?.metadata,
            })

            res.status(result.idempotent ? 200 : 201).json(result)
        } catch (e) {
            const status = e.message.includes('Недостаточно прав') ? 403 : 400
            const appError = status === 403
                ? AppError.forbidden(e.message)
                : AppError.badRequest(e.message)
            next(appError)
        }
    }

    async webhook(req, res, next) {
        try {
            const signature = req.headers['x-webhook-signature']
            const secret = process.env.PAYMENT_WEBHOOK_SECRET
            const rawBody = req.body
            const validSignature = verifyWebhookSignature({
                rawBody,
                signature,
                secret,
            })

            if (!validSignature) {
                next(AppError.unauthorized('Неверная подпись webhook'))
                return
            }

            const payload = parseRawWebhookBody(rawBody)
            const result = await PaymentModel.processWebhookEvent({
                provider: req.params.provider,
                payload,
            })

            res.json({
                ok: true,
                duplicate: result.duplicate,
                paymentId: result.payment?.id ?? null,
                eventId: result.event.id,
            })
        } catch (e) {
            if (e.message.includes('подпись')) {
                next(AppError.unauthorized(e.message))
                return
            }
            next(AppError.badRequest(e.message))
        }
    }
}

export default new Payment()
