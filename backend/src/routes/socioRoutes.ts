import { Router } from 'express';
import { getAllSocios, getSocioByDni, getSocioCompletoByDni, updateSocio, updateSocioEstado } from '../controllers/socioController';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middlewares/auth.middleware';

//para la carga de fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { dni } = req.body;
    const ext = path.extname(file.originalname);
    cb(null, `socio-${dni}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

const router = Router();


router.use(authenticate);

router.get('/dni/:dni', authorize('ADMIN', 'ADMINISTRATIVO'), getSocioByDni);
router.get('/dni/:dni/full', authorize('ADMIN', 'ADMINISTRATIVO'), getSocioCompletoByDni);
router.get('/', authorize('ADMIN', 'ADMINISTRATIVO'), getAllSocios);
router.put('/', authorize('ADMIN', 'ADMINISTRATIVO'), upload.single('foto'), updateSocio);
router.put('/:id/estado', authorize('ADMIN', 'ADMINISTRATIVO'), updateSocioEstado);

export default router;

