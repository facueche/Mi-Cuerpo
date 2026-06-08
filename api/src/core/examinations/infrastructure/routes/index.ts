import { Router } from 'express';
import GetExaminationsController from '../controllers/get-examinations.controller';
import AuthMiddleware from '../../../shared/infrastructure/middlewares/auth.middleware';
import multer from 'multer';
import UploadExaminationController from '../controllers/upload-examination.controller';
import GetExaminationDetailController from '../controllers/get-examination-detail.controller';
import DeleteExaminationController from '../controllers/delete-examination.controller';
import UploadExaminationAttachmentsController from '../controllers/upload-examination-attachments.controller';

const examinationRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

examinationRouter.get('/', AuthMiddleware.handle, GetExaminationsController.handle);
examinationRouter.post('/upload', AuthMiddleware.handle, upload.single('file'), UploadExaminationController.handle);
examinationRouter.post(
    '/:id/attachments',
    AuthMiddleware.handle,
    upload.array('attachments', 10),
    UploadExaminationAttachmentsController.handle
);
examinationRouter.get('/:id', AuthMiddleware.handle, GetExaminationDetailController.handle);
examinationRouter.delete("/:id", AuthMiddleware.handle, DeleteExaminationController.handle);

export default examinationRouter;
