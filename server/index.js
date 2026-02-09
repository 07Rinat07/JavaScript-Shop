import 'dotenv/config'
import sequelize from './sequelize.js'
import app from './app.js'

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await sequelize.authenticate()
        if (process.env.DB_SYNC === 'true') {
            await sequelize.sync()
        }
        app.listen(PORT, () => console.log('Сервер запущен на порту', PORT))
    } catch(e) {
        console.log(e)
    }
}

start()
