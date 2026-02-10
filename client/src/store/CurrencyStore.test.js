import CurrencyStore from './CurrencyStore.js'

describe('CurrencyStore', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('starts with saved value from localStorage', () => {
        localStorage.setItem('currency', 'RUB')

        const store = new CurrencyStore()

        expect(store.code).toBe('RUB')
    })

    it('normalizes and persists currency selection', () => {
        const store = new CurrencyStore()

        store.code = 'USD'
        expect(store.code).toBe('KZT')
        expect(localStorage.getItem('currency')).toBe('KZT')

        store.code = 'RUB'
        expect(store.code).toBe('RUB')
        expect(localStorage.getItem('currency')).toBe('RUB')
    })
})
