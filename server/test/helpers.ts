import { signSession } from '../src/lib/session.js'

export const AUTH_COOKIE = 'diary_session'

export function authCookie(userId: string): string {
  return `${AUTH_COOKIE}=${signSession(userId)}`
}

export async function createTestUser(email?: string) {
  const prisma = (await import('../src/lib/prisma.js')).default
  return prisma.user.create({
    data: { email: email || `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`, name: 'Test User' },
  })
}
