const WEAK_SECRET_VALUES = new Set([
    'change_me',
    'change_me_docker',
    '__set_strong_secret_key__',
    '__set_me_strong_secret__',
    'test-secret',
])

const validateSecretKey = () => {
    const value = process.env.SECRET_KEY
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('SECRET_KEY не задан')
    }
    const normalized = value.trim()
    if (normalized.length < 32) {
        throw new Error('SECRET_KEY должен быть длиной не менее 32 символов')
    }
    if (WEAK_SECRET_VALUES.has(normalized.toLowerCase())) {
        throw new Error('SECRET_KEY содержит небезопасное значение по умолчанию')
    }
}

const validateWebhookSecret = () => {
    const value = process.env.PAYMENT_WEBHOOK_SECRET
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('PAYMENT_WEBHOOK_SECRET не задан')
    }
    if (value.trim().length < 24) {
        throw new Error('PAYMENT_WEBHOOK_SECRET должен быть длиной не менее 24 символов')
    }
}

const validateRuntimeConfig = () => {
    validateSecretKey()
    validateWebhookSecret()
}

export default validateRuntimeConfig
