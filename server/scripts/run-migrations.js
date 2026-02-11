import 'dotenv/config'
import sequelize from '../sequelize.js'
import runMigrations from '../services/Migrations.js'

const main = async () => {
    try {
        await sequelize.authenticate()
        await runMigrations({sequelize})
        await sequelize.close()
    } catch (error) {
        console.error('Failed to run migrations')
        console.error(error)
        process.exit(1)
    }
}

main()
