import { Request, Response, NextFunction } from 'express';
export function handleError(err: any, req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const message = err?.message || String(err);
  const stack = err?.stack || '';
  const statusCode = Number(err?.statusCode) || 500;
  const publicMessage = err?.publicMessage || (err?.expose ? message : undefined);
  console.error(`[${timestamp}] Error:`, message);
  if (err?.details) console.error('Details:', JSON.stringify(err.details));
  if (stack) console.error(stack);

  res.status(statusCode).json({
    error: publicMessage || (statusCode >= 500 ? 'Internal server error' : message),
    ...(process.env.NODE_ENV !== 'production' ? { message } : {}),
    timestamp,
  });
}
