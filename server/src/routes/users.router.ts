import express from 'express';
import UserController from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get users list
 *     description: Retourne la liste des utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 */
router.get('/', userController.getUser);
export default router;
