import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { env, authConfigured } from '../lib/env.js';
import { clearOAuthStateCookie, clearSessionCookie, getOAuthStateCookie, setOAuthStateCookie, setSessionCookie, verifySession, } from '../lib/session.js';
import { exchangeCode, generateAuthUrl } from '../lib/auth.js';
import prisma from '../lib/prisma.js';
import { seedSampleDataForUser } from '../lib/seedSample.js';
const router = Router();
router.get('/google', asyncHandler(async (_req, res) => {
    if (!authConfigured) {
        res.status(503).json({
            error: {
                code: 'AUTH_NOT_CONFIGURED',
                message: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env.',
            },
        });
        return;
    }
    const state = crypto.randomBytes(16).toString('hex');
    const { url, codeVerifier } = await generateAuthUrl(state);
    setOAuthStateCookie(res, state, codeVerifier);
    res.redirect(url);
}));
router.get('/google/callback', asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    const stored = getOAuthStateCookie(req);
    if (error || typeof code !== 'string' || typeof state !== 'string' || !stored || stored.state !== state) {
        res.redirect(`${env.CLIENT_URL}/login?auth=error`);
        return;
    }
    clearOAuthStateCookie(res);
    try {
        const profile = await exchangeCode(code, stored.verifier);
        const user = await prisma.user.upsert({
            where: { googleId: profile.googleId },
            update: { email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl },
            create: {
                googleId: profile.googleId,
                email: profile.email,
                name: profile.name,
                avatarUrl: profile.avatarUrl,
            },
        });
        if (env.NODE_ENV !== 'production') {
            await seedSampleDataForUser(user.id);
        }
        setSessionCookie(res, user.id);
        res.redirect(`${env.CLIENT_URL}/diary`);
    }
    catch {
        res.redirect(`${env.CLIENT_URL}/login?auth=error`);
    }
}));
router.get('/me', asyncHandler(async (req, res) => {
    const userId = verifySession(req);
    if (!userId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not signed in' } });
        return;
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not signed in' } });
        return;
    }
    res.json({ user });
}));
router.post('/logout', requireAuth, (_req, res) => {
    clearSessionCookie(res);
    res.status(204).send();
});
export default router;
//# sourceMappingURL=auth.js.map