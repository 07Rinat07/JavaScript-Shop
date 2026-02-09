import jwt from 'jsonwebtoken'
import AppError from '../errors/AppError.js'

const decode = (token) => {
    try {
        if (!process.env.SECRET_KEY) {
            throw new Error('Не настроен SECRET_KEY')
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY, {algorithms: ['HS256']})
        return decoded
    } catch(e) {
        throw new Error('Недействительный токен')
    }
}

const auth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Требуется авторизация')
        }
        const token = authHeader.slice(7).trim()
        if (!token) {
            throw new Error('Требуется авторизация')
        }
        const decoded = decode(token)
        req.auth = decoded
        next()
    } catch (e) {
        next(AppError.unauthorized(e.message))
    }
}

export default auth
