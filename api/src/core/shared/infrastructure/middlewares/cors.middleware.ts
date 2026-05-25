import cors from 'cors';
import { env } from '../../../../config/env';

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin || env.cors.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS (Mi Cuerpo Security)'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
});