import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import config from "./config/index.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.swagger.enabled) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "TaskFlow API Docs",
    swaggerOptions: { persistAuthorization: true },
  }));
  app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
}

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TaskFlow Organization Management API",
    docs: config.swagger.enabled ? `/api/docs` : null,
    health: "/api/v1/health",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
