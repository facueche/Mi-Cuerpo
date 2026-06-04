const STORAGE_KEYS = {
    TOKEN: "nerp_token",
    USER_INFO: "nerp_user_info",
} as const;

export const storageService = {
    getToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    setToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    removeToken: (): void => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    getUser: (): any | null => {
        const user = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (!user) return null;
        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    },

    setUser: (userData: any): void => {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    },

    clearSession: (): void => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
};