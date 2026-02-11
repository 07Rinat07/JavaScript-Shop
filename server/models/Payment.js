import { Op } from 'sequelize'
import {
    Order as OrderMapping,
    Payment as PaymentMapping,
    PaymentEvent as PaymentEventMapping,
} from './mapping.js'
import {
    PAYMENT_STATUSES,
    createCheckoutSession,
    normalizeProvider,
    normalizeWebhookEvent,
} from '../services/PaymentGateway.js'

const normalizeCurrency = (value) => {
    const normalized = String(value ?? 'KZT').trim().toUpperCase()
    return /^[A-Z]{3}$/.test(normalized) ? normalized : 'KZT'
}

const sanitizeIdempotencyKey = (value) => {
    const normalized = String(value ?? '').trim()
    if (!normalized) {
        throw new Error('Не указан Idempotency-Key')
    }
    if (normalized.length > 191) {
        throw new Error('Слишком длинный Idempotency-Key')
    }
    return normalized
}

const sanitizeReturnUrl = (value) => {
    if (typeof value !== 'string') return null
    const normalized = value.trim()
    if (!normalized) return null
    return normalized.slice(0, 1500)
}

const sanitizeMetadata = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {}
    }
    return value
}

const canAccessOrder = (order, auth) => {
    if (!auth) return false
    if (auth.role === 'ADMIN') return true
    return !!order.userId && Number(order.userId) === Number(auth.id)
}

const getStatusTimestamps = (status) => {
    const now = new Date()
    if (status === PAYMENT_STATUSES.SUCCEEDED) {
        return {paidAt: now, failedAt: null, canceledAt: null}
    }
    if (status === PAYMENT_STATUSES.FAILED) {
        return {paidAt: null, failedAt: now, canceledAt: null}
    }
    if (status === PAYMENT_STATUSES.CANCELED) {
        return {paidAt: null, failedAt: null, canceledAt: now}
    }
    return {}
}

class Payment {
    async findOrder(orderId) {
        const order = await OrderMapping.findByPk(orderId, {
            include: [
                {
                    model: PaymentMapping,
                    as: 'payment',
                    include: [{model: PaymentEventMapping, as: 'events'}],
                },
            ],
        })
        if (!order) {
            throw new Error('Заказ не найден в БД')
        }
        return order
    }

    async getByOrder(orderId, auth) {
        const order = await this.findOrder(orderId)
        if (!canAccessOrder(order, auth)) {
            throw new Error('Недостаточно прав для просмотра платежа')
        }
        return order.payment
    }

    async initiate({
        orderId,
        auth,
        provider = 'mock',
        idempotencyKey,
        currency = 'KZT',
        returnUrl = null,
        metadata = {},
    }) {
        const order = await this.findOrder(orderId)
        if (!canAccessOrder(order, auth)) {
            throw new Error('Недостаточно прав для создания платежа')
        }

        const normalizedProvider = normalizeProvider(provider)
        const normalizedKey = sanitizeIdempotencyKey(idempotencyKey)
        const normalizedCurrency = normalizeCurrency(currency)
        const normalizedReturnUrl = sanitizeReturnUrl(returnUrl)
        const normalizedMetadata = sanitizeMetadata(metadata)

        const byKey = await PaymentMapping.findOne({
            where: {
                provider: normalizedProvider,
                idempotencyKey: normalizedKey,
            },
        })

        if (byKey) {
            if (Number(byKey.orderId) !== Number(order.id)) {
                throw new Error('Idempotency-Key уже использован для другого заказа')
            }
            return {
                payment: byKey,
                checkoutUrl: byKey.metadata?.checkoutUrl ?? null,
                idempotent: true,
            }
        }

        const existingPayment = await PaymentMapping.findOne({
            where: {orderId: order.id},
        })

        if (existingPayment) {
            throw new Error('Для этого заказа платеж уже создан')
        }

        const checkout = createCheckoutSession({
            provider: normalizedProvider,
            orderId: order.id,
            amount: order.amount,
            currency: normalizedCurrency,
            returnUrl: normalizedReturnUrl,
        })

        const payment = await PaymentMapping.create({
            orderId: order.id,
            provider: normalizedProvider,
            amount: order.amount,
            currency: normalizedCurrency,
            status: checkout.status,
            providerPaymentId: checkout.providerPaymentId,
            idempotencyKey: normalizedKey,
            metadata: {
                ...normalizedMetadata,
                checkout: checkout.metadata,
                checkoutUrl: checkout.checkoutUrl,
            },
        })

        return {
            payment,
            checkoutUrl: checkout.checkoutUrl,
            idempotent: false,
        }
    }

