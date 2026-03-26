import { prisma } from '../lib/prisma';
import { createDocumentVersion } from './documentVersion.manager';

interface ImageInput {
    imagePath: string;
}

interface BlockInput {
    text?: string;
    step: number;
    nbOfRepeats?: number;
    images?: ImageInput[];
    textZones?: string[];
    canvasData?: string;
}

interface DocumentInput {
    title: string;
    version: number;
    blocks?: BlockInput[];
    state?: 'En édition' | 'Actif' | 'Archivé';
}

const documentWithBlocksInclude = {
    blocks: {
        include: {
            images: true,
        },
    },
} as const;

const stripHtml = (value: string): string =>
    value.replace(/<[^>]*>/g, '').trim();

const filterNonEmptyBlocks = (blocks: BlockInput[] = []): BlockInput[] =>
    blocks.filter((block) => {
        const hasText = block.text ? stripHtml(block.text).length > 0 : false;
        const hasImages = (block.images?.length ?? 0) > 0;
        const hasNonEmptyZone = block.textZones?.some((zone) =>
            zone ? stripHtml(zone).length > 0 : false,
        ) ?? false;
        const hasCanvasData =
            block.canvasData != null && block.canvasData.length > 0;

        return hasText || hasImages || hasNonEmptyZone || hasCanvasData;
    });

const mapBlocksForPersistence = (blocks: BlockInput[]) =>
    blocks.map((block) => ({
        text: block.text ?? '',
        step: block.step,
        nbOfRepeats: block.nbOfRepeats ?? 1,
        textZones: JSON.stringify(block.textZones ?? []),
        canvasData: block.canvasData ?? null,
        images: {
            create: block.images?.map((img) => ({
                imagePath: img.imagePath,
            })) ?? [],
        },
    }));

export const create = async (data: DocumentInput) => {
    const filteredBlocks = filterNonEmptyBlocks(data.blocks);

    const createdDocument = await prisma.document.create({
        data: {
            title: data.title,
            version: data.version,
            state: data.state ?? 'En édition',
            blocks: {
                create: mapBlocksForPersistence(filteredBlocks),
            },
        },
        include: documentWithBlocksInclude,
    });

    await createDocumentVersion(prisma, {
        id: createdDocument.id,
        version: createdDocument.version,
        title: createdDocument.title,
        state: createdDocument.state,
        blocks: (createdDocument.blocks ?? []).map((b) => ({
            text: b.text,
            step: b.step,
            nbOfRepeats: b.nbOfRepeats,
            textZones: b.textZones ?? undefined,
            canvasData: b.canvasData,
            images: b.images.map((img) => ({ imagePath: img.imagePath })),
        })),
    });

    return createdDocument;
};

export const getAll = async () => {
    return await prisma.document.findMany({
        include: documentWithBlocksInclude,
        orderBy: {
            updatedAt: 'desc',
        },
    });
};

export const getById = async (id: number) => {
    return await prisma.document.findUnique({
        where: { id },
        include: documentWithBlocksInclude,
    });
};

export const update = async (id: number, data: DocumentInput) => {
    const filteredBlocks = filterNonEmptyBlocks(data.blocks);

    const existingDocument = await prisma.document.findUnique({
        where: { id },
        select: { version: true },
    });

    if (!existingDocument) {
        return null;
    }

    const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
            title: data.title,
            version: existingDocument.version + 1,
            state: data.state ?? 'En édition',
            blocks: {
                deleteMany: {},
                create: mapBlocksForPersistence(filteredBlocks),
            },
        },
        include: documentWithBlocksInclude,
    });

    await createDocumentVersion(prisma, {
        id: updatedDocument.id,
        version: updatedDocument.version,
        title: updatedDocument.title,
        state: updatedDocument.state,
        blocks: (updatedDocument.blocks ?? []).map((b) => ({
            text: b.text,
            step: b.step,
            nbOfRepeats: b.nbOfRepeats,
            textZones: b.textZones ?? undefined,
            canvasData: b.canvasData,
            images: b.images.map((img) => ({ imagePath: img.imagePath })),
        })),
    });

    return updatedDocument;
};