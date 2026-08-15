import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import { authCookie, createTestUser } from './helpers.js'

vi.mock('../src/lib/cloudinary.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../src/lib/cloudinary.js')>()
  return {
    ...mod,
    default: {
      uploader: { destroy: vi.fn().mockResolvedValue({ result: 'ok' }) },
    },
  }
})

describe('/api/upload', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser('upload-test@example.com')
    userId = user.id
  })

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/upload/sign')
    expect(res.status).toBe(401)
  })

  it('returns signed upload params', async () => {
    const res = await request(app)
      .get('/api/upload/sign')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      apiKey: 'test-key',
      cloudName: 'test-cloud',
      uploadPreset: 'diary_test',
      folder: 'diary',
    })
    expect(typeof res.body.signature).toBe('string')
    expect(typeof res.body.timestamp).toBe('number')
  })

  it('confirms an upload', async () => {
    const res = await request(app)
      .post('/api/upload/confirm')
      .set('Cookie', [authCookie(userId)])
      .send({
        publicId: 'diary/img1',
        url: 'https://res.cloudinary.com/test/image/upload/v1/diary/img1.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        width: 1024,
        height: 768,
      })

    expect(res.status).toBe(201)
    expect(res.body.cloudinaryId).toBe('diary/img1')
    expect(res.body.entryId).toBeNull()
  })

  it('confirms an upload linked to an entry the user owns', async () => {
    const entry = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(userId)])
      .send({ title: 'media entry', content: 'x', contentText: 'x', tags: [] })

    const res = await request(app)
      .post('/api/upload/confirm')
      .set('Cookie', [authCookie(userId)])
      .send({
        entryId: entry.body.id,
        publicId: 'diary/img2',
        url: 'https://res.cloudinary.com/test/image/upload/v1/diary/img2.jpg',
        mimeType: 'image/jpeg',
        size: 512,
      })

    expect(res.status).toBe(201)
    expect(res.body.entryId).toBe(entry.body.id)
  })

  it('rejects confirming an upload to a foreign entry', async () => {
    const other = await createTestUser('upload-other@example.com')
    const entry = await request(app)
      .post('/api/entries')
      .set('Cookie', [authCookie(other.id)])
      .send({ title: 'their entry', content: 'x', contentText: 'x', tags: [] })

    const res = await request(app)
      .post('/api/upload/confirm')
      .set('Cookie', [authCookie(userId)])
      .send({
        entryId: entry.body.id,
        publicId: 'diary/img3',
        url: 'https://res.cloudinary.com/test/image/upload/v1/diary/img3.jpg',
        mimeType: 'image/jpeg',
        size: 512,
      })

    expect(res.status).toBe(404)
  })

  it('deletes an upload', async () => {
    await request(app)
      .post('/api/upload/confirm')
      .set('Cookie', [authCookie(userId)])
      .send({
        publicId: 'diary/todelete',
        url: 'https://res.cloudinary.com/test/image/upload/v1/diary/todelete.jpg',
        mimeType: 'image/jpeg',
        size: 100,
      })

    const res = await request(app)
      .delete('/api/upload/diary%2Ftodelete')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(204)
  })

  it('returns 404 when deleting a missing upload', async () => {
    const res = await request(app)
      .delete('/api/upload/does-not-exist')
      .set('Cookie', [authCookie(userId)])

    expect(res.status).toBe(404)
  })
})
