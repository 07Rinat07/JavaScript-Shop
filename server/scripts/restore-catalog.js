import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sequelize from '../sequelize.js'
import { Product, ProductProp } from '../models/mapping.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATABASE_DUMP_PATH = path.resolve(__dirname, '../../database.sql')

const normalizeSql = (value) => value.replace(/\r\n/g, '\n')

const extractCopySection = (sql, tableName) => {
    const startToken = `COPY public.${tableName} (`
    const startIndex = sql.indexOf(startToken)
    if (startIndex < 0) {
        throw new Error(`Не найден COPY-блок таблицы ${tableName} в database.sql`)
    }

    const headerStart = startIndex + startToken.length
    const headerEnd = sql.indexOf(') FROM stdin;', headerStart)
    if (headerEnd < 0) {
        throw new Error(`Некорректный заголовок COPY-блока таблицы ${tableName}`)
    }

    const columns = sql
        .slice(headerStart, headerEnd)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)

    const dataStart = headerEnd + ') FROM stdin;'.length
    const dataEnd = sql.indexOf('\n\\.', dataStart)
    if (dataEnd < 0) {
        throw new Error(`Не найден конец COPY-блока таблицы ${tableName}`)
    }

    const rowsText = sql.slice(dataStart, dataEnd).trim()
    const rows = rowsText
        ? rowsText
            .split('\n')
            .map(line => line.trimEnd())
            .filter(Boolean)
        : []

    return { columns, rows }
}

const parseCopyRows = (columns, rows, tableName) => {
    return rows.map((line, rowIndex) => {
        const values = line.split('\t')
        if (values.length !== columns.length) {
            throw new Error(
                `Некорректная строка #${rowIndex + 1} в COPY-блоке ${tableName}: ` +
                `ожидалось ${columns.length} колонок, получено ${values.length}`
            )
        }

        const row = {}
        columns.forEach((column, index) => {
            row[column] = values[index] === '\\N' ? null : values[index]
        })
        return row
    })
}

const toInt = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10)
    return Number.isInteger(parsed) ? parsed : fallback
}

const mapProduct = (row) => ({
    id: toInt(row.id),
    name: row.name ?? '',
    price: toInt(row.price),
    rating: toInt(row.rating),
    image: row.image ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryId: toInt(row.category_id, null),
    brandId: toInt(row.brand_id, null),
})

const mapProductProp = (row) => ({
    id: toInt(row.id),
    name: row.name ?? '',
    value: row.value ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    productId: toInt(row.product_id),
})

const syncSequences = async (transaction) => {
    await sequelize.query(
        `SELECT setval(
            pg_get_serial_sequence('public.products', 'id'),
            COALESCE((SELECT MAX(id) FROM public.products), 1),
            true
        );`,
        { transaction }
    )

    await sequelize.query(
        `SELECT setval(
            pg_get_serial_sequence('public.product_props', 'id'),
            COALESCE((SELECT MAX(id) FROM public.product_props), 1),
            true
        );`,
        { transaction }
    )
}

const main = async () => {
    try {
        const rawSql = await readFile(DATABASE_DUMP_PATH, 'utf8')
        const sql = normalizeSql(rawSql)

        const productsCopy = extractCopySection(sql, 'products')
        const productPropsCopy = extractCopySection(sql, 'product_props')

        const products = parseCopyRows(productsCopy.columns, productsCopy.rows, 'products').map(mapProduct)
        const productProps = parseCopyRows(productPropsCopy.columns, productPropsCopy.rows, 'product_props').map(mapProductProp)

        await sequelize.authenticate()

        const transaction = await sequelize.transaction()
        try {
            await ProductProp.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                cascade: true,
                transaction,
            })
            await Product.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                cascade: true,
                transaction,
            })

            if (products.length) {
                await Product.bulkCreate(products, { transaction })
            }

            if (productProps.length) {
                await ProductProp.bulkCreate(productProps, { transaction })
            }

            await syncSequences(transaction)
            await transaction.commit()

            console.log(`Каталог восстановлен: товаров ${products.length}, свойств ${productProps.length}`)
        } catch (error) {
            await transaction.rollback()
            throw error
        }

        await sequelize.close()
    } catch (error) {
        console.error('Не удалось восстановить каталог из database.sql')
        console.error(error)
        process.exit(1)
    }
}

main()
