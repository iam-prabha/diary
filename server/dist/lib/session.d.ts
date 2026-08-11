import type { Request, Response } from 'express';
export declare function signSession(userId: string): string;
export declare function verifySession(req: Request): string | null;
export declare function setSessionCookie(res: Response, userId: string): void;
export declare function clearSessionCookie(res: Response): void;
export declare function setOAuthStateCookie(res: Response, state: string, verifier: string): void;
export declare function getOAuthStateCookie(req: Request): {
    state: string;
    verifier: string;
} | null;
export declare function clearOAuthStateCookie(res: Response): void;
//# sourceMappingURL=session.d.ts.map