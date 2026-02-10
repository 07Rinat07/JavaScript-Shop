import { useEffect, useState } from 'react'
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { fetchContactsContent } from '../http/contentAPI.js'
import { createFeedback } from '../http/feedbackAPI.js'

const initialFeedbackForm = Object.freeze({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
})

const Contacts = () => {
    const [contacts, setContacts] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm)
    const [feedbackSending, setFeedbackSending] = useState(false)
    const [feedbackSuccess, setFeedbackSuccess] = useState('')
    const [feedbackError, setFeedbackError] = useState('')

    useEffect(() => {
        fetchContactsContent()
            .then(data => setContacts(data))
            .catch(e => setError(e?.response?.data?.message ?? 'Не удалось загрузить контакты'))
            .finally(() => setLoading(false))
    }, [])

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

    const handleFeedbackChange = (event) => {
        const {name, value} = event.target
        setFeedbackForm(prev => ({...prev, [name]: value}))
    }

    const handleFeedbackSubmit = async (event) => {
        event.preventDefault()
        setFeedbackError('')
        setFeedbackSuccess('')
        setFeedbackSending(true)
        try {
            await createFeedback(feedbackForm)
            setFeedbackForm(initialFeedbackForm)
            setFeedbackSuccess('Спасибо! Ваше обращение отправлено, мы свяжемся с вами в ближайшее время.')
        } catch (e) {
            setFeedbackError(e?.response?.data?.message ?? 'Не удалось отправить обращение')
        } finally {
            setFeedbackSending(false)
        }
    }

    return (
        <Container className="product-page">
            <section className="contacts-page">
                <div className="contacts-hero">
                    <h1>{contacts.title}</h1>
                    <p>{contacts.description}</p>
                </div>
                <Row className="g-3">
                    <Col md={6}>
                        <div className="contacts-card">
                            <h3>Телефон</h3>
                            <p>{contacts.phone}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="contacts-card">
                            <h3>Email</h3>
                            <p>{contacts.email}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="contacts-card">
                            <h3>Адрес</h3>
                            <p>{contacts.address}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="contacts-card">
                            <h3>График работы</h3>
                            <p>{contacts.workingHours}</p>
                        </div>
                    </Col>
                </Row>
                {!!contacts.mapEmbed && (
                    <div className="contacts-map-wrap">
                        <iframe
                            title="Карта офиса"
                            src={contacts.mapEmbed}
                            className="contacts-map"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}

                <div className="contacts-feedback">
                    <h2>Обратная связь</h2>
                    <p>
                        Оставьте обращение по любому вопросу: доставка, оплата, гарантия или подбор товара.
                    </p>
                    {!!feedbackSuccess && <Alert variant="success">{feedbackSuccess}</Alert>}
                    {!!feedbackError && <Alert variant="danger">{feedbackError}</Alert>}
                    <Form onSubmit={handleFeedbackSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Ваше имя</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={feedbackForm.name}
                                        onChange={handleFeedbackChange}
                                        maxLength={120}
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
                                        value={feedbackForm.email}
                                        onChange={handleFeedbackChange}
                                        maxLength={120}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Телефон (опционально)</Form.Label>
                                    <Form.Control
                                        name="phone"
                                        value={feedbackForm.phone}
                                        onChange={handleFeedbackChange}
                                        maxLength={80}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Тема обращения</Form.Label>
                                    <Form.Control
                                        name="subject"
                                        value={feedbackForm.subject}
                                        onChange={handleFeedbackChange}
                                        maxLength={120}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Сообщение</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="message"
                                        value={feedbackForm.message}
                                        onChange={handleFeedbackChange}
                                        maxLength={3000}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <Button type="submit" disabled={feedbackSending}>
                                {feedbackSending ? 'Отправляем...' : 'Отправить обращение'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </section>
        </Container>
    )
}

export default Contacts
