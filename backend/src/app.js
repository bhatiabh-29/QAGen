import express from "express";
import cors from "cors";
import projectRoutes from "./modules/projects/projectRoutes.js";
import sessionRoutes from "./modules/sessions/sessionRoutes.js";
import generationRoutes from "./modules/generation/generationRoutes.js";
import logRoutes from "./modules/logs/logRoutes.js";

export function createApp() {
    const app = express();

    app.use(
        cors({
            origin: process.env.FRONTEND_ORIGIN
                ? process.env.FRONTEND_ORIGIN.split(",")
                : true,
        })
    );

    app.use(express.json({ limit: "30mb" }));

    app.get("/api/health", (_req, res) => {
        res.json({ ok: true });
    });

    app.use("/api/projects", projectRoutes);
    app.use("/api/sessions", sessionRoutes);
    app.use("/api", generationRoutes);
    app.use("/api/logs", logRoutes);

    return app;
}