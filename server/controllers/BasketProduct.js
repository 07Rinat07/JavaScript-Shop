import BasketProductModel from '../models/BasketProduct.js'
import BasketModel from '../models/Basket.js'
import AppError from '../errors/AppError.js'

const check = async (req, res, next) => {
    try {
        if (!req.signedCookies.basketId) {
            throw new Error('Корзина еще не создана')
        }
        const basketId = Number.parseInt(req.signedCookies.basketId, 10)
        if (!Number.isInteger(basketId) || basketId <= 0) {
            throw new Error('Некорректный идентификатор корзины')
        }
        const exist = await BasketModel.isExist(basketId)
        if (!exist) {
            res.clearCookie('basketId')
            throw new Error('Корзина не найдена в БД')
        }
        return basketId
    } catch(e) {
        next(AppError.badRequest(e.message))
        return null
    }
}

class BasketProduct {
    async getAll(req, res, next) {
        const basketId = await check(req, res, next) // проверяем существование корзины
        if (!basketId) return
        try {
            const products = await BasketProductModel.getAll(basketId)
            res.json(products)
        } catch(e) {
            next(AppError.badRequest(e.message))
        }
    }

    async create(req, res, next) {
        const basketId = await check(req, res, next) // проверяем существование корзины
        if (!basketId) return
        try {
            if (!req.params.productId) {
                throw new Error('Не указан id товара')
            }
            const item = await BasketProductModel.create(
                basketId,
                Number.parseInt(req.params.productId, 10),
                req.body
            )
            res.json(item)
        } catch(e) {
            next(AppError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        const basketId = await check(req, res, next) // проверяем существование корзины
        if (!basketId) return
        try {
            if (!req.params.productId) {
                throw new Error('Не указан id товара')
            }
            const item = await BasketProductModel.update(
                basketId,
                Number.parseInt(req.params.productId, 10),
                req.body
            )
            res.json(item)
        } catch(e) {
            next(AppError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        const basketId = await check(req, res, next) // проверяем существование корзины
        if (!basketId) return
        try {
            if (!req.params.productId) {
                throw new Error('Не указан id товара')
            }
            const item = await BasketProductModel.delete(
                basketId,
                Number.parseInt(req.params.productId, 10),
            )
            res.json(item)
        } catch(e) {
            next(AppError.badRequest(e.message))
        }
    }
}

export default new BasketProduct()
