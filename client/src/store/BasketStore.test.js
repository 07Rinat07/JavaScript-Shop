import BasketStore from './BasketStore.js'

describe('BasketStore', () => {
    it('calculates count and sum from products', () => {
        const store = new BasketStore()

        store.products = [
            { id: 1, price: 100, quantity: 2 },
            { id: 2, price: 250, quantity: 1 }
        ]

        expect(store.count).toBe(2)
        expect(store.sum).toBe(450)
    })

    it('returns zero sum for empty basket', () => {
        const store = new BasketStore()

        expect(store.count).toBe(0)
        expect(store.sum).toBe(0)
    })
})
