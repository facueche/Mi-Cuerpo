import { Request, Response } from 'express';
import { AuthenticateUser } from '../../application/authenticate-user.service';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import GoogleAuthService from '../../../../external-services/google/google-auth.service';

export class GoogleLoginController {
    static async handle(req: Request, res: Response) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Falta el token' });
            }

            const authenticateUser = new AuthenticateUser(
                new PrismaUserRepository(),
                new GoogleAuthService()
            );
            const result = await authenticateUser.handle(token);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ error: (error as Error).message });
        }
    }
}
