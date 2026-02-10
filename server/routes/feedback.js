import express from 'express'
import FeedbackController from '../controllers/Feedback.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())

// создать обращение через форму обратной связи (для всех пользователей)
router.post('/create', FeedbackController.create)

// административные действия
router.get(
    '/admin/getall',
    authMiddleware, adminMiddleware,
    FeedbackController.adminGetAll
)
router.get(
    '/admin/getone/:id',
    authMiddleware, adminMiddleware,
    FeedbackController.adminGetOne
)
router.patch(
    '/admin/read/:id',
    authMiddleware, adminMiddleware,
    FeedbackController.adminMarkAsRead
)
router.patch(
    '/admin/block/:id',
    authMiddleware, adminMiddleware,
    FeedbackController.adminBlockAsSpam
)
router.delete(
    '/admin/delete/:id',
    authMiddleware, adminMiddleware,
    FeedbackController.adminDelete
)

export default router
