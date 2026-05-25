import express from "express";

import healthRouter from "./core/health/infrastructure/routes";
import { corsMiddleware } from "./core/shared/infrastructure/middlewares/cors.middleware";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT ?? 3000);

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRouter);

export default app;
