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
