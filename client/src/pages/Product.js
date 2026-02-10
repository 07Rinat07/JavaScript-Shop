import { Container, Row, Col, Button, Image, Spinner, Table } from 'react-bootstrap'
import { useEffect, useState, useContext } from 'react'
import { fetchOneProduct, fetchProdRating } from '../http/catalogAPI.js'
import { useParams } from 'react-router-dom'
import { append } from '../http/basketAPI.js'
import { AppContext } from '../components/AppContext.js'
import { IMG_URL } from '../config.js'
import formatPrice from '../utils/formatPrice.js'
import { observer } from 'mobx-react-lite'

const Product = () => {
    const { id } = useParams()
    const { basket, currency } = useContext(AppContext)
    const [product, setProduct] = useState(null)
    const [rating, setRating] = useState(null)

    useEffect(() => {
        fetchOneProduct(id).then(data => setProduct(data))
        fetchProdRating(id).then(data => setRating(data))
    }, [id])

    const handleClick = (productId) => {
        append(productId).then(data => {
            basket.products = data.products
        })
    }

    if (!product) {
        return (
            <Container className="product-page">
                <Spinner animation="border" />
            </Container>
        )
    }

    return (
        <Container className="product-page">
            <Row className="g-3">
                <Col lg={4}>
                    <div className="product-panel product-gallery">
                        {product.image ? (
                            <Image
                                className="product-gallery__image"
                                src={IMG_URL + product.image}
                                alt={product.name}
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                            />
                        ) : (
                            <Image
                                className="product-gallery__image"
                                src="https://placehold.co/600x600/e6edf8/52607a?text=No+Image"
                                alt="Изображение отсутствует"
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                            />
                        )}
                    </div>
                </Col>
                <Col lg={8}>
                    <div className="product-panel">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price">{formatPrice(product.price, currency.code, currency.rubToKztRate)}</p>

                        <div className="product-badges">
                            <span className="product-badge">Бренд: {product.brand.name}</span>
                            <span className="product-badge">Категория: {product.category.name}</span>
                            <span className="product-badge">
                                {rating ? `Рейтинг ${rating.rating} (${rating.votes} голосов)` : 'Рейтинг загружается...'}
                            </span>
                        </div>

                        <ul className="product-benefits">
                            <li>Официальная гарантия производителя</li>
                            <li>Проверка устройства перед отправкой</li>
                            <li>Оплата картой, СБП или при получении</li>
                        </ul>

                        <div>
                            <Button className="product-cta" onClick={() => handleClick(product.id)}>
                                Добавить в корзину
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
            {!!product.props.length &&
                <Row className="mt-3">
                    <Col>
                        <div className="product-panel">
                            <h3>Характеристики</h3>
                            <Table bordered hover size="sm" className="product-specs">
                                <tbody>
                                    {product.props.map(item => 
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.value}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            }
        </Container>
    )
}

export default observer(Product)
