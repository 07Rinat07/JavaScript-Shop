import CurrencyRateService from '../services/CurrencyRate.js'
import AppError from '../errors/AppError.js'

const parseRefreshFlag = (value) => {
    if (typeof value !== 'string') return false
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const parseSymbols = (value) => {
    if (Array.isArray(value)) {
        return value
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
    }
    return undefined
}

const parseBase = (value) => {
    if (typeof value !== 'string') return undefined
    return value.trim().toUpperCase()
}

class Currency {
    async getRubToKztRate(req, res, next) {
        try {
            const refresh = parseRefreshFlag(req.query.refresh)
            const data = await CurrencyRateService.getRubToKztRate({refresh})
            res.json({
                base: 'RUB',
                quote: 'KZT',
                ...data,
            })
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }

    async getRatesOverview(req, res, next) {
        try {
            const refresh = parseRefreshFlag(req.query.refresh)
            const base = parseBase(req.query.base)
            const symbols = parseSymbols(req.query.symbols)
            const data = await CurrencyRateService.getRatesOverview({
                base,
                symbols,
                refresh,
            })
            res.json(data)
        } catch (e) {
            next(AppError.internalServerError(e.message))
        }
    }
}

export default new Currency()
