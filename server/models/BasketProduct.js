import { BasketProduct as BasketProductMapping } from './mapping.js'
import { Basket as BasketMapping } from './mapping.js'

class BasketProduct {
    async getAll(basketId) {
        const basket = await BasketMapping.findByPk(basketId)
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        const items = await BasketProductMapping.findAll({where: {basketId}})
        return items
    }

    async getOne(basketId, productId) {
        const basket = await BasketMapping.findByPk(basketId)
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        const item = await BasketProductMapping.findOne({where: {basketId, productId}})
        if (!item) {
            throw new Error('Товара нет в корзине')
        }
        return item
    }

    async create(basketId, productId, data) {
        const basket = await BasketMapping.findByPk(basketId)
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        const quantity = Number.parseInt(data.quantity ?? 1, 10)
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error('Некорректное количество товара')
        }
        const item = await BasketProductMapping.create({basketId, productId, quantity})
        return item
    }

    async update(basketId, productId, data) {
        const basket = await BasketMapping.findByPk(basketId)
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        const item = await BasketProductMapping.findOne({where: {basketId, productId}})
        if (!item) {
            throw new Error('Товара нет в корзине')
        }
        if (data.quantity) {
            const quantity = Number.parseInt(data.quantity, 10)
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error('Некорректное количество товара')
            }
            await item.update({quantity})
        } else if (data.increment) {
            const increment = Number.parseInt(data.increment, 10)
            if (!Number.isInteger(increment) || increment <= 0) {
                throw new Error('Некорректное количество товара')
            }
            await item.increment('quantity', {by: increment})
        } else if (data.decrement) {
            const decrement = Number.parseInt(data.decrement, 10)
            if (!Number.isInteger(decrement) || decrement <= 0) {
                throw new Error('Некорректное количество товара')
            }
            await item.decrement('quantity', {by: decrement})
        }
        return item
    }

    async delete(basketId, productId) {
        const basket = await BasketMapping.findByPk(basketId)
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        const item = await BasketProductMapping.findOne({where: {basketId, productId}})
        if (!item) {
            throw new Error('Товара нет в корзине')
        }
        await item.destroy()
        return item
    }
}

export default new BasketProduct()
