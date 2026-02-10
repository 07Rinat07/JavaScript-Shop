import {
    applyAuthorizationHeader,
    createAuthInterceptor,
    getStoredToken
} from './authInterceptor.js'

describe('authInterceptor helpers', () => {
    it('returns null when storage is unavailable', () => {
        expect(getStoredToken(undefined)).toBeNull()
    })

    it('returns null for blank token values', () => {
        const storage = {
            getItem: () => '   '
        }

        expect(getStoredToken(storage)).toBeNull()
    })

    it('adds authorization header when token exists', () => {
        const config = {
            headers: {
                'x-trace-id': 'abc123'
            }
        }

        const nextConfig = applyAuthorizationHeader(config, 'jwt-token')
        expect(nextConfig.headers.authorization).toBe('Bearer jwt-token')
        expect(nextConfig.headers['x-trace-id']).toBe('abc123')
    })

    it('does not add authorization header when token is absent', () => {
        const config = {headers: {}}
        const nextConfig = applyAuthorizationHeader(config, null)

        expect(nextConfig.headers.authorization).toBeUndefined()
    })

    it('reads token from provided storage and key', () => {
        const storage = {
            getItem: (key) => (key === 'custom_token' ? 'custom-value' : null)
        }
        const interceptor = createAuthInterceptor({
            storage,
            key: 'custom_token'
        })
        const nextConfig = interceptor({headers: {}})

        expect(nextConfig.headers.authorization).toBe('Bearer custom-value')
    })
})
