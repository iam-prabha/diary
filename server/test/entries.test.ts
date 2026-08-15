import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import prisma from '../src/lib/prisma.js'
import { authCookie, createTestUser } from './helpers.js'

function entryBody(overrides: Record<string, unknown> = {}) {
  return {
    title: 'My first entry',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }] }),
    contentText: 'hello',
    tags: ['work', 'personal'],
    ...overrides,
  }
}

describe('/api/entries', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser('entries-test@example.com')
    userId = user.id
  })

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/entries')
    expect(res.status).toBe(401)
  })

  it('creates an entry with tags', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody())

    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.title).toBe('My first entry')
    expect(res.body.contentText).toBe('hello')
    expect(res.body.tags.map((t: { tag: { name: string } }) => t.tag.name).sort()).toEqual(['personal', 'work'])
  })

  it('rejects an entry with an empty title', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody({ title: '' }))

    expect(res.status).toBe(400)
  })

  it('lists entries with pagination', async () => {
    const create = [...Array(5)].map((_, i) =>
      request(app)
        .post('/api/entries')
        .set('Cookie', [authCookie(userId)])
        .send(entryBody({ title: `Page entry ${i}`, contentText: `body ${i}`, tags: [] })),
    )
    await Promise.all(create)

    const res = await request(app)
      .get('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .query({ page: 1, limit: 3 })

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(3)
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 3, total: 6, totalPages: 2 })
  })

  it('paginates with a cursor', async () => {
    const first = await request(app)
      .get('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .query({ limit: 2 })

    const lastId = first.body.entries[first.body.entries.length - 1].id

    const second = await request(app)
      .get('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .query({ limit: 2, cursor: lastId })

    expect(second.status).toBe(200)
    expect(second.body.entries.length).toBeGreaterThan(0)
    expect(second.body.entries.some((e: { id: string }) => e.id === lastId)).toBe(false)
  })

  it('searches entries by query', async () => {
    const res = await request(app)
      .get('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .query({ q: 'Page entry' })

    expect(res.status).toBe(200)
    expect(res.body.entries.length).toBeGreaterThan(0)
    expect(res.body.entries.every((e: { title: string }) => e.title.includes('Page entry'))).toBe(true)
  })

  it('filters entries by tag', async () => {
    const res = await request(app)
      .get('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .query({ tag: 'work' })

    expect(res.status).toBe(200)
    expect(res.body.entries.length).toBeGreaterThan(0)
    for (const e of res.body.entries) {
      expect(e.tags.some((t: { tag: { name: string } }) => t.tag.name === 'work')).toBe(true)
    }
  })

  it('gets a single entry', async () => {
    const created = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody({ title: 'Single entry' }))

    const res = await request(app)
      .get(`/api/entries/${created.body.id}`)
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Single entry')
  })

  it('returns 404 for a missing entry', async () => {
    const res = await request(app)
      .get('/api/entries/does-not-exist')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(404)
  })

  it('does not leak another user\'s entry', async () => {
    const other = await createTestUser('other-user@example.com')
    const created = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(other.id)])
      .send(entryBody({ title: 'Private entry' }))

    const res = await request(app)
      .get(`/api/entries/${created.body.id}`)
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(404)
  })

  it('updates an entry', async () => {
    const created = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody({ title: 'Before update' }))

    const res = await request(app)
      .patch(`/api/entries/${created.body.id}`)
      .set('Cookie', [authCookie(userId)])
      .send({ title: 'After update' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('After update')
  })

  it('deletes an entry', async () => {
    const created = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody({ title: 'Doomed' }))

    const del = await request(app)
      .delete(`/api/entries/${created.body.id}`)
      .set('Cookie', [authCookie(userId)])

    expect(del.status).toBe(204)

    const after = await request(app)
      .get(`/api/entries/${created.body.id}`)
      .set('Cookie', [authCookie(userId)])

    expect(after.status).toBe(404)
  })

  it('creates an entry with media', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send(entryBody({
        title: 'With media',
        tags: [],
        media: [{
          url: 'https://res.cloudinary.com/test/image/upload/v1/diary/a.jpg',
          mimeType: 'image/jpeg',
          size: 1000,
          width: 800,
          height: 600,
          cloudinaryId: 'diary/a.jpg',
        }],
      }))

    expect(res.status).toBe(201)
    expect(res.body.media).toHaveLength(1)
    expect(res.body.media[0].cloudinaryId).toBe('diary/a.jpg')

    await prisma.entry.delete({ where: { id: res.body.id } })
  })
})
