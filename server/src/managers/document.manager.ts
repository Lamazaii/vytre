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

/*
Create a new document with its blocks and images
*/
export const create = async (data: DocumentInput) => {
    // Filters empty blocks on the server side
    const filteredBlocks = (data.blocks ?? []).filter((block) => {
        const hasText =
        block.text && block.text.replace(/<[^>]*>/g, '').trim().length > 0;
        const hasImages = block.images && block.images.length > 0;
        const hasNonEmptyZone = block.textZones?.some((z) =>
            z && z.replace(/<[^>]*>/g, '').trim().length > 0);
        return hasText ?? hasImages ?? hasNonEmptyZone;
    });
    return await prisma.document.create({
        data: {
            title: data.title,
            version: data.version,
            blocks: {
                create: filteredBlocks.map((block) => ({
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

/*
Get all documents with their blocks and images, 
ordered by updated date descending
*/
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
            updatedAt: 'desc',
        },
    });
};

/*
Get a document by its ID, including its blocks and images
*/

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


// Update a document by its ID
export const update = async (id: number, data: DocumentInput) => {
    // Filter empty blocks on the server side
    const filteredBlocks = (data.blocks ?? []).filter((block) => {
        const hasText =
        block.text && block.text.replace(/<[^>]*>/g, '').trim().length > 0;
        const hasImages = block.images && block.images.length > 0;
        const hasNonEmptyZone = block.textZones?.some((z) =>
            z && z.replace(/<[^>]*>/g, '').trim().length > 0);
        return hasText ?? hasImages ?? hasNonEmptyZone;
    });
    return await prisma.document.update({
        where: { id },
        data: {
            title: data.title,
            version: data.version,
            blocks: {
                deleteMany: {},
                create: filteredBlocks.map((block) => ({
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