import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback to dummy URL during Docker build (prisma generate doesn't need a real DB).
    // In dev and production, DATABASE_URL is loaded from .env or environment variables.
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/dummy",
  },
});
