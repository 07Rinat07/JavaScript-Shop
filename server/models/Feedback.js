import { Op } from 'sequelize'
import {
    Feedback as FeedbackMapping,
    FeedbackBlock as FeedbackBlockMapping,
    User as UserMapping,
} from './mapping.js'

const FEEDBACK_STATUSES = Object.freeze({
    NEW: 'new',
    READ: 'read',
    SPAM: 'spam',
})

const FEEDBACK_STATUS_LIST = Object.freeze([
    FEEDBACK_STATUSES.NEW,
    FEEDBACK_STATUSES.READ,
    FEEDBACK_STATUSES.SPAM,
])

const sanitizeText = (value, maxLength) => {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, maxLength)
}

const normalizeEmail = (value) => sanitizeText(value, 120).toLowerCase()

const normalizeIp = (value) => sanitizeText(value, 80)

const normalizeStatusFilter = (value) => {
    const normalized = sanitizeText(value, 16).toLowerCase()
    return FEEDBACK_STATUS_LIST.includes(normalized) ? normalized : 'all'
}

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0

class Feedback {
    async isBlockedSender({email = '', sourceIp = ''} = {}) {
        const conditions = []
        if (email) {
            conditions.push({email})
        }
        if (sourceIp) {
            conditions.push({ip: sourceIp})
        }

        if (!conditions.length) return false

        const blocked = await FeedbackBlockMapping.findOne({
            where: {[Op.or]: conditions},
        })

        return !!blocked
    }

    async create(data) {
        const name = sanitizeText(data?.name, 120)
        const email = normalizeEmail(data?.email)
        const phone = sanitizeText(data?.phone, 80)
        const subject = sanitizeText(data?.subject, 120)
        const message = sanitizeText(data?.message, 3000)
        const sourceIp = normalizeIp(data?.sourceIp)
        const userAgent = sanitizeText(data?.userAgent, 400)
        const userId = Number.parseInt(data?.userId, 10)

        if (!name) throw new Error('Не указано имя отправителя')
        if (!email) throw new Error('Не указан email отправителя')
        if (!isValidEmail(email)) throw new Error('Некорректный email отправителя')
        if (!message || message.length < 8) throw new Error('Сообщение слишком короткое')

        const blockedSender = await this.isBlockedSender({email, sourceIp})
        if (blockedSender) {
            throw new Error('Отправка обращений для этого контакта заблокирована как спам')
        }

        const payload = {
            name,
            email,
            phone: phone || null,
            subject: subject || null,
            message,
            status: FEEDBACK_STATUSES.NEW,
            sourceIp: sourceIp || null,
            userAgent: userAgent || null,
        }

        if (isPositiveInteger(userId)) {
            payload.userId = userId
        }

        const feedback = await FeedbackMapping.create(payload)
        return feedback
    }

    async getAll(status = 'all') {
        const normalizedStatus = normalizeStatusFilter(status)
        const where = {}
        if (normalizedStatus !== 'all') {
            where.status = normalizedStatus
        }

        return FeedbackMapping.findAll({
            where,
            order: [['createdAt', 'DESC']],
        })
    }

    async getOne(id) {
        const feedback = await FeedbackMapping.findByPk(id, {
            include: [
                {
                    model: UserMapping,
                    attributes: ['id', 'email', 'role'],
                },
            ],
        })

        if (!feedback) {
            throw new Error('Обращение не найдено')
        }

        return feedback
    }

    async markAsRead(id) {
        const feedback = await FeedbackMapping.findByPk(id)
        if (!feedback) throw new Error('Обращение не найдено')

        const readAt = feedback.readAt ?? new Date()
        const nextStatus = feedback.status === FEEDBACK_STATUSES.SPAM
            ? FEEDBACK_STATUSES.SPAM
            : FEEDBACK_STATUSES.READ

        await feedback.update({
            status: nextStatus,
            readAt,
        })

        return feedback
    }

    async blockAsSpam(id) {
        const feedback = await FeedbackMapping.findByPk(id)
        if (!feedback) throw new Error('Обращение не найдено')

        const now = new Date()
        await feedback.update({
            status: FEEDBACK_STATUSES.SPAM,
            isSpam: true,
            isBlocked: true,
            spamAt: now,
            blockedAt: now,
            readAt: feedback.readAt ?? now,
        })

        const email = normalizeEmail(feedback.email)
        const ip = normalizeIp(feedback.sourceIp)

        if (email) {
            await FeedbackBlockMapping.findOrCreate({
                where: {email},
                defaults: {
                    email,
                    reason: 'spam-feedback',
                },
            })
        }

        if (ip) {
            await FeedbackBlockMapping.findOrCreate({
                where: {ip},
                defaults: {
                    ip,
                    reason: 'spam-feedback',
                },
            })
        }

        return feedback
    }

    async delete(id) {
        const feedback = await FeedbackMapping.findByPk(id)
        if (!feedback) throw new Error('Обращение не найдено')
        await feedback.destroy()
        return feedback
    }
}

export default new Feedback()
export { FEEDBACK_STATUSES, FEEDBACK_STATUS_LIST }
