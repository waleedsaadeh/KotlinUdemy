import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Resource not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  // Prisma unique constraint
  if (typeof err === 'object' && err !== null && (err as any).code === 'P2002') {
    return res.status(409).json({ message: 'A record with these values already exists' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}
