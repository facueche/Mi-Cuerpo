import express from "express";

import healthRouter from "./core/health/infrastructure/routes";
import { corsMiddleware } from "./core/shared/infrastructure/middlewares/cors.middleware";
import authRouter from "./core/auth/infrastructure/routes";
import examinationRouter from "./core/examinations/infrastructure/routes";
import dashboardRouter from "./core/dashboard/infrastructure/routes";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT ?? 3000);

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/examinations", examinationRouter);
app.use("/api/health", healthRouter);

export default app;
