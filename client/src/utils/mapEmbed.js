const toFiniteNumber = (value) => {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
}

const clamp = (value, min, max) => {
    return Math.min(max, Math.max(min, value))
}

export const normalizeCoordinates = (latitude, longitude) => {
    const lat = toFiniteNumber(latitude)
    const lon = toFiniteNumber(longitude)
    if (lat === null || lon === null) return null
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
    return {
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
    }
}

export const buildOpenStreetMapEmbedUrl = (latitude, longitude, span = 0.08) => {
    const coords = normalizeCoordinates(latitude, longitude)
    if (!coords) return ''

    const safeSpan = clamp(Number.parseFloat(span) || 0.08, 0.01, 3)
    const left = clamp(coords.longitude - safeSpan, -180, 180)
    const right = clamp(coords.longitude + safeSpan, -180, 180)
    const bottom = clamp(coords.latitude - safeSpan, -90, 90)
    const top = clamp(coords.latitude + safeSpan, -90, 90)
    const params = new URLSearchParams({
        bbox: `${left},${bottom},${right},${top}`,
        layer: 'mapnik',
        marker: `${coords.latitude},${coords.longitude}`,
    })

    return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`
}
