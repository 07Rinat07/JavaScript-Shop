import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { fetchRatesOverview } from '../http/currencyAPI.js'

const BASE_OPTIONS = [
    {code: 'KZT', label: 'Тенге'},
    {code: 'RUB', label: 'Российский рубль'},
    {code: 'USD', label: 'Доллар США'},
    {code: 'EUR', label: 'Евро'},
    {code: 'CNY', label: 'Китайский юань'},
]

const SYMBOLS = [
    {code: 'USD', label: 'Доллар США', sign: '$'},
    {code: 'EUR', label: 'Евро', sign: '€'},
    {code: 'RUB', label: 'Российский рубль', sign: '₽'},
    {code: 'KZT', label: 'Казахстанский тенге', sign: '₸'},
    {code: 'CNY', label: 'Китайский юань', sign: '¥'},
    {code: 'GBP', label: 'Британский фунт', sign: '£'},
    {code: 'TRY', label: 'Турецкая лира', sign: '₺'},
    {code: 'AED', label: 'Дирхам ОАЭ', sign: 'د.إ'},
]

const formatRate = (value) => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return '—'
    if (parsed >= 1000) return parsed.toFixed(2)
    if (parsed >= 100) return parsed.toFixed(3)
    if (parsed >= 1) return parsed.toFixed(4)
    return parsed.toFixed(6)
}

const formatUpdatedAt = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString('ru-RU')
}

const CurrencyOverviewWidget = () => {
    const [base, setBase] = useState('KZT')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [payload, setPayload] = useState(null)

    const symbols = useMemo(() => SYMBOLS.map(item => item.code), [])

    const loadRates = async ({refresh = false} = {}) => {
        if (refresh) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }
        setError('')
        try {
            const data = await fetchRatesOverview({
                base,
                symbols,
                refresh,
            })
            setPayload(data)
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Не удалось загрузить курсы валют')
        } finally {
            if (refresh) {
                setRefreshing(false)
            } else {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        loadRates({refresh: false})
        // eslint-disable-next-line
    }, [base])

    const cards = SYMBOLS.map(item => {
        const rate = payload?.rates?.[item.code]
        return {
            ...item,
            rate: formatRate(rate),
            isBase: item.code === payload?.base,
        }
    })

    return (
        <section className="user-currency-widget">
            <div className="user-currency-widget__head">
                <div>
                    <h2>Курсы валют</h2>
                    <p>Следите за актуальными курсами: евро, доллар, рубль, тенге, юань и другие.</p>
                </div>
                <div className="user-currency-widget__controls">
                    <Form.Select
                        value={base}
                        onChange={(event) => setBase(event.target.value)}
                        aria-label="Базовая валюта"
                    >
                        {BASE_OPTIONS.map(option => (
                            <option key={option.code} value={option.code}>
                                База: {option.code} — {option.label}
                            </option>
                        ))}
                    </Form.Select>
                    <Button
                        variant="outline-primary"
                        onClick={() => loadRates({refresh: true})}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Обновляем...' : 'Обновить'}
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="user-currency-widget__loader">
                    <Spinner animation="border" />
                </div>
            )}

            {!loading && !!error && <Alert variant="danger" className="mb-0">{error}</Alert>}

            {!loading && !error && (
                <>
                    <Row className="g-3">
                        {cards.map(item => (
                            <Col key={item.code} xxl={3} xl={4} md={6}>
                                <Card className={`user-currency-card${item.isBase ? ' is-base' : ''}`}>
                                    <Card.Body>
                                        <div className="user-currency-card__top">
                                            <div>
                                                <p className="user-currency-card__code">
                                                    {item.sign} {item.code}
                                                </p>
                                                <p className="user-currency-card__label">{item.label}</p>
                                            </div>
                                            {item.isBase && <Badge bg="primary">База</Badge>}
                                        </div>
                                        <p className="user-currency-card__rate">
                                            1 {payload?.base} = <strong>{item.rate} {item.code}</strong>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="user-currency-widget__meta">
                        <span>Источник: {payload?.source ?? '—'}</span>
                        <span>Обновлено: {formatUpdatedAt(payload?.fetchedAt)}</span>
                        {payload?.fallback && <Badge bg="warning" text="dark">Резервные данные</Badge>}
                        {payload?.stale && <Badge bg="secondary">Курс может быть неактуальным</Badge>}
                    </div>
                </>
            )}
        </section>
    )
}

export default CurrencyOverviewWidget
