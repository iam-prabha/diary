export interface GoogleProfile {
    googleId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
}
export declare function generateAuthUrl(state: string): Promise<{
    url: string;
    codeVerifier: string;
}>;
export declare function exchangeCode(code: string, codeVerifier: string): Promise<GoogleProfile>;
//# sourceMappingURL=auth.d.ts.map