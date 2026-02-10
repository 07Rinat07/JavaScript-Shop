import formatPrice, {
    convertPriceFromRub,
    DEFAULT_CURRENCY,
    normalizeCurrencyCode,
    RUB_TO_KZT_RATE,
} from './formatPrice.js'

describe('formatPrice utils', () => {
    it('uses KZT as default currency', () => {
        const price = formatPrice(100)

        expect(DEFAULT_CURRENCY).toBe('KZT')
        expect(/(₸|KZT)/.test(price)).toBe(true)
    })

    it('converts RUB amount to KZT using rate', () => {
        const amount = convertPriceFromRub(200, 'KZT', RUB_TO_KZT_RATE)
        expect(amount).toBe(1100)
    })

    it('returns RUB amount without conversion', () => {
        const amount = convertPriceFromRub(200, 'RUB', RUB_TO_KZT_RATE)
        expect(amount).toBe(200)
    })

    it('normalizes unsupported currency to default', () => {
        expect(normalizeCurrencyCode('USD')).toBe('KZT')
    })
})
