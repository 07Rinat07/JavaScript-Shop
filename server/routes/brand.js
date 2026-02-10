import express from 'express'
import BrandController from '../controllers/Brand.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())

router.get('/getall', BrandController.getAll)
router.get('/getone/:id', BrandController.getOne)
router.post('/create', authMiddleware, adminMiddleware, BrandController.create)
router.put('/update/:id', authMiddleware, adminMiddleware, BrandController.update)
router.delete('/delete/:id', authMiddleware, adminMiddleware, BrandController.delete)

export default router
