import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../../../config/env";

export default class AuthMiddleware {
    static async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "No token provided" });
            return;
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            res.status(401).json({ error: "Invalid token format" });
            return;
        }

        const token = parts[1];

        try {
            const decoded = jwt.verify(token, env.jwt.secret);
            const userInToken = decoded as {
                userId: string,
            };

            req.userId = userInToken.userId;
            next();
        } catch (error) {
            res.status(401).json({ error: "Invalid token" });
        }
    }
}
