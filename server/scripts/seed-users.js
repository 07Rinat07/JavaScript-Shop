import 'dotenv/config'
import bcrypt from 'bcrypt'
import sequelize from '../sequelize.js'
import { User } from '../models/mapping.js'
import ensureUsersPrimaryKey from '../services/ensureUsersPrimaryKey.js'

const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10)

const FIXTURE_ADMIN_EMAIL = process.env.FIXTURE_ADMIN_EMAIL ?? 'admin@local.test'
const FIXTURE_ADMIN_PASSWORD = process.env.FIXTURE_ADMIN_PASSWORD ?? 'Admin12345'
const FIXTURE_USER_EMAIL = process.env.FIXTURE_USER_EMAIL ?? 'user@local.test'
const FIXTURE_USER_PASSWORD = process.env.FIXTURE_USER_PASSWORD ?? 'User12345'

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
        await sequelize.authenticate()
        if (process.env.DB_SYNC === 'true') {
            await ensureUsersPrimaryKey(sequelize)
            await sequelize.sync()
        }

        const admin = await upsertUser({
            email: FIXTURE_ADMIN_EMAIL,
            password: FIXTURE_ADMIN_PASSWORD,
            role: 'ADMIN'
        })

        const regular = await upsertUser({
            email: FIXTURE_USER_EMAIL,
            password: FIXTURE_USER_PASSWORD,
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
