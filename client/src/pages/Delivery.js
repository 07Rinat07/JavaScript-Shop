import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Col, Container, Row, Spinner } from 'react-bootstrap'
import { fetchDeliveryContent } from '../http/contentAPI.js'
import { buildOpenStreetMapEmbedUrl } from '../utils/mapEmbed.js'

const POINT_TYPE_LABELS = {
    pickup: 'Пункт выдачи',
    warehouse: 'Склад',
}

const normalizePointType = (value) => {
    if (typeof value !== 'string') return 'pickup'
    const normalized = value.trim().toLowerCase()
    return normalized === 'warehouse' ? 'warehouse' : 'pickup'
}

const Delivery = () => {
    const [delivery, setDelivery] = useState(null)
    const [activePointId, setActivePointId] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDeliveryContent()
            .then(data => {
                setDelivery(data)
                setActivePointId(data?.points?.[0]?.id ?? '')
            })
            .catch(e => setError(e?.response?.data?.message ?? 'Не удалось загрузить информацию о доставке'))
            .finally(() => setLoading(false))
    }, [])

    const points = delivery?.points ?? []

    const selectedPoint = useMemo(() => {
        if (!points.length) return null
        const selected = points.find(item => item.id === activePointId)
        return selected ?? points[0]
    }, [points, activePointId])

    const mapUrl = useMemo(() => {
        if (!selectedPoint) return ''
        return buildOpenStreetMapEmbedUrl(selectedPoint.latitude, selectedPoint.longitude)
    }, [selectedPoint])

    if (loading) {
        return (
            <Container className="product-page">
                <Spinner animation="border" />
            </Container>
        )
    }

    if (error) {
        return (
            <Container className="product-page">
                <Alert variant="danger">{error}</Alert>
            </Container>
        )
    }

    return (
        <Container className="product-page">
            <section className="delivery-page">
                <div className="delivery-hero">
                    <h1>{delivery.title}</h1>
                    <p>{delivery.description}</p>
                    <div className="delivery-hero__chips">
                        <span>Пунктов на карте: {points.length}</span>
                        <span>Город: Уральск</span>
                        <span>Страна: Казахстан</span>
                    </div>
                </div>

                {!points.length && (
                    <Alert variant="warning">
                        Пункты пока не добавлены. Администратор может заполнить их в панели управления.
                    </Alert>
                )}

                {!!points.length && (
                    <div className={`delivery-layout delivery-layout--${delivery.mapSide === 'left' ? 'left' : 'right'}`}>
                        <div className="delivery-list-panel">
                            <h2>Пункты приема и складские точки</h2>
                            <p>Выберите адрес, чтобы увидеть точку на карте и GPS-координаты.</p>
                            <Row className="g-3">
                                {points.map(item => {
                                    const pointType = normalizePointType(item.type)
                                    const isActive = selectedPoint?.id === item.id
                                    return (
                                        <Col key={item.id} md={6}>
                                            <article className={`delivery-point-card${isActive ? ' is-active' : ''}`}>
                                                <div className="delivery-point-card__head">
                                                    <Badge bg={pointType === 'warehouse' ? 'secondary' : 'primary'}>
                                                        {POINT_TYPE_LABELS[pointType]}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant={isActive ? 'primary' : 'outline-primary'}
                                                        onClick={() => setActivePointId(item.id)}
                                                    >
                                                        {isActive ? 'Выбрано' : 'Показать на карте'}
                                                    </Button>
                                                </div>
                                                <h3>{item.name}</h3>
                                                <p>{item.address}</p>
                                                <ul>
                                                    <li>Телефон: {item.phone || 'Не указан'}</li>
                                                    <li>График: {item.workingHours || 'Не указан'}</li>
                                                    <li>GPS: {item.latitude}, {item.longitude}</li>
                                                </ul>
                                                {!!item.note && <p className="delivery-point-card__note">{item.note}</p>}
                                            </article>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </div>

                        <aside className="delivery-map-panel">
                            <h3>{selectedPoint?.name}</h3>
                            <p>{selectedPoint?.address}</p>
                            {!!mapUrl ? (
                                <iframe
                                    title="Карта выбранной точки"
                                    src={mapUrl}
                                    className="delivery-map"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ) : (
                                <Alert variant="warning" className="mb-0">
                                    Координаты точки заполнены некорректно, карта недоступна.
                                </Alert>
                            )}
                            <div className="delivery-map-meta">
                                <span>Широта: {selectedPoint?.latitude}</span>
                                <span>Долгота: {selectedPoint?.longitude}</span>
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${selectedPoint?.latitude}&mlon=${selectedPoint?.longitude}#map=16/${selectedPoint?.latitude}/${selectedPoint?.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Открыть в OpenStreetMap
                                </a>
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </Container>
    )
}

export default Delivery
