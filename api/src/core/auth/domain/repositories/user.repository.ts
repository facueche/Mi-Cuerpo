import { User } from "../../../../generated/prisma/client";

export default interface UserRepository {
    findByGoogleId(googleId: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    upsert(userData: Partial<User>): Promise<User>;
}