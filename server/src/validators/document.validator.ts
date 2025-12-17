// Ce docuement définit la structure attendue pour la création d'un Document (valide la data reçu du frontend avant de l'envoyer à la BDD)

import { z } from 'zod';

// on définit à quoi ressemble un bloc valide
const blockSchema = z.object({
  text: z.string().min(1, "Le texte est obligatoire"),
  step: z.number().int().positive("L'étape doit être un entier positif"),
  nbOfRepeats: z.number().int().min(1, "Le nombre de répétitions doit être au moins 1"),
});

// on définit le Document entier
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Le titre ne peut pas être vide"),
  version: z.string().min(1, "La version est requise"), 
  
  // On dit que blocks est un tableau (array) contenant des objets qui respectent le blockSchema
  // .optional() signifie qu'on a le droit de créer un document vide sans blocs pour commencer
  blocks: z.array(blockSchema).optional(),
});

