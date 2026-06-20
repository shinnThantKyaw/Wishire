import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalForPrisma = globalThis;

// Use the plain filename — busy_timeout is set via PRAGMA after connect,
// not as a query parameter (BetterSqlite3 treats ?busy_timeout as part of the filename).
const dbPath = path.resolve(__dirname, "../dev.db");

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Enable WAL mode and busy_timeout for concurrent read/write (Pitfall 1)
prisma.$queryRaw`PRAGMA journal_mode = WAL`.catch(() => {});
prisma.$queryRaw`PRAGMA busy_timeout = 10000`.catch(() => {});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
