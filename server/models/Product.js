import { Product as ProductMapping } from './mapping.js'
import { ProductProp as ProductPropMapping } from './mapping.js'
import { Brand as BrandMapping } from './mapping.js'
import { Category as CategoryMapping } from './mapping.js'
import { Op } from 'sequelize'
import FileService from '../services/File.js'

const parseProps = (value) => {
    if (!value) return null
    let props
    try {
        props = JSON.parse(value)
    } catch {
        throw new Error('Некорректный формат свойств товара')
    }
    if (!Array.isArray(props)) {
        throw new Error('Некорректный формат свойств товара')
    }
    return props
}

export const PRODUCT_ORDER_MAP = Object.freeze({
    name_asc: [['name', 'ASC']],
    price_asc: [['price', 'ASC'], ['name', 'ASC']],
    price_desc: [['price', 'DESC'], ['name', 'ASC']],
    rating_desc: [['rating', 'DESC'], ['name', 'ASC']],
    newest: [['createdAt', 'DESC']],
})

const DEFAULT_PRODUCT_SORT = 'name_asc'

const PRODUCT_SORT_ALIASES = Object.freeze({
    name: 'name_asc',
    price: 'price_asc',
    '-price': 'price_desc',
    rating: 'rating_desc',
    created: 'newest',
    '-created': 'newest',
    createdat_desc: 'newest',
})

export const normalizeProductSort = (value) => {
    if (typeof value !== 'string') return DEFAULT_PRODUCT_SORT
    const normalized = value.trim().toLowerCase()
    if (PRODUCT_ORDER_MAP[normalized]) return normalized
    return PRODUCT_SORT_ALIASES[normalized] ?? DEFAULT_PRODUCT_SORT
}

export const sanitizeProductSearchQuery = (value, maxLength = 80) => {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, maxLength)
}

const buildProductSearchConditions = (query) => {
    const search = `%${query}%`
    return [
        {name: {[Op.iLike]: search}},
        {'$brand.name$': {[Op.iLike]: search}},
        {'$category.name$': {[Op.iLike]: search}},
    ]
}

export const buildProductListQuery = (options) => {
    const {categoryId, brandId, limit, page, q = '', sort = DEFAULT_PRODUCT_SORT} = options
    const where = {}

    if (categoryId) where.categoryId = categoryId
    if (brandId) where.brandId = brandId

    const query = sanitizeProductSearchQuery(q)
    if (query) {
        where[Op.or] = buildProductSearchConditions(query)
    }

    return {
        where,
        limit,
        offset: (page - 1) * limit,
        distinct: true,
        subQuery: false,
        include: [
            {model: BrandMapping, as: 'brand'},
            {model: CategoryMapping, as: 'category'},
        ],
        order: PRODUCT_ORDER_MAP[normalizeProductSort(sort)],
    }
}

class Product {
    async getAll(options) {
        const query = buildProductListQuery(options)
        const products = await ProductMapping.findAndCountAll(query)
        return products
    }

    async getOne(id) {
        const product = await ProductMapping.findByPk(id, {
            include: [
                {model: ProductPropMapping, as: 'props'},
                {model: BrandMapping, as: 'brand'},
                {model: CategoryMapping, as: 'category'},
            ]
        })
        if (!product) {
            throw new Error('Товар не найден в БД')
        }
        return product
    }

    async create(data, img) {
        // поскольку image не допускает null, задаем пустую строку
        const image = await FileService.save(img) ?? ''
        const {name, price, categoryId = null, brandId = null} = data
        const props = parseProps(data.props)
        try {
            const product = await ProductMapping.create({name, price, image, categoryId, brandId})
            if (props) { // свойства товара
                for (let prop of props) {
                    await ProductPropMapping.create({
                        name: prop.name,
                        value: prop.value,
                        productId: product.id
                    })
                }
            }
            // возвращать будем товар со свойствами
            const created = await ProductMapping.findByPk(product.id, {
                include: [{model: ProductPropMapping, as: 'props'}]
            })
            return created
        } catch (e) {
            if (image) {
                FileService.delete(image)
            }
            throw e
        }
    }

    async update(id, data, img) {
        const product = await ProductMapping.findByPk(id, {
            include: [{model: ProductPropMapping, as: 'props'}]
        })
        if (!product) {
            throw new Error('Товар не найден в БД')
        }
        const oldImage = product.image
        // пробуем сохранить изображение, если оно было загружено
        const file = await FileService.save(img)
        const props = parseProps(data.props)
        try {
            // подготавливаем данные, которые надо обновить в базе данных
            const {
                name = product.name,
                price = product.price,
                categoryId = product.categoryId,
                brandId = product.brandId,
                image = file ? file : product.image
            } = data
            await product.update({name, price, categoryId, image, brandId})
            if (props) { // свойства товара
                // удаляем старые и добавляем новые
                await ProductPropMapping.destroy({where: {productId: id}})
                for (let prop of props) {
                    await ProductPropMapping.create({
                        name: prop.name,
                        value: prop.value,
                        productId: product.id
                    })
                }
            }
            // если загружено новое изображение — удаляем старое после успешного update
            if (file && oldImage) {
                FileService.delete(oldImage)
            }
        } catch (e) {
            // если новый файл загрузили, но update не удался — не оставляем сироту
            if (file) {
                FileService.delete(file)
            }
            throw e
        }
        // обновим объект товара, чтобы вернуть свежие данные
        await product.reload()
        return product
    }

    async delete(id) {
        const product = await ProductMapping.findByPk(id)
        if (!product) {
            throw new Error('Товар не найден в БД')
        }
        if (product.image) { // удаляем изображение товара
            FileService.delete(product.image)
        }
        await product.destroy()
        return product
    }

    // TODO: это вообще используется?
    async isExist(id) {
        const basket = await ProductMapping.findByPk(id)
        return basket
    }
}

export default new Product()
