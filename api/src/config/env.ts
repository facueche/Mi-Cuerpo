export const env = {
    port: Number(process.env.PORT || 3000),
    prisma: {
        url: process.env.DATABASE_URL || '',
    },
};
