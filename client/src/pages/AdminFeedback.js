import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Container, Form, Modal, Spinner, Table } from 'react-bootstrap'
import {
    adminBlockFeedback,
    adminDeleteFeedback,
    adminGetAllFeedback,
    adminGetOneFeedback,
    adminMarkFeedbackRead,
} from '../http/feedbackAPI.js'

const STATUS_OPTIONS = Object.freeze([
    {value: 'all', label: 'Все'},
    {value: 'new', label: 'Новые'},
    {value: 'read', label: 'Прочитанные'},
    {value: 'spam', label: 'Спам'},
])

const STATUS_LABELS = Object.freeze({
    new: 'Новое',
    read: 'Прочитано',
    spam: 'Спам',
})

const STATUS_BADGE_VARIANTS = Object.freeze({
    new: 'primary',
    read: 'secondary',
    spam: 'danger',
})

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString('ru-RU')
}

const AdminFeedback = () => {
    const [feedback, setFeedback] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [workingId, setWorkingId] = useState(null)
    const [selectedFeedback, setSelectedFeedback] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const loadFeedback = async ({silent = false} = {}) => {
        if (!silent) {
            setLoading(true)
        }
        setError('')
        try {
            const data = await adminGetAllFeedback(filter)
            setFeedback(data)
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось загрузить обращения')
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        loadFeedback()
        // eslint-disable-next-line
    }, [filter])

    const counters = useMemo(() => {
        return feedback.reduce((acc, item) => {
            acc.total += 1
            if (item.status === 'new') acc.new += 1
            if (item.status === 'read') acc.read += 1
            if (item.status === 'spam') acc.spam += 1
            return acc
        }, {total: 0, new: 0, read: 0, spam: 0})
    }, [feedback])

    const updateFeedbackItem = (updated) => {
        setFeedback(prev => {
            const next = prev.map(item => (item.id === updated.id ? updated : item))
            if (filter === 'all') return next
            return next.filter(item => item.status === filter)
        })
    }

    const handleOpenFeedback = async (id) => {
        setWorkingId(id)
        setError('')
        setMessage('')
        try {
            const data = await adminGetOneFeedback(id)
            setSelectedFeedback(data)
            setShowModal(true)
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось открыть обращение')
        } finally {
            setWorkingId(null)
        }
    }

    const handleMarkAsRead = async (id, {silent = false} = {}) => {
        setWorkingId(id)
        if (!silent) {
            setError('')
            setMessage('')
        }
        try {
            const data = await adminMarkFeedbackRead(id)
            updateFeedbackItem(data)
            setSelectedFeedback(prev => (prev?.id === id ? {...prev, ...data} : prev))
            if (!silent) {
                setMessage('Обращение помечено как прочитанное')
            }
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось отметить обращение')
        } finally {
            setWorkingId(null)
        }
    }

    const handleBlockAsSpam = async (id) => {
        setWorkingId(id)
        setError('')
        setMessage('')
        try {
            const data = await adminBlockFeedback(id)
            updateFeedbackItem(data)
            setSelectedFeedback(prev => (prev?.id === id ? {...prev, ...data} : prev))
            setMessage('Отправитель заблокирован как спам')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось заблокировать отправителя')
        } finally {
            setWorkingId(null)
        }
    }

    const handleDeleteFeedback = async (id) => {
        const confirmed = window.confirm('Удалить это обращение? Действие необратимо.')
        if (!confirmed) return

        setWorkingId(id)
        setError('')
        setMessage('')
        try {
            await adminDeleteFeedback(id)
            setFeedback(prev => prev.filter(item => item.id !== id))
            if (selectedFeedback?.id === id) {
                setShowModal(false)
                setSelectedFeedback(null)
            }
            setMessage('Обращение удалено')
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось удалить обращение')
        } finally {
            setWorkingId(null)
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
            <section className="admin-feedback-page">
                <div className="product-panel">
                    <h1>Обратная связь</h1>
                    <p>Здесь администратор читает обращения, удаляет их и блокирует спам-отправителей.</p>
                    <div className="admin-feedback-stats">
                        <Badge bg="dark">Всего: {counters.total}</Badge>
                        <Badge bg="primary">Новые: {counters.new}</Badge>
                        <Badge bg="secondary">Прочитанные: {counters.read}</Badge>
                        <Badge bg="danger">Спам: {counters.spam}</Badge>
                    </div>
                    {!!message && <Alert variant="success" className="mt-3 mb-0">{message}</Alert>}
                    {!!error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
                </div>

                <div className="product-panel admin-feedback-panel">
                    <div className="admin-feedback-toolbar">
                        <Form.Select
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            className="admin-feedback-filter"
                        >
                            {STATUS_OPTIONS.map(item => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </Form.Select>
                        <Button
                            variant="outline-primary"
                            onClick={() => loadFeedback({silent: true})}
                        >
                            Обновить
                        </Button>
                    </div>

                    {!feedback.length ? (
                        <Alert variant="secondary" className="mb-0">Обращений пока нет.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table bordered hover className="mb-0 align-middle admin-feedback-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Дата</th>
                                        <th>Имя</th>
                                        <th>Email</th>
                                        <th>Тема</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedback.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{formatDateTime(item.createdAt)}</td>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.subject || '—'}</td>
                                            <td>
                                                <Badge bg={STATUS_BADGE_VARIANTS[item.status] ?? 'dark'}>
                                                    {STATUS_LABELS[item.status] ?? item.status}
                                                </Badge>
                                                {item.isBlocked && <Badge bg="warning" text="dark" className="ms-1">Блок</Badge>}
                                            </td>
                                            <td className="admin-feedback-actions">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleOpenFeedback(item.id)}
                                                    disabled={workingId === item.id}
                                                >
                                                    Читать
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => handleMarkAsRead(item.id)}
                                                    disabled={workingId === item.id || item.status === 'read'}
                                                >
                                                    Прочитано
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    onClick={() => handleBlockAsSpam(item.id)}
                                                    disabled={workingId === item.id || item.status === 'spam'}
                                                >
                                                    Спам
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => handleDeleteFeedback(item.id)}
                                                    disabled={workingId === item.id}
                                                >
                                                    Удалить
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </section>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Обращение №{selectedFeedback?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!!selectedFeedback && (
                        <div className="admin-feedback-modal">
                            <p><strong>Имя:</strong> {selectedFeedback.name}</p>
                            <p><strong>Email:</strong> {selectedFeedback.email}</p>
                            <p><strong>Телефон:</strong> {selectedFeedback.phone || '—'}</p>
                            <p><strong>Тема:</strong> {selectedFeedback.subject || '—'}</p>
                            <p><strong>IP:</strong> {selectedFeedback.sourceIp || '—'}</p>
                            <p><strong>User-Agent:</strong> {selectedFeedback.userAgent || '—'}</p>
                            <p><strong>Дата:</strong> {formatDateTime(selectedFeedback.createdAt)}</p>
                            <hr />
                            <p className="admin-feedback-modal__message">{selectedFeedback.message}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {!!selectedFeedback && (
                        <>
                            <Button
                                variant="outline-secondary"
                                onClick={() => handleMarkAsRead(selectedFeedback.id, {silent: true})}
                                disabled={workingId === selectedFeedback.id || selectedFeedback.status === 'read'}
                            >
                                Отметить как прочитанное
                            </Button>
                            <Button
                                variant="outline-warning"
                                onClick={() => handleBlockAsSpam(selectedFeedback.id)}
                                disabled={workingId === selectedFeedback.id || selectedFeedback.status === 'spam'}
                            >
                                Заблокировать как спам
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                                disabled={workingId === selectedFeedback.id}
                            >
                                Удалить
                            </Button>
                        </>
                    )}
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default AdminFeedback
