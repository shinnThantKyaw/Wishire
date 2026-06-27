import express from "express";
import cors from "cors";
import wishRoutes from "./routes/wishes.js";
import photoRoutes from "./routes/photos.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allow requests from the frontend (set CLIENT_URL in Railway env)
const allowedOrigin = process.env.CLIENT_URL || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/wish", wishRoutes);
app.use("/api/upload", photoRoutes);
app.use("/api/uploads", photoRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Centralized error handler — must be LAST middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
