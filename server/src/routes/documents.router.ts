/**
 * @openapi
 * /documents:
 *   post:
 *     summary: Créer un nouveau document avec ses blocs
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - version
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Mon Premier Document"
 *               version:
 *                 type: integer
 *                 example: 1
 *               state:
 *                 type: string
 *                 enum: [En édition, Actif, Archivé]
 *                 example: "En édition"
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - step
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: "ceci est un bloc de texte"
 *                     step:
 *                       type: integer
 *                       example: 1
 *                     nbOfRepeats:
 *                       type: integer
 *                       example: 1
 *                     textZones:
 *                       type: array
 *                       description: Zones de texte enrichi du bloc
 *                       items:
 *                         type: string
 *                       example: ["Titre zone 1", "Description zone 2"]
 *                     canvasData:
 *                       type: string
 *                       nullable: true
 *                       description: >
 *                         Données de la zone de dessin (JSON ou base64)
 *                       example: "{\"objects\":[{\"type\":\"path\"}]}"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imagePath:
 *                             type: string
 *                             description: "Base64 de l'image"
 *                             example: "data:image/png;base64,iVBORw0KGgoAA..."
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
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur interne du serveur
 *   get:
 *     summary: Récupérer tous les documents avec leurs blocs
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents récupérée avec succès
 *       500:
 *         description: Erreur interne du serveur
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
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur interne du serveur
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
 *             type: object
 *             required:
 *               - title
 *               - version
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Document Mis à Jour"
 *               version:
 *                 type: integer
 *                 example: 2
 *               state:
 *                 type: string
 *                 enum: [En édition, Actif, Archivé]
 *                 example: "Actif"
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - step
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: "ceci est un bloc de texte mis à jour"
 *                     step:
 *                       type: integer
 *                       example: 1
 *                     nbOfRepeats:
 *                       type: integer
 *                       example: 2
 *                     textZones:
 *                       type: array
 *                       description: Zones de texte enrichi du bloc
 *                       items:
 *                         type: string
 *                       example: ["zone titre", "zone description"]
 *                     canvasData:
 *                       type: string
 *                       nullable: true
 *                       description: >
 *                         Données de la zone de dessin
 *                       example: "{\"objects\":[{\"type\":\"path\"}]}"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imagePath:
 *                             type: string
 *                             description: "Base64 de l'image"
 *                             example: "data:image/png;base64,iVBORw0KGgANS..."
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
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur interne du serveur
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
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
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
 *       400:
 *         description: Paramètres invalides
 *       404:
 *         description: Version non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */

import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

router.post('/', DocumentController.createDocument);
router.get('/', DocumentController.getAllDocuments);
router.get('/:id/versions', DocumentController.getDocumentVersions);
router.get('/:id/versions/:version', DocumentController.getDocumentVersion);
router.get('/:id', DocumentController.getDocumentById);
router.put('/:id', DocumentController.updateDocument);

export default router;