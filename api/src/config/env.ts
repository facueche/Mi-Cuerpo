export const env = {
    port: Number(process.env.PORT || 3000),
    prisma: {
        url: process.env.DATABASE_URL || '',
    },
    redis: {
        url: process.env.REDIS_URL || '',
    },
    cors: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY || '',
        blindIndexPepper: process.env.BLIND_INDEX_PEPPER || '',
    },
};
