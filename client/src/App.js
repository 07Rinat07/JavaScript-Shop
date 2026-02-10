import { BrowserRouter } from 'react-router-dom'
import AppRouter from './components/AppRouter.js'
import NavBar from './components/NavBar.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'

import { AppContext } from './components/AppContext.js'
import { check as checkAuth } from './http/userAPI.js'
import { useState, useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import Loader from './components/Loader.js'

import { fetchBasket } from './http/basketAPI.js'

const App = observer(() => {
    const { user, basket, currency, siteContent } = useContext(AppContext)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        currency.syncRate({refresh: true})
        siteContent.syncNavbar()
        Promise.all([checkAuth(), fetchBasket()])
            .then(([userData, basketData]) => {
                if (!active) return
                if (userData) {
                    user.login(userData)
                }
                basket.products = basketData.products
            })
            .finally(() => {
                if (!active) return
                setLoading(false)
            })
        return () => {
            active = false
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            currency.syncRate({refresh: true})
        }, 10 * 60 * 1000)
        return () => clearInterval(timer)
    }, [currency])

    // показываем loader, пока получаем пользователя и корзину
    if (loading) {
        return <Loader />
    }

    return (
        <BrowserRouter>
            <NavBar />
            <AppRouter />
        </BrowserRouter>
    )
})

export default App
