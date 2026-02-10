import { Container, Button } from 'react-bootstrap'
import { useContext } from 'react'
import { AppContext } from '../components/AppContext.js'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../http/userAPI.js'

const Admin = () => {
    const { user } = useContext(AppContext)
    const navigate = useNavigate()

    const handleLogout = (event) => {
        logout()
        user.logout()
        navigate('/login', {replace: true})
    }

    return (
        <Container>
            <h1>Панель управления</h1>
            <p>
                Это панель управления магазином для администратора
            </p>
            <ul>
                <li><Link to="/admin/orders">Заказы в магазине</Link></li>
                <li><Link to="/admin/categories">Категории каталога</Link></li>
                <li><Link to="/admin/brands">Бренды каталога</Link></li>
                <li><Link to="/admin/products">Товары каталога</Link></li>
                <li><Link to="/admin/content">Контент сайта (шапка, доставка, контакты)</Link></li>
                <li><Link to="/admin/feedback">Обратная связь (обращения пользователей)</Link></li>
            </ul>
            <Button onClick={handleLogout}>Выйти</Button>
        </Container>
    )
}

export default Admin
