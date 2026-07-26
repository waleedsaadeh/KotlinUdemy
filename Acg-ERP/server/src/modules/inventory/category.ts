import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

const categorySchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional().nullable(),
});

// GET /api/categories
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  })
);

// POST /api/categories
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  })
);

// PUT /api/categories/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  })
);

// DELETE /api/categories/:id
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
