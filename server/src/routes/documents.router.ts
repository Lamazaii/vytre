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
 *                 type: string
 *                 example: "1.0.0"
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
 *             version: "1.0.0"
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
 *       500:
 *         description: Erreur interne du serveur
 */

import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

router.post('/', DocumentController.createDocument);

export default router;