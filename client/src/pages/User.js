import { Container, Button } from 'react-bootstrap'
import { useContext } from 'react'
import { AppContext } from '../components/AppContext.js'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../http/userAPI.js'
import CurrencyOverviewWidget from '../components/CurrencyOverviewWidget.js'

const User = () => {
    const { user } = useContext(AppContext)
    const navigate = useNavigate()

    const handleLogout = (event) => {
        logout()
        user.logout()
        navigate('/login', {replace: true})
    }

    return (
        <Container className="user-page">
            <section className="user-page__hero">
                <div>
                    <h1>Личный кабинет</h1>
                    <p>Управляйте заказами и следите за курсами валют в одном месте.</p>
                </div>
                <div className="user-page__actions">
                    <Link to="/user/orders" className="btn btn-primary">История заказов</Link>
                    <Button variant="outline-secondary" onClick={handleLogout}>Выйти</Button>
                </div>
            </section>

            <CurrencyOverviewWidget />
        </Container>
    )
}

export default User
