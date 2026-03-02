
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('../src/lib/prisma', () => {
    return {
        prisma: {
            document: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        },
    };
});

import * as documentManager from '../src/managers/document.manager';
import { prisma } from '../src/lib/prisma';

describe('DocumentManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call prisma.document.create with correct data', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: 'abc',
                        step: 1,
                        nbOfRepeats: 2,
                        images: [{ imagePath: 'img.png' }],
                    },
                ],
            };
            await documentManager.create(data);
            expect(prisma.document.create).toHaveBeenCalled();
        });

        it('should filter out blocks with only empty text', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: '', step: 1 },
                    { text: '   ', step: 2 },
                    { text: '<p></p>', step: 3 },
                    { text: 'valid content', step: 4 },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(createCall.data.blocks.create).toHaveLength(1);
        });

        it('should keep block with images even if no text', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: '', step: 1, images: [{ imagePath: 'image.jpg' }] },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(createCall.data.blocks.create).toHaveLength(1);
        });

        it(
            'should keep block with non-empty textZones even if no text',
            async () => {
                (prisma.document.create as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        { text: '', step: 1, textZones: ['zone content'] },
                    ],
                };
                await documentManager.create(data);
                const createCall = (
                    prisma.document.create as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: unknown[] } }
                };
                expect(createCall.data.blocks.create).toHaveLength(1);
            },
        );

        it('should filter out block with only empty textZones', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: '', step: 1, textZones: ['', '   ', '<p></p>'] },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(createCall.data.blocks.create).toHaveLength(0);
        });

        it('should handle blocks without explicit blocks field', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(createCall.data.blocks.create).toHaveLength(0);
        });

        it('should default nbOfRepeats to 1 when undefined', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: 'content', step: 1 },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { nbOfRepeats: number }[] } }
            };
            expect(createCall.data.blocks.create[0].nbOfRepeats).toBe(1);
        });

        it('should default text to empty string when undefined', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { step: 1, images: [{ imagePath: 'img.jpg' }] },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { text: string }[] } }
            };
            expect(createCall.data.blocks.create[0].text).toBe('');
        });

        it('should default images to empty array when undefined', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: 'content', step: 1 },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as {
                data: {
                    blocks: { create: { images: { create: unknown[] } }[] }
                }
            };
            expect(createCall.data.blocks.create[0].images.create)
                .toHaveLength(0);
        });

        it(
            'should default textZones to empty array when undefined',
            async () => {
                (prisma.document.create as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        { text: 'content', step: 1 },
                    ],
                };
                await documentManager.create(data);
                const createCall = (
                    prisma.document.create as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: { textZones: string }[] } }
                };
                expect(createCall.data.blocks.create[0].textZones).toBe('[]');
            },
        );

        it('should keep block with canvasData even if no text', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: '', step: 1, canvasData: 'canvas-data-string' },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(createCall.data.blocks.create).toHaveLength(1);
        });

        it('should filter out block with empty canvasData and no content',
            async () => {
                (prisma.document.create as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        { text: '', step: 1, canvasData: '' },
                    ],
                };
                await documentManager.create(data);
                const createCall = (
                    prisma.document.create as jest.Mock
                ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
                expect(createCall.data.blocks.create).toHaveLength(0);
            },
        );

        it('should pass canvasData through on create', async () => {
            (prisma.document.create as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 1,
                blocks: [
                    { text: 'content', step: 1, canvasData: 'my-canvas-data' },
                ],
            };
            await documentManager.create(data);
            const createCall = (
                prisma.document.create as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { canvasData: string | null }[] } }
            };
            expect(createCall.data.blocks.create[0].canvasData)
                .toBe('my-canvas-data');
        });

        it('should default canvasData to null when undefined on create',
            async () => {
                (prisma.document.create as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        { text: 'content', step: 1 },
                    ],
                };
                await documentManager.create(data);
                const createCall = (
                    prisma.document.create as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: { canvasData: string | null }[] } }
                };
                expect(createCall.data.blocks.create[0].canvasData).toBeNull();
            },
        );
    });

    describe('getAll', () => {
        it('should call prisma.document.findMany', async () => {
            (prisma.document.findMany as jest.Mock).mockResolvedValue([]);
            await documentManager.getAll();
            expect(prisma.document.findMany).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should call prisma.document.findUnique with id', async () => {
            (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);
            await documentManager.getById(42);
            expect(prisma.document.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 42 } }),
            );
        });
    });

    describe('update', () => {
        it('should call prisma.document.update with id and data', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
                blocks: [
                    { text: 'abc',
                        step: 1,
                        nbOfRepeats: 2,
                        images: [{ imagePath: 'img.png' }],
                    },
                ],
            };
            await documentManager.update(1, data);
            expect(prisma.document.update).toHaveBeenCalled();
        });

        it(
            'should filter out blocks with only empty text on update',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: '', step: 1 },
                        { text: 'valid content', step: 2 },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: unknown[] } }
                };
                expect(updateCall.data.blocks.create).toHaveLength(1);
            },
        );

        it(
            'should keep block with images on update even if no text',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        {
                            text: '',
                            step: 1,
                            images: [{ imagePath: 'image.jpg' }],
                        },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: unknown[] } }
                };
                expect(updateCall.data.blocks.create).toHaveLength(1);
            },
        );

        it(
            'should keep block with non-empty textZones on update',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: '', step: 1, textZones: ['zone content'] },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: unknown[] } }
                };
                expect(updateCall.data.blocks.create).toHaveLength(1);
            },
        );

        it('should handle update without explicit blocks field', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
            };
            await documentManager.update(1, data);
            const updateCall = (
                prisma.document.update as jest.Mock
            ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
            expect(updateCall.data.blocks.create).toHaveLength(0);
        });

        it('should default nbOfRepeats to 1 on update when undefined', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
                blocks: [
                    { text: 'content', step: 1 },
                ],
            };
            await documentManager.update(1, data);
            const updateCall = (
                prisma.document.update as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { nbOfRepeats: number }[] } }
            };
            expect(updateCall.data.blocks.create[0].nbOfRepeats).toBe(1);
        });

        it('should default text to empty string on update when undefined', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
                blocks: [
                    { step: 1, images: [{ imagePath: 'img.jpg' }] },
                ],
            };
            await documentManager.update(1, data);
            const updateCall = (
                prisma.document.update as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { text: string }[] } }
            };
            expect(updateCall.data.blocks.create[0].text).toBe('');
        });

        it('should default images to empty array on update when undefined', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
                blocks: [
                    { text: 'content', step: 1 },
                ],
            };
            await documentManager.update(1, data);
            const updateCall = (
                prisma.document.update as jest.Mock
            ).mock.calls[0][0] as {
                data: {
                    blocks: { create: { images: { create: unknown[] } }[] }
                }
            };
            expect(updateCall.data.blocks.create[0].images.create)
                .toHaveLength(0);
        });

        it(
            'should default textZones to empty array on update when undefined',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: 'content', step: 1 },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: { textZones: string }[] } }
                };
                expect(updateCall.data.blocks.create[0].textZones).toBe('[]');
            },
        );

        it('should keep block with canvasData on update even if no text',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: '', step: 1, canvasData: 'canvas-data-string' },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
                expect(updateCall.data.blocks.create).toHaveLength(1);
            },
        );

        it(
            'should filter out block with empty canvasData on update',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: '', step: 1, canvasData: '' },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as { data: { blocks: { create: unknown[] } } };
                expect(updateCall.data.blocks.create).toHaveLength(0);
            },
        );

        it('should pass canvasData through on update', async () => {
            (prisma.document.update as jest.Mock).mockResolvedValue({ id: 1 });
            const data = {
                title: 'Test',
                version: 2,
                blocks: [
                    { text: 'content', step: 1, canvasData: 'my-canvas-data' },
                ],
            };
            await documentManager.update(1, data);
            const updateCall = (
                prisma.document.update as jest.Mock
            ).mock.calls[0][0] as {
                data: { blocks: { create: { canvasData: string | null }[] } }
            };
            expect(updateCall.data.blocks.create[0].canvasData)
                .toBe('my-canvas-data');
        });

        it('should default canvasData to null on update when undefined',
            async () => {
                (prisma.document.update as jest.Mock)
                    .mockResolvedValue({ id: 1 });
                const data = {
                    title: 'Test',
                    version: 2,
                    blocks: [
                        { text: 'content', step: 1 },
                    ],
                };
                await documentManager.update(1, data);
                const updateCall = (
                    prisma.document.update as jest.Mock
                ).mock.calls[0][0] as {
                    data: { blocks: { create: { canvasData: string | null }[] } }
                };
                expect(updateCall.data.blocks.create[0].canvasData).toBeNull();
            },
        );
    });
});

