import { Request, Response, NextFunction } from 'express';
export function handleError(err: any, req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const message = err?.message || String(err);
  const stack = err?.stack || '';
  const statusCode = Number(err?.statusCode) || 500;
  console.error(`[${timestamp}] Error:`, message);
  if (stack) console.error(stack);

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : message,
    ...(process.env.NODE_ENV !== 'production' ? { message } : {}),
    timestamp,
  });
}
