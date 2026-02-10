import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import AppError from '../errors/AppError.js'
import validateIntegerParam from '../middleware/validateIntegerParam.js'
import auth from '../middleware/authMiddleware.js'
import admin from '../middleware/adminMiddleware.js'

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret'

const createNextSpy = () => {
    const calls = []
    const next = (arg) => {
        calls.push(arg)
    }

    return {next, calls}
}

test('AppError static constructors return expected status codes', () => {
    assert.equal(AppError.badRequest('bad').status, 400)
    assert.equal(AppError.unauthorized('auth').status, 401)
    assert.equal(AppError.forbidden('forbidden').status, 403)
    assert.equal(AppError.internalServerError('internal').status, 500)
})

test('validateIntegerParam normalizes valid integer params', () => {
    const middleware = validateIntegerParam()
    const req = {params: {}}
    const {next, calls} = createNextSpy()

    middleware(req, {}, next, '007', 'id')

    assert.equal(req.params.id, '7')
    assert.equal(calls.length, 1)
    assert.equal(calls[0], undefined)
})

test('validateIntegerParam returns 400 for non-integer param values', () => {
    const middleware = validateIntegerParam()
    const req = {params: {}}
    const {next, calls} = createNextSpy()

    middleware(req, {}, next, '12a', 'id')

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 400)
    assert.equal(calls[0].message, 'Некорректный параметр id')
})

test('validateIntegerParam returns 400 for values outside allowed range', () => {
    const middleware = validateIntegerParam({min: 1, max: 5})
    const req = {params: {}}
    const {next, calls} = createNextSpy()

    middleware(req, {}, next, '6', 'rate')

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 400)
    assert.equal(calls[0].message, 'Некорректный параметр rate')
})

test('auth middleware returns 401 when authorization header is missing', () => {
    const req = {method: 'GET', headers: {}}
    const {next, calls} = createNextSpy()

    auth(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 401)
    assert.equal(calls[0].message, 'Требуется авторизация')
})

test('auth middleware returns 401 for malformed authorization header', () => {
    const req = {method: 'GET', headers: {authorization: 'Basic test'}}
    const {next, calls} = createNextSpy()

    auth(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 401)
    assert.equal(calls[0].message, 'Требуется авторизация')
})

test('auth middleware returns 401 for invalid token', () => {
    const req = {method: 'GET', headers: {authorization: 'Bearer invalid-token'}}
    const {next, calls} = createNextSpy()

    auth(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 401)
    assert.equal(calls[0].message, 'Недействительный токен')
})

test('auth middleware sets req.auth for valid token', () => {
    const token = jwt.sign(
        {id: 1, email: 'admin@example.com', role: 'ADMIN'},
        process.env.SECRET_KEY,
        {algorithm: 'HS256', expiresIn: '1h'}
    )
    const req = {method: 'GET', headers: {authorization: `Bearer ${token}`}}
    const {next, calls} = createNextSpy()

    auth(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0], undefined)
    assert.equal(req.auth.email, 'admin@example.com')
    assert.equal(req.auth.role, 'ADMIN')
})

test('auth middleware skips checks for OPTIONS requests', () => {
    const req = {method: 'OPTIONS', headers: {}}
    const {next, calls} = createNextSpy()

    auth(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0], undefined)
})

test('admin middleware skips checks for OPTIONS requests', () => {
    const req = {method: 'OPTIONS'}
    const {next, calls} = createNextSpy()

    admin(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0], undefined)
})

test('admin middleware returns 401 when req.auth is missing', () => {
    const req = {method: 'GET'}
    const {next, calls} = createNextSpy()

    admin(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 401)
    assert.equal(calls[0].message, 'Требуется авторизация')
})

test('admin middleware returns 403 for non-admin users', () => {
    const req = {method: 'GET', auth: {id: 2, role: 'USER'}}
    const {next, calls} = createNextSpy()

    admin(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0] instanceof AppError, true)
    assert.equal(calls[0].status, 403)
    assert.equal(calls[0].message, 'Только для администратора')
})

test('admin middleware allows admin users', () => {
    const req = {method: 'GET', auth: {id: 1, role: 'ADMIN'}}
    const {next, calls} = createNextSpy()

    admin(req, {}, next)

    assert.equal(calls.length, 1)
    assert.equal(calls[0], undefined)
})
