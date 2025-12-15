import express from 'express';
import UserController from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

/* GET users listing. */
router.get('/', userController.getUser);
export default router;
