import { Suspense, lazy, useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppContext } from './AppContext.js'
import { observer } from 'mobx-react-lite'
import Loader from './Loader.js'

const Shop = lazy(() => import('../pages/Shop.js'))
const Login = lazy(() => import('../pages/Login.js'))
const Signup = lazy(() => import('../pages/Signup.js'))
const Basket = lazy(() => import('../pages/Basket.js'))
const Checkout = lazy(() => import('../pages/Checkout.js'))
const Product = lazy(() => import('../pages/Product.js'))
const Delivery = lazy(() => import('../pages/Delivery.js'))
const Contacts = lazy(() => import('../pages/Contacts.js'))
const NotFound = lazy(() => import('../pages/NotFound.js'))
const User = lazy(() => import('../pages/User.js'))
const UserOrders = lazy(() => import('../pages/UserOrders.js'))
const UserOrder = lazy(() => import('../pages/UserOrder.js'))
const Admin = lazy(() => import('../pages/Admin.js'))
const AdminOrders = lazy(() => import('../pages/AdminOrders.js'))
const AdminOrder = lazy(() => import('../pages/AdminOrder.js'))
const AdminCategories = lazy(() => import('../pages/AdminCategories.js'))
const AdminBrands = lazy(() => import('../pages/AdminBrands.js'))
const AdminProducts = lazy(() => import('../pages/AdminProducts.js'))
const AdminContacts = lazy(() => import('../pages/AdminContacts.js'))
const AdminFeedback = lazy(() => import('../pages/AdminFeedback.js'))

const publicRoutes = [
    {path: '/', Component: Shop},
    {path: '/login', Component: Login},
    {path: '/signup', Component: Signup},
    {path: '/product/:id', Component: Product},
    {path: '/basket', Component: Basket},
    {path: '/checkout', Component: Checkout},
    {path: '/delivery', Component: Delivery},
    {path: '/contacts', Component: Contacts},
    {path: '*', Component: NotFound},
]

const authRoutes = [
    {path: '/user', Component: User},
    {path: '/user/orders', Component: UserOrders},
    {path: '/user/order/:id', Component: UserOrder},
]

const adminRoutes = [
    {path: '/admin', Component: Admin},
    {path: '/admin/orders', Component: AdminOrders},
    {path: '/admin/order/:id', Component: AdminOrder},
    {path: '/admin/categories', Component: AdminCategories},
    {path: '/admin/brands', Component: AdminBrands},
    {path: '/admin/products', Component: AdminProducts},
    {path: '/admin/contacts', Component: AdminContacts},
    {path: '/admin/content', Component: AdminContacts},
    {path: '/admin/feedback', Component: AdminFeedback},
]

const AppRouter = observer(() => {
    const { user } = useContext(AppContext)
    return (
        <Suspense fallback={<Loader fullscreen={false} />}>
            <Routes>
                {publicRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component />} />
                )}
                {user.isAuth && authRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component />} />
                )}
                {user.isAdmin && adminRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component />} />
                )}
            </Routes>
        </Suspense>
    )
})

export default AppRouter
