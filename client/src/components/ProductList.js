import { Row, Pagination } from 'react-bootstrap'
import ProductItem from './ProductItem.js'
import { useContext, useMemo } from 'react'
import { AppContext } from './AppContext.js'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { buildCatalogSearchString } from '../utils/catalogQuery.js'

const MAX_VISIBLE_PAGES = 7

const getVisiblePages = (currentPage, totalPages) => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
        return Array.from({length: totalPages}, (_, index) => index + 1)
    }

    const pages = [1]
    const windowSize = MAX_VISIBLE_PAGES - 2
    const half = Math.floor(windowSize / 2)

    let start = Math.max(2, currentPage - half)
    let end = Math.min(totalPages - 1, start + windowSize - 1)
    start = Math.max(2, end - windowSize + 1)

    if (start > 2) pages.push('left-ellipsis')
    for (let page = start; page <= end; page++) {
        pages.push(page)
    }
    if (end < totalPages - 1) pages.push('right-ellipsis')
    pages.push(totalPages)

    return pages
}

const ProductList = observer(({loading = false}) => {
    const { catalog } = useContext(AppContext)
    const navigate = useNavigate()

    const handleClick = (page) => {
        const query = buildCatalogSearchString({
            category: catalog.category,
            brand: catalog.brand,
            page,
            q: catalog.q,
            sort: catalog.sort,
        })
        navigate({
            pathname: '/',
            search: query ? '?' + query : '',
        })
    }

    const pages = useMemo(() => getVisiblePages(catalog.page, catalog.pages), [catalog.page, catalog.pages])
    const paginationItems = pages.map((page, index) => {
        if (typeof page !== 'number') {
            return <Pagination.Ellipsis key={`${page}-${index}`} disabled />
        }
        return (
            <Pagination.Item
                key={page}
                active={page === catalog.page}
                activeLabel=""
                onClick={() => handleClick(page)}
            >
                {page}
            </Pagination.Item>
        )
    })

    return (
        <>
            {!loading && !!catalog.products.length && (
                <p className="catalog-results-meta">
                    Показано {catalog.products.length} из {catalog.count} товаров
                </p>
            )}
            <Row className="catalog-grid mb-3">
                {loading ? (
                    [...Array(Math.max(3, catalog.limit))].map((_, index) => (
                        <div key={index} className="col-12 col-sm-6 col-lg-4 mt-3">
                            <div className="catalog-skeleton">
                                <div className="catalog-skeleton__media" />
                                <div className="catalog-skeleton__body">
                                    <div className="catalog-skeleton__line w-80" />
                                    <div className="catalog-skeleton__line" />
                                    <div className="catalog-skeleton__line w-55" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : catalog.products.length ? (
                    catalog.products.map(item =>
                        <ProductItem key={item.id} data={item} />
                    )
                ) : (
                    <div className="catalog-empty">
                        <p className="catalog-empty__title">Товары не найдены</p>
                        <p className="catalog-empty__text">
                            Попробуйте изменить поисковый запрос или сбросить фильтры категории и бренда.
                        </p>
                    </div>
                )}
            </Row>
            {!loading && catalog.pages > 1 && <Pagination className="catalog-pagination">{paginationItems}</Pagination>}
        </>
    )
})

export default ProductList
