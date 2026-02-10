import { SiteContent as SiteContentMapping } from './mapping.js'

const CONTACTS_CONTENT_KEY = 'contacts'
const NAVBAR_CONTENT_KEY = 'navbar'
const DELIVERY_CONTENT_KEY = 'delivery'
const HOME_CONTENT_KEY = 'home'

const DEFAULT_CONTACTS_CONTENT = Object.freeze({
    title: 'Контакты магазина',
    description: 'Свяжитесь с нами удобным способом. Мы на связи каждый день.',
    phone: '+7 (7112) 50-24-24',
    email: 'support@magazin-pro.kz',
    address: 'Казахстан, Уральск, Примерная улица, 10',
    workingHours: 'Пн-Вс: 09:00 - 21:00',
    mapEmbed: '',
})

const LEGACY_CONTACTS_CONTENT = Object.freeze({
    phone: '+7 (800) 555-24-24',
    email: 'support@magazin-pro.local',
    address: 'Москва, Примерная улица, 10',
})

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

const DEFAULT_DELIVERY_CONTENT = Object.freeze({
    title: 'Доставка, самовывоз и складские точки',
    description: 'Выберите удобный пункт выдачи или склад. Карта показывает точное расположение по GPS.',
    mapSide: 'right',
    points: [
        {
            id: 'uralsk-pvz-center',
            name: 'Пункт выдачи «Уральск Центр»',
            type: 'pickup',
            address: 'Казахстан, Уральск, проспект Достык-Дружбы, 160',
            phone: '+7 (7112) 50-24-24',
            workingHours: 'Пн-Сб: 10:00 - 20:00',
            latitude: 51.2279,
            longitude: 51.3865,
            note: 'Выдача интернет-заказов и оформление возвратов.',
        },
        {
            id: 'uralsk-warehouse-west',
            name: 'Склад «Западный»',
            type: 'warehouse',
            address: 'Казахстан, Уральск, улица Сарайшык, 30',
            phone: '+7 (7112) 55-10-20',
            workingHours: 'Пн-Пт: 09:00 - 18:00',
            latitude: 51.2469,
            longitude: 51.3432,
            note: 'Отгрузка крупногабаритных заказов для курьеров и партнеров.',
        },
    ],
})

const DEFAULT_HOME_CONTENT = Object.freeze({
    eyebrow: 'Magazin Pro Marketplace',
    title: 'Техника для дома и бизнеса с прозрачными условиями покупки',
    description: 'Подбирайте устройства по категории, бренду и названию, сравнивайте цены и быстро переходите к нужным карточкам без лишней навигации.',
    backgroundImage: '/main-bg.jpg',
})

const sanitizeText = (value, maxLength) => {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, maxLength)
}

const sanitizeFeatureBadges = (value) => {
    const badges = Array.isArray(value) ? value : DEFAULT_NAVBAR_CONTENT.featureBadges
    const normalized = badges
        .map(item => sanitizeText(item, 80))
        .filter(Boolean)
        .slice(0, 5)
    return normalized.length ? normalized : [...DEFAULT_NAVBAR_CONTENT.featureBadges]
}

const makePointId = (prefix = 'point') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const sanitizeCoordinate = (value, min, max) => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) return null
    if (parsed < min || parsed > max) return null
    return Number(parsed.toFixed(6))
}

const normalizePoint = (raw = {}, index = 0) => {
    const latitude = sanitizeCoordinate(raw.latitude, -90, 90)
    const longitude = sanitizeCoordinate(raw.longitude, -180, 180)
    return {
        id: sanitizeText(raw.id, 64) || makePointId(`p${index + 1}`),
        name: sanitizeText(raw.name, 120) || `Пункт ${index + 1}`,
        type: sanitizeText(raw.type, 32) || 'pickup',
        address: sanitizeText(raw.address, 220),
        phone: sanitizeText(raw.phone, 80),
        workingHours: sanitizeText(raw.workingHours, 120),
        latitude: latitude ?? DEFAULT_DELIVERY_CONTENT.points[0].latitude,
        longitude: longitude ?? DEFAULT_DELIVERY_CONTENT.points[0].longitude,
        note: sanitizeText(raw.note, 320),
    }
}

const normalizePoints = (value) => {
    if (!Array.isArray(value)) return [...DEFAULT_DELIVERY_CONTENT.points]
    return value
        .slice(0, 60)
        .map((item, index) => normalizePoint(item, index))
}

const normalizeContactsContent = (raw = {}) => {
    const normalized = {
        title: sanitizeText(raw.title, 120) || DEFAULT_CONTACTS_CONTENT.title,
        description: sanitizeText(raw.description, 600) || DEFAULT_CONTACTS_CONTENT.description,
        phone: sanitizeText(raw.phone, 80) || DEFAULT_CONTACTS_CONTENT.phone,
        email: sanitizeText(raw.email, 120) || DEFAULT_CONTACTS_CONTENT.email,
        address: sanitizeText(raw.address, 220) || DEFAULT_CONTACTS_CONTENT.address,
        workingHours: sanitizeText(raw.workingHours, 120) || DEFAULT_CONTACTS_CONTENT.workingHours,
        mapEmbed: sanitizeText(raw.mapEmbed, 1600),
    }
    if (normalized.phone === LEGACY_CONTACTS_CONTENT.phone) {
        normalized.phone = DEFAULT_CONTACTS_CONTENT.phone
    }
    if (normalized.email === LEGACY_CONTACTS_CONTENT.email) {
        normalized.email = DEFAULT_CONTACTS_CONTENT.email
    }
    if (normalized.address === LEGACY_CONTACTS_CONTENT.address) {
        normalized.address = DEFAULT_CONTACTS_CONTENT.address
    }
    return normalized
}

