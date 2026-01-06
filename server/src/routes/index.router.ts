import express from 'express';
import HomeController from '../controllers/home.controller';
import documentsRouter from './documents.router';

const router = express.Router();
const homeController = new HomeController();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get home page
 *     description: Retourne la page d'accueil de l'application Vytre
 *     responses:
 *       200:
 *         description: Page d'accueil récupérée avec succès
 */
router.get('/', homeController.renderHome);
router.use('/documents', documentsRouter);

export default router;
