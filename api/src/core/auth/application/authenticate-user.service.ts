// src/application/use-cases/AuthenticateUser.ts
import jwt from 'jsonwebtoken';
import UserRepository from '../domain/repositories/user.repository';
import GoogleAuthService from '../../../external-services/google/google-auth.service';

export class AuthenticateUser {
    constructor(
        private userRepository: UserRepository,
        private googleAuth: GoogleAuthService
    ) { }

    async handle(idToken: string) {
        const payload = await this.googleAuth.verify(idToken);

        const user = await this.userRepository.upsert({
            googleId: payload.sub,
            email: payload.email!,
            firstName: payload.given_name,
            lastName: payload.family_name,
            avatarUrl: payload.picture,
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        return { user, token };
    }
}
