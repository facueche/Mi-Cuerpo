import { prisma } from '../../../../config/prisma';
import { User } from '../../../../generated/prisma/client';
import { EncryptionService } from '../../../shared/application/encryption.service';
import UserNotFoundError from '../../domain/errors/user-not-found.error';
import UserRepository from '../../domain/repositories/user.repository';

export class PrismaUserRepository implements UserRepository {

    /**
     * Desencripta transparentemente los datos del usuario antes de enviarlos a las capas superiores de DDD
     */
    private decryptUser(user: User): User {
        return {
            ...user,
            email: EncryptionService.decrypt(user.email) as string,
            firstName: EncryptionService.decrypt(user.firstName) as string,
            lastName: EncryptionService.decrypt(user.lastName) as string,
        };
    }

    async findByGoogleId(googleId: string): Promise<User> {
        // Buscamos utilizando el Blind Index determinista del GoogleId para máxima velocidad
        const blindGoogleId = EncryptionService.generateBlindIndex(googleId) as string;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleId }, // Por compatibilidad si hay datos no encriptados
                    { googleId: blindGoogleId }
                ]
            }
        });

        if (!user) {
            throw new UserNotFoundError();
        }
        return this.decryptUser(user);
    }

    async findByEmail(email: string): Promise<User> {
        // Buscamos utilizando el Blind Index determinista del email para máxima seguridad
        const blindEmail = EncryptionService.generateBlindIndex(email) as string;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { email: blindEmail }
                ]
            }
        });

        if (!user) {
            throw new UserNotFoundError();
        }
        return this.decryptUser(user);
    }

    async upsert(data: Partial<User>): Promise<User> {
        // Generamos Blind Indexes para lookups y encriptamos probabilísticamente el resto
        const blindGoogleId = EncryptionService.generateBlindIndex(data.googleId);
        const encryptedEmail = EncryptionService.encrypt(data.email);
        const encryptedFirstName = EncryptionService.encrypt(data.firstName);
        const encryptedLastName = EncryptionService.encrypt(data.lastName);

        const updatedUser = await prisma.user.upsert({
            where: { googleId: blindGoogleId || data.googleId }, // Intenta buscar por blind index
            update: {
                lastLogin: new Date(),
                avatarUrl: data.avatarUrl
            },
            create: {
                googleId: blindGoogleId as string,
                email: encryptedEmail as string,
                firstName: encryptedFirstName as string,
                lastName: encryptedLastName as string,
                avatarUrl: data.avatarUrl as string,
            },
        });

        return this.decryptUser(updatedUser);
    }
}
