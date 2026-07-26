import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

const productSchema = z.object({
  sku: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).default('pcs'),
  costPrice: z.coerce.number().nonnegative().default(0),
  salePrice: z.coerce.number().nonnegative().default(0),
  reorderLevel: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

/** Adds a computed `totalStock` field summed across all warehouses. */
function withTotalStock<T extends { stock: { quantity: number }[] }>(product: T) {
  const totalStock = product.stock.reduce((sum, s) => sum + s.quantity, 0);
  const { stock, ...rest } = product;
  return { ...rest, stock, totalStock };
}

// GET /api/products?search=&categoryId=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, categoryId } = req.query as { search?: string; categoryId?: string };
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search, mode: 'insensitive' } },
                { nameAr: { contains: search } },
                { sku: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        stock: { include: { warehouse: true } },
      },
    });
    res.json(products.map(withTotalStock));
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, stock: { include: { warehouse: true } } },
    });
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(withTotalStock(product));
  })
);

// POST /api/products
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  })
);

// PUT /api/products/:id
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json(product);
  })
);

// DELETE /api/products/:id
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// PATCH /api/products/:id/stock  { warehouseId, quantity }
// Sets the absolute quantity for a product in a given warehouse.
const stockSchema = z.object({
  warehouseId: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative(),
});
router.patch(
  '/:id/stock',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { warehouseId, quantity } = stockSchema.parse(req.body);
    const stock = await prisma.stock.upsert({
      where: { productId_warehouseId: { productId: req.params.id, warehouseId } },
      update: { quantity },
      create: { productId: req.params.id, warehouseId, quantity },
    });
    res.json(stock);
  })
);

export default router;
