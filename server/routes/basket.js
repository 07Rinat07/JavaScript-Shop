import express from 'express'
import BasketController from '../controllers/Basket.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('productId', validateIntegerParam())
router.param('quantity', validateIntegerParam())

router.get('/getone', BasketController.getOne)
router.put('/product/:productId/append/:quantity', BasketController.append)
router.put('/product/:productId/increment/:quantity', BasketController.increment)
router.put('/product/:productId/decrement/:quantity', BasketController.decrement)
router.put('/product/:productId/remove', BasketController.remove)
router.put('/clear', BasketController.clear)

export default router
