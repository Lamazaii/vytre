import { z } from 'zod';

const imageSchema = z.object({
  imagePath: z.string().min(1, "Le chemin de l'image est obligatoire"),
});

const blockSchema = z.object({
  text: z.string().optional().default(''),
  step: z.number().int().min(1, "Le numéro d'étape doit être au moins 1"),
  nbOfRepeats: z.number().int().min(1, "Le nombre de répétitions doit être au moins 1").optional().default(1),
  images: z.array(imageSchema).optional().default([]),
  textZones: z.array(z.string()).optional().default([]),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Le titre ne peut pas être vide"),
  version: z.string().min(1, "La version est requise"),
  blocks: z.array(blockSchema).optional(),
});

