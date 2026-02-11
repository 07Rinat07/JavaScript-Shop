import { Order as OrderMapping } from './mapping.js'
import { OrderItem as OrderItemMapping } from './mapping.js'
import { Payment as PaymentMapping } from './mapping.js'

class Order {
    async getAll(userId = null) {
        const options = {
            include: [
                {
                    model: PaymentMapping,
                    as: 'payment',
                    attributes: ['id', 'provider', 'status', 'currency', 'amount', 'providerPaymentId'],
                },
            ],
            order: [['createdAt', 'DESC']],
        }
        if (userId) {
            options.where = {userId}
        }
        const orders = await OrderMapping.findAll(options)
        return orders
    }

    async getOne(id, userId = null) {
        const options = {
            where: {id},
            include: [
                {model: OrderItemMapping, as: 'items', attributes: ['id', 'name', 'price', 'quantity']},
                {
                    model: PaymentMapping,
                    as: 'payment',
                    attributes: [
                        'id',
                        'provider',
                        'status',
                        'currency',
                        'amount',
                        'providerPaymentId',
                        'paidAt',
                        'failedAt',
                        'canceledAt',
                    ],
                },
            ],
        }
        if (userId) options.where.userId = userId
        const order = await OrderMapping.findOne(options)
        if (!order) {
            throw new Error('Заказ не найден в БД')
        }
        return order
    }

    async create(data) {
        // общая стоимость заказа
        const items = data.items
        const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        // данные для создания заказа
        const {name, email, phone, address, comment = null, userId = null} = data
        const transaction = await OrderMapping.sequelize.transaction()
        try {
            const order = await OrderMapping.create(
                {name, email, phone, address, comment, amount, userId},
                {transaction}
            )
            // товары, входящие в заказ
            for (let item of items) {
                await OrderItemMapping.create(
                    {
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        orderId: order.id,
                    },
                    {transaction}
                )
            }
            // возвращать будем заказ с составом
            const created = await OrderMapping.findByPk(order.id, {
                transaction,
                include: [
                    {model: OrderItemMapping, as: 'items', attributes: ['name', 'price', 'quantity']},
                    {
                        model: PaymentMapping,
                        as: 'payment',
                        attributes: ['id', 'provider', 'status', 'currency', 'amount', 'providerPaymentId'],
                    },
                ],
            })
            await transaction.commit()
            return created
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    async delete(id) {
        let order = await OrderMapping.findByPk(id, {
            include: [
                {model: OrderItemMapping, attributes: ['name', 'price', 'quantity']},
                {
                    model: PaymentMapping,
                    as: 'payment',
                    attributes: ['id', 'provider', 'status', 'currency', 'amount'],
                },
            ],
        })
        if (!order) {
            throw new Error('Заказ не найден в БД')
        }
        await order.destroy()
        return order
    }
}

export default new Order()