    async processWebhookEvent({provider, payload}) {
        const event = normalizeWebhookEvent({provider, payload})
        const duplicate = await PaymentEventMapping.findOne({
            where: {
                provider: event.provider,
                providerEventId: event.providerEventId,
            },
        })

        if (duplicate) {
            const payment = duplicate.paymentId
                ? await PaymentMapping.findByPk(duplicate.paymentId)
                : null
            return {payment, event: duplicate, duplicate: true}
        }

        const payment = await PaymentMapping.findOne({
            where: {
                provider: event.provider,
                providerPaymentId: event.providerPaymentId,
            },
        })

        const transaction = await PaymentMapping.sequelize.transaction()
        try {
            let updatedPayment = null
            if (payment) {
                const nextStatus = event.status
                const timestamps = getStatusTimestamps(nextStatus)
                await payment.update(
                    {
                        status: nextStatus,
                        ...timestamps,
                        metadata: {
                            ...(payment.metadata ?? {}),
                            lastWebhook: {
                                eventType: event.eventType,
                                providerEventId: event.providerEventId,
                            },
                        },
                    },
                    {transaction}
                )
                updatedPayment = payment
            }

            const storedEvent = await PaymentEventMapping.create(
                {
                    paymentId: payment?.id ?? null,
                    provider: event.provider,
                    providerEventId: event.providerEventId,
                    eventType: event.eventType,
                    payload: event.payload,
                    processedAt: new Date(),
                },
                {transaction}
            )

            await transaction.commit()
            return {payment: updatedPayment, event: storedEvent, duplicate: false}
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    async getEvents(filters = {}) {
        const where = {}
        if (filters.provider) {
            where.provider = normalizeProvider(filters.provider)
        }
        if (filters.paymentId) {
            where.paymentId = Number.parseInt(filters.paymentId, 10)
        }
        if (filters.providerEventId) {
            where.providerEventId = String(filters.providerEventId).trim()
        }

        return PaymentEventMapping.findAll({
            where,
            include: [{model: PaymentMapping}],
            order: [
                ['processedAt', 'DESC'],
                ['id', 'DESC'],
            ],
            limit: 200,
        })
    }

    async getById(id, auth) {
        const payment = await PaymentMapping.findByPk(id, {
            include: [{model: OrderMapping}],
        })
        if (!payment) {
            throw new Error('Платеж не найден в БД')
        }

        const order = payment.order
        if (!order) {
            throw new Error('Заказ для платежа не найден в БД')
        }
        if (!canAccessOrder(order, auth)) {
            throw new Error('Недостаточно прав для просмотра платежа')
        }

        return payment
    }

    async findByProviderPaymentId(provider, providerPaymentId) {
        const normalizedProvider = normalizeProvider(provider)
        const normalizedId = String(providerPaymentId ?? '').trim()
        if (!normalizedId) return null
        return PaymentMapping.findOne({
            where: {
                provider: normalizedProvider,
                providerPaymentId: normalizedId,
            },
        })
    }

    async listByOrderIds(orderIds = []) {
        if (!Array.isArray(orderIds) || orderIds.length === 0) return []
        return PaymentMapping.findAll({
            where: {orderId: {[Op.in]: orderIds}},
            order: [['id', 'DESC']],
        })
    }
}

export default new Payment()
