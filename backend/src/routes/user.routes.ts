import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {  UpdateUserSchema } from '../validations/user.validation';
import { upload } from '../middlewares/comprobantes.middleware';

const router = Router();

router.get(
   '/',
   authenticate,
   authorize('ADMIN'),        
   userController.getAllUsers
);

router.get(
  '/administrativos',
  authenticate,
  authorize('ADMIN'),  
  userController.getAdministrativos
);

router.get(
  "/socios",
  authenticate,
  authorize('ADMIN', 'ADMINISTRATIVO'), 
  userController.getSocios
);


router.get(
   '/:id',
   authenticate,
   userController.getUserById
);

router.put('/:id',
   authenticate,
   upload.single("foto"),
   normalizeMultipartFields,
   validate(UpdateUserSchema),
   userController.updateUser
);

router.delete('/:id',
   authenticate,
   authorize('ADMIN'),
   userController.deleteUser
);
export const userRoutes = router;

function normalizeMultipartFields(req: any, res: any, next: any) {
  for (const [key, value] of Object.entries(req.body || {})) {
    const match = key.match(/^(\w+)\[(\w+)\]$/);
    if (!match) continue;

    const [, group, field] = match;
    req.body[group] = {
      ...(req.body[group] && typeof req.body[group] === 'object' ? req.body[group] : {}),
      [field]: value,
    };
    delete req.body[key];
  }

  next();
}
