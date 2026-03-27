jest.mock('../src/lib/prisma', () => ({
    prisma: {
        documentVersion: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

import { prisma } from '../src/lib/prisma';
import {
    buildSnapshot,
    createDocumentVersion,
    getDocumentVersion,
    getDocumentVersions,
} from '../src/managers/documentVersion.manager';

const createDocumentVersionMock =
    prisma.documentVersion.create as jest.MockedFunction<
        typeof prisma.documentVersion.create
    >;
const findDocumentVersionsMock =
    prisma.documentVersion.findMany as jest.MockedFunction<
        typeof prisma.documentVersion.findMany
    >;
const findDocumentVersionMock =
    prisma.documentVersion.findUnique as jest.MockedFunction<
        typeof prisma.documentVersion.findUnique
    >;

describe('documentVersion.manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('buildSnapshot', () => {
        it('normalizes textZones from JSON string values', () => {
            const snapshot = buildSnapshot({
                title: 'Doc',
                state: 'En édition',
                blocks: [
                    {
                        text: 'A',
                        step: 1,
                        nbOfRepeats: 1,
                        textZones: '["zone1",2,"zone2"]',
                        canvasData: null,
                        images: [{ imagePath: 'img.png' }],
                    },
                    {
                        text: 'B',
                        step: 2,
                        nbOfRepeats: 1,
                        textZones: 'not-json',
                        canvasData: null,
                        images: [],
                    },
                ],
            });

            const parsed = JSON.parse(snapshot) as {
                blocks: { textZones: string[], }[],
            };

            expect(parsed.blocks[0].textZones).toEqual(['zone1', 'zone2']);
            expect(parsed.blocks[1].textZones).toEqual([]);
        });

        it('returns empty arrays when textZones is missing or not an array',
            () => {
                const snapshot = buildSnapshot({
                    title: 'Doc',
                    state: 'En édition',
                    blocks: [
                        {
                            text: 'A',
                            step: 1,
                            nbOfRepeats: 1,
                            canvasData: null,
                            images: [],
                        },
                        {
                            text: 'B',
                            step: 2,
                            nbOfRepeats: 1,
                            textZones: '{"unexpected":true}',
                            canvasData: null,
                            images: [],
                        },
                    ],
                });

                const parsed = JSON.parse(snapshot) as {
                    blocks: { textZones: string[], }[],
                };

                expect(parsed.blocks[0].textZones).toEqual([]);
                expect(parsed.blocks[1].textZones).toEqual([]);
            });
    });

    describe('createDocumentVersion', () => {
        it('returns null when db has no documentVersion delegate', async () => {
            const result = await createDocumentVersion(
                {} as typeof prisma,
                {
                    id: 1,
                    version: 1,
                    title: 'Doc',
                    state: 'En édition',
                    blocks: [],
                },
            );

            expect(result).toBeNull();
        });

        it('creates a version record with serialized snapshot', async () => {
            createDocumentVersionMock.mockResolvedValue({ id: 10 } as never);

            const result = await createDocumentVersion(prisma, {
                id: 1,
                version: 2,
                title: 'Doc',
                state: 'Actif',
                blocks: [
                    {
                        text: 'X',
                        step: 1,
                        nbOfRepeats: 1,
                        textZones: '[]',
                        canvasData: null,
                        images: [],
                    },
                ],
            });

            expect(createDocumentVersionMock).toHaveBeenCalledTimes(1);
            const call = createDocumentVersionMock
                .mock.calls[0][0] as { data: { snapshot: string, }, };
            expect(call.data.snapshot).toContain('"title":"Doc"');
            expect(result).toEqual({ id: 10 });
        });
    });

    describe('getDocumentVersions', () => {
        it('returns versions sorted by version desc', async () => {
            const versions = [{ id: 1, version: 2 }, { id: 2, version: 1 }];
            findDocumentVersionsMock.mockResolvedValue(versions as never);

            const result = await getDocumentVersions(1);

            expect(findDocumentVersionsMock).toHaveBeenCalledWith({
                where: { documentId: 1 },
                select: {
                    id: true,
                    documentId: true,
                    version: true,
                    title: true,
                    state: true,
                    createdAt: true,
                },
                orderBy: {
                    version: 'desc',
                },
            });
            expect(result).toEqual(versions);
        });
    });

    describe('getDocumentVersion', () => {
        it('returns null when version does not exist', async () => {
            findDocumentVersionMock.mockResolvedValue(null);

            const result = await getDocumentVersion(1, 999);

            expect(result).toBeNull();
        });

        it('returns snapshot when stored payload is valid', async () => {
            findDocumentVersionMock.mockResolvedValue({
                id: 1,
                documentId: 1,
                version: 1,
                title: 'Doc',
                state: 'En édition',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                snapshot: JSON.stringify({
                    title: 'Doc',
                    state: 'En édition',
                    blocks: [
                        {
                            text: 'A',
                            step: 1,
                            nbOfRepeats: 1,
                            textZones: [],
                            canvasData: null,
                            images: [],
                        },
                    ],
                }),
            } as never);

            const result = await getDocumentVersion(1, 1);

            expect(result).not.toBeNull();
            expect(result?.snapshot).toEqual({
                title: 'Doc',
                state: 'En édition',
                blocks: [
                    {
                        text: 'A',
                        step: 1,
                        nbOfRepeats: 1,
                        textZones: [],
                        canvasData: null,
                        images: [],
                    },
                ],
            });
        });

        it('returns null snapshot for invalid payload shape', async () => {
            findDocumentVersionMock.mockResolvedValue({
                id: 1,
                documentId: 1,
                version: 1,
                title: 'Doc',
                state: 'En édition',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                snapshot: JSON.stringify({
                    title: 'Doc',
                    state: 'En édition',
                    blocks: [{ text: 'A' }],
                }),
            } as never);

            const result = await getDocumentVersion(1, 1);

            expect(result).not.toBeNull();
            expect(result?.snapshot).toBeNull();
        });
    });
});
