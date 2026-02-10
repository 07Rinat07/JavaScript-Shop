import AppError from '../errors/AppError.js'

const validateIntegerParam = ({min = 1, max = Number.MAX_SAFE_INTEGER} = {}) => {
    return (req, res, next, value, name) => {
        if (!/^\d+$/.test(value)) {
            return next(AppError.badRequest(`Некорректный параметр ${name}`))
        }

        const parsed = Number.parseInt(value, 10)
        if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
            return next(AppError.badRequest(`Некорректный параметр ${name}`))
        }

        req.params[name] = String(parsed)
        return next()
    }
}

export default validateIntegerParam
