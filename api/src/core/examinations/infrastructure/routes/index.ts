import { Router } from 'express';
import GetExaminationsController from '../controllers/get-examinations.controller';
import AuthMiddleware from '../../../shared/infrastructure/middlewares/auth.middleware';
import multer from 'multer';
import UploadExaminationController from '../controllers/upload-examination.controller';

const examinationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

examinationRouter.get('/', AuthMiddleware.handle, GetExaminationsController.handle);
examinationRouter.post('/upload', AuthMiddleware.handle, upload.single('file'), UploadExaminationController.handle);

export default examinationRouter;
