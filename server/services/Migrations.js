import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATIONS_TABLE = 'schema_migrations'
const DEFAULT_MIGRATIONS_DIR = path.resolve(__dirname, '../migrations')

const ensureMigrationsTable = async (sequelize) => {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
            name VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `)
}

const getAppliedMigrationNames = async (sequelize) => {
    const [rows] = await sequelize.query(`
        SELECT name
        FROM ${MIGRATIONS_TABLE}
        ORDER BY applied_at ASC, name ASC;
    `)
    return new Set(rows.map(row => row.name))
}

const resolveMigrationUp = async (filePath) => {
    const moduleUrl = pathToFileURL(filePath).href
    const loaded = await import(moduleUrl)
    const up = loaded.up ?? loaded.default?.up ?? loaded.default
    if (typeof up !== 'function') {
        throw new Error(`Миграция ${path.basename(filePath)} не экспортирует функцию up`)
    }
    return up
}

const isMigrationFile = (name) => /^\d+.*\.js$/i.test(name)

const insertAppliedMigration = async (sequelize, migrationName, transaction) => {
    await sequelize.query(
        `
            INSERT INTO ${MIGRATIONS_TABLE} (name, applied_at)
            VALUES (:name, NOW());
        `,
        {
            replacements: {name: migrationName},
            transaction,
        }
    )
}

const applyMigration = async (sequelize, migrationName, filePath, logger) => {
    const up = await resolveMigrationUp(filePath)
    const queryInterface = sequelize.getQueryInterface()
    const transaction = await sequelize.transaction()
    try {
        await up({queryInterface, sequelize, transaction})
        await insertAppliedMigration(sequelize, migrationName, transaction)
        await transaction.commit()
        logger?.info?.(`[migrate] applied ${migrationName}`)
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const readMigrationFiles = async (migrationsDir) => {
    const entries = await fs.readdir(migrationsDir)
    return entries
        .filter(isMigrationFile)
        .sort((a, b) => a.localeCompare(b))
}

const normalizeLogger = (logger) => {
    if (!logger || typeof logger !== 'object') {
        return console
    }
    return logger
}

const runMigrations = async ({
    sequelize,
    migrationsDir = DEFAULT_MIGRATIONS_DIR,
    logger = console,
} = {}) => {
    if (!sequelize) {
        throw new Error('runMigrations: sequelize обязателен')
    }

    const safeLogger = normalizeLogger(logger)
    await ensureMigrationsTable(sequelize)

    const files = await readMigrationFiles(migrationsDir)
    const applied = await getAppliedMigrationNames(sequelize)

    const result = {
        applied: [],
        skipped: [],
    }

    for (const file of files) {
        const filePath = path.resolve(migrationsDir, file)
        if (applied.has(file)) {
            result.skipped.push(file)
            continue
        }
        await applyMigration(sequelize, file, filePath, safeLogger)
        result.applied.push(file)
    }

    safeLogger?.info?.(
        `[migrate] done: applied=${result.applied.length}, skipped=${result.skipped.length}`
    )

    return result
}

export default runMigrations
