
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
                version: '1.0.0',
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
                version: '1.0.0',
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
    });
});
