const requests = new Map();
export const rateLimit = (maxRequests = 100, windowMs = 60_000) => {
    return (req, res, next) => {
        if (process.env.NODE_ENV === 'test') {
            next();
            return;
        }
        const ip = req.ip || 'unknown';
        const now = Date.now();
        const record = requests.get(ip);
        if (!record || now > record.resetAt) {
            requests.set(ip, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (record.count >= maxRequests) {
            return res.status(429).json({
                error: { code: 'RATE_LIMITED', message: 'Too many requests' },
            });
        }
        record.count++;
        next();
    };
};
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requests.entries()) {
        if (now > record.resetAt)
            requests.delete(ip);
    }
}, 5 * 60 * 1000);
//# sourceMappingURL=rateLimit.js.map