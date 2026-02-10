import SiteContentModel from '../models/SiteContent.js'
import AppError from '../errors/AppError.js'

const ensurePayload = (body, message) => {
    if (!body || Object.keys(body).length === 0) {
        throw new Error(message)
    }
}

class SiteContent {
    async getContacts(req, res, next) {
        try {
            const contacts = await SiteContentModel.getContacts()
            res.json(contacts)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }

    async updateContacts(req, res, next) {
        try {
            ensurePayload(req.body, 'Нет данных для обновления контактов')
            const contacts = await SiteContentModel.updateContacts(req.body)
            res.json(contacts)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async getNavbar(req, res, next) {
        try {
            const navbar = await SiteContentModel.getNavbar()
            res.json(navbar)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }

    async updateNavbar(req, res, next) {
        try {
            ensurePayload(req.body, 'Нет данных для обновления шапки сайта')
            const navbar = await SiteContentModel.updateNavbar(req.body)
            res.json(navbar)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async getDelivery(req, res, next) {
        try {
            const delivery = await SiteContentModel.getDelivery()
            res.json(delivery)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }

    async updateDelivery(req, res, next) {
        try {
            ensurePayload(req.body, 'Нет данных для обновления страницы доставки')
            const delivery = await SiteContentModel.updateDelivery(req.body)
            res.json(delivery)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async getHome(req, res, next) {
        try {
            const home = await SiteContentModel.getHome()
            res.json(home)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }

    async updateHome(req, res, next) {
        try {
            ensurePayload(req.body, 'Нет данных для обновления главной страницы')
            const home = await SiteContentModel.updateHome(req.body)
            res.json(home)
        } catch (e) {
            next(AppError.badRequest(e.message))
        }
    }

    async deleteHome(req, res, next) {
        try {
            const home = await SiteContentModel.deleteHome()
            res.json(home)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }
}

export default new SiteContent()
