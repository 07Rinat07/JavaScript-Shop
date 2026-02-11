import express from 'express'

import product from './product.js'
import category from './category.js'
import brand from './brand.js'
import user from './user.js'
import basket from './basket.js'
import rating from './rating.js'
import order from './order.js'
import content from './content.js'
import currency from './currency.js'
import feedback from './feedback.js'
import payment from './payment.js'

const router = new express.Router()

router.use('/product', product)
router.use('/category', category)
router.use('/brand', brand)
router.use('/user', user)
router.use('/basket', basket)
router.use('/rating', rating)
router.use('/order', order)
router.use('/content', content)
router.use('/currency', currency)
router.use('/feedback', feedback)
router.use('/payment', payment)

export default router
