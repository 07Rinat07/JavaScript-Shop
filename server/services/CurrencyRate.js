const FALLBACK_RUB_TO_KZT_RATE = 5.5
const REQUEST_TIMEOUT_MS = 4000
const CACHE_TTL_MS = 15 * 60 * 1000
const DEFAULT_OVERVIEW_SYMBOLS = Object.freeze([
    'KZT',
    'USD',
    'EUR',
    'RUB',
    'CNY',
    'GBP',
    'TRY',
    'AED',
])

const FALLBACK_USD_RATES = Object.freeze({
    USD: 1,
    EUR: 0.92,
    RUB: 92.5,
    KZT: 510,
    CNY: 7.2,
    GBP: 0.79,
    TRY: 32.4,
    AED: 3.67,
})

const SOURCES = [
    {
        name: 'open-er-api',
        url: (base) => `https://open.er-api.com/v6/latest/${base}`,
        pickRates: (data) => data?.rates,
    },
    {
        name: 'currency-api-pages',
        url: (base) => `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`,
        pickRates: (data, {base}) => data?.[base.toLowerCase()],
    },
]

const cacheByKey = new Map()

const toValidRate = (value) => {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const normalizeCurrencyCode = (value, fallback = 'KZT') => {
    if (typeof value !== 'string') return fallback
    const normalized = value.trim().toUpperCase()
    return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback
}

const normalizeSymbols = (value, {fallback = DEFAULT_OVERVIEW_SYMBOLS} = {}) => {
    const source = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : fallback

    const unique = []
    for (const item of source) {
        const normalized = normalizeCurrencyCode(item, '')
        if (!normalized) continue
        if (!unique.includes(normalized)) {
            unique.push(normalized)
        }
        if (unique.length >= 20) break
    }

    return unique.length ? unique : [...fallback]
}

const requestJson = async (url, fetchImpl = fetch) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
        const response = await fetchImpl(url, {
            method: 'GET',
            headers: {accept: 'application/json'},
            signal: controller.signal,
        })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        return await response.json()
    } finally {
        clearTimeout(timeout)
    }
}

const readRateBySymbol = (allRates, symbol) => {
    if (!allRates || typeof allRates !== 'object') return null
    const direct = toValidRate(allRates[symbol])
    if (direct) return direct

    const lower = toValidRate(allRates[symbol.toLowerCase()])
    if (lower) return lower

    const upper = toValidRate(allRates[symbol.toUpperCase()])
    if (upper) return upper

    return null
}

const pickRequestedRates = (allRates, symbols, base) => {
    const picked = {[base]: 1}
    for (const symbol of symbols) {
        if (symbol === base) {
            picked[symbol] = 1
            continue
        }
        const rate = readRateBySymbol(allRates, symbol)
        if (rate) {
            picked[symbol] = rate
        }
    }
    return picked
}

const readRatesFromSources = async ({base, symbols, fetchImpl = fetch}) => {
    for (const source of SOURCES) {
        try {
            const payload = await requestJson(source.url(base), fetchImpl)
            const allRates = source.pickRates(payload, {base})
            const rates = pickRequestedRates(allRates, symbols, base)
            if (Object.keys(rates).length > 1) {
                return {
                    base,
                    symbols,
                    rates,
                    source: source.name,
                    fetchedAt: new Date().toISOString(),
                    stale: false,
                    fallback: false,
                }
            }
        } catch {
            // try next source
        }
    }
    throw new Error(`Не удалось получить курсы валют для базы ${base}`)
}

const getFallbackRatesByBase = (base) => {
    const normalizedBase = toValidRate(FALLBACK_USD_RATES[base]) ? base : 'KZT'
    const baseRate = toValidRate(FALLBACK_USD_RATES[normalizedBase]) ?? FALLBACK_USD_RATES.KZT

    const result = {[normalizedBase]: 1}
    for (const [symbol, usdRate] of Object.entries(FALLBACK_USD_RATES)) {
        const safeRate = toValidRate(usdRate)
        if (!safeRate) continue
        result[symbol] = Number((safeRate / baseRate).toFixed(6))
    }

    if (!result.RUB && result.KZT) {
        result.RUB = Number((result.KZT / FALLBACK_RUB_TO_KZT_RATE).toFixed(6))
    }

    if (!result.KZT && result.RUB) {
        result.KZT = Number((result.RUB * FALLBACK_RUB_TO_KZT_RATE).toFixed(6))
    }

    return result
}

const createFallbackPayload = ({base, symbols}) => {
    const fallbackRates = getFallbackRatesByBase(base)
    return {
        base,
        symbols,
        rates: pickRequestedRates(fallbackRates, symbols, base),
        source: 'fallback',
        fetchedAt: new Date().toISOString(),
        stale: true,
        fallback: true,
    }
}

const getCacheKey = (base, symbols) => `${base}:${symbols.join(',')}`

const isExpiredCache = (value) => {
    if (!value?.fetchedAt) return true
    return (Date.now() - new Date(value.fetchedAt).getTime()) > CACHE_TTL_MS
}

const clonePayload = (value) => ({
    ...value,
    symbols: [...(value?.symbols ?? [])],
    rates: {...(value?.rates ?? {})},
})

class CurrencyRate {
    async getRatesOverview({
        base = 'KZT',
        symbols = DEFAULT_OVERVIEW_SYMBOLS,
        refresh = false,
        fetchImpl = fetch,
    } = {}) {
        const normalizedBase = normalizeCurrencyCode(base, 'KZT')
        const normalizedSymbols = normalizeSymbols(symbols)
        if (!normalizedSymbols.includes(normalizedBase)) {
            normalizedSymbols.unshift(normalizedBase)
        }

        const cacheKey = getCacheKey(normalizedBase, normalizedSymbols)
        const cachedValue = cacheByKey.get(cacheKey)
        const shouldUseCache = cachedValue && !refresh && !isExpiredCache(cachedValue)
        if (shouldUseCache) {
            return clonePayload(cachedValue)
        }

        try {
            const latest = await readRatesFromSources({
                base: normalizedBase,
                symbols: normalizedSymbols,
                fetchImpl,
            })
            cacheByKey.set(cacheKey, latest)
            return clonePayload(latest)
        } catch {
            if (cachedValue) {
                return {
                    ...clonePayload(cachedValue),
                    stale: true,
                    fallback: true,
                }
            }
            return createFallbackPayload({
                base: normalizedBase,
                symbols: normalizedSymbols,
            })
        }
    }

    async getRubToKztRate({refresh = false, fetchImpl = fetch} = {}) {
        const overview = await this.getRatesOverview({
            base: 'RUB',
            symbols: ['KZT'],
            refresh,
            fetchImpl,
        })

        return {
            rate: toValidRate(overview.rates?.KZT) ?? FALLBACK_RUB_TO_KZT_RATE,
            source: overview.source,
            fetchedAt: overview.fetchedAt,
            stale: overview.stale,
            fallback: overview.fallback,
        }
    }
}

export default new CurrencyRate()
export { DEFAULT_OVERVIEW_SYMBOLS }
