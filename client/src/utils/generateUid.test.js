import generateUid from './generateUid.js'

describe('generateUid', () => {
    it('returns a non-empty string', () => {
        const uid = generateUid()

        expect(typeof uid).toBe('string')
        expect(uid.length).toBeGreaterThan(0)
    })

    it('returns different values across sequential calls', () => {
        const first = generateUid()
        const second = generateUid()

        expect(first).not.toBe(second)
    })
})
