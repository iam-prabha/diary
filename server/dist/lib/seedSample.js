import prisma from './prisma.js';
const tagData = [
    { name: 'personal', color: '#c4785e' },
    { name: 'work', color: '#5e8cc4' },
    { name: 'ideas', color: '#5ec478' },
    { name: 'gratitude', color: '#c4b85e' },
];
const sampleEntries = [
    {
        title: 'First Entry',
        content: JSON.stringify({
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'Welcome to Diary! This is your first entry. Start writing your thoughts, ideas, and memories here.',
                        },
                    ],
                },
            ],
        }),
        contentText: 'Welcome to Diary! This is your first entry. Start writing your thoughts, ideas, and memories here.',
        publishedAt: new Date(),
        tagNames: ['personal', 'gratitude'],
    },
    {
        title: 'Project Ideas',
        content: JSON.stringify({
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Side Project Ideas' }],
                },
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Build a habit tracker' }],
                                },
                            ],
                        },
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Learn Rust' }],
                                },
                            ],
                        },
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Write a blog post' }],
                                },
                            ],
                        },
                    ],
                },
            ],
        }),
        contentText: 'Side Project Ideas Build a habit tracker Learn Rust Write a blog post',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tagNames: ['ideas', 'work'],
    },
    {
        title: 'Morning Reflection',
        content: JSON.stringify({
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Woke up feeling grateful for...' },
                    ],
                },
                {
                    type: 'blockquote',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Gratitude turns what we have into enough.',
                                },
                            ],
                        },
                    ],
                },
            ],
        }),
        contentText: 'Woke up feeling grateful for... Gratitude turns what we have into enough.',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        tagNames: ['personal', 'gratitude'],
    },
];
export async function seedSampleDataForUser(userId) {
    const existing = await prisma.entry.count({ where: { userId } });
    if (existing > 0)
        return;
    const tags = await Promise.all(tagData.map((t) => prisma.tag.upsert({ where: { name: t.name }, update: {}, create: t })));
    const byName = (name) => tags.find((t) => t.name === name);
    for (const entry of sampleEntries) {
        await prisma.entry.create({
            data: {
                title: entry.title,
                content: entry.content,
                contentText: entry.contentText,
                publishedAt: entry.publishedAt,
                userId,
                tags: {
                    create: entry.tagNames.map((name) => ({
                        tag: { connect: { id: byName(name).id } },
                    })),
                },
            },
        });
    }
}
//# sourceMappingURL=seedSample.js.map