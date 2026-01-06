import express from 'express';
import HomeController from '../controllers/home.controller';

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

export default router;
