import { Request, Response } from 'express';
import * as DocumentManager from '../managers/document.manager';
import { createDocumentSchema } from '../validators/document.validator';

export const createDocument = async (req: Request, res: Response) => {
  try {
    console.log("Tentative de création d'un document...");

    // 1. On valide les données reçues du Front (req.body)
    const validation = createDocumentSchema.safeParse(req.body);

    // Si les données sont invalides (ex: titre manquant)
    if (!validation.success) {
       res.status(400).json({ 
         message: "Données invalides",
         errors: validation.error.format() 
       });
       return;
    }

    // 2. Si tout est bon, on appelle le Manager pour écrire en DB
    const newDoc = await DocumentManager.create(validation.data);

    // 3. On répond au client que tout s'est bien passé (201 = Created)
    console.log("Document créé avec succès :", newDoc.id);
    res.status(201).json(newDoc);

  } catch (error) {
    // Si le serveur plante (ex: base de données éteinte)
    console.error("Erreur controller :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};