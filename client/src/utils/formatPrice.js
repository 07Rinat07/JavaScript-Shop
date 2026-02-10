export const DEFAULT_CURRENCY = 'KZT'
export const RUB_TO_KZT_RATE = 5.5

export const CURRENCY_OPTIONS = Object.freeze([
    {code: 'KZT', label: 'Тенге (₸)'},
    {code: 'RUB', label: 'Рубли (₽)'},
])

const formatters = Object.freeze({
    KZT: new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'KZT',
        maximumFractionDigits: 0,
    }),
    RUB: new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }),
})

export const normalizeCurrencyCode = (value) => value === 'RUB' ? 'RUB' : DEFAULT_CURRENCY

const toFiniteNumber = (value) => {
    const amount = Number.parseFloat(value)
    return Number.isFinite(amount) ? amount : 0
}

export const convertPriceFromRub = (value, currency = DEFAULT_CURRENCY, rubToKztRate = RUB_TO_KZT_RATE) => {
    const code = normalizeCurrencyCode(currency)
    const amount = toFiniteNumber(value)
    if (code === 'KZT') {
        return amount * rubToKztRate
    }
    return amount
}

const formatPrice = (value, currency = DEFAULT_CURRENCY, rubToKztRate = RUB_TO_KZT_RATE) => {
    const code = normalizeCurrencyCode(currency)
    const amount = convertPriceFromRub(value, code, rubToKztRate)
    return formatters[code].format(amount)
}

export default formatPrice
