import { z } from 'zod';
import { prisma } from '../lib/prisma';

const snapshotSchema = z.object({
    title: z.string(),
    state: z.string(),
    blocks: z.array(z.object({
        text: z.string(),
        step: z.number(),
        nbOfRepeats: z.number(),
        textZones: z.array(z.string()),
        canvasData: z.string().nullable(),
        images: z.array(z.object({
            imagePath: z.string(),
        })),
    })),
});

const parseTextZones = (textZones: string | null): string[] => {
    if (!textZones) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(textZones);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (item): item is string => typeof item === 'string',
        );
    } catch {
        return [];
    }
};

export const buildSnapshot = (doc: {
    title: string,
    state: string,
    blocks: {
        text: string,
        step: number,
        nbOfRepeats: number,
        textZones?: string,
        canvasData?: string | null,
        images: { imagePath: string, }[],
    }[],
}): string =>
    JSON.stringify({
        title: doc.title,
        state: doc.state,
        blocks: doc.blocks.map((block) => ({
            text: block.text,
            step: block.step,
            nbOfRepeats: block.nbOfRepeats,
            textZones: parseTextZones(block.textZones ?? null),
            canvasData: block.canvasData,
            images: block.images.map((img) => ({ imagePath: img.imagePath })),
        })),
    });

export const createDocumentVersion = async (
    db: typeof prisma,
    document: {
        id: number,
        version: number,
        title: string,
        state: string,
        blocks: {
            text: string,
            step: number,
            nbOfRepeats: number,
            textZones?: string,
            canvasData?: string | null,
            images: { imagePath: string, }[],
        }[],
    },
) => {
    if (!db.documentVersion) {
        return null;
    }

    return await db.documentVersion.create({
        data: {
            documentId: document.id,
            version: document.version,
            title: document.title,
            state: document.state,
            snapshot: buildSnapshot(document),
        },
    });
};

export const getDocumentVersions = async (documentId: number) => {
    return await prisma.documentVersion.findMany({
        where: { documentId },
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
};

export const getDocumentVersion = async (
    documentId: number,
    version: number,
) => {
    const documentVersion = await prisma.documentVersion.findUnique({
        where: {
            documentId_version: {
                documentId,
                version,
            },
        },
    });

    if (!documentVersion) {
        return null;
    }

    const rawSnapshot: unknown = JSON.parse(documentVersion.snapshot);
    const parsedSnapshot = snapshotSchema.safeParse(rawSnapshot);

    return {
        id: documentVersion.id,
        documentId: documentVersion.documentId,
        version: documentVersion.version,
        title: documentVersion.title,
        state: documentVersion.state,
        createdAt: documentVersion.createdAt,
        snapshot: parsedSnapshot.success ? parsedSnapshot.data : null,
    };
};

export const updateVersionState = async (
    versionId: number,
    newState: string,
) => {
    const updatedVersion = await prisma.documentVersion.update({
        where: { id: versionId },
        data: { state: newState },
        select: {
            id: true,
            documentId: true,
            version: true,
            title: true,
            state: true,
            createdAt: true,
        },
    });

    return updatedVersion;
};