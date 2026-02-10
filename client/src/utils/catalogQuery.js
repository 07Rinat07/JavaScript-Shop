export const DEFAULT_SORT = 'name_asc'

export const SORT_OPTIONS = [
    {value: 'name_asc', label: 'По названию (A-Z)'},
    {value: 'price_asc', label: 'Сначала дешевле'},
    {value: 'price_desc', label: 'Сначала дороже'},
    {value: 'rating_desc', label: 'По рейтингу'},
    {value: 'newest', label: 'Сначала новые'},
]

const ALLOWED_SORTS = new Set(SORT_OPTIONS.map(item => item.value))
const INTEGER_PATTERN = /^[1-9][0-9]*$/

export const sanitizeSearchQuery = (value, maxLength = 80) => {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, maxLength)
}

export const normalizeSort = (value) => {
    if (typeof value !== 'string') return DEFAULT_SORT
    return ALLOWED_SORTS.has(value) ? value : DEFAULT_SORT
}

const parseNullablePositiveInt = (value) => {
    if (!value || !INTEGER_PATTERN.test(value)) return null
    return Number.parseInt(value, 10)
}

const parsePositiveInt = (value, fallback = 1) => {
    if (!value || !INTEGER_PATTERN.test(value)) return fallback
    return Number.parseInt(value, 10)
}

export const parseCatalogSearchParams = (searchParams) => {
    return {
        category: parseNullablePositiveInt(searchParams.get('category')),
        brand: parseNullablePositiveInt(searchParams.get('brand')),
        page: parsePositiveInt(searchParams.get('page')),
        q: sanitizeSearchQuery(searchParams.get('q') ?? ''),
        sort: normalizeSort(searchParams.get('sort')),
    }
}

export const buildCatalogSearchParams = ({category, brand, page = 1, q = '', sort = DEFAULT_SORT}) => {
    const params = {}
    if (category) params.category = String(category)
    if (brand) params.brand = String(brand)
    if (page > 1) params.page = String(page)
    const query = sanitizeSearchQuery(q)
    if (query) params.q = query
    const normalizedSort = normalizeSort(sort)
    if (normalizedSort !== DEFAULT_SORT) params.sort = normalizedSort
    return params
}

export const buildCatalogSearchString = (filters) => {
    const params = buildCatalogSearchParams(filters)
    return new URLSearchParams(params).toString()
}

export const hasActiveCatalogFilters = ({category, brand, q, sort}) => {
    return Boolean(category || brand || sanitizeSearchQuery(q) || normalizeSort(sort) !== DEFAULT_SORT)
}

export const getSortLabel = (sort) => {
    const value = normalizeSort(sort)
    const option = SORT_OPTIONS.find(item => item.value === value)
    return option ? option.label : SORT_OPTIONS[0].label
}
