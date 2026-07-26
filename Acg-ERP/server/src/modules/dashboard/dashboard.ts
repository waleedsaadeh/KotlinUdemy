import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/stats
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [productCount, categoryCount, warehouseCount, products] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.warehouse.count(),
      prisma.product.findMany({
        include: { stock: true },
      }),
    ]);

    let totalUnits = 0;
    let inventoryValue = 0;
    const lowStock: { id: string; sku: string; nameEn: string; nameAr: string; totalStock: number; reorderLevel: number }[] = [];

    for (const p of products) {
      const totalStock = p.stock.reduce((sum, s) => sum + s.quantity, 0);
      totalUnits += totalStock;
      inventoryValue += totalStock * Number(p.costPrice);
      if (p.reorderLevel > 0 && totalStock <= p.reorderLevel) {
        lowStock.push({
          id: p.id,
          sku: p.sku,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
          totalStock,
          reorderLevel: p.reorderLevel,
        });
      }
    }

    res.json({
      productCount,
      categoryCount,
      warehouseCount,
      totalUnits,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      lowStock,
    });
  })
);

export default router;
