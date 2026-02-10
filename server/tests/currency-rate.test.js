import test from 'node:test'
import assert from 'node:assert/strict'
import CurrencyRateService from '../services/CurrencyRate.js'

const mockResponse = (payload, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => payload,
})

test('currency rate service returns live rate from primary source', async () => {
    const fetchMock = async () => mockResponse({
        rates: {KZT: 6.41},
    })

    const result = await CurrencyRateService.getRubToKztRate({
        refresh: true,
        fetchImpl: fetchMock,
    })

    assert.equal(result.source, 'open-er-api')
    assert.equal(result.rate, 6.41)
    assert.equal(result.fallback, false)
    assert.equal(result.stale, false)
})

test('currency rate service falls back to secondary source when primary fails', async () => {
    let calls = 0
    const fetchMock = async () => {
        calls += 1
        if (calls === 1) {
            throw new Error('primary failed')
        }
        return mockResponse({
            rub: {kzt: 6.52},
        })
    }

    const result = await CurrencyRateService.getRubToKztRate({
        refresh: true,
        fetchImpl: fetchMock,
    })

    assert.equal(result.source, 'currency-api-pages')
    assert.equal(result.rate, 6.52)
    assert.equal(result.fallback, false)
    assert.equal(result.stale, false)
})

test('currency overview returns selected symbols and base with direct value', async () => {
    const fetchMock = async () => mockResponse({
        rates: {
            KZT: 520,
            USD: 1.07,
            EUR: 0.98,
        },
    })

    const result = await CurrencyRateService.getRatesOverview({
        base: 'EUR',
        symbols: ['USD', 'KZT'],
        refresh: true,
        fetchImpl: fetchMock,
    })

    assert.equal(result.base, 'EUR')
    assert.equal(result.rates.EUR, 1)
    assert.equal(result.rates.USD, 1.07)
    assert.equal(result.rates.KZT, 520)
    assert.equal(result.source, 'open-er-api')
    assert.equal(result.fallback, false)
})
