export const entryInclude = {
    tags: { include: { tag: true } },
    media: true,
};
export function extractTextFromTipTap(json) {
    try {
        const doc = JSON.parse(json);
        return extractText(doc);
    }
    catch {
        return '';
    }
}
function extractText(node) {
    if (!node || typeof node !== 'object')
        return '';
    const n = node;
    if (n.type === 'text')
        return n.text || '';
    if (Array.isArray(n.content))
        return n.content.map(extractText).join(' ');
    return '';
}
//# sourceMappingURL=entryHelpers.js.map