import { Request, Response } from "express";
import { prisma } from "../../../../config/prisma";
import RedisClient from "../../../../config/redis";

export default class CheckHealthController {
	static async handle(req: Request, res: Response) {
		const health = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			checks: {
				database: { status: "down" },
				cache: { status: "down" }
			}
		};

		try {
			await prisma.$queryRaw`SELECT 1`;
			health.checks.database.status = "up";

			const redisStatus = await RedisClient.getInstance().isUp();
			if (redisStatus) health.checks.cache.status = "up";

			const isHealthy = Object.values(health.checks).every(check => check.status === "up");

			if (!isHealthy) {
				health.status = "unhealthy";
				return res.status(503).send(health);
			}

			return res.status(200).send(health);

		} catch (error) {
			health.status = "unhealthy";
			return res.status(503).send(health);
		}
	}
}
