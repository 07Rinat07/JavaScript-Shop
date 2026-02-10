import express from 'express'
import UserController from '../controllers/User.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())

router.post('/signup', UserController.signup)
router.post('/login', UserController.login)
router.get('/check', authMiddleware, UserController.check)

router.get('/getall', authMiddleware, adminMiddleware, UserController.getAll)
router.get('/getone/:id', authMiddleware, adminMiddleware, UserController.getOne)
router.post('/create', authMiddleware, adminMiddleware, UserController.create)
router.put('/update/:id', authMiddleware, adminMiddleware, UserController.update)
router.delete('/delete/:id', authMiddleware, adminMiddleware, UserController.delete)

export default router
