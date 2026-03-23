import 'dotenv/config';
import { inspect } from 'node:util';
import { prisma } from '../lib/prisma';

const parseTextZones = (value: string | null): string[] => {
    if (!value) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(value);

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

async function main() {
    try {
        await prisma.$connect();

        const documents = await prisma.document.findMany({
            include: {
                blocks: {
                    include: {
                        images: true,
                    },
                },
                versions: {
                    select: {
                        id: true,
                        version: true,
                        state: true,
                        createdAt: true,
                    },
                    orderBy: {
                        version: 'desc',
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const normalizedDocuments = documents.map((document) => ({
            id: document.id,
            title: document.title,
            version: document.version,
            state: document.state,
            blocksCount: document.blocks.length,
            versionsCount: document.versions.length,
            blocks: document.blocks.map((block) => ({
                id: block.id,
                step: block.step,
                text: block.text,
                nbOfRepeats: block.nbOfRepeats,
                textZones: parseTextZones(block.textZones),
                canvasData: block.canvasData,
                images: block.images.map((image) => ({
                    id: image.id,
                    imagePath: image.imagePath,
                })),
            })),
            versions: document.versions,
        }));

        process.stdout.write('\nDatabase connection successful.\n');
        process.stdout.write(
            `Documents found: ${normalizedDocuments.length}\n`,
        );

        if (normalizedDocuments.length === 0) {
            process.stdout.write('No documents in database yet.\n');
            return;
        }

        process.stdout.write(
            `${inspect(normalizedDocuments, { depth: null })}\n`,
        );
    } catch (error: unknown) {
        process.stderr.write('Database test script failed:\n');
        process.stderr.write(`${inspect(error, { depth: null })}\n`);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

void main();
