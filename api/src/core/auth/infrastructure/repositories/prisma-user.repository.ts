import { prisma } from '../../../../config/prisma';
import { User } from '../../../../generated/prisma/client';
import UserNotFoundError from '../../domain/errors/user-not-found.error';
import UserRepository from '../../domain/repositories/user.repository';


export class PrismaUserRepository implements UserRepository {
    async findByGoogleId(googleId: string): Promise<User> {
        const user = await prisma.user.findUnique({ where: { googleId } });
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }

    async upsert(data: Partial<User>): Promise<User> {
        return prisma.user.upsert({
            where: { googleId: data.googleId },
            update: { lastLogin: new Date(), avatarUrl: data.avatarUrl },
            create: {
                googleId: data.googleId as string,
                email: data.email as string,
                firstName: data.firstName as string,
                lastName: data.lastName as string,
                avatarUrl: data.avatarUrl as string,
            },
        });
    }
}