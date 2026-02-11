import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { useState, useContext, useEffect } from 'react'
import { AppContext } from '../components/AppContext.js'
import { userCreate, guestCreate } from '../http/orderAPI.js'
import { fetchBasket } from '../http/basketAPI.js'
import { check as checkAuth } from '../http/userAPI.js'
import { Navigate } from 'react-router-dom'

const isValid = (input) => {
    if (!input) return false
    const trimmed = input.value.trim()
    let pattern
    switch (input.name) {
        case 'name':
            // имя и фамилия/отчество: минимум 2 слова, буквы + дефис/апостроф
            pattern = /^[\p{L}'-]{2,}( [\p{L}'-]{2,}){1,2}$/u
            return pattern.test(trimmed)
        case 'email':
            // практичная проверка email без чрезмерных ограничений
            pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
            return pattern.test(trimmed)
        case 'phone':
            // разрешаем разные форматы, но требуем адекватное число цифр
            pattern = /\d/g
            const digitsCount = (trimmed.match(pattern) ?? []).length
            return digitsCount >= 10 && digitsCount <= 15
        case 'address':
            return trimmed.length >= 5
        default:
            return false
    }
}

const getErrorMessage = (error) => {
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.message) return error.message
    return 'Не удалось оформить заказ. Попробуйте ещё раз.'
}

const Checkout = () => {
    const { user, basket } = useContext(AppContext)
    const [fetching, setFetching] = useState(true) // loader, пока получаем корзину

    const [order, setOrder] = useState(null)
    const [submitError, setSubmitError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [value, setValue] = useState({name: '', email: '', phone: '', address: ''})
    const [valid, setValid] = useState({name: null, email: null, phone: null, address: null})

    useEffect(() => {
        // если корзина пуста, здесь делать нечего
        fetchBasket()
            .then(
                data => basket.products = data.products
            )
            .finally(
                () => setFetching(false)
            )
        // нужно знать, авторизован ли пользователь
        checkAuth()
            .then(data => {
                if (data) {
                    user.login(data)
                }
            })
            .catch(
                error => user.logout()
            )
    }, [])

    if (fetching) { // loader, пока получаем корзину
        return <Spinner animation="border" />
    }

    if (order) { // заказ был успешно оформлен
        return (
            <Container>
                <h1 className="mb-4 mt-4">Заказ оформлен</h1>
                <p>Наш менеджер скоро позвонит для уточнения деталей.</p>
            </Container>
        )
    }

    const handleChange = (event) => {
        setValue({...value, [event.target.name]: event.target.value})
        /*
         * Вообще говоря, проверять данные поля, пока пользователь не закончил ввод — неправильно,
         * проверять надо в момент потери фокуса. Но приходится проверять здесь, поскольку браузеры
         * автоматически заполняют поля. И отловить это событие — весьма проблематичная задача.
         */
        setValid({...valid, [event.target.name]: isValid(event.target)})
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setSubmitError('')
        const form = event.currentTarget

        const nameInput = form.elements.namedItem('name')
        const emailInput = form.elements.namedItem('email')
        const phoneInput = form.elements.namedItem('phone')
        const addressInput = form.elements.namedItem('address')
        const commentInput = form.elements.namedItem('comment')

        const nextValue = {
            name: nameInput?.value.trim() ?? '',
            email: emailInput?.value.trim() ?? '',
            phone: phoneInput?.value.trim() ?? '',
            address: addressInput?.value.trim() ?? '',
        }

        const nextValid = {
            name: isValid(nameInput),
            email: isValid(emailInput),
            phone: isValid(phoneInput),
            address: isValid(addressInput),
        }

        setValue(nextValue)
        setValid(nextValid)

        if (!(nextValid.name && nextValid.email && nextValid.phone && nextValid.address)) {
            setSubmitError('Проверьте корректность имени, email, телефона и адреса.')
            return
        }

        let comment = commentInput?.value.trim() ?? ''
        comment = comment ? comment : null
        // форма заполнена правильно, можно отправлять данные
        const body = {...nextValue, comment}
        const create = user.isAuth ? userCreate : guestCreate
        setSubmitting(true)
        create(body)
            .then(
                data => {
                    setOrder(data)
                    basket.products = []
                }
            )
            .catch(error => {
                setSubmitError(getErrorMessage(error))
            })
            .finally(() => {
                setSubmitting(false)
            })
    }

    return (
        <Container>
            {basket.count === 0 && <Navigate to="/basket" replace={true} />}
            <h1 className="mb-4 mt-4">Оформление заказа</h1>
            <Form noValidate onSubmit={handleSubmit}>
                {submitError && <Alert variant="danger">{submitError}</Alert>}
                <Form.Control
                    name="name"
                    value={value.name}
                    onChange={e => handleChange(e)}
                    isValid={valid.name === true}
                    isInvalid={valid.name === false}
                    placeholder="Введите имя и фамилию..."
                    className="mb-3"
                />
                {valid.name === false && <div className="text-danger small mb-2">Введите минимум имя и фамилию (например: Иван Иванов).</div>}
                <Form.Control
                    name="email"
                    value={value.email}
                    onChange={e => handleChange(e)}
                    isValid={valid.email === true}
                    isInvalid={valid.email === false}
                    placeholder="Введите адрес почты..."
                    className="mb-3"
                />
                {valid.email === false && <div className="text-danger small mb-2">Укажите корректный email.</div>}
                <Form.Control
                    name="phone"
                    value={value.phone}
                    onChange={e => handleChange(e)}
                    isValid={valid.phone === true}
                    isInvalid={valid.phone === false}
                    placeholder="Введите номер телефона..."
                    className="mb-3"
                />
                {valid.phone === false && <div className="text-danger small mb-2">Укажите телефон в формате с 10-15 цифрами.</div>}
                <Form.Control
                    name="address"
                    value={value.address}
                    onChange={e => handleChange(e)}
                    isValid={valid.address === true}
                    isInvalid={valid.address === false}
                    placeholder="Введите адрес доставки..."
                    className="mb-3"
                />
                {valid.address === false && <div className="text-danger small mb-2">Укажите адрес доставки (минимум 5 символов).</div>}
                <Form.Control
                    name="comment"
                    className="mb-3"
                    placeholder="Комментарий к заказу..."
                />
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Отправляем...' : 'Отправить'}
                </Button>
            </Form>
        </Container>
    )
}

export default Checkout
