import axios from 'axios'
import { API_URL } from '../config.js'

const guestInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

const authInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

// добавляем в запрос данные для авторизации с помощью перехватчика (interceptor)
const authInterceptor = (config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.authorization = 'Bearer ' + localStorage.getItem('token')
    }
    return config
}
authInstance.interceptors.request.use(authInterceptor)

export {
    guestInstance,
    authInstance
}
