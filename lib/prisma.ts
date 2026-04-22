import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {

  var __prisma__: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma__?: PrismaClient;
  __pgPool__?: Pool;
};

function createPrismaClient() {
  const pool =
    globalForPrisma.__pgPool__ ??
    new Pool({
      connectionString,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__pgPool__ = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.__prisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma__ = prisma;
}

export default prisma;
