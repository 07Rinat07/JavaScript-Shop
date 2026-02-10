import { Container, Row, Col, Spinner, Form, InputGroup, Button } from 'react-bootstrap'
import CategoryBar from '../components/CategoryBar.js'
import BrandBar from '../components/BrandBar.js'
import ProductList from '../components/ProductList.js'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../components/AppContext.js'
import { fetchCategories, fetchBrands, fetchAllProducts } from '../http/catalogAPI.js'
import { fetchHomeContent } from '../http/contentAPI.js'
import { observer } from 'mobx-react-lite'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
    buildCatalogSearchString,
    getSortLabel,
    hasActiveCatalogFilters,
    parseCatalogSearchParams,
    sanitizeSearchQuery,
    SORT_OPTIONS,
} from '../utils/catalogQuery.js'

const Shop = observer(() => {
    const { catalog } = useContext(AppContext)
    const navigate = useNavigate()

    const [categoriesFetching, setCategoriesFetching] = useState(true)
    const [brandsFetching, setBrandsFetching] = useState(true)
    const [productsFetching, setProductsFetching] = useState(true)
    const [searchInput, setSearchInput] = useState('')
    const [heroContent, setHeroContent] = useState({
        eyebrow: 'Magazin Pro Marketplace',
        title: 'Техника для дома и бизнеса с прозрачными условиями покупки',
        description: 'Подбирайте устройства по категории, бренду и названию, сравнивайте цены и быстро переходите к нужным карточкам без лишней навигации.',
        backgroundImage: '/main-bg.jpg',
    })

    const location = useLocation()
    const [searchParams] = useSearchParams()

    const navigateToCatalog = ({category = catalog.category, brand = catalog.brand, page = catalog.page, q = catalog.q, sort = catalog.sort} = {}) => {
        const query = buildCatalogSearchString({category, brand, page, q, sort})
        navigate({
            pathname: '/',
            search: query ? '?' + query : '',
        })
    }

    const selectedCategory = catalog.categories.find(item => item.id === catalog.category)?.name ?? 'Все категории'
    const selectedBrand = catalog.brands.find(item => item.id === catalog.brand)?.name ?? 'Все бренды'
    const hasActiveFilters = hasActiveCatalogFilters(catalog)

    const catalogSummary = [
        {label: 'Категория', value: selectedCategory},
        {label: 'Бренд', value: selectedBrand},
        {label: 'Поиск', value: catalog.q || 'Любой товар'},
        {label: 'Сортировка', value: getSortLabel(catalog.sort)},
    ]

    const handleSearchSubmit = (event) => {
        event.preventDefault()
        const nextQuery = sanitizeSearchQuery(searchInput)
        navigateToCatalog({page: 1, q: nextQuery})
    }

    const handleSortChange = (event) => {
        const nextSort = event.target.value
        navigateToCatalog({page: 1, sort: nextSort})
    }

    const handleResetFilters = () => {
        setSearchInput('')
        navigate({pathname: '/', search: ''})
    }

    useEffect(() => {
        if (catalog.categories.length) {
            setCategoriesFetching(false)
        } else {
            fetchCategories()
                .then(data => catalog.categories = data)
                .finally(() => setCategoriesFetching(false))
        }

        if (catalog.brands.length) {
            setBrandsFetching(false)
        } else {
            fetchBrands()
                .then(data => catalog.brands = data)
                .finally(() => setBrandsFetching(false))
        }
        fetchHomeContent()
            .then(data => setHeroContent(data))
            .catch(() => {})
        // eslint-disable-next-line
    }, [])

    // При каждом клике на категорию, бренд или номер страницы — мы добавляем элемент в историю
    // браузера, ссылки в истории имеют вид /?page=1, /?page=2, /?page=3. При нажатии кнопки 
    // «Назад» браузера — мы отслеживаем изменение GET-параметров и изменяем состояние хранилища.
    useEffect(() => {
        const nextFilters = parseCatalogSearchParams(searchParams)
        catalog.syncFilters(nextFilters)
        setSearchInput(nextFilters.q)
        // eslint-disable-next-line
    }, [location.search])

    // при клике на категорию, бренд, номер страницы или при нажатии кнопки  «Назад» 
    // браузера — получам с сервера список товаров, потому что это уже другой список
    useEffect(() => {
        let isCurrent = true
        setProductsFetching(true)
        fetchAllProducts(catalog.category, catalog.brand, catalog.page, catalog.limit, catalog.q, catalog.sort)
            .then(data => {
                if (!isCurrent) return
                catalog.products = data.rows
                catalog.count = data.count
            })
            .finally(() => {
                if (!isCurrent) return
                setProductsFetching(false)
            })
        return () => {
            isCurrent = false
        }
        // eslint-disable-next-line
    }, [catalog.category, catalog.brand, catalog.page, catalog.q, catalog.sort])

    return (
        <Container className="shop-page">
            <Row className="shop-layout g-4">
                <Col xl={3} lg={4}>
                    <aside className="catalog-sidebar">
                        <div className="catalog-panel">
                            <h2 className="catalog-panel__title">Категории каталога</h2>
                            {categoriesFetching ? (
                                <Spinner animation="border" />
                            ) : (
                                <CategoryBar />
                            )}
                        </div>
                        <div className="catalog-meta-card">
                            <h6>Сервис и надежность</h6>
                            <p>Официальные поставки, проверка товара перед отправкой и возврат в течение 14 дней.</p>
                            <div className="catalog-meta-card__stats">
                                <span>{catalog.categories.length} категорий</span>
                                <span>{catalog.brands.length} брендов</span>
                            </div>
                        </div>
                    </aside>
                </Col>
                <Col xl={9} lg={8}>
                    <section className="shop-main">
                        <div
                            className="shop-hero"
                            style={heroContent.backgroundImage ? {'--shop-hero-bg': `url('${heroContent.backgroundImage}')`} : undefined}
                        >
                            <div className="shop-hero__content">
                                <p className="shop-hero__eyebrow">{heroContent.eyebrow}</p>
                                <h1>{heroContent.title}</h1>
                                <p>{heroContent.description}</p>
                                <div className="shop-hero__actions">
                                    <Button variant="light" onClick={() => document.getElementById('catalog-tools')?.scrollIntoView({behavior: 'smooth'})}>
                                        Перейти к фильтрам
                                    </Button>
                                    <Button variant="outline-light" onClick={handleResetFilters}>
                                        Сбросить выбор
                                    </Button>
                                </div>
                            </div>
                            <div className="shop-hero__metrics">
                                <div className="shop-metric">
                                    <p className="shop-metric__value">{catalog.count}</p>
                                    <p className="shop-metric__label">товаров доступно</p>
                                </div>
                                <div className="shop-metric">
                                    <p className="shop-metric__value">{catalog.brands.length}</p>
                                    <p className="shop-metric__label">брендов в каталоге</p>
                                </div>
                                <div className="shop-metric">
                                    <p className="shop-metric__value">{catalog.categories.length}</p>
                                    <p className="shop-metric__label">категорий техники</p>
                                </div>
                                <div className="shop-metric">
                                    <p className="shop-metric__value">{hasActiveFilters ? 'Да' : 'Нет'}</p>
                                    <p className="shop-metric__label">активные фильтры</p>
                                </div>
                            </div>
                        </div>

                        <div className="catalog-toolbar" id="catalog-tools">
                            <div className="catalog-toolbar__top">
                                <div>
                                    <h2 className="catalog-toolbar__title">Поиск и фильтрация</h2>
                                    <p className="catalog-toolbar__subtitle">Настройте подбор и сразу смотрите обновленный список товаров.</p>
                                </div>
                                <p className="catalog-toolbar__stats">
                                    Найдено: <strong>{catalog.count}</strong>
                                </p>
                            </div>
                            <div className="catalog-toolbar__controls">
                                <Form className="catalog-search" onSubmit={handleSearchSubmit}>
                                    <InputGroup>
                                        <Form.Control
                                            value={searchInput}
                                            maxLength={80}
                                            onChange={(event) => setSearchInput(event.target.value.slice(0, 80))}
                                            placeholder="Например: ноутбук, монитор, гарнитура"
                                        />
                                        <Button type="submit" variant="primary">Искать</Button>
                                    </InputGroup>
                                </Form>
                                <Form.Select
                                    className="catalog-sort"
                                    value={catalog.sort}
                                    onChange={handleSortChange}
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Button
                                    variant="outline-secondary"
                                    className="catalog-reset"
                                    onClick={handleResetFilters}
                                    disabled={!hasActiveFilters}
                                >
                                    Сбросить фильтры
                                </Button>
                            </div>
                            <div className="catalog-toolbar__summary">
                                {catalogSummary.map(item => (
                                    <span key={item.label} className="catalog-summary-chip">
                                        <strong>{item.label}:</strong> {item.value}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="brand-panel">
                            <h3 className="brand-panel__title">Бренды</h3>
                            {brandsFetching ? (
                                <Spinner animation="border" />
                            ) : (
                                <BrandBar />
                            )}
                        </div>

                        <div className="catalog-section">
                            <ProductList loading={productsFetching} />
                        </div>
                    </section>
                </Col>
            </Row>
        </Container>
    )
})

export default Shop
