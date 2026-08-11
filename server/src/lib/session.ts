import crypto from 'crypto'
import type { Request, Response } from 'express'
import { env } from './env.js'

const COOKIE_NAME = 'diary_session'
const STATE_COOKIE = 'oauth_state'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface SessionPayload {
  uid: string
  exp: number
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', env.SESSION_SECRET).update(value).digest('base64url')
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${hmac(body)}`
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  if (hmac(body) !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (typeof payload.uid !== 'string' || typeof payload.exp !== 'number') return null
    return payload
  } catch {
    return null
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  secure: env.NODE_ENV === 'production',
  path: '/',
}

export function signSession(userId: string): string {
  return encode({ uid: userId, exp: Date.now() + SESSION_TTL_MS })
}

export function verifySession(req: Request): string | null {
  const token = (req.cookies as Record<string, string | undefined>)[COOKIE_NAME]
  if (!token) return null
  const payload = decode(token)
  if (!payload) return null
  if (Date.now() > payload.exp) return null
  return payload.uid
}

export function setSessionCookie(res: Response, userId: string): void {
  res.cookie(COOKIE_NAME, signSession(userId), cookieOptions)
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, cookieOptions)
}

// --- OAuth state (PKCE verifier + state) in a short-lived cookie ---

export function setOAuthStateCookie(res: Response, state: string, verifier: string): void {
  res.cookie(
    STATE_COOKIE,
    encode({ uid: `${state}.${verifier}`, exp: Date.now() + 10 * 60 * 1000 }),
    { ...cookieOptions, maxAge: 10 * 60 * 1000 },
  )
}

export function getOAuthStateCookie(req: Request): { state: string; verifier: string } | null {
  const token = (req.cookies as Record<string, string | undefined>)[STATE_COOKIE]
  if (!token) return null
  const payload = decode(token)
  if (!payload) return null
  if (Date.now() > payload.exp) return null
  const dot = payload.uid.indexOf('.')
  if (dot === -1) return null
  return { state: payload.uid.slice(0, dot), verifier: payload.uid.slice(dot + 1) }
}

export function clearOAuthStateCookie(res: Response): void {
  res.clearCookie(STATE_COOKIE, cookieOptions)
}
