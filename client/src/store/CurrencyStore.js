import { makeAutoObservable } from 'mobx'
import { DEFAULT_CURRENCY, normalizeCurrencyCode, RUB_TO_KZT_RATE } from '../utils/formatPrice.js'
import { fetchRubToKztRate } from '../http/currencyAPI.js'

const STORAGE_KEY = 'currency'

const getSavedCurrency = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_CURRENCY
    }
    return normalizeCurrencyCode(window.localStorage.getItem(STORAGE_KEY))
}

class CurrencyStore {
    _code = getSavedCurrency()
    _rubToKztRate = RUB_TO_KZT_RATE
    _loadingRate = false
    _source = 'fallback'
    _updatedAt = null
    _stale = true

    constructor() {
        makeAutoObservable(this)
    }

    get code() {
        return this._code
    }

    get rubToKztRate() {
        return this._rubToKztRate
    }

    get loadingRate() {
        return this._loadingRate
    }

    get source() {
        return this._source
    }

    get updatedAt() {
        return this._updatedAt
    }

    get stale() {
        return this._stale
    }

    set code(value) {
        const normalized = normalizeCurrencyCode(value)
        this._code = normalized
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, normalized)
        }
    }

    async syncRate({refresh = false} = {}) {
        this._loadingRate = true
        try {
            const data = await fetchRubToKztRate(refresh)
            if (Number.isFinite(data?.rate) && data.rate > 0) {
                this._rubToKztRate = data.rate
            }
            this._source = data?.source ?? this._source
            this._updatedAt = data?.fetchedAt ?? this._updatedAt
            this._stale = Boolean(data?.stale)
            return data
        } catch {
            return null
        } finally {
            this._loadingRate = false
        }
    }
}

export default CurrencyStore
