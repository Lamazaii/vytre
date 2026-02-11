/**
 * @openapi
 * /documents:
 *   post:
 *     summary: Créer un nouveau document avec ses blocs et images
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
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imagePath:
 *                             type: string
 *                             description: "Base64 de l'image"
 *                             example: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *           example:
 *             title: "Document test"
 *             version: 1
 *             blocks:
 *               - text: "ceci est un test"
 *                 step: 1
 *                 nbOfRepeats: 1
 *                 images: []
 *               - text: "ceci est un test aussi"
 *                 step: 2
 *                 nbOfRepeats: 3
 *                 images: []
 *     responses:
 *       201:
 *         description: Document créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur interne du serveur
 *   get:
 *     summary: Récupérer tous les documents avec leurs blocs et images
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents récupérée avec succès
 *       500:
 *         description: Erreur interne du serveur
 * 
 * /documents/{id}:
 *   get:
 *     summary: Récupérer un document par son ID avec ses blocs et images
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
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imagePath:
 *                             type: string
 *                             description: "Base64 de l'image"
 *                             example: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *           example:
 *             title: "Document mis à jour"
 *             version: 2
 *             blocks:
 *               - text: "ceci est un test mis à jour"
 *                 step: 1
 *                 nbOfRepeats: 2
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
 */

import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

router.post('/', DocumentController.createDocument);
router.get('/', DocumentController.getAllDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.put('/:id', DocumentController.updateDocument);

export default router;