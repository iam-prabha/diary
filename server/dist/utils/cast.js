export function asString(value) {
    return typeof value === 'string' ? value : undefined;
}
export function asNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}
export function asParam(value) {
    return Array.isArray(value) ? value[0] : value ?? '';
}
//# sourceMappingURL=cast.js.map