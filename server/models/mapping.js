import sequelize from '../sequelize.js'
import database from 'sequelize'

const { DataTypes } = database

/*
 * Описание моделей
 */

// модель «Пользователь», таблица БД «users»
const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: 'USER'},
})

// модель «Корзина», таблица БД «baskets»
const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

// связь между корзиной и товаром через промежуточную таблицу «basket_products»
// у этой таблицы будет составной первичный ключ (basket_id + product_id)
const BasketProduct = sequelize.define('basket_product', {
    quantity: {type: DataTypes.INTEGER, defaultValue: 1},
})

// модель «Товар», таблица БД «products»
const Product = sequelize.define('product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 0},
    image: {type: DataTypes.STRING, allowNull: false},
})

// модель «Категория», таблица БД «categories»
const Category = sequelize.define('category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
})

// модель «Бренд», таблица БД «brands»
const Brand = sequelize.define('brand', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
})

// связь между товаром и пользователем через промежуточную таблицу «rating»
// у этой таблицы будет составной первичный ключ (product_id + user_id)
const Rating = sequelize.define('rating', {
    rate: {type: DataTypes.INTEGER, allowNull: false},
})

// свойства товара, у одного товара может быть много свойств
const ProductProp = sequelize.define('product_prop', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    value: {type: DataTypes.STRING, allowNull: false},
})

// модель «Заказ», таблица БД «orders»
const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING, allowNull: false},
    address: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.INTEGER, allowNull: false},
    status: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    comment: {type: DataTypes.STRING},
    prettyCreatedAt: {
        type: DataTypes.VIRTUAL,
        get() {
            const value = this.getDataValue('createdAt')
            const day = value.getDate()
            const month = value.getMonth() + 1
            const year = value.getFullYear()
            const hours = value.getHours()
            const minutes = value.getMinutes()
            return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
        }
    },
    prettyUpdatedAt: {
        type: DataTypes.VIRTUAL,
        get() {
            const value = this.getDataValue('updatedAt')
            const day = value.getDate()
            const month = value.getMonth() + 1
            const year = value.getFullYear()
            const hours = value.getHours()
            const minutes = value.getMinutes()
            return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
        }
    },
})

// позиции заказа, в одном заказе может быть несколько позиций (товаров)
const OrderItem = sequelize.define('order_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
})

// контентные блоки сайта (например, контакты), хранение в формате key/value
const SiteContent = sequelize.define('site_content', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    key: {type: DataTypes.STRING, unique: true, allowNull: false},
    value: {type: DataTypes.JSONB, allowNull: false, defaultValue: {}},
})

// обращения из формы обратной связи
const Feedback = sequelize.define('feedback', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING},
    subject: {type: DataTypes.STRING},
    message: {type: DataTypes.TEXT, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: false, defaultValue: 'new'},
    isSpam: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    isBlocked: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    sourceIp: {type: DataTypes.STRING},
    userAgent: {type: DataTypes.STRING},
    readAt: {type: DataTypes.DATE},
    spamAt: {type: DataTypes.DATE},
    blockedAt: {type: DataTypes.DATE},
})

// блокировки отправителей фидбека (по email и/или ip)
const FeedbackBlock = sequelize.define('feedback_block', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    ip: {type: DataTypes.STRING, unique: true},
    reason: {type: DataTypes.STRING, allowNull: false, defaultValue: 'spam'},
})

// платеж по заказу
const Payment = sequelize.define('payment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    provider: {type: DataTypes.STRING, allowNull: false, defaultValue: 'mock'},
    amount: {type: DataTypes.INTEGER, allowNull: false},
    currency: {type: DataTypes.STRING, allowNull: false, defaultValue: 'KZT'},
    status: {type: DataTypes.STRING, allowNull: false, defaultValue: 'CREATED'},
    providerPaymentId: {type: DataTypes.STRING, unique: true},
    idempotencyKey: {type: DataTypes.STRING, allowNull: false},
    metadata: {type: DataTypes.JSONB, allowNull: false, defaultValue: {}},
    paidAt: {type: DataTypes.DATE},
    failedAt: {type: DataTypes.DATE},
    canceledAt: {type: DataTypes.DATE},
})

