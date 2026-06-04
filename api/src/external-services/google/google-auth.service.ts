// src/infrastructure/external-api/GoogleAuthService.ts
import { google } from 'googleapis';
import { env } from '../../config/env';

export default class GoogleAuthService {
    private oauth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            env.google.clientId,
            env.google.clientSecret,
            'postmessage' // Requerido para el handshake con Vite/React flow: 'auth-code'
        );
    }

    async verify(authCode: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(authCode);
            this.oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: this.oauth2Client,
                version: 'v2'
            });

            const userInfo = await oauth2.userinfo.get();
            const payload = userInfo.data;

            if (!payload || !payload.id) {
                throw new Error('No se pudo recuperar la información del usuario desde Google');
            }

            return {
                sub: payload.id,
                email: payload.email,
                given_name: payload.given_name,
                family_name: payload.family_name,
                picture: payload.picture
            };

        } catch (error: any) {
            console.error('Error en el handshake de Google Auth:', error);
            throw new Error(`Fallo en autenticación de Google: ${error.message}`);
        }
    }
}
