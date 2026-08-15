import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'

describe('GET /api/health', () => {
  it('returns ok with a connected database', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBe('connected')
    expect(typeof res.body.timestamp).toBe('string')
  })
})
