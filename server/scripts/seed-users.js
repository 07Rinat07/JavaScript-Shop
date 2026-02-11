import 'dotenv/config'
import bcrypt from 'bcrypt'
import sequelize from '../sequelize.js'
import { User } from '../models/mapping.js'
import runMigrations from '../services/Migrations.js'

const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10)

const getRequiredEnv = (name) => {
    const value = process.env[name]
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Не задана переменная окружения ${name}`)
    }
    return value.trim()
}

const upsertUser = async ({ email, password, role }) => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: { email, password: hash, role }
    })

    if (!created) {
        await user.update({ password: hash, role })
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        created
    }
}

const main = async () => {
    try {
        const fixtureAdminEmail = getRequiredEnv('FIXTURE_ADMIN_EMAIL')
        const fixtureAdminPassword = getRequiredEnv('FIXTURE_ADMIN_PASSWORD')
        const fixtureUserEmail = getRequiredEnv('FIXTURE_USER_EMAIL')
        const fixtureUserPassword = getRequiredEnv('FIXTURE_USER_PASSWORD')

        await sequelize.authenticate()
        await runMigrations({sequelize})

        const admin = await upsertUser({
            email: fixtureAdminEmail,
            password: fixtureAdminPassword,
            role: 'ADMIN'
        })

        const regular = await upsertUser({
            email: fixtureUserEmail,
            password: fixtureUserPassword,
            role: 'USER'
        })

        console.log('Fixture users ready')
        console.log(admin)
        console.log(regular)
        await sequelize.close()
    } catch (error) {
        console.error('Failed to seed fixture users')
        console.error(error)
        process.exit(1)
    }
}

main()
