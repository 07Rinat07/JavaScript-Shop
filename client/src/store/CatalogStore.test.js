import CatalogStore from './CatalogStore.js'
import { DEFAULT_SORT } from '../utils/catalogQuery.js'

describe('CatalogStore', () => {
    it('calculates pages from count and limit', () => {
        const store = new CatalogStore()

        store.count = 10
        store.limit = 3

        expect(store.pages).toBe(4)
    })

    it('returns zero pages when products count is zero', () => {
        const store = new CatalogStore()

        store.count = 0
        store.limit = 3

        expect(store.pages).toBe(0)
    })

    it('resets page to 1 when selected category changes', () => {
        const store = new CatalogStore()
        store.page = 5

        store.category = 2

        expect(store.page).toBe(1)
        expect(store.category).toBe(2)
    })

    it('resets page to 1 when selected brand changes', () => {
        const store = new CatalogStore()
        store.page = 6

        store.brand = 3

        expect(store.page).toBe(1)
        expect(store.brand).toBe(3)
    })

    it('stores categories, brands and products lists', () => {
        const store = new CatalogStore()
        const categories = [{id: 1, name: 'Phones'}]
        const brands = [{id: 1, name: 'Acme'}]
        const products = [{id: 1, name: 'Phone X'}]

        store.categories = categories
        store.brands = brands
        store.products = products

        expect(store.categories).toEqual(categories)
        expect(store.brands).toEqual(brands)
        expect(store.products).toEqual(products)
    })

    it('stores normalized query and sort values', () => {
        const store = new CatalogStore()
        store.page = 3

        store.q = '   laptop   '
        store.sort = 'price_desc'

        expect(store.page).toBe(1)
        expect(store.q).toBe('laptop')
        expect(store.sort).toBe('price_desc')
    })

    it('syncs filters from query params without side effects', () => {
        const store = new CatalogStore()

        store.syncFilters({
            category: 2,
            brand: 5,
            page: 4,
            q: ' phone ',
            sort: 'newest',
        })

        expect(store.category).toBe(2)
        expect(store.brand).toBe(5)
        expect(store.page).toBe(4)
        expect(store.q).toBe('phone')
        expect(store.sort).toBe('newest')
    })

    it('resets all catalog filters to defaults', () => {
        const store = new CatalogStore()

        store.syncFilters({
            category: 2,
            brand: 3,
            page: 2,
            q: 'tablet',
            sort: 'price_asc',
        })
        store.resetFilters()

        expect(store.category).toBeNull()
        expect(store.brand).toBeNull()
        expect(store.page).toBe(1)
        expect(store.q).toBe('')
        expect(store.sort).toBe(DEFAULT_SORT)
    })
})
