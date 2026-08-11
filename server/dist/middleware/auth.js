import { verifySession } from '../lib/session.js';
import { AppError } from '../lib/errors.js';
export function requireAuth(req, _res, next) {
    const userId = verifySession(req);
    if (!userId) {
        next(AppError.unauthorized('UNAUTHORIZED', 'Please sign in to continue'));
        return;
    }
    ;
    req.userId = userId;
    next();
}
//# sourceMappingURL=auth.js.map