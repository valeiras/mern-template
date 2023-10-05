import { Router } from 'express';
import { getAppData, getAllUsers } from '../controllers/adminController.js';

const router = Router();

router.get('/app-data', getAppData);
router.get('/all-users', getAllUsers);

export default router;
