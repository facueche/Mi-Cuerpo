export type GoogleUser = {
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        googleId: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    };
    token: string;
}
