import express from 'express'
import OrderController from '../controllers/Order.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())

/*
 * только для администратора магазина
 */

// получить список всех заказов магазина
router.get(
    '/admin/getall',
    authMiddleware, adminMiddleware,
    OrderController.adminGetAll
)
// получить список заказов пользователя
router.get(
    '/admin/getall/user/:id',
    authMiddleware, adminMiddleware,
    OrderController.adminGetUser
)
// получить заказ по id
router.get(
    '/admin/getone/:id',
    authMiddleware, adminMiddleware,
    OrderController.adminGetOne
)
// создать новый заказ
router.post(
    '/admin/create',
    authMiddleware, adminMiddleware,
    OrderController.adminCreate
)
// удалить заказ по id
router.delete(
    '/admin/delete/:id',
    authMiddleware, adminMiddleware,
    OrderController.adminDelete
)

/*
 * для авторизованного пользователя
 */

// получить все заказы пользователя
router.get(
    '/user/getall',
    authMiddleware,
    OrderController.userGetAll
)
// получить один заказ пользователя
router.get(
    '/user/getone/:id',
    authMiddleware,
    OrderController.userGetOne
)
// создать новый заказ
router.post(
    '/user/create',
    authMiddleware,
    OrderController.userCreate
)

/*
 * для неавторизованного пользователя
 */

// создать новый заказ
router.post(
    '/guest/create',
    OrderController.guestCreate
)

export default router
