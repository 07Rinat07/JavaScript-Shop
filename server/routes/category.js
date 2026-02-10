import express from 'express'
import CategoryController from '../controllers/Category.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())

router.get('/getall', CategoryController.getAll)
router.get('/getone/:id', CategoryController.getOne)
router.post('/create', authMiddleware, adminMiddleware, CategoryController.create)
router.put('/update/:id', authMiddleware, adminMiddleware, CategoryController.update)
router.delete('/delete/:id', authMiddleware, adminMiddleware, CategoryController.delete)

export default router
