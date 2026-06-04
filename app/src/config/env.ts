export const env = {
    port: Number(import.meta.env.VITE_PORT || 3001),
    api: {
        baseUrl: import.meta.env.VITE_API_URL || '',
    },
    google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    }
};
