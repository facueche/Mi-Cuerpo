export type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    googleId: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
}

export type GoogleUser = {
    user: User;
    token: string;
}
