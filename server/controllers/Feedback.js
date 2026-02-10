import FeedbackModel from '../models/Feedback.js'
import AppError from '../errors/AppError.js'

const resolveClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim()
    }

    if (Array.isArray(forwarded) && forwarded.length) {
        return String(forwarded[0]).trim()
    }

    return req.ip ?? req.socket?.remoteAddress ?? ''
}

class Feedback {
    async create(req, res, next) {
        try {
            const feedback = await FeedbackModel.create({
                ...req.body,
                sourceIp: resolveClientIp(req),
                userAgent: req.headers['user-agent'],
                userId: req.auth?.id,
            })
            res.status(201).json(feedback)
        } catch (e) {
            if (e.message.includes('заблокирована как спам')) {
                next(AppError.forbidden(e.message))
                return
            }
            next(AppError.badRequest(e.message))
        }
    }

    async adminGetAll(req, res, next) {
        try {
            const feedback = await FeedbackModel.getAll(req.query.status)
            res.json(feedback)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async adminGetOne(req, res, next) {
        try {
            const feedback = await FeedbackModel.getOne(req.params.id)
            res.json(feedback)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async adminMarkAsRead(req, res, next) {
        try {
            const feedback = await FeedbackModel.markAsRead(req.params.id)
            res.json(feedback)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async adminBlockAsSpam(req, res, next) {
        try {
            const feedback = await FeedbackModel.blockAsSpam(req.params.id)
            res.json(feedback)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async adminDelete(req, res, next) {
        try {
            const feedback = await FeedbackModel.delete(req.params.id)
            res.json(feedback)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }
}

export default new Feedback()
