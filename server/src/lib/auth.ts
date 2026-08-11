import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library'
import { env } from './env.js'

const client = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
})

export interface GoogleProfile {
  googleId: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export async function generateAuthUrl(state: string): Promise<{ url: string; codeVerifier: string }> {
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync()
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    code_challenge_method: CodeChallengeMethod.S256,
    code_challenge: codeChallenge,
    prompt: 'select_account',
  })
  return { url, codeVerifier }
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<GoogleProfile> {
  const { tokens } = await client.getToken({
    code,
    codeVerifier,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
  })
  const idToken = tokens.id_token
  if (!idToken) throw new Error('Google did not return an ID token')

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    throw new Error('Google profile missing required fields')
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || null,
    avatarUrl: payload.picture || null,
  }
}
