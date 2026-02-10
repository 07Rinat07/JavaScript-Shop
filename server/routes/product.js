import express from 'express'
import ProductController from '../controllers/Product.js'
import ProductPropController from '../controllers/ProductProp.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'

const router = new express.Router()
router.param('id', validateIntegerParam())
router.param('categoryId', validateIntegerParam())
router.param('brandId', validateIntegerParam())
router.param('productId', validateIntegerParam())

/*
 * Товары
 */

// список товаров выбранной категории и выбранного бренда
router.get('/getall/categoryId/:categoryId/brandId/:brandId', ProductController.getAll)
// список товаров выбранной категории
router.get('/getall/categoryId/:categoryId', ProductController.getAll)
// список товаров выбранного бренда
router.get('/getall/brandId/:brandId', ProductController.getAll)
// список всех товаров каталога
router.get('/getall', ProductController.getAll)
// получить один товар каталога
router.get('/getone/:id', ProductController.getOne)
// создать товар каталога — нужны права администратора
router.post('/create', authMiddleware, adminMiddleware, ProductController.create)
// обновить товар каталога  — нужны права администратора
router.put('/update/:id', authMiddleware, adminMiddleware, ProductController.update)
// удалить товар каталога  — нужны права администратора
router.delete('/delete/:id', authMiddleware, adminMiddleware, ProductController.delete)

/*
 * Свойства
 */

// список свойств товара
router.get('/:productId/property/getall', ProductPropController.getAll)
// одно свойство товара
router.get('/:productId/property/getone/:id', ProductPropController.getOne)
// создать свойство товара
router.post(
    '/:productId/property/create',
    authMiddleware,
    adminMiddleware,
    ProductPropController.create
)
// обновить свойство товара
router.put(
    '/:productId/property/update/:id',
    authMiddleware,
    adminMiddleware,
    ProductPropController.update
)
// удалить свойство товара
router.delete(
    '/:productId/property/delete/:id',
    authMiddleware,
    adminMiddleware,
    ProductPropController.delete
)

export default router
