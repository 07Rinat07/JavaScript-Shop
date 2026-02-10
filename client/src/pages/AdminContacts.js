import { useContext, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { AppContext } from '../components/AppContext.js'
import {
    deleteHomeContent,
    fetchContactsContent,
    fetchDeliveryContent,
    fetchHomeContent,
    fetchNavbarContent,
    updateContactsContent,
    updateDeliveryContent,
    updateHomeContent,
    updateNavbarContent,
} from '../http/contentAPI.js'
import { buildOpenStreetMapEmbedUrl } from '../utils/mapEmbed.js'

const makePointId = () => `point-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const createEmptyPoint = () => ({
    id: makePointId(),
    name: '',
    type: 'pickup',
    address: '',
    phone: '',
    workingHours: '',
    latitude: '',
    longitude: '',
    note: '',
})

const initialContacts = {
    title: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    mapEmbed: '',
}

const initialNavbar = {
    topLinePrimary: '',
    topLineSecondary: '',
    phone: '',
    workingHours: '',
    brandTitle: '',
    brandSubtitle: '',
    featureBadges: [],
}

const initialDelivery = {
    title: '',
    description: '',
    mapSide: 'right',
    points: [],
}

const initialHome = {
    eyebrow: '',
    title: '',
    description: '',
    backgroundImage: '',
}

const AdminContacts = () => {
    const { siteContent } = useContext(AppContext)
    const [contactsForm, setContactsForm] = useState(initialContacts)
    const [navbarForm, setNavbarForm] = useState(initialNavbar)
    const [deliveryForm, setDeliveryForm] = useState(initialDelivery)
    const [homeForm, setHomeForm] = useState(initialHome)
    const [navbarBadgesInput, setNavbarBadgesInput] = useState('')
    const [activePointIndex, setActivePointIndex] = useState(-1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([fetchContactsContent(), fetchNavbarContent(), fetchDeliveryContent(), fetchHomeContent()])
            .then(([contactsData, navbarData, deliveryData, homeData]) => {
                setContactsForm(contactsData)
                setNavbarForm(navbarData)
                setNavbarBadgesInput((navbarData.featureBadges ?? []).join('\n'))
                setDeliveryForm(deliveryData)
                setActivePointIndex(deliveryData?.points?.length ? 0 : -1)
                setHomeForm(homeData)
            })
            .catch(e => setError(e?.response?.data?.message ?? 'Не удалось загрузить данные контента'))
            .finally(() => setLoading(false))
    }, [])

    const selectedPoint = useMemo(() => {
        if (!deliveryForm.points.length) return null
        if (activePointIndex >= 0 && activePointIndex < deliveryForm.points.length) {
            return deliveryForm.points[activePointIndex]
        }
        return deliveryForm.points[0]
    }, [deliveryForm.points, activePointIndex])

    const selectedMapUrl = useMemo(() => {
        if (!selectedPoint) return ''
        return buildOpenStreetMapEmbedUrl(selectedPoint.latitude, selectedPoint.longitude, 0.06)
    }, [selectedPoint])

    const clearMessages = () => {
        setMessage('')
        setError('')
    }

    const handleContactsChange = (event) => {
        const { name, value } = event.target
        setContactsForm(prev => ({...prev, [name]: value}))
    }

    const handleNavbarChange = (event) => {
        const { name, value } = event.target
        setNavbarForm(prev => ({...prev, [name]: value}))
    }

    const handleNavbarBadgesChange = (event) => {
        const value = event.target.value
        setNavbarBadgesInput(value)
        const featureBadges = value
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean)
            .slice(0, 5)
        setNavbarForm(prev => ({...prev, featureBadges}))
    }

    const handleDeliveryChange = (event) => {
        const { name, value } = event.target
        setDeliveryForm(prev => ({...prev, [name]: value}))
    }

    const handleHomeChange = (event) => {
        const { name, value } = event.target
        setHomeForm(prev => ({...prev, [name]: value}))
    }

    const handlePointChange = (pointIndex, field, value) => {
        setDeliveryForm(prev => ({
            ...prev,
            points: prev.points.map((point, index) => (index === pointIndex ? {...point, [field]: value} : point)),
        }))
    }

    const handleAddPoint = () => {
        const nextPoint = createEmptyPoint()
        setDeliveryForm(prev => ({
            ...prev,
            points: [...prev.points, nextPoint],
        }))
        setActivePointIndex(deliveryForm.points.length)
    }

    const handleRemovePoint = (pointIndex) => {
        const nextPoints = deliveryForm.points.filter((_, index) => index !== pointIndex)
        setDeliveryForm(prev => ({
            ...prev,
            points: prev.points.filter((_, index) => index !== pointIndex),
        }))
        setActivePointIndex((currentIndex) => {
            if (!nextPoints.length) return -1
            if (currentIndex > pointIndex) return currentIndex - 1
            if (currentIndex === pointIndex) return 0
            if (currentIndex >= nextPoints.length) return nextPoints.length - 1
            return currentIndex
        })
    }

    const handleSaveContacts = async (event) => {
        event.preventDefault()
        clearMessages()
        setSaving('contacts')
        try {
            const data = await updateContactsContent(contactsForm)
            setContactsForm(data)
            setMessage('Контакты сохранены')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось сохранить контакты')
        } finally {
            setSaving('')
        }
    }

    const handleSaveNavbar = async (event) => {
        event.preventDefault()
        clearMessages()
        setSaving('navbar')
        try {
            const data = await updateNavbarContent(navbarForm)
            setNavbarForm(data)
            setNavbarBadgesInput((data.featureBadges ?? []).join('\n'))
            siteContent.navbar = data
            setMessage('Шапка сайта сохранена')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось сохранить шапку сайта')
        } finally {
            setSaving('')
        }
    }

    const handleSaveDelivery = async (event) => {
        event.preventDefault()
        clearMessages()
        setSaving('delivery')
        try {
            const data = await updateDeliveryContent(deliveryForm)
            setDeliveryForm(data)
            setActivePointIndex((currentIndex) => {
                const total = data.points?.length ?? 0
                if (!total) return -1
                if (currentIndex < 0) return 0
                if (currentIndex >= total) return total - 1
                return currentIndex
            })
            setMessage('Страница доставки и точки сохранены')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось сохранить страницу доставки')
        } finally {
            setSaving('')
        }
    }

    const handleSaveHome = async (event) => {
        event.preventDefault()
        clearMessages()
        setSaving('home')
        try {
            const data = await updateHomeContent(homeForm)
            setHomeForm(data)
            setMessage('Главная страница сохранена')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось сохранить главную страницу')
        } finally {
            setSaving('')
        }
    }

    const handleDeleteHome = async () => {
        clearMessages()
        setSaving('home-delete')
        try {
            const data = await deleteHomeContent()
            setHomeForm(data)
            setMessage('Hero-блок главной страницы удален и сброшен к значениям по умолчанию')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось удалить hero-блок главной страницы')
        } finally {
            setSaving('')
        }
    }

    if (loading) {
        return (
            <Container className="product-page">
                <Spinner animation="border" />
            </Container>
        )
    }

    return (
        <Container className="product-page">
            <section className="admin-content-page">
                <div className="product-panel">
                    <h1>Управление контентом сайта</h1>
                    <p>
                        Здесь администратор управляет шапкой сайта, страницей доставки, GPS-точками ПВЗ/складов и
                        контактной страницей.
                    </p>
                    {!!message && <Alert variant="success">{message}</Alert>}
                    {!!error && <Alert variant="danger">{error}</Alert>}
                </div>

                <div className="product-panel admin-content-section">
                    <h2>Шапка сайта (Navbar)</h2>
                    <Form onSubmit={handleSaveNavbar}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Верхняя строка: блок 1</Form.Label>
                                    <Form.Control
                                        name="topLinePrimary"
                                        value={navbarForm.topLinePrimary}
                                        onChange={handleNavbarChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Верхняя строка: блок 2</Form.Label>
                                    <Form.Control
                                        name="topLineSecondary"
                                        value={navbarForm.topLineSecondary}
                                        onChange={handleNavbarChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Телефон</Form.Label>
                                    <Form.Control
                                        name="phone"
                                        value={navbarForm.phone}
                                        onChange={handleNavbarChange}
                                        maxLength={80}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>График работы</Form.Label>
                                    <Form.Control
                                        name="workingHours"
                                        value={navbarForm.workingHours}
                                        onChange={handleNavbarChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Название бренда</Form.Label>
                                    <Form.Control
                                        name="brandTitle"
                                        value={navbarForm.brandTitle}
                                        onChange={handleNavbarChange}
                                        maxLength={80}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Подзаголовок бренда</Form.Label>
                                    <Form.Control
                                        name="brandSubtitle"
                                        value={navbarForm.brandSubtitle}
                                        onChange={handleNavbarChange}
                                        maxLength={140}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Бейджи преимуществ (по одному в строке, максимум 5)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={navbarBadgesInput}
                                        onChange={handleNavbarBadgesChange}
                                        maxLength={420}
                                        placeholder={'Гарантия до 24 месяцев\nБезопасная оплата\nПоддержка 7 дней в неделю'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <Button type="submit" disabled={saving === 'navbar'}>
                                {saving === 'navbar' ? 'Сохраняем...' : 'Сохранить шапку'}
                            </Button>
                        </div>
                    </Form>
                </div>

                <div className="product-panel admin-content-section">
                    <h2>Главная страница (Hero)</h2>
                    <Form onSubmit={handleSaveHome}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Надзаголовок</Form.Label>
                                    <Form.Control
                                        name="eyebrow"
                                        value={homeForm.eyebrow}
                                        onChange={handleHomeChange}
                                        maxLength={80}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Фоновое изображение (URL)</Form.Label>
                                    <Form.Control
                                        name="backgroundImage"
                                        value={homeForm.backgroundImage}
                                        onChange={handleHomeChange}
                                        maxLength={600}
                                        placeholder="/main-bg.jpg или https://..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Заголовок</Form.Label>
                                    <Form.Control
                                        name="title"
                                        value={homeForm.title}
                                        onChange={handleHomeChange}
                                        maxLength={140}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={homeForm.description}
                                        onChange={handleHomeChange}
                                        maxLength={600}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <Button type="submit" disabled={saving === 'home'}>
                                {saving === 'home' ? 'Сохраняем...' : 'Сохранить главную'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline-danger"
                                className="ms-2"
                                onClick={handleDeleteHome}
                                disabled={saving === 'home-delete'}
                            >
                                {saving === 'home-delete' ? 'Удаляем...' : 'Удалить (сбросить) hero-блок'}
                            </Button>
                        </div>
                    </Form>
                </div>

                <div className="product-panel admin-content-section">
                    <h2>Страница «Доставка» и точки на карте</h2>
                    <Form onSubmit={handleSaveDelivery}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Заголовок страницы</Form.Label>
                                    <Form.Control
                                        name="title"
                                        value={deliveryForm.title}
                                        onChange={handleDeliveryChange}
                                        maxLength={140}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Позиция карты относительно списка</Form.Label>
                                    <Form.Select
                                        name="mapSide"
                                        value={deliveryForm.mapSide}
                                        onChange={handleDeliveryChange}
                                    >
                                        <option value="right">Карта справа</option>
                                        <option value="left">Карта слева</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={deliveryForm.description}
                                        onChange={handleDeliveryChange}
                                        maxLength={700}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="admin-delivery-toolbar">
                            <h3>Пункты приема/выдачи и склады</h3>
                            <Button type="button" variant="outline-primary" onClick={handleAddPoint}>
                                Добавить точку
                            </Button>
                        </div>

                        <div className="admin-delivery-layout">
                            <div className="admin-delivery-points">
                                {!deliveryForm.points.length && (
                                    <Alert variant="warning" className="mb-0">
                                        Нет точек. Добавьте минимум один пункт.
                                    </Alert>
                                )}
                                {deliveryForm.points.map((point, index) => (
                                    <article
                                        key={`${point.id}-${index}`}
                                        className={`admin-delivery-point${activePointIndex === index ? ' is-active' : ''}`}
                                    >
                                        <div className="admin-delivery-point__head">
                                            <Badge bg={point.type === 'warehouse' ? 'secondary' : 'primary'}>
                                                {point.type === 'warehouse' ? 'Склад' : 'Пункт выдачи'}
                                            </Badge>
                                            <div className="admin-delivery-point__actions">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={activePointIndex === index ? 'primary' : 'outline-primary'}
                                                    onClick={() => setActivePointIndex(index)}
                                                >
                                                    Выбрать
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => handleRemovePoint(index)}
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        </div>
                                        <Row className="g-2">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>ID точки</Form.Label>
                                                    <Form.Control
                                                        value={point.id}
                                                        onChange={(event) => handlePointChange(index, 'id', event.target.value)}
                                                        maxLength={64}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Тип</Form.Label>
                                                    <Form.Select
                                                        value={point.type}
                                                        onChange={(event) => handlePointChange(index, 'type', event.target.value)}
                                                    >
                                                        <option value="pickup">Пункт выдачи</option>
                                                        <option value="warehouse">Склад</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Название</Form.Label>
                                                    <Form.Control
                                                        value={point.name}
                                                        onChange={(event) => handlePointChange(index, 'name', event.target.value)}
                                                        maxLength={120}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Адрес</Form.Label>
                                                    <Form.Control
                                                        value={point.address}
                                                        onChange={(event) => handlePointChange(index, 'address', event.target.value)}
                                                        maxLength={220}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Телефон</Form.Label>
                                                    <Form.Control
                                                        value={point.phone}
                                                        onChange={(event) => handlePointChange(index, 'phone', event.target.value)}
                                                        maxLength={80}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>График</Form.Label>
                                                    <Form.Control
                                                        value={point.workingHours}
                                                        onChange={(event) => handlePointChange(index, 'workingHours', event.target.value)}
                                                        maxLength={120}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Широта</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.000001"
                                                        value={point.latitude}
                                                        onChange={(event) => handlePointChange(index, 'latitude', event.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Долгота</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.000001"
                                                        value={point.longitude}
                                                        onChange={(event) => handlePointChange(index, 'longitude', event.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Комментарий</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        value={point.note}
                                                        onChange={(event) => handlePointChange(index, 'note', event.target.value)}
                                                        maxLength={320}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </article>
                                ))}
                            </div>

                            <aside className="admin-delivery-map-preview">
                                <h4>Предпросмотр карты</h4>
                                {!!selectedPoint ? (
                                    <>
                                        <p><strong>{selectedPoint.name}</strong></p>
                                        <p>{selectedPoint.address}</p>
                                        {!!selectedMapUrl ? (
                                            <iframe
                                                title="Предпросмотр точки на карте"
                                                src={selectedMapUrl}
                                                className="admin-delivery-map"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        ) : (
                                            <Alert variant="warning" className="mb-0">
                                                У выбранной точки некорректные GPS-координаты.
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <Alert variant="secondary" className="mb-0">
                                        Выберите точку слева, чтобы увидеть карту.
                                    </Alert>
                                )}
                            </aside>
                        </div>

                        <div className="mt-3">
                            <Button type="submit" disabled={saving === 'delivery'}>
                                {saving === 'delivery' ? 'Сохраняем...' : 'Сохранить доставку и точки'}
                            </Button>
                        </div>
                    </Form>
                </div>

                <div className="product-panel admin-content-section">
                    <h2>Страница «Контакты»</h2>
                    <Form onSubmit={handleSaveContacts}>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Заголовок</Form.Label>
                                    <Form.Control
                                        name="title"
                                        value={contactsForm.title}
                                        onChange={handleContactsChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={contactsForm.description}
                                        onChange={handleContactsChange}
                                        maxLength={600}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Телефон</Form.Label>
                                    <Form.Control
                                        name="phone"
                                        value={contactsForm.phone}
                                        onChange={handleContactsChange}
                                        maxLength={80}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={contactsForm.email}
                                        onChange={handleContactsChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Адрес</Form.Label>
                                    <Form.Control
                                        name="address"
                                        value={contactsForm.address}
                                        onChange={handleContactsChange}
                                        maxLength={220}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>График работы</Form.Label>
                                    <Form.Control
                                        name="workingHours"
                                        value={contactsForm.workingHours}
                                        onChange={handleContactsChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Embed-карта (опционально)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="mapEmbed"
                                        value={contactsForm.mapEmbed}
                                        onChange={handleContactsChange}
                                        maxLength={1600}
                                        placeholder="https://yandex.ru/map-widget/v1/?..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <Button type="submit" disabled={saving === 'contacts'}>
                                {saving === 'contacts' ? 'Сохраняем...' : 'Сохранить контакты'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </section>
        </Container>
    )
}

export default AdminContacts