const normalizeNavbarContent = (raw = {}) => {
    return {
        topLinePrimary: sanitizeText(raw.topLinePrimary, 120) || DEFAULT_NAVBAR_CONTENT.topLinePrimary,
        topLineSecondary: sanitizeText(raw.topLineSecondary, 120) || DEFAULT_NAVBAR_CONTENT.topLineSecondary,
        phone: sanitizeText(raw.phone, 80) || DEFAULT_NAVBAR_CONTENT.phone,
        workingHours: sanitizeText(raw.workingHours, 120) || DEFAULT_NAVBAR_CONTENT.workingHours,
        brandTitle: sanitizeText(raw.brandTitle, 80) || DEFAULT_NAVBAR_CONTENT.brandTitle,
        brandSubtitle: sanitizeText(raw.brandSubtitle, 140) || DEFAULT_NAVBAR_CONTENT.brandSubtitle,
        featureBadges: sanitizeFeatureBadges(raw.featureBadges),
    }
}

const normalizeDeliveryContent = (raw = {}) => {
    const mapSide = sanitizeText(raw.mapSide, 12).toLowerCase() === 'left' ? 'left' : 'right'
    return {
        title: sanitizeText(raw.title, 140) || DEFAULT_DELIVERY_CONTENT.title,
        description: sanitizeText(raw.description, 700) || DEFAULT_DELIVERY_CONTENT.description,
        mapSide,
        points: normalizePoints(raw.points),
    }
}

const normalizeHomeContent = (raw = {}) => {
    return {
        eyebrow: sanitizeText(raw.eyebrow, 80) || DEFAULT_HOME_CONTENT.eyebrow,
        title: sanitizeText(raw.title, 140) || DEFAULT_HOME_CONTENT.title,
        description: sanitizeText(raw.description, 600) || DEFAULT_HOME_CONTENT.description,
        backgroundImage: sanitizeText(raw.backgroundImage, 600) || DEFAULT_HOME_CONTENT.backgroundImage,
    }
}

let storageReadyPromise = null

const ensureStorageReady = async () => {
    if (!storageReadyPromise) {
        storageReadyPromise = SiteContentMapping.sync()
    }
    return storageReadyPromise
}

class SiteContent {
    async getByKey(key, normalize, defaults) {
        await ensureStorageReady()
        const row = await SiteContentMapping.findOne({where: {key}})
        if (!row) {
            return normalize(defaults)
        }
        return normalize(row.value)
    }

    async updateByKey(key, payload, normalize) {
        await ensureStorageReady()
        const sanitized = normalize(payload)
        const [row] = await SiteContentMapping.findOrCreate({
            where: {key},
            defaults: {
                key,
                value: sanitized,
            },
        })
        await row.update({value: sanitized})
        return normalize(row.value)
    }

    async deleteByKey(key) {
        await ensureStorageReady()
        const row = await SiteContentMapping.findOne({where: {key}})
        if (!row) {
            return false
        }
        await row.destroy()
        return true
    }

    async getContacts() {
        return this.getByKey(CONTACTS_CONTENT_KEY, normalizeContactsContent, DEFAULT_CONTACTS_CONTENT)
    }

    async updateContacts(payload) {
        return this.updateByKey(CONTACTS_CONTENT_KEY, payload, normalizeContactsContent)
    }

    async getNavbar() {
        return this.getByKey(NAVBAR_CONTENT_KEY, normalizeNavbarContent, DEFAULT_NAVBAR_CONTENT)
    }

    async updateNavbar(payload) {
        return this.updateByKey(NAVBAR_CONTENT_KEY, payload, normalizeNavbarContent)
    }

    async getDelivery() {
        return this.getByKey(DELIVERY_CONTENT_KEY, normalizeDeliveryContent, DEFAULT_DELIVERY_CONTENT)
    }

    async updateDelivery(payload) {
        return this.updateByKey(DELIVERY_CONTENT_KEY, payload, normalizeDeliveryContent)
    }

    async getHome() {
        return this.getByKey(HOME_CONTENT_KEY, normalizeHomeContent, DEFAULT_HOME_CONTENT)
    }

    async updateHome(payload) {
        return this.updateByKey(HOME_CONTENT_KEY, payload, normalizeHomeContent)
    }

    async deleteHome() {
        await this.deleteByKey(HOME_CONTENT_KEY)
        return normalizeHomeContent(DEFAULT_HOME_CONTENT)
    }
}

export default new SiteContent()
