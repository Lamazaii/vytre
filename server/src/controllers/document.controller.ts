import { Request, Response } from 'express';
import * as DocumentManager from '../managers/document.manager';
import { createDocumentSchema } from '../validators/document.validator';

export const createDocument = async (req: Request, res: Response) => {
  try {
    console.log("Tentative de création d'un document...");
    console.log("Body reçu:", JSON.stringify(req.body, null, 2));

    // 1. On valide les données reçues du Front (req.body)
    const validation = createDocumentSchema.safeParse(req.body);

    // Si les données sont invalides (ex: titre manquant)
    if (!validation.success) {
       res.status(400).json({
         message: "Données invalides",
         errors: validation.error.issues,
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
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    console.log("Récupération de tous les documents...");
    const documents = await DocumentManager.getAll();
    res.status(200).json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Récupération du document ID: ${id}`);

    const document = await DocumentManager.getById(parseInt(id));

    if (!document) {
      res.status(404).json({ message: "Document non trouvé" });
      return;
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Erreur lors de la récupération du document :", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Mise à jour du document ID: ${id}`);
    console.log("Body reçu:", JSON.stringify(req.body, null, 2));

    const validation = createDocumentSchema.safeParse(req.body);

    if (!validation.success) {
       res.status(400).json({
         message: "Données invalides",
         errors: validation.error.issues,
       });
       return;
    }

    const updatedDoc = await DocumentManager.update(parseInt(id), validation.data);

    console.log("Document mis à jour avec succès :", updatedDoc.id);
    res.status(200).json(updatedDoc);

  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};