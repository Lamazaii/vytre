import { prisma } from '../lib/prisma';

interface ImageInput {
    imagePath: string;
}

interface BlockInput {
    text?: string;
    step: number;
    nbOfRepeats: number;
    images?: ImageInput[];
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
                create: data.blocks?.map((block, index) => ({
                    text: block.text ?? '',
                    step: index + 1,
                    nbOfRepeats: block.nbOfRepeats ?? 1,
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