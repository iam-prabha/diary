import type { Request, Response, NextFunction } from 'express';
export interface AuthedRequest extends Request {
    userId: string;
}
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map