import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback to dummy URL during build (prisma generate doesn't need a real DB).
    // At runtime, prisma migrate deploy and the app use the real DATABASE_URL.
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/dummy",
  },
});
