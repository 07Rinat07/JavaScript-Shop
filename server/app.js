import 'dotenv/config'
import express from 'express'
import './models/mapping.js'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import router from './routes/index.js'
import { webhookRouter as paymentWebhookRouter } from './routes/payment.js'
import errorMiddleware from './middleware/errorMiddleware.js'

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '').toLowerCase()

const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(normalizeOrigin)
const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
const allowedOrigins = new Set([
    ...CORS_ORIGINS,
    ...DEFAULT_CORS_ORIGINS.map(normalizeOrigin),
])
const UPLOAD_MAX_FILE_SIZE = Number.parseInt(process.env.UPLOAD_MAX_FILE_SIZE ?? '5242880', 10)
const RATE_LIMIT_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10)

const app = express()

const corsOptions = {
    origin: (origin, callback) => {
        // Requests without Origin are allowed (curl, health checks, same-origin)
        if (!origin) {
            callback(null, true)
            return
        }
        const normalizedOrigin = normalizeOrigin(origin)
        const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)
        if (allowedOrigins.has(normalizedOrigin) || isLocalOrigin) {
            callback(null, true)
            return
        }
        callback(null, false)
    },
    credentials: true,
    optionsSuccessStatus: 204,
}

// Cross-Origin Resource Sharing
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use(helmet({crossOriginResourcePolicy: false}))
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
}))

// webhook маршруты платежей должны обрабатываться как raw body до express.json
app.use('/api/payment/webhook', paymentWebhookRouter)

// middleware для работы с json
app.use(express.json({limit: '1mb'}))
// middleware для статики (img, css)
app.use(express.static('static'))
// middleware для загрузки файлов
app.use(fileUpload({
    abortOnLimit: true,
    createParentPath: false,
    limits: {fileSize: UPLOAD_MAX_FILE_SIZE},
    preserveExtension: true,
    safeFileNames: true,
}))
// middleware для работы с cookie
app.use(cookieParser(process.env.SECRET_KEY))
// healthcheck endpoint
app.get('/health', (req, res) => res.status(200).json({status: 'ok'}))
// все маршруты приложения
app.use('/api', router)

// обработка ошибок
app.use(errorMiddleware)

export default app
