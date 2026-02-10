const TOKEN_STORAGE_KEY = 'token'

const getStoredToken = (storage = globalThis.localStorage, key = TOKEN_STORAGE_KEY) => {
    if (!storage || typeof storage.getItem !== 'function') {
        return null
    }

    const token = storage.getItem(key)
    if (typeof token !== 'string' || token.trim() === '') {
        return null
    }

    return token
}

const applyAuthorizationHeader = (config, token) => {
    if (!token) {
        return config
    }

    config.headers ??= {}
    config.headers.authorization = `Bearer ${token}`
    return config
}

const createAuthInterceptor = ({storage = globalThis.localStorage, key = TOKEN_STORAGE_KEY} = {}) => {
    return (config) => applyAuthorizationHeader(config, getStoredToken(storage, key))
}

export {
    TOKEN_STORAGE_KEY,
    getStoredToken,
    applyAuthorizationHeader,
    createAuthInterceptor
}
