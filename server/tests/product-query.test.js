import test from 'node:test'
import assert from 'node:assert/strict'
import { Op } from 'sequelize'
import {
    buildProductListQuery,
    normalizeProductSort,
    PRODUCT_ORDER_MAP,
    sanitizeProductSearchQuery,
} from '../models/Product.js'

test('normalizeProductSort supports defaults and aliases', () => {
    assert.equal(normalizeProductSort('price_desc'), 'price_desc')
    assert.equal(normalizeProductSort('price'), 'price_asc')
    assert.equal(normalizeProductSort('-price'), 'price_desc')
    assert.equal(normalizeProductSort('created'), 'newest')
    assert.equal(normalizeProductSort('unknown'), 'name_asc')
})

test('sanitizeProductSearchQuery trims and limits query length', () => {
    const result = sanitizeProductSearchQuery(`  ${'x'.repeat(100)}  `)

    assert.equal(result.length, 80)
    assert.equal(result, 'x'.repeat(80))
})

test('buildProductListQuery creates filters, search and sort options', () => {
    const options = buildProductListQuery({
        categoryId: '2',
        brandId: '7',
        limit: 12,
        page: 3,
        q: '  monitor ',
        sort: 'price_desc',
    })

    assert.equal(options.limit, 12)
    assert.equal(options.offset, 24)
    assert.equal(options.distinct, true)
    assert.equal(options.subQuery, false)
    assert.equal(options.where.categoryId, '2')
    assert.equal(options.where.brandId, '7')
    assert.deepEqual(options.order, PRODUCT_ORDER_MAP.price_desc)
    assert.equal(options.include[0].as, 'brand')
    assert.equal(options.include[1].as, 'category')

    const searchConditions = options.where[Op.or]
    assert.equal(Array.isArray(searchConditions), true)
    assert.equal(searchConditions.length, 3)
    assert.equal(searchConditions[0].name[Op.iLike], '%monitor%')
    assert.equal(searchConditions[1]['$brand.name$'][Op.iLike], '%monitor%')
    assert.equal(searchConditions[2]['$category.name$'][Op.iLike], '%monitor%')
})

test('buildProductListQuery omits search conditions for empty query', () => {
    const options = buildProductListQuery({
        limit: 9,
        page: 1,
        q: '   ',
        sort: 'invalid-sort',
    })

    assert.equal(options.where[Op.or], undefined)
    assert.deepEqual(options.order, PRODUCT_ORDER_MAP.name_asc)
})
