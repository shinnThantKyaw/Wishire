import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "file:/mnt/d/Programming/VibeCode-Tour/birthday-wish-generator/server/dev.db",
  },
});
