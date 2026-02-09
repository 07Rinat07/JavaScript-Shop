import { Product as ProductMapping } from './mapping.js'
import { ProductProp as ProductPropMapping } from './mapping.js'
import { Brand as BrandMapping } from './mapping.js'
import { Category as CategoryMapping } from './mapping.js'
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

class Product {
    async getAll(options) {
        const {categoryId, brandId, limit, page} = options
        const offset = (page - 1) * limit
        const where = {}
        if (categoryId) where.categoryId = categoryId
        if (brandId) where.brandId = brandId
        const products = await ProductMapping.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                {model: BrandMapping, as: 'brand'},
                {model: CategoryMapping, as: 'category'}
            ],
            order: [
                ['name', 'ASC'],
            ],
        })
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
