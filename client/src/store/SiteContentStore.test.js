import SiteContentStore from './SiteContentStore.js'

describe('SiteContentStore', () => {
    it('has fallback navbar content by default', () => {
        const store = new SiteContentStore()

        expect(store.navbar.brandTitle).toBeTruthy()
        expect(Array.isArray(store.navbar.featureBadges)).toBe(true)
        expect(store.navbar.featureBadges.length).toBeGreaterThan(0)
    })

    it('normalizes navbar data through setter', () => {
        const store = new SiteContentStore()

        store.navbar = {
            brandTitle: '  New Brand  ',
            featureBadges: ['  One  ', '', 'Two'],
        }

        expect(store.navbar.brandTitle).toBe('New Brand')
        expect(store.navbar.featureBadges).toEqual(['One', 'Two'])
        expect(store.navbarLoaded).toBe(true)
    })
})
