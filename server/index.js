import 'dotenv/config'
import sequelize from './sequelize.js'
import runMigrations from './services/Migrations.js'
import validateRuntimeConfig from './services/validateRuntimeConfig.js'

const PORT = process.env.PORT || 5000
const STARTUP_ERROR_EXIT_CODE = 1

const start = async () => {
    try {
        validateRuntimeConfig()
        await sequelize.authenticate()
        await runMigrations({sequelize})
        const {default: app} = await import('./app.js')
        app.listen(PORT, () => console.log('Сервер запущен на порту', PORT))
    } catch(e) {
        console.error('Не удалось запустить сервер')
        console.error(e)
        try {
            await sequelize.close()
        } catch {
            // Игнорируем ошибки закрытия пула при неуспешном старте.
        }
        process.exit(STARTUP_ERROR_EXIT_CODE)
    }
}

start()
