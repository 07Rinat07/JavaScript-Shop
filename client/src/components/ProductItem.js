import { Card, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { IMG_URL } from '../config.js'
import { append } from '../http/basketAPI.js'
import { AppContext } from './AppContext.js'
import formatPrice from '../utils/formatPrice.js'
import { observer } from 'mobx-react-lite'

const ProductItem = ({data}) => {
    const navigate = useNavigate()
    const { basket, currency } = useContext(AppContext)
    const [isAdding, setIsAdding] = useState(false)
    const productUrl = `/product/${data.id}`

    const handleAddToBasket = (event) => {
        event.stopPropagation()
        if (isAdding) {
            return
        }
        setIsAdding(true)
        append(data.id)
            .then(result => {
                basket.products = result.products
            })
            .finally(() => setIsAdding(false))
    }

    const handleOpenProduct = (event) => {
        event.stopPropagation()
        navigate(productUrl)
    }

    const ratingValue = Number.isFinite(Number(data.rating)) ? Number(data.rating).toFixed(1) : '0.0'
    const brand = data.brand?.name ?? 'Без бренда'
    const category = data.category?.name ?? 'Без категории'

    return (
        <Col xxl={4} xl={4} lg={6} sm={6} xs={12} className="mt-3">
            <Card className="catalog-card" onClick={() => navigate(productUrl)}>
                <div className="catalog-card__media">
                    {data.image ? (
                        <Card.Img
                            variant="top"
                            className="catalog-card__image"
                            src={IMG_URL + data.image}
                            alt={data.name}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                        />
                    ) : (
                        <Card.Img
                            variant="top"
                            className="catalog-card__image"
                            src="https://placehold.co/600x600/e6edf8/52607a?text=No+Image"
                            alt="Изображение отсутствует"
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                        />
                    )}
                    <div className="catalog-card__badges">
                        <span className="catalog-card__badge">В наличии</span>
                        <span className="catalog-card__badge catalog-card__badge--light">SKU #{data.id}</span>
                    </div>
                </div>
                <Card.Body className="catalog-card__body">
                    <div className="catalog-card__meta">
                        <span>{brand}</span>
                        <span>{category}</span>
                    </div>
                    <Card.Title className="catalog-card__title">{data.name}</Card.Title>
                    <p className="catalog-card__hint">Официальная поставка. Гарантия производителя и сервисная поддержка.</p>
                    <div className="catalog-card__rating">
                        <span>★</span>
                        <span>{ratingValue}</span>
                        <span className="catalog-card__rating-label">оценка покупателей</span>
                    </div>
                    <div className="catalog-card__service">
                        <span>Доставка от 1 дня</span>
                        <span>Возврат 14 дней</span>
                    </div>
                    <div className="catalog-card__footer">
                        <div>
                            <p className="catalog-card__price-label">Цена</p>
                            <div className="catalog-card__price">{formatPrice(data.price, currency.code, currency.rubToKztRate)}</div>
                        </div>
                        <div className="catalog-card__actions">
                            <Button variant="outline-secondary" size="sm" className="catalog-card__cta" onClick={handleOpenProduct}>
                                Подробнее
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="catalog-card__cta"
                                onClick={handleAddToBasket}
                                disabled={isAdding}
                            >
                                {isAdding ? 'Добавляем...' : 'В корзину'}
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    )
}

export default observer(ProductItem)