// события вебхуков платежного провайдера
const PaymentEvent = sequelize.define('payment_event', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    provider: {type: DataTypes.STRING, allowNull: false},
    providerEventId: {type: DataTypes.STRING, allowNull: false},
    eventType: {type: DataTypes.STRING, allowNull: false},
    payload: {type: DataTypes.JSONB, allowNull: false, defaultValue: {}},
    processedAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
})

/*
 * Описание связей
 */

// связь many-to-many товаров и корзин через промежуточную таблицу basket_products;
// товар может быть в нескольких корзинах, в корзине может быть несколько товаров
Basket.belongsToMany(Product, { through: BasketProduct, onDelete: 'CASCADE' })
Product.belongsToMany(Basket, { through: BasketProduct, onDelete: 'CASCADE' })

// super many-to-many https://sequelize.org/master/manual/advanced-many-to-many.html
// это обеспечит возможность любых include при запросах findAll, findOne, findByPk
Basket.hasMany(BasketProduct)
BasketProduct.belongsTo(Basket)
Product.hasMany(BasketProduct)
BasketProduct.belongsTo(Product)

// связь категории с товарами: в категории может быть несколько товаров, но
// каждый товар может принадлежать только одной категории
Category.hasMany(Product, {onDelete: 'RESTRICT'})
Product.belongsTo(Category)

// связь бренда с товарами: у бренда может быть много товаров, но каждый товар
// может принадлежать только одному бренду
Brand.hasMany(Product, {onDelete: 'RESTRICT'})
Product.belongsTo(Brand)

// связь many-to-many товаров и пользователей через промежуточную таблицу rating;
// за один товар могут проголосовать несколько зарегистрированных пользователей,
// один пользователь может проголосовать за несколько товаров
Product.belongsToMany(User, {through: Rating, onDelete: 'CASCADE'})
User.belongsToMany(Product, {through: Rating, onDelete: 'CASCADE'})

// super many-to-many https://sequelize.org/master/manual/advanced-many-to-many.html
// это обеспечит возможность любых include при запросах findAll, findOne, findByPk
Product.hasMany(Rating)
Rating.belongsTo(Product)
User.hasMany(Rating)
Rating.belongsTo(User)

// связь товара с его свойствами: у товара может быть несколько свойств, но
// каждое свойство связано только с одним товаром
Product.hasMany(ProductProp, {as: 'props', onDelete: 'CASCADE'})
ProductProp.belongsTo(Product)

// связь заказа с позициями: в заказе может быть несколько позиций, но
// каждая позиция связана только с одним заказом
Order.hasMany(OrderItem, {as: 'items', onDelete: 'CASCADE'})
OrderItem.belongsTo(Order)

// связь заказа с пользователями: у пользователя может быть несколько заказов,
// но заказ может принадлежать только одному пользователю
User.hasMany(Order, {as: 'orders', onDelete: 'SET NULL'})
Order.belongsTo(User)

// связь обращений с пользователями: одно обращение может принадлежать пользователю
User.hasMany(Feedback, {as: 'feedbacks', onDelete: 'SET NULL'})
Feedback.belongsTo(User)

// связь заказа с платежом: один заказ -> один платеж
Order.hasOne(Payment, {as: 'payment', foreignKey: 'orderId', onDelete: 'CASCADE'})
Payment.belongsTo(Order, {foreignKey: 'orderId'})

// связь платежа с входящими webhook-событиями
Payment.hasMany(PaymentEvent, {as: 'events', foreignKey: 'paymentId', onDelete: 'SET NULL'})
PaymentEvent.belongsTo(Payment, {foreignKey: 'paymentId'})

export {
    User,
    Basket,
    Product,
    Category,
    Brand,
    Rating,
    BasketProduct,
    ProductProp,
    Order,
    OrderItem,
    SiteContent,
    Feedback,
    FeedbackBlock,
    Payment,
    PaymentEvent,
}
