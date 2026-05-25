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
    }
};
