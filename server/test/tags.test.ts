import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import { authCookie, createTestUser } from './helpers.js'

describe('/api/tags', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser('tags-test@example.com')
    userId = user.id
  })

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tags')
    expect(res.status).toBe(401)
  })

  it('creates a tag (lowercased and trimmed)', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Cookie', [authCookie(userId)])
      .send({ name: '  Productivity  ', color: '#123456' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('productivity')
    expect(res.body.color).toBe('#123456')
  })

  it('upserts a duplicate tag instead of erroring', async () => {
    await request(app)
      .post('/api/tags')
      .set('Cookie', [authCookie(userId)])
      .send({ name: 'project', color: '#ff0000' })

    const res = await request(app)
      .post('/api/tags')
      .set('Cookie', [authCookie(userId)])
      .send({ name: 'project' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('project')
    expect(res.body.color).toBe('#ff0000')
  })

  it('rejects an invalid tag color', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Cookie', [authCookie(userId)])
      .send({ name: 'badcolor', color: 'red' })

    expect(res.status).toBe(400)
  })

  it('lists tags for the current user only, with counts', async () => {
    await request(app)
      .post('/api/tags')
      .set('Cookie', [authCookie(userId)])
      .send({ name: 'useronly' })

    await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send({
        title: 'Tagged entry',
        content: 'tagged',
        contentText: 'tagged',
        tags: ['useronly'],
      })

    const res = await request(app)
      .get('/api/tags')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(200)
    const tag = res.body.tags.find((t: { name: string }) => t.name === 'useronly')
    expect(tag).toBeTruthy()
    expect(tag.count).toBe(1)
  })
})
