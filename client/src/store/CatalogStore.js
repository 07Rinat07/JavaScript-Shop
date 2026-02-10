import { makeAutoObservable } from 'mobx'
import { DEFAULT_SORT, normalizeSort, sanitizeSearchQuery } from '../utils/catalogQuery.js'

class CatalogStore {
    _categories = []
    _brands = []
    _products = []
    _category = null // выбранная категория
    _brand = null // выбранный бренд
    _page = 1 // текущая страница
    _count = 0 // сколько всего товаров
    _limit = 9 // товаров на страницу
    _q = ''
    _sort = DEFAULT_SORT

    constructor() {
        makeAutoObservable(this)
    }

    get categories() {
        return this._categories
    }

    get brands() {
        return this._brands
    }

    get products() {
        return this._products
    }

    get category() {
        return this._category
    }

    get brand() {
        return this._brand
    }

    get page() {
        return this._page
    }

    get count() {
        return this._count
    }

    get limit() {
        return this._limit
    }

    get q() {
        return this._q
    }

    get sort() {
        return this._sort
    }

    get pages() { // всего страниц
        return Math.ceil(this.count / this.limit)
    }

    set categories(categories) {
        this._categories = categories
    }

    set brands(brands) {
        this._brands = brands
    }

    set products(products) {
        this._products = products
    }

    set category(id) {
        this.page = 1
        this._category = id
    }

    set brand(id) {
        this.page = 1
        this._brand = id
    }

    set page(page) {
        this._page = page
    }

    set count(count) {
        this._count = count
    }

    set limit(limit) {
        this._limit = limit
    }

    set q(value) {
        this.page = 1
        this._q = sanitizeSearchQuery(value)
    }

    set sort(value) {
        this.page = 1
        this._sort = normalizeSort(value)
    }

    syncFilters({category = null, brand = null, page = 1, q = '', sort = DEFAULT_SORT} = {}) {
        this._category = category
        this._brand = brand
        this._page = page
        this._q = sanitizeSearchQuery(q)
        this._sort = normalizeSort(sort)
    }

    resetFilters() {
        this._category = null
        this._brand = null
        this._page = 1
        this._q = ''
        this._sort = DEFAULT_SORT
    }
}

export default CatalogStore
