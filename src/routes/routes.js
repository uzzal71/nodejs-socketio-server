import express from 'express';
import homeRoutes from '../controllers/homeController';

let router = express.Router();

router.use('/', homeRoutes);

export default router;