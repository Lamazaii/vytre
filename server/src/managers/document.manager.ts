import { prisma } from '../lib/prisma';

interface ImageInput {
    imagePath: string;
}

interface BlockInput {
    text?: string;
    step: number;
    nbOfRepeats?: number;
    images?: ImageInput[];
    textZones?: string[];
}

interface DocumentInput {
    title: string;
    version: string;
    blocks?: BlockInput[];
}

export const create = async (data: DocumentInput) => {
    return await prisma.document.create({
        data: {
            title: data.title,
            version: data.version,
            blocks: {
                create: data.blocks?.map((block) => ({
                    text: block.text ?? '',
                    step: block.step,
                    nbOfRepeats: block.nbOfRepeats ?? 1,
                    textZones: JSON.stringify(block.textZones ?? []),
                    images: {
                        create: block.images?.map((img) => ({
                            imagePath: img.imagePath,
                        })) ?? [],
                    },
                })),
            },
        },
        include: {
            blocks: {
                include: {
                    images: true,
                },
            },
        },
    });
};

export const getAll = async () => {
    return await prisma.document.findMany({
        include: {
            blocks: {
                include: {
                    images: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getById = async (id: number) => {
    return await prisma.document.findUnique({
        where: { id },
        include: {
            blocks: {
                include: {
                    images: true,
                },
            },
        },
    });
};

export const update = async (id: number, data: DocumentInput) => {
    return await prisma.document.update({
        where: { id },
        data: {
            title: data.title,
            version: data.version,
            blocks: {
                deleteMany: {},
                create: data.blocks?.map((block) => ({
                    text: block.text ?? '',
                    step: block.step,
                    nbOfRepeats: block.nbOfRepeats ?? 1,
                    textZones: JSON.stringify(block.textZones ?? []),
                    images: {
                        create: block.images?.map((img) => ({
                            imagePath: img.imagePath,
                        })) ?? [],
                    },
                })),
            },
        },
        include: {
            blocks: {
                include: {
                    images: true,
                },
            },
        },
    });
};