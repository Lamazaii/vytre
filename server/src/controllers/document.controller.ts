import { Request, Response } from 'express';
import * as DocumentManager from '../managers/document.manager';
import * as DocumentVersionManager from '../managers/documentVersion.manager';
import { createDocumentSchema } from '../validators/document.validator';
import createDebug from 'debug';

const debug = createDebug('app:document.controller');

// Normalize Express path param and enforce positive integer IDs.
const parsePositiveIntParam = (rawId: string | string[]): number | null => {
    const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId;
    const id = Number(normalizedId);
    return Number.isInteger(id) && id > 0 ? id : null;
};

export const createDocument = async (req: Request, res: Response) => {
    try {
        debug('Tentative de création d\'un document...');
        debug('Body reçu:', JSON.stringify(req.body, null, 2));
        const validation = createDocumentSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: 'Données invalides',
                errors: validation.error.issues,
            });
            return;
        }

        const newDoc = await DocumentManager.create(validation.data);

        res.status(201).json(newDoc);

    } catch (error) {
        debug('Erreur controller :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getAllDocuments = async (req: Request, res: Response) => {
    try {
        debug('Récupération de tous les documents...');
        const documents = await DocumentManager.getAll();
        res.status(200).json(documents);
    } catch (error) {
        debug('Erreur lors de la récupération des documents :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const id = parsePositiveIntParam(req.params.id);

        // Fail fast on invalid IDs to avoid unnecessary manager/database calls.
        if (id === null) {
            res.status(400).json({ message: 'ID invalide' });
            return;
        }

        debug('Récupération du document ID: %d', id);

        const document = await DocumentManager.getById(id);

        if (!document) {
            res.status(404).json({ message: 'Document non trouvé' });
            return;
        }

        res.status(200).json(document);
    } catch (error) {
        debug('Erreur lors de la récupération du document :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const id = parsePositiveIntParam(req.params.id);

        // Keep route contract strict:
        // update only supports numeric document IDs.
        if (id === null) {
            res.status(400).json({ message: 'ID invalide' });
            return;
        }

        debug('Mise à jour du document ID: %d', id);
        debug('Body reçu:', JSON.stringify(req.body, null, 2));

        // Reuse creation schema so create/update stay aligned.
        const validation = createDocumentSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: 'Données invalides',
                errors: validation.error.issues,
            });
            return;
        }

        const updatedDoc =
        await DocumentManager.update(id, validation.data);

        if (!updatedDoc) {
            res.status(404).json({ message: 'Document non trouvé' });
            return;
        }

        debug('Document mis à jour avec succès :', updatedDoc.id);
        res.status(200).json(updatedDoc);

    } catch (error) {
        debug('Erreur lors de la mise à jour :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getDocumentVersions = async (req: Request, res: Response) => {
    try {
        const id = parsePositiveIntParam(req.params.id);

        if (id === null) {
            res.status(400).json({ message: 'ID invalide' });
            return;
        }

        const versions = await DocumentVersionManager.getDocumentVersions(id);
        res.status(200).json(versions);
    } catch (error) {
        debug('Erreur lors de la récupération des versions :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getDocumentVersion = async (req: Request, res: Response) => {
    try {
        const id = parsePositiveIntParam(req.params.id);
        const version = parsePositiveIntParam(req.params.version);

        if (id === null || version === null) {
            res.status(400).json({ message: 'Paramètres invalides' });
            return;
        }

        const documentVersion =
            await DocumentVersionManager.getDocumentVersion(id, version);

        if (!documentVersion) {
            res.status(404).json({ message: 'Version non trouvée' });
            return;
        }

        res.status(200).json(documentVersion);
    } catch (error) {
        debug('Erreur lors de la récupération de la version :', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};