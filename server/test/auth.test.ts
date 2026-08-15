import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import { authCookie, createTestUser } from './helpers.js'

describe('/api/auth', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser('me-test@example.com')
    userId = user.id
  })

  it('GET /me returns 401 without a session cookie', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('GET /me returns the user with a valid session cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ id: userId, email: 'me-test@example.com' })
  })

  it('GET /me rejects a tampered session cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['diary_session=not.a.valid-token'])

    expect(res.status).toBe(401)
  })

  it('POST /logout clears the session and returns 204', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(204)
  })

  it('POST /logout without auth returns 401', async () => {
    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(401)
  })

  it('GET /google returns 503 when OAuth is not configured', async () => {
    const res = await request(app).get('/api/auth/google')

    expect(res.status).toBe(503)
    expect(res.body.error.code).toBe('AUTH_NOT_CONFIGURED')
  })
})
