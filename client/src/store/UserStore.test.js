import UserStore from './UserStore.js'

describe('UserStore', () => {
    it('updates auth state for admin user', () => {
        const store = new UserStore()

        store.login({
            id: 10,
            email: 'admin@example.com',
            role: 'ADMIN'
        })

        expect(store.id).toBe(10)
        expect(store.email).toBe('admin@example.com')
        expect(store.isAuth).toBe(true)
        expect(store.isAdmin).toBe(true)
    })

    it('clears auth state on logout', () => {
        const store = new UserStore()
        store.login({ id: 11, email: 'user@example.com', role: 'USER' })

        store.logout()

        expect(store.id).toBeNull()
        expect(store.email).toBeNull()
        expect(store.isAuth).toBe(false)
        expect(store.isAdmin).toBe(false)
    })
})
