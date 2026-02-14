import express from 'express';
import { authenticate, IsAdmin } from '../middlewares/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', authenticate, IsAdmin, getSettings);
router.put('/', authenticate, IsAdmin, updateSettings);

export default router;
