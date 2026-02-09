import AppError from '../errors/AppError.js'

const admin = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        if (!req.auth) {
            throw AppError.unauthorized('Требуется авторизация')
        }
        if (req.auth.role !== 'ADMIN') {
            throw new Error('Только для администратора')
        }
        next()
    } catch (e) {
        next(e instanceof AppError ? e : AppError.forbidden(e.message))
    }
}

export default admin
