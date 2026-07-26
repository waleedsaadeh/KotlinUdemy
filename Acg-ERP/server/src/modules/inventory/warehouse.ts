import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

const warehouseSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  location: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/warehouses
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { stock: true } } },
    });
    res.json(warehouses);
  })
);

// POST /api/warehouses
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = warehouseSchema.parse(req.body);
    const warehouse = await prisma.warehouse.create({ data });
    res.status(201).json(warehouse);
  })
);

// PUT /api/warehouses/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = warehouseSchema.parse(req.body);
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data,
    });
    res.json(warehouse);
  })
);

// DELETE /api/warehouses/:id
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    await prisma.warehouse.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
