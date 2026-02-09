import { Basket as BasketMapping } from './mapping.js'
import { Product as ProductMapping } from './mapping.js'
import { BasketProduct as BasketProductMapping } from './mapping.js'

const pretty = (basket) => {
    const data = {}
    data.id = basket.id
    data.products = []
    if (basket.products) {
        data.products = basket.products.map(item => {
            return {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.basket_product.quantity
            }
        })
    }
    return data
}

class Basket {
    async getOrCreate(basketId, attributes = ['id']) {
        let basket = await BasketMapping.findByPk(basketId, {
            attributes,
            include: [{model: ProductMapping, attributes: ['id', 'name', 'price']}],
        })
        if (!basket) {
            basket = await BasketMapping.create()
        }
        return basket
    }

    async getOne(basketId) {
        const basket = await this.getOrCreate(basketId)
        return pretty(basket)
    }

    async create() {
        const basket = await BasketMapping.create()
        return pretty(basket)
    }

    async append(basketId, productId, quantity) {
        let basket = await this.getOrCreate(basketId)
        basketId = basket.id
        // проверяем, есть ли уже этот товар в корзине
        const basket_product = await BasketProductMapping.findOne({
            where: {basketId, productId}
        })
        if (basket_product) { // есть в корзине
            await basket_product.increment('quantity', {by: quantity})
        } else { // нет в корзине
            await BasketProductMapping.create({basketId, productId, quantity})
        }
        // обновим объект корзины, чтобы вернуть свежие данные
        await basket.reload()
        return pretty(basket)
    }

    async increment(basketId, productId, quantity) {
        let basket = await this.getOrCreate(basketId)
        basketId = basket.id
        // проверяем, есть ли этот товар в корзине
        const basket_product = await BasketProductMapping.findOne({
            where: {basketId, productId}
        })
        if (basket_product) {
            await basket_product.increment('quantity', {by: quantity})
            // обновим объект корзины, чтобы вернуть свежие данные
            await basket.reload()
        }
        return pretty(basket)
    }

    async decrement(basketId, productId, quantity) {
        let basket = await this.getOrCreate(basketId)
        basketId = basket.id
        // проверяем, есть ли этот товар в корзине
        const basket_product = await BasketProductMapping.findOne({
            where: {basketId, productId}
        })
        if (basket_product) {
            if (basket_product.quantity > quantity) {
                await basket_product.decrement('quantity', {by: quantity})
            } else {
                await basket_product.destroy()
            }
            // обновим объект корзины, чтобы вернуть свежие данные
            await basket.reload()
        }
        return pretty(basket)
    }

    async remove(basketId, productId) {
        let basket = await this.getOrCreate(basketId)
        basketId = basket.id
        // проверяем, есть ли этот товар в корзине
        const basket_product = await BasketProductMapping.findOne({
            where: {basketId, productId}
        })
        if (basket_product) {
            await basket_product.destroy()
            // обновим объект корзины, чтобы вернуть свежие данные
            await basket.reload()
        }
        return pretty(basket)
    }

    async clear(basketId) {
        let basket = await this.getOrCreate(basketId)
        basketId = basket.id
        await BasketProductMapping.destroy({where: {basketId}})
        // обновим объект корзины, чтобы вернуть свежие данные
        await basket.reload()
        return pretty(basket)
    }

    async delete(basketId) {
        const basket = await BasketMapping.findByPk(basketId, {
            include: [{model: ProductMapping, as: 'products'}]
        })
        if (!basket) {
            throw new Error('Корзина не найдена в БД')
        }
        await basket.destroy()
        return pretty(basket)
    }

    async isExist(basketId) {
        const basket = await BasketMapping.findByPk(basketId, {attributes: ['id']})
        return !!basket
    }
}

export default new Basket()
