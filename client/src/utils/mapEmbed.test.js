import { buildOpenStreetMapEmbedUrl, normalizeCoordinates } from './mapEmbed.js'

describe('mapEmbed utils', () => {
    it('normalizes valid coordinates', () => {
        const coords = normalizeCoordinates('51.2279', '51.3865')

        expect(coords).toEqual({
            latitude: 51.2279,
            longitude: 51.3865,
        })
    })

    it('returns null for invalid coordinates', () => {
        expect(normalizeCoordinates('invalid', 10)).toBeNull()
        expect(normalizeCoordinates(100, 10)).toBeNull()
    })

    it('builds OpenStreetMap embed URL for valid coordinates', () => {
        const url = buildOpenStreetMapEmbedUrl(51.2279, 51.3865)

        expect(url).toContain('openstreetmap.org/export/embed.html')
        expect(url).toContain('marker=51.2279%2C51.3865')
    })
})
