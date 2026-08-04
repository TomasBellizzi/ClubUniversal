import { Request,  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/user';

declare global {
    namespace Express {
        interface Request {
            user?:{
                id: number;
                email: string;
                role: 'SOCIO' | 'ADMIN'| 'ADMINISTRATIVO';
                socioId?: number | null;
            }
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token no proporcionado' });
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ success: false, message: 'JWT_SECRET no configurado' });
        }
        const decoded = jwt.verify(token, secret) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            socioId: decoded.socioId ?? null,
        };
        next();
    }catch (error: any) {
        console.error('Error en autenticación:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expirado' });
        } 
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

export function authorize(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        if (!roles.includes(req.user.role as Role)) {
            return res.status(403).json({ success: false, message: 'No tiene permisos para esta accion' });
        }
        next();
    };
}
