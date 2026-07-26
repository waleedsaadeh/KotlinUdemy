import { Router } from 'express';
import authRoutes from './modules/auth/auth';
import categoryRoutes from './modules/inventory/category';
import warehouseRoutes from './modules/inventory/warehouse';
import productRoutes from './modules/inventory/product';
import dashboardRoutes from './modules/dashboard/dashboard';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/products', productRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
