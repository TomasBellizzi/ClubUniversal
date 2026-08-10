import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { ChangeInitialPasswordSchema, LoginSchema } from '../validations/auth.validation';
import { RegisterSchema } from '../validations/user.validation';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login',
   validate(LoginSchema),
   authController.login
);

router.patch(
   '/change-initial-password',
   authenticate,
   validate(ChangeInitialPasswordSchema),
   authController.changeInitialPassword
);

router.post(
   '/register/administrativo',
   authenticate,
   authorize('ADMIN'),
   requireRegisterRole('ADMINISTRATIVO'),
   validate(RegisterSchema),
   authController.register
);

router.post(
   '/register',
   requireRegisterRole('SOCIO'),
   validate(RegisterSchema),
   authController.register
);

export const authRoutes = router

function requireRegisterRole(role: 'SOCIO' | 'ADMINISTRATIVO') {
   return (req: any, res: any, next: any) => {
      if (req.body?.role !== role) {
         return res.status(403).json({
            success: false,
            message: `Este endpoint solo permite registrar usuarios con rol ${role}`,
         });
      }
      next();
   };
}
