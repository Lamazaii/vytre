import { z } from 'zod';

const imageSchema = z.object({
  imagePath: z.string().min(1, "Le chemin de l'image est obligatoire"),
});

const blockSchema = z.object({
  id: z.number().optional(),
  text: z.string().optional().default(''),
  step: z.number().optional(),
  nbOfRepeats: z.number().optional().default(1),
  images: z.array(imageSchema).optional().default([]),
});

export const documentSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Le titre ne peut pas être vide"),
  version: z.string().min(1, "La version est requise"),
  blocks: z.array(blockSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type DocumentValidation = z.infer<typeof documentSchema>;
