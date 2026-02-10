import express from 'express'
import RatingController from '../controllers/Rating.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('productId', validateIntegerParam())
router.param('rate', validateIntegerParam({min: 1, max: 5}))

router.get('/product/:productId', RatingController.getOne)
router.post('/product/:productId/rate/:rate', authMiddleware, RatingController.create)

export default router
