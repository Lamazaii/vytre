import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

router.post('/', DocumentController.createDocument);

export default router;