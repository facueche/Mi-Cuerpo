import { Router } from 'express';
import { GoogleLoginController } from '../controllers/google-login.controller';

const authRouter = Router();

authRouter.post('/google-login', GoogleLoginController.handle);

export default authRouter;
