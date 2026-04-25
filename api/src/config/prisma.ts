import { env } from './env';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: env.prisma.url })
export const prisma = new PrismaClient({ adapter });
