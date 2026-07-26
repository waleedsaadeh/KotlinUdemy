import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../utils/jwt';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { authenticate } from '../../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user });
  })
);

export default router;
