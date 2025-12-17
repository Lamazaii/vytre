import express from 'express';
import HomeController from '../controllers/home.controller';
import documentsRouter from './documents.router';

const router = express.Router();
const homeController = new HomeController();

/* GET home page. */
router.get('/', homeController.renderHome);
router.use('/documents', documentsRouter);

export default router;
