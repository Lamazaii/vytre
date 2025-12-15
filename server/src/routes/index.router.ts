import express from 'express';
import HomeController from '../controllers/home.controller';

const router = express.Router();
const homeController = new HomeController();

/* GET home page. */
router.get('/', homeController.renderHome);

export default router;
