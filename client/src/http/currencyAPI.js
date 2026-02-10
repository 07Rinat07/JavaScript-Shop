import { guestInstance } from './index.js'

export const fetchRubToKztRate = async (refresh = false) => {
    const { data } = await guestInstance.get('currency/rub-kzt', {
        params: refresh ? {refresh: 1} : {},
    })
    return data
}

export const fetchRatesOverview = async ({base = 'KZT', symbols, refresh = false} = {}) => {
    const params = {}
    if (base) {
        params.base = base
    }
    if (Array.isArray(symbols) && symbols.length) {
        params.symbols = symbols.join(',')
    }
    if (refresh) {
        params.refresh = 1
    }
    const { data } = await guestInstance.get('currency/overview', {params})
    return data
}
