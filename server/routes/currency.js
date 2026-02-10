import express from 'express'
import CurrencyController from '../controllers/Currency.js'

const router = new express.Router()

// актуальный курс RUB -> KZT с внешней синхронизацией
router.get('/rub-kzt', CurrencyController.getRubToKztRate)

// обзор курсов относительно базовой валюты (по умолчанию KZT)
router.get('/overview', CurrencyController.getRatesOverview)

export default router
