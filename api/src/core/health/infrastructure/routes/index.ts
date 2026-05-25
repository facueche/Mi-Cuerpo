import { Router } from "express";
import CheckHealthController from "../controllers/check-health.controller";

const healthRouter = Router();

healthRouter.get("/", CheckHealthController.handle);

export default healthRouter;
