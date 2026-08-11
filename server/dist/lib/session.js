import crypto from 'crypto';
import { env } from './env.js';
const COOKIE_NAME = 'diary_session';
const STATE_COOKIE = 'oauth_state';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
function hmac(value) {
    return crypto.createHmac('sha256', env.SESSION_SECRET).update(value).digest('base64url');
}
function encode(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${hmac(body)}`;
}
function decode(token) {
    const [body, sig] = token.split('.');
    if (!body || !sig)
        return null;
    if (hmac(body) !== sig)
        return null;
    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (typeof payload.uid !== 'string' || typeof payload.exp !== 'number')
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
const cookieOptions = {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
};
export function signSession(userId) {
    return encode({ uid: userId, exp: Date.now() + SESSION_TTL_MS });
}
export function verifySession(req) {
    const token = req.cookies[COOKIE_NAME];
    if (!token)
        return null;
    const payload = decode(token);
    if (!payload)
        return null;
    if (Date.now() > payload.exp)
        return null;
    return payload.uid;
}
export function setSessionCookie(res, userId) {
    res.cookie(COOKIE_NAME, signSession(userId), cookieOptions);
}
export function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, cookieOptions);
}
// --- OAuth state (PKCE verifier + state) in a short-lived cookie ---
export function setOAuthStateCookie(res, state, verifier) {
    res.cookie(STATE_COOKIE, encode({ uid: `${state}.${verifier}`, exp: Date.now() + 10 * 60 * 1000 }), { ...cookieOptions, maxAge: 10 * 60 * 1000 });
}
export function getOAuthStateCookie(req) {
    const token = req.cookies[STATE_COOKIE];
    if (!token)
        return null;
    const payload = decode(token);
    if (!payload)
        return null;
    if (Date.now() > payload.exp)
        return null;
    const dot = payload.uid.indexOf('.');
    if (dot === -1)
        return null;
    return { state: payload.uid.slice(0, dot), verifier: payload.uid.slice(dot + 1) };
}
export function clearOAuthStateCookie(res) {
    res.clearCookie(STATE_COOKIE, cookieOptions);
}
//# sourceMappingURL=session.js.map