import express from 'express'
import PaymentController from '../controllers/Payment.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('orderId', validateIntegerParam())

// получить платеж по заказу (владелец заказа или администратор)
router.get('/order/:orderId', authMiddleware, PaymentController.getByOrder)
// инициация платежа по заказу с обязательным Idempotency-Key
router.post('/order/:orderId/initiate', authMiddleware, PaymentController.initiate)

const webhookRouter = new express.Router()
// webhook с сырым телом нужен для проверки HMAC-подписи
webhookRouter.post(
    '/:provider',
    express.raw({type: 'application/json', limit: '1mb'}),
    PaymentController.webhook
)

export {
    webhookRouter,
}

export default router
