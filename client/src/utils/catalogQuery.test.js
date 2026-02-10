import {
    buildCatalogSearchParams,
    buildCatalogSearchString,
    DEFAULT_SORT,
    hasActiveCatalogFilters,
    normalizeSort,
    parseCatalogSearchParams,
    sanitizeSearchQuery,
} from './catalogQuery.js'

describe('catalogQuery utils', () => {
    it('parses catalog params with normalization', () => {
        const search = new URLSearchParams('category=2&brand=4&page=3&q=%20monitor%20&sort=price_desc')
        const parsed = parseCatalogSearchParams(search)

        expect(parsed).toEqual({
            category: 2,
            brand: 4,
            page: 3,
            q: 'monitor',
            sort: 'price_desc',
        })
    })

    it('falls back to defaults for invalid params', () => {
        const search = new URLSearchParams('category=abc&brand=0&page=-1&sort=invalid')
        const parsed = parseCatalogSearchParams(search)

        expect(parsed).toEqual({
            category: null,
            brand: null,
            page: 1,
            q: '',
            sort: DEFAULT_SORT,
        })
    })

    it('builds compact query params without defaults', () => {
        const params = buildCatalogSearchParams({
            category: 5,
            brand: null,
            page: 1,
            q: '  phone  ',
            sort: DEFAULT_SORT,
        })

        expect(params).toEqual({
            category: '5',
            q: 'phone',
        })
        expect(buildCatalogSearchString(params)).toBe('category=5&q=phone')
    })

    it('reports active filters', () => {
        expect(hasActiveCatalogFilters({category: null, brand: null, q: '', sort: DEFAULT_SORT})).toBe(false)
        expect(hasActiveCatalogFilters({category: 1, brand: null, q: '', sort: DEFAULT_SORT})).toBe(true)
        expect(hasActiveCatalogFilters({category: null, brand: null, q: 'tv', sort: DEFAULT_SORT})).toBe(true)
        expect(hasActiveCatalogFilters({category: null, brand: null, q: '', sort: 'newest'})).toBe(true)
    })

    it('normalizes query and sort values', () => {
        expect(sanitizeSearchQuery('   laptop   ')).toBe('laptop')
        expect(normalizeSort('price_asc')).toBe('price_asc')
        expect(normalizeSort('bad-sort')).toBe(DEFAULT_SORT)
    })
})
