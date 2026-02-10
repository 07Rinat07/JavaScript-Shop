import { Container, Navbar, Nav, Form } from 'react-bootstrap'
import { NavLink, Link } from 'react-router-dom'
import { AppContext } from './AppContext.js'
import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { CURRENCY_OPTIONS } from '../utils/formatPrice.js'

const getNavLinkClass = ({isActive}) => `site-nav__link${isActive ? ' is-active' : ''}`

const NavBar = observer(() => {
    const { user, basket, currency, siteContent } = useContext(AppContext)
    const navbar = siteContent.navbar

    const handleCurrencyChange = (event) => {
        const next = event.target.value
        currency.code = next
        if (next === 'KZT') {
            currency.syncRate({refresh: true})
        }
    }

    return (
        <header className="site-header sticky-top">
            <div className="site-topline">
                <Container className="site-topline__inner">
                    <div className="site-topline__group">
                        <span>{navbar.topLinePrimary}</span>
                        <span>{navbar.topLineSecondary}</span>
                    </div>
                    <div className="site-topline__group">
                        <span>{navbar.phone}</span>
                        <span>{navbar.workingHours}</span>
                        <div className="currency-switch">
                            <Form.Label className="currency-switch__label">Валюта</Form.Label>
                            <Form.Select
                                size="sm"
                                className="currency-switch__select"
                                value={currency.code}
                                onChange={handleCurrencyChange}
                                aria-label="Выбор валюты"
                            >
                                {CURRENCY_OPTIONS.map(item => (
                                    <option key={item.code} value={item.code}>
                                        {item.code}
                                    </option>
                                ))}
                            </Form.Select>
                            <span className="currency-rate">
                                1 ₽ = {currency.rubToKztRate.toFixed(3)} ₸
                            </span>
                        </div>
                    </div>
                </Container>
            </div>
            <Navbar expand="lg" variant="dark" className="site-navbar">
                <Container className="site-header__inner">
                    <Link to="/" className="site-brand">
                        <span className="site-brand__title">{navbar.brandTitle}</span>
                        <span className="site-brand__subtitle">{navbar.brandSubtitle}</span>
                    </Link>

                    <div className="site-header__meta">
                        {navbar.featureBadges.map((item, index) => (
                            <span key={`${item}-${index}`}>{item}</span>
                        ))}
                    </div>

                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <div className="currency-switch currency-switch--mobile">
                            <Form.Label className="currency-switch__label">Валюта</Form.Label>
                            <Form.Select
                                size="sm"
                                className="currency-switch__select"
                                value={currency.code}
                                onChange={handleCurrencyChange}
                                aria-label="Выбор валюты"
                            >
                                {CURRENCY_OPTIONS.map(item => (
                                    <option key={item.code} value={item.code}>
                                        {item.code}
                                    </option>
                                ))}
                            </Form.Select>
                            <span className="currency-rate">
                                1 ₽ = {currency.rubToKztRate.toFixed(3)} ₸
                            </span>
                        </div>
                        <Nav className="ms-auto site-nav">
                            <NavLink to="/delivery" className={getNavLinkClass}>Доставка</NavLink>
                            <NavLink to="/contacts" className={getNavLinkClass}>Контакты</NavLink>
                            {user.isAuth ? (
                                <NavLink to="/user" className={getNavLinkClass}>Личный кабинет</NavLink>
                            ) : (
                                <>
                                    <NavLink to="/login" className={getNavLinkClass}>Войти</NavLink>
                                    <NavLink to="/signup" className={getNavLinkClass}>Регистрация</NavLink>
                                </>
                            )}
                            {user.isAdmin && (
                                <NavLink to="/admin" className={getNavLinkClass}>Панель управления</NavLink>
                            )}
                            <NavLink to="/basket" className={({isActive}) => `site-nav__link site-nav__cart${isActive ? ' is-active' : ''}`}>
                                Корзина
                                {!!basket.count && <span className="site-cart-badge">{basket.count}</span>}
                            </NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
})

export default NavBar
