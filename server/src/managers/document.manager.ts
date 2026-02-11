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
    version: number;
    blocks?: BlockInput[];
    state?: 'En édition' | 'Actif' | 'Archivé';
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
        return hasText || hasImages || hasNonEmptyZone;
    });
    return await prisma.document.create({
        data: {
            title: data.title,
            version: data.version,
            state: data.state ?? 'En édition',
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


/// Update a document by ID and synchronize its nested relations (blocks & images)
export const update = async (id: number, data: DocumentInput) => {

    // 1. Data Cleaning: Keep only blocks containing actual content
    // The Regex removes HTML tags (e.g., <p></p>) to ensure text isn't just empty markup
    const filteredBlocks = (data.blocks ?? []).filter((block) => {
        const hasText =
            block.text && block.text.replace(/<[^>]*>/g, '').trim().length > 0;
        const hasImages = block.images && block.images.length > 0;
        const hasNonEmptyZone = block.textZones?.some((z) =>
            z && z.replace(/<[^>]*>/g, '').trim().length > 0);
        return hasText || hasImages || hasNonEmptyZone;
    });

    return await prisma.document.update({
        where: { id },
        data: {
            title: data.title,
            version: data.version,
            state: data.state ?? 'En édition',
            blocks: {
                // 2. Sync Strategy: Wipe existing blocks to avoid duplicates
                deleteMany: {},
                // 3. Re-creation: Map and insert the newly filtered blocks and their images
                create: filteredBlocks.map((block) => ({
                    text: block.text ?? '',
                    step: block.step,
                    nbOfRepeats: block.nbOfRepeats ?? 1,
                    textZones: JSON.stringify(block.textZones ?? []), // Store as JSON for flexibility
                    images: {
                        create: block.images?.map((img) => ({
                            imagePath: img.imagePath,
                        })) ?? [],
                    },
                })),
            },
        },
        // 4. Eager Loading: Return the updated document including all nested relations
        include: {
            blocks: {
                include: { images: true },
            },
        },
    });
};