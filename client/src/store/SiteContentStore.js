import { makeAutoObservable } from 'mobx'
import { fetchNavbarContent } from '../http/contentAPI.js'

const DEFAULT_NAVBAR_CONTENT = Object.freeze({
    topLinePrimary: 'Доставка по Казахстану от 1 дня',
    topLineSecondary: 'Возврат и обмен 14 дней',
    phone: '+7 (7112) 50-24-24',
    workingHours: 'Пн-Вс: 09:00 - 21:00',
    brandTitle: 'Magazin Pro',
    brandSubtitle: 'Маркет техники с официальной гарантией',
    featureBadges: [
        'Гарантия до 24 месяцев',
        'Безопасная оплата',
        'Поддержка 7 дней в неделю',
    ],
})

const sanitizeText = (value, fallback) => {
    if (typeof value !== 'string') return fallback
    const normalized = value.trim()
    return normalized || fallback
}

const normalizeBadges = (value) => {
    if (!Array.isArray(value)) return [...DEFAULT_NAVBAR_CONTENT.featureBadges]
    const normalized = value
        .map(item => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
        .slice(0, 5)
    return normalized.length ? normalized : [...DEFAULT_NAVBAR_CONTENT.featureBadges]
}

const normalizeNavbarContent = (raw = {}) => {
    return {
        topLinePrimary: sanitizeText(raw.topLinePrimary, DEFAULT_NAVBAR_CONTENT.topLinePrimary),
        topLineSecondary: sanitizeText(raw.topLineSecondary, DEFAULT_NAVBAR_CONTENT.topLineSecondary),
        phone: sanitizeText(raw.phone, DEFAULT_NAVBAR_CONTENT.phone),
        workingHours: sanitizeText(raw.workingHours, DEFAULT_NAVBAR_CONTENT.workingHours),
        brandTitle: sanitizeText(raw.brandTitle, DEFAULT_NAVBAR_CONTENT.brandTitle),
        brandSubtitle: sanitizeText(raw.brandSubtitle, DEFAULT_NAVBAR_CONTENT.brandSubtitle),
        featureBadges: normalizeBadges(raw.featureBadges),
    }
}

class SiteContentStore {
    _navbar = {...DEFAULT_NAVBAR_CONTENT}
    _navbarLoaded = false
    _navbarLoading = false

    constructor() {
        makeAutoObservable(this)
    }

    get navbar() {
        return this._navbar
    }

    get navbarLoaded() {
        return this._navbarLoaded
    }

    get navbarLoading() {
        return this._navbarLoading
    }

    set navbar(value) {
        this._navbar = normalizeNavbarContent(value)
        this._navbarLoaded = true
    }

    async syncNavbar() {
        this._navbarLoading = true
        try {
            const data = await fetchNavbarContent()
            this.navbar = data
            return data
        } catch {
            return null
        } finally {
            this._navbarLoading = false
        }
    }
}

export default SiteContentStore
export { DEFAULT_NAVBAR_CONTENT, normalizeNavbarContent }
