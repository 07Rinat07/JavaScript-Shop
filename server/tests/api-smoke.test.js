import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret'
const {default: app} = await import('../app.js')

const makeToken = (role = 'USER') => {
    return jwt.sign(
        {id: 1, email: 'user@example.com', role},
        process.env.SECRET_KEY,
        {algorithm: 'HS256', expiresIn: '1h'}
    )
}

test('GET /api/user/check returns 401 without token', async () => {
    const res = await request(app).get('/api/user/check')
    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('GET /api/user/check returns 401 for invalid token', async () => {
    const res = await request(app)
        .get('/api/user/check')
        .set('Authorization', 'Bearer invalid-token')
    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Недействительный токен')
})

test('GET /api/user/check returns token for valid auth token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .get('/api/user/check')
        .set('Authorization', `Bearer ${token}`)
    assert.equal(res.status, 200)
    assert.equal(typeof res.body.token, 'string')
})

test('POST /api/product/create returns 401 without auth', async () => {
    const res = await request(app).post('/api/product/create').send({})
    assert.equal(res.status, 401)
})

test('POST /api/product/create returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .post('/api/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send({})
    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('POST /api/category/create returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .post('/api/category/create')
        .set('Authorization', `Bearer ${token}`)
        .send({name: 'Test'})
    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('POST /api/rating/product/1/rate/5 returns 401 without auth', async () => {
    const res = await request(app).post('/api/rating/product/1/rate/5')
    assert.equal(res.status, 401)
})

test('GET /api/order/admin/getall returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .get('/api/order/admin/getall')
        .set('Authorization', `Bearer ${token}`)
    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('GET /api/order/user/getall returns 401 without auth', async () => {
    const res = await request(app).get('/api/order/user/getall')
    assert.equal(res.status, 401)
})

test('POST /api/payment/order/1/initiate returns 401 without auth', async () => {
    const res = await request(app)
        .post('/api/payment/order/1/initiate')
        .set('Idempotency-Key', 'test-key')
        .send({provider: 'mock'})
    assert.equal(res.status, 401)
})

test('GET /api/payment/order/1 returns 401 without auth', async () => {
    const res = await request(app).get('/api/payment/order/1')
    assert.equal(res.status, 401)
})

test('GET /api/product/getone/abc returns 400 for invalid integer param', async () => {
    const res = await request(app).get('/api/product/getone/abc')
    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'Некорректный параметр id')
})

test('POST /api/rating/product/1/rate/6 returns 400 for out-of-range rate', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .post('/api/rating/product/1/rate/6')
        .set('Authorization', `Bearer ${token}`)

    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'Некорректный параметр rate')
})

test('PUT /api/content/contacts returns 401 without auth', async () => {
    const res = await request(app)
        .put('/api/content/contacts')
        .send({title: 'New title'})

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('PUT /api/content/contacts returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .put('/api/content/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({title: 'New title'})

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('PUT /api/content/navbar returns 401 without auth', async () => {
    const res = await request(app)
        .put('/api/content/navbar')
        .send({brandTitle: 'New title'})

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('PUT /api/content/navbar returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .put('/api/content/navbar')
        .set('Authorization', `Bearer ${token}`)
        .send({brandTitle: 'New title'})

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('PUT /api/content/delivery returns 401 without auth', async () => {
    const res = await request(app)
        .put('/api/content/delivery')
        .send({title: 'Delivery'})

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('PUT /api/content/delivery returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .put('/api/content/delivery')
        .set('Authorization', `Bearer ${token}`)
        .send({title: 'Delivery'})

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('PUT /api/content/home returns 401 without auth', async () => {
    const res = await request(app)
        .put('/api/content/home')
        .send({title: 'Home title'})

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('PUT /api/content/home returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .put('/api/content/home')
        .set('Authorization', `Bearer ${token}`)
        .send({title: 'Home title'})

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('DELETE /api/content/home returns 401 without auth', async () => {
    const res = await request(app)
        .delete('/api/content/home')

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('DELETE /api/content/home returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .delete('/api/content/home')
        .set('Authorization', `Bearer ${token}`)

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})

test('GET /api/currency/rub-kzt returns current or fallback rate', async () => {
    const res = await request(app).get('/api/currency/rub-kzt')

    assert.equal(res.status, 200)
    assert.equal(res.body.base, 'RUB')
    assert.equal(res.body.quote, 'KZT')
    assert.equal(typeof res.body.rate, 'number')
    assert.equal(res.body.rate > 0, true)
})

test('GET /api/currency/overview returns rates map', async () => {
    const res = await request(app).get('/api/currency/overview')

    assert.equal(res.status, 200)
    assert.equal(typeof res.body.base, 'string')
    assert.equal(Array.isArray(res.body.symbols), true)
    assert.equal(typeof res.body.rates, 'object')
    assert.equal(Object.keys(res.body.rates).length > 0, true)
})

test('POST /api/feedback/create returns 400 for invalid payload', async () => {
    const res = await request(app)
        .post('/api/feedback/create')
        .send({name: '', email: 'bad', message: ''})

    assert.equal(res.status, 400)
})

test('GET /api/feedback/admin/getall returns 401 without auth', async () => {
    const res = await request(app).get('/api/feedback/admin/getall')

    assert.equal(res.status, 401)
    assert.equal(res.body.message, 'Требуется авторизация')
})

test('GET /api/feedback/admin/getall returns 403 for non-admin token', async () => {
    const token = makeToken('USER')
    const res = await request(app)
        .get('/api/feedback/admin/getall')
        .set('Authorization', `Bearer ${token}`)

    assert.equal(res.status, 403)
    assert.equal(res.body.message, 'Только для администратора')
})
