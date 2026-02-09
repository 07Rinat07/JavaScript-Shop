import AppError from '../errors/AppError.js'

const error = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.status).json({message: err.message})
    }
    console.error(err)
    return res.status(500).json({message: 'Непредвиденная ошибка'})
}

export default error
