import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import wishRoutes from "./routes/wishes.js";
import photoRoutes from "./routes/photos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/wish", wishRoutes);
app.use("/api/upload", photoRoutes);
app.use("/api/uploads", photoRoutes);

// Serve static files in production
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// Catch-all for SPA routes (Pitfall 5 prevention)
app.get("*", (req, res) => {
  const indexPath = path.join(clientDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        error: "Client not built. Run 'cd client && npm run build' first.",
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
