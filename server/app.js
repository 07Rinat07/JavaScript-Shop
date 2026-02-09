import 'dotenv/config'
import express from 'express'
import './models/mapping.js'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import router from './routes/index.js'
import errorMiddleware from './middleware/errorMiddleware.js'

const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
const UPLOAD_MAX_FILE_SIZE = Number.parseInt(process.env.UPLOAD_MAX_FILE_SIZE ?? '5242880', 10)
const RATE_LIMIT_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10)

const app = express()

app.use(helmet({crossOriginResourcePolicy: false}))
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
}))

// Cross-Origin Resource Sharing
app.use(cors({origin: CORS_ORIGINS, credentials: true}))
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
