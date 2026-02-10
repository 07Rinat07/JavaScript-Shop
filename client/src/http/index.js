import axios from 'axios'
import { API_URL } from '../config.js'
import { createAuthInterceptor } from './authInterceptor.js'

const baseConfig = {
    baseURL: API_URL,
    withCredentials: true
}

const guestInstance = axios.create(baseConfig)

const authInstance = axios.create(baseConfig)
authInstance.interceptors.request.use(createAuthInterceptor())

export {
    guestInstance,
    authInstance
}
