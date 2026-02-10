import express from 'express'
import SiteContentController from '../controllers/SiteContent.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'

const router = new express.Router()

// публичный контент страницы «Контакты»
router.get('/contacts', SiteContentController.getContacts)
// публичный контент шапки сайта
router.get('/navbar', SiteContentController.getNavbar)
// публичный контент страницы «Доставка»
router.get('/delivery', SiteContentController.getDelivery)
// публичный контент главной страницы
router.get('/home', SiteContentController.getHome)

// обновление контента страницы «Контакты» — только администратор
router.put('/contacts', authMiddleware, adminMiddleware, SiteContentController.updateContacts)
// обновление контента шапки сайта — только администратор
router.put('/navbar', authMiddleware, adminMiddleware, SiteContentController.updateNavbar)
// обновление контента страницы «Доставка» — только администратор
router.put('/delivery', authMiddleware, adminMiddleware, SiteContentController.updateDelivery)
// обновление контента главной страницы — только администратор
router.put('/home', authMiddleware, adminMiddleware, SiteContentController.updateHome)
// удаление (сброс) контента главной страницы — только администратор
router.delete('/home', authMiddleware, adminMiddleware, SiteContentController.deleteHome)

export default router
