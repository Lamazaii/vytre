import { Request, Response } from 'express';
import * as DocumentManager from '../managers/document.manager';
import { createDocumentSchema } from '../validators/document.validator';

export const createDocument = async (req: Request, res: Response) => {
  try {
    const validation = createDocumentSchema.safeParse(req.body);

    if (!validation.success) {
       res.status(400).json({
         message: "Données invalides",
         errors: validation.error.issues,
       });
       return;
    }

    const newDoc = await DocumentManager.create(validation.data);

    res.status(201).json(newDoc);

  } catch (error) {
    console.error("Erreur controller :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};