import { z } from 'zod';

const imageSchema = z.object({
    imagePath: z.string().min(1, 'Le chemin de l\'image est obligatoire'),
});

const blockSchema = z.object({
    text: z.string().optional().default(''),
    step: z.number().int().min(1, 'Le numéro d\'étape doit être au moins 1'),
    nbOfRepeats: z.union([z.string(), z.number()])
        .transform((val) => {
            const str = String(val).replace(',', '.');
            const num = Number.parseFloat(str);
            if (Number.isNaN(num)) return 1;
            return Math.round(num * 1000) / 1000;
        })
        .pipe(z.number()
            .min(0.001, 'Le nombre de répétitions doit être au moins 0.001')
            .max(9999, 'Le nombre de répétitions ne peut pas dépasser 9999'))
        .optional()
        .default(1),
    images: z.array(imageSchema).optional().default([]),
    textZones: z.array(z.string()).optional().default([]),
    canvasData: z.string().optional(),
});

export const createDocumentSchema = z.object({
    title: z.string().min(1, 'Le titre ne peut pas être vide'),
    version: z.number().min(1, 'La version est requise'),
    blocks: z.array(blockSchema).optional(),
    state: z.enum(['En édition', 'Actif', 'Archivé']).default('En édition'),
});

