/**
 * @openapi
 * components:
 *   schemas:
 *     ImageFormat:
 *       type: object
 *       properties:
 *         imagePath:
 *           type: string
 *           description: Base64 de l'image
 *           example: data:image/png;base64,iVBORw0KGgoAA...
 *     BlockFormat:
 *       type: object
 *       required:
 *         - step
 *       properties:
 *         text:
 *           type: string
 *           example: ceci est un bloc de texte
 *         step:
 *           type: integer
 *           example: 1
 *         nbOfRepeats:
 *           type: number
 *           format: float
 *           minimum: 0.001
 *           maximum: 9999
 *           example: 1
 *         textZones:
 *           type: array
 *           description: Zones de texte enrichi du bloc
 *           items:
 *             type: string
 *           example: ["Titre zone 1", "Description zone 2"]
 *         canvasData:
 *           type: string
 *           nullable: true
 *           description: Données de la zone de dessin (JSON ou base64)
 *           example: '{"objects":[{"type":"path"}]}'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ImageFormat'
 *     DocumentFormat:
 *       type: object
 *       required:
 *         - title
 *         - version
 *       properties:
 *         title:
 *           type: string
 *           example: Mon Premier Document
 *         version:
 *           type: integer
 *           example: 1
 *         state:
 *           type: string
 *           enum: [En édition, Actif, Archivé]
 *           example: En édition
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlockFormat'
 *     ImageResponseFormat:
 *       allOf:
 *         - $ref: '#/components/schemas/ImageFormat'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *             blockId:
 *               type: integer
 *     BlockResponseFormat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *         step:
 *           type: integer
 *         nbOfRepeats:
 *           type: number
 *           format: float
 *         textZones:
 *           type: string
 *           nullable: true
 *           description: Zones texte serialisees (JSON string)
 *         canvasData:
 *           type: string
 *           nullable: true
 *         documentId:
 *           type: integer
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ImageResponseFormat'
 *     DocumentResponseFormat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         version:
 *           type: integer
 *         state:
 *           type: string
 *           enum: [En édition, Actif, Archivé]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlockResponseFormat'
 *     DocumentVersionItemFormat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         documentId:
 *           type: integer
 *         version:
 *           type: integer
 *         title:
 *           type: string
 *         state:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     SnapshotBlockFormat:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *         step:
 *           type: integer
 *         nbOfRepeats:
 *           type: number
 *           format: float
 *         textZones:
 *           type: array
 *           items:
 *             type: string
 *         canvasData:
 *           type: string
 *           nullable: true
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ImageFormat'
 *     DocumentVersionResponseFormat:
 *       allOf:
 *         - $ref: '#/components/schemas/DocumentVersionItemFormat'
 *         - type: object
 *           properties:
 *             snapshot:
 *               type: object
 *               nullable: true
 *               properties:
 *                 title:
 *                   type: string
 *                 state:
 *                   type: string
 *                 blocks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SnapshotBlockFormat'
 *     ErrorResponseFormat:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: string
 *     ValidationErrorResponseFormat:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 * /documents:
 *   post:
 *     summary: Créer un nouveau document avec ses blocs
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentFormat'
 *           example:
 *             title: "Document test"
 *             version: 1
 *             state: "En édition"
 *             blocks:
 *               - text: "ceci est un test"
 *                 step: 1
 *                 nbOfRepeats: 1
 *                 textZones: ["zone titre", "zone detail"]
 *                 canvasData: "{\"objects\":[]}"
 *                 images: []
 *               - text: "ceci est un test aussi"
 *                 step: 2
 *                 nbOfRepeats: 3
 *                 textZones: []
 *                 canvasData: null
 *                 images: []
 *     responses:
 *       201:
 *         description: Document créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponseFormat'
 *             example:
 *               id: 1
 *               title: "Document test"
 *               version: 1
 *               state: "En édition"
 *               blocks: []
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponseFormat'
 *             example:
 *               message: "Données invalides"
 *               errors: []
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 *   get:
 *     summary: Récupérer tous les documents avec leurs blocs
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentResponseFormat'
 *             example:
 *               - id: 1
 *                 title: "Document test"
 *                 version: 1
 *                 state: "En édition"
 *                 blocks: []
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 * 
 * /documents/{id}:
 *   get:
 *     summary: Récupérer un document par son ID avec ses blocs
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à récupérer
 *     responses:
 *       200:
 *         description: Document récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponseFormat'
 *             example:
 *               id: 1
 *               title: "Document test"
 *               version: 1
 *               state: "En édition"
 *               blocks:
 *                 - id: 11
 *                   text: "Bloc"
 *                   step: 1
 *                   nbOfRepeats: 1
 *                   textZones: "[]"
 *                   canvasData: null
 *                   images: []
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "ID invalide"
 *       404:
 *         description: Document non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Document non trouvé"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 *   put:
 *     summary: Mettre à jour un document existant
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentFormat'
 *           example:
 *             title: "Document mis à jour"
 *             version: 2
 *             state: "Actif"
 *             blocks:
 *               - text: "ceci est un test mis à jour"
 *                 step: 1
 *                 nbOfRepeats: 2
 *                 textZones: ["zone principale"]
 *                 canvasData: "{\"objects\":[{\"type\":\"rect\"}]}"
 *                 images: []
 *     responses:
 *       200:
 *         description: Document mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponseFormat'
 *             example:
 *               id: 1
 *               title: "Document mis à jour"
 *               version: 2
 *               state: "Actif"
 *               blocks: []
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponseFormat'
 *             example:
 *               message: "Données invalides"
 *               errors: []
 *       404:
 *         description: Document non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Document non trouvé"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 *
 * /documents/{id}/versions:
 *   get:
 *     summary: Récupérer les versions d'un document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document
 *     responses:
 *       200:
 *         description: Historique des versions récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentVersionItemFormat'
 *             example:
 *               - id: 7
 *                 documentId: 1
 *                 version: 2
 *                 title: "Document mis à jour"
 *                 state: "Actif"
 *                 createdAt: "2026-03-23T10:00:00.000Z"
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "ID invalide"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 *
 * /documents/{id}/versions/{version}:
 *   get:
 *     summary: Récupérer un snapshot de version d'un document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro de version
 *     responses:
 *       200:
 *         description: Snapshot de version récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentVersionResponseFormat'
 *             example:
 *               id: 7
 *               documentId: 1
 *               version: 2
 *               title: "Document mis à jour"
 *               state: "Actif"
 *               createdAt: "2026-03-23T10:00:00.000Z"
 *               snapshot:
 *                 title: "Document mis à jour"
 *                 state: "Actif"
 *                 blocks: []
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Paramètres invalides"
 *       404:
 *         description: Version non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Version non trouvée"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseFormat'
 *             example:
 *               message: "Erreur interne du serveur"
 *               error: "message d'erreur"
 */

import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

router.post('/', DocumentController.createDocument);
router.get('/', DocumentController.getAllDocuments);
router.get('/:id/versions', DocumentController.getDocumentVersions);
router.get('/:id/versions/:version', DocumentController.getDocumentVersion);
router.patch('/:id/versions/:versionId/state', DocumentController.updateDocumentVersionState);
router.get('/:id', DocumentController.getDocumentById);
router.put('/:id', DocumentController.updateDocument);

export default router;